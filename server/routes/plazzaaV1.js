// server/routes/plazzaaV1.js
// ============================================================
// Plazzaa V1 booking engine
//
//   merchant sets up services, hours and bank details
//   -> customer books a slot without an account  (payment_pending)
//   -> customer pays by bank transfer, taps "I've paid"  (awaiting_validation)
//   -> merchant validates  (confirmed + confirmation email)
//   -> unpaid holds expire and release the slot  (expired)
//
// Deliberately NOT here: card payment, staff accounts, wallet,
// KYC, points, marketplace. See the V1 scope document.
// ============================================================

const express = require('express');
const crypto = require('crypto');
const { buildSlots } = require('../services/availabilityService');
const createV1Store = require('../services/v1Store');

const DEFAULT_HOLD_MINUTES = 30;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const ACTIVE_STATUSES = ['payment_pending', 'awaiting_validation', 'confirmed'];

const PUBLIC_BUSINESS_FIELDS =
  'id, name, slug, description, business_type, logo_url, cover_image, phone, phone_numbers, city, state, address';
const SERVICE_FIELDS =
  'id, business_id, name, description, price, duration_minutes, capacity, slug, is_active, created_at, updated_at';
const BOOKING_FIELDS =
  'id, booking_reference, business_id, service_id, customer_name, customer_email, customer_phone, ' +
  'customer_whatsapp, start_datetime, end_datetime, total_amount, status, special_requests, ' +
  'expires_at, payment_marked_at, validated_at, created_at';

