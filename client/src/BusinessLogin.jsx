﻿import React from 'react';
import { Building2, X, LogIn, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import API_BASE from './config';

var BusinessLogin = function (props) {
  var _useState = React.useState('owner');
  var loginType = _useState[0];
  var setLoginType = _useState[1];
  var _useState2 = React.useState('');
  var email = _useState2[0];
  var setEmail = _useState2[1];
  var _useState3 = React.useState('');
  var password = _useState3[0];
  var setPassword = _useState3[1];
  var _useState4 = React.useState(false);
  var showPassword = _useState4[0];
  var setShowPassword = _useState4[1];
  var _useState5 = React.useState(false);
  var loading = _useState5[0];
  var setLoading = _useState5[1];
  var _useState6 = React.useState('');
  var error = _useState6[0];
  var setError = _useState6[1];

  function closeModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.location.href = '/';
  }

  React.useEffect(function () {
    function handleEscKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        window.location.href = '/';
      }
    }
    document.addEventListener('keydown', handleEscKey);
    return function () {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  function handleLogin() {
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

    fetch(API_BASE + '/api/businesses/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, loginType: loginType })
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.success && data.business) {
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }
          localStorage.setItem('currentBusiness', JSON.stringify(data.business));
          window.location.href = '/dashboard';
        } else {
          setError(data.error || 'Login failed. Please check your credentials.');
        }
        setLoading(false);
      })
      .catch(function () {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      });
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  }

  return React.createElement('div', {
    className: 'modal-overlay',
    onClick: closeModal,
    style: { background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }
  },
    React.createElement('div', {
      className: 'modal-content',
      onClick: function (e) { e.stopPropagation(); },
      style: { 
        maxWidth: '440px', 
        width: '90%', 
        padding: 0,
        background: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.3s ease'
      }
    },
      React.createElement('button', {
        type: 'button',
        onClick: closeModal,
        style: { 
          position: 'absolute', 
          top: '16px', 
          right: '16px', 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          background: '#f1f5f9', 
          border: 'none', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#64748b',
          zIndex: 10
        }
      }, React.createElement(X, { size: 16 })),

      React.createElement('div', { style: { padding: '2rem 2rem 0 2rem', textAlign: 'center' } },
        React.createElement('div', { style: { width: '48px', height: '48px', background: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' } },
          React.createElement(Building2, { size: 24, color: '#4f46e5' })
        ),
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' } }, 'Welcome back'),
        React.createElement('p', { style: { fontSize: '0.875rem', color: '#64748b' } }, 'Sign in to manage your bookings')
      ),

      React.createElement('div', { style: { padding: '1.5rem 2rem 2rem 2rem' } },
        React.createElement('div', { style: { display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' } },
          React.createElement('button', {
            type: 'button',
            onClick: function () { setLoginType('owner'); setError(''); },
            style: { 
              flex: 1, 
              padding: '0.5rem', 
              border: 'none', 
              background: loginType === 'owner' ? 'white' : 'transparent', 
              borderRadius: '8px', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: loginType === 'owner' ? '#4f46e5' : '#64748b', 
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: loginType === 'owner' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
            }
          }, 'Business Owner'),
          React.createElement('button', {
            type: 'button',
            onClick: function () { setLoginType('staff'); setError(''); },
            style: { 
              flex: 1, 
              padding: '0.5rem', 
              border: 'none', 
              background: loginType === 'staff' ? 'white' : 'transparent', 
              borderRadius: '8px', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: loginType === 'staff' ? '#4f46e5' : '#64748b', 
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: loginType === 'staff' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
            }
          }, 'Staff')
        ),

        error && React.createElement('div', { style: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#dc2626', textAlign: 'center' } }, error),

        React.createElement('div', { style: { marginBottom: '1rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'Email'),
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement(Mail, { size: 16, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' } }),
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: function (e) { setEmail(e.target.value); },
              onKeyDown: handleKeyPress,
              placeholder: 'test@hotel.com',
              style: { 
                width: '100%', 
                padding: '0.75rem 1rem 0.75rem 2.5rem', 
                border: '1.5px solid #e2e8f0', 
                borderRadius: '10px', 
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              },
              onFocus: function(e) { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
              onBlur: function(e) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }
            })
          )
        ),

        React.createElement('div', { style: { marginBottom: '1rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'Password'),
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement(Lock, { size: 16, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' } }),
            React.createElement('input', {
              type: showPassword ? 'text' : 'password',
              value: password,
              onChange: function (e) { setPassword(e.target.value); },
              onKeyDown: handleKeyPress,
              placeholder: 'Enter your password',
              style: { 
                width: '100%', 
                padding: '0.75rem 1rem 0.75rem 2.5rem', 
                border: '1.5px solid #e2e8f0', 
                borderRadius: '10px', 
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              },
              onFocus: function(e) { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
              onBlur: function(e) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }
            }),
            React.createElement('button', {
              type: 'button',
              onClick: function (e) {
                e.preventDefault();
                e.stopPropagation();
                setShowPassword(function (prev) { return !prev; });
              },
              style: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }
            }, showPassword ? React.createElement(EyeOff, { size: 16 }) : React.createElement(Eye, { size: 16 }))
          )
        ),

        React.createElement('p', { style: { fontSize: '0.7rem', color: '#94a3b8', marginBottom: '1.5rem', textAlign: 'center' } }, 
          'Demo: test@hotel.com / any password'
        ),

        React.createElement('button', {
          type: 'button',
          onClick: handleLogin,
          disabled: loading,
          style: { 
            width: '100%', 
            padding: '0.75rem', 
            background: loading ? '#94a3b8' : '#4f46e5', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }
        }, loading ? 'Signing in...' : [React.createElement(LogIn, { key: 'icon', size: 16 }), ' Login as ' + (loginType === 'owner' ? 'Owner' : 'Staff')]),

        React.createElement('p', { style: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8' } }, 
          "Don't have an account? ", 
          React.createElement('a', { 
            href: '/signup', 
            onClick: function(e) { e.preventDefault(); window.location.href = '/signup'; },
            style: { color: '#4f46e5', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' } 
          }, 'Sign up free →')
        )
      )
    )
  );
};

export default BusinessLogin;