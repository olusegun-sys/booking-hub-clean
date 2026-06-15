import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';

function RefundPolicy() {
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
        React.createElement(CreditCard, { size: 28, color: '#4F46E5' })
      ),
      React.createElement('h1', { style: { fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' } }, 'Refund & Cancellation Policy'),
      React.createElement('p', { style: { color: '#64748b', fontSize: '14px' } }, 'Last updated: June 2026')
    ),

    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '24px' } },
      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '1. Pay at Venue Bookings'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'For "Pay at Venue" bookings, Booking Hub does not collect payment. Refunds are handled directly between you and the business. Please contact the business directly for cancellations or refunds.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '2. Online Card Payments'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' } }, 'For payments made via card through Paystack:'),
        React.createElement('ul', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '20px' } },
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Refunds are processed by the business, not by Booking Hub'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Contact the business directly for refund requests'),
          React.createElement('li', { style: { marginBottom: '6px' } }, '• Booking Hub can facilitate communication but is not responsible for business refunds')
        )
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '3. Cancellation Policy'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'Cancellation policies vary by business. Always check the business cancellation policy before booking. Some businesses offer free cancellation within a specific window; others may charge a fee.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '4. Dispute Resolution'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'If you have a dispute with a business, please contact them first. Booking Hub can assist with communication but is not liable for business services.')
      ),

      React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' } }, '5. Contact Us'),
        React.createElement('p', { style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' } }, 'For refund-related questions, email: hello@bookinghub.com')
      )
    )
  );
}

export default RefundPolicy;
