import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

function TermsOfService() {
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
        React.createElement(FileText, { size: 28, color: '#4F46E5' })
      ),
      React.createElement('h1', { style: { fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' } }, 'Terms of Service'),
      React.createElement('p', { style: { color: '#64748b', fontSize: '14px' } }, 'Last updated: June 2026')
    ),

    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '24px' } },
      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '1. Acceptance of Terms'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'By using Booking Hub, you agree to these Terms. If you disagree, do not use our platform.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '2. Eligibility'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'You must be at least 18 years old. Businesses must have a valid Nigerian presence.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '3. Business Accounts'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• You are responsible for account security'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• You must provide accurate business information'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Accounts may be suspended for violations')
        )
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '4. Bookings'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• You agree to pay the advertised price'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Provide accurate contact information'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Booking Hub is not responsible for business cancellations')
        )
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '5. Payments'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'Payments are processed by Paystack. Booking Hub does not store card details. "Pay at Venue" means you pay directly to the business.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '6. Prohibited Conduct'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Posting false information'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Attempting to bypass security'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Harassing other users')
        )
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '7. Termination'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'We may suspend or terminate accounts that violate these terms.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '8. Limitation of Liability'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'Booking Hub is not liable for any damages arising from your use of the platform.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '9. Governing Law'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'These terms are governed by the laws of Nigeria. Disputes shall be resolved in Lagos courts.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '10. Contact'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'Questions? Email: hello@bookinghub.com')
      )
    )
  );
}

export default TermsOfService;
