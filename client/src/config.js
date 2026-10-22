// client/src/config.js
// =============================================
// API CONFIGURATION - Production-Ready
// Works on: Local, Mobile, Render
// =============================================

const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

let API_BASE;

// ============================================================
// STEP 1: Environment variable (production override)
// ============================================================
if (import.meta.env.VITE_API_BASE) {
  API_BASE = import.meta.env.VITE_API_BASE;
  console.log('[Config] ✅ Using VITE_API_BASE:', API_BASE);
}
// ============================================================
// STEP 2: Render auto-detection
// ============================================================
else if (hostname.includes('onrender.com') || hostname.includes('render.com')) {
  API_BASE = 'https://booking-backend-clean.onrender.com';
  console.log('[Config] 🚀 Render detected:', API_BASE);
}
// ============================================================
// STEP 3: Mobile local testing
// ============================================================
else if (isMobile && !isLocalhost) {
  API_BASE = `http://${hostname}:5000`;
  console.log('[Config] 📱 Mobile local:', API_BASE);
}
// ============================================================
// STEP 4: Desktop local development
// ============================================================
else {
  API_BASE = 'http://localhost:5000';
  console.log('[Config] 💻 Local development:', API_BASE);
}

console.log('[Config] 📡 Final API_BASE:', API_BASE);

export default API_BASE;