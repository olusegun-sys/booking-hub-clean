// client/src/App.jsx
// =============================================
// COMPLETE APP - WITH OWNER PROPERTIES ROUTE
// =============================================

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

// ── Emmanuel's Plazzaa redesign pages (reconciliation branch) ─────────
// WHY: his design lives in ./plazzaa/ and needs its own CSS + Tailwind
// tokens loaded alongside the legacy styles. We import his pages here so
// they can be registered as routes in the Routes block below.
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

function LoginPage() {
  var navigate = useNavigate();

  function handleClose() {
    navigate('/');
  }

  return React.createElement('div', { className: 'modal-overlay', style: { display: 'flex' } },
    React.createElement(BusinessLogin, { onClose: handleClose })
  );
}

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

function App() {
  return React.createElement(Router, null,
    React.createElement(Toaster, null),
    React.createElement(Routes, null,
      // ── Legacy routes — untouched for now ──────────────────────────
      React.createElement(Route, { path: '/', element: React.createElement(HomePage, null) }),
      React.createElement(Route, { path: '/become-host', element: React.createElement(HostLanding, null) }),
      React.createElement(Route, { path: '/signup', element: React.createElement(BusinessSignup, null) }),
      React.createElement(Route, { path: '/login', element: React.createElement(LoginPage, null) }),
      React.createElement(Route, { path: '/dashboard', element: React.createElement(DashboardPage, null) }),
      React.createElement(Route, { path: '/book/:businessSlug', element: React.createElement(UnifiedBookingPage, null) }),
      React.createElement(Route, { path: '/owner/:businessId/properties', element: React.createElement(OwnerPropertiesPage, null) }),
      React.createElement(Route, { path: '/admin', element: React.createElement(AdminRoute, null) }),

      // ── Emmanuel's redesign — new routes, additive only ────────────
      // WHY: his pages live at paths that don't clash with legacy routes.
      // /landing, /plazzaa-login, /plazzaa-signup, /explore, /for-business,
      // /merchant, /plazzaa-book — all new, all reachable for testing.
      // Once Seam 2 promotes his Landing to /, we remove the /landing alias.
      React.createElement(Route, { path: '/landing', element: React.createElement(PlazzaaLanding, null) }),
      React.createElement(Route, { path: '/plazzaa-login', element: React.createElement(PlazzaaLogin, null) }),
      React.createElement(Route, { path: '/plazzaa-signup', element: React.createElement(PlazzaaSignup, null) }),
      React.createElement(Route, { path: '/explore', element: React.createElement(PlazzaaExplore, null) }),
      React.createElement(Route, { path: '/for-business', element: React.createElement(PlazzaaForBusiness, null) }),
      React.createElement(Route, { path: '/merchant', element: React.createElement(PlazzaaMerchantDashboard, null) }),
      React.createElement(Route, { path: '/plazzaa-book/:businessSlug', element: React.createElement(PlazzaaBookingPage, null) })
    )
  );
}

export default App;