// FILE: server/src/services/brevoService.js
// Brevo (Sendinblue) email service - No domain verification required!

// Try multiple ways to load nodemailer
let nodemailer = null;
let loadError = null;

// Try 1: Normal require
try {
  nodemailer = require('nodemailer');
  console.log('[Brevo] ✅ nodemailer loaded via normal require');
} catch (err) {
  loadError = err;
  console.log('[Brevo] ⚠️ Normal require failed, trying alternative paths...');
  
  // Try 2: Relative path from this file (going up to root)
  try {
    const path = require('path');
    // Go up from: server/src/services/brevoService.js
    // To: server/node_modules/nodemailer
    const nodemailerPath = path.join(__dirname, '..', '..', 'node_modules', 'nodemailer');
    nodemailer = require(nodemailerPath);
    console.log('[Brevo] ✅ nodemailer loaded via relative path:', nodemailerPath);
  } catch (err2) {
    try {
      // Try 3: Go up to root level
      const path = require('path');
      const nodemailerPath = path.join(__dirname, '..', '..', '..', 'node_modules', 'nodemailer');
      nodemailer = require(nodemailerPath);
      console.log('[Brevo] ✅ nodemailer loaded via root path:', nodemailerPath);
    } catch (err3) {
      console.error('[Brevo] ❌ nodemailer not available in any location');
      console.error('[Brevo] - Error 1:', err.message);
      console.error('[Brevo] - Error 2:', err2.message);
      console.error('[Brevo] - Error 3:', err3.message);
      console.error('[Brevo] Please ensure nodemailer is installed');
    }
  }
}

// Email configuration from environment variables
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'bookinghub@noreply.com';
const FROM_NAME = process.env.FROM_NAME || 'Booking Hub';

let transporter = null;

/**
 * Get or create the SMTP transporter
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!nodemailer) {
    console.error('[Brevo] ❌ nodemailer is not available - check installation');
    return null;
  }

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
 */
async function sendEmail({ to, subject, html, from }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.error('[Brevo] ❌ Transporter not available');
    return { success: false, error: 'Email service not configured' };
  }

  if (!to || !to.includes('@')) {
    console.error('[Brevo] ❌ Invalid recipient:', to);
    return { success: false, error: 'Invalid recipient email address' };
  }

  if (!subject) {
    console.error('[Brevo] ❌ Subject is required');
    return { success: false, error: 'Subject is required' };
  }

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