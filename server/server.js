﻿// FILE: server.js
// COMPLETE PRODUCTION-READY VERSION WITH SUBSCRIPTION SYSTEM
// DEPLOY TO RENDER: Replace your server.js with this

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { sendBookingConfirmation, sendWelcomeEmail, sendApprovalEmail } = require('./src/services/emailService');
const { initializePayment, verifyPayment } = require('./src/services/paystackService');
const detectBusinessFromDomain = require('./src/middleware/domainDetector');
const { verifyDomainTxtRecord } = require('./src/services/dnsService');

// ============================================================
// SUPABASE INITIALIZATION
// ============================================================
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
// HELPER: Remove sensitive fields from objects
// ============================================================
function removeSensitiveFields(obj, ...fields) {
  if (!obj) return obj;
  const result = { ...obj };
  fields.forEach(field => delete result[field]);
  return result;
}

// ============================================================
// CORS CONFIGURATION
// ============================================================
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://booking-frontend-clean.onrender.com',
  'https://booking-hub-frontend-clean.onrender.com'
];

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(function(origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      ALLOWED_ORIGINS.push(origin);
    }
  });
}

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    console.log('Blocked CORS request from:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.set('trust proxy', 1);

// ============================================================
// RATE LIMITING
// ============================================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: function() { return process.env.NODE_ENV !== 'production'; },
  keyGenerator: function(req) {
    return req.headers['x-forwarded-for'] || req.ip;
  }
});

