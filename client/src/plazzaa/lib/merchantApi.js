import API_BASE from '../../config';

/**
 * The merchant dashboard's connection to the V1 API.
 *
 * Every call carries the session token the sign-in screen stored, and every
 * failure comes back as a thrown Error with a message worth showing a person —
 * the screens never have to unwrap a response shape themselves.
 */

export const token = () => localStorage.getItem('auth_token') || localStorage.getItem('business_token') || '';

export const currentBusiness = () => {
  try {
    return JSON.parse(localStorage.getItem('currentBusiness') || 'null');
  } catch {
    return null;
  }
};

async function call(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(API_BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token() ? { Authorization: 'Bearer ' + token() } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  } catch {
    throw new Error('Could not reach Plazzaa. Check your connection.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || (data && data.success === false)) {
    const message = (data && data.error) || 'That did not work. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    error.code = data && data.code;
    throw error;
  }

  return data || {};
}

const v1 = (businessId, tail) => `/api/v1/businesses/${businessId}${tail}`;

export const api = {
  // --- overview -----------------------------------------------------------
  setupStatus: (id) => call(v1(id, '/setup-status')),

  // --- services -----------------------------------------------------------
  services: (id) => call(v1(id, '/services')),
  createService: (id, service) => call(v1(id, '/services'), { method: 'POST', body: service }),
  updateService: (id, serviceId, patch) =>
    call(v1(id, `/services/${serviceId}`), { method: 'PUT', body: patch }),
  deleteService: (id, serviceId) =>
    call(v1(id, `/services/${serviceId}`), { method: 'DELETE' }),

  uploadServiceImage: (id, fileName, fileData) =>
    call(v1(id, '/service-image'), { method: 'POST', body: { fileName, fileData } }),

  // --- availability -------------------------------------------------------
  hours: (id) => call(v1(id, '/business-hours')),
  saveHours: (id, hours) => call(v1(id, '/business-hours'), { method: 'PUT', body: { hours } }),
  blockedSlots: (id) => call(v1(id, '/blocked-slots')),
  blockSlot: (id, slot) => call(v1(id, '/blocked-slots'), { method: 'POST', body: slot }),
  unblockSlot: (id, slotId) => call(v1(id, `/blocked-slots/${slotId}`), { method: 'DELETE' }),

  // --- money --------------------------------------------------------------
  bankAccount: (id) => call(v1(id, '/bank-account')),
  saveBankAccount: (id, account) =>
    call(v1(id, '/bank-account'), { method: 'PUT', body: account }),

  // --- bookings -----------------------------------------------------------
  bookings: (id, status) =>
    call(v1(id, '/bookings' + (status ? `?status=${encodeURIComponent(status)}` : ''))),
  validate: (id, reference) =>
    call(v1(id, `/bookings/${reference}/validate`), { method: 'POST' })
};

/** 0 = Monday, matching the API and the dashboard's own week. */
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const naira = (value) =>
  '₦' + Math.round(Number(value) || 0).toLocaleString('en-NG');

/** Booking times are stored as instants; merchants think in local wall clock. */
export const whenParts = (iso) => {
  if (!iso) return { date: '—', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '—', time: '' };
  return {
    date: d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
  };
};

/** The four V1 states, with the tone each one carries in the interface. */
export const STATUS_TONE = {
  payment_pending: { label: 'Payment pending', tone: 'bg-[#FDEEF0] text-[#C0395A]' },
  awaiting_validation: { label: 'Awaiting validation', tone: 'bg-[#FEF8E7] text-[#B0840F]' },
  confirmed: { label: 'Confirmed', tone: 'bg-[#EAF7EF] text-[#1B7F43]' },
  expired: { label: 'Expired', tone: 'bg-plz-surface text-plz-grey' },
  cancelled: { label: 'Cancelled', tone: 'bg-plz-surface text-plz-grey' },
  pending: { label: 'Pending', tone: 'bg-[#FEF8E7] text-[#B0840F]' }
};

export const statusOf = (booking) =>
  STATUS_TONE[booking.status] || { label: booking.status || 'Unknown', tone: 'bg-plz-surface text-plz-grey' };
