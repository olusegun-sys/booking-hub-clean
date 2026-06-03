// config.js - Dynamic API detection for local vs production
const API_BASE = (() => {
  // Use environment variable if set (for production builds)
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // Auto-detect based on hostname
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Production - use HTTPS
  return 'https://booking-backend-clean.onrender.com';
})();

export default API_BASE;