// client/src/App.jsx
// =============================================
// COMPLETE APP — RECONCILIATION BRANCH (15 Oct 2026)
// =============================================
// Routing strategy:
//   MARKETING  → Emmanuel's polished Plazzaa pages
//   PRODUCT    → our legacy pages (BusinessDashboard, UnifiedBookingPage)
//
// WHY: his design is the stronger marketing front door. Our pages
// carry the actual product logic — multi-business-type config, the
// RoomPage editor, the downloadable-receipt booking flow, the
// subscription system. Splitting the two by function gives users
// the polish of one and the substance of the other. His product
// pages remain reachable on /his-* routes for reference during the
// restyle phase (Seam 6).

import React from 'react';
import { Toaster } from 'react-hot-toast';
import './styles.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import BusinessLogin from './BusinessLogin';
import BusinessDashboard from './BusinessDashboard';
import UnifiedBookingPage from './UnifiedBookingPage';
import OwnerPropertiesPage from './OwnerPropertiesPage';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import HostLanding from './HostLanding';
import BusinessSignup from './BusinessSignup';
import API_BASE from './config';

// ── Emmanuel's Plazzaa redesign pages ────────────────────────────────
// His design lives in ./plazzaa/ and needs its own CSS + Tailwind
// tokens loaded alongside the legacy styles. His pages are imported
// here so they can be registered as routes in the Routes block below.
import './plazzaa/plazzaa.css';
import PlazzaaLanding from './plazzaa/pages/Landing';
import PlazzaaLogin from './plazzaa/pages/Login';
import PlazzaaSignup from './plazzaa/pages/Signup';
import PlazzaaExplore from './plazzaa/pages/Explore';
import PlazzaaForBusiness from './plazzaa/pages/ForBusiness';
import PlazzaaBookingPage from './plazzaa/pages/BookingPage';
import PlazzaaMerchantDashboard from './plazzaa/dashboard/MerchantDashboard';

var _useState = React.useState;
var _useEffect = React.useEffect;

