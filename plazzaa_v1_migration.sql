-- ============================================================
-- Plazzaa V1 booking engine - database migration
-- ============================================================
-- Run this once in the Supabase SQL editor.
-- It is additive: existing tables, rows and the current hotel
-- flow keep working. New bookings use the V1 lifecycle:
--   payment_pending -> awaiting_validation -> confirmed
--                   \-> expired
--
-- Not included on purpose (out of scope for V1):
--   in-app card payment, staff accounts, wallet, KYC, points.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Services: what a customer can actually book
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text,
  price            numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  capacity         integer NOT NULL DEFAULT 1 CHECK (capacity > 0),
  slug             text NOT NULL,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);

CREATE INDEX IF NOT EXISTS services_business_idx ON public.services(business_id);

-- ------------------------------------------------------------
-- 2. Bank account: shown to the customer after they book.
--    V1 assumption - one account per business.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    uuid NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  bank_name      text NOT NULL,
  account_number text NOT NULL,
  account_name   text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. Bookings: add the V1 lifecycle columns.
--    All nullable, so the 128 existing rows are untouched.
-- ------------------------------------------------------------
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_id        uuid REFERENCES public.services(id),
  ADD COLUMN IF NOT EXISTS start_datetime    timestamptz,
  ADD COLUMN IF NOT EXISTS end_datetime      timestamptz,
  ADD COLUMN IF NOT EXISTS customer_whatsapp text,
  ADD COLUMN IF NOT EXISTS expires_at        timestamptz,
  ADD COLUMN IF NOT EXISTS payment_marked_at timestamptz,
  ADD COLUMN IF NOT EXISTS validated_at      timestamptz;

CREATE INDEX IF NOT EXISTS bookings_service_slot_idx  ON public.bookings(service_id, start_datetime);
CREATE INDEX IF NOT EXISTS bookings_expiry_idx        ON public.bookings(status, expires_at);
CREATE INDEX IF NOT EXISTS bookings_business_start_idx ON public.bookings(business_id, start_datetime);

-- Old status constraints (if any) would reject the new statuses.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname
      FROM pg_constraint
     WHERE conrelid = 'public.bookings'::regclass
       AND contype = 'c'
       AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check CHECK (status IN (
    -- existing hotel flow
    'pending', 'confirmed', 'cancelled',
    -- Plazzaa V1 flow
    'payment_pending', 'awaiting_validation', 'expired'
  ));

-- ------------------------------------------------------------
-- 4. Blocked slots: merchant blocks a date/time by hand.
--    Reuses the existing `availability` table (is_available = false).
-- ------------------------------------------------------------
ALTER TABLE public.availability
  ADD COLUMN IF NOT EXISTS service_id     uuid REFERENCES public.services(id),
  ADD COLUMN IF NOT EXISTS start_datetime timestamptz,
  ADD COLUMN IF NOT EXISTS end_datetime   timestamptz;

CREATE INDEX IF NOT EXISTS availability_business_window_idx
  ON public.availability(business_id, start_datetime, end_datetime);

-- ------------------------------------------------------------
-- 5. Release holds that were never paid for
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_stale_bookings()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE expired_count integer;
BEGIN
  UPDATE public.bookings
     SET status = 'expired'
   WHERE status = 'payment_pending'
     AND expires_at IS NOT NULL
     AND expires_at < now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- ------------------------------------------------------------
-- 6. Create a booking without overselling a slot.
--    The advisory lock makes two customers clicking the last
--    space at the same moment take turns, so capacity is never
--    exceeded. Raises: SERVICE_NOT_FOUND, SLOT_IN_PAST,
--    SLOT_BLOCKED, SLOT_FULL.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_service_booking(
  p_business_id      uuid,
  p_service_id       uuid,
  p_start            timestamptz,
  p_reference        text,
  p_customer_name    text,
  p_customer_email   text,
  p_customer_whatsapp text DEFAULT NULL,
  p_notes            text DEFAULT NULL,
  p_hold_minutes     integer DEFAULT 30
)
RETURNS public.bookings
LANGUAGE plpgsql
AS $$
DECLARE
  v_service public.services%ROWTYPE;
  v_end     timestamptz;
  v_taken   integer;
  v_booking public.bookings%ROWTYPE;
