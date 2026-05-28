const axios = require('axios');

// Paystack secret key from environment variables
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Initialize a payment transaction with Paystack.
 * Returns a payment URL that the user will use to complete payment.
 */
async function initializePayment({ email, amount, bookingReference }) {
  // Validate inputs
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('A valid email address is required for payment.');
  }
  
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error('A valid amount greater than zero is required.');
  }
  
  if (!bookingReference) {
    throw new Error('A booking reference is required.');
  }

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: email,
        amount: amount, // Already in kobo
        reference: `BK-${bookingReference}-${Date.now()}`,
        metadata: {
          booking_reference: bookingReference
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      reference: response.data.data.reference,
      authorization_url: response.data.data.authorization_url
    };
  } catch (error) {
    console.error('Paystack initialization failed:', error.response?.data || error.message);
    throw new Error('Could not start payment. Please try again.');
  }
}

/**
 * Verify a payment with Paystack.
 * Checks if the payment was successful and returns the verification details.
 */
async function verifyPayment(reference) {
  // Validate input
  if (!reference || typeof reference !== 'string' || reference.trim() === '') {
    throw new Error('A valid payment reference is required.');
  }

  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { status, amount, metadata } = response.data.data;

    return {
      success: status === 'success',
      status: status,
      amount: amount, // Amount in kobo
      bookingReference: metadata?.booking_reference || null
    };
  } catch (error) {
    console.error('Paystack verification failed:', error.response?.data || error.message);
    throw new Error('Could not verify payment. Please try again.');
  }
}

module.exports = {
  initializePayment,
  verifyPayment
};