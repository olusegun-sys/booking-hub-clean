// client/src/AdminDashboard.jsx
// =============================================
// ADMIN DASHBOARD — SESSION 3 RESTYLE (19 Oct 2026)
// RESTYLE ONLY: Unified with Plazzaa marketing design tokens.
// Preserved: Token auth (21 Sept fix), fetch logic, status updates,
// delete flow, responsive resize listener, and search/filter logic.
// =============================================

import React, { useState, useEffect } from 'react';
import { 
  Building2, Clock, CheckCircle2, XCircle, TrendingUp, Calendar, 
  MapPin, Phone, Mail, Trash2, Search, Hotel, Dumbbell, CalendarDays, 
  LogOut, TrendingDown, DollarSign, Sparkles, AlertTriangle, Check, X,
  Loader2, Home
} from 'lucide-react';
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
  radiusSm: '8px',
  radiusMd: '14px',
  radiusLg: '16px',
  radiusXl: '20px',
  font: "'Manrope', 'Inter', system-ui, -apple-system, sans-serif",
  shadowSm: '0 1px 3px rgba(15, 23, 42, 0.04)',
  shadowMd: '0 8px 24px rgba(15, 23, 42, 0.06)',
  backdrop: 'rgba(15, 23, 42, 0.6)'
};