BEGIN
  SELECT * INTO v_service
    FROM public.services
   WHERE id = p_service_id
     AND business_id = p_business_id
     AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND';
  END IF;

  IF p_start < now() THEN
    RAISE EXCEPTION 'SLOT_IN_PAST';
  END IF;

  v_end := p_start + make_interval(mins => v_service.duration_minutes);

  -- Everyone competing for this exact slot queues here.
  PERFORM pg_advisory_xact_lock(hashtext(p_service_id::text || p_start::text));

  PERFORM public.expire_stale_bookings();

  IF EXISTS (
    SELECT 1
      FROM public.availability a
     WHERE a.business_id = p_business_id
       AND a.is_available = false
       AND (a.service_id IS NULL OR a.service_id = p_service_id)
       AND a.start_datetime IS NOT NULL
       AND a.end_datetime IS NOT NULL
       AND a.start_datetime < v_end
       AND a.end_datetime   > p_start
  ) THEN
    RAISE EXCEPTION 'SLOT_BLOCKED';
  END IF;

  SELECT count(*) INTO v_taken
    FROM public.bookings b
   WHERE b.service_id = p_service_id
     AND b.start_datetime = p_start
     AND b.status IN ('payment_pending', 'awaiting_validation', 'confirmed');

  IF v_taken >= v_service.capacity THEN
    RAISE EXCEPTION 'SLOT_FULL';
  END IF;

  INSERT INTO public.bookings (
    booking_reference, business_id, service_id,
    customer_name, customer_email, customer_phone, customer_whatsapp,
    start_datetime, end_datetime,
    check_in_date, check_out_date,
    total_amount, number_of_guests, special_requests,
    status, payment_status, payment_method,
    expires_at, created_at
  ) VALUES (
    p_reference, p_business_id, p_service_id,
    p_customer_name, p_customer_email, p_customer_whatsapp, p_customer_whatsapp,
    p_start, v_end,
    (p_start)::date, (v_end)::date,
    v_service.price, 1, p_notes,
    'payment_pending', 'pending', 'bank_transfer',
    now() + make_interval(mins => p_hold_minutes), now()
  )
  RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$;

-- ------------------------------------------------------------
-- 7. Validate a booking exactly once.
--    Returns the booking only if this call is the one that
--    confirmed it, so two taps cannot send two emails.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_booking(
  p_business_id uuid,
  p_reference   text
)
RETURNS public.bookings
LANGUAGE plpgsql
AS $$
DECLARE v_booking public.bookings%ROWTYPE;
BEGIN
  UPDATE public.bookings
     SET status       = 'confirmed',
         validated_at = now(),
         payment_status = 'paid',
         expires_at   = NULL
   WHERE business_id = p_business_id
     AND booking_reference = p_reference
     AND status IN ('payment_pending', 'awaiting_validation')
  RETURNING * INTO v_booking;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_VALIDATABLE';
  END IF;

  RETURN v_booking;
END;
$$;

-- ------------------------------------------------------------
-- 8. Lock the new tables down.
--    The API talks to Supabase with the service role key, which
--    bypasses row level security. Turning RLS on with no policies
--    means nothing else can read bank account numbers directly.
--    (Any future code using the anon key must go through the API.)
-- ------------------------------------------------------------
ALTER TABLE public.services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Tell PostgREST about the new tables and functions right away
NOTIFY pgrst, 'reload schema';

-- ------------------------------------------------------------
-- 9. Slug helper for services created before this migration
-- ------------------------------------------------------------
COMMENT ON TABLE public.services IS 'Plazzaa V1: bookable services. Slug is unique per business and forms plazzaa.com/{business-slug}/{service-slug}.';
COMMENT ON TABLE public.bank_accounts IS 'Plazzaa V1: merchant bank details shown to the customer after booking. Payment happens outside Plazzaa.';
