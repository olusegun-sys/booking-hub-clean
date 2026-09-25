// FILE: client/src/services/api.js
// FIXED 21 Sept 2026: separate auth scopes for admin vs business
//   - admin login/logout uses 'admin_token'
//   - business login/logout uses 'business_token'
//   - request() picks the right token per route

import API_BASE from '../config';

// ============================================================
// SCOPED TOKEN MANAGEMENT
// ============================================================
// WHY: Admin and business sessions must NOT overwrite each other.
// Previously both wrote to 'auth_token', so logging into one wiped
// the other and caused "session expired" on return visits.
const STORAGE_KEYS = {
  admin: 'admin_token',
  business: 'business_token',
  // Legacy key — read-only fallback for existing sessions mid-migration
  legacy: 'auth_token'
};

// In-memory caches so we don't hit localStorage on every request
let adminToken = localStorage.getItem(STORAGE_KEYS.admin);
let businessToken = localStorage.getItem(STORAGE_KEYS.business) || localStorage.getItem(STORAGE_KEYS.legacy);

// Keep business_token and auth_token synced so Plazzaa V1 merchantApi
// and legacy dashboards both remain authenticated seamlessly.
(function syncTokens() {
  const legacy = localStorage.getItem(STORAGE_KEYS.legacy);
  const biz = localStorage.getItem(STORAGE_KEYS.business);
  if (legacy && !biz) {
    localStorage.setItem(STORAGE_KEYS.business, legacy);
    businessToken = legacy;
  } else if (biz && !legacy) {
    localStorage.setItem(STORAGE_KEYS.legacy, biz);
  }
})();

// ============================================================
// PUBLIC API
// ============================================================
// WHY: setAuthToken now requires a scope. Call sites must specify
// 'admin' or 'business'. This prevents the old bug of one flow
// accidentally clearing the other's session.
export function setAuthToken(token, scope) {
  if (scope !== 'admin' && scope !== 'business') {
    console.warn('[api] setAuthToken called without a valid scope:', scope);
    return;
  }

  const key = STORAGE_KEYS[scope];

  if (token) {
    localStorage.setItem(key, token);
    if (scope === 'admin') adminToken = token;
    if (scope === 'business') {
      businessToken = token;
      localStorage.setItem(STORAGE_KEYS.legacy, token);
    }
  } else {
    localStorage.removeItem(key);
    if (scope === 'admin') adminToken = null;
    if (scope === 'business') {
      businessToken = null;
      localStorage.removeItem(STORAGE_KEYS.legacy);
    }
  }
}

// WHY: readToken(scope) lets a caller fetch a specific scope's token.
// request() below uses this to auto-pick based on the URL.
export function getAuthToken(scope) {
  if (scope === 'admin') return adminToken;
  if (scope === 'business') return businessToken;
  // No scope — return whichever exists (legacy behaviour for old callers)
  return adminToken || businessToken;
}

// WHY: pick the correct token for a given route. Admin routes start
// with '/admin/'; everything else is business-scoped.
function tokenForUrl(url) {
  if (url.startsWith('/admin/')) return adminToken;
  return businessToken;
}

