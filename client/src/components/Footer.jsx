﻿import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = 2026;

  return React.createElement('footer', {
    style: {
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      padding: '32px 24px 24px',
      marginTop: '60px',
      borderTop: '1px solid #1e293b',
      textAlign: 'center'
    }
  },
    React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '20px'
      }
    },
      React.createElement(Link, {
        to: '/privacy',
        style: {
          color: '#94a3b8',
          textDecoration: 'none',
          fontSize: '13px',
          transition: 'color 0.2s'
        },
        onMouseEnter: (e) => e.currentTarget.style.color = '#4F46E5',
        onMouseLeave: (e) => e.currentTarget.style.color = '#94a3b8'
      }, 'Privacy Policy'),
      
      React.createElement(Link, {
        to: '/terms',
        style: {
          color: '#94a3b8',
          textDecoration: 'none',
          fontSize: '13px',
          transition: 'color 0.2s'
        },
        onMouseEnter: (e) => e.currentTarget.style.color = '#4F46E5',
        onMouseLeave: (e) => e.currentTarget.style.color = '#94a3b8'
      }, 'Terms of Service'),
      
      React.createElement(Link, {
        to: '/refund',
        style: {
          color: '#94a3b8',
          textDecoration: 'none',
          fontSize: '13px',
          transition: 'color 0.2s'
        },
        onMouseEnter: (e) => e.currentTarget.style.color = '#4F46E5',
        onMouseLeave: (e) => e.currentTarget.style.color = '#94a3b8'
      }, 'Refund Policy'),
      
      React.createElement(Link, {
        to: '/cookies',
        style: {
          color: '#94a3b8',
          textDecoration: 'none',
          fontSize: '13px',
          transition: 'color 0.2s'
        },
        onMouseEnter: (e) => e.currentTarget.style.color = '#4F46E5',
        onMouseLeave: (e) => e.currentTarget.style.color = '#94a3b8'
      }, 'Cookie Policy')
    ),
    
    React.createElement('p', {
      style: {
        fontSize: '11px',
        color: '#64748b',
        margin: 0
      }
    }, '&copy; 2026 Booking Hub. All rights reserved. Built for Nigerian businesses.')
  );
}

export default Footer;