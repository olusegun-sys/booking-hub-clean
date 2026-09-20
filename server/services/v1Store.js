'use strict';

/**
 * Storage for the Plazzaa V1 entities.
 *
 * V1 was designed around three new tables — services, bank_accounts, and a set
 * of booking lifecycle columns — created by plazzaa_v1_migration.sql. That
 * migration has not been applied to this project, and DDL cannot be issued
 * through PostgREST, so every V1 screen was failing against tables that do not
 * exist.
 *
 * This module removes that dependency. It probes once for the real tables and
 * uses them when they are there. When they are not, it stores the same data in
 * the tables that do exist, under a namespace that cannot collide with the
 * legacy Booking Hub rows:
 *
 *   services       -> rooms, where type = 'plazzaa_service'
 *   bank account   -> rooms, where type = 'plazzaa_bank_account' (one per business)
 *   booking times  -> bookings.payment_reference, a small JSON envelope, because
 *                     bookings has only check_in_date (a date) and V1 needs the
 *                     time of day as well
 *
 * Running the migration later is therefore safe and needs no code change: the
 * probe starts returning true and the native paths take over. The fallback rows
 * are all identifiable by their type prefix if they ever need migrating across.
 */

const SERVICE_TYPE = 'plazzaa_service';
const BANK_TYPE = 'plazzaa_bank_account';

const ACTIVE_STATUSES = ['payment_pending', 'awaiting_validation', 'confirmed'];

/* --------------------------------------------------------------- shaping */

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'service';
}

/** A rooms row, read as the service it is standing in for. */
function roomToService(row) {
  if (!row) return null;
  const meta = (row.features && row.features.plazzaa) || {};
  return {
    id: row.id,
    business_id: row.business_id,
    name: row.name,
    description: row.description || null,
    price: Number(row.base_price) || 0,
    duration_minutes: Number(meta.duration_minutes) || 60,
    capacity: Number(row.capacity) || 1,
    slug: meta.slug || slugify(row.name),
    is_active: row.status !== 'inactive',
    created_at: row.created_at,
    updated_at: meta.updated_at || row.created_at
  };
}

function serviceToRoom(businessId, service, slug) {
  return {
    business_id: businessId,
    type: SERVICE_TYPE,
    name: service.name,
    description: service.description || null,
    base_price: service.price,
    capacity: service.capacity,
    status: service.is_active === false ? 'inactive' : 'active',
    features: {
      plazzaa: {
        duration_minutes: service.duration_minutes,
        slug: slug,
        updated_at: new Date().toISOString()
      }
    }
  };
}

/** The V1 lifecycle fields, packed into the one spare text column. */
function packMeta(fields) {
  return JSON.stringify({
    s: fields.start_datetime || null,
    e: fields.end_datetime || null,
    x: fields.expires_at || null,
    p: fields.payment_marked_at || null,
    v: fields.validated_at || null
  });
}

function readMeta(row) {
  if (!row || !row.payment_reference) return {};
  try {
    const parsed = JSON.parse(row.payment_reference);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};   // a legacy payment reference, not one of ours
  }
}

function bookingOut(row) {
  if (!row) return null;
  const meta = readMeta(row);
  return {
    id: row.id,
    booking_reference: row.booking_reference,
    business_id: row.business_id,
    service_id: row.room_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    customer_whatsapp: row.customer_phone,
    start_datetime: meta.s || (row.check_in_date ? row.check_in_date + 'T00:00:00.000Z' : null),
    end_datetime: meta.e || null,
    total_amount: Number(row.total_amount) || 0,
    status: row.status,
    special_requests: row.special_requests || null,
    expires_at: meta.x || null,
    payment_marked_at: meta.p || null,
    validated_at: meta.v || null,
    created_at: row.created_at,
    services: row.services || null
  };
}


/**
 * Blocked slots.
 *
 * The legacy `availability` table stores a date plus two times, and has no
 * service_id. V1 wants instants and an optional service. The date and times
 * carry the instant; the service id rides in `reason` as a small JSON envelope,
 * which also keeps the merchant's own note.
 */
function packReason(serviceId, note) {
  if (!serviceId) return note || null;
  return JSON.stringify({ svc: serviceId, note: note || null });
}

function readReason(value) {
  if (!value) return { service_id: null, reason: null };
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && parsed.svc) {
      return { service_id: parsed.svc, reason: parsed.note || null };
    }
  } catch { /* a plain note */ }
  return { service_id: null, reason: value };
}

function blockedOut(row) {
  if (!row) return null;
  const { service_id, reason } = readReason(row.reason);
  const date = row.date;
  const iso = (t) => (date && t ? new Date(date + 'T' + String(t).slice(0, 8) + 'Z').toISOString() : null);
  return {
    id: row.id,
    business_id: row.business_id,
    service_id: row.service_id || service_id,
    start_datetime: row.start_datetime || iso(row.start_time),
    end_datetime: row.end_datetime || iso(row.end_time),
    reason: reason,
    is_available: false
  };
}