// ============================================================
// CORE REQUEST WRAPPER
// ============================================================
async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // WHY: only attach a token if one exists for the scope this URL
  // belongs to. Prevents sending an admin token to a business route
  // and vice versa.
  const token = tokenForUrl(url);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers,
      ...options
    });

    const data = await response.json();

    // WHY: On 401, only clear the token for the scope this route
    // belongs to — don't nuke the whole session state.
    if (response.status === 401) {
      if (url.startsWith('/admin/')) {
        setAuthToken(null, 'admin');
        // Redirect to admin login only if we're on admin pages
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin';
        }
      } else {
        setAuthToken(null, 'business');
        // Redirect to business login only if we're on business pages
        if (window.location.pathname === '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error(data.error || 'Session expired. Please login again.');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// ============================================================
// PUBLIC API
// ============================================================
export const api = {
  // ---------- Businesses ----------
  getBusinesses: () => request('/businesses'),
  getBusiness: (id) => request(`/businesses/${id}`),
  getBusinessBySlug: (slug) => request(`/businesses/slug/${slug}`),
  searchBusinesses: (params) => request(`/businesses/search/category?${new URLSearchParams(params)}`),
  registerBusiness: (data) => request('/businesses/register', { method: 'POST', body: JSON.stringify(data) }),

  // ---------- Business auth ----------
  loginBusiness: async (email, password) => {
    const data = await request('/businesses/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) setAuthToken(data.token, 'business');
    return data;
  },
  updateBusiness: (id, data) => request(`/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ---------- Rooms ----------
  getRooms: (businessId) => request(`/businesses/${businessId}/rooms`),
  createRoom: (businessId, data) => request(`/businesses/${businessId}/rooms/create`, { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (businessId, roomId, data) => request(`/businesses/${businessId}/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoom: (businessId, roomId) => request(`/businesses/${businessId}/rooms/${roomId}`, { method: 'DELETE' }),

  // ---------- Bookings ----------
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getBusinessBookings: (businessId) => request(`/businesses/${businessId}/bookings`),

  // ---------- Payments ----------
  createPayment: (data) => request('/create-payment', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data) => request('/verify-payment', { method: 'POST', body: JSON.stringify(data) }),

  // ---------- Admin auth ----------
  adminLogin: async (data) => {
    const response = await request('/admin/login', { method: 'POST', body: JSON.stringify(data) });
    if (response.token) setAuthToken(response.token, 'admin');
    return response;
  },
  adminGetBusinesses: () => request('/admin/businesses'),
  adminUpdateStatus: (id, status) => request(`/admin/businesses/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  adminDeleteBusiness: (id) => request(`/admin/businesses/${id}`, { method: 'DELETE' }),
  adminGetStats: () => request('/admin/stats'),

  // ---------- Staff ----------
  staffLogin: (data) => request('/staff/login', { method: 'POST', body: JSON.stringify(data) }),
  getStaff: (businessId) => request(`/businesses/${businessId}/staff`),
  addStaff: (businessId, data) => request(`/businesses/${businessId}/staff`, { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (staffId, data) => request(`/staff/${staffId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStaff: (staffId) => request(`/staff/${staffId}`, { method: 'DELETE' }),

  // ---------- Availability ----------
  getOperatingHours: (businessId) => request(`/businesses/${businessId}/operating-hours`),
  updateOperatingHours: (businessId, data) => request(`/businesses/${businessId}/operating-hours`, { method: 'PUT', body: JSON.stringify(data) }),
  getBlockedDates: (businessId) => request(`/businesses/${businessId}/blocked-dates`),
  blockDate: (businessId, data) => request(`/businesses/${businessId}/block-date`, { method: 'POST', body: JSON.stringify(data) }),
  unblockDate: (businessId, date) => request(`/businesses/${businessId}/block-date/${date}`, { method: 'DELETE' }),

  // ---------- Domain ----------
  getDomainInfo: (domain) => request(`/domain-info?domain=${domain}`),
  generateVerification: (businessId) => request(`/businesses/${businessId}/generate-verification`, { method: 'POST' }),
  checkVerification: (businessId) => request(`/businesses/${businessId}/check-verification`, { method: 'POST' }),

  // ---------- Gallery ----------
  getGallery: (businessId) => request(`/businesses/${businessId}/gallery`),
  addGalleryImage: (businessId, data) => request(`/businesses/${businessId}/gallery`, { method: 'POST', body: JSON.stringify(data) }),
  deleteGalleryImage: (businessId, imageId) => request(`/businesses/${businessId}/gallery/${imageId}`, { method: 'DELETE' }),
  reorderGallery: (businessId, imageIds) => request(`/businesses/${businessId}/gallery/reorder`, { method: 'PUT', body: JSON.stringify({ imageIds }) }),
  uploadGalleryImage: (data) => request('/upload-gallery-image', { method: 'POST', body: JSON.stringify(data) }),

  // ---------- Logout (scoped) ----------
  // WHY: callers must now say which session they're ending so we
  // don't accidentally wipe the other session.
  logout: (scope) => setAuthToken(null, scope || 'business'),

  // Convenience helpers for call sites that want to be explicit
  logoutAdmin: () => setAuthToken(null, 'admin'),
  logoutBusiness: () => setAuthToken(null, 'business')
};

export default api;