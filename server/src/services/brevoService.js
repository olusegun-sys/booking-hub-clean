// FILE: server/src/services/brevoService.js
// Email service using Mailgun API (FREE, WORKS IMMEDIATELY)

const axios = require('axios');
const qs = require('qs');

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'sandbox.mailgun.org';
const FROM_EMAIL = process.env.FROM_EMAIL || 'postmaster@' + MAILGUN_DOMAIN;
const FROM_NAME = process.env.FROM_NAME || 'Booking Hub';

async function sendEmail({ to, subject, html }) {
  // Validate recipient
  if (!to || !to.includes('@')) {
    console.error('[Email] ❌ Invalid recipient:', to);
    return { success: false, error: 'Invalid recipient email address' };
  }

  // Validate subject
  if (!subject) {
    console.error('[Email] ❌ Subject is required');
    return { success: false, error: 'Subject is required' };
  }

  // Validate HTML content
  if (!html) {
    console.error('[Email] ❌ HTML content is required');
    return { success: false, error: 'HTML content is required' };
  }

  // Check if API key is set
  if (!MAILGUN_API_KEY) {
    console.error('[Email] ❌ MAILGUN_API_KEY is not set!');
    console.error('[Email] Please add MAILGUN_API_KEY to your Render environment variables.');
    return { success: false, error: 'Email service not configured' };
  }

  console.log('[Email] 📧 Sending via Mailgun:');
  console.log('[Email] - To:', to);
  console.log('[Email] - Subject:', subject);
  console.log('[Email] - Domain:', MAILGUN_DOMAIN);

  try {
    const response = await axios.post(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      qs.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: to,
        subject: subject,
        html: html
      }),
      {
        auth: {
          username: 'api',
          password: MAILGUN_API_KEY
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
    );

    console.log('[Email] ✅ Email sent successfully via Mailgun!');
    console.log('[Email] - Message ID:', response.data.id);
    console.log('[Email] - Recipient:', to);

    return {
      success: true,
      data: {
        messageId: response.data.id,
        status: response.status
      }
    };
  } catch (error) {
    console.error('[Email] ❌ Email failed:');
    if (error.response) {
      console.error('[Email] - Status:', error.response.status);
      console.error('[Email] - Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('[Email] - No response received:', error.message);
    } else {
      console.error('[Email] - Error:', error.message);
    }
    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
}

module.exports = { sendEmail };