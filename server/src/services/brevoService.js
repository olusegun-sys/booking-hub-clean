// FILE: server/src/services/brevoService.js
// Email service using Mailtrap (FREE, WORKS IMMEDIATELY)
// No domain verification required!
// No activation delays!
// Works from any location!

const nodemailer = require('nodemailer');

// Mailtrap credentials from environment variables
const MAILTRAP_USER = process.env.MAILTRAP_USER || '1d71c575d5caff';
const MAILTRAP_PASSWORD = process.env.MAILTRAP_PASSWORD || '40eb994918f29a';
const FROM_EMAIL = process.env.FROM_EMAIL || 'bookinghub@noreply.com';
const FROM_NAME = process.env.FROM_NAME || 'Booking Hub';

let transporter = null;

/**
 * Get or create the Mailtrap SMTP transporter
 */
function getTransporter() {
  if (transporter) return transporter;

  if (!MAILTRAP_USER || !MAILTRAP_PASSWORD) {
    console.error('[Email] ❌ Mailtrap credentials not set!');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: MAILTRAP_USER,
        pass: MAILTRAP_PASSWORD
      }
    });

    console.log('[Email] ✅ Mailtrap SMTP transporter initialized');
    console.log('[Email] - From Email:', FROM_EMAIL);
    console.log('[Email] - From Name:', FROM_NAME);
    return transporter;
  } catch (error) {
    console.error('[Email] ❌ Failed to initialize transporter:', error.message);
    return null;
  }
}

/**
 * Send an email via Mailtrap SMTP
 */
async function sendEmail({ to, subject, html }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.error('[Email] ❌ Transporter not available');
    return { success: false, error: 'Transporter not available' };
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

  console.log('[Email] 📧 Sending email via Mailtrap:');
  console.log('[Email] - To:', to);
  console.log('[Email] - Subject:', subject);
  console.log('[Email] - From:', `${FROM_NAME} <${FROM_EMAIL}>`);

  try {
    const result = await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: html
    });

    console.log('[Email] ✅ Email sent successfully via Mailtrap!');
    console.log('[Email] - Message ID:', result.messageId);
    console.log('[Email] - Recipient:', to);

    return {
      success: true,
      data: {
        messageId: result.messageId,
        response: result.response
      }
    };
  } catch (error) {
    console.error('[Email] ❌ Email failed:');
    console.error('[Email] - Error:', error.message);
    if (error.response) {
      console.error('[Email] - Response:', error.response);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { sendEmail };