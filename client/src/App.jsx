import React from 'react';
import { Toaster } from 'react-hot-toast';
import './styles.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import BusinessLogin from './BusinessLogin';
import BusinessDashboard from './BusinessDashboard';
import UnifiedBookingPage from './UnifiedBookingPage';
import AdminDashboard from './AdminDashboard';
import HostLanding from './HostLanding';
import BusinessSignup from './BusinessSignup';
import API_BASE from './config';

var _useState = React.useState;
var _useEffect = React.useEffect;

// Simple visible login form - no modal, works on mobile
function SimpleAdminLogin({ onLogin }) {
  var _useStateEmail = _useState('');
  var email = _useStateEmail[0];
  var setEmail = _useStateEmail[1];
  var _useStatePassword = _useState('');
  var password = _useStatePassword[0];
  var setPassword = _useStatePassword[1];
  var _useStateError = _useState('');
  var error = _useStateError[0];
  var setError = _useStateError[1];
  var _useStateLoading = _useState(false);
  var loading = _useStateLoading[0];
  var setLoading = _useStateLoading[1];
  var _useStateShowPassword = _useState(false);
  var showPassword = _useStateShowPassword[0];
  var setShowPassword = _useStateShowPassword[1];

  function handleSubmit() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 3) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true);
    setError('');

    fetch(API_BASE + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        if (data.success) {
          localStorage.setItem('admin', JSON.stringify(data.admin));
          if (onLogin) onLogin(data.admin);
        } else {
          setError(data.error || 'Invalid credentials');
        }
      })
      .catch(function(err) {
        console.error('Login error:', err);
        setError('Something went wrong. Please try again.');
      })
      .finally(function() {
        setLoading(false);
      });
  }

  function toggleShowPassword() {
    setShowPassword(!showPassword);
  }

  return React.createElement('div', { style: { 
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fb',
    padding: '20px'
  } },
    React.createElement('div', { style: { 
      maxWidth: '400px', 
      width: '100%',
      padding: '40px 30px', 
      background: 'white', 
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      textAlign: 'center'
    } },
      React.createElement('div', { style: { width: '56px', height: '56px', background: '#EEF2FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' } },
        React.createElement('span', { style: { fontSize: '28px' } }, '🔐')
      ),
      React.createElement('h2', { style: { marginBottom: '8px', fontSize: '24px', fontWeight: '700', color: '#1e293b' } }, 'Admin Login'),
      React.createElement('p', { style: { marginBottom: '24px', color: '#64748b', fontSize: '14px' } }, 'Secure portal for platform administrators'),
      
      error && React.createElement('div', { style: { background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' } }, error),
      
      React.createElement('input', {
        type: 'email',
        placeholder: 'Email Address',
        value: email,
        onChange: function(e) { setEmail(e.target.value); },
        style: { 
          width: '100%', 
          padding: '14px', 
          marginBottom: '16px', 
          border: '1px solid #e2e8f0', 
          borderRadius: '10px', 
          fontSize: '14px', 
          boxSizing: 'border-box',
          outline: 'none',
          backgroundColor: '#ffffff',
          color: '#1e293b'
        },
        onFocus: function(e) { e.target.style.borderColor = '#4F46E5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
        onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
      }),
      
      React.createElement('div', { style: { position: 'relative', marginBottom: '24px' } },
        React.createElement('input', {
          type: showPassword ? 'text' : 'password',
          placeholder: 'Password',
          value: password,
          onChange: function(e) { setPassword(e.target.value); },
          onKeyPress: function(e) { if (e.key === 'Enter') handleSubmit(); },
          style: { 
            width: '100%', 
            padding: '14px', 
            paddingRight: '44px',
            border: '1px solid #e2e8f0', 
            borderRadius: '10px', 
            fontSize: '14px', 
            boxSizing: 'border-box',
            outline: 'none',
            backgroundColor: '#ffffff',
            color: '#1e293b'
          },
          onFocus: function(e) { e.target.style.borderColor = '#4F46E5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
          onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
        }),
        React.createElement('button', {
          type: 'button',
          onClick: toggleShowPassword,
          style: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          },
          onMouseEnter: function(e) { e.currentTarget.style.backgroundColor = '#f1f5f9'; },
          onMouseLeave: function(e) { e.currentTarget.style.backgroundColor = 'transparent'; }
        }, showPassword ? [
          React.createElement('svg', { key: 'eye-slash', width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
            React.createElement('path', { d: 'M9.88 9.88a3 3 0 1 0 4.24 4.24' }),
            React.createElement('path', { d: 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' }),
            React.createElement('path', { d: 'M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' }),
            React.createElement('line', { x1: '2', y1: '2', x2: '22', y2: '22' })
          )
        ] : [
          React.createElement('svg', { key: 'eye', width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
            React.createElement('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
            React.createElement('circle', { cx: '12', cy: '12', r: '3' })
          )
        ])
      ),
      
      React.createElement('button', {
        onClick: handleSubmit,
        disabled: loading,
        style: { 
          width: '100%', 
          padding: '14px', 
          background: loading ? '#94a3b8' : '#4F46E5', 
          color: 'white', 
          border: 'none', 
          borderRadius: '10px', 
          fontSize: '16px', 
          fontWeight: '600', 
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s'
        },
        onMouseEnter: function(e) { if (!loading) e.currentTarget.style.background = '#4338CA'; },
        onMouseLeave: function(e) { if (!loading) e.currentTarget.style.background = '#4F46E5'; }
      }, loading ? 'Logging in...' : 'Login')
    )
  );
}

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
    return React.createElement(SimpleAdminLogin, { onLogin: handleAdminLogin });
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
      React.createElement(Route, { path: '/', element: React.createElement(HomePage, null) }),
      React.createElement(Route, { path: '/become-host', element: React.createElement(HostLanding, null) }),
      React.createElement(Route, { path: '/signup', element: React.createElement(BusinessSignup, null) }),
      React.createElement(Route, { path: '/login', element: React.createElement(LoginPage, null) }),
      React.createElement(Route, { path: '/dashboard', element: React.createElement(DashboardPage, null) }),
      React.createElement(Route, { path: '/book/:businessSlug', element: React.createElement(UnifiedBookingPage, null) }),
      React.createElement(Route, { path: '/admin', element: React.createElement(AdminRoute, null) })
    )
  );
}

export default App;