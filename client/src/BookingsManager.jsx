import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import BookingCard from './components/ui/BookingCard';
import API_BASE from './config';

function BookingsManager({ businessId, bookings: externalBookings, onBookingsUpdate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem('auth_token');

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
      React.createElement('p', { style: { marginTop: '16px', color: '#64748b' } }, 'Loading bookings...')
    );
  }

  return React.createElement('div', null,
    // Stats Cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' } },
      React.createElement('div', { style: { background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2ff' } },
        React.createElement('h4', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' } }, 'Total Bookings'),
        React.createElement('p', { style: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 } }, stats.total),
        React.createElement('p', { style: { fontSize: '11px', color: '#10b981', marginTop: '4px' } }, 'All time')
      ),
      React.createElement('div', { style: { background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2ff' } },
        React.createElement('h4', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' } }, 'Confirmed'),
        React.createElement('p', { style: { fontSize: '28px', fontWeight: '700', color: '#10b981', margin: 0 } }, stats.confirmed),
        React.createElement('p', { style: { fontSize: '11px', color: '#64748b', marginTop: '4px' } }, 'Active bookings')
      ),
      React.createElement('div', { style: { background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2ff' } },
        React.createElement('h4', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' } }, 'Total Revenue'),
        React.createElement('p', { style: { fontSize: '28px', fontWeight: '700', color: '#4f46e5', margin: 0 } }, formatPrice(stats.totalRevenue)),
        React.createElement('p', { style: { fontSize: '11px', color: '#64748b', marginTop: '4px' } }, 'Lifetime revenue')
      )
    ),

    // Filters Bar
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' } },
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        React.createElement('button', {
          onClick: () => setFilter('all'),
          style: {
            padding: '8px 20px',
            borderRadius: '40px',
            fontSize: '13px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            background: filter === 'all' ? '#4f46e5' : '#f1f5f9',
            color: filter === 'all' ? 'white' : '#475569'
          }
        }, 'All'),
        React.createElement('button', {
          onClick: () => setFilter('confirmed'),
          style: {
            padding: '8px 20px',
            borderRadius: '40px',
            fontSize: '13px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            background: filter === 'confirmed' ? '#10b981' : '#f1f5f9',
            color: filter === 'confirmed' ? 'white' : '#475569'
          }
        }, 'Confirmed'),
        React.createElement('button', {
          onClick: () => setFilter('pending'),
          style: {
            padding: '8px 20px',
            borderRadius: '40px',
            fontSize: '13px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            background: filter === 'pending' ? '#f59e0b' : '#f1f5f9',
            color: filter === 'pending' ? 'white' : '#475569'
          }
        }, 'Pending'),
        React.createElement('button', {
          onClick: () => setFilter('cancelled'),
          style: {
            padding: '8px 20px',
            borderRadius: '40px',
            fontSize: '13px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            background: filter === 'cancelled' ? '#ef4444' : '#f1f5f9',
            color: filter === 'cancelled' ? 'white' : '#475569'
          }
        }, 'Cancelled')
      ),
      React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
        React.createElement('div', { style: { position: 'relative' } },
          React.createElement(Search, { size: 16, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' } }),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Search bookings...',
            value: searchTerm,
            onChange: (e) => { setSearchTerm(e.target.value); setCurrentPage(1); },
            style: {
              padding: '8px 12px 8px 36px',
              border: '1px solid #e2e8f0',
              borderRadius: '40px',
              fontSize: '13px',
              width: '220px',
              outline: 'none'
            }
          })
        ),
        React.createElement('button', {
          onClick: handleRefresh,
          style: {
            padding: '8px 12px',
            borderRadius: '40px',
            border: '1px solid #e2e8f0',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#475569'
          }
        }, React.createElement(RefreshCw, { size: 14 }), 'Refresh')
      )
    ),

    // Bookings List
    React.createElement('div', null,
      paginatedBookings.length === 0 ?
        React.createElement('div', { style: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #eef2ff' } },
          React.createElement(Calendar, { size: 48, color: '#94a3b8' }),
          React.createElement('p', { style: { marginTop: '16px', color: '#64748b', fontSize: '14px' } }, 'No bookings found'),
          React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8' } }, filter !== 'all' ? 'Try changing your filter' : 'When customers book, they will appear here')
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
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: 'white',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1
        }
      }, React.createElement(ChevronLeft, { size: 16 })),
      React.createElement('span', { style: { padding: '8px 16px', color: '#64748b', fontSize: '14px' } },
        'Page ' + currentPage + ' of ' + totalPages
      ),
      React.createElement('button', {
        onClick: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)),
        disabled: currentPage === totalPages,
        style: {
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: 'white',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1
        }
      }, React.createElement(ChevronRight, { size: 16 }))
    )
  );
}

export default BookingsManager;