/* ----------------------------------------------------------------- store */

module.exports = function createV1Store(supabase) {
  let native = null;   // null until probed, then true/false

  /** One probe, cached. A missing table answers PGRST205. */
  async function usingNativeTables() {
    if (native !== null) return native;
    const { error } = await supabase.from('services').select('id').limit(1);
    native = !(error && (error.code === 'PGRST205' || /schema cache/i.test(error.message || '')));
    if (!native) {
      console.log('[plazzaa v1] services table not found — using the compatibility layer over `rooms`.');
    }
    return native;
  }

  /* ------------------------------------------------------------ services */

  async function listServices(businessId, options) {
    const activeOnly = options && options.activeOnly;

    if (await usingNativeTables()) {
      let q = supabase.from('services').select('*').eq('business_id', businessId);
      if (activeOnly) q = q.eq('is_active', true);
      const { data, error } = await q.order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }

    let q = supabase
      .from('rooms')
      .select('*')
      .eq('business_id', businessId)
      .eq('type', SERVICE_TYPE);
    if (activeOnly) q = q.eq('status', 'active');
    const { data, error } = await q.order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(roomToService);
  }

  async function getService(businessId, serviceId) {
    const all = await listServices(businessId);
    return all.find((s) => String(s.id) === String(serviceId)) || null;
  }

  async function getServiceBySlug(businessId, slug, options) {
    const all = await listServices(businessId, options);
    return all.find((s) => s.slug === slug) || null;
  }

  async function uniqueSlug(businessId, name, ignoreId) {
    const base = slugify(name);
    const taken = (await listServices(businessId))
      .filter((s) => String(s.id) !== String(ignoreId))
      .map((s) => s.slug);
    if (!taken.includes(base)) return base;
    let n = 2;
    while (taken.includes(base + '-' + n)) n += 1;
    return base + '-' + n;
  }

  async function createService(businessId, service) {
    const slug = await uniqueSlug(businessId, service.name);

    if (await usingNativeTables()) {
      const { data, error } = await supabase
        .from('services')
        .insert({ business_id: businessId, ...service, slug: slug })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert(serviceToRoom(businessId, service, slug))
      .select('*')
      .single();
    if (error) throw error;
    return roomToService(data);
  }

  async function updateService(businessId, serviceId, patch) {
    const current = await getService(businessId, serviceId);
    if (!current) return null;

    const slug = patch.name !== undefined
      ? await uniqueSlug(businessId, patch.name, serviceId)
      : current.slug;

    if (await usingNativeTables()) {
      const { data, error } = await supabase
        .from('services')
        .update({ ...patch, slug: slug, updated_at: new Date().toISOString() })
        .eq('id', serviceId)
        .eq('business_id', businessId)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    }

    const merged = { ...current, ...patch };
    const roomPatch = {
      name: merged.name,
      description: merged.description || null,
      base_price: merged.price,
      capacity: merged.capacity,
      status: merged.is_active === false ? 'inactive' : 'active',
      features: {
        plazzaa: {
          duration_minutes: merged.duration_minutes,
          slug: slug,
          updated_at: new Date().toISOString()
        }
      }
    };

    const { data, error } = await supabase
      .from('rooms')
      .update(roomPatch)
      .eq('id', serviceId)
      .eq('business_id', businessId)
      .eq('type', SERVICE_TYPE)
      .select('*')
      .single();
    if (error) throw error;
    return roomToService(data);
  }

  /** Services with bookings are deactivated rather than deleted. */
  async function deleteService(businessId, serviceId) {
    const column = (await usingNativeTables()) ? 'service_id' : 'room_id';
    const { data: used, error: usedError } = await supabase
      .from('bookings')
      .select('id')
      .eq(column, serviceId)
      .limit(1);
    if (usedError) throw usedError;

    if (used && used.length) {
      const service = await updateService(businessId, serviceId, { is_active: false });
      return { deactivated: true, service: service };
    }

    const table = (await usingNativeTables()) ? 'services' : 'rooms';
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', serviceId)
      .eq('business_id', businessId);
    if (error) throw error;
    return { deleted: true };
  }

  /* -------------------------------------------------------- bank account */

  async function getBankAccount(businessId) {
    if (await usingNativeTables()) {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('bank_name, account_number, account_name, updated_at')
        .eq('business_id', businessId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    const { data, error } = await supabase
      .from('rooms')
      .select('features')
      .eq('business_id', businessId)
      .eq('type', BANK_TYPE)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return (data && data.features && data.features.plazzaa_bank) || null;
  }

  async function saveBankAccount(businessId, account) {
    const record = { ...account, updated_at: new Date().toISOString() };

    if (await usingNativeTables()) {
      const { data, error } = await supabase
        .from('bank_accounts')
        .upsert({ business_id: businessId, ...record }, { onConflict: 'business_id' })
        .select('bank_name, account_number, account_name, updated_at')
        .single();
      if (error) throw error;
      return data;
    }

    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('business_id', businessId)
      .eq('type', BANK_TYPE)
      .maybeSingle();

    const row = {
      business_id: businessId,
      type: BANK_TYPE,
      name: account.bank_name,
      description: account.account_name,
      capacity: 1,
      base_price: 0,
      status: 'inactive',           // never offered as something bookable
      features: { plazzaa_bank: record }
    };

    const query = existing
      ? supabase.from('rooms').update(row).eq('id', existing.id)
      : supabase.from('rooms').insert(row);

    const { error } = await query;
    if (error) throw error;
    return record;
  }


  /* ------------------------------------------------------- blocked slots */

  async function listBlockedSlots(businessId, range) {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_available', false);
    if (error) throw error;

    let rows = (data || []).map(blockedOut).filter((r) => r && r.start_datetime);
    if (range && range.from) {
      const from = new Date(range.from).getTime();
      rows = rows.filter((r) => new Date(r.start_datetime).getTime() >= from);
    }
    if (range && range.to) {
      const to = new Date(range.to).getTime();
      rows = rows.filter((r) => new Date(r.start_datetime).getTime() <= to);
    }
    return rows.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
  }

  async function blockSlot(businessId, slot) {
    const start = new Date(slot.start_datetime);
    const end = new Date(slot.end_datetime);

    const { data, error } = await supabase
      .from('availability')
      .insert({
        business_id: businessId,
        date: start.toISOString().slice(0, 10),
        start_time: start.toISOString().slice(11, 19),
        end_time: end.toISOString().slice(11, 19),
        is_available: false,
        reason: packReason(slot.service_id, slot.reason)
      })
      .select('*')
      .single();
    if (error) throw error;
    return blockedOut(data);
  }

  async function unblockSlot(businessId, id) {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);
    if (error) throw error;
    return { deleted: true };
  }

  /* ------------------------------------------------------------ bookings */

  /** Releases holds whose payment window has passed. */
  async function expireStale() {
    if (await usingNativeTables()) {
      const { error } = await supabase.rpc('expire_stale_bookings');
      if (!error) return;
      // fall through to the manual sweep if the function is not installed
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('id, status, payment_reference')
      .eq('status', 'payment_pending');
    if (error) return;

    const now = Date.now();
    const stale = (data || []).filter((row) => {
      const x = readMeta(row).x;
      return x && new Date(x).getTime() < now;
    });

    for (const row of stale) {
      await supabase.from('bookings').update({ status: 'expired' }).eq('id', row.id);
    }
  }

  async function attachServices(bookings, businessId) {
    if (!bookings.length) return bookings;
    const services = await listServices(businessId);
    const byId = new Map(services.map((s) => [String(s.id), s]));
    return bookings.map((b) => ({
      ...b,
      services: byId.has(String(b.service_id))
        ? (({ id, name, duration_minutes, price }) => ({ id, name, duration_minutes, price }))(byId.get(String(b.service_id)))
        : null
    }));
  }

  async function listBookings(businessId, filters) {
    await expireStale();
    const f = filters || {};

    let q = supabase.from('bookings').select('*').eq('business_id', businessId);
    if (f.status) q = q.in('status', String(f.status).split(','));

    const { data, error } = await q.order('created_at', { ascending: false }).limit(f.limit || 200);
    if (error) throw error;

    const rows = (data || []).map(bookingOut)
      .sort((a, b) => new Date(b.start_datetime || 0) - new Date(a.start_datetime || 0));
    return attachServices(rows, businessId);
  }

  async function bookingsForService(serviceId, fromIso, toIso) {
    const column = (await usingNativeTables()) ? 'service_id' : 'room_id';
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq(column, serviceId)
      .in('status', ACTIVE_STATUSES);
    if (error) throw error;

    const from = new Date(fromIso).getTime();
    const to = new Date(toIso).getTime();
    return (data || [])
      .map(bookingOut)
      .filter((b) => {
        if (!b.start_datetime) return false;
        const t = new Date(b.start_datetime).getTime();
        return t >= from && t <= to;
      })
      .map((b) => ({ start_datetime: b.start_datetime, status: b.status }));
  }

  async function getBookingByReference(reference) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_reference', reference)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    const booking = bookingOut(data);
    const services = await listServices(booking.business_id);
    const match = services.find((s) => String(s.id) === String(booking.service_id));
    booking.services = match
      ? { id: match.id, name: match.name, duration_minutes: match.duration_minutes, price: match.price }
      : null;
    return booking;
  }

  function reference() {
    return 'PLZ-' + Date.now().toString(36).toUpperCase() +
      '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  /**
   * Holds a slot.
   *
   * The migration's version took an advisory lock so two people racing for the
   * last space could not both win. Without it, this re-checks capacity as late
   * as it can and then inserts — which closes the window to milliseconds but
   * does not eliminate it. Worth knowing for a service with capacity 1 and
   * heavy concurrent traffic; the merchant still validates every payment by
   * hand, so a double-book surfaces before anyone is charged.
   */
  async function createBooking(input) {
    await expireStale();

    const start = new Date(input.start_datetime);
    const end = new Date(start.getTime() + input.service.duration_minutes * 60000);

    const taken = await bookingsForService(
      input.service.id,
      new Date(start.getTime() - 1000).toISOString(),
      new Date(start.getTime() + 1000).toISOString()
    );
    if (taken.length >= (input.service.capacity || 1)) {
      const error = new Error('That time has just been taken. Please choose another slot.');
      error.status = 409;
      throw error;
    }

    const holdMinutes = input.holdMinutes || 30;
    const expiresAt = new Date(Date.now() + holdMinutes * 60000).toISOString();
    const dateOnly = start.toISOString().slice(0, 10);

    const row = {
      business_id: input.business.id,
      booking_reference: reference(),
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_whatsapp,
      total_amount: input.service.price,
      status: 'payment_pending',
      special_requests: input.special_requests || null
    };

    if (await usingNativeTables()) {
      Object.assign(row, {
        service_id: input.service.id,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        customer_whatsapp: input.customer_whatsapp,
        expires_at: expiresAt
      });
    } else {
      Object.assign(row, {
        room_id: input.service.id,
        check_in_date: dateOnly,
        check_out_date: dateOnly,
        number_of_guests: 1,          // NOT NULL on the legacy table
        payment_status: 'unpaid',
        payment_reference: packMeta({
          start_datetime: start.toISOString(),
          end_datetime: end.toISOString(),
          expires_at: expiresAt
        })
      });
    }

    const { data, error } = await supabase.from('bookings').insert(row).select('*').single();
    if (error) throw error;

    const booking = bookingOut(data);
    booking.services = {
      id: input.service.id,
      name: input.service.name,
      duration_minutes: input.service.duration_minutes,
      price: input.service.price
    };
    return booking;
  }

  /** Moves a held booking to "the customer says they have paid". */
  async function markPaid(reference_) {
    const booking = await getBookingByReference(reference_);
    if (!booking) return { notFound: true };
    if (booking.status === 'awaiting_validation' || booking.status === 'confirmed') {
      return { alreadyMarked: true, booking: booking };
    }
    if (booking.status !== 'payment_pending') {
      return { invalid: true, booking: booking };
    }

    const patch = { status: 'awaiting_validation' };
    if (await usingNativeTables()) {
      patch.payment_marked_at = new Date().toISOString();
    } else {
      patch.payment_status = 'reported';
      patch.payment_reference = packMeta({
        start_datetime: booking.start_datetime,
        end_datetime: booking.end_datetime,
        expires_at: booking.expires_at,
        payment_marked_at: new Date().toISOString()
      });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(patch)
      .eq('booking_reference', reference_)
      .select('*')
      .single();
    if (error) throw error;
    return { booking: bookingOut(data) };
  }

  /** The merchant confirms the transfer landed. */
  async function validateBooking(businessId, reference_) {
    const booking = await getBookingByReference(reference_);
    if (!booking) return { notFound: true };
    if (String(booking.business_id) !== String(businessId)) return { notFound: true };
    if (booking.status === 'confirmed') return { alreadyConfirmed: true, booking: booking };
    if (booking.status !== 'awaiting_validation' && booking.status !== 'payment_pending') {
      return { invalid: true, booking: booking };
    }

    const patch = { status: 'confirmed' };
    if (await usingNativeTables()) {
      patch.validated_at = new Date().toISOString();
    } else {
      patch.payment_status = 'paid';
      patch.payment_reference = packMeta({
        start_datetime: booking.start_datetime,
        end_datetime: booking.end_datetime,
        expires_at: booking.expires_at,
        payment_marked_at: booking.payment_marked_at,
        validated_at: new Date().toISOString()
      });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(patch)
      .eq('booking_reference', reference_)
      .select('*')
      .single();
    if (error) throw error;
    return { booking: bookingOut(data) };
  }

  return {
    usingNativeTables,
    listServices, getService, getServiceBySlug, createService, updateService, deleteService,
    getBankAccount, saveBankAccount,
    listBlockedSlots, blockSlot, unblockSlot,
    expireStale, listBookings, bookingsForService, getBookingByReference,
    createBooking, markPaid, validateBooking
  };
};
