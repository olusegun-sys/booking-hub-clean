// server/routes/subscriptions.js
const express = require('express');
const router = express.Router();
const SubscriptionService = require('../services/subscriptionService');
const { authenticate, isAdmin } = require('../middleware/auth');

/**
 * GET /api/subscriptions/status
 * Get current subscription status and usage
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const businessId = req.user.business_id || req.user.id;
    const status = await SubscriptionService.getSubscriptionStatus(businessId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status',
      error: error.message
    });
  }
});

/**
 * POST /api/subscriptions/upgrade
 * Request an upgrade
 */
router.post('/upgrade', authenticate, async (req, res) => {
  try {
    const { plan, paymentDetails } = req.body;
    const businessId = req.user.business_id || req.user.id;

    // Validate plan
    if (!plan || !['starter', 'pro'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected. Choose starter or pro'
      });
    }

    const subscription = await SubscriptionService.createUpgradeRequest(
      businessId,
      plan,
      paymentDetails || {}
    );

    res.json({
      success: true,
      message: 'Upgrade request created successfully',
      data: {
        subscriptionId: subscription.id,
        plan: subscription.plan,
        amount: subscription.amount,
        reference: subscription.payment_reference,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('Error creating upgrade request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create upgrade request',
      error: error.message
    });
  }
});

/**
 * POST /api/subscriptions/verify
 * Admin: Verify payment and activate subscription
 */
router.post('/verify', authenticate, isAdmin, async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const adminId = req.user.id;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
    }

    const result = await SubscriptionService.verifyAndActivate(
      subscriptionId,
      adminId
    );

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription',
      error: error.message
    });
  }
});

/**
 * GET /api/subscriptions/history
 * Get upgrade history
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const businessId = req.user.business_id || req.user.id;
    const history = await SubscriptionService.getUpgradeHistory(businessId);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching upgrade history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upgrade history',
      error: error.message
    });
  }
});

/**
 * GET /api/subscriptions/can-book
 * Check if business can accept new bookings
 */
router.get('/can-book', authenticate, async (req, res) => {
  try {
    const businessId = req.user.business_id || req.user.id;
    const canBook = await SubscriptionService.canAcceptBooking(businessId);

    res.json({
      success: true,
      data: {
        canBook,
        message: canBook ? 'Can accept bookings' : 'Booking limit reached'
      }
    });
  } catch (error) {
    console.error('Error checking booking capacity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check booking capacity',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/pending-upgrades
 * Admin: Get all pending upgrades
 */
router.get('/admin/pending-upgrades', authenticate, isAdmin, async (req, res) => {
  try {
    const pending = await SubscriptionService.getPendingUpgrades();
    
    // Format response
    const formatted = pending.map(item => ({
      id: item.id,
      business_id: item.business_id,
      business_name: item.businesses?.name || 'Unknown',
      business_email: item.businesses?.email || 'Unknown',
      plan: item.plan,
      amount: item.amount,
      payment_reference: item.payment_reference,
      created_at: item.created_at,
      notes: item.notes
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching pending upgrades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending upgrades',
      error: error.message
    });
  }
});

module.exports = router;