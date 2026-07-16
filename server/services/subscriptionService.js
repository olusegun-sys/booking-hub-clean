// server/services/subscriptionService.js
// ============================================
// PRODUCTION-READY: Subscription Management Service
// Handles all subscription logic, upgrades, and email notifications
// ============================================

const supabase = require('../config/supabase');
const { sendEmail } = require('./emailService');

class SubscriptionService {
  /**
   * ==========================================
   * GET SUBSCRIPTION STATUS
   * ==========================================
   * Returns current plan, usage, and limits for a business
   * 
   * @param {string} businessId - UUID of the business
   * @returns {Object} Subscription status object
   */
  static async getSubscriptionStatus(businessId) {
    try {
      // Validate business exists
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .select('subscription_plan, subscription_status, name, email')
        .eq('id', businessId)
        .single();

      if (bizError) {
        console.error('[SubscriptionService] Business lookup failed:', bizError);
        throw new Error('Business not found');
      }

      // Get current month's booking count
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      // Calculate first and last day of month
      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;

      // Count bookings for current month
      const { count, error: bookingError } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .in('status', ['pending', 'confirmed'])
        .gte('check_in', firstDay)
        .lte('check_in', lastDay);

      if (bookingError) {
        console.error('[SubscriptionService] Booking count failed:', bookingError);
        // Fallback: treat as 0 bookings if counting fails
      }

      // Define plan limits
      const limits = {
        free: 50,
        starter: 100,
        pro: Infinity
      };

      // Get current plan and calculate usage
      const plan = business.subscription_plan || 'free';
      const limit = limits[plan] || 50;
      const used = count || 0;
      
      // Calculate remaining and percentage
      const remaining = limit === Infinity ? 'Unlimited' : Math.max(0, limit - used);
      const percentage = limit === Infinity ? 0 : Math.min(100, Math.round((used / limit) * 100));

      // Return comprehensive status
      return {
        plan,
        limit: limit === Infinity ? 'Unlimited' : limit,
        used,
        remaining,
        percentage,
        canAcceptBookings: used < limit,
        isUnlimited: limit === Infinity,
        businessName: business.name,
        businessEmail: business.email,
        status: business.subscription_status || 'active'
      };
    } catch (error) {
      console.error('[SubscriptionService] Error getting subscription status:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * CHECK IF BUSINESS CAN ACCEPT BOOKINGS
   * ==========================================
   * Returns boolean indicating if business is under their limit
   * 
   * @param {string} businessId - UUID of the business
   * @returns {boolean} True if can accept bookings
   */
  static async canAcceptBooking(businessId) {
    try {
      const status = await this.getSubscriptionStatus(businessId);
      return status.canAcceptBookings;
    } catch (error) {
      console.error('[SubscriptionService] Error checking booking capacity:', error);
      // Fail closed - don't allow bookings if we can't check
      return false;
    }
  }

  /**
   * ==========================================
   * CREATE UPGRADE REQUEST
   * ==========================================
   * Creates a pending subscription upgrade request
   * Sends notifications to admin and business
   * 
   * @param {string} businessId - UUID of the business
   * @param {string} plan - 'starter' or 'pro'
   * @param {Object} paymentDetails - Payment information
   * @returns {Object} Created subscription record
   */
  static async createUpgradeRequest(businessId, plan, paymentDetails = {}) {
    try {
      // Validate plan
      const validPlans = ['starter', 'pro'];
      if (!validPlans.includes(plan)) {
        throw new Error('Invalid plan selected. Choose starter or pro');
      }

      // Pricing configuration
      const pricing = {
        starter: 30000,
        pro: 50000
      };

      const amount = pricing[plan];
      
      // Generate unique reference
      const reference = paymentDetails.reference || 
        `BIZ-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create subscription history record
      const { data: subscription, error: subError } = await supabase
        .from('subscription_history')
        .insert([{
          business_id: businessId,
          plan: plan,
          amount: amount,
          payment_method: 'bank_transfer',
          payment_reference: reference,
          status: 'pending',
          notes: paymentDetails.notes || 'Upgrade requested via dashboard'
        }])
        .select()
        .single();

      if (subError) {
        console.error('[SubscriptionService] Failed to create subscription record:', subError);
        throw new Error('Failed to create upgrade request');
      }

      // Get business details for notifications
      const business = await this.getBusinessDetails(businessId);

      // Send notifications (non-blocking - errors logged but don't fail the request)
      try {
        await this.notifyAdminOfUpgrade(business, subscription);
      } catch (emailError) {
        console.error('[SubscriptionService] Admin notification failed:', emailError);
        // Continue - admin can still see pending upgrade in dashboard
      }

      try {
        await this.sendUpgradeConfirmation(business, subscription);
      } catch (emailError) {
        console.error('[SubscriptionService] Business confirmation email failed:', emailError);
        // Continue - business will see confirmation in dashboard
      }

      return subscription;
    } catch (error) {
      console.error('[SubscriptionService] Error creating upgrade request:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * VERIFY AND ACTIVATE SUBSCRIPTION
   * ==========================================
   * Admin: Verifies payment and activates the subscription
   * Updates both subscription_history and businesses tables
   * 
   * @param {string} subscriptionId - UUID of the subscription history record
   * @param {string} adminId - UUID of the admin user
   * @returns {Object} Activation result
   */
  static async verifyAndActivate(subscriptionId, adminId) {
    try {
      // Get subscription request
      const { data: subscription, error: subError } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (subError) {
        console.error('[SubscriptionService] Subscription lookup failed:', subError);
        throw new Error('Subscription record not found');
      }

      // Validate status
      if (subscription.status !== 'pending') {
        throw new Error(`Subscription is not pending verification (current status: ${subscription.status})`);
      }

      // Calculate dates
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      // Update subscription history
      const { error: updateError } = await supabase
        .from('subscription_history')
        .update({
          status: 'verified',
          verified_by: adminId,
          verified_at: now.toISOString(),
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', subscriptionId);

      if (updateError) {
        console.error('[SubscriptionService] Failed to update subscription history:', updateError);
        throw new Error('Failed to update subscription record');
      }

      // Update business plan
      const { error: bizError } = await supabase
        .from('businesses')
        .update({
          subscription_plan: subscription.plan,
          subscription_status: 'active',
          subscription_start_date: now.toISOString(),
          subscription_end_date: endDate.toISOString(),
          subscription_reference: subscription.payment_reference
        })
        .eq('id', subscription.business_id);

      if (bizError) {
        console.error('[SubscriptionService] Failed to update business:', bizError);
        throw new Error('Failed to update business subscription');
      }

      // Send success email (non-blocking)
      try {
        const business = await this.getBusinessDetails(subscription.business_id);
        await this.sendUpgradeSuccessEmail(business, subscription);
      } catch (emailError) {
        console.error('[SubscriptionService] Upgrade success email failed:', emailError);
        // Continue - business will see update in dashboard
      }

      return {
        success: true,
        plan: subscription.plan,
        message: `Successfully upgraded to ${subscription.plan} plan`,
        activatedAt: now.toISOString(),
        validUntil: endDate.toISOString()
      };
    } catch (error) {
      console.error('[SubscriptionService] Error activating subscription:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * GET BUSINESS DETAILS
   * ==========================================
   * Helper to fetch business information
   * 
   * @param {string} businessId - UUID of the business
   * @returns {Object} Business details
   */
  static async getBusinessDetails(businessId) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) {
      console.error('[SubscriptionService] Failed to get business details:', error);
      throw new Error('Business not found');
    }
    return data;
  }

  /**
   * ==========================================
   * EMAIL: NOTIFY ADMIN OF UPGRADE
   * ==========================================
   * Sends email to admin about new upgrade request
   */
  static async notifyAdminOfUpgrade(business, subscription) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@bookinghub.com';
      
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .highlight { background: #eef2ff; padding: 10px; border-radius: 4px; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; 
                     text-decoration: none; border-radius: 4px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔄 New Subscription Upgrade Request</h2>
            </div>
            <div class="content">
              <h3>Business Details</h3>
              <div class="highlight">
                <p><strong>Business:</strong> ${business.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${business.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${business.phone || 'N/A'}</p>
              </div>
              
              <h3>Upgrade Details</h3>
              <div class="highlight">
                <p><strong>Plan:</strong> <span style="text-transform: capitalize;">${subscription.plan}</span></p>
                <p><strong>Amount:</strong> ₦${subscription.amount.toLocaleString()}</p>
                <p><strong>Reference:</strong> <code>${subscription.payment_reference}</code></p>
                <p><strong>Requested:</strong> ${new Date(subscription.created_at).toLocaleString()}</p>
              </div>
              
              <h3>Action Required</h3>
              <ol>
                <li>Verify payment in bank account</li>
                <li>Go to Admin Dashboard</li>
                <li>Find this business and click "Approve Upgrade"</li>
              </ol>
              
              <a href="https://booking-frontend-clean.onrender.com/admin" class="button">Go to Admin Dashboard</a>
              
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                This is an automated notification from Booking Hub.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: adminEmail,
        subject: `🔔 New Subscription Upgrade - ${business.name || 'Unknown Business'}`,
        html: emailContent
      });

      console.log(`[SubscriptionService] Admin notification sent to ${adminEmail}`);
    } catch (error) {
      console.error('[SubscriptionService] Failed to send admin notification:', error);
      // Don't throw - this shouldn't break the flow
    }
  }

  /**
   * ==========================================
   * EMAIL: SEND UPGRADE CONFIRMATION
   * ==========================================
   * Confirms upgrade request to business owner
   */
  static async sendUpgradeConfirmation(business, subscription) {
    try {
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .highlight { background: #eef2ff; padding: 10px; border-radius: 4px; }
            .bank-details { background: #f0fdf4; padding: 15px; border-radius: 4px; border-left: 4px solid #22c55e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Upgrade Request Received</h2>
            </div>
            <div class="content">
              <p>Dear ${business.name || 'Business Owner'},</p>
              <p>We have received your request to upgrade to the <strong>${subscription.plan}</strong> plan.</p>
              
              <h3>Payment Details</h3>
              <div class="bank-details">
                <p><strong>Amount:</strong> ₦${subscription.amount.toLocaleString()}</p>
                <p><strong>Bank:</strong> GTBank</p>
                <p><strong>Account Number:</strong> 0123456789</p>
                <p><strong>Account Name:</strong> Booking Hub Limited</p>
                <p><strong>Reference:</strong> <code>${subscription.payment_reference}</code></p>
              </div>
              
              <h3>Next Steps</h3>
              <ol>
                <li>Transfer exactly <strong>₦${subscription.amount.toLocaleString()}</strong> to the account above</li>
                <li>Use <strong>${subscription.payment_reference}</strong> as narration</li>
                <li>Click <strong>"I've Paid"</strong> in your dashboard</li>
                <li>We'll verify and activate within <strong>24 hours</strong></li>
              </ol>
              
              <p style="margin-top: 20px;">
                <a href="https://booking-frontend-clean.onrender.com/dashboard" style="color: #4F46E5; font-weight: bold;">
                  Go to Dashboard →
                </a>
              </p>
              
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                This is an automated notification from Booking Hub. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: business.email,
        subject: `📋 Upgrade Request Received - Booking Hub`,
        html: emailContent
      });

      console.log(`[SubscriptionService] Upgrade confirmation sent to ${business.email}`);
    } catch (error) {
      console.error('[SubscriptionService] Failed to send upgrade confirmation:', error);
      // Don't throw - this shouldn't break the flow
    }
  }

  /**
   * ==========================================
   * EMAIL: SEND UPGRADE SUCCESS
   * ==========================================
   * Notifies business that upgrade is active
   */
  static async sendUpgradeSuccessEmail(business, subscription) {
    try {
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #22c55e; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .highlight { background: #f0fdf4; padding: 15px; border-radius: 4px; border-left: 4px solid #22c55e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 Upgrade Successful!</h2>
            </div>
            <div class="content">
              <p>Dear ${business.name || 'Business Owner'},</p>
              <p>Your upgrade to the <strong>${subscription.plan}</strong> plan has been activated!</p>
              
              <h3>Your New Plan</h3>
              <div class="highlight">
                <p><strong>Plan:</strong> <span style="text-transform: capitalize;">${subscription.plan}</span></p>
                <p><strong>Bookings:</strong> ${subscription.plan === 'pro' ? '♾️ Unlimited' : '100 per month'}</p>
                <p><strong>Valid Until:</strong> ${new Date(subscription.end_date).toLocaleDateString()}</p>
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>✅ You can now accept more bookings</li>
                <li>📊 Check your updated dashboard</li>
                <li>📈 Continue growing your business</li>
              </ul>
              
              <p style="margin-top: 20px;">
                <a href="https://booking-frontend-clean.onrender.com/dashboard" style="display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                  Go to Dashboard →
                </a>
              </p>
              
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                This is an automated notification from Booking Hub.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: business.email,
        subject: `🎉 Upgrade Successful - Booking Hub`,
        html: emailContent
      });

      console.log(`[SubscriptionService] Upgrade success email sent to ${business.email}`);
    } catch (error) {
      console.error('[SubscriptionService] Failed to send upgrade success email:', error);
      // Don't throw - this shouldn't break the flow
    }
  }

  /**
   * ==========================================
   * GET UPGRADE HISTORY
   * ==========================================
   * Returns all subscription history for a business
   * 
   * @param {string} businessId - UUID of the business
   * @returns {Array} Array of subscription records
   */
  static async getUpgradeHistory(businessId) {
    try {
      const { data, error } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SubscriptionService] Failed to get upgrade history:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('[SubscriptionService] Error getting upgrade history:', error);
      return [];
    }
  }

  /**
   * ==========================================
   * GET PENDING UPGRADES (ADMIN)
   * ==========================================
   * Returns all pending upgrade requests
   * Uses database function for efficiency
   * 
   * @returns {Array} Array of pending upgrade records
   */
  static async getPendingUpgrades() {
    try {
      // Use the database function for better performance
      const { data, error } = await supabase
        .rpc('get_pending_upgrades');

      if (error) {
        console.error('[SubscriptionService] Failed to get pending upgrades:', error);
        // Fallback: Manual query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('subscription_history')
          .select(`
            *,
            businesses:business_id (
              name,
              email,
              phone
            )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: true });

        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('[SubscriptionService] Error getting pending upgrades:', error);
      return [];
    }
  }

  /**
   * ==========================================
   * REJECT UPGRADE REQUEST (ADMIN)
   * ==========================================
   * Rejects a pending upgrade request
   * 
   * @param {string} subscriptionId - UUID of the subscription history record
   * @param {string} adminId - UUID of the admin user
   * @param {string} reason - Rejection reason
   * @returns {Object} Rejection result
   */
  static async rejectUpgrade(subscriptionId, adminId, reason = 'Payment verification failed') {
    try {
      const { data: subscription, error: subError } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (subError) {
        throw new Error('Subscription record not found');
      }

      if (subscription.status !== 'pending') {
        throw new Error(`Subscription is not pending (current status: ${subscription.status})`);
      }

      const { error: updateError } = await supabase
        .from('subscription_history')
        .update({
          status: 'failed',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (updateError) {
        throw new Error('Failed to reject subscription');
      }

      // Notify business (non-blocking)
      try {
        const business = await this.getBusinessDetails(subscription.business_id);
        await this.sendRejectionEmail(business, subscription, reason);
      } catch (emailError) {
        console.error('[SubscriptionService] Rejection email failed:', emailError);
      }

      return {
        success: true,
        message: 'Upgrade request rejected',
        reason: reason
      };
    } catch (error) {
      console.error('[SubscriptionService] Error rejecting upgrade:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * EMAIL: SEND REJECTION NOTIFICATION
   * ==========================================
   * Notifies business that upgrade was rejected
   */
  static async sendRejectionEmail(business, subscription, reason) {
    try {
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⚠️ Upgrade Request Not Approved</h2>
            </div>
            <div class="content">
              <p>Dear ${business.name || 'Business Owner'},</p>
              <p>We were unable to verify your payment for the <strong>${subscription.plan}</strong> plan upgrade.</p>
              
              <h3>Reason</h3>
              <div style="background: #fef2f2; padding: 10px; border-radius: 4px; border-left: 4px solid #ef4444;">
                <p>${reason || 'Payment verification failed'}</p>
              </div>
              
              <h3>What to Do</h3>
              <ul>
                <li>Check that you sent the exact amount (₦${subscription.amount.toLocaleString()})</li>
                <li>Ensure you used the correct reference: <code>${subscription.payment_reference}</code></li>
                <li>Try again from your dashboard</li>
              </ul>
              
              <p style="margin-top: 20px;">
                <a href="https://booking-frontend-clean.onrender.com/dashboard" style="display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                  Try Again →
                </a>
              </p>
              
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                This is an automated notification from Booking Hub.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: business.email,
        subject: `⚠️ Upgrade Request Not Approved - Booking Hub`,
        html: emailContent
      });

      console.log(`[SubscriptionService] Rejection email sent to ${business.email}`);
    } catch (error) {
      console.error('[SubscriptionService] Failed to send rejection email:', error);
    }
  }

  /**
   * ==========================================
   * GET SUBSCRIPTION STATS (ADMIN)
   * ==========================================
   * Returns aggregate subscription statistics
   * 
   * @returns {Object} Subscription statistics
   */
  static async getSubscriptionStats() {
    try {
      // Get counts by plan
      const { data: planData, error: planError } = await supabase
        .from('businesses')
        .select('subscription_plan, count', { count: 'exact' })
        .group('subscription_plan');

      if (planError) {
        console.error('[SubscriptionService] Failed to get plan stats:', planError);
        return { total: 0, plans: { free: 0, starter: 0, pro: 0 } };
      }

      // Get pending upgrades count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('subscription_history')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) {
        console.error('[SubscriptionService] Failed to get pending count:', pendingError);
      }

      // Get total businesses
      const { count: totalCount, error: totalError } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true });

      if (totalError) {
        console.error('[SubscriptionService] Failed to get total count:', totalError);
      }

      // Build response
      const stats = {
        total: totalCount || 0,
        pending: pendingCount || 0,
        plans: {
          free: 0,
          starter: 0,
          pro: 0
        }
      };

      // Populate plan counts
      if (planData) {
        planData.forEach(item => {
          if (item.subscription_plan in stats.plans) {
            stats.plans[item.subscription_plan] = item.count;
          }
        });
      }

      return stats;
    } catch (error) {
      console.error('[SubscriptionService] Error getting subscription stats:', error);
      return { total: 0, pending: 0, plans: { free: 0, starter: 0, pro: 0 } };
    }
  }
}

module.exports = SubscriptionService;