// Dynamic API base - works on desktop and mobile
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'http://' + window.location.hostname + ':5000';

// Token management
let authToken = localStorage.getItem('auth_token');

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken() {
  return authToken;
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers,
      ...options
    });
    
    const data = await response.json();
    
    // Handle unauthorized response
    if (response.status === 401) {
      // Clear invalid token
      setAuthToken(null);
      // Redirect to login if on protected page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/admin') {
        window.location.href = '/login';
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

export const api = {
  // Businesses
  getBusinesses: () => request('/businesses'),
  getBusiness: (id) => request(`/businesses/${id}`),
  getBusinessBySlug: (slug) => request(`/businesses/slug/${slug}`),
  searchBusinesses: (params) => request(`/businesses/search/category?${new URLSearchParams(params)}`),
  registerBusiness: (data) => request('/businesses/register', { method: 'POST', body: JSON.stringify(data) }),
  loginBusiness: async (email, password) => {
    const data = await request('/businesses/login', { 
      method: 'POST', 
      body: JSON.stringify({ email, password }) 
    });
    if (data.token) setAuthToken(data.token);
    return data;
  },
  updateBusiness: (id, data) => request(`/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Rooms
  getRooms: (businessId) => request(`/businesses/${businessId}/rooms`),
  createRoom: (businessId, data) => request(`/businesses/${businessId}/rooms/create`, { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (businessId, roomId, data) => request(`/businesses/${businessId}/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoom: (businessId, roomId) => request(`/businesses/${businessId}/rooms/${roomId}`, { method: 'DELETE' }),

  // Bookings
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getBusinessBookings: (businessId) => request(`/businesses/${businessId}/bookings`),

  // Payments
  createPayment: (data) => request('/create-payment', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data) => request('/verify-payment', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  adminLogin: async (data) => {
    const response = await request('/admin/login', { method: 'POST', body: JSON.stringify(data) });
    if (response.token) setAuthToken(response.token);
    return response;
  },
  adminGetBusinesses: () => request('/admin/businesses'),
  adminUpdateStatus: (id, status) => request(`/admin/businesses/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  adminDeleteBusiness: (id) => request(`/admin/businesses/${id}`, { method: 'DELETE' }),
  adminGetStats: () => request('/admin/stats'),

  // Staff
  staffLogin: (data) => request('/staff/login', { method: 'POST', body: JSON.stringify(data) }),
  getStaff: (businessId) => request(`/businesses/${businessId}/staff`),
  addStaff: (businessId, data) => request(`/businesses/${businessId}/staff`, { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (staffId, data) => request(`/staff/${staffId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStaff: (staffId) => request(`/staff/${staffId}`, { method: 'DELETE' }),

  // Availability
  getOperatingHours: (businessId) => request(`/businesses/${businessId}/operating-hours`),
  updateOperatingHours: (businessId, data) => request(`/businesses/${businessId}/operating-hours`, { method: 'PUT', body: JSON.stringify(data) }),
  getBlockedDates: (businessId) => request(`/businesses/${businessId}/blocked-dates`),
  blockDate: (businessId, data) => request(`/businesses/${businessId}/block-date`, { method: 'POST', body: JSON.stringify(data) }),
  unblockDate: (businessId, date) => request(`/businesses/${businessId}/block-date/${date}`, { method: 'DELETE' }),

  // Domain
  getDomainInfo: (domain) => request(`/domain-info?domain=${domain}`),
  generateVerification: (businessId) => request(`/businesses/${businessId}/generate-verification`, { method: 'POST' }),
  checkVerification: (businessId) => request(`/businesses/${businessId}/check-verification`, { method: 'POST' }),
  
  // Gallery
  getGallery: (businessId) => request(`/businesses/${businessId}/gallery`),
  addGalleryImage: (businessId, data) => request(`/businesses/${businessId}/gallery`, { method: 'POST', body: JSON.stringify(data) }),
  deleteGalleryImage: (businessId, imageId) => request(`/businesses/${businessId}/gallery/${imageId}`, { method: 'DELETE' }),
  reorderGallery: (businessId, imageIds) => request(`/businesses/${businessId}/gallery/reorder`, { method: 'PUT', body: JSON.stringify({ imageIds }) }),
  uploadGalleryImage: (data) => request('/upload-gallery-image', { method: 'POST', body: JSON.stringify(data) }),
  
  // Logout
  logout: () => setAuthToken(null)
};

export default api;