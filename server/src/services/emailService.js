// FILE: server/src/services/emailService.js
// COMPLETE FIX - Using Mailtrap for email delivery
// Works immediately, no domain verification required! ✅

// ============================================================
// EMAIL SERVICE - Mailtrap Integration
// ============================================================
// Mailtrap provides 500 free emails per day
// No domain verification required
// Works from any location

// Load Brevo/Mailtrap service with try/catch for safety
let brevoService = null;

try {
  brevoService = require('./brevoService');
  console.log('[Email] ✅ Brevo service loaded');
} catch (err) {
  console.error('[Email] ❌ Failed to load Brevo service:', err.message);
  console.error('[Email] Please ensure brevoService.js exists and nodemailer is installed');
}

// Environment detection for logging only
var IS_PRODUCTION = false;

// ============================================================
// ENVIRONMENT DETECTION - FOR LOGGING ONLY
// ============================================================
// Method 1: Check NODE_ENV
if (process.env.NODE_ENV === 'production') {
  IS_PRODUCTION = true;
}

// Method 2: Check Render specific variables
if (process.env.RENDER === 'true' || process.env.RENDER_GIT_COMMIT !== undefined) {
  IS_PRODUCTION = true;
}

// Method 3: Check if we're on a deployed URL
if (process.env.RENDER_EXTERNAL_URL || process.env.RENDER_EXTERNAL_HOSTNAME) {
  IS_PRODUCTION = true;
}

// Method 4: Force production if SUPABASE_URL contains 'render'
if (process.env.SUPABASE_URL && process.env.SUPABASE_URL.includes('render')) {
  IS_PRODUCTION = true;
}

// Method 5: Check if PORT is not default development port
if (process.env.PORT && process.env.PORT !== '5000' && process.env.PORT !== '3000') {
  IS_PRODUCTION = true;
}

// Method 6: Check for manual override
if (process.env.FORCE_PRODUCTION === 'true') {
  IS_PRODUCTION = true;
}

