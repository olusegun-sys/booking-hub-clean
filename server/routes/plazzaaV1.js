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

  async function expireStaleBookings() {
    const { error } = await supabase.rpc('expire_stale_bookings');
    if (error) console.error('[Plazzaa V1] expire sweep failed:', error.message);
  }

  async function uniqueServiceSlug(businessId, name, ignoreServiceId) {
    const base = slugify(name) || 'service';
    const { data } = await supabase
      .from('services')
      .select('id, slug')
      .eq('business_id', businessId);

    const taken = (data || [])
      .filter(function (row) { return row.id !== ignoreServiceId; })
      .map(function (row) { return row.slug; });

    if (taken.indexOf(base) === -1) return base;
    for (let n = 2; n < 500; n++) {
      if (taken.indexOf(base + '-' + n) === -1) return base + '-' + n;
    }
    return base + '-' + Date.now();
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
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('bank_name, account_number, account_name, updated_at')
      .eq('business_id', businessId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  // ----------------------------------------------------------
  // Merchant: services
  // ----------------------------------------------------------

  router.get('/businesses/:businessId/services', authenticateBusiness, wrap(async function (req, res) {
    const { data, error } = await supabase
      .from('services')
      .select(SERVICE_FIELDS)
      .eq('business_id', req.params.businessId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ success: true, services: data || [] });
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

    const { data, error } = await supabase
      .from('services')
      .insert({
        business_id: businessId,
        name: String(body.name).trim(),
        description: body.description ? String(body.description).trim() : null,
        price: price,
        duration_minutes: duration,
        capacity: capacity,
        slug: await uniqueServiceSlug(businessId, body.name),
        is_active: body.is_active === undefined ? true : Boolean(body.is_active)
      })
      .select(SERVICE_FIELDS)
      .single();
    if (error) throw error;

    res.status(201).json({ success: true, service: data });
  }));

  router.put('/businesses/:businessId/services/:serviceId', authenticateBusiness, wrap(async function (req, res) {
    const businessId = req.params.businessId;
    const body = req.body || {};
    const patch = { updated_at: new Date().toISOString() };

    if (body.name !== undefined) {
      if (!String(body.name).trim()) return fail(res, 400, 'Service name cannot be empty');
      patch.name = String(body.name).trim();
      patch.slug = await uniqueServiceSlug(businessId, body.name, req.params.serviceId);
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

    const { data, error } = await supabase
      .from('services')
      .update(patch)
      .eq('id', req.params.serviceId)
      .eq('business_id', businessId)
      .select(SERVICE_FIELDS)
      .maybeSingle();
    if (error) throw error;
    if (!data) return fail(res, 404, 'Service not found');

    res.json({ success: true, service: data });
  }));

  router.delete('/businesses/:businessId/services/:serviceId', authenticateBusiness, wrap(async function (req, res) {
    const serviceId = req.params.serviceId;

    // A service with live bookings is deactivated, never deleted,
    // so existing customers keep their booking history.
    const { data: live, error: liveError } = await supabase
      .from('bookings')
      .select('id')
      .eq('service_id', serviceId)
      .in('status', ACTIVE_STATUSES)
      .limit(1);
    if (liveError) throw liveError;

    if (live && live.length) {
      const { data, error } = await supabase
        .from('services')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', serviceId)
        .eq('business_id', req.params.businessId)
        .select(SERVICE_FIELDS)
        .maybeSingle();
      if (error) throw error;
      if (!data) return fail(res, 404, 'Service not found');
      return res.json({ success: true, deactivated: true, service: data });
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('business_id', req.params.businessId);
    if (error) throw error;

    res.json({ success: true, deleted: true });
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

    const { data, error } = await supabase
      .from('bank_accounts')
      .upsert({
        business_id: req.params.businessId,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'business_id' })
      .select('bank_name, account_number, account_name, updated_at')
      .single();
    if (error) throw error;

    res.json({ success: true, bankAccount: data });
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
    let query = supabase
      .from('availability')
      .select('id, business_id, service_id, start_datetime, end_datetime, reason, is_available')
      .eq('business_id', req.params.businessId)
      .eq('is_available', false)
      .not('start_datetime', 'is', null)
      .order('start_datetime', { ascending: true });

    if (req.query.from) query = query.gte('start_datetime', new Date(req.query.from).toISOString());
    if (req.query.to) query = query.lte('start_datetime', new Date(req.query.to).toISOString());

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, blockedSlots: data || [] });
  }));

  router.post('/businesses/:businessId/blocked-slots', authenticateBusiness, wrap(async function (req, res) {
    const body = req.body || {};
    const start = new Date(body.start_datetime);
    const end = new Date(body.end_datetime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return fail(res, 400, 'start_datetime and end_datetime must be valid dates');
    }
    if (end <= start) return fail(res, 400, 'The end time must be after the start time');

    const { data, error } = await supabase
      .from('availability')
      .insert({
        business_id: req.params.businessId,
        service_id: body.service_id || null,
        date: start.toISOString().slice(0, 10),
        start_time: start.toISOString().slice(11, 19),
        end_time: end.toISOString().slice(11, 19),
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        is_available: false,
        reason: body.reason ? String(body.reason).trim() : null
      })
      .select('id, business_id, service_id, start_datetime, end_datetime, reason')
      .single();
    if (error) throw error;

    res.status(201).json({ success: true, blockedSlot: data });
  }));

  router.delete('/businesses/:businessId/blocked-slots/:id', authenticateBusiness, wrap(async function (req, res) {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', req.params.id)
      .eq('business_id', req.params.businessId);
    if (error) throw error;
    res.json({ success: true, deleted: true });
  }));

  // ----------------------------------------------------------
  // Merchant: readiness before publishing the booking link
  // ----------------------------------------------------------

  router.get('/businesses/:businessId/setup-status', authenticateBusiness, wrap(async function (req, res) {
    const businessId = req.params.businessId;

    const [businessResult, servicesResult, hoursResult, account] = await Promise.all([
      supabase.from('businesses').select('id, name, slug').eq('id', businessId).maybeSingle(),
      supabase.from('services').select('id').eq('business_id', businessId).eq('is_active', true).limit(1),
      supabase.from('operating_hours').select('id').eq('business_id', businessId).eq('is_closed', false).limit(1),
      getBankAccount(businessId)
    ]);

    if (businessResult.error) throw businessResult.error;
    if (!businessResult.data) return fail(res, 404, 'Business not found');

    const checks = {
      has_active_service: Boolean(servicesResult.data && servicesResult.data.length),
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

    let query = supabase
      .from('bookings')
      .select(BOOKING_FIELDS + ', services ( id, name, duration_minutes, price )')
      .eq('business_id', req.params.businessId)
      .order('start_datetime', { ascending: false, nullsFirst: false })
      .limit(parseInt(req.query.limit, 10) || 200);

    if (req.query.status) query = query.in('status', String(req.query.status).split(','));
    if (req.query.from) query = query.gte('start_datetime', new Date(req.query.from).toISOString());
    if (req.query.to) query = query.lte('start_datetime', new Date(req.query.to).toISOString());

    const { data, error } = await query;
    if (error) throw error;

    const bookings = data || [];
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
    const businessId = req.params.businessId;

    const { data: booking, error } = await supabase.rpc('validate_booking', {
      p_business_id: businessId,
      p_reference: req.params.reference
    });
    if (error) throw error;

    const [businessResult, serviceResult] = await Promise.all([
      supabase.from('businesses').select(PUBLIC_BUSINESS_FIELDS + ', email').eq('id', businessId).maybeSingle(),
      booking.service_id
        ? supabase.from('services').select(SERVICE_FIELDS).eq('id', booking.service_id).maybeSingle()
        : Promise.resolve({ data: null })
    ]);

    // The customer is told once, when the merchant confirms the money arrived.
    if (typeof email.sendBookingValidated === 'function') {
      email.sendBookingValidated(booking, businessResult.data, serviceResult.data).catch(function (err) {
        console.error('[Plazzaa V1] confirmation email failed:', err.message);
      });
    }

    res.json({ success: true, booking: booking });
  }));

  // ----------------------------------------------------------
  // Public: booking page data
  // ----------------------------------------------------------

  router.get('/public/businesses/:slug', wrap(async function (req, res) {
    const business = await findBusinessBySlug(req.params.slug);
    if (!business) return fail(res, 404, 'Business not found');

    const { data: services, error } = await supabase
      .from('services')
      .select('id, name, description, price, duration_minutes, capacity, slug')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) throw error;

    res.json({ success: true, business: business, services: services || [] });
  }));

  router.get('/public/businesses/:slug/services/:serviceSlug', wrap(async function (req, res) {
    const business = await findBusinessBySlug(req.params.slug);
    if (!business) return fail(res, 404, 'Business not found');

    const { data: service, error } = await supabase
      .from('services')
      .select('id, name, description, price, duration_minutes, capacity, slug')
      .eq('business_id', business.id)
      .eq('slug', req.params.serviceSlug)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!service) return fail(res, 404, 'Service not found');

    res.json({ success: true, business: business, service: service });
  }));

  router.get('/public/businesses/:slug/services/:serviceSlug/availability', wrap(async function (req, res) {
    const date = req.query.date;
    if (!isIsoDate(date)) return fail(res, 400, 'date must be in YYYY-MM-DD format');

    const business = await findBusinessBySlug(req.params.slug);
    if (!business) return fail(res, 404, 'Business not found');

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, price, duration_minutes, capacity, slug')
      .eq('business_id', business.id)
      .eq('slug', req.params.serviceSlug)
      .eq('is_active', true)
      .maybeSingle();
    if (serviceError) throw serviceError;
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
      supabase
        .from('availability')
        .select('service_id, start_datetime, end_datetime, is_available')
        .eq('business_id', business.id)
        .eq('is_available', false)
        .gte('start_datetime', windowStart)
        .lte('start_datetime', windowEnd),
      supabase
        .from('bookings')
        .select('start_datetime, status')
        .eq('service_id', service.id)
        .in('status', ACTIVE_STATUSES)
        .gte('start_datetime', windowStart)
        .lte('start_datetime', windowEnd)
    ]);

    if (hoursResult.error) throw hoursResult.error;
    if (blockedResult.error) throw blockedResult.error;
    if (bookingsResult.error) throw bookingsResult.error;

    const result = buildSlots({
      date: date,
      service: service,
      hours: hoursResult.data,
      blocked: blockedResult.data,
      bookings: bookingsResult.data
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

    let serviceId = body.service_id;
    if (!serviceId) {
      const { data: service, error } = await supabase
        .from('services')
        .select('id')
        .eq('business_id', business.id)
        .eq('slug', body.service_slug)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      if (!service) return fail(res, 404, 'Service not found');
      serviceId = service.id;
    }

    const { data: booking, error: bookingError } = await supabase.rpc('create_service_booking', {
      p_business_id: business.id,
      p_service_id: serviceId,
      p_start: start.toISOString(),
      p_reference: bookingReference(),
      p_customer_name: String(body.customer_name).trim(),
      p_customer_email: String(body.customer_email).trim(),
      p_customer_whatsapp: String(body.customer_whatsapp).trim(),
      p_notes: body.notes ? String(body.notes).trim() : null,
      p_hold_minutes: holdMinutes()
    });
    if (bookingError) throw bookingError;

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

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(BOOKING_FIELDS + ', services ( id, name, duration_minutes, price )')
      .eq('booking_reference', req.params.reference)
      .maybeSingle();
    if (error) throw error;
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

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status: 'awaiting_validation',
        payment_marked_at: new Date().toISOString(),
        // The slot is held until the merchant decides
        expires_at: null
      })
      .eq('booking_reference', req.params.reference)
      .eq('status', 'payment_pending')
      .select(BOOKING_FIELDS)
      .maybeSingle();
    if (error) throw error;

    if (!booking) {
      const { data: current } = await supabase
        .from('bookings')
        .select('status')
        .eq('booking_reference', req.params.reference)
        .maybeSingle();

      if (!current) return fail(res, 404, 'Booking not found');
      if (current.status === 'awaiting_validation') {
        return res.json({ success: true, alreadyMarked: true, status: current.status });
      }
      if (current.status === 'expired') {
        return fail(res, 409, 'This booking expired before payment was confirmed. Please book again.', { code: 'EXPIRED' });
      }
      return fail(res, 409, 'This booking can no longer be updated', { code: 'WRONG_STATUS' });
    }

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
