// FILE: server/src/services/brevoService.js
// Email service using Gmail SMTP (reliable on Render)
// No domain verification required!

const nodemailer = require('nodemailer');

// Email configuration from environment variables
// On Render, set:
// GMAIL_USER = olusegun@luminara.io
// GMAIL_APP_PASSWORD = aksa itye odzi dozu (your app password)
// FROM_NAME = Booking Hub (optional)
const GMAIL_USER = process.env.GMAIL_USER || process.env.FROM_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const FROM_NAME = process.env.FROM_NAME || 'Booking Hub';

let transporter = null;

/**
 * Get or create the Gmail SMTP transporter
 * Uses singleton pattern for efficiency
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Validate credentials
  if (!GMAIL_USER) {
    console.error('[Email] ❌ GMAIL_USER is not set!');
    console.error('[Email] Please add GMAIL_USER to your Render environment variables.');
    return null;
  }

  if (!GMAIL_APP_PASSWORD) {
    console.error('[Email] ❌ GMAIL_APP_PASSWORD is not set!');
    console.error('[Email] Please add GMAIL_APP_PASSWORD to your Render environment variables.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove any spaces
      }
    });

    console.log('[Email] ✅ Gmail SMTP transporter initialized successfully');
    console.log('[Email] - From Email:', GMAIL_USER);
    console.log('[Email] - From Name:', FROM_NAME);
    return transporter;
  } catch (error) {
    console.error('[Email] ❌ Failed to initialize transporter:', error.message);
    return null;
  }
}

/**
 * Send an email via Gmail SMTP
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.from - Optional custom from address
 * @returns {object} { success: boolean, data: result, error: error }
 */
async function sendEmail({ to, subject, html, from }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.error('[Email] ❌ Transporter not available');
    return { success: false, error: 'Email service not configured' };
  }

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

  // CRITICAL FIX: Use GMAIL_USER as the from address, not a custom domain
  // Gmail requires the from address to match the authenticated user
  const fromAddress = `${FROM_NAME} <${GMAIL_USER}>`;

  console.log('[Email] 📧 Sending email via Gmail:');
  console.log('[Email] - To:', to);
  console.log('[Email] - Subject:', subject);
  console.log('[Email] - From:', fromAddress);

  try {
    const result = await transporter.sendMail({
      from: fromAddress,
      to: to,
      subject: subject,
      html: html
    });

    console.log('[Email] ✅ Email sent successfully via Gmail!');
    console.log('[Email] - Message ID:', result.messageId);
    console.log('[Email] - Response:', result.response);
    console.log('[Email] - Accepted:', result.accepted);
    console.log('[Email] - Rejected:', result.rejected);

    return {
      success: true,
      data: {
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
        rejected: result.rejected
      }
    };
  } catch (error) {
    console.error('[Email] ❌ Email failed:');
    console.error('[Email] - Error:', error.message);
    console.error('[Email] - Code:', error.code);
    console.error('[Email] - Command:', error.command);
    if (error.response) {
      console.error('[Email] - Response:', error.response);
    }
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

module.exports = { sendEmail };