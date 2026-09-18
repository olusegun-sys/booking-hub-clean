// FILE: server/src/services/emailService.js
// REBRANDED: Booking Hub → Plazzaa (18 Sept 2026)
// SMART: Business-type-aware email labels — same pattern as UnifiedBookingPage.jsx
// SECURITY: Secrets now read from env vars (RESEND_API_KEY, FROM_EMAIL, FROM_NAME)
// HARDENED (19 Sept 2026): Env vars trimmed and validated so malformed `from` headers can't reach Resend
// FIXED: Sports/event/restaurant/spa emails no longer show "Check-in/Check-out"

const axios = require('axios');

// ============================================================
// CONFIGURATION — READ FROM ENV VARS (with sanitization)
// ============================================================
// WHY: Env vars pasted into dashboards often carry invisible trailing
// whitespace or stray quote characters. Trim them at load so the
// `from` header is always clean. This prevents the 422 "invalid from
// field" error from Resend when the value is slightly malformed.
function cleanEnv(value, fallback) {
  if (value === undefined || value === null) return fallback;
  const trimmed = String(value).trim().replace(/^["']|["']$/g, '');
  return trimmed.length > 0 ? trimmed : fallback;
}

const RESEND_API_KEY = cleanEnv(process.env.RESEND_API_KEY, '');
const RAW_FROM_EMAIL = cleanEnv(process.env.FROM_EMAIL, 'onboarding@resend.dev');
const RAW_FROM_NAME = cleanEnv(process.env.FROM_NAME, 'Plazzaa');
const APP_URL = cleanEnv(process.env.APP_URL, 'https://myplazzaa.com');

// WHY: FROM_NAME must not contain angle brackets or quotes — they break
// the "Name <email>" format that Resend expects.
const FROM_NAME = RAW_FROM_NAME.replace(/[<>"]/g, '').trim() || 'Plazzaa';

// WHY: A valid email must have non-space characters, an @, a dot in the
// domain, and no whitespace anywhere. If it fails this check we fall
// back to onboarding@resend.dev so at least something sends.
function isValidFromEmail(email) {
  return typeof email === 'string'
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const FROM_EMAIL = isValidFromEmail(RAW_FROM_EMAIL) ? RAW_FROM_EMAIL : 'onboarding@resend.dev';

// WHY: Log the raw and sanitized values so misconfiguration is visible
// in the logs the moment the server starts. If FROM_EMAIL shows as
// invalid here, fix it in Render → booking-backend-clean → Environment.
console.log('[Email] ========================================');
console.log('[Email] Configuration:');
console.log('[Email] - RESEND_API_KEY:', RESEND_API_KEY ? 'set (' + RESEND_API_KEY.substring(0, 8) + '...)' : '❌ MISSING');
console.log('[Email] - FROM_NAME (raw):', JSON.stringify(RAW_FROM_NAME));
console.log('[Email] - FROM_NAME (safe):', JSON.stringify(FROM_NAME));
console.log('[Email] - FROM_EMAIL (raw):', JSON.stringify(RAW_FROM_EMAIL));
console.log('[Email] - FROM_EMAIL (valid):', isValidFromEmail(RAW_FROM_EMAIL) ? 'yes' : 'no');
console.log('[Email] - From header will be:', FROM_NAME + ' <' + FROM_EMAIL + '>');
console.log('[Email] - APP_URL:', APP_URL);
console.log('[Email] ========================================');

if (!RESEND_API_KEY) {
  console.error('[Email] ❌ RESEND_API_KEY is not set — emails will fail');
}
if (!isValidFromEmail(RAW_FROM_EMAIL)) {
  console.error('[Email] ⚠️  FROM_EMAIL is not a valid email — falling back to onboarding@resend.dev');
  console.error('[Email] ⚠️  Fix this in Render → booking-backend-clean → Environment → FROM_EMAIL');
}

// ============================================================
// ENVIRONMENT DETECTION
// ============================================================
var IS_PRODUCTION = false;
if (process.env.NODE_ENV === 'production') IS_PRODUCTION = true;
if (process.env.RENDER === 'true' || process.env.RENDER_GIT_COMMIT !== undefined) IS_PRODUCTION = true;

// ============================================================
// CORE EMAIL SENDING FUNCTION
// ============================================================
async function sendEmail({ to, subject, html }) {
  // WHY: Validate inputs early so we fail fast with a clear error
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
  if (!RESEND_API_KEY) {
    console.error('[Email] ❌ RESEND_API_KEY missing — cannot send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject: subject,
        html: html
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`
        },
        timeout: 30000
      }
    );
    console.log('[Email] ✅ Sent to', to, '— ID:', response.data.id);
    return { success: true, data: { messageId: response.data.id } };
  } catch (error) {
    console.error('[Email] ❌ Failed:', error.message);
    if (error.response) {
      console.error('[Email] - Status:', error.response.status);
      console.error('[Email] - Data:', JSON.stringify(error.response.data));
    }
    return { success: false, error: error.message, status: error.response?.status };
  }
}

// ============================================================
// BUSINESS-TYPE-AWARE EMAIL LABELS
// ============================================================
// WHY: Same pattern as UnifiedBookingPage.jsx. One source of truth
// for every piece of text that changes per business type.
// Every business type your signup supports must have an entry here.
// Fallback (_default) catches anything unrecognized.

var BOOKING_EMAIL_LABELS = {
  // ============ STAYS ============
  hotel: {
    headerTitle: 'Booking Confirmed!',
    headerSubtitle: 'Your stay at {business} is confirmed',
    dateLabel: 'Check-in',
    dateValueField: 'check_in_date',
    secondaryDateLabel: 'Check-out',
    secondaryDateValueField: 'check_out_date',
    guestsLabel: 'Guests',
    guestsField: 'number_of_guests',
    subjectPrefix: 'Booking Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },
  apartment: {
    headerTitle: 'Booking Confirmed!',
    headerSubtitle: 'Your stay at {business} is confirmed',
    dateLabel: 'Check-in',
    dateValueField: 'check_in_date',
    secondaryDateLabel: 'Check-out',
    secondaryDateValueField: 'check_out_date',
    guestsLabel: 'Guests',
    guestsField: 'number_of_guests',
    subjectPrefix: 'Booking Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },
  event_hall: {
    headerTitle: 'Event Confirmed!',
    headerSubtitle: 'Your event at {business} is confirmed',
    dateLabel: 'Event Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: 'Guests',
    guestsField: 'number_of_guests',
    subjectPrefix: 'Event Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },
  // Legacy alias
  event: {
    headerTitle: 'Event Confirmed!',
    headerSubtitle: 'Your event at {business} is confirmed',
    dateLabel: 'Event Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: 'Guests',
    guestsField: 'number_of_guests',
    subjectPrefix: 'Event Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },

  // ============ FOOD ============
  restaurant: {
    headerTitle: 'Order Confirmed!',
    headerSubtitle: 'Your order from {business} is confirmed',
    dateLabel: 'Pickup Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: null,
    guestsField: null,
    subjectPrefix: 'Order Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },
  diner: {
    headerTitle: 'Order Confirmed!',
    headerSubtitle: 'Your order from {business} is confirmed',
    dateLabel: 'Pickup Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: null,
    guestsField: null,
    subjectPrefix: 'Order Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },
  cafe: {
    headerTitle: 'Order Confirmed!',
    headerSubtitle: 'Your order from {business} is confirmed',
    dateLabel: 'Pickup Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: null,
    guestsField: null,
    subjectPrefix: 'Order Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },
  other_food: {
    headerTitle: 'Order Confirmed!',
    headerSubtitle: 'Your order from {business} is confirmed',
    dateLabel: 'Pickup Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: null,
    guestsField: null,
    subjectPrefix: 'Order Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },

  // ============ OTHERS ============
  sports: {
    headerTitle: 'Court Booked!',
    headerSubtitle: 'Your session at {business} is confirmed',
    dateLabel: 'Booking Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: 'Players',
    guestsField: 'number_of_guests',
    subjectPrefix: 'Court Booking Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },
  spa: {
    headerTitle: 'Appointment Confirmed!',
    headerSubtitle: 'Your appointment at {business} is confirmed',
    dateLabel: 'Appointment Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: null,
    guestsField: null,
    subjectPrefix: 'Appointment Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },
  beauty_salon: {
    headerTitle: 'Appointment Confirmed!',
    headerSubtitle: 'Your appointment at {business} is confirmed',
    dateLabel: 'Appointment Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: null,
    guestsField: null,
    subjectPrefix: 'Appointment Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },
  activity_place: {
    headerTitle: 'Booking Confirmed!',
    headerSubtitle: 'Your booking at {business} is confirmed',
    dateLabel: 'Booking Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: 'Guests',
    guestsField: 'number_of_guests',
    subjectPrefix: 'Booking Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  },

  // ============ FALLBACK ============
  // WHY: Catches any business type we haven't mapped yet.
  // Better to send a generic-but-correct email than crash.
  _default: {
    headerTitle: 'Booking Confirmed!',
    headerSubtitle: 'Your booking at {business} is confirmed',
    dateLabel: 'Date',
    dateValueField: 'check_in_date',
    secondaryDateLabel: null,
    secondaryDateValueField: null,
    guestsLabel: null,
    guestsField: null,
    subjectPrefix: 'Booking Confirmed',
    footerTagline: 'Plazzaa — Built for Nigerian businesses'
  }
};

// WHY: Single lookup function. No if/else chain. No order bugs.
function getBookingEmailLabels(businessType) {
  return BOOKING_EMAIL_LABELS[businessType] || BOOKING_EMAIL_LABELS._default;
}

// ============================================================
// HELPERS
// ============================================================
function formatNaira(amount) {
  // WHY: Guard against undefined/null so emails never show "₦NaN"
  if (amount === null || amount === undefined || isNaN(amount)) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG');
}

function formatDate(dateValue) {
  // WHY: Handle both ISO strings and Date objects safely
  if (!dateValue) return 'To be confirmed';
  try {
    return new Date(dateValue).toLocaleDateString('en-NG', {
      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return String(dateValue);
  }
}

// ============================================================
// GENERIC BOOKING EMAIL TEMPLATE
// ============================================================
// WHY: One template, driven by labels. Same structure for every
// business type — only the words change. Less code, less to break.
function buildBookingEmail(booking, business, labels) {
  // WHY: Safe access — the shape of `booking` is always the DB row
  var customerName = booking.customer_name || 'Customer';
  var businessName = business.name || 'the business';
  var reference = booking.booking_reference || 'N/A';
  var totalAmount = booking.total_amount;

  // WHY: Resolve templated string like "Your stay at {business} is confirmed"
  var subtitle = (labels.headerSubtitle || '').replace('{business}', businessName);

  // WHY: Build the primary date row (Check-in / Event Date / Pickup Date / etc.)
  var primaryDateValue = booking[labels.dateValueField];
  var primaryDateRow = primaryDateValue
    ? '<div class="detail-row"><span class="detail-label">' + labels.dateLabel + '</span><span class="detail-value">' + formatDate(primaryDateValue) + '</span></div>'
    : '';

  // WHY: Secondary date row only appears for stays (check-out)
  var secondaryDateValue = labels.secondaryDateValueField ? booking[labels.secondaryDateValueField] : null;
  var secondaryDateRow = (labels.secondaryDateLabel && secondaryDateValue)
    ? '<div class="detail-row"><span class="detail-label">' + labels.secondaryDateLabel + '</span><span class="detail-value">' + formatDate(secondaryDateValue) + '</span></div>'
    : '';

  // WHY: Guests row only appears when the business type uses it
  var guestsValue = labels.guestsField ? booking[labels.guestsField] : null;
  var guestsRow = (labels.guestsLabel && guestsValue)
    ? '<div class="detail-row"><span class="detail-label">' + labels.guestsLabel + '</span><span class="detail-value">' + guestsValue + '</span></div>'
    : '';

  // WHY: business.address may be null — fall back gracefully
  var businessLocation = (business.address || '') + (business.city ? ', ' + business.city : '') + (business.state ? ', ' + business.state : '');

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' +
    'body{font-family:"Inter",Arial,sans-serif;line-height:1.6;color:#1e293b;margin:0;padding:0;background:#f8fafc}' +
    '.container{max-width:600px;margin:0 auto;background:white}' +
    '.header{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:white;padding:40px 30px;text-align:center}' +
    '.header h1{margin:0;font-size:28px;font-weight:700}' +
    '.header p{margin:10px 0 0;opacity:0.95;font-size:16px}' +
    '.content{padding:30px;background:#f8fafc}' +
    '.greeting{font-size:18px;margin-bottom:20px;color:#0f172a}' +
    '.details-card{background:white;border-radius:12px;padding:24px;margin:24px 0;box-shadow:0 4px 6px -2px rgba(0,0,0,0.05)}' +
    '.detail-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e2e8f0}' +
    '.detail-row:last-child{border-bottom:none}' +
    '.detail-label{color:#64748b;font-weight:500}' +
    '.detail-value{color:#0f172a;font-weight:600;text-align:right}' +
    '.badge{background:#10b981;color:white;padding:4px 12px;border-radius:30px;font-size:14px;font-weight:600;display:inline-block}' +
    '.business-info{background:white;border-radius:12px;padding:20px;margin:24px 0}' +
    '.footer{text-align:center;padding:30px;color:#64748b;font-size:14px;border-top:1px solid #e2e8f0}' +
    '.button{display:inline-block;background:#4f46e5;color:white !important;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0}' +
    '</style></head><body>' +
    '<div class="container">' +
    '<div class="header"><h1>' + labels.headerTitle + '</h1><p>' + subtitle + '</p></div>' +
    '<div class="content">' +
    '<p class="greeting">Dear ' + customerName + ',</p>' +
    '<p>Thank you for choosing ' + businessName + '. Your ' + (labels.subjectPrefix.toLowerCase().includes('order') ? 'order' : labels.subjectPrefix.toLowerCase().includes('appointment') ? 'appointment' : 'booking') + ' has been confirmed.</p>' +
    '<div class="details-card">' +
    '<div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0;color:#0f172a">Details</h3><span class="badge">' + reference + '</span></div>' +
    primaryDateRow +
    secondaryDateRow +
    guestsRow +
    '<div class="detail-row"><span class="detail-label">Total Amount</span><span class="detail-value" style="color:#10b981;font-size:20px">' + formatNaira(totalAmount) + '</span></div>' +
    '</div>' +
    '<div class="business-info"><h3 style="margin-top:0;color:#0f172a">' + businessName + '</h3>' +
    (businessLocation ? '<p style="color:#64748b;margin:4px 0">' + businessLocation + '</p>' : '') +
    (business.phone ? '<p style="color:#64748b;margin:4px 0">' + business.phone + '</p>' : '') +
    '</div>' +
    '<p>Need to make changes? Contact the business directly or reply to this email.</p>' +
    '<a href="' + APP_URL + '/book/' + business.slug + '" class="button">View ' + (labels.subjectPrefix.toLowerCase().includes('order') ? 'Order' : 'Booking') + '</a>' +
    '</div>' +
    '<div class="footer"><p>' + labels.footerTagline + '</p></div>' +
    '</div></body></html>';
}

// ============================================================
// OTHER TEMPLATES
// ============================================================
var welcomeTemplate = function (business) {
  return '<!DOCTYPE html><html><head><style>body{font-family:"Inter",Arial,sans-serif;line-height:1.6;color:#1e293b;margin:0;padding:0}.container{max-width:600px;margin:0 auto;background:white}.header{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:white;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:26px;font-weight:700}.content{padding:30px;background:#f8fafc}.card{background:white;border-radius:12px;padding:24px;margin:24px 0;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.footer{text-align:center;padding:30px;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0}.badge{background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:30px;font-size:12px;font-weight:600;display:inline-block}.button{display:inline-block;background:#4f46e5;color:white !important;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;margin:20px 0}</style></head><body><div class="container"><div class="header"><h1>Welcome to Plazzaa!</h1><p style="margin:10px 0 0;opacity:0.9">Your booking page is being set up</p></div><div class="content"><p>Dear ' + business.name + ',</p><p>Thank you for joining Plazzaa! We are excited to help you manage your bookings, track revenue, and grow your business.</p><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">Your Account Status</h3><p style="margin:0"><span class="badge">Pending Approval</span></p><p style="color:#64748b;font-size:14px;margin-top:12px">Our team is reviewing your business. You will receive another email once approved — usually within 24 hours.</p></div><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">What You Get</h3><p style="color:#334155;font-size:14px;margin:0 0 8px">&#10003; Your own branded booking page</p><p style="color:#334155;font-size:14px;margin:0 0 8px">&#10003; Accept payments via Paystack</p><p style="color:#334155;font-size:14px;margin:0 0 8px">&#10003; Track revenue and manage bookings</p><p style="color:#334155;font-size:14px;margin:0">&#10003; First 50 bookings free</p></div><p>Once approved, log in anytime to manage your dashboard.</p><p style="margin-top:24px">Welcome aboard,<br><strong>The Plazzaa Team</strong></p></div><div class="footer"><p>Plazzaa — Built for Nigerian businesses</p></div></div></body></html>';
};

var approvalTemplate = function (business) {
  return '<!DOCTYPE html><html><head><style>body{font-family:"Inter",Arial,sans-serif;line-height:1.6;color:#1e293b;margin:0;padding:0}.container{max-width:600px;margin:0 auto;background:white}.header{background:linear-gradient(135deg,#10b981 0%,#34d399 100%);color:white;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:26px;font-weight:700}.content{padding:30px;background:#f8fafc}.card{background:white;border-radius:12px;padding:24px;margin:24px 0;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.button{display:inline-block;background:#4f46e5;color:white !important;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;margin:20px 0}.footer{text-align:center;padding:30px;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0}.badge{background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:30px;font-size:12px;font-weight:600;display:inline-block}</style></head><body><div class="container"><div class="header"><h1>You are Approved!</h1><p style="margin:10px 0 0;opacity:0.9">Your booking page is now live</p></div><div class="content"><p>Dear ' + business.name + ',</p><p>Great news! Your business has been approved. Your booking page is now live and ready to accept reservations.</p><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">Your Status</h3><p style="margin:0"><span class="badge">Approved</span></p></div><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">Your Live Booking Link</h3><p style="font-family:monospace;font-size:16px;color:#4f46e5;font-weight:700;margin:0;word-break:break-all">' + APP_URL + '/book/' + business.slug + '</p><p style="color:#64748b;font-size:14px;margin-top:8px">Share this link with your customers. They can book directly — no middleman.</p></div><div class="card"><h3 style="margin:0 0 12px;color:#0f172a">Next Steps</h3><ol style="color:#334155;font-size:14px;padding-left:20px;margin:0"><li style="margin-bottom:8px"><strong>Log in</strong> at Plazzaa with your email</li><li style="margin-bottom:8px"><strong>Add your items</strong> and services</li><li style="margin-bottom:8px"><strong>Set your operating hours</strong></li><li><strong>Share your link</strong> and start earning</li></ol></div><a href="' + APP_URL + '" class="button">Go to Your Dashboard</a><p style="margin-top:24px">Welcome to the family,<br><strong>The Plazzaa Team</strong></p></div><div class="footer"><p>Plazzaa — First 50 bookings free</p></div></div></body></html>';
};

// ============================================================
// SEND BOOKING CONFIRMATION
// ============================================================
async function sendBookingConfirmation(booking, business) {
  // WHY: Log the incoming shape so we can debug failed sends
  console.log('[Email] 📧 Sending booking confirmation');
  console.log('[Email] - Ref:', booking.booking_reference);
  console.log('[Email] - To customer:', booking.customer_email);
  console.log('[Email] - Business:', business ? business.name : 'MISSING');
  console.log('[Email] - Business type:', business ? business.business_type : 'MISSING');

  // WHY: If business is missing, we can't determine labels — bail early
  if (!business) {
    console.error('[Email] ❌ Cannot send confirmation without business');
    return { success: false, error: 'Business required' };
  }

  // WHY: One lookup, no if/else chain. This is the fix.
  var labels = getBookingEmailLabels(business.business_type);
  var htmlContent = buildBookingEmail(booking, business, labels);
  var subject = labels.subjectPrefix + ' - ' + booking.booking_reference;

  var results = {};

  // Send to customer
  var customerResult = await sendEmail({
    to: booking.customer_email,
    subject: subject,
    html: htmlContent
  });
  results.customer = customerResult;

  // Send to business owner (skip if same as customer to avoid duplicate)
  if (business.email && typeof business.email === 'string' && business.email.includes('@')) {
    if (business.email !== booking.customer_email) {
      var ownerSubject = '📋 New ' + labels.subjectPrefix + ': ' + booking.booking_reference + ' — ' + (booking.customer_name || 'Customer');
      var ownerResult = await sendEmail({
        to: business.email,
        subject: ownerSubject,
        html: htmlContent
      });
      results.owner = ownerResult;
    } else {
      console.log('[Email] Customer is also business owner — skipping duplicate');
    }
  }

  return results;
}

// ============================================================
// OTHER EMAIL FUNCTIONS
// ============================================================
async function sendReminderEmail(booking, business) {
  return sendEmail({
    to: booking.customer_email,
    subject: 'Reminder: Your Booking Tomorrow - ' + booking.booking_reference,
    html: '<div style="font-family:Inter,Arial;max-width:600px;margin:0 auto"><div style="background:#4f46e5;color:white;padding:30px;text-align:center"><h1>Reminder: Your Booking Tomorrow!</h1></div><div style="padding:30px;background:#f8fafc"><p>Dear ' + booking.customer_name + ',</p><p>This is a friendly reminder about your booking tomorrow at ' + business.name + '.</p><p style="background:#eef2ff;padding:12px;border-radius:8px;font-family:monospace">' + booking.booking_reference + '</p></div><div style="text-align:center;padding:30px;color:#64748b;font-size:14px"><p>Plazzaa — Built for Nigerian businesses</p></div></div>'
  });
}

async function sendWelcomeEmail(business) {
  console.log('[Email] 📧 Sending welcome to:', business.email);
  return sendEmail({
    to: business.email,
    subject: 'Welcome to Plazzaa, ' + business.name + '!',
    html: welcomeTemplate(business)
  });
}

async function sendApprovalEmail(business) {
  console.log('[Email] 📧 Sending approval to:', business.email);
  return sendEmail({
    to: business.email,
    subject: 'You are Approved! Your Plazzaa booking page is live',
    html: approvalTemplate(business)
  });
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendReminderEmail,
  sendWelcomeEmail,
  sendApprovalEmail,
  getBookingEmailLabels,
  // WHY: Exported for testing — lets you verify labels per type
  // and check whether env vars were parsed correctly at startup
  _config: {
    FROM_NAME: FROM_NAME,
    FROM_EMAIL: FROM_EMAIL,
    APP_URL: APP_URL,
    hasApiKey: !!RESEND_API_KEY
  }
};