function AdminDashboard({ admin, onLogout }) {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({ totalBusinesses: 0, pendingBusinesses: 0, totalBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, business: null });
  const [error, setError] = useState(null);
  
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 640 && window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // ============================================================
  // HELPER: Get admin token (PRESERVED FROM 21 SEPT FIX)
  // ============================================================
  const getToken = function() {
    return localStorage.getItem('admin_token') ||
           localStorage.getItem('auth_token') || 
           localStorage.getItem('token');
  };

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
    const token = getToken();
    console.log('[AdminDashboard] Fetching businesses...');
    console.log('[AdminDashboard] Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('[AdminDashboard] No token found - redirecting to login');
      setError('Session expired. Please login again.');
      setLoading(false);
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
      return;
    }
    
    setError(null);
    
    fetch(API_BASE + '/api/admin/businesses', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        console.log('[AdminDashboard] Response status:', res.status);
        if (res.status === 401) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        return res.json();
      })
      .then(data => {
        console.log('[AdminDashboard] Businesses data:', data);
        if (data.success) {
          setBusinesses(data.businesses || []);
        } else {
          setError(data.error || 'Failed to load businesses');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('[AdminDashboard] Fetch error:', err);
        setError(err.message || 'Network error. Please refresh.');
        setLoading(false);
      });
  };

  const fetchStats = () => {
    const token = getToken();
    console.log('[AdminDashboard] Fetching stats...');
    
    if (!token) return;
    
    fetch(API_BASE + '/api/admin/stats', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        if (res.status === 401) {
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(data => {
        console.log('[AdminDashboard] Stats received:', data);
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error('[AdminDashboard] Stats error:', err));
  };

  const handleStatusUpdate = (businessId, newStatus) => {
    setUpdating(businessId);
    const token = getToken();
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
        } else {
          alert('❌ ' + (data.error || 'Failed to update status'));
        }
      })
      .catch(() => alert('❌ Something went wrong'))
      .finally(() => setUpdating(null));
  };

  const openDeleteModal = (business) => {
    setDeleteModal({ isOpen: true, business });
  };

  const handleConfirmDelete = () => {
    const business = deleteModal.business;
    if (!business) return;
    
    setDeleting(business.id);
    const token = getToken();
    
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
    // WHY: Swapped raw indigo/greens to Plazzaa brand blue and token colors
    if (type === 'hotel') return `linear-gradient(135deg, ${PLZ.blue}, ${PLZ.blueDeep})`;
    if (type === 'sports') return `linear-gradient(135deg, ${PLZ.success}, #0f5e30)`;
    if (type === 'event') return `linear-gradient(135deg, ${PLZ.warning}, #8a670b)`;
    return `linear-gradient(135deg, ${PLZ.muted}, ${PLZ.body})`;
  };

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: PLZ.successTint, color: PLZ.success, icon: CheckCircle2, label: 'Active' };
    if (status === 'pending') return { bg: PLZ.warningTint, color: PLZ.warning, icon: Clock, label: 'Pending' };
    return { bg: PLZ.dangerTint, color: PLZ.danger, icon: XCircle, label: 'Rejected' };
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

  // WHY: Sourced stat card colors from PLZ tokens instead of ad-hoc purple/amber/green
  const statCards = [
    { icon: Building2, label: 'Total Businesses', value: stats.totalBusinesses, color: PLZ.blue, bg: PLZ.blueTint, change: '+12%', changeUp: true, subtitle: 'vs last month' },
    { icon: Clock, label: 'Pending', value: stats.pendingBusinesses, color: PLZ.warning, bg: PLZ.warningTint, change: '0%', changeUp: false, subtitle: 'awaiting review' },
    { icon: Calendar, label: 'Bookings', value: stats.totalBookings, color: PLZ.success, bg: PLZ.successTint, change: '+8%', changeUp: true, subtitle: 'vs last month' },
    { icon: DollarSign, label: 'Revenue', value: formatPrice(stats.totalRevenue), color: PLZ.ink, bg: PLZ.surface, change: '+15%', changeUp: true, subtitle: 'vs last month' }
  ];

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: PLZ.surface } },
      React.createElement('div', { style: { width: '48px', height: '48px', border: `3px solid ${PLZ.line}`, borderTopColor: PLZ.blue, borderRadius: '50%', animation: 'spin 1s linear infinite' } })
    );
  }

  // ============================================================
  // SIMPLE DELETE MODAL (Restyled)
  // ============================================================
  const renderDeleteModal = function() {
    if (!deleteModal.isOpen) return null;
    
    return React.createElement('div', {
      style: { 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: PLZ.backdrop, 
        backdropFilter: 'blur(4px)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 9999, padding: '20px' 
      },
      onClick: function(e) { if (e.target === e.currentTarget) handleCancelDelete(); }
    },
      React.createElement('div', { 
        style: { 
          backgroundColor: 'white', borderRadius: PLZ.radiusXl, maxWidth: '420px', width: '100%', 
          overflow: 'hidden', boxShadow: PLZ.shadowMd
        } 
      },
        React.createElement('div', { 
          style: { 
            padding: '20px 24px', backgroundColor: PLZ.dangerTint,
            borderBottom: `1px solid ${PLZ.line}`,
            display: 'flex', alignItems: 'center', gap: '12px' 
          } 
        },
          React.createElement('div', { 
            style: { 
              width: '40px', height: '40px', backgroundColor: '#FFFFFF',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            } 
          },
            React.createElement(AlertTriangle, { size: 20, color: PLZ.danger })
          ),
          React.createElement('div', null,
            React.createElement('h3', { 
              style: { fontSize: '18px', fontWeight: '700', color: PLZ.danger, margin: 0 } 
            }, 'Delete Business'),
            React.createElement('p', { 
              style: { fontSize: '12px', color: PLZ.danger, margin: 0, opacity: 0.8 } 
            }, 'This action cannot be undone')
          )
        ),
        React.createElement('div', { style: { padding: '24px' } },
          React.createElement('p', { 
            style: { fontSize: '14px', color: PLZ.body, margin: 0, marginBottom: '16px' } 
          },
            'Are you sure you want to permanently delete ',
            React.createElement('strong', { style: { color: PLZ.ink } }, deleteModal.business?.name),
            '?'
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', marginTop: '16px' } },
            React.createElement('button', { 
              key: 'cancel', onClick: handleCancelDelete,
              style: { 
                flex: 1, padding: '10px 24px', backgroundColor: 'white',
                color: PLZ.body, border: `1px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm,
                fontSize: '13px', fontWeight: '500', cursor: 'pointer' 
              } 
            }, 'Cancel'),
            React.createElement('button', { 
              key: 'delete', onClick: handleConfirmDelete,
              disabled: deleting === deleteModal.business?.id,
              style: { 
                flex: 1, padding: '10px 24px', backgroundColor: PLZ.danger,
                color: 'white', border: 'none', borderRadius: PLZ.radiusSm,
                fontSize: '13px', fontWeight: '600', cursor: deleting === deleteModal.business?.id ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: deleting === deleteModal.business?.id ? 0.7 : 1
              } 
            },
              deleting === deleteModal.business?.id 
                ? React.createElement(Loader2, { size: 16, style: { animation: 'spin 1s linear infinite' } })
                : React.createElement(Trash2, { size: 16 }),
              'Delete'
            )
          )
        )
      )
    );
  };

  return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: PLZ.surface, fontFamily: PLZ.font } },
    renderDeleteModal(),

    // HEADER
    React.createElement('header', { style: { backgroundColor: 'white', borderBottom: `1px solid ${PLZ.line}`, position: 'sticky', top: 0, zIndex: 100 } },
      React.createElement('div', { style: { maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '12px 16px' : '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
          React.createElement('div', { style: { width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', background: `linear-gradient(135deg, ${PLZ.blue}, ${PLZ.blueDeep})`, borderRadius: PLZ.radiusSm, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
            React.createElement(Sparkles, { size: isMobile ? 16 : 18, color: 'white' })
          ),
          React.createElement('div', null,
            React.createElement('h1', { style: { fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: PLZ.ink, margin: 0 } }, isMobile ? 'Admin' : 'Admin Dashboard'),
            !isMobile && React.createElement('p', { style: { fontSize: '10px', color: PLZ.muted, margin: 0 } }, getGreeting() + ', ' + (admin?.full_name || 'Admin'))
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
          React.createElement('button', { onClick: goToHomepage, style: { padding: isMobile ? '6px 10px' : '8px 12px', backgroundColor: 'white', color: PLZ.blue, border: `1px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: isMobile ? '11px' : '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' } },
            React.createElement(Home, { size: isMobile ? 14 : 16 }), !isMobile && 'Home'
          ),
          React.createElement('button', { onClick: onLogout, style: { padding: isMobile ? '6px 10px' : '8px 12px', backgroundColor: PLZ.danger, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, fontSize: isMobile ? '11px' : '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' } },
            React.createElement(LogOut, { size: isMobile ? 14 : 16 }), !isMobile && 'Logout'
          )
        )
      )
    ),

    // MAIN
    React.createElement('main', { style: { maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '16px' : '24px' } },
      
      // ERROR BANNER
      error && React.createElement('div', { 
        style: { 
          backgroundColor: PLZ.dangerTint, border: `1px solid ${PLZ.danger}`, borderRadius: PLZ.radiusMd, 
          padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' 
        } 
      },
        React.createElement(AlertTriangle, { size: 16, color: PLZ.danger }),
        React.createElement('span', { style: { color: PLZ.danger, fontSize: '13px' } }, error)
      ),

      // STAT CARDS
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '16px', marginBottom: '24px' } },
        statCards.map(function(card, i) {
          var ChangeIcon = card.changeUp ? TrendingUp : TrendingDown;
          return React.createElement('div', { key: i, style: { backgroundColor: 'white', borderRadius: PLZ.radiusLg, padding: isMobile ? '12px' : '16px', boxShadow: PLZ.shadowSm, border: `1px solid ${PLZ.line}` } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' } },
              React.createElement('div', { style: { width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', backgroundColor: card.bg, borderRadius: PLZ.radiusSm, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                React.createElement(card.icon, { size: isMobile ? 16 : 18, color: card.color })
              ),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: card.changeUp ? PLZ.successTint : PLZ.dangerTint, padding: '2px 6px', borderRadius: '20px' } },
                React.createElement(ChangeIcon, { size: 10, color: card.changeUp ? PLZ.success : PLZ.danger }),
                React.createElement('span', { style: { fontSize: '10px', fontWeight: '600', color: card.changeUp ? PLZ.success : PLZ.danger } }, card.change)
              )
            ),
            React.createElement('div', { style: { fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: PLZ.ink, marginBottom: '2px' } }, card.value),
            React.createElement('p', { style: { fontSize: isMobile ? '11px' : '12px', fontWeight: '500', color: PLZ.muted, margin: 0 } }, card.label),
            React.createElement('p', { style: { fontSize: '9px', color: PLZ.muted, marginTop: '4px' } }, card.subtitle)
          );
        })
      ),

      // FILTERS & SEARCH
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' } },
        React.createElement('div', { style: { display: 'flex', gap: '6px', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', flexWrap: isDesktop ? 'wrap' : 'nowrap', paddingBottom: '4px' } },
          [
            { id: 'all', label: isMobile ? 'All' : 'All Businesses', icon: Building2, count: businesses.length },
            { id: 'pending', label: 'Pending', icon: Clock, count: businesses.filter(function(b) { return b.status === 'pending'; }).length },
            { id: 'approved', label: 'Approved', icon: CheckCircle2, count: businesses.filter(function(b) { return b.status === 'approved'; }).length },
            { id: 'rejected', label: 'Rejected', icon: XCircle, count: businesses.filter(function(b) { return b.status === 'rejected'; }).length }
          ].map(function(tab) {
            var isActive = activeTab === tab.id;
            return React.createElement('button', { key: tab.id, onClick: function() { setActiveTab(tab.id); }, style: { display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '6px 12px' : '8px 16px', borderRadius: '999px', fontSize: isMobile ? '11px' : '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: isActive ? PLZ.blue : 'white', color: isActive ? 'white' : PLZ.body, boxShadow: isActive ? '0 2px 8px rgba(45, 96, 234, 0.2)' : 'none', border: isActive ? 'none' : `1px solid ${PLZ.line}` } },
              React.createElement(tab.icon, { size: isMobile ? 12 : 14 }),
              tab.label,
              React.createElement('span', { style: { marginLeft: '2px', padding: '0px 6px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : PLZ.surface, color: isActive ? 'white' : PLZ.muted } }, tab.count)
            );
          })
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: isMobile ? '6px 12px' : '8px 16px', borderRadius: '999px', border: `1px solid ${PLZ.line}`, width: isMobile ? '100%' : '260px' } },
          React.createElement(Search, { size: isMobile ? 14 : 16, color: PLZ.muted }),
          React.createElement('input', { type: 'text', placeholder: 'Search...', value: searchTerm, onChange: function(e) { setSearchTerm(e.target.value); }, style: { border: 'none', outline: 'none', fontSize: isMobile ? '12px' : '14px', color: PLZ.ink, background: 'transparent', width: '100%' } }),
          searchTerm && React.createElement('button', { onClick: function() { setSearchTerm(''); }, style: { background: 'none', border: 'none', cursor: 'pointer', color: PLZ.muted, fontSize: '14px' } }, '×')
        )
      ),

      // BUSINESS LIST
      filteredBusinesses.length === 0 ?
        React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: PLZ.radiusXl, border: `1px solid ${PLZ.line}` } },
          React.createElement(Building2, { size: 48, color: PLZ.muted, style: { marginBottom: '16px' } }),
          React.createElement('h3', { style: { fontSize: '18px', fontWeight: '600', color: PLZ.ink, marginBottom: '8px' } }, 'No businesses found'),
          React.createElement('p', { style: { color: PLZ.body, fontSize: '13px' } }, searchTerm ? 'Try a different search term' : 'Businesses will appear here once they register'),
          React.createElement('button', {
            onClick: fetchBusinesses,
            style: { marginTop: '16px', padding: '8px 20px', backgroundColor: PLZ.blue, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, cursor: 'pointer' }
          }, 'Refresh')
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
            
            return React.createElement('div', { key: business.id, style: { backgroundColor: 'white', borderRadius: PLZ.radiusLg, overflow: 'hidden', border: `1px solid ${PLZ.line}`, boxShadow: PLZ.shadowSm } },
              React.createElement('div', { style: { background: iconGradient, padding: isMobile ? '12px' : '16px', position: 'relative', color: 'white' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    React.createElement('div', { style: { width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: PLZ.radiusSm, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, Icon),
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
                    React.createElement(Calendar, { size: 12, color: PLZ.muted }),
                    React.createElement('span', { style: { fontSize: '11px', color: PLZ.body } }, formatDate(business.created_at))
                  ),
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                    React.createElement(TrendingUp, { size: 12, color: PLZ.success }),
                    React.createElement('span', { style: { fontSize: '11px', fontWeight: '600', color: PLZ.ink } }, business.current_booking_count || 0, '/', business.booking_limit || 50)
                  )
                ),
                React.createElement('div', { style: { marginBottom: '12px' } },
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } },
                    React.createElement('span', { style: { fontSize: '10px', fontWeight: '500', color: PLZ.muted } }, 'Usage'),
                    React.createElement('span', { style: { fontSize: '10px', fontWeight: '600', color: usagePercent >= 80 ? PLZ.danger : PLZ.success } }, Math.round(usagePercent), '%')
                  ),
                  React.createElement('div', { style: { height: '4px', backgroundColor: PLZ.line, borderRadius: '2px', overflow: 'hidden' } },
                    React.createElement('div', { style: { width: usagePercent + '%', height: '100%', backgroundColor: usagePercent >= 80 ? PLZ.danger : usagePercent >= 60 ? PLZ.warning : PLZ.blue, borderRadius: '2px' } })
                  )
                ),
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '10px', color: PLZ.muted } },
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                    React.createElement(Mail, { size: 10 }), business.email.substring(0, 15) + '...'
                  ),
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                    React.createElement(Phone, { size: 10 }), business.phone?.substring(0, 10) || 'N/A'
                  )
                ),
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                  business.status === 'pending' ? [
                    React.createElement('button', { key: 'approve', onClick: function() { handleStatusUpdate(business.id, 'approved'); }, disabled: isUpdating, style: { flex: 1, padding: '8px', backgroundColor: PLZ.success, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, fontSize: '11px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' } }, isUpdating ? React.createElement(Loader2, { size: 12, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Check, { size: 12 }), 'Approve'),
                    React.createElement('button', { key: 'reject', onClick: function() { handleStatusUpdate(business.id, 'rejected'); }, disabled: isUpdating, style: { flex: 1, padding: '8px', backgroundColor: PLZ.danger, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, fontSize: '11px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' } }, isUpdating ? React.createElement(Loader2, { size: 12, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(X, { size: 12 }), 'Reject')
                  ] : null,
                  React.createElement('button', { onClick: function() { openDeleteModal(business); }, disabled: isDeleting, style: { padding: '8px', backgroundColor: PLZ.dangerTint, color: PLZ.danger, border: `1px solid ${PLZ.dangerTint}`, borderRadius: PLZ.radiusSm, fontSize: '11px', fontWeight: '500', cursor: isDeleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flex: business.status !== 'pending' ? 1 : 'auto' } }, isDeleting ? React.createElement(Loader2, { size: 12, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Trash2, { size: 12 }), 'Delete')
                )
              )
            );
          })
        )
      )
    )
}

export default AdminDashboard;