// Log environment
console.log('[Email] ========================================');
console.log('[Email] Environment detection results:');
console.log('[Email] - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('[Email] - RENDER:', process.env.RENDER || 'not set');
console.log('[Email] - PORT:', process.env.PORT || 'not set');
console.log('[Email] - IS_PRODUCTION:', IS_PRODUCTION);
console.log('[Email] - EMAIL PROVIDER: Mailtrap');
console.log('[Email] - Brevo Service Loaded:', !!brevoService);
console.log('[Email] ========================================');

// Email configuration
var VERIFIED_EMAIL = process.env.VERIFIED_EMAIL || 'olusegun@luminara.io';
var FROM_EMAIL = process.env.FROM_EMAIL || 'bookinghub@noreply.com';
var FROM_NAME = process.env.FROM_NAME || 'Booking Hub';

console.log('[Email] - From Email:', FROM_EMAIL);
console.log('[Email] - From Name:', FROM_NAME);
console.log('[Email] ========================================');

// ============================================================
// EMAIL TEMPLATES
// ============================================================

var templates = {
  hotel: function (booking, business) {
    return '<!DOCTYPE html><html><head><style>body{font-family:"Inter",Arial,sans-serif;line-height:1.6;color:#1e293b;margin:0;padding:0}.container{max-width:600px;margin:0 auto;background:white}.header{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:white;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:28px;font-weight:700}.header p{margin:10px 0 0;opacity:0.95;font-size:16px}.content{padding:30px;background:#f8fafc}.greeting{font-size:18px;margin-bottom:20px;color:#0f172a}.details-card{background:white;border-radius:12px;padding:24px;margin:24px 0;box-shadow:0 4px 6px -2px rgba(0,0,0,0.05)}.detail-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e2e8f0}.detail-row:last-child{border-bottom:none}.detail-label{color:#64748b;font-weight:500}.detail-value{color:#0f172a;font-weight:600}.badge{background:#10b981;color:white;padding:4px 12px;border-radius:30px;font-size:14px;font-weight:600;display:inline-block}.hotel-info{background:white;border-radius:12px;padding:20px;margin:24px 0}.footer{text-align:center;padding:30px;color:#64748b;font-size:14px;border-top:1px solid #e2e8f0}.button{display:inline-block;background:#4f46e5;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0}</style></head><body><div class="container"><div class="header"><h1>Booking Confirmed!</h1><p>Your stay at ' + business.name + ' is confirmed</p></div><div class="content"><p class="greeting">Dear ' + booking.customer_name + ',</p><p>Thank you for choosing Booking Hub. Your reservation has been confirmed.</p><div class="details-card"><div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0;color:#0f172a">Booking Details</h3><span class="badge">' + booking.booking_reference + '</span></div><div class="detail-row"><span class="detail-label">Check-in</span><span class="detail-value">' + new Date(booking.check_in_date).toLocaleDateString("en-NG",{weekday:"short",year:"numeric",month:"long",day:"numeric"}) + '</span></div><div class="detail-row"><span class="detail-label">Check-out</span><span class="detail-value">' + new Date(booking.check_out_date).toLocaleDateString("en-NG",{weekday:"short",year:"numeric",month:"long",day:"numeric"}) + '</span></div><div class="detail-row"><span class="detail-label">Guests</span><span class="detail-value">' + booking.number_of_guests + " " + (booking.number_of_guests === 1 ? "Guest" : "Guests") + '</span></div><div class="detail-row"><span class="detail-label">Total Amount</span><span class="detail-value" style="color:#10b981;font-size:20px">₦' + booking.total_amount.toLocaleString() + '</span></div></div><div class="hotel-info"><h3 style="margin-top:0;color:#0f172a">' + business.name + '</h3><p style="color:#64748b">' + (business.address || "") + ", " + business.city + ", " + business.state + '</p><p style="color:#64748b">' + (business.phone || "") + '</p></div><p>Need to modify your reservation? Contact the property directly or reply to this email.</p><a href="http://localhost:5173/book/' + business.slug + '" class="button">View Booking</a></div><div class="footer"><p>Booking Hub - Your Trusted Booking Platform</p><p style="margin-top:10px">Built for Nigerian businesses</p></div></div></body></html>';
  },

  sports: function (booking, business) {
    return '<!DOCTYPE html><html><head><style>body{font-family:"Inter",Arial,sans-serif;line-height:1.6;color:#1e293b;margin:0;padding:0}.container{max-width:600px;margin:0 auto;background:white}.header{background:linear-gradient(135deg,#10b981 0%,#34d399 100%);color:white;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:28px;font-weight:700}.content{padding:30px;background:#f8fafc}.details-card{background:white;border-radius:12px;padding:24px;margin:24px 0}.detail-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e2e8f0}.detail-label{color:#64748b;font-weight:500}.detail-value{color:#0f172a;font-weight:600}.badge{background:#10b981;color:white;padding:4px 12px;border-radius:30px;font-size:14px;font-weight:600}.footer{text-align:center;padding:30px;color:#64748b;font-size:14px;border-top:1px solid #e2e8f0}</style></head><body><div class="container"><div class="header"><h1>Court Booked!</h1><p>Your session at ' + business.name + ' is confirmed</p></div><div class="content"><p>Dear ' + booking.customer_name + ',</p><p>Your court booking has been confirmed.</p><div class="details-card"><div style="margin-bottom:20px"><span class="badge">' + booking.booking_reference + '</span></div><div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">' + (booking.bookingDetails && booking.bookingDetails.date ? booking.bookingDetails.date : booking.check_in_date) + '</span></div><div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">' + (booking.bookingDetails && booking.bookingDetails.timeSlot ? booking.bookingDetails.timeSlot : "Confirmed") + '</span></div><div class="detail-row"><span class="detail-label">Court</span><span class="detail-value">' + (booking.bookingDetails && booking.bookingDetails.court ? booking.bookingDetails.court : "Standard Court") + '</span></div><div class="detail-row"><span class="detail-label">Total</span><span class="detail-value" style="color:#10b981;font-size:20px">₦' + booking.total_amount.toLocaleString() + '</span></div></div><p>' + (business.address || "") + ", " + business.city + '</p><p>' + (business.phone || "") + '</p></div><div class="footer"><p>Booking Hub - Built for Nigerian businesses</p></div></div></body></html>';
  },

  event: function (booking, business) {
    return '<!DOCTYPE html><html><head><style>body{font-family:"Inter",Arial,sans-serif;line-height:1.6;color:#1e293b;margin:0;padding:0}.container{max-width:600px;margin:0 auto;background:white}.header{background:linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%);color:white;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:28px;font-weight:700}.content{padding:30px;background:#f8fafc}.details-card{background:white;border-radius:12px;padding:24px;margin:24px 0}.detail-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e2e8f0}.detail-label{color:#64748b;font-weight:500}.detail-value{color:#0f172a;font-weight:600}.badge{background:#f59e0b;color:white;padding:4px 12px;border-radius:30px;font-size:14px;font-weight:600}.footer{text-align:center;padding:30px;color:#64748b;font-size:14px;border-top:1px solid #e2e8f0}</style></head><body><div class="container"><div class="header"><h1>Event Booked!</h1><p>Your event at ' + business.name + ' is confirmed</p></div><div class="content"><p>Dear ' + booking.customer_name + ',</p><p>Your event booking has been confirmed.</p><div class="details-card"><div style="margin-bottom:20px"><span class="badge">' + booking.booking_reference + '</span></div><div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">' + booking.check_in_date + '</span></div><div class="detail-row"><span class="detail-label">Guests</span><span class="detail-value">' + booking.number_of_guests + '</span></div><div class="detail-row"><span class="detail-label">Total</span><span class="detail-value" style="color:#f59e0b;font-size:20px">₦' + booking.total_amount.toLocaleString() + '</span></div></div><p>' + (business.address || "") + ", " + business.city + '</p><p>' + (business.phone || "") + '</p></div><div class="footer"><p>Booking Hub - Built for Nigerian businesses</p></div></div></body></html>';
  }
};

var welcomeTemplate = function (business) {
  return '<!DOCTYPE html><html><head><style>body{font-family:"Inter",Arial,sans-serif;line-height:1.6;color:#1e293b;margin:0;padding:0}.container{max-width:600px;margin:0 auto;background:white}.header{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:white;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:26px;font-weight:700}.content{padding:30px;background:#f8fafc}.card{background:white;border-radius:12px;padding:24px;margin:24px 0;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.footer{text-align:center;padding:30px;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0}.badge{background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:30px;font-size:12px;font-weight:600;display:inline-block}.button{display:inline-block;background:#4f46e5;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;margin:20px 0}</style></head><body><div class="container"><div class="header"><h1>Welcome to Booking Hub!</h1><p style="margin:10px 0 0;opacity:0.9">Your booking page is being set up</p></div><div class="content"><p>Dear ' + business.name + ',</p><p>Thank you for joining Booking Hub! We are excited to help you manage your bookings, track revenue, and grow your business.</p><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">Your Account Status</h3><p style="margin:0"><span class="badge">Pending Approval</span></p><p style="color:#64748b;font-size:14px;margin-top:12px">Our team is reviewing your business. You will receive another email once approved - usually within 24 hours.</p></div><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">What You Get</h3><p style="color:#334155;font-size:14px;margin:0 0 8px">&#10003; Your own branded booking page</p><p style="color:#334155;font-size:14px;margin:0 0 8px">&#10003; Accept payments via Paystack</p><p style="color:#334155;font-size:14px;margin:0 0 8px">&#10003; Track revenue and manage bookings</p><p style="color:#334155;font-size:14px;margin:0">&#10003; First 50 bookings free</p></div><p>Once approved, log in anytime to manage your dashboard.</p><p style="margin-top:24px">Welcome aboard,<br><strong>The Booking Hub Team</strong></p></div><div class="footer"><p>Booking Hub - Built for Nigerian businesses</p></div></div></body></html>';
};

var approvalTemplate = function (business) {
  return '<!DOCTYPE html><html><head><style>body{font-family:"Inter",Arial,sans-serif;line-height:1.6;color:#1e293b;margin:0;padding:0}.container{max-width:600px;margin:0 auto;background:white}.header{background:linear-gradient(135deg,#10b981 0%,#34d399 100%);color:white;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:26px;font-weight:700}.content{padding:30px;background:#f8fafc}.card{background:white;border-radius:12px;padding:24px;margin:24px 0;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.button{display:inline-block;background:#4f46e5;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;margin:20px 0}.footer{text-align:center;padding:30px;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0}.badge{background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:30px;font-size:12px;font-weight:600;display:inline-block}</style></head><body><div class="container"><div class="header"><h1>You are Approved!</h1><p style="margin:10px 0 0;opacity:0.9">Your booking page is now live</p></div><div class="content"><p>Dear ' + business.name + ',</p><p>Great news! Your business has been approved. Your booking page is now live and ready to accept reservations.</p><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">Your Status</h3><p style="margin:0"><span class="badge">Approved</span></p></div><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">Your Live Booking Link</h3><p style="font-family:monospace;font-size:16px;color:#4f46e5;font-weight:700;margin:0">http://localhost:5173/book/' + business.slug + '</p><p style="color:#64748b;font-size:14px;margin-top:8px">Share this link with your customers. They can book directly - no middleman.</p></div><div class="card"><h3 style="margin:0 0 12px;color:#0f172a">Next Steps</h3><ol style="color:#334155;font-size:14px;padding-left:20px;margin:0"><li style="margin-bottom:8px"><strong>Log in</strong> at Booking Hub with your email</li><li style="margin-bottom:8px"><strong>Add your rooms</strong> and services</li><li style="margin-bottom:8px"><strong>Set your operating hours</strong></li><li><strong>Share your link</strong> and start earning</li></ol></div><a href="http://localhost:5173" class="button">Go to Your Dashboard</a><p style="margin-top:24px">Welcome to the family,<br><strong>The Booking Hub Team</strong></p></div><div class="footer"><p>Booking Hub - First 50 bookings free</p></div></div></body></html>';
};

// ============================================================
// CORE EMAIL SENDING FUNCTION - Using Mailtrap
// ============================================================

async function sendEmail(options) {
  var to = options.to;
  var subject = options.subject;
  var html = options.html;
  var from = options.from || FROM_EMAIL;

  console.log('[Email] 🔍 ========== DEBUG EMAIL FLOW ==========');
  console.log('[Email] 🔍 sendEmail called with:');
  console.log('[Email] 🔍 - to:', to);
  console.log('[Email] 🔍 - subject:', subject);
  console.log('[Email] 🔍 - IS_PRODUCTION:', IS_PRODUCTION);
  console.log('[Email] 🔍 - Brevo Service:', !!brevoService);
  console.log('[Email] 🔍 ========================================');

  // Validate inputs
  if (!to || !to.includes('@')) {
    console.error('[Email] ❌ Invalid recipient:', to);
    return { success: false, error: 'Invalid recipient email address' };
  }

  if (!subject) {
    console.error('[Email] ❌ Subject is required');
    return { success: false, error: 'Subject is required' };
  }

  if (!html) {
    console.error('[Email] ❌ HTML content is required');
    return { success: false, error: 'HTML content is required' };
  }

  // Check if Brevo service is available
  if (!brevoService) {
    console.error('[Email] ❌ Brevo service not available - cannot send email');
    return { success: false, error: 'Email service not available' };
  }

  // Send via Mailtrap
  console.log('[Email] 🔍 Attempting to send via Mailtrap...');
  console.log('[Email] 🔍 - Recipient:', to);
  console.log('[Email] 🔍 - Subject:', subject);

  const result = await brevoService.sendEmail({
    to: to,
    subject: subject,
    html: html,
    from: from
  });

  // Log the detailed result
  console.log('[Email] 🔍 Result received from Mailtrap:');
  console.log('[Email] 🔍 - Success:', result.success);
  console.log('[Email] 🔍 - Error:', result.error || 'None');
  if (result.data) {
    console.log('[Email] 🔍 - Message ID:', result.data.messageId);
  }

  if (result.success) {
    console.log('[Email] ✅ Sent via Mailtrap successfully!');
    console.log('[Email] ✅ - Message ID:', result.data?.messageId);
    console.log('[Email] ✅ - Recipient:', to);
    return result;
  } else {
    console.error('[Email] ❌ Mailtrap failed:', result.error);
    return result;
  }
}

// ============================================================
// EMAIL FUNCTIONS - ENHANCED with Business Owner Notification
// ============================================================

/**
 * sendBookingConfirmation - Sends booking confirmation to customer AND business owner
 * With 10-second delay to avoid Mailtrap rate limit
 */
async function sendBookingConfirmation(booking, business) {
  console.log('[Email] 🔍 ========== SEND BOOKING CONFIRMATION ==========');
  console.log('[Email] 🔍 Booking:', booking.booking_reference);
  console.log('[Email] 🔍 - customer_email:', booking.customer_email);
  console.log('[Email] 🔍 - customer_name:', booking.customer_name);
  console.log('[Email] 🔍 Business:', business ? business.name : 'MISSING');
  console.log('[Email] 🔍 - business.email:', business ? business.email : 'MISSING');
  console.log('[Email] 🔍 - business.business_type:', business ? business.business_type : 'MISSING');
  console.log('[Email] 🔍 ========================================');

  // Step 1: Select the right template
  var template, subject;
  
  if (booking.room_id || business.business_type === 'hotel') {
    template = templates.hotel;
    subject = 'Booking Confirmed - ' + booking.booking_reference;
  } else if (business.business_type === 'sports') {
    template = templates.sports;
    subject = 'Court Booking Confirmed - ' + booking.booking_reference;
  } else if (business.business_type === 'event') {
    template = templates.event;
    subject = 'Event Booking Confirmed - ' + booking.booking_reference;
  } else {
    template = templates.hotel;
    subject = 'Booking Confirmed - ' + booking.booking_reference;
  }

  var htmlContent = template(booking, business);
  var results = {};

  // Step 2: Send to the customer
  console.log('[Email] 🔍 Step 2: Sending to CUSTOMER:', booking.customer_email);
  
  var customerResult = await sendEmail({
    to: booking.customer_email,
    subject: subject,
    html: htmlContent
  });
  
  results.customer = customerResult;
  console.log('[Email] 🔍 Customer email result:', customerResult.success ? '✅ SUCCESS' : '❌ FAILED');

  // ✅ FIX: Add 10-second delay to avoid Mailtrap rate limit
  // Mailtrap free tier has a strict "too many emails per second" limit
  // 10 seconds ensures the rate limit resets completely
  console.log('[Email] 🔍 Waiting 10 seconds before sending business owner email...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Step 3: Send to the business owner
  if (business && business.email && typeof business.email === 'string' && business.email.includes('@')) {
    if (business.email !== booking.customer_email) {
      var ownerSubject = '📋 New Booking: ' + booking.booking_reference + ' - ' + booking.customer_name;
      
      console.log('[Email] 🔍 Step 3: Sending to BUSINESS OWNER:', business.email);
      
      var ownerResult = await sendEmail({
        to: business.email,
        subject: ownerSubject,
        html: htmlContent
      });
      
      results.owner = ownerResult;
      console.log('[Email] 🔍 Business owner email result:', ownerResult.success ? '✅ SUCCESS' : '❌ FAILED');
    } else {
      console.log('[Email] 🔍 Customer is also the business owner - skipping duplicate');
    }
  } else {
    console.log('[Email] 🔍 No valid business email found - skipping business owner notification');
  }

  console.log('[Email] 🔍 ========== BOOKING CONFIRMATION COMPLETE ==========');
  return results;
}

async function sendReminderEmail(booking, business) {
  return sendEmail({
    to: booking.customer_email,
    subject: 'Reminder: Your Booking Tomorrow - ' + booking.booking_reference,
    html: '<div style="font-family:Inter,Arial;max-width:600px;margin:0 auto"><div style="background:#4f46e5;color:white;padding:30px;text-align:center"><h1>Reminder: Your Booking Tomorrow!</h1></div><div style="padding:30px;background:#f8fafc"><p>Dear ' + booking.customer_name + ',</p><p>This is a friendly reminder about your booking tomorrow at ' + business.name + '.</p><p style="background:#eef2ff;padding:12px;border-radius:8px;font-family:monospace">' + booking.booking_reference + '</p><p>' + (business.address || '') + ', ' + business.city + '</p><p>' + (business.phone || '') + '</p></div></div>'
  });
}

async function sendWelcomeEmail(business) {
  console.log('[Email] 🔍 Sending WELCOME email to:', business.email);
  return sendEmail({ to: business.email, subject: 'Welcome to Booking Hub, ' + business.name + '!', html: welcomeTemplate(business) });
}

async function sendApprovalEmail(business) {
  console.log('[Email] 🔍 Sending APPROVAL email to:', business.email);
  return sendEmail({ to: business.email, subject: 'You are Approved! Your Booking Page is Live', html: approvalTemplate(business) });
}

module.exports = { sendEmail, sendBookingConfirmation, sendReminderEmail, sendWelcomeEmail, sendApprovalEmail };