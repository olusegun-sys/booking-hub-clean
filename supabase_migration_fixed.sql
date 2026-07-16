-- Subscription Tables Migration - FIXED for Supabase
-- Run this in Supabase SQL Editor

-- 1. Add subscription columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_reference VARCHAR(255);

-- 2. Create subscription history table (NO users reference)
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  payment_reference VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  verified_by UUID,
  verified_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_subscription_history_business_id 
ON subscription_history(business_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_status 
ON subscription_history(status);

-- 4. Create function to get booking count for month
CREATE OR REPLACE FUNCTION get_monthly_booking_count(
  p_business_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  booking_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO booking_count
  FROM bookings
  WHERE business_id = p_business_id
    AND EXTRACT(YEAR FROM check_in) = p_year
    AND EXTRACT(MONTH FROM check_in) = p_month
    AND status != 'cancelled';
  
  RETURN booking_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to check if business can accept bookings
CREATE OR REPLACE FUNCTION can_accept_booking(
  p_business_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_plan VARCHAR(50);
  booking_limit INTEGER;
  current_usage INTEGER;
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  SELECT subscription_plan INTO current_plan
  FROM businesses
  WHERE id = p_business_id;
  
  CASE current_plan
    WHEN 'free' THEN booking_limit := 50;
    WHEN 'starter' THEN booking_limit := 100;
    WHEN 'pro' THEN booking_limit := 999999;
    ELSE booking_limit := 50;
  END CASE;
  
  current_month := EXTRACT(MONTH FROM NOW());
  current_year := EXTRACT(YEAR FROM NOW());
  
  SELECT get_monthly_booking_count(p_business_id, current_year, current_month)
  INTO current_usage;
  
  RETURN current_usage < booking_limit;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get subscription status
CREATE OR REPLACE FUNCTION get_subscription_status(
  p_business_id UUID
)
RETURNS TABLE(
  plan VARCHAR,
  limit_count INTEGER,
  used_count INTEGER,
  remaining_count INTEGER,
  percentage NUMERIC,
  can_accept BOOLEAN
) AS $$
DECLARE
  current_plan VARCHAR(50);
  booking_limit INTEGER;
  current_usage INTEGER;
  current_month INTEGER;
  current_year INTEGER;
  remaining_val INTEGER;
  percent_val NUMERIC;
BEGIN
  SELECT subscription_plan INTO current_plan
  FROM businesses
  WHERE id = p_business_id;
  
  CASE current_plan
    WHEN 'free' THEN booking_limit := 50;
    WHEN 'starter' THEN booking_limit := 100;
    WHEN 'pro' THEN booking_limit := 999999;
    ELSE booking_limit := 50;
  END CASE;
  
  current_month := EXTRACT(MONTH FROM NOW());
  current_year := EXTRACT(YEAR FROM NOW());
  
  SELECT get_monthly_booking_count(p_business_id, current_year, current_month)
  INTO current_usage;
  
  IF booking_limit = 999999 THEN
    remaining_val := NULL;
    percent_val := 0;
  ELSE
    remaining_val := GREATEST(0, booking_limit - current_usage);
    percent_val := ROUND((current_usage::NUMERIC / booking_limit::NUMERIC) * 100, 2);
  END IF;
  
  RETURN QUERY
  SELECT 
    current_plan,
    booking_limit,
    current_usage,
    remaining_val,
    percent_val,
    (current_usage < booking_limit) as can_accept;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to get pending upgrades for admin
CREATE OR REPLACE FUNCTION get_pending_upgrades()
RETURNS TABLE(
  id UUID,
  business_id UUID,
  business_name VARCHAR,
  business_email VARCHAR,
  plan VARCHAR,
  amount DECIMAL,
  payment_reference VARCHAR,
  created_at TIMESTAMP,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sh.id,
    sh.business_id,
    b.name::VARCHAR,
    b.email::VARCHAR,
    sh.plan::VARCHAR,
    sh.amount,
    sh.payment_reference,
    sh.created_at,
    sh.notes
  FROM subscription_history sh
  JOIN businesses b ON b.id = sh.business_id
  WHERE sh.status = 'pending'
  ORDER BY sh.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 8. Enable RLS on subscription_history
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
CREATE POLICY "Businesses can view own subscription history"
  ON subscription_history
  FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Businesses can create subscription requests"
  ON subscription_history
  FOR INSERT
  WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admin can view all subscription history"
  ON subscription_history
  FOR ALL
  USING (auth.role() = 'authenticated' AND auth.email() = 'admin@bookinghub.com');

-- 10. Grant permissions
GRANT ALL ON subscription_history TO authenticated;
GRANT ALL ON subscription_history TO service_role;
GRANT EXECUTE ON FUNCTION get_monthly_booking_count TO authenticated;
GRANT EXECUTE ON FUNCTION can_accept_booking TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_upgrades TO authenticated;

-- 11. Add comments
COMMENT ON TABLE subscription_history IS 'Tracks all subscription upgrade requests and history';
COMMENT ON COLUMN subscription_history.status IS 'pending, verified, active, failed';
COMMENT ON COLUMN subscription_history.payment_method IS 'bank_transfer, paystack (future)';