// ── Admin gatekeeping ────────────────────────────────────────────────
// Wraps the admin dashboard with a login check. Reads the `admin`
// object from localStorage; if missing, shows the login screen.
function AdminRoute() {
  var navigate = useNavigate();
  var _useStateAdmin = _useState(null);
  var admin = _useStateAdmin[0];
  var setAdmin = _useStateAdmin[1];
  var _useStateLoading = _useState(true);
  var isLoading = _useStateLoading[0];
  var setIsLoading = _useStateLoading[1];

  _useEffect(function() {
    try {
      var savedAdmin = localStorage.getItem('admin');
      if (savedAdmin && savedAdmin !== 'undefined') {
        var parsed = JSON.parse(savedAdmin);
        setAdmin(parsed);
      }
    } catch (err) {
      console.error('Error reading admin from localStorage:', err);
    }
    setIsLoading(false);
  }, []);

  function handleAdminLogin(adminData) {
    setAdmin(adminData);
    try {
      localStorage.setItem('admin', JSON.stringify(adminData));
    } catch (err) {
      console.error('Error saving admin to localStorage:', err);
    }
  }

  function handleAdminLogout() {
    setAdmin(null);
    try {
      localStorage.removeItem('admin');
    } catch (err) {
      console.error('Error removing admin from localStorage:', err);
    }
    navigate('/admin');
  }

  if (isLoading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  if (!admin) {
    return React.createElement(AdminLogin, { onLogin: handleAdminLogin });
  }

  return React.createElement(AdminDashboard, { admin: admin, onLogout: handleAdminLogout });
}

// ── Legacy login page (kept on /legacy-login) ────────────────────────
// The default /login now shows Emmanuel's page. This renders the old
// modal as a full page for anyone who prefers it or needs to compare.
function LoginPage() {
  var navigate = useNavigate();

  function handleClose() {
    navigate('/');
  }

  return React.createElement('div', { className: 'modal-overlay', style: { display: 'flex' } },
    React.createElement(BusinessLogin, { onClose: handleClose })
  );
}

// ── Dashboard page — OUR BusinessDashboard ───────────────────────────
// This is the default merchant experience. Reads `currentBusiness`
// from localStorage; if missing, redirects to /login. Renders the
// BusinessDashboard which contains:
//   - Menu & Services (RoomPage, 6 tabs)
//   - Bookings manager
//   - Profile
//   - Settings
//   - Subscription plans
//   - Copy Booking Link card
// Every one of those is currently missing from Emmanuel's redesign.
function DashboardPage() {
  var navigate = useNavigate();
  var _useStateBiz = _useState(null);
  var business = _useStateBiz[0];
  var setBusiness = _useStateBiz[1];
  var _useStateLoading = _useState(true);
  var isLoading = _useStateLoading[0];
  var setIsLoading = _useStateLoading[1];

  _useEffect(function() {
    try {
      var saved = localStorage.getItem('currentBusiness');
      if (saved && saved !== 'undefined') {
        setBusiness(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error reading business from localStorage:', err);
    }
    setIsLoading(false);
  }, []);

  _useEffect(function() {
    if (!isLoading && !business) {
      navigate('/login', { replace: true });
    }
  }, [business, isLoading, navigate]);

  function handleLogout() {
    try {
      // WHY: clear both token scopes so a re-open can't silently
      // re-authenticate. The legacy app only wrote business_token,
      // but Emmanuel's Login writes both — so we clear both.
      localStorage.removeItem('business_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentBusiness');
    } catch (err) {
      console.error('Error removing business from localStorage:', err);
    }
    navigate('/', { replace: true });
  }

  if (isLoading) {
    return React.createElement('div', { className: 'app-container' },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  if (!business) {
    return null;
  }

  return React.createElement(BusinessDashboard, {
    business: business,
    onLogout: handleLogout
  });
}

// ── Main app ─────────────────────────────────────────────────────────
function App() {
  return React.createElement(Router, null,
    React.createElement(Toaster, null),
    React.createElement(Routes, null,
      // ── Marketing — Emmanuel's polished pages ─────────────────────
      // WHY: his Landing, Login, Signup, Explore and ForBusiness are
      // the strongest marketing surfaces. Users land on these.
      React.createElement(Route, { path: '/', element: React.createElement(PlazzaaLanding, null) }),
      React.createElement(Route, { path: '/login', element: React.createElement(PlazzaaLogin, null) }),
      React.createElement(Route, { path: '/signup', element: React.createElement(PlazzaaSignup, null) }),
      React.createElement(Route, { path: '/explore', element: React.createElement(PlazzaaExplore, null) }),
      React.createElement(Route, { path: '/for-business', element: React.createElement(PlazzaaForBusiness, null) }),

      // ── Merchant dashboard — OURS ─────────────────────────────────
      // WHY: our BusinessDashboard has the RoomPage (Menu & Services),
      // the multi-business-type config, subscription management, and
      // Copy Booking Link. His merchant dashboard doesn't yet reach
      // any of that. Merchants need working tools, not just polish.
      // Gets restyled in Seam 6 to match his visual language.
      React.createElement(Route, { path: '/dashboard', element: React.createElement(DashboardPage, null) }),

      // ── Public booking — OURS ─────────────────────────────────────
      // WHY: our UnifiedBookingPage is business-type-aware, shows the
      // full gallery/features/amenities/area guide, and produces the
      // downloadable PNG receipt. His 4-step booking flow only handles
      // one type of business (slots). Merchants depend on multi-type.
      // Also restyled in Seam 6.
      React.createElement(Route, { path: '/book/:businessSlug', element: React.createElement(UnifiedBookingPage, null) }),

      // ── Admin — OURS, unchanged ───────────────────────────────────
      React.createElement(Route, { path: '/admin', element: React.createElement(AdminRoute, null) }),

      // ── Legacy fallbacks — kept during reconciliation ─────────────
      // WHY: insurance. If any route breaks during restyle, users can
      // fall back here without a redeploy. Deleted once Seams 6–7 ship.
      React.createElement(Route, { path: '/legacy-home', element: React.createElement(HomePage, null) }),
      React.createElement(Route, { path: '/legacy-login', element: React.createElement(LoginPage, null) }),
      React.createElement(Route, { path: '/legacy-signup', element: React.createElement(BusinessSignup, null) }),
      React.createElement(Route, { path: '/legacy-dashboard', element: React.createElement(DashboardPage, null) }),
      React.createElement(Route, { path: '/legacy-book/:businessSlug', element: React.createElement(UnifiedBookingPage, null) }),

      // ── His product pages — reference during restyle ──────────────
      // WHY: so you can open his dashboard and booking flow side by
      // side with ours while restyling. Delete these routes once
      // Seam 6 is done.
      React.createElement(Route, { path: '/his-dashboard', element: React.createElement(PlazzaaMerchantDashboard, null) }),
      React.createElement(Route, { path: '/his-book/:businessSlug', element: React.createElement(PlazzaaBookingPage, null) }),

      // ── Other preserved routes ────────────────────────────────────
      React.createElement(Route, { path: '/become-host', element: React.createElement(HostLanding, null) }),
      React.createElement(Route, { path: '/owner/:businessId/properties', element: React.createElement(OwnerPropertiesPage, null) })
    )
  );
}

export default App;