app.use(express.json({ limit: '10mb' }));
app.use('/api/', limiter);

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================
async function authenticateBusiness(req, res, next) {
  const requestedBusinessId = req.params.businessId || req.params.id;
  const authHeader = req.headers.authorization;

  if (process.env.NODE_ENV !== 'production' && !authHeader) {
    console.log('Development mode: skipping auth for business route');
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

    if (requestedBusinessId && session.business_id !== requestedBusinessId) {
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
    console.log('Development mode: skipping auth for admin route');
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
// DOMAIN DETECTION
// ============================================================
app.use('/api/businesses/slug', detectBusinessFromDomain);
app.use('/api/domain-info', detectBusinessFromDomain);
app.use('/book', detectBusinessFromDomain);

// ============================================================
// HEALTH & TEST ROUTES
// ============================================================
app.get('/health', function(req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', function(req, res) {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', function(req, res) {
  res.json({ message: 'Backend is connected!', timestamp: new Date().toISOString() });
});

app.get('/api/supabase-test', async function(req, res) {
  try {
    const { error, count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ success: true, message: 'Supabase connected!', count: count });
  } catch (error) {
    console.error('Supabase test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// PUBLIC BUSINESS ROUTES
// ============================================================

app.get('/api/businesses', async function(req, res) {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, businesses: data });
  } catch (err) {
    console.error('Error fetching businesses:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/businesses/featured', async function(req, res) {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('status', 'approved')
      .limit(3);
    if (error) throw error;
    res.json({ success: true, businesses: data });
  } catch {
    console.error('Failed to fetch featured businesses');
    res.status(500).json({ error: 'Failed to fetch featured businesses' });
  }
});

app.get('/api/businesses/search/category', async function(req, res) {
  try {
    const { category, location } = req.query;
    let query = supabase
      .from('businesses')
      .select('*')
      .eq('status', 'approved');
    
    if (category) {
      query = query.eq('business_type', category);
    }
    
    if (location && location.trim()) {
      query = query.or('city.ilike.%' + location + '%,state.ilike.%' + location + '%');
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json({ success: true, businesses: data });
  } catch {
    console.error('Search error:');
    res.status(500).json({ error: 'Search failed', details: 'An error occurred during search' });
  }
});

app.get('/api/businesses/slug/:slug', async function(req, res) {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();
    
    if (error) throw error;
    res.json({ success: true, business: data });
  } catch {
    console.error('Business not found:');
    res.status(404).json({ success: false, error: 'Business not found' });
  }
});

app.get('/api/domain-info', async function(req, res) {
  try {
    const domain = req.query.domain || req.get('host')?.split(':')[0] || '';
    if (domain && domain !== 'localhost' && domain !== '127.0.0.1') {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('custom_domain', domain)
        .eq('is_domain_verified', true)
        .single();
      if (!error && data) {
        return res.json({ success: true, business: data, source: 'custom-domain-verified' });
      }
    }
    if (req.detectedBusiness) {
      return res.json({ success: true, business: req.detectedBusiness, source: req.domainSource || 'custom-domain' });
    }
    res.json({ success: false, message: 'No business associated with this domain' });
  } catch {
    console.error('Domain info error:');
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/businesses/:businessId/rooms', async function(req, res) {
  try {
    const { businessId } = req.params;
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'available');
    
    if (error) throw error;
    res.json({ success: true, rooms: data });
  } catch {
    console.error('Fetch rooms error:');
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.get('/api/businesses/:businessId/gallery', async function(req, res) {
  try {
    const { businessId } = req.params;
    const { data, error } = await supabase
      .from('business_gallery')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
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
// AUTHENTICATION ROUTES
// ============================================================

app.post('/api/admin/login', async function(req, res) {
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

    const safeAdmin = removeSensitiveFields(admin, 'password_hash', 'password');

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

app.post('/api/businesses/register', async function(req, res) {
  try {
    const { businessName, businessType, email, password, phone, address, city, state, customDomain } = req.body;

    if (!businessName || businessName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Business name is required.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }
    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, error: 'A valid phone number is required.' });
    }
    if (!city || city.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'City is required.' });
    }

    var slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    var { data: existingEmail } = await supabase
      .from('businesses')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingEmail) {
      return res.status(400).json({ success: false, error: 'A business with this email already exists.' });
    }

    var { data: existingSlug } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single();
    
    var hashedPassword = await bcrypt.hash(password, 10);

    var { data, error } = await supabase
      .from('businesses')
      .insert({
        name: businessName,
        slug: existingSlug ? slug + '-' + Date.now().toString(36) : slug,
        business_type: businessType,
        email: email,
        password: password,
        password_hash: hashedPassword,
        phone: phone,
        address: address || '',
        city: city,
        state: state || '',
        custom_domain: customDomain || null,
        status: 'pending',
        booking_limit: 50,
        current_booking_count: 0,
        subscription_status: 'free'
      })
      .select()
      .single();

    if (error) {
      console.error('Registration DB error:', error);
      return res.status(500).json({ success: false, error: 'Registration failed: ' + error.message });
    }
    
    if (data) {
      sendWelcomeEmail(data).catch(function(err) { console.error('Welcome email failed:', err); });
    }
    
    res.json({ success: true, business: data, message: 'Business registered! A confirmation email has been sent.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/businesses/login', async function(req, res) {
  try {
    var { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required.' });
    }

    var { data: business, error } = await supabase
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

    var isValidPassword = false;

    if (business.password_hash) {
      isValidPassword = await bcrypt.compare(password, business.password_hash);
    }

    if (!isValidPassword && business.password) {
      isValidPassword = (business.password === password);
      if (isValidPassword) {
        var hashedPassword = await bcrypt.hash(password, 10);
        await supabase.from('businesses').update({ password_hash: hashedPassword }).eq('id', business.id);
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    var token = generateToken();
    var expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await supabase.from('business_sessions').upsert({
      business_id: business.id,
      token: token,
      expires_at: expiresAt.toISOString()
    });

    var safeBusiness = removeSensitiveFields(business, 'password_hash', 'password');

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

app.post('/api/staff/login', async function(req, res) {
  try {
    var { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('email', req.body.email)
      .eq('business_id', req.body.businessId)
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    var valid = false;
    if (data.password_hash) {
      valid = await bcrypt.compare(req.body.password, data.password_hash);
    } else if (data.password === req.body.password) {
      valid = true;
    }
    
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    var staff = removeSensitiveFields(data, 'password_hash', 'password');
    res.json({ success: true, staff: staff });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ============================================================
// ADMIN ROUTES
// ============================================================

app.get('/api/admin/businesses', authenticateAdmin, async function(req, res) {
  try {
    var { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, businesses: data });
  } catch (error) {
    console.error('Fetch businesses error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch businesses' });
  }
});

app.put('/api/admin/businesses/:id/status', authenticateAdmin, async function(req, res) {
  try {
    var { data, error } = await supabase
      .from('businesses')
      .update({ status: req.body.status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (req.body.status === 'approved' && data) {
      sendApprovalEmail(data).catch(function(err) { console.error('Approval email failed:', err); });
    }
    
    res.json({ success: true, business: data });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

app.delete('/api/admin/businesses/:id', authenticateAdmin, async function(req, res) {
  try {
    var { id } = req.params;
    
    var { data: business, error: findError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (findError || !business) {
      return res.status(404).json({ success: false, error: 'Business not found.' });
    }

    await supabase.from('business_gallery').delete().eq('business_id', id);
    await supabase.from('availability').delete().eq('business_id', id);
    await supabase.from('operating_hours').delete().eq('business_id', id);
    await supabase.from('staff').delete().eq('business_id', id);
    await supabase.from('bookings').delete().eq('business_id', id);
    await supabase.from('rooms').delete().eq('business_id', id);

    var { error } = await supabase.from('businesses').delete().eq('id', id);
    if (error) throw error;
    
    res.json({ success: true, message: business.name + ' has been permanently deleted.' });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/admin/stats', authenticateAdmin, async function(req, res) {
  try {
    var { count: totalBusinesses } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    
    var { count: pendingBusinesses } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    var { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });
    
    var { data: revenueData } = await supabase
      .from('bookings')
      .select('total_amount')
      .eq('status', 'confirmed');
    
    var totalRevenue = revenueData ? revenueData.reduce(function(sum, b) { return sum + parseFloat(b.total_amount); }, 0) : 0;
    
    res.json({
      success: true,
      stats: {
        totalBusinesses: totalBusinesses || 0,
        pendingBusinesses: pendingBusinesses || 0,
        totalBookings: totalBookings || 0,
        totalRevenue: totalRevenue
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// ============================================================
// SUBSCRIPTION ROUTES - COMPLETE
// ============================================================

// GET: Check if business can accept bookings
app.get('/api/businesses/:businessId/can-book', async function(req, res) {
  try {
    const { businessId } = req.params;
    
    const { data: business, error } = await supabase
      .from('businesses')
      .select('current_booking_count, booking_limit, subscription_status, name')
      .eq('id', businessId)
      .single();
    
    if (error || !business) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }
    
    const canBook = business.current_booking_count < business.booking_limit;
    const remaining = Math.max(0, business.booking_limit - business.current_booking_count);
    const usage = Math.min(100, (business.current_booking_count / business.booking_limit) * 100);
    
    res.json({
      success: true,
      data: {
        canBook: canBook,
        currentCount: business.current_booking_count,
        limit: business.booking_limit,
        remaining: remaining,
        usagePercent: Math.round(usage),
        isPremium: business.subscription_status === 'premium' || business.subscription_status === 'pro',
        message: canBook ? 'You can accept bookings' : 'Booking limit reached. Please upgrade to continue.'
      }
    });
  } catch (error) {
    console.error('Can book check error:', error);
    res.status(500).json({ success: false, error: 'Failed to check booking capacity' });
  }
});

// GET: Business subscription status
app.get('/api/businesses/:businessId/subscription', authenticateBusiness, async function(req, res) {
  try {
    const { businessId } = req.params;
    
    const { data: business, error } = await supabase
      .from('businesses')
      .select('booking_limit, current_booking_count, subscription_status, subscribed_at')
      .eq('id', businessId)
      .single();
    
    if (error || !business) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }
    
    const limit = business.booking_limit || 50;
    const used = business.current_booking_count || 0;
    const remaining = Math.max(0, limit - used);
    const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        plan: business.subscription_status || 'free',
        limit: limit,
        used: used,
        remaining: remaining,
        percentage: Math.min(percentage, 100),
        isPremium: business.subscription_status === 'premium' || business.subscription_status === 'pro'
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscription status' });
  }
});

// POST: Create upgrade request
app.post('/api/businesses/:businessId/upgrade-request', authenticateBusiness, async function(req, res) {
  try {
    const { businessId } = req.params;
    const { plan, paymentReference, notes } = req.body;
    
    if (!plan || !['starter', 'pro'].includes(plan)) {
      return res.status(400).json({ success: false, error: 'Invalid plan selected' });
    }
    
    // Generate payment reference if not provided
    const ref = paymentReference || `UPG-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const { data: upgrade, error } = await supabase
      .from('subscription_upgrades')
      .insert({
        business_id: businessId,
        plan: plan,
        amount: plan === 'starter' ? 30000 : 50000,
        payment_reference: ref,
        status: 'pending',
        notes: notes || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: {
        id: upgrade.id,
        plan: upgrade.plan,
        amount: upgrade.amount,
        reference: upgrade.payment_reference,
        status: upgrade.status,
        bankDetails: {
          bankName: 'GTBank',
          accountNumber: '0123456789',
          accountName: 'Booking Hub Limited'
        }
      },
      message: 'Upgrade request created. Transfer the amount and we\'ll verify within 24 hours.'
    });
  } catch (error) {
    console.error('Upgrade request error:', error);
    res.status(500).json({ success: false, error: 'Failed to create upgrade request' });
  }
});

// POST: Admin verify and activate upgrade
app.post('/api/admin/subscription/verify', authenticateAdmin, async function(req, res) {
  try {
    const { upgradeId } = req.body;
    
    if (!upgradeId) {
      return res.status(400).json({ success: false, error: 'Upgrade ID is required' });
    }
    
    // Get the upgrade request
    const { data: upgrade, error: fetchError } = await supabase
      .from('subscription_upgrades')
      .select('*')
      .eq('id', upgradeId)
      .single();
    
    if (fetchError || !upgrade) {
      return res.status(404).json({ success: false, error: 'Upgrade request not found' });
    }
    
    if (upgrade.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Upgrade already processed' });
    }
    
    // Update upgrade status
    await supabase
      .from('subscription_upgrades')
      .update({ 
        status: 'approved',
        verified_at: new Date().toISOString(),
        verified_by: req.adminId
      })
      .eq('id', upgradeId);
    
    // Update business subscription
    const newLimit = upgrade.plan === 'starter' ? 100 : 999999;
    const newStatus = upgrade.plan === 'starter' ? 'starter' : 'pro';
    
    const { data: business, error: updateError } = await supabase
      .from('businesses')
      .update({
        booking_limit: newLimit,
        subscription_status: newStatus,
        current_booking_count: 0,
        subscribed_at: new Date().toISOString()
      })
      .eq('id', upgrade.business_id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    res.json({
      success: true,
      message: `Business upgraded to ${upgrade.plan} plan successfully`,
      business: business
    });
  } catch (error) {
    console.error('Admin verify error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify upgrade' });
  }
});

// GET: Admin pending upgrades
app.get('/api/admin/pending-upgrades', authenticateAdmin, async function(req, res) {
  try {
    const { data: upgrades, error } = await supabase
      .from('subscription_upgrades')
      .select(`
        *,
        businesses:business_id (
          id,
          name,
          email,
          phone,
          status
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: upgrades || []
    });
  } catch (error) {
    console.error('Pending upgrades error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending upgrades' });
  }
});

// ============================================================
// AUTHENTICATED BUSINESS ROUTES
// ============================================================

app.get('/api/businesses/profile', authenticateBusiness, async function(req, res) {
  console.log('Profile request - Business ID from session:', req.businessId);
  try {
    var businessId = req.businessId;

    if (!businessId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    var { data, error } = await supabase
      .from('businesses')
      .select('id, name, email, phone, city, state, logo_url, cover_image, business_type, slug, description, about_text, website, status, booking_limit, current_booking_count, subscription_status, subscribed_at')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }

    console.log('Profile found:', data.name);
    res.json({ success: true, business: data });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

app.put('/api/businesses/:id', authenticateBusiness, async function(req, res) {
  try {
    var { cover_image, logo_url, about_text, description, website, name } = req.body;
    var updateData = {};
    if (cover_image !== undefined) updateData.cover_image = cover_image;
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (about_text !== undefined) updateData.about_text = about_text;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (name !== undefined) updateData.name = name;
    
    var { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) return res.status(500).json({ success: false, error: 'Database update failed.' });
    res.json({ success: true, business: data });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

// ROOM MANAGEMENT
app.post('/api/businesses/:businessId/rooms/create', authenticateBusiness, async function(req, res) {
  try {
    var { name, type, capacity, price_per_night, description, amenities } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Room name is required.' });
    }
    if (!price_per_night || isNaN(price_per_night) || price_per_night <= 0) {
      return res.status(400).json({ success: false, error: 'A valid price is required.' });
    }
    
    var { data, error } = await supabase
      .from('rooms')
      .insert({
        business_id: req.params.businessId,
        name: name.trim(),
        type: type || 'Standard',
        capacity: capacity || 2,
        base_price: price_per_night,
        price_per_night: price_per_night,
        description: description || '',
        amenities: amenities || [],
        status: 'available'
      })
      .select()
      .single();
    
    if (error) return res.status(500).json({ success: false, error: 'Failed to create room.' });
    res.json({ success: true, room: data });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.put('/api/businesses/:businessId/rooms/:roomId', authenticateBusiness, async function(req, res) {
  try {
    var { name, type, capacity, price_per_night, description, amenities, status } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Room name is required.' });
    }
    if (!price_per_night || isNaN(price_per_night) || parseFloat(price_per_night) <= 0) {
      return res.status(400).json({ success: false, error: 'A valid price is required.' });
    }
    
    var updateData = {
      name: name.trim(),
      type: type || 'Standard',
      capacity: parseInt(capacity) || 2,
      price_per_night: parseFloat(price_per_night),
      base_price: parseFloat(price_per_night),
      description: description || '',
      amenities: Array.isArray(amenities) ? amenities : [],
      status: status || 'available'
    };
    
    var { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', req.params.roomId)
      .eq('business_id', req.params.businessId)
      .select()
      .single();
    
    if (error) return res.status(500).json({ success: false, error: 'Failed to update room.' });
    res.json({ success: true, room: data });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.delete('/api/businesses/:businessId/rooms/:roomId', authenticateBusiness, async function(req, res) {
  try {
    var { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', req.params.roomId)
      .eq('business_id', req.params.businessId);
    
    if (error) return res.status(500).json({ success: false, error: 'Failed to delete room.' });
    res.json({ success: true, message: 'Room deleted successfully.' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/businesses/:businessId/bookings', authenticateBusiness, async function(req, res) {
  try {
    var { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('business_id', req.params.businessId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch {
    console.error('Fetch bookings error:');
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// STAFF MANAGEMENT
app.get('/api/businesses/:businessId/staff', authenticateBusiness, async function(req, res) {
  try {
    var { data, error } = await supabase
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

app.post('/api/businesses/:businessId/staff', authenticateBusiness, async function(req, res) {
  try {
    var hashedPassword = await bcrypt.hash(req.body.password, 10);
    var { data, error } = await supabase
      .from('staff')
      .insert({
        business_id: req.params.businessId,
        email: req.body.email,
        password_hash: hashedPassword,
        full_name: req.body.full_name,
        role: req.body.role || 'staff',
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: 'Email already exists' });
      }
      console.error('Staff creation error:', error);
      throw error;
    }
    
    var staff = removeSensitiveFields(data, 'password_hash', 'password');
    res.json({ success: true, staff: staff });
  } catch (error) {
    console.error('Staff creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to add staff member' });
  }
});

app.put('/api/staff/:staffId', authenticateBusiness, async function(req, res) {
  try {
    var { data, error } = await supabase
      .from('staff')
      .update({
        full_name: req.body.full_name,
        role: req.body.role,
        is_active: req.body.is_active
      })
      .eq('id', req.params.staffId)
      .select()
      .single();
    
    if (error) throw error;
    var staff = removeSensitiveFields(data, 'password_hash', 'password');
    res.json({ success: true, staff: staff });
  } catch (error) {
    console.error('Staff update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update staff' });
  }
});

app.delete('/api/staff/:staffId', authenticateBusiness, async function(req, res) {
  try {
    var { error } = await supabase
      .from('staff')
      .update({ is_active: false })
      .eq('id', req.params.staffId);
    
    if (error) throw error;
    res.json({ success: true, message: 'Staff removed' });
  } catch (error) {
    console.error('Staff delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove staff' });
  }
});

// OPERATING HOURS
app.get('/api/businesses/:businessId/operating-hours', authenticateBusiness, async function(req, res) {
  try {
    var { data, error } = await supabase
      .from('operating_hours')
      .select('*')
      .eq('business_id', req.params.businessId)
      .order('day_of_week');
    
    if (error) throw error;
    res.json({ success: true, operatingHours: data });
  } catch (error) {
    console.error('Fetch hours error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch operating hours' });
  }
});

app.put('/api/businesses/:businessId/operating-hours', authenticateBusiness, async function(req, res) {
  try {
    await supabase.from('operating_hours').delete().eq('business_id', req.params.businessId);
    
    if (req.body.operatingHours && req.body.operatingHours.length) {
      var { data, error } = await supabase
        .from('operating_hours')
        .insert(req.body.operatingHours.map(function(h) { return { ...h, business_id: req.params.businessId }; }))
        .select();
      
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

// BLOCKED DATES
app.get('/api/businesses/:businessId/blocked-dates', authenticateBusiness, async function(req, res) {
  try {
    var { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('business_id', req.params.businessId)
      .eq('is_available', false)
      .order('date');
    
    if (error) throw error;
    res.json({ success: true, blockedDates: data });
  } catch (error) {
    console.error('Fetch blocked dates error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blocked dates' });
  }
});

app.post('/api/businesses/:businessId/block-date', authenticateBusiness, async function(req, res) {
  try {
    var { data, error } = await supabase
      .from('availability')
      .upsert({
        business_id: req.params.businessId,
        date: req.body.date,
        is_available: false,
        reason: req.body.reason || 'Blocked'
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, blockedDate: data });
  } catch {
    console.error('Block date error:');
    res.status(500).json({ success: false, error: 'Failed to block date' });
  }
});

app.delete('/api/businesses/:businessId/block-date/:date', authenticateBusiness, async function(req, res) {
  try {
    await supabase
      .from('availability')
      .delete()
      .eq('business_id', req.params.businessId)
      .eq('date', req.params.date);
    
    res.json({ success: true, message: 'Date unblocked' });
  } catch (error) {
    console.error('Unblock date error:', error);
    res.status(500).json({ success: false, error: 'Failed to unblock date' });
  }
});

// ============================================================
// PUBLIC BOOKING ROUTES WITH LIMIT CHECK
// ============================================================

// GET: Check if booking can be made (public)
app.get('/api/businesses/:businessId/booking-capacity', async function(req, res) {
  try {
    const { businessId } = req.params;
    
    const { data: business, error } = await supabase
      .from('businesses')
      .select('current_booking_count, booking_limit, subscription_status, name')
      .eq('id', businessId)
      .single();
    
    if (error || !business) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }
    
    const canBook = business.current_booking_count < business.booking_limit;
    const remaining = Math.max(0, business.booking_limit - business.current_booking_count);
    
    res.json({
      success: true,
      canBook: canBook,
      remaining: remaining,
      isPremium: business.subscription_status === 'premium' || business.subscription_status === 'pro'
    });
  } catch (error) {
    console.error('Capacity check error:', error);
    res.status(500).json({ success: false, error: 'Failed to check capacity' });
  }
});

// POST: Create booking with limit check
app.post('/api/bookings', async function(req, res) {
  try {
    console.log('Booking request received:', req.body);

    var {
      businessId,
      roomId,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount,
      bookingDetails,
      checkIn,
      checkOut,
      guests,
      specialRequests,
      paymentMethod
    } = req.body;

    if (!businessId) {
      return res.status(400).json({ success: false, error: 'Business ID is required' });
    }
    if (!customerEmail) {
      return res.status(400).json({ success: false, error: 'Customer email is required' });
    }
    if (!customerEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid total amount is required' });
    }

    // ============================================================
    // FETCH BUSINESS AND CHECK LIMIT
    // ============================================================
    var { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      console.error('Business not found:', businessId);
      return res.status(404).json({ success: false, error: 'Business not found' });
    }

    // ============================================================
    // 🔴 CHECK BOOKING LIMIT - CRITICAL
    // ============================================================
    const currentCount = business.current_booking_count || 0;
    const limit = business.booking_limit || 50;

    // If limit reached, block booking
    if (currentCount >= limit) {
      console.log('[Booking] ⛔ Limit reached for:', business.name);
      console.log('[Booking] - Current count:', currentCount);
      console.log('[Booking] - Limit:', limit);
      
      // Calculate how many more bookings they can take
      const remaining = limit - currentCount;
      
      return res.status(403).json({
        success: false,
        error: 'Booking limit reached. Please upgrade your plan to continue accepting bookings.',
        limitReached: true,
        currentCount: currentCount,
        limit: limit,
        remaining: remaining,
        businessId: business.id,
        businessName: business.name,
        upgradeUrl: '/upgrade/' + business.id
      });
    }

    // ============================================================
    // CREATE BOOKING
    // ============================================================
    var timestamp = Date.now();
    var randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    var bookingRef = 'BK-' + timestamp + '-' + randomStr;

    var roomName = 'Room';
    if (roomId) {
      var { data: roomData } = await supabase
        .from('rooms')
        .select('name')
        .eq('id', roomId)
        .single();
      if (roomData) {
        roomName = roomData.name;
      }
    }

    var checkInDate = checkIn || new Date().toISOString().split('T')[0];
    var checkOutDate = checkOut || checkInDate;
    var nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)) || 1;

    var bookingData = {
      booking_reference: bookingRef,
      business_id: businessId,
      room_id: roomId || null,
      customer_name: customerName || 'Guest',
      customer_email: customerEmail,
      customer_phone: customerPhone || 'Not provided',
      total_amount: parseFloat(totalAmount),
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      number_of_guests: parseInt(guests) || 1,
      special_requests: specialRequests || '',
      payment_method: paymentMethod || 'pay_at_venue',
      status: 'confirmed',
      payment_status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('Inserting booking:', bookingData);

    var { data: booking, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error: ' + error.message,
        details: error
      });
    }

    // Update booking count
    var { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);

    await supabase
      .from('businesses')
      .update({ current_booking_count: (bookingCount || 0) + 1 })
      .eq('id', businessId);

    var emailDetails = {
      ...booking,
      bookingDetails: bookingDetails || {
        roomName: roomName,
        hotelName: business.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: parseInt(guests) || 1,
        nights: nights,
        total: parseFloat(totalAmount),
        paymentMethod: paymentMethod === 'pay_at_venue' ? 'Pay at Venue' : 'Paystack'
      }
    };

    sendBookingConfirmation(emailDetails, business).catch(function(err) {
      console.error('Email error:', err);
    });

    console.log('Booking created successfully:', bookingRef);

    // Return success with limit info
    const newCount = (bookingCount || 0) + 1;
    const remainingBookings = Math.max(0, limit - newCount);
    
    res.json({ 
      success: true, 
      booking: {
        ...booking,
        room_name: roomName
      },
      usageInfo: {
        used: newCount,
        limit: limit,
        remaining: remainingBookings,
        isNearLimit: remainingBookings <= 5
      },
      message: 'Booking confirmed! A confirmation email has been sent.'
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Something went wrong. Please try again.',
      details: error.message
    });
  }
});

app.get('/api/bookings/reference/:reference', async function(req, res) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_reference', req.params.reference)
      .single();

    if (error) throw error;
    res.json({ success: true, booking: data });
  } catch {
    console.error('Booking not found:');
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.post('/api/bookings/:reference/cancel', async function(req, res) {
  try {
    var { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('booking_reference', req.params.reference)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, booking: data });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

app.patch('/api/bookings/:id', async function(req, res) {
  try {
    var { id } = req.params;
    var { payment_reference, payment_status, amount_paid } = req.body;
    var updateData = {};
    if (payment_reference !== undefined) updateData.payment_reference = payment_reference;
    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (amount_paid !== undefined) updateData.amount_paid = amount_paid;
    
    var { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, booking: data });
  } catch (error) {
    console.error('PATCH booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// ============================================================
// PAYMENT ROUTES
// ============================================================

app.post('/api/create-payment', async function(req, res) {
  try {
    var { bookingReference, email, amount } = req.body;
    if (!bookingReference) return res.status(400).json({ success: false, error: 'Booking reference is required.' });
    if (!email || !email.includes('@')) return res.status(400).json({ success: false, error: 'Valid email required.' });
    if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ success: false, error: 'Valid amount required.' });
    
    var { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_reference', bookingReference)
      .single();
    
    if (bookingError || !booking) return res.status(404).json({ success: false, error: 'Booking not found.' });
    
    if (booking.payment_status === 'paid') {
      return res.status(400).json({ success: false, error: 'Booking already paid. Please contact support.' });
    }
    
    var result = await initializePayment({ email: email, amount: amount, bookingReference: bookingReference });
    res.json({ success: true, authorization_url: result.authorization_url, reference: result.reference });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/verify-payment', async function(req, res) {
  try {
    var { reference, bookingReference } = req.body;
    if (!reference) return res.status(400).json({ success: false, error: 'Payment reference is required.' });
    
    var verification = await verifyPayment(reference);
    if (verification.success) {
      await supabase
        .from('bookings')
        .update({
          payment_reference: reference,
          payment_status: 'paid',
          amount_paid: verification.amount / 100
        })
        .eq('booking_reference', bookingReference);
      
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
// GALLERY ROUTES
// ============================================================

app.post('/api/upload-gallery-image', async function(req, res) {
  try {
    var { businessId, fileName, fileType, fileData } = req.body;

    console.log('Upload request received:', { businessId: businessId, fileName: fileName, fileType: fileType, dataLength: fileData?.length });

    if (!businessId || !fileName || !fileData) {
      return res.status(400).json({ error: 'Business ID, file name, and file data are required' });
    }

    var matches = fileData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }

    var fileBuffer = Buffer.from(matches[2], 'base64');
    var mimeType = matches[1];

    if (fileBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size must be under 5MB' });
    }

    var allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, and WEBP images are allowed' });
    }

    var timestamp = Date.now();
    var randomStr = Math.random().toString(36).substring(2, 10);
    var safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    var filePath = 'business-images/' + businessId + '/' + timestamp + '-' + randomStr + '-' + safeName;

    console.log('Uploading to storage path:', filePath);

    var { data, error } = await supabase.storage
      .from('business-images')
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return res.status(500).json({ error: 'Failed to upload image to storage: ' + error.message });
    }

    var { data: urlData } = supabase.storage.from('business-images').getPublicUrl(filePath);

    console.log('Upload successful:', urlData.publicUrl);

    res.json({ success: true, imageUrl: urlData.publicUrl, filePath: filePath });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/businesses/:businessId/gallery', authenticateBusiness, async function(req, res) {
  try {
    var { businessId } = req.params;
    var { imageUrl, fileName } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

    var { count } = await supabase
      .from('business_gallery')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);
    
    if ((count || 0) >= 5) {
      return res.status(400).json({ error: 'Gallery is full. Maximum 5 images allowed.' });
    }

    var { data: lastImage } = await supabase
      .from('business_gallery')
      .select('sort_order')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: false })
      .limit(1);
    
    var nextSortOrder = (lastImage && lastImage.length > 0) ? lastImage[0].sort_order + 1 : 0;

    var { data, error } = await supabase
      .from('business_gallery')
      .insert({
        business_id: businessId,
        image_url: imageUrl,
        file_name: fileName || 'gallery-image',
        sort_order: nextSortOrder
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to save gallery image: ' + error.message });

    res.json({ success: true, image: data });
  } catch (err) {
    console.error('Gallery save error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.delete('/api/businesses/:businessId/gallery/:imageId', authenticateBusiness, async function(req, res) {
  try {
    var { businessId, imageId } = req.params;

    var { data: image } = await supabase
      .from('business_gallery')
      .select('id, image_url')
      .eq('id', imageId)
      .eq('business_id', businessId)
      .single();
    
    if (!image) return res.status(404).json({ error: 'Image not found' });

    try {
      var parts = image.image_url.split('/business-images/');
      if (parts.length === 2) {
        var storagePath = decodeURIComponent(parts[1]);
        await supabase.storage.from('business-images').remove([storagePath]);
        console.log('Deleted from storage:', storagePath);
      }
    } catch (e) {
      console.log('Storage delete skipped:', e.message);
    }

    await supabase.from('business_gallery').delete().eq('id', imageId).eq('business_id', businessId);

    var { data: remaining } = await supabase
      .from('business_gallery')
      .select('id')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });
    
    if (remaining) {
      for (var i = 0; i < remaining.length; i++) {
        await supabase.from('business_gallery').update({ sort_order: i }).eq('id', remaining[i].id);
      }
    }

    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.put('/api/businesses/:businessId/gallery/reorder', authenticateBusiness, async function(req, res) {
  try {
    var { businessId } = req.params;
    var { imageIds } = req.body;
    if (!Array.isArray(imageIds)) return res.status(400).json({ error: 'Invalid order data' });
    
    for (var i = 0; i < imageIds.length; i++) {
      await supabase
        .from('business_gallery')
        .update({ sort_order: i })
        .eq('id', imageIds[i])
        .eq('business_id', businessId);
    }
    
    res.json({ success: true, message: 'Reordered' });
  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ============================================================
// CUSTOM DOMAIN VERIFICATION
// ============================================================

app.post('/api/businesses/generate-verification', authenticateBusiness, async function(req, res) {
  try {
    var businessId = req.businessId;

    if (!businessId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    var crypto = require('crypto');
    var verificationCode = crypto.randomBytes(12).toString('hex');
    
    var expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    console.log('[DNS] Generating code for business:', businessId);
    console.log('[DNS] Code length:', verificationCode.length);
    console.log('[DNS] Code:', verificationCode);

    var { data, error } = await supabase
      .from('businesses')
      .update({
        domain_verification_code: verificationCode,
        domain_verification_expires: expiresAt.toISOString()
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      console.error('[DNS] Database error:', error);
      
      if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        return res.status(500).json({ 
          success: false, 
          error: 'Database schema missing required columns. Please add: domain_verification_code, domain_verification_expires, domain_verified_at',
          details: error.message
        });
      }
      
      throw error;
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }

    console.log('[DNS] Code generated successfully for:', data.name);

    res.json({
      success: true,
      verificationCode: verificationCode,
      expiresAt: expiresAt.toISOString(),
      instructions: 'Add this TXT record to your DNS: ' + verificationCode,
      warning: 'This code expires in 24 hours. Please verify your domain before then.'
    });
  } catch (error) {
    console.error('[DNS] Generate verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate verification code: ' + error.message
    });
  }
});

app.post('/api/businesses/check-verification', authenticateBusiness, async function(req, res) {
  try {
    var businessId = req.businessId;
    var { custom_domain } = req.body;

    if (!businessId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (!custom_domain) {
      return res.status(400).json({ success: false, error: 'Custom domain is required' });
    }

    var domainPattern = /^([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/;
    var isValidDomainFormat = domainPattern.test(custom_domain);

    if (!isValidDomainFormat) {
      return res.status(400).json({
        success: false,
        error: 'Invalid domain format. Please enter a valid domain (e.g., book.yourbusiness.com)'
      });
    }

    var { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('domain_verification_code, domain_verification_expires, name')
      .eq('id', businessId)
      .single();

    if (fetchError || !business) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }

    if (!business.domain_verification_code) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found. Please generate a code first.'
      });
    }

    if (business.domain_verification_expires) {
      var expiryDate = new Date(business.domain_verification_expires);
      if (new Date() > expiryDate) {
        return res.status(400).json({
          success: false,
          error: 'Verification code has expired. Please generate a new code and try again.'
        });
      }
    }

    console.log('[DNS] Verifying domain for:', business.name);
    console.log('[DNS] Domain:', custom_domain);
    console.log('[DNS] Expected code:', business.domain_verification_code);

    var result = await verifyDomainTxtRecord(custom_domain, business.domain_verification_code);

    console.log('[DNS] Verification result:', result);

    if (!result.verified) {
      return res.status(400).json({
        success: false,
        error: result.error || 'TXT record not found. Please add the verification code to your DNS and wait 10-30 minutes for propagation.',
        details: result
      });
    }

    var { error: updateError } = await supabase
      .from('businesses')
      .update({
        custom_domain: custom_domain,
        is_domain_verified: true,
        domain_verified_at: new Date().toISOString(),
        domain_verification_code: null,
        domain_verification_expires: null
      })
      .eq('id', businessId);

    if (updateError) throw updateError;

    var { data: updatedBusiness } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    res.json({
      success: true,
      message: 'Domain verified successfully! Your booking page will now be available at this domain.',
      business: updatedBusiness
    });

  } catch (error) {
    console.error('[DNS] Check verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify domain. Please try again.',
      details: error.message
    });
  }
});

// ============================================================
// UTILITY ROUTES
// ============================================================

app.get('/api/rooms/:id/availability', function(req, res) {
  res.json({ success: true, available: true, roomId: req.params.id });
});

app.get('/', function(req, res) {
  res.send('Booking System API is running!');
});

// ============================================================
// ENSURE ADMIN USER EXISTS
// ============================================================
async function ensureAdminUser() {
  try {
    var { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'admin@bookinghub.com')
      .single();

    if (!existingAdmin) {
      console.log('Creating default admin user...');
      var hashedPassword = await bcrypt.hash('admin123', 10);
      var { error } = await supabase.from('admin_users').insert({
        email: 'admin@bookinghub.com',
        password: 'admin123',
        password_hash: hashedPassword,
        created_at: new Date().toISOString()
      });
      if (error) {
        console.error('Failed to create admin user:', error.message);
      } else {
        console.log('Admin user created: admin@bookinghub.com / admin123');
      }
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.log('Admin user check skipped:', error.message);
  }
}

// ============================================================
// ENSURE SUBSCRIPTION TABLE EXISTS
// ============================================================
async function ensureSubscriptionTable() {
  try {
    // Check if subscription_upgrades table exists
    const { error: checkError } = await supabase
      .from('subscription_upgrades')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Creating subscription_upgrades table...');
      
      // Create the table using raw SQL through Supabase
      const { error: createError } = await supabase.rpc('create_subscription_table');
      
      if (createError) {
        console.log('Please create subscription_upgrades table manually in Supabase SQL Editor:');
        console.log(`
          CREATE TABLE subscription_upgrades (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
            plan VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            payment_reference VARCHAR(255) UNIQUE NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            notes TEXT,
            verified_at TIMESTAMP,
            verified_by UUID,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
          
          CREATE INDEX idx_subscription_business ON subscription_upgrades(business_id);
          CREATE INDEX idx_subscription_status ON subscription_upgrades(status);
          CREATE INDEX idx_subscription_reference ON subscription_upgrades(payment_reference);
        `);
      }
    } else {
      console.log('Subscription upgrades table exists');
    }
  } catch (error) {
    console.log('Subscription table check skipped:', error.message);
  }
}

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, '0.0.0.0', async function() {
  var localIp = getLocalIpAddress();
  console.log('\n========================================');
  console.log('Booking Hub Server Running');
  console.log('========================================');
  console.log('On your COMPUTER: http://localhost:' + PORT);
  console.log('On your PHONE:     http://' + localIp + ':' + PORT);
  if (process.env.NODE_ENV === 'production') {
    console.log('PRODUCTION MODE: Auth enabled, CORS restricted');
  } else {
    console.log('DEVELOPMENT MODE: Auth bypassed, CORS open');
  }
  console.log('========================================\n');
  console.log('Allowed CORS origins: ' + ALLOWED_ORIGINS.join(', '));

  await ensureAdminUser();
  await ensureSubscriptionTable();
});