function holdMinutes() {
  const raw = parseInt(process.env.BOOKING_HOLD_MINUTES, 10);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_HOLD_MINUTES;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function bookingReference() {
  return 'PLZ-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function fail(res, status, error, extra) {
  return res.status(status).json(Object.assign({ success: false, error: error }, extra || {}));
}

// Turn the exceptions raised by create_service_booking into plain answers
const BOOKING_ERRORS = {
  SERVICE_NOT_FOUND: [404, 'That service is not available'],
  SLOT_IN_PAST: [400, 'That time has already passed'],
  SLOT_BLOCKED: [409, 'That time is not available'],
  SLOT_FULL: [409, 'That time was just taken. Please choose another.'],
  NOT_VALIDATABLE: [409, 'This booking can no longer be validated']
};

function mapDatabaseError(error) {
  const message = (error && error.message) || '';
  const match = Object.keys(BOOKING_ERRORS).find(function (code) {
    return message.indexOf(code) !== -1;
  });
  return match ? { status: BOOKING_ERRORS[match][0], error: BOOKING_ERRORS[match][1], code: match } : null;
}

function wrap(handler) {
  return function (req, res) {
    Promise.resolve(handler(req, res)).catch(function (err) {
      console.error('[Plazzaa V1]', req.method, req.originalUrl, err);
      const mapped = mapDatabaseError(err);
      if (mapped) return fail(res, mapped.status, mapped.error, { code: mapped.code });
      return fail(res, 500, 'Something went wrong. Please try again.');
    });
  };
}

module.exports = function createPlazzaaV1Router(deps) {
  const supabase = deps.supabase;
  const authenticateBusiness = deps.authenticateBusiness;
  const email = deps.email || {};
  const router = express.Router();

  // ----------------------------------------------------------
  // Shared helpers
  // ----------------------------------------------------------

  // Reads and writes the V1 entities, over the real tables when the migration
  // has been applied and over the legacy ones when it has not.
  const store = createV1Store(supabase);

  async function expireStaleBookings() {
    try {
      await store.expireStale();
    } catch (err) {
      console.error('[Plazzaa V1] expire sweep failed:', err.message);
    }
  }

  async function findBusinessBySlug(slug) {
    const { data, error } = await supabase
      .from('businesses')
      .select(PUBLIC_BUSINESS_FIELDS)
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function getBankAccount(businessId) {
    return store.getBankAccount(businessId);
  }

  // ----------------------------------------------------------
  // Merchant: services
  // ----------------------------------------------------------

  router.get('/businesses/:businessId/services', authenticateBusiness, wrap(async function (req, res) {
    const services = await store.listServices(req.params.businessId);
    res.json({ success: true, services: services });
  }));

  router.post('/businesses/:businessId/services', authenticateBusiness, wrap(async function (req, res) {
    const businessId = req.params.businessId;
    const body = req.body || {};

    if (!body.name || !String(body.name).trim()) return fail(res, 400, 'Service name is required');
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) return fail(res, 400, 'A valid price is required');
    const duration = parseInt(body.duration_minutes, 10);
    if (!Number.isFinite(duration) || duration <= 0) return fail(res, 400, 'Duration must be more than 0 minutes');
    const capacity = body.capacity === undefined ? 1 : parseInt(body.capacity, 10);
    if (!Number.isFinite(capacity) || capacity <= 0) return fail(res, 400, 'Capacity must be at least 1');

    const service = await store.createService(businessId, {
      name: String(body.name).trim(),
      description: body.description ? String(body.description).trim() : null,
      price: price,
      duration_minutes: duration,
      capacity: capacity,
      is_active: body.is_active === undefined ? true : Boolean(body.is_active)
    });

    res.status(201).json({ success: true, service: service });
  }));

  router.put('/businesses/:businessId/services/:serviceId', authenticateBusiness, wrap(async function (req, res) {
    const businessId = req.params.businessId;
    const body = req.body || {};
    const patch = { updated_at: new Date().toISOString() };

    if (body.name !== undefined) {
      if (!String(body.name).trim()) return fail(res, 400, 'Service name cannot be empty');
      patch.name = String(body.name).trim();
    }
    if (body.description !== undefined) patch.description = body.description ? String(body.description).trim() : null;
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) return fail(res, 400, 'A valid price is required');
      patch.price = price;
    }
    if (body.duration_minutes !== undefined) {
      const duration = parseInt(body.duration_minutes, 10);
      if (!Number.isFinite(duration) || duration <= 0) return fail(res, 400, 'Duration must be more than 0 minutes');
      patch.duration_minutes = duration;
    }
    if (body.capacity !== undefined) {
      const capacity = parseInt(body.capacity, 10);
      if (!Number.isFinite(capacity) || capacity <= 0) return fail(res, 400, 'Capacity must be at least 1');
      patch.capacity = capacity;
    }
    if (body.is_active !== undefined) patch.is_active = Boolean(body.is_active);

    delete patch.updated_at;
    const service = await store.updateService(businessId, req.params.serviceId, patch);
    if (!service) return fail(res, 404, 'Service not found');

    res.json({ success: true, service: service });
  }));

  router.delete('/businesses/:businessId/services/:serviceId', authenticateBusiness, wrap(async function (req, res) {
    const serviceId = req.params.serviceId;

    // A service with bookings is deactivated, never deleted, so existing
    // customers keep their booking history.
    const result = await store.deleteService(req.params.businessId, serviceId);
    res.json({ success: true, ...result });
  }));

  // ----------------------------------------------------------
  // Merchant: bank account (shown to customers after booking)
  // ----------------------------------------------------------

  router.get('/businesses/:businessId/bank-account', authenticateBusiness, wrap(async function (req, res) {
    const account = await getBankAccount(req.params.businessId);
    res.json({ success: true, bankAccount: account || null });
  }));

  router.put('/businesses/:businessId/bank-account', authenticateBusiness, wrap(async function (req, res) {
    const body = req.body || {};
    const bankName = String(body.bank_name || '').trim();
    const accountNumber = String(body.account_number || '').trim();
    const accountName = String(body.account_name || '').trim();

    if (!bankName) return fail(res, 400, 'Bank name is required');
    if (!/^\d{10}$/.test(accountNumber)) return fail(res, 400, 'Account number must be 10 digits');
    if (!accountName) return fail(res, 400, 'Account name is required');

    const account = await store.saveBankAccount(req.params.businessId, {
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName
    });

    res.json({ success: true, bankAccount: account });
  }));

  // ----------------------------------------------------------
  // Merchant: weekly opening hours
  // day_of_week: 0 = Monday ... 6 = Sunday
  // ----------------------------------------------------------

  router.get('/businesses/:businessId/business-hours', authenticateBusiness, wrap(async function (req, res) {
    const { data, error } = await supabase
      .from('operating_hours')
      .select('id, day_of_week, open_time, close_time, is_closed')
      .eq('business_id', req.params.businessId)
      .order('day_of_week', { ascending: true });
    if (error) throw error;
    res.json({ success: true, hours: data || [] });
  }));

  router.put('/businesses/:businessId/business-hours', authenticateBusiness, wrap(async function (req, res) {
    const businessId = req.params.businessId;
    const incoming = Array.isArray(req.body && req.body.hours) ? req.body.hours : null;
    if (!incoming) return fail(res, 400, 'hours must be an array');

    const rows = [];
    for (const entry of incoming) {
      const day = parseInt(entry && entry.day_of_week, 10);
      if (!Number.isFinite(day) || day < 0 || day > 6) {
        return fail(res, 400, 'day_of_week must be 0 (Monday) to 6 (Sunday)');
      }
      // Accept either is_closed or the dashboard's is_open
      const closed = entry.is_closed !== undefined ? Boolean(entry.is_closed) : !entry.is_open;
      if (!closed && (!entry.open_time || !entry.close_time)) {
        return fail(res, 400, 'Open and close times are required for days that are open');
      }
      rows.push({
        business_id: businessId,
        day_of_week: day,
        open_time: closed ? null : entry.open_time,
        close_time: closed ? null : entry.close_time,
        is_closed: closed
      });
    }

    await supabase.from('operating_hours').delete().eq('business_id', businessId);

    if (!rows.length) return res.json({ success: true, hours: [] });

    const { data, error } = await supabase
      .from('operating_hours')
      .insert(rows)
      .select('id, day_of_week, open_time, close_time, is_closed');
    if (error) throw error;

    res.json({ success: true, hours: data || [] });
  }));

  // ----------------------------------------------------------
  // Merchant: blocked slots (manual availability override)
  // ----------------------------------------------------------

  router.get('/businesses/:businessId/blocked-slots', authenticateBusiness, wrap(async function (req, res) {
    const blockedSlots = await store.listBlockedSlots(req.params.businessId, {
      from: req.query.from,
      to: req.query.to
    });
    res.json({ success: true, blockedSlots: blockedSlots });
  }));

  router.post('/businesses/:businessId/blocked-slots', authenticateBusiness, wrap(async function (req, res) {
    const body = req.body || {};
    const start = new Date(body.start_datetime);
    const end = new Date(body.end_datetime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return fail(res, 400, 'start_datetime and end_datetime must be valid dates');
    }
    if (end <= start) return fail(res, 400, 'The end time must be after the start time');

    const blockedSlot = await store.blockSlot(req.params.businessId, {
      service_id: body.service_id || null,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      reason: body.reason ? String(body.reason).trim() : null
    });

    res.status(201).json({ success: true, blockedSlot: blockedSlot });
  }));

  router.delete('/businesses/:businessId/blocked-slots/:id', authenticateBusiness, wrap(async function (req, res) {
    await store.unblockSlot(req.params.businessId, req.params.id);
    res.json({ success: true, deleted: true });
  }));

  // ----------------------------------------------------------
  // Merchant: readiness before publishing the booking link
  // ----------------------------------------------------------

  router.get('/businesses/:businessId/setup-status', authenticateBusiness, wrap(async function (req, res) {
    const businessId = req.params.businessId;

    const [businessResult, activeServices, hoursResult, account] = await Promise.all([
      supabase.from('businesses').select('id, name, slug').eq('id', businessId).maybeSingle(),
      store.listServices(businessId, { activeOnly: true }),
      supabase.from('operating_hours').select('id').eq('business_id', businessId).eq('is_closed', false).limit(1),
      getBankAccount(businessId)
    ]);

    if (businessResult.error) throw businessResult.error;
    if (!businessResult.data) return fail(res, 404, 'Business not found');

    const checks = {
      has_active_service: activeServices.length > 0,
      has_opening_hours: Boolean(hoursResult.data && hoursResult.data.length),
      has_bank_account: Boolean(account),
      has_slug: Boolean(businessResult.data.slug)
    };

    const ready = Object.keys(checks).every(function (key) { return checks[key]; });

    res.json({
      success: true,
      ready: ready,
      checks: checks,
      bookingLink: businessResult.data.slug ? '/book/' + businessResult.data.slug : null
    });
  }));

  // ----------------------------------------------------------
  // Merchant: bookings list and validation
  // ----------------------------------------------------------

  router.get('/businesses/:businessId/bookings', authenticateBusiness, wrap(async function (req, res) {
    await expireStaleBookings();

    const bookings = await store.listBookings(req.params.businessId, {
      status: req.query.status,
      limit: parseInt(req.query.limit, 10) || 200
    });
    res.json({
      success: true,
      bookings: bookings,
      counts: bookings.reduce(function (acc, row) {
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
      }, {})
    });
  }));

  router.post('/businesses/:businessId/bookings/:reference/validate', authenticateBusiness, wrap(async function (req, res) {
    const result = await store.validateBooking(req.params.businessId, req.params.reference);

    if (result.notFound) return fail(res, 404, 'Booking not found');
    if (result.invalid) {
      return fail(res, 409, 'This booking cannot be validated while it is ' + result.booking.status + '.');
    }
    if (result.alreadyConfirmed) {
      return res.json({ success: true, alreadyConfirmed: true, booking: result.booking });
    }

    const booking = result.booking;

    // Tell the customer, but never fail the merchant's action over an email.
    try {
      const service = booking.service_id
        ? await store.getService(req.params.businessId, booking.service_id)
        : null;
      const { data: business } = await supabase
        .from('businesses').select('name, slug, phone, address, city')
        .eq('id', req.params.businessId).maybeSingle();
      if (emailService && emailService.sendBookingValidated) {
        emailService.sendBookingValidated({ booking: booking, service: service, business: business })
          .catch(function (err) { console.error('[Plazzaa V1] validated email failed:', err.message); });
      }
    } catch (err) {
      console.error('[Plazzaa V1] validated email skipped:', err.message);
    }

    res.json({ success: true, booking: booking });
  }));

  // ----------------------------------------------------------
  // Public: booking page data
  // ----------------------------------------------------------

  router.get('/public/businesses/:slug', wrap(async function (req, res) {
    const business = await findBusinessBySlug(req.params.slug);
    if (!business) return fail(res, 404, 'Business not found');

    const services = await store.listServices(business.id, { activeOnly: true });
    res.json({ success: true, business: business, services: services });
  }));

  router.get('/public/businesses/:slug/services/:serviceSlug', wrap(async function (req, res) {
    const business = await findBusinessBySlug(req.params.slug);
    if (!business) return fail(res, 404, 'Business not found');

    const service = await store.getServiceBySlug(business.id, req.params.serviceSlug, { activeOnly: true });
    if (!service) return fail(res, 404, 'Service not found');

    res.json({ success: true, business: business, service: service });
  }));

  router.get('/public/businesses/:slug/services/:serviceSlug/availability', wrap(async function (req, res) {
    const date = req.query.date;
    if (!isIsoDate(date)) return fail(res, 400, 'date must be in YYYY-MM-DD format');

    const business = await findBusinessBySlug(req.params.slug);
    if (!business) return fail(res, 404, 'Business not found');

    const service = await store.getServiceBySlug(business.id, req.params.serviceSlug, { activeOnly: true });
    if (!service) return fail(res, 404, 'Service not found');

    await expireStaleBookings();

    const dayStart = new Date(date + 'T00:00:00.000Z');
    const windowStart = new Date(dayStart.getTime() - 24 * 3600 * 1000).toISOString();
    const windowEnd = new Date(dayStart.getTime() + 48 * 3600 * 1000).toISOString();

    const [hoursResult, blockedResult, bookingsResult] = await Promise.all([
      supabase
        .from('operating_hours')
        .select('day_of_week, open_time, close_time, is_closed')
        .eq('business_id', business.id),
      store.listBlockedSlots(business.id, { from: windowStart, to: windowEnd }),
      store.bookingsForService(service.id, windowStart, windowEnd)
    ]);

    if (hoursResult.error) throw hoursResult.error;

    const result = buildSlots({
      date: date,
      service: service,
      hours: hoursResult.data,
      blocked: blockedResult,
      bookings: bookingsResult
    });

    res.json({ success: true, service: service, availability: result });
  }));

  // ----------------------------------------------------------
  // Public: create a booking, mark it paid, check it
  // ----------------------------------------------------------

  router.post('/public/bookings', wrap(async function (req, res) {
    const body = req.body || {};

    if (!body.business_slug && !body.business_id) return fail(res, 400, 'business_slug is required');
    if (!body.service_id && !body.service_slug) return fail(res, 400, 'service_slug is required');
    if (!body.customer_name || !String(body.customer_name).trim()) return fail(res, 400, 'Your name is required');
    if (!isEmail(body.customer_email)) return fail(res, 400, 'A valid email address is required');
    if (!body.customer_whatsapp || !String(body.customer_whatsapp).trim()) {
      return fail(res, 400, 'A WhatsApp number is required');
    }

    const start = new Date(body.start_datetime);
    if (Number.isNaN(start.getTime())) return fail(res, 400, 'start_datetime must be a valid date and time');

    let business;
    if (body.business_slug) {
      business = await findBusinessBySlug(body.business_slug);
    } else {
      const { data } = await supabase
        .from('businesses')
        .select(PUBLIC_BUSINESS_FIELDS)
        .eq('id', body.business_id)
        .maybeSingle();
      business = data;
    }
    if (!business) return fail(res, 404, 'Business not found');

    const service = body.service_id
      ? await store.getService(business.id, body.service_id)
      : await store.getServiceBySlug(business.id, body.service_slug, { activeOnly: true });
    if (!service) return fail(res, 404, 'Service not found');

    let booking;
    try {
      booking = await store.createBooking({
        business: business,
        service: service,
        start_datetime: start.toISOString(),
        customer_name: String(body.customer_name).trim(),
        customer_email: String(body.customer_email).trim(),
        customer_whatsapp: String(body.customer_whatsapp).trim(),
        special_requests: (body.special_requests || body.notes)
          ? String(body.special_requests || body.notes).trim()
          : null,
        holdMinutes: holdMinutes()
      });
    } catch (err) {
      if (err.status === 409) return fail(res, 409, err.message);
      throw err;
    }

    const bankAccount = await getBankAccount(business.id);

    res.status(201).json({
      success: true,
      booking: booking,
      bankAccount: bankAccount || null,
      holdMinutes: holdMinutes(),
      // The customer pays outside Plazzaa, then taps "I've made payment".
      nextStep: bankAccount
        ? 'Transfer the amount to the account shown, using the booking reference as the narration, then tap "I have made payment".'
        : 'This business has not added bank details yet. Please contact them directly to pay.'
    });
  }));

  router.get('/public/bookings/:reference', wrap(async function (req, res) {
    await expireStaleBookings();

    const booking = await store.getBookingByReference(req.params.reference);
    if (!booking) return fail(res, 404, 'Booking not found');

    const [businessResult, bankAccount] = await Promise.all([
      supabase.from('businesses').select(PUBLIC_BUSINESS_FIELDS).eq('id', booking.business_id).maybeSingle(),
      getBankAccount(booking.business_id)
    ]);

    res.json({
      success: true,
      booking: booking,
      business: businessResult.data || null,
      // Bank details stay visible while the customer still has to pay
      bankAccount: booking.status === 'payment_pending' || booking.status === 'awaiting_validation'
        ? bankAccount || null
        : null
    });
  }));

  router.post('/public/bookings/:reference/mark-paid', wrap(async function (req, res) {
    await expireStaleBookings();

    const result = await store.markPaid(req.params.reference);

    if (result.notFound) return fail(res, 404, 'Booking not found');
    if (result.alreadyMarked) {
      return res.json({ success: true, alreadyMarked: true, booking: result.booking, status: result.booking.status });
    }
    if (result.invalid) {
      if (result.booking.status === 'expired') {
        return fail(res, 409, 'This booking expired before payment was confirmed. Please book again.', { code: 'EXPIRED' });
      }
      return fail(res, 409, 'This booking can no longer be updated', { code: 'WRONG_STATUS' });
    }

    const booking = result.booking;

    const { data: business } = await supabase
      .from('businesses')
      .select(PUBLIC_BUSINESS_FIELDS + ', email')
      .eq('id', booking.business_id)
      .maybeSingle();

    // Optional nudge so the merchant knows someone is waiting
    if (typeof email.sendAwaitingValidation === 'function') {
      email.sendAwaitingValidation(booking, business).catch(function (err) {
        console.error('[Plazzaa V1] merchant notice failed:', err.message);
      });
    }

    res.json({
      success: true,
      booking: booking,
      message: 'Thanks. Share your payment receipt with the business, and they will confirm your booking.'
    });
  }));

  // Release abandoned holds even when nobody is browsing
  const sweep = setInterval(function () {
    expireStaleBookings().catch(function () { /* logged inside */ });
  }, SWEEP_INTERVAL_MS);
  if (typeof sweep.unref === 'function') sweep.unref();

  return router;
};
