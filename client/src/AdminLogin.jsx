import React, { useState } from 'react';
import { X, LogIn, Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import API_BASE from './config';

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
    if (!password || password.length < 3) {
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
          localStorage.setItem('auth_token', data.token);
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
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }
  },
    React.createElement('div', {
      className: 'modal-content',
      style: { 
        maxWidth: '440px', 
        width: '90%', 
        padding: 0,
        background: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.3s ease',
        position: 'relative',
        margin: '16px'
      }
    },
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
          background: '#f1f5f9', 
          border: 'none', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#64748b',
          zIndex: 10,
          transition: 'all 0.2s ease'
        },
        onMouseEnter: (e) => { e.currentTarget.style.background = '#e2e8f0'; },
        onMouseLeave: (e) => { e.currentTarget.style.background = '#f1f5f9'; }
      }, React.createElement(X, { size: 16 })),

      React.createElement('div', { style: { padding: '2rem 2rem 0 2rem', textAlign: 'center' } },
        React.createElement('div', { style: { width: '56px', height: '56px', background: '#EEF2FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' } },
          React.createElement(Shield, { size: 28, color: '#4F46E5' })
        ),
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' } }, 'Admin Access'),
        React.createElement('p', { style: { fontSize: '0.875rem', color: '#64748b' } }, 'Secure portal for platform administrators')
      ),

      React.createElement('div', { style: { padding: '1.5rem 2rem 2rem 2rem' } },
        error && React.createElement('div', { style: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#dc2626', textAlign: 'center' } }, error),

        React.createElement('div', { style: { marginBottom: '1rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'Email Address'),
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement(Mail, { size: 16, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' } }),
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: (e) => setEmail(e.target.value),
              onKeyDown: handleKeyPress,
              placeholder: 'admin@example.com',
              style: { 
                width: '100%', 
                padding: '0.75rem 1rem 0.75rem 2.5rem', 
                border: '1.5px solid #e2e8f0', 
                borderRadius: '10px', 
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              },
              onFocus: (e) => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
              onBlur: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }
            })
          )
        ),

        React.createElement('div', { style: { marginBottom: '1.5rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'Password'),
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement(Lock, { size: 16, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' } }),
            React.createElement('input', {
              type: showPassword ? 'text' : 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              onKeyDown: handleKeyPress,
              placeholder: 'Enter your password',
              style: { 
                width: '100%', 
                padding: '0.75rem 1rem 0.75rem 2.5rem', 
                border: '1.5px solid #e2e8f0', 
                borderRadius: '10px', 
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              },
              onFocus: (e) => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
              onBlur: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }
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
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              },
              onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; },
              onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
            }, showPassword ? React.createElement(EyeOff, { size: 16 }) : React.createElement(Eye, { size: 16 }))
          )
        ),

        React.createElement('button', {
          type: 'button',
          onClick: handleSubmit,
          disabled: loading,
          style: { 
            width: '100%', 
            padding: '0.75rem', 
            background: loading ? '#94a3b8' : '#4F46E5', 
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
            transition: 'all 0.2s ease'
          },
          onMouseEnter: (e) => { if (!loading) e.currentTarget.style.background = '#4338CA'; },
          onMouseLeave: (e) => { if (!loading) e.currentTarget.style.background = '#4F46E5'; }
        }, loading ? 'Logging in...' : [React.createElement(LogIn, { key: 'icon', size: 16 }), ' Login as Admin']),

        React.createElement('p', { style: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8' } }, 
          'Return to ', 
          React.createElement('a', { 
            href: '/', 
            onClick: (e) => { e.preventDefault(); window.location.href = '/'; },
            style: { color: '#4F46E5', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' } 
          }, 'Homepage')
        )
      )
    )
  );
}

export default AdminLogin;