// config.js - Dynamic API detection for local vs production
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
export default API_BASE;
