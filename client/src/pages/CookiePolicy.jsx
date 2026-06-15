import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';

function CookiePolicy() {
  return React.createElement('div', {
    style: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 24px',
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    }
  },
    React.createElement(Link, {
      to: '/',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#4F46E5',
        textDecoration: 'none',
        fontSize: '14px',
        marginBottom: '32px'
      }
    },
      React.createElement(ArrowLeft, { size: 16 }),
      'Back to Home'
    ),

    React.createElement('div', {
      style: {
        textAlign: 'center',
        marginBottom: '40px'
      }
    },
      React.createElement('div', {
        style: {
          width: '56px',
          height: '56px',
          backgroundColor: '#EEF2FF',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }
      },
        React.createElement(Cookie, { size: 28, color: '#4F46E5' })
      ),
      React.createElement('h1', { style: { fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' } }, 'Cookie Policy'),
      React.createElement('p', { style: { color: '#64748b', fontSize: '14px' } }, 'Last updated: June 2026')
    ),

    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '24px' } },
      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '1. What Are Cookies'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences and improve your experience.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '2. How We Use Cookies'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Authentication: Remembering your login status'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Preferences: Saving your language and region'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Analytics: Understanding how you use our platform'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Security: Protecting against fraud')
        )
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '3. Types of Cookies We Use'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Essential cookies: Required for the platform to function'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Functional cookies: Remember your preferences'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Analytics cookies: Help us improve our platform')
        )
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '4. Managing Cookies'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'You can disable cookies in your browser settings. However, disabling essential cookies may prevent Booking Hub from working properly.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '5. Third-Party Cookies'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'We use Paystack for payments, which may set its own cookies. We do not control third-party cookies.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '6. Changes to This Policy'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'We may update this Cookie Policy. Changes will be posted on this page.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '7. Contact Us'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'Questions? Email: hello@bookinghub.com')
      )
    )
  );
}

export default CookiePolicy;
