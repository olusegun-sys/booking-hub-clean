// FILE: client/src/AdminLogin.jsx
// RESTYLED 20 Oct 2026 (Session 3 companion to AdminDashboard restyle)
// Unifies visual language with PLZ tokens. No auth logic changed.
// One behavioural fix: password validation now only checks "is empty"
// (message was misleading — it said "please enter" while rejecting
// 1-2 character passwords; that's the server's job to reject).

import React, { useState } from 'react';
import { X, LogIn, Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import API_BASE from './config';

// ============================================================
// DESIGN TOKENS — matches Plazzaa marketing design
// ============================================================
const PLZ = {
  blue: '#2D60EA',
  blueDeep: '#1F47B4',
  blueTint: '#E8F4FF',
  ink: '#18181B',
  body: '#52525B',
  muted: '#A1A1AA',
  line: '#E4E4E7',
  surface: '#F4F4F5',
  danger: '#C0395A',
  dangerTint: '#FCECEF',
  radiusSm: '10px',
  radiusLg: '16px',
  radiusXl: '24px',
  font: "'Manrope', 'Inter', system-ui, -apple-system, sans-serif",
  shadowMd: '0 8px 24px rgba(15, 23, 42, 0.06)',
  shadowLg: '0 24px 64px rgba(15, 23, 42, 0.08)',
  backdrop: 'rgba(15, 23, 42, 0.7)'
};

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    // WHY: only check "is empty" — 1-2 char passwords may be valid for
    // legacy admin accounts. Server is the authority on password strength.
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_BASE + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        if (data.token) {
          // WHY: Admin token stored under 'admin_token' — separate from the
          // business token so logging into a business doesn't overwrite this.
          localStorage.setItem('admin_token', data.token);
        }
        localStorage.setItem('admin', JSON.stringify(data.admin));
        if (onLogin) onLogin(data.admin);
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const goHome = () => {
    window.location.href = '/';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return React.createElement('div', {
    className: 'modal-overlay',
    style: {
      display: 'flex',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: PLZ.backdrop,
      backdropFilter: 'blur(4px)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: PLZ.font
    }
  },
    React.createElement('div', {
      className: 'modal-content',
      style: {
        maxWidth: '440px',
        width: '90%',
        padding: 0,
        background: 'white',
        borderRadius: PLZ.radiusXl,
        overflow: 'hidden',
        animation: 'modalSlideIn 0.3s ease',
        position: 'relative',
        margin: '16px',
        boxShadow: PLZ.shadowLg
      }
    },
      // CLOSE BUTTON
      React.createElement('button', {
        type: 'button',
        onClick: goHome,
        style: {
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: PLZ.surface,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: PLZ.muted,
          zIndex: 10,
          transition: 'all 0.2s ease'
        },
        onMouseEnter: (e) => { e.currentTarget.style.background = PLZ.line; },
        onMouseLeave: (e) => { e.currentTarget.style.background = PLZ.surface; }
      }, React.createElement(X, { size: 16 })),

      // HEADER (Shield + Title)
      React.createElement('div', { style: { padding: '2rem 2rem 0 2rem', textAlign: 'center' } },
        React.createElement('div', { style: { width: '56px', height: '56px', background: PLZ.blueTint, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' } },
          React.createElement(Shield, { size: 28, color: PLZ.blue })
        ),
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '700', color: PLZ.ink, marginBottom: '0.25rem' } }, 'Admin Access'),
        React.createElement('p', { style: { fontSize: '0.875rem', color: PLZ.muted } }, 'Secure portal for platform administrators')
      ),

      // FORM
      React.createElement('div', { style: { padding: '1.5rem 2rem 2rem 2rem' } },
        // ERROR BANNER
        error && React.createElement('div', { style: { background: PLZ.dangerTint, border: `1px solid ${PLZ.danger}`, borderRadius: PLZ.radiusSm, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem', color: PLZ.danger, textAlign: 'center' } }, error),

        // EMAIL FIELD
        React.createElement('div', { style: { marginBottom: '1rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: PLZ.body, marginBottom: '0.375rem' } }, 'Email Address'),
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement(Mail, { size: 16, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: PLZ.muted } }),
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: (e) => setEmail(e.target.value),
              onKeyDown: handleKeyPress,
              placeholder: 'admin@example.com',
              style: {
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: `1.5px solid ${PLZ.line}`,
                borderRadius: PLZ.radiusSm,
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                color: PLZ.ink
              },
              onFocus: (e) => { e.currentTarget.style.borderColor = PLZ.blue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45, 96, 234, 0.1)'; },
              onBlur: (e) => { e.currentTarget.style.borderColor = PLZ.line; e.currentTarget.style.boxShadow = 'none'; }
            })
          )
        ),

        // PASSWORD FIELD
        React.createElement('div', { style: { marginBottom: '1.5rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: PLZ.body, marginBottom: '0.375rem' } }, 'Password'),
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement(Lock, { size: 16, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: PLZ.muted } }),
            React.createElement('input', {
              type: showPassword ? 'text' : 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              onKeyDown: handleKeyPress,
              placeholder: 'Enter your password',
              style: {
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: `1.5px solid ${PLZ.line}`,
                borderRadius: PLZ.radiusSm,
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                color: PLZ.ink
              },
              onFocus: (e) => { e.currentTarget.style.borderColor = PLZ.blue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45, 96, 234, 0.1)'; },
              onBlur: (e) => { e.currentTarget.style.borderColor = PLZ.line; e.currentTarget.style.boxShadow = 'none'; }
            }),
            React.createElement('button', {
              type: 'button',
              onClick: () => setShowPassword(!showPassword),
              style: {
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: PLZ.muted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              },
              onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = PLZ.surface; },
              onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
            }, showPassword ? React.createElement(EyeOff, { size: 16 }) : React.createElement(Eye, { size: 16 }))
          )
        ),

        // SUBMIT BUTTON
        React.createElement('button', {
          type: 'button',
          onClick: handleSubmit,
          disabled: loading,
          style: {
            width: '100%',
            padding: '0.75rem',
            background: loading ? PLZ.muted : PLZ.blue,
            color: 'white',
            border: 'none',
            borderRadius: PLZ.radiusSm,
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          },
          onMouseEnter: (e) => { if (!loading) e.currentTarget.style.background = PLZ.blueDeep; },
          onMouseLeave: (e) => { if (!loading) e.currentTarget.style.background = PLZ.blue; }
        }, loading ? 'Logging in...' : [React.createElement(LogIn, { key: 'icon', size: 16 }), ' Login as Admin']),

        // FOOTER LINK
        React.createElement('p', { style: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: PLZ.muted } },
          'Return to ',
          React.createElement('a', {
            href: '/',
            onClick: (e) => { e.preventDefault(); window.location.href = '/'; },
            style: { color: PLZ.blue, textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }
          }, 'Homepage')
        )
      )
    )
  );
}

export default AdminLogin;