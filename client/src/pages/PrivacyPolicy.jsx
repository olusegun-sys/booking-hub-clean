import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

function PrivacyPolicy() {
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
        React.createElement(Shield, { size: 28, color: '#4F46E5' })
      ),
      React.createElement('h1', {
        style: {
          fontSize: '28px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '8px'
        }
      }, 'Privacy Policy'),
      React.createElement('p', {
        style: {
          color: '#64748b',
          fontSize: '14px'
        }
      }, 'Last updated: June 2026')
    ),

    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '24px' } },
      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '1. Introduction'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' } }, 'Booking Hub ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'By using Booking Hub, you consent to the data practices described in this policy.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '2. Information We Collect'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' } }, 'We collect:'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px', marginBottom: '12px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Business information: name, email, phone, address, business type'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Customer information: name, email, phone, booking details'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Payment information: processed by Paystack (we do not store card details)'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Usage data: pages visited, booking history')
        )
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '3. How We Use Your Information'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• To process and manage bookings'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• To send booking confirmations and updates'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• To improve our platform'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• To comply with Nigerian law')
        )
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '4. Information Sharing'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• With businesses you book from'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• With Paystack for payment processing'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• When required by Nigerian law')
        )
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '5. Data Security'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'We use HTTPS encryption, secure database connections, and regular security audits. However, no method is 100% secure.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '6. Your Rights (NDPR)'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Access your personal data'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Request correction of inaccurate data'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Request deletion of your data'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Withdraw consent for marketing')
        ),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginTop: '12px' } }, 'Email: hello@bookinghub.com')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '7. Cookies'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'We use cookies to remember your login status and preferences. You can disable cookies in your browser settings.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '8. Contact Us'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'Email: hello@bookinghub.com')
      )
    )
  );
}

export default PrivacyPolicy;
