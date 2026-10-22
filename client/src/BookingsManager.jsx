// FILE: client/src/BookingsManager.jsx
// RESTYLED 21 Oct 2026 (Session 5 companion to BusinessSettings fix)
// Unifies with PLZ tokens. No logic changes except the scoped-token fix
// documented below (same pattern as RoomPage 7 Oct + BusinessSettings 21 Oct).

import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import BookingCard from './components/ui/BookingCard';
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
  success: '#1B7F43',
  successTint: '#E7F4EC',
  warning: '#B0840F',
  warningTint: '#FBF3DD',
  danger: '#C0395A',
  dangerTint: '#FCECEF',
  radiusSm: '10px',
  radiusMd: '14px',
  radiusLg: '16px',
  radiusXl: '20px',
  font: "'Manrope', 'Inter', system-ui, -apple-system, sans-serif",
  shadowSm: '0 1px 3px rgba(15, 23, 42, 0.04)'
};

// ============================================================
// TOKEN HELPER — matches RoomPage + BusinessSettings fixes
// ============================================================
// WHY: This file was reading only auth_token, producing
// 'Authorization: Bearer null' -> 401 on bookings fetch for any
// account created after the 21 Sept scoped-token refactor.
function getBusinessToken() {
  return (
    localStorage.getItem('business_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    null
  );
}

function BookingsManager({ businessId, bookings: externalBookings, onBookingsUpdate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const token = getBusinessToken();

  useEffect(() => {
    if (externalBookings) {
      setBookings(externalBookings);
      setTotalPages(Math.ceil(externalBookings.length / itemsPerPage));
      setLoading(false);
    } else if (businessId) {
      fetchBookings();
    }
  }, [businessId, externalBookings]);

  function fetchBookings() {
    setLoading(true);
    fetch(API_BASE + '/api/businesses/' + businessId + '/bookings', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBookings(data.bookings || []);
          setTotalPages(Math.ceil((data.bookings?.length || 0) / itemsPerPage));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch bookings error:', err);
        setLoading(false);
      });
  }

  function handleRefresh() {
    fetchBookings();
    if (onBookingsUpdate) onBookingsUpdate();
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price || 0);
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter !== 'all' && booking.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (booking.customer_name && booking.customer_name.toLowerCase().includes(term)) ||
        (booking.booking_reference && booking.booking_reference.toLowerCase().includes(term)) ||
        (booking.customer_email && booking.customer_email.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  };

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '50px' } },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('p', { style: { marginTop: '16px', color: PLZ.muted } }, 'Loading bookings...')
    );
  }

  return React.createElement('div', { style: { fontFamily: PLZ.font } },
    // Stats Cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' } },
      React.createElement('div', { style: { background: 'white', borderRadius: PLZ.radiusLg, padding: '20px', border: `1px solid ${PLZ.line}`, boxShadow: PLZ.shadowSm } },
        React.createElement('h4', { style: { fontSize: '13px', fontWeight: '500', color: PLZ.muted, margin: '0 0 8px 0' } }, 'Total Bookings'),
        React.createElement('p', { style: { fontSize: '28px', fontWeight: '700', color: PLZ.ink, margin: 0 } }, stats.total),
        React.createElement('p', { style: { fontSize: '11px', color: PLZ.success, marginTop: '4px' } }, 'All time')
      ),
      React.createElement('div', { style: { background: 'white', borderRadius: PLZ.radiusLg, padding: '20px', border: `1px solid ${PLZ.line}`, boxShadow: PLZ.shadowSm } },
        React.createElement('h4', { style: { fontSize: '13px', fontWeight: '500', color: PLZ.muted, margin: '0 0 8px 0' } }, 'Confirmed'),
        React.createElement('p', { style: { fontSize: '28px', fontWeight: '700', color: PLZ.success, margin: 0 } }, stats.confirmed),
        React.createElement('p', { style: { fontSize: '11px', color: PLZ.muted, marginTop: '4px' } }, 'Active bookings')
      ),
      React.createElement('div', { style: { background: 'white', borderRadius: PLZ.radiusLg, padding: '20px', border: `1px solid ${PLZ.line}`, boxShadow: PLZ.shadowSm } },
        React.createElement('h4', { style: { fontSize: '13px', fontWeight: '500', color: PLZ.muted, margin: '0 0 8px 0' } }, 'Total Revenue'),
        React.createElement('p', { style: { fontSize: '28px', fontWeight: '700', color: PLZ.blue, margin: 0 } }, formatPrice(stats.totalRevenue)),
        React.createElement('p', { style: { fontSize: '11px', color: PLZ.muted, marginTop: '4px' } }, 'Lifetime revenue')
      )
    ),

    // Filters Bar
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' } },
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        React.createElement('button', {
          onClick: () => setFilter('all'),
          style: {
            padding: '8px 20px',
            borderRadius: PLZ.radiusSm,
            fontSize: '13px',
            fontWeight: '500',
            border: `1px solid ${filter === 'all' ? PLZ.blue : PLZ.line}`,
            cursor: 'pointer',
            background: filter === 'all' ? PLZ.blue : 'white',
            color: filter === 'all' ? 'white' : PLZ.body,
            transition: 'all 0.15s ease'
          }
        }, 'All'),
        React.createElement('button', {
          onClick: () => setFilter('confirmed'),
          style: {
            padding: '8px 20px',
            borderRadius: PLZ.radiusSm,
            fontSize: '13px',
            fontWeight: '500',
            border: `1px solid ${filter === 'confirmed' ? PLZ.success : PLZ.line}`,
            cursor: 'pointer',
            background: filter === 'confirmed' ? PLZ.success : 'white',
            color: filter === 'confirmed' ? 'white' : PLZ.body,
            transition: 'all 0.15s ease'
          }
        }, 'Confirmed'),
        React.createElement('button', {
          onClick: () => setFilter('pending'),
          style: {
            padding: '8px 20px',
            borderRadius: PLZ.radiusSm,
            fontSize: '13px',
            fontWeight: '500',
            border: `1px solid ${filter === 'pending' ? PLZ.warning : PLZ.line}`,
            cursor: 'pointer',
            background: filter === 'pending' ? PLZ.warning : 'white',
            color: filter === 'pending' ? 'white' : PLZ.body,
            transition: 'all 0.15s ease'
          }
        }, 'Pending'),
        React.createElement('button', {
          onClick: () => setFilter('cancelled'),
          style: {
            padding: '8px 20px',
            borderRadius: PLZ.radiusSm,
            fontSize: '13px',
            fontWeight: '500',
            border: `1px solid ${filter === 'cancelled' ? PLZ.danger : PLZ.line}`,
            cursor: 'pointer',
            background: filter === 'cancelled' ? PLZ.danger : 'white',
            color: filter === 'cancelled' ? 'white' : PLZ.body,
            transition: 'all 0.15s ease'
          }
        }, 'Cancelled')
      ),
      React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
        React.createElement('div', { style: { position: 'relative' } },
          React.createElement(Search, { size: 16, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: PLZ.muted } }),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Search bookings...',
            value: searchTerm,
            onChange: (e) => { setSearchTerm(e.target.value); setCurrentPage(1); },
            style: {
              padding: '8px 12px 8px 36px',
              border: `1px solid ${PLZ.line}`,
              borderRadius: PLZ.radiusSm,
              fontSize: '13px',
              width: '220px',
              outline: 'none',
              color: PLZ.ink
            }
          })
        ),
        React.createElement('button', {
          onClick: handleRefresh,
          style: {
            padding: '8px 12px',
            borderRadius: PLZ.radiusSm,
            border: `1px solid ${PLZ.line}`,
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: PLZ.body
          }
        }, React.createElement(RefreshCw, { size: 14 }), 'Refresh')
      )
    ),

    // Bookings List
    React.createElement('div', null,
      paginatedBookings.length === 0 ?
        React.createElement('div', { style: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: PLZ.radiusXl, border: `1px solid ${PLZ.line}`, boxShadow: PLZ.shadowSm } },
          React.createElement(Calendar, { size: 48, color: PLZ.muted }),
          React.createElement('p', { style: { marginTop: '16px', color: PLZ.body, fontSize: '14px' } }, 'No bookings found'),
          React.createElement('p', { style: { fontSize: '13px', color: PLZ.muted } }, filter !== 'all' ? 'Try changing your filter' : 'When customers book, they will appear here')
        ) :
        paginatedBookings.map(booking =>
          React.createElement(BookingCard, {
            key: booking.id,
            booking: booking,
            formatPrice: formatPrice,
            formatDate: formatDate
          })
        )
    ),

    // Pagination
    totalPages > 1 && React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' } },
      React.createElement('button', {
        onClick: () => setCurrentPage(prev => Math.max(1, prev - 1)),
        disabled: currentPage === 1,
        style: {
          padding: '8px 12px',
          borderRadius: PLZ.radiusSm,
          border: `1px solid ${PLZ.line}`,
          background: 'white',
          color: PLZ.body,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1
        }
      }, React.createElement(ChevronLeft, { size: 16 })),
      React.createElement('span', { style: { padding: '8px 16px', color: PLZ.body, fontSize: '14px' } },
        'Page ' + currentPage + ' of ' + totalPages
      ),
      React.createElement('button', {
        onClick: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)),
        disabled: currentPage === totalPages,
        style: {
          padding: '8px 12px',
          borderRadius: PLZ.radiusSm,
          border: `1px solid ${PLZ.line}`,
          background: 'white',
          color: PLZ.body,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1
        }
      }, React.createElement(ChevronRight, { size: 16 }))
    )
  );
}

export default BookingsManager;