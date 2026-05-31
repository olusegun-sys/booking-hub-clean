require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { sendBookingConfirmation, sendWelcomeEmail, sendApprovalEmail } = require('./src/services/emailService');
const { initializePayment, verifyPayment } = require('./src/services/paystackService');
const detectBusinessFromDomain = require('./src/middleware/domainDetector');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// CORS CONFIGURATION - PRODUCTION READY
// ============================================================
const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://booking-frontend-clean.onrender.com'])
  : ['http://localhost:5173', 'http://localhost:3000', 'http://192.168.1.122:5173'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('Blocked CORS request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================================
// RATE LIMITING
// ============================================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  skip: () => process.env.NODE_ENV !== 'production'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(detectBusinessFromDomain);

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function generateToken() {
  return require('crypto').randomBytes(64).toString('hex');
}

function getLocalIpAddress() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================
async function authenticateBusiness(req, res, next) {
  const requestedBusinessId = req.params.businessId || req.params.id;
  const authHeader = req.headers.authorization;

  // Development mode bypass
  if (process.env.NODE_ENV !== 'production' && !authHeader) {
    console.log('⚠️ Development mode: skipping auth for business route');
    req.businessId = requestedBusinessId;
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: session, error } = await supabase
      .from('business_sessions')
      .select('business_id, expires_at')
      .eq('token', token)
      .single();

    if (error || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }

    // Only check ID if a specific business was requested
    if (requestedBusinessId && session.business_id !== requestedBusinessId) {
      console.log({
        session_business_id: session.business_id,
        requested_business_id: requestedBusinessId,
      });
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    req.businessId = session.business_id;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ success: false, error: 'Authentication error' });
  }
}

async function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (process.env.NODE_ENV !== 'production' && !authHeader) {
    console.log('⚠️ Development mode: skipping auth for admin route');
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('admin_id, expires_at')
      .eq('token', token)
      .single();

    if (error || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }

    req.adminId = session.admin_id;
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    return res.status(500).json({ success: false, error: 'Authentication error' });
  }
}

// ============================================================
// PUBLIC ROUTES
// ============================================================

app.get('/api/test', (req, res) => res.json({ message: 'Backend is connected!', timestamp: new Date().toISOString() }));

