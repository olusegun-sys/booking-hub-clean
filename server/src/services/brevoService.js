// FILE: server/src/services/brevoService.js
// Email service using Brevo HTTP API (works over HTTPS)
// No SMTP ports required - works on Render's free tier

const axios = require('axios');

// API key MUST be set in environment variables
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.GMAIL_USER || 'olusegun@luminara.io';
const FROM_NAME = process.env.FROM_NAME || 'Booking Hub';

/**
 * Send an email via Brevo HTTP API
 * Works over HTTPS (port 443) - allowed on Render's free tier
 */
async function sendEmail({ to, subject, html, from }) {
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
  if (!BREVO_API_KEY) {
    console.error('[Email] ❌ BREVO_API_KEY is not set!');
    console.error('[Email] Please add BREVO_API_KEY to your Render environment variables.');
    return { success: false, error: 'Email service not configured' };
  }

  const fromAddress = from || `${FROM_NAME} <${FROM_EMAIL}>`;

  console.log('[Email] 📧 Sending email via Brevo API (HTTPS):');
  console.log('[Email] - To:', to);
  console.log('[Email] - Subject:', subject);
  console.log('[Email] - From:', fromAddress);

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: FROM_NAME,
          email: FROM_EMAIL
        },
        to: [
          {
            email: to,
            name: to.split('@')[0]
          }
        ],
        subject: subject,
        htmlContent: html
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        timeout: 30000
      }
    );

    console.log('[Email] ✅ Email sent successfully via Brevo API!');
    console.log('[Email] - Message ID:', response.data.messageId);
    console.log('[Email] - Response Code:', response.status);
    console.log('[Email] - Recipient:', to);

    return {
      success: true,
      data: {
        messageId: response.data.messageId,
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