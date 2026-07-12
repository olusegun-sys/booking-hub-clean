// FILE: server/src/services/brevoService.js
// Brevo (Sendinblue) email service - No domain verification required!

const nodemailer = require('nodemailer');

// Email configuration from environment variables
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'bookinghub@noreply.com';
const FROM_NAME = process.env.FROM_NAME || 'Booking Hub';

let transporter = null;

/**
 * Get or create the SMTP transporter
 * Uses singleton pattern for efficiency
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Validate SMTP key
  if (!BREVO_SMTP_KEY) {
    console.error('[Brevo] ❌ BREVO_SMTP_KEY is not set!');
    console.error('[Brevo] Please add BREVO_SMTP_KEY to your Render environment variables.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: FROM_EMAIL,
        pass: BREVO_SMTP_KEY
      }
    });

    console.log('[Brevo] ✅ SMTP transporter initialized successfully');
    console.log('[Brevo] - From Email:', FROM_EMAIL);
    console.log('[Brevo] - From Name:', FROM_NAME);
    return transporter;
  } catch (error) {
    console.error('[Brevo] ❌ Failed to initialize transporter:', error.message);
    return null;
  }
}

/**
 * Send an email via Brevo
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
    console.error('[Brevo] ❌ Transporter not available');
    return { success: false, error: 'Email service not configured' };
  }

  // Validate recipient
  if (!to || !to.includes('@')) {
    console.error('[Brevo] ❌ Invalid recipient:', to);
    return { success: false, error: 'Invalid recipient email address' };
  }

  // Validate subject
  if (!subject) {
    console.error('[Brevo] ❌ Subject is required');
    return { success: false, error: 'Subject is required' };
  }

  // Validate HTML content
  if (!html) {
    console.error('[Brevo] ❌ HTML content is required');
    return { success: false, error: 'HTML content is required' };
  }

  const fromAddress = from || `${FROM_NAME} <${FROM_EMAIL}>`;

  console.log('[Brevo] 📧 Sending email:');
  console.log('[Brevo] - To:', to);
  console.log('[Brevo] - Subject:', subject);
  console.log('[Brevo] - From:', fromAddress);

  try {
    const result = await transporter.sendMail({
      from: fromAddress,
      to: to,
      subject: subject,
      html: html
    });

    console.log('[Brevo] ✅ Email sent successfully!');
    console.log('[Brevo] - Message ID:', result.messageId);
    console.log('[Brevo] - Response:', result.response);

    return {
      success: true,
      data: {
        messageId: result.messageId,
        response: result.response
      }
    };
  } catch (error) {
    console.error('[Brevo] ❌ Email failed:');
    console.error('[Brevo] - Error:', error.message);
    if (error.response) {
      console.error('[Brevo] - Response:', error.response);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { sendEmail };