﻿var Resend = require('resend').Resend;

var resend = new Resend(process.env.RESEND_API_KEY);

// Test mode: Resend only delivers to verified emails
// All emails go to your address with original recipient in subject
var VERIFIED_EMAIL = 'olusegun@luminara.io';
var FROM_EMAIL = 'Booking Hub <onboarding@resend.dev>';

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
  return '<!DOCTYPE html><html><head><style>body{font-family:"Inter",Arial,sans-serif;line-height:1.6;color:#1e293b;margin:0;padding:0}.container{max-width:600px;margin:0 auto;background:white}.header{background:linear-gradient(135deg,#10b981 0%,#34d399 100%);color:white;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:26px;font-weight:700}.content{padding:30px;background:#f8fafc}.card{background:white;border-radius:12px;padding:24px;margin:24px 0;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.button{display:inline-block;background:#4f46e5;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;margin:20px 0}.footer{text-align:center;padding:30px;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0}.badge{background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:30px;font-size:12px;font-weight:600;display:inline-block}</style></head><body><div class="container"><div class="header"><h1>You are Approved!</h1><p style="margin:10px 0 0;opacity:0.9">Your booking page is now live</p></div><div class="content"><p>Dear ' + business.name + ',</p><p>Great news! Your business has been approved. Your booking page is now live and ready to accept reservations.</p><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">Your Status</h3><p style="margin:0"><span class="badge">Approved</span></p></div><div class="card"><h3 style="margin:0 0 8px;color:#0f172a">Your Live Booking Link</h3><p style="font-family:monospace;font-size:16px;color:#4f46e5;font-weight:700;margin:0">localhost:5173/book/' + business.slug + '</p><p style="color:#64748b;font-size:14px;margin-top:8px">Share this link with your customers. They can book directly - no middleman.</p></div><div class="card"><h3 style="margin:0 0 12px;color:#0f172a">Next Steps</h3><ol style="color:#334155;font-size:14px;padding-left:20px;margin:0"><li style="margin-bottom:8px"><strong>Log in</strong> at Booking Hub with your email</li><li style="margin-bottom:8px"><strong>Add your rooms</strong> and services</li><li style="margin-bottom:8px"><strong>Set your operating hours</strong></li><li><strong>Share your link</strong> and start earning</li></ol></div><a href="http://localhost:5173" class="button">Go to Your Dashboard</a><p style="margin-top:24px">Welcome to the family,<br><strong>The Booking Hub Team</strong></p></div><div class="footer"><p>Booking Hub - First 50 bookings free</p></div></div></body></html>';
};

async function sendEmail(options) {
  var to = options.to;
  var subject = options.subject;
  var html = options.html;

  try {
    var actualTo = VERIFIED_EMAIL;
    var enhancedSubject = subject + ' [To: ' + to + ']';

    var result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [actualTo],
      subject: enhancedSubject,
      html: html
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return { success: false, error: result.error };
    }

    console.log('Email sent successfully:', result.data ? result.data.id : 'unknown');
    console.log('To: ' + to + ' | Delivered to: ' + actualTo);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Email sending failed:', error.message || error);
    return { success: false, error: error };
  }
}

async function sendBookingConfirmation(booking, business) {
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
  return sendEmail({ to: booking.customer_email, subject: subject, html: template(booking, business) });
}

async function sendReminderEmail(booking, business) {
  return sendEmail({
    to: booking.customer_email,
    subject: 'Reminder: Your Booking Tomorrow - ' + booking.booking_reference,
    html: '<div style="font-family:Inter,Arial;max-width:600px;margin:0 auto"><div style="background:#4f46e5;color:white;padding:30px;text-align:center"><h1>Reminder: Your Booking Tomorrow!</h1></div><div style="padding:30px;background:#f8fafc"><p>Dear ' + booking.customer_name + ',</p><p>This is a friendly reminder about your booking tomorrow at ' + business.name + '.</p><p style="background:#eef2ff;padding:12px;border-radius:8px;font-family:monospace">' + booking.booking_reference + '</p><p>' + (business.address || '') + ', ' + business.city + '</p><p>' + (business.phone || '') + '</p></div></div>'
  });
}

async function sendWelcomeEmail(business) {
  return sendEmail({ to: business.email, subject: 'Welcome to Booking Hub, ' + business.name + '!', html: welcomeTemplate(business) });
}

async function sendApprovalEmail(business) {
  return sendEmail({ to: business.email, subject: 'You are Approved! Your Booking Page is Live', html: approvalTemplate(business) });
}

module.exports = { sendEmail, sendBookingConfirmation, sendReminderEmail, sendWelcomeEmail, sendApprovalEmail };