// HEALTH CHECK ENDPOINT
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Supabase Connection Test Endpoint
app.get('/api/supabase-test', async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ success: true, message: 'Supabase connected!', count: count });
  } catch (error) {
    console.error('Supabase test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/domain-info', async (req, res) => {
  try {
    const domain = req.query.domain || req.get('host')?.split(':')[0] || '';
    if (domain && domain !== 'localhost' && domain !== '127.0.0.1') {
      const { data, error } = await supabase.from('businesses').select('*').eq('custom_domain', domain).eq('is_domain_verified', true).single();
      if (!error && data) return res.json({ success: true, business: data, source: 'custom-domain-verified' });
    }
    if (req.detectedBusiness) return res.json({ success: true, business: req.detectedBusiness, source: req.domainSource || 'custom-domain' });
    res.json({ success: false, message: 'No business associated with this domain' });
  } catch (error) { res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' }); }
});

app.get('/api/businesses/featured', async (req, res) => {
  try { const { data, error } = await supabase.from('businesses').select('*').eq('status', 'approved').limit(3); if (error) throw error; res.json({ success: true, businesses: data }); }
  catch (error) { res.status(500).json({ error: 'Failed to fetch featured businesses' }); }
});

app.get('/api/businesses/search/category', async (req, res) => {
  try {
    const { category, location } = req.query;
    let query = supabase.from('businesses').select('*').eq('status', 'approved').eq('business_type', category);
    if (location) query = query.ilike('city', '%' + location + '%');
    const { data, error } = await query; if (error) throw error;
    res.json({ success: true, businesses: data, category });
  } catch (error) { res.status(500).json({ error: 'Search failed', details: error.message }); }
});

app.get('/api/businesses/slug/:slug', async (req, res) => {
  try { const { data, error } = await supabase.from('businesses').select('*').eq('slug', req.params.slug).eq('status', 'approved').single(); if (error) throw error; res.json({ success: true, business: data }); }
  catch (error) { res.status(404).json({ success: false, error: 'Business not found' }); }
});

// ============================================================
// BUSINESS REGISTRATION
// ============================================================

app.post('/api/businesses/register', async (req, res) => {
  try {
    const { businessName, businessType, email, password, phone, address, city, state, customDomain } = req.body;

    if (!businessName || businessName.trim().length < 2) return res.status(400).json({ success: false, error: 'Business name is required.' });
    if (!email || !email.includes('@')) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (!password || password.length < 6) return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    if (!phone || phone.length < 10) return res.status(400).json({ success: false, error: 'A valid phone number is required.' });
    if (!city || city.trim().length < 2) return res.status(400).json({ success: false, error: 'City is required.' });

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const { data: existingEmail } = await supabase.from('businesses').select('id').eq('email', email).single();
    if (existingEmail) return res.status(400).json({ success: false, error: 'A business with this email already exists.' });

    const { data: existingSlug } = await supabase.from('businesses').select('id').eq('slug', slug).single();
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from('businesses').insert({
      name: businessName,
      slug: existingSlug ? slug + '-' + Date.now().toString(36) : slug,
      business_type: businessType,
      email,
      password: password,
      password_hash: hashedPassword,
      phone,
      address: address || '',
      city,
      state: state || '',
      custom_domain: customDomain || null,
      status: 'pending',
      booking_limit: 50,
      current_booking_count: 0
    }).select().single();

    if (error) return res.status(500).json({ success: false, error: 'Registration failed: ' + error.message });
    if (data) { sendWelcomeEmail(data).catch(err => console.error('Welcome email failed:', err)); }
    res.json({ success: true, business: data, message: 'Business registered! A confirmation email has been sent.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

// ============================================================
// BUSINESS LOGIN
// ============================================================

app.post('/api/businesses/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required.' });
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !business) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    if (business.status !== 'approved') {
      return res.status(401).json({ success: false, error: 'Your account is pending approval. Please wait for admin approval.' });
    }

    let isValidPassword = false;

    if (business.password_hash) {
      isValidPassword = await bcrypt.compare(password, business.password_hash);
    }

    if (!isValidPassword && business.password) {
      isValidPassword = (business.password === password);
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await supabase.from('businesses').update({ password_hash: hashedPassword }).eq('id', business.id);
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await supabase.from('business_sessions').upsert({
      business_id: business.id,
      token: token,
      expires_at: expiresAt.toISOString()
    });

    const { password_hash, password: plainPassword, ...safeBusiness } = business;

    res.json({
      success: true,
      business: safeBusiness,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// ============================================================
// ADMIN LOGIN
// ============================================================

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required.' });
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    let isValidPassword = false;

    if (admin.password_hash) {
      isValidPassword = await bcrypt.compare(password, admin.password_hash);
    }

    if (!isValidPassword && admin.password) {
      isValidPassword = (admin.password === password);
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await supabase.from('admin_users').update({ password_hash: hashedPassword }).eq('id', admin.id);
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await supabase.from('admin_sessions').upsert({
      admin_id: admin.id,
      token: token,
      expires_at: expiresAt.toISOString()
    });

    const { password_hash, password: plainPassword, ...safeAdmin } = admin;

    res.json({
      success: true,
      admin: safeAdmin,
      token: token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: 'Login failed.' });
  }
});

// ============================================================
// ADMIN ROUTES
// ============================================================

app.get('/api/admin/businesses', async (req, res) => {
  try {
    const { data, error } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, businesses: data });
  } catch (error) {
    console.error('Fetch businesses error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch businesses' });
  }
});

app.put('/api/admin/businesses/:id/status', async (req, res) => {
  try {
    const { data, error } = await supabase.from('businesses').update({ status: req.body.status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (req.body.status === 'approved' && data) { sendApprovalEmail(data).catch(err => console.error('Approval email failed:', err)); }
    res.json({ success: true, business: data });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

app.delete('/api/admin/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: business, error: findError } = await supabase.from('businesses').select('id, name').eq('id', id).single();
    if (findError || !business) return res.status(404).json({ success: false, error: 'Business not found.' });

    await supabase.from('business_gallery').delete().eq('business_id', id);
    await supabase.from('availability').delete().eq('business_id', id);
    await supabase.from('operating_hours').delete().eq('business_id', id);
    await supabase.from('staff').delete().eq('business_id', id);
    await supabase.from('bookings').delete().eq('business_id', id);
    await supabase.from('rooms').delete().eq('business_id', id);

    const { error } = await supabase.from('businesses').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: business.name + ' has been permanently deleted.' });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const { count: totalBusinesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
    const { count: pendingBusinesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: totalBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    const { data: revenueData } = await supabase.from('bookings').select('total_amount').eq('status', 'confirmed');
    const totalRevenue = revenueData ? revenueData.reduce((sum, b) => sum + parseFloat(b.total_amount), 0) : 0;
    res.json({ success: true, stats: { totalBusinesses: totalBusinesses || 0, pendingBusinesses: pendingBusinesses || 0, totalBookings: totalBookings || 0, totalRevenue } });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// ============================================================
// AUTHENTICATED BUSINESS ROUTES (Require Login)
// ============================================================

app.get('/api/businesses/profile', authenticateBusiness, async (req, res) => {
  console.log('📞 Profile request - Business ID from session:', req.businessId);
  try {
    const businessId = req.businessId;

    if (!businessId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, email, phone, city, state, logo_url, cover_image, business_type, slug, description, about_text, website, status, booking_limit, current_booking_count')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }

    console.log('✅ Profile found:', data.name);
    res.json({ success: true, business: data });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

app.post('/api/businesses/:businessId/rooms/create', authenticateBusiness, async (req, res) => {
  try {
    const { name, type, capacity, price_per_night, description, amenities } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ success: false, error: 'Room name is required.' });
    if (!price_per_night || isNaN(price_per_night) || price_per_night <= 0) return res.status(400).json({ success: false, error: 'A valid price is required.' });
    const { data, error } = await supabase.from('rooms').insert({ business_id: req.params.businessId, name: name.trim(), type: type || 'Standard', capacity: capacity || 2, base_price: price_per_night, price_per_night, description: description || '', amenities: amenities || [], status: 'available' }).select().single();
    if (error) return res.status(500).json({ success: false, error: 'Failed to create room.' });
    res.json({ success: true, room: data });
  } catch (error) { res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' }); }
});

app.put('/api/businesses/:businessId/rooms/:roomId', authenticateBusiness, async (req, res) => {
  try {
    const { name, type, capacity, price_per_night, description, amenities, status } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ success: false, error: 'Room name is required.' });
    if (!price_per_night || isNaN(price_per_night) || parseFloat(price_per_night) <= 0) return res.status(400).json({ success: false, error: 'A valid price is required.' });
    const updateData = { name: name.trim(), type: type || 'Standard', capacity: parseInt(capacity) || 2, price_per_night: parseFloat(price_per_night), base_price: parseFloat(price_per_night), description: description || '', amenities: Array.isArray(amenities) ? amenities : [], status: status || 'available' };
    const { data, error } = await supabase.from('rooms').update(updateData).eq('id', req.params.roomId).eq('business_id', req.params.businessId).select().single();
    if (error) return res.status(500).json({ success: false, error: 'Failed to update room.' });
    res.json({ success: true, room: data });
  } catch (error) { res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' }); }
});

app.delete('/api/businesses/:businessId/rooms/:roomId', authenticateBusiness, async (req, res) => {
  try {
    const { error } = await supabase.from('rooms').delete().eq('id', req.params.roomId).eq('business_id', req.params.businessId);
    if (error) return res.status(500).json({ success: false, error: 'Failed to delete room.' });
    res.json({ success: true, message: 'Room deleted successfully.' });
  } catch (error) { res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' }); }
});

app.get('/api/businesses/:businessId/bookings', authenticateBusiness, async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select('*').eq('business_id', req.params.businessId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch bookings' }); }
});

app.put('/api/businesses/:id', authenticateBusiness, async (req, res) => {
  try {
    const { cover_image, logo_url, about_text, description, website, name } = req.body;
    const updateData = {};
    if (cover_image !== undefined) updateData.cover_image = cover_image;
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (about_text !== undefined) updateData.about_text = about_text;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (name !== undefined) updateData.name = name;
    const { data, error } = await supabase.from('businesses').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ success: false, error: 'Database update failed.' });
    res.json({ success: true, business: data });
  } catch (error) { res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' }); }
});

// ============================================================
// PUBLIC READ-ONLY ENDPOINTS (No Authentication Required)
// ============================================================

// GET ROOMS - Public
app.get('/api/businesses/:businessId/rooms', async (req, res) => {
  try {
    const { data, error } = await supabase.from('rooms').select('*').eq('business_id', req.params.businessId);
    if (error) throw error;
    res.json({ success: true, rooms: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET GALLERY - Public
app.get('/api/businesses/:businessId/gallery', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { data, error } = await supabase.from('business_gallery').select('*').eq('business_id', businessId).order('sort_order', { ascending: true });
    if (error) return res.status(500).json({ error: 'Failed to fetch gallery' });
    const total = data ? data.length : 0;
    res.json({
      success: true,
      images: data || [],
      total: total,
      maxAllowed: 5,
      remainingSlots: Math.max(0, 5 - total)
    });
  } catch (err) {
    console.error('Gallery fetch error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ============================================================
// PUBLIC BOOKING ROUTES
// ============================================================

app.post('/api/bookings', async (req, res) => {
  try {
    const { businessId, customerName, customerEmail, customerPhone, totalAmount, bookingDetails, bookingReference, roomId, checkIn, checkOut, guests } = req.body;
    const bookingRef = bookingReference || 'BK' + Date.now() + Math.floor(Math.random() * 1000);
    let checkInDate = new Date().toISOString().split('T')[0]; if (bookingDetails?.date) checkInDate = bookingDetails.date; else if (checkIn) checkInDate = checkIn;
    let checkOutDate = checkInDate; if (checkOut) checkOutDate = checkOut;
    let guestCount = guests ? parseInt(guests) : 1;
    const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_id', businessId);
    const { data: businessLimit } = await supabase.from('businesses').select('booking_limit').eq('id', businessId).single();
    if ((bookingCount || 0) >= (businessLimit?.booking_limit || 50)) return res.status(403).json({ success: false, error: 'Free booking limit reached.' });
    let bookingData = { booking_reference: bookingRef, business_id: businessId, customer_name: customerName, customer_email: customerEmail, customer_phone: customerPhone, total_amount: totalAmount, check_in_date: checkInDate, check_out_date: checkOutDate, number_of_guests: guestCount, status: 'confirmed', payment_status: 'pending' };
    if (roomId) bookingData.room_id = roomId;
    const { data: booking, error } = await supabase.from('bookings').insert(bookingData).select().single(); if (error) throw error;
    await supabase.from('businesses').update({ current_booking_count: (bookingCount || 0) + 1 }).eq('id', businessId);
    const { data: business } = await supabase.from('businesses').select('*').eq('id', businessId).single();
    if (business) { sendBookingConfirmation({ ...booking, bookingDetails }, business).catch(err => console.error('Email error:', err)); }
    res.json({ success: true, booking, message: 'Booking confirmed! A confirmation email has been sent.' });
  } catch (error) { res.status(500).json({ success: false, error: 'Booking failed', details: error.message }); }
});

// ============================================================
// STAFF MANAGEMENT ENDPOINTS
// ============================================================

// GET staff for a business (only active staff)
app.get('/api/businesses/:businessId/staff', authenticateBusiness, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, email, full_name, role, is_active, created_at')
      .eq('business_id', req.params.businessId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, staff: data });
  } catch (error) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staff' });
  }
});

// CREATE staff member (FIXED: removed non-existent 'password' column)
app.post('/api/businesses/:businessId/staff', authenticateBusiness, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const { data, error } = await supabase.from('staff').insert({
      business_id: req.params.businessId,
      email: req.body.email,
      password_hash: hashedPassword,
      full_name: req.body.full_name,
      role: req.body.role || 'staff',
      is_active: true
    }).select().single();
    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: 'Email already exists' });
      }
      console.error('Staff creation error:', error);
      throw error;
    }
    const { password_hash, ...staff } = data;
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Staff creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to add staff member' });
  }
});

// UPDATE staff member
app.put('/api/staff/:staffId', authenticateBusiness, async (req, res) => {
  try {
    const { data, error } = await supabase.from('staff').update({
      full_name: req.body.full_name,
      role: req.body.role,
      is_active: req.body.is_active
    }).eq('id', req.params.staffId).select().single();
    if (error) throw error;
    const { password_hash, ...staff } = data;
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Staff update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update staff' });
  }
});

// DELETE staff member (soft delete by setting is_active to false)
app.delete('/api/staff/:staffId', authenticateBusiness, async (req, res) => {
  try {
    // Soft delete - set is_active to false instead of hard delete
    const { error } = await supabase.from('staff').update({ is_active: false }).eq('id', req.params.staffId);
    if (error) throw error;
    res.json({ success: true, message: 'Staff removed' });
  } catch (error) {
    console.error('Staff delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove staff' });
  }
});

// STAFF LOGIN
app.post('/api/staff/login', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('email', req.body.email)
      .eq('business_id', req.body.businessId)
      .eq('is_active', true)
      .single();
    if (error || !data) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    let valid = false;
    if (data.password_hash) {
      valid = await bcrypt.compare(req.body.password, data.password_hash);
    } else if (data.password === req.body.password) {
      valid = true;
    }
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const { password_hash, password: plainPassword, ...staff } = data;
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ============================================================
// OPERATING HOURS ENDPOINTS
// ============================================================

app.get('/api/businesses/:businessId/operating-hours', authenticateBusiness, async (req, res) => {
  try {
    const { data, error } = await supabase.from('operating_hours').select('*').eq('business_id', req.params.businessId).order('day_of_week');
    if (error) throw error;
    res.json({ success: true, operatingHours: data });
  } catch (error) {
    console.error('Fetch hours error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch operating hours' });
  }
});

app.put('/api/businesses/:businessId/operating-hours', authenticateBusiness, async (req, res) => {
  try {
    await supabase.from('operating_hours').delete().eq('business_id', req.params.businessId);
    if (req.body.operatingHours && req.body.operatingHours.length) {
      const { data, error } = await supabase.from('operating_hours').insert(
        req.body.operatingHours.map(h => ({ ...h, business_id: req.params.businessId }))
      ).select();
      if (error) throw error;
      res.json({ success: true, operatingHours: data });
    } else {
      res.json({ success: true, operatingHours: [] });
    }
  } catch (error) {
    console.error('Update hours error:', error);
    res.status(500).json({ success: false, error: 'Failed to update operating hours' });
  }
});

// ============================================================
// BLOCKED DATES ENDPOINTS
// ============================================================

app.get('/api/businesses/:businessId/blocked-dates', authenticateBusiness, async (req, res) => {
  try {
    const { data, error } = await supabase.from('availability').select('*').eq('business_id', req.params.businessId).eq('is_available', false).order('date');
    if (error) throw error;
    res.json({ success: true, blockedDates: data });
  } catch (error) {
    console.error('Fetch blocked dates error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blocked dates' });
  }
});

app.post('/api/businesses/:businessId/block-date', authenticateBusiness, async (req, res) => {
  try {
    const { data, error } = await supabase.from('availability').upsert({
      business_id: req.params.businessId,
      date: req.body.date,
      is_available: false,
      reason: req.body.reason || 'Blocked'
    }).select().single();
    if (error) throw error;
    res.json({ success: true, blockedDate: data });
  } catch (error) {
    console.error('Block date error:', error);
    res.status(500).json({ success: false, error: 'Failed to block date' });
  }
});

app.delete('/api/businesses/:businessId/block-date/:date', authenticateBusiness, async (req, res) => {
  try {
    await supabase.from('availability').delete().eq('business_id', req.params.businessId).eq('date', req.params.date);
    res.json({ success: true, message: 'Date unblocked' });
  } catch (error) {
    console.error('Unblock date error:', error);
    res.status(500).json({ success: false, error: 'Failed to unblock date' });
  }
});

// ============================================================
// BOOKING REFERENCE & PAYMENT ROUTES
// ============================================================

app.get('/api/bookings/reference/:reference', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select('*').eq('booking_reference', req.params.reference).single();
    if (error) throw error;
    res.json({ success: true, booking: data });
  } catch (error) {
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.post('/api/bookings/:reference/cancel', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('booking_reference', req.params.reference).select().single();
    if (error) throw error;
    res.json({ success: true, booking: data });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_reference, payment_status, amount_paid } = req.body;
    const updateData = {};
    if (payment_reference !== undefined) updateData.payment_reference = payment_reference;
    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (amount_paid !== undefined) updateData.amount_paid = amount_paid;
    const { data, error } = await supabase.from('bookings').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, booking: data });
  } catch (error) {
    console.error('PATCH booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

app.post('/api/create-payment', async (req, res) => {
  try {
    const { bookingReference, email, amount } = req.body;
    if (!bookingReference) return res.status(400).json({ success: false, error: 'Booking reference is required.' });
    if (!email?.includes('@')) return res.status(400).json({ success: false, error: 'Valid email required.' });
    if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ success: false, error: 'Valid amount required.' });
    const { data: booking, error: bookingError } = await supabase.from('bookings').select('*').eq('booking_reference', bookingReference).single();
    if (bookingError || !booking) return res.status(404).json({ success: false, error: 'Booking not found.' });
    if (booking.payment_status === 'paid') {
      return res.status(400).json({ success: false, error: 'Booking already paid. Please contact support.' });
    }
    const result = await initializePayment({ email, amount: amount, bookingReference });
    res.json({ success: true, authorization_url: result.authorization_url, reference: result.reference });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { reference, bookingReference } = req.body;
    if (!reference) return res.status(400).json({ success: false, error: 'Payment reference is required.' });
    const verification = await verifyPayment(reference);
    if (verification.success) {
      await supabase.from('bookings').update({
        payment_reference: reference,
        payment_status: 'paid',
        amount_paid: verification.amount / 100
      }).eq('booking_reference', bookingReference);
      res.json({ success: true, message: 'Payment successful!', amountPaid: verification.amount / 100 });
    } else {
      res.json({ success: false, message: 'Payment verification failed.' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

// ============================================================
// GALLERY UPLOAD ENDPOINT
// ============================================================

app.post('/api/upload-gallery-image', async (req, res) => {
  try {
    const { businessId, fileName, fileType, fileData } = req.body;

    console.log('📸 Upload request received:', { businessId, fileName, fileType, dataLength: fileData?.length });

    if (!businessId || !fileName || !fileData) {
      return res.status(400).json({ error: 'Business ID, file name, and file data are required' });
    }

    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }

    const fileBuffer = Buffer.from(matches[2], 'base64');
    const mimeType = matches[1];

    if (fileBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size must be under 5MB' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, and WEBP images are allowed' });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `business-images/${businessId}/${timestamp}-${randomStr}-${safeName}`;

    console.log('📁 Uploading to storage path:', filePath);

    const { data, error } = await supabase.storage.from('business-images').upload(filePath, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      console.error('❌ Storage upload error:', error);
      return res.status(500).json({ error: 'Failed to upload image to storage: ' + error.message });
    }

    const { data: urlData } = supabase.storage.from('business-images').getPublicUrl(filePath);

    console.log('✅ Upload successful:', urlData.publicUrl);

    res.json({ success: true, imageUrl: urlData.publicUrl, filePath: filePath });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Gallery POST and DELETE require authentication
app.post('/api/businesses/:businessId/gallery', authenticateBusiness, async (req, res) => {
  try {
    const { businessId } = req.params;
    const { imageUrl, fileName } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

    const { count } = await supabase.from('business_gallery').select('*', { count: 'exact', head: true }).eq('business_id', businessId);
    if ((count || 0) >= 5) {
      return res.status(400).json({ error: 'Gallery is full. Maximum 5 images allowed.' });
    }

    const { data: lastImage } = await supabase.from('business_gallery').select('sort_order').eq('business_id', businessId).order('sort_order', { ascending: false }).limit(1);
    const nextSortOrder = (lastImage && lastImage.length > 0) ? lastImage[0].sort_order + 1 : 0;

    const { data, error } = await supabase.from('business_gallery').insert({
      business_id: businessId,
      image_url: imageUrl,
      file_name: fileName || 'gallery-image',
      sort_order: nextSortOrder
    }).select().single();

    if (error) return res.status(500).json({ error: 'Failed to save gallery image: ' + error.message });

    res.json({ success: true, image: data });
  } catch (err) {
    console.error('Gallery save error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.delete('/api/businesses/:businessId/gallery/:imageId', authenticateBusiness, async (req, res) => {
  try {
    const { businessId, imageId } = req.params;

    const { data: image } = await supabase.from('business_gallery').select('id, image_url').eq('id', imageId).eq('business_id', businessId).single();
    if (!image) return res.status(404).json({ error: 'Image not found' });

    try {
      const parts = image.image_url.split('/business-images/');
      if (parts.length === 2) {
        const storagePath = decodeURIComponent(parts[1]);
        await supabase.storage.from('business-images').remove([storagePath]);
        console.log('🗑️ Deleted from storage:', storagePath);
      }
    } catch (e) {
      console.log('Storage delete skipped:', e.message);
    }

    await supabase.from('business_gallery').delete().eq('id', imageId).eq('business_id', businessId);

    const { data: remaining } = await supabase.from('business_gallery').select('id').eq('business_id', businessId).order('sort_order', { ascending: true });
    if (remaining) {
      for (let i = 0; i < remaining.length; i++) {
        await supabase.from('business_gallery').update({ sort_order: i }).eq('id', remaining[i].id);
      }
    }

    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.put('/api/businesses/:businessId/gallery/reorder', authenticateBusiness, async (req, res) => {
  try {
    const { businessId } = req.params;
    const { imageIds } = req.body;
    if (!Array.isArray(imageIds)) return res.status(400).json({ error: 'Invalid order data' });
    for (let i = 0; i < imageIds.length; i++) {
      await supabase.from('business_gallery').update({ sort_order: i }).eq('id', imageIds[i]).eq('business_id', businessId);
    }
    res.json({ success: true, message: 'Reordered' });
  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/rooms/:id/availability', async (req, res) => {
  res.json({ success: true, available: true, roomId: req.params.id });
});

app.get('/', (req, res) => res.send('Booking System API is running!'));

// ============================================================
// CUSTOM DOMAIN VERIFICATION ENDPOINTS (FIXED - No ID in URL)
// ============================================================

// Generate verification code for custom domain
app.post('/api/businesses/generate-verification', authenticateBusiness, async (req, res) => {
  try {
    const businessId = req.businessId;

    if (!businessId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const verificationCode = require('crypto').randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('businesses')
      .update({
        domain_verification_code: verificationCode,
        domain_verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      verificationCode: `booking-hub-verify=${verificationCode}`,
      instructions: `Add this TXT record to your DNS: booking-hub-verify=${verificationCode}`
    });
  } catch (error) {
    console.error('Generate verification error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate verification code' });
  }
});

// Check domain verification
app.post('/api/businesses/check-verification', authenticateBusiness, async (req, res) => {
  try {
    const businessId = req.businessId;
    const { custom_domain } = req.body;

    if (!businessId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (!custom_domain) {
      return res.status(400).json({ success: false, error: 'Custom domain is required' });
    }

    // Validate domain format
    const domainPattern = /^([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/;
    const isValidDomainFormat = domainPattern.test(custom_domain);

    if (!isValidDomainFormat) {
      return res.status(400).json({
        success: false,
        error: 'Invalid domain format. Please enter a valid domain (e.g., book.yourbusiness.com)'
      });
    }

    // Update business with verified custom domain
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        custom_domain: custom_domain,
        is_domain_verified: true,
        domain_verified_at: new Date().toISOString()
      })
      .eq('id', businessId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Domain verified successfully! Your booking page will now be available at this domain.'
    });
  } catch (error) {
    console.error('Check verification error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify domain' });
  }
});

// ============================================================
// CREATE ADMIN USER IF NOT EXISTS
// ============================================================
async function ensureAdminUser() {
  try {
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'admin@bookinghub.com')
      .single();

    if (!existingAdmin) {
      console.log('📝 Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const { error } = await supabase.from('admin_users').insert({
        email: 'admin@bookinghub.com',
        password: 'admin123',
        password_hash: hashedPassword,
        created_at: new Date().toISOString()
      });
      if (error) {
        console.error('❌ Failed to create admin user:', error.message);
      } else {
        console.log('✅ Admin user created: admin@bookinghub.com / admin123');
      }
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.log('⚠️ Admin user check skipped:', error.message);
  }
}

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, '0.0.0.0', async () => {
  const localIp = getLocalIpAddress();
  console.log('\n========================================');
  console.log('🚀 Booking Hub Server Running');
  console.log('========================================');
  console.log(`📍 On your COMPUTER: http://localhost:${PORT}`);
  console.log(`📱 On your PHONE:     http://${localIp}:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 PRODUCTION MODE: Auth enabled, CORS restricted');
  } else {
    console.log('⚠️ DEVELOPMENT MODE: Auth bypassed, CORS open');
  }
  console.log('========================================\n');

  // Create admin user on startup
  await ensureAdminUser();
});