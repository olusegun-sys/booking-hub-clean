// client/src/AdminDashboard.jsx
// =============================================
// ADMIN DASHBOARD - FULLY FIXED
// SIMPLE, CLEAN, NO SYNTAX ERRORS
// =============================================

import React, { useState, useEffect } from 'react';
import { 
  Building2, Clock, CheckCircle2, XCircle, TrendingUp, Calendar, 
  MapPin, Phone, Mail, Trash2, Search, Hotel, Dumbbell, CalendarDays, 
  LogOut, TrendingDown, DollarSign, Sparkles, AlertTriangle, Check, X,
  Loader2, Home
} from 'lucide-react';
import API_BASE from './config';

function AdminDashboard({ admin, onLogout }) {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({ totalBusinesses: 0, pendingBusinesses: 0, totalBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, business: null });
  
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 640 && window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goToHomepage = () => {
    window.location.href = '/';
  };

  useEffect(() => {
    fetchBusinesses();
    fetchStats();
  }, []);

  const fetchBusinesses = () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    fetch(API_BASE + '/api/admin/businesses', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setBusinesses(data.businesses);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const fetchStats = () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    fetch(API_BASE + '/api/admin/stats', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .catch(err => console.error(err));
  };

  const handleStatusUpdate = (businessId, newStatus) => {
    setUpdating(businessId);
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    fetch(API_BASE + '/api/admin/businesses/' + businessId + '/status', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBusinesses(businesses.map(b => b.id === businessId ? { ...b, status: newStatus } : b));
          fetchStats();
        }
      })
      .catch(() => alert('Something went wrong'))
      .finally(() => setUpdating(null));
  };

  const openDeleteModal = (business) => {
    setDeleteModal({ isOpen: true, business });
  };

  const handleConfirmDelete = () => {
    const business = deleteModal.business;
    if (!business) return;
    
    setDeleting(business.id);
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    
    fetch(API_BASE + '/api/admin/businesses/' + business.id, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBusinesses(businesses.filter(b => b.id !== business.id));
          fetchStats();
        } else {
          alert(data.error || 'Failed to delete');
        }
      })
      .catch(() => alert('Something went wrong'))
      .finally(() => {
        setDeleting(null);
        setDeleteModal({ isOpen: false, business: null });
      });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, business: null });
  };

  const getBusinessIcon = (type) => {
    if (type === 'hotel') return React.createElement(Hotel, { size: 20 });
    if (type === 'sports') return React.createElement(Dumbbell, { size: 20 });
    if (type === 'event') return React.createElement(CalendarDays, { size: 20 });
    return React.createElement(Building2, { size: 20 });
  };

  const getBusinessGradient = (type) => {
    if (type === 'hotel') return 'linear-gradient(135deg, #4f46e5, #818cf8)';
    if (type === 'sports') return 'linear-gradient(135deg, #059669, #34d399)';
    if (type === 'event') return 'linear-gradient(135deg, #d97706, #fbbf24)';
    return 'linear-gradient(135deg, #6b7280, #9ca3af)';
  };

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: '#d1fae5', color: '#065f46', icon: CheckCircle2, label: 'Active' };
    if (status === 'pending') return { bg: '#fef3c7', color: '#92400e', icon: Clock, label: 'Pending' };
    return { bg: '#fee2e2', color: '#991b1b', icon: XCircle, label: 'Rejected' };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getUsagePercentage = (bookings) => {
    return Math.min((bookings / 50) * 100, 100);
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = !searchTerm || 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && b.status === 'pending';
    if (activeTab === 'approved') return matchesSearch && b.status === 'approved';
    if (activeTab === 'rejected') return matchesSearch && b.status === 'rejected';
    return matchesSearch;
  });

  const statCards = [
    { icon: Building2, label: 'Total Businesses', value: stats.totalBusinesses, color: '#4f46e5', bg: '#eef2ff', change: '+12%', changeUp: true, subtitle: 'vs last month' },
    { icon: Clock, label: 'Pending', value: stats.pendingBusinesses, color: '#f59e0b', bg: '#fef3c7', change: '0%', changeUp: false, subtitle: 'awaiting review' },
    { icon: Calendar, label: 'Bookings', value: stats.totalBookings, color: '#10b981', bg: '#d1fae5', change: '+8%', changeUp: true, subtitle: 'vs last month' },
    { icon: DollarSign, label: 'Revenue', value: formatPrice(stats.totalRevenue), color: '#8b5cf6', bg: '#f3e8ff', change: '+15%', changeUp: true, subtitle: 'vs last month' }
  ];

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' } },
      React.createElement('div', { style: { width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' } })
    );
  }

  // ============================================================
  // SIMPLE DELETE MODAL - BUILT STEP BY STEP
  // ============================================================
  const renderDeleteModal = function() {
    if (!deleteModal.isOpen) return null;
    
    // Build the confirm button
    var deleteButton = React.createElement('button', {
      key: 'delete',
      onClick: handleConfirmDelete,
      disabled: deleting === deleteModal.business?.id,
      style: {
        flex: 1,
        padding: '10px 24px',
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: deleting === deleteModal.business?.id ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: deleting === deleteModal.business?.id ? 0.7 : 1
      }
    },
      deleting === deleteModal.business?.id
        ? React.createElement(Loader2, { size: 16, style: { animation: 'spin 1s linear infinite' } })
        : React.createElement(Trash2, { size: 16 }),
      'Delete'
    );

    // Build the cancel button
    var cancelButton = React.createElement('button', {
      key: 'cancel',
      onClick: handleCancelDelete,
      style: {
        flex: 1,
        padding: '10px 24px',
        backgroundColor: 'white',
        color: '#475569',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer'
      }
    }, 'Cancel');

    // Build the buttons row
    var buttonsRow = React.createElement('div', {
      style: {
        display: 'flex',
        gap: '12px',
        marginTop: '16px'
      }
    }, cancelButton, deleteButton);

    // Build the confirmation message
    var message = React.createElement('p', {
      style: { fontSize: '14px', color: '#1e293b', margin: 0, marginBottom: '16px' }
    },
      'Are you sure you want to permanently delete ',
      React.createElement('strong', { style: { color: '#dc2626' } }, deleteModal.business?.name),
      '?'
    );

    // Build the modal body
    var body = React.createElement('div', { style: { padding: '24px' } }, message, buttonsRow);

    // Build the warning icon
    var warningIcon = React.createElement('div', {
      style: {
        width: '40px',
        height: '40px',
        backgroundColor: '#fee2e2',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
      React.createElement(AlertTriangle, { size: 20, color: '#dc2626' })
    );

    // Build the header text
    var headerText = React.createElement('div', null,
      React.createElement('h3', {
        style: {
          fontSize: '18px',
          fontWeight: '700',
          color: '#991b1b',
          margin: 0
        }
      }, 'Delete Business'),
      React.createElement('p', {
        style: {
          fontSize: '12px',
          color: '#b91c1c',
          margin: 0
        }
      }, 'This action cannot be undone')
    );

    // Build the header
    var header = React.createElement('div', {
      style: {
        padding: '20px 24px',
        backgroundColor: '#fef2f2',
        borderBottom: '1px solid #fecaca',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    }, warningIcon, headerText);

    // Build the modal card
    var modalCard = React.createElement('div', {
      style: {
        backgroundColor: 'white',
        borderRadius: '24px',
        maxWidth: '420px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.3)'
      }
    }, header, body);

    // Build the modal overlay
    var modalOverlay = React.createElement('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      },
      onClick: function(e) { if (e.target === e.currentTarget) handleCancelDelete(); }
    }, modalCard);

    return modalOverlay;
  };

  return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f8fafc' } },
    renderDeleteModal(),

    React.createElement('header', { style: { backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 } },
      React.createElement('div', { style: { maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '12px 16px' : '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
          React.createElement('div', { style: { width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', background: 'linear-gradient(135deg, #4f46e5, #818cf8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
            React.createElement(Sparkles, { size: isMobile ? 16 : 18, color: 'white' })
          ),
          React.createElement('div', null,
            React.createElement('h1', { style: { fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#0f172a', margin: 0 } }, isMobile ? 'Admin' : 'Admin Dashboard'),
            !isMobile && React.createElement('p', { style: { fontSize: '10px', color: '#64748b', margin: 0 } }, getGreeting() + ', ' + (admin?.full_name || 'Admin'))
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
          React.createElement('button', { onClick: goToHomepage, style: { padding: isMobile ? '6px 10px' : '8px 12px', backgroundColor: 'white', color: '#4f46e5', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: isMobile ? '11px' : '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' } },
            React.createElement(Home, { size: isMobile ? 14 : 16 }), !isMobile && 'Home'
          ),
          React.createElement('button', { onClick: onLogout, style: { padding: isMobile ? '6px 10px' : '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: isMobile ? '11px' : '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' } },
            React.createElement(LogOut, { size: isMobile ? 14 : 16 }), !isMobile && 'Logout'
          )
        )
      )
    ),

    React.createElement('main', { style: { maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '16px' : '24px' } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '16px', marginBottom: '24px' } },
        statCards.map(function(card, i) {
          var ChangeIcon = card.changeUp ? TrendingUp : TrendingDown;
          return React.createElement('div', { key: i, style: { backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '12px' : '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' } },
              React.createElement('div', { style: { width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', backgroundColor: card.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                React.createElement(card.icon, { size: isMobile ? 16 : 18, color: card.color })
              ),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: card.changeUp ? '#d1fae5' : '#fee2e2', padding: '2px 6px', borderRadius: '20px' } },
                React.createElement(ChangeIcon, { size: 10, color: card.changeUp ? '#10b981' : '#ef4444' }),
                React.createElement('span', { style: { fontSize: '10px', fontWeight: '600', color: card.changeUp ? '#065f46' : '#991b1b' } }, card.change)
              )
            ),
            React.createElement('div', { style: { fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' } }, card.value),
            React.createElement('p', { style: { fontSize: isMobile ? '11px' : '12px', fontWeight: '500', color: '#64748b', margin: 0 } }, card.label),
            React.createElement('p', { style: { fontSize: '9px', color: '#94a3b8', marginTop: '4px' } }, card.subtitle)
          );
        })
      ),

      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' } },
        React.createElement('div', { style: { display: 'flex', gap: '6px', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', flexWrap: isDesktop ? 'wrap' : 'nowrap', paddingBottom: '4px' } },
          [
            { id: 'all', label: isMobile ? 'All' : 'All Businesses', icon: Building2, count: businesses.length },
            { id: 'pending', label: 'Pending', icon: Clock, count: businesses.filter(function(b) { return b.status === 'pending'; }).length },
            { id: 'approved', label: 'Approved', icon: CheckCircle2, count: businesses.filter(function(b) { return b.status === 'approved'; }).length },
            { id: 'rejected', label: 'Rejected', icon: XCircle, count: businesses.filter(function(b) { return b.status === 'rejected'; }).length }
          ].map(function(tab) {
            var isActive = activeTab === tab.id;
            return React.createElement('button', { key: tab.id, onClick: function() { setActiveTab(tab.id); }, style: { display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '6px 12px' : '8px 16px', borderRadius: '40px', fontSize: isMobile ? '11px' : '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: isActive ? '#4f46e5' : 'white', color: isActive ? 'white' : '#475569', boxShadow: isActive ? '0 2px 8px rgba(79,70,229,0.2)' : '0 1px 2px rgba(0,0,0,0.05)', border: isActive ? 'none' : '1px solid #e2e8f0' } },
              React.createElement(tab.icon, { size: isMobile ? 12 : 14 }),
              tab.label,
              React.createElement('span', { style: { marginLeft: '2px', padding: '0px 6px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: isActive ? 'white' : '#64748b' } }, tab.count)
            );
          })
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: isMobile ? '6px 12px' : '8px 16px', borderRadius: '40px', border: '1px solid #e2e8f0', width: isMobile ? '100%' : '260px' } },
          React.createElement(Search, { size: isMobile ? 14 : 16, color: '#94a3b8' }),
          React.createElement('input', { type: 'text', placeholder: 'Search...', value: searchTerm, onChange: function(e) { setSearchTerm(e.target.value); }, style: { border: 'none', outline: 'none', fontSize: isMobile ? '12px' : '14px', color: '#0f172a', background: 'transparent', width: '100%' } }),
          searchTerm && React.createElement('button', { onClick: function() { setSearchTerm(''); }, style: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' } }, '×')
        )
      ),

      filteredBusinesses.length === 0 ?
        React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' } },
          React.createElement(Building2, { size: 48, color: '#cbd5e1', style: { marginBottom: '16px' } }),
          React.createElement('h3', { style: { fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' } }, 'No businesses found'),
          React.createElement('p', { style: { color: '#64748b', fontSize: '13px' } }, searchTerm ? 'Try a different search term' : 'Businesses will appear here once they register')
        ) :
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' } },
          filteredBusinesses.map(function(business) {
            var Icon = getBusinessIcon(business.business_type);
            var iconGradient = getBusinessGradient(business.business_type);
            var status = getStatusStyle(business.status);
            var StatusIcon = status.icon;
            var usagePercent = getUsagePercentage(business.current_booking_count || 0);
            var isUpdating = updating === business.id;
            var isDeleting = deleting === business.id;
            
            return React.createElement('div', { key: business.id, style: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' } },
              React.createElement('div', { style: { background: iconGradient, padding: isMobile ? '12px' : '16px', position: 'relative', color: 'white' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    React.createElement('div', { style: { width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, Icon),
                    React.createElement('div', null,
                      React.createElement('h3', { style: { fontSize: isMobile ? '14px' : '16px', fontWeight: '700', margin: 0, color: 'white' } }, business.name.length > 20 ? business.name.substring(0, 20) + '...' : business.name),
                      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' } },
                        React.createElement(MapPin, { size: 10, color: 'rgba(255,255,255,0.8)' }),
                        React.createElement('span', { style: { fontSize: '10px', color: 'rgba(255,255,255,0.8)' } }, business.city)
                      )
                    )
                  ),
                  React.createElement('div', { style: { backgroundColor: status.bg, padding: '2px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' } },
                    React.createElement(StatusIcon, { size: 10, color: status.color }),
                    React.createElement('span', { style: { fontSize: '9px', fontWeight: '600', color: status.color } }, status.label)
                  )
                )
              ),
              React.createElement('div', { style: { padding: isMobile ? '12px' : '16px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                    React.createElement(Calendar, { size: 12, color: '#64748b' }),
                    React.createElement('span', { style: { fontSize: '11px', color: '#475569' } }, formatDate(business.created_at))
                  ),
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                    React.createElement(TrendingUp, { size: 12, color: '#10b981' }),
                    React.createElement('span', { style: { fontSize: '11px', fontWeight: '600', color: '#0f172a' } }, business.current_booking_count || 0, '/', business.booking_limit || 50)
                  )
                ),
                React.createElement('div', { style: { marginBottom: '12px' } },
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } },
                    React.createElement('span', { style: { fontSize: '10px', fontWeight: '500', color: '#64748b' } }, 'Usage'),
                    React.createElement('span', { style: { fontSize: '10px', fontWeight: '600', color: usagePercent >= 80 ? '#ef4444' : '#10b981' } }, Math.round(usagePercent), '%')
                  ),
                  React.createElement('div', { style: { height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' } },
                    React.createElement('div', { style: { width: usagePercent + '%', height: '100%', backgroundColor: usagePercent >= 80 ? '#ef4444' : usagePercent >= 60 ? '#f59e0b' : '#4f46e5', borderRadius: '2px' } })
                  )
                ),
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '10px', color: '#64748b' } },
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                    React.createElement(Mail, { size: 10 }), business.email.substring(0, 15) + '...'
                  ),
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                    React.createElement(Phone, { size: 10 }), business.phone?.substring(0, 10) || 'N/A'
                  )
                ),
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                  business.status === 'pending' ? [
                    React.createElement('button', { key: 'approve', onClick: function() { handleStatusUpdate(business.id, 'approved'); }, disabled: isUpdating, style: { flex: 1, padding: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' } }, isUpdating ? React.createElement(Loader2, { size: 12, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Check, { size: 12 }), 'Approve'),
                    React.createElement('button', { key: 'reject', onClick: function() { handleStatusUpdate(business.id, 'rejected'); }, disabled: isUpdating, style: { flex: 1, padding: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' } }, isUpdating ? React.createElement(Loader2, { size: 12, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(X, { size: 12 }), 'Reject')
                  ] : null,
                  React.createElement('button', { onClick: function() { openDeleteModal(business); }, disabled: isDeleting, style: { padding: '8px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '11px', fontWeight: '500', cursor: isDeleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flex: business.status !== 'pending' ? 1 : 'auto' } }, isDeleting ? React.createElement(Loader2, { size: 12, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Trash2, { size: 12 }), 'Delete')
                )
              )
            );
          })
        )
      )
    )
}

export default AdminDashboard;