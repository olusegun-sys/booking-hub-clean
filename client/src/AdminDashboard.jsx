import React, { useState, useEffect } from 'react';
import { 
  Building2, Clock, CheckCircle2, XCircle, TrendingUp, Calendar, 
  MapPin, Phone, Mail, Trash2, Search, Hotel, Dumbbell, CalendarDays, 
  LogOut, TrendingDown, Users, DollarSign, Eye, MoreVertical, 
  ChevronRight, Sparkles, Activity, AlertCircle, Check, X,
  Loader2, Star, Award, AlertTriangle, Home
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

  // Navigate to homepage
  const goToHomepage = () => {
    window.location.href = '/';
  };

  useEffect(() => {
    fetchBusinesses();
    fetchStats();
  }, []);

  const fetchBusinesses = () => {
    fetch(API_BASE + '/api/admin/businesses')
      .then(res => res.json())
      .then(data => {
        if (data.success) setBusinesses(data.businesses);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const fetchStats = () => {
    fetch(API_BASE + '/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .catch(err => console.error(err));
  };

  const handleStatusUpdate = (businessId, newStatus) => {
    setUpdating(businessId);
    fetch(API_BASE + '/api/admin/businesses/' + businessId + '/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
    setDeleteModal({ isOpen: false, business: null });
    
    fetch(API_BASE + '/api/admin/businesses/' + business.id, { method: 'DELETE' })
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
      .finally(() => setDeleting(null));
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
    { icon: Clock, label: 'Pending Approval', value: stats.pendingBusinesses, color: '#f59e0b', bg: '#fef3c7', change: '0%', changeUp: false, subtitle: 'awaiting review' },
    { icon: Calendar, label: 'Total Bookings', value: stats.totalBookings, color: '#10b981', bg: '#d1fae5', change: '+8%', changeUp: true, subtitle: 'vs last month' },
    { icon: DollarSign, label: 'Total Revenue', value: formatPrice(stats.totalRevenue), color: '#8b5cf6', bg: '#f3e8ff', change: '+15%', changeUp: true, subtitle: 'vs last month' }
  ];

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' } },
      React.createElement('div', { style: { width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' } })
    );
  }

  return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f8fafc' } },
    deleteModal.isOpen && React.createElement('div', {
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
      onClick: (e) => { if (e.target === e.currentTarget) handleCancelDelete(); }
    },
      React.createElement('div', { style: { backgroundColor: 'white', borderRadius: '24px', maxWidth: '420px', width: '100%', overflow: 'hidden', animation: 'modalSlideIn 0.2s ease', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } },
        React.createElement('div', { style: { padding: '20px 24px', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' } },
          React.createElement('div', { style: { width: '40px', height: '40px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
            React.createElement(AlertTriangle, { size: 20, color: '#dc2626' })
          ),
          React.createElement('div', null,
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', color: '#991b1b', margin: 0 } }, 'Delete Business'),
            React.createElement('p', { style: { fontSize: '12px', color: '#b91c1c', margin: 0 } }, 'This action cannot be undone')
          )
        ),
        React.createElement('div', { style: { padding: '24px' } },
          React.createElement('p', { style: { fontSize: '14px', color: '#1e293b', margin: 0 } },
            'Are you sure you want to permanently delete ',
            React.createElement('strong', { style: { color: '#dc2626' } }, deleteModal.business?.name),
            '?'
          )
        ),
        React.createElement('div', { style: { padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc' } },
          React.createElement('button', { onClick: handleCancelDelete, style: { padding: '10px 24px', backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' } }, 'Cancel'),
          React.createElement('button', { onClick: handleConfirmDelete, style: { padding: '10px 24px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } },
            React.createElement(Trash2, { size: 16 }), 'Delete Permanently'
          )
        )
      )
    ),

    React.createElement('header', { style: { backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 } },
      React.createElement('div', { style: { maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          React.createElement('div', { style: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #4f46e5, #818cf8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' } },
            React.createElement(Sparkles, { size: 20, color: 'white' })
          ),
          React.createElement('div', null,
            React.createElement('h1', { style: { fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 } }, 'Admin Dashboard'),
            React.createElement('p', { style: { fontSize: '12px', color: '#64748b', margin: 0 } }, getGreeting() + ', ' + (admin?.full_name || 'Admin'))
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: '12px', alignItems: 'center' } },
          React.createElement('button', { onClick: goToHomepage, style: { padding: '8px 20px', backgroundColor: 'white', color: '#4f46e5', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } },
            React.createElement(Home, { size: 16 }), 'Home'
          ),
          React.createElement('button', { onClick: onLogout, style: { padding: '8px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } },
            React.createElement(LogOut, { size: 16 }), 'Logout'
          )
        )
      )
    ),

    React.createElement('main', { style: { maxWidth: '1400px', margin: '0 auto', padding: '24px' } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' } },
        statCards.map((card, i) => {
          const ChangeIcon = card.changeUp ? TrendingUp : TrendingDown;
          return React.createElement('div', { key: i, style: { backgroundColor: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' } },
              React.createElement('div', { style: { width: '48px', height: '48px', backgroundColor: card.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                React.createElement(card.icon, { size: 24, color: card.color })
              ),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: card.changeUp ? '#d1fae5' : '#fee2e2', padding: '4px 8px', borderRadius: '20px' } },
                React.createElement(ChangeIcon, { size: 12, color: card.changeUp ? '#10b981' : '#ef4444' }),
                React.createElement('span', { style: { fontSize: '11px', fontWeight: '600', color: card.changeUp ? '#065f46' : '#991b1b' } }, card.change)
              )
            ),
            React.createElement('div', { style: { fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' } }, card.value),
            React.createElement('p', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b', margin: 0 } }, card.label),
            React.createElement('p', { style: { fontSize: '11px', color: '#94a3b8', marginTop: '8px' } }, card.subtitle)
          );
        })
      ),

      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' } },
        React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
          [
            { id: 'all', label: 'All Businesses', icon: Building2, count: businesses.length },
            { id: 'pending', label: 'Pending', icon: Clock, count: businesses.filter(b => b.status === 'pending').length },
            { id: 'approved', label: 'Approved', icon: CheckCircle2, count: businesses.filter(b => b.status === 'approved').length },
            { id: 'rejected', label: 'Rejected', icon: XCircle, count: businesses.filter(b => b.status === 'rejected').length }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return React.createElement('button', { key: tab.id, onClick: () => setActiveTab(tab.id), style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '40px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', backgroundColor: isActive ? '#4f46e5' : 'white', color: isActive ? 'white' : '#475569', boxShadow: isActive ? '0 4px 12px rgba(79,70,229,0.3)' : '0 1px 2px rgba(0,0,0,0.05)', border: isActive ? 'none' : '1px solid #e2e8f0' } },
              React.createElement(tab.icon, { size: 14 }),
              tab.label,
              React.createElement('span', { style: { marginLeft: '4px', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: isActive ? 'white' : '#64748b' } }, tab.count)
            );
          })
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '40px', border: '1px solid #e2e8f0', minWidth: '260px' } },
          React.createElement(Search, { size: 18, color: '#94a3b8' }),
          React.createElement('input', { type: 'text', placeholder: 'Search by name, email or city...', value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), style: { border: 'none', outline: 'none', fontSize: '14px', color: '#0f172a', background: 'transparent', width: '100%' } }),
          searchTerm && React.createElement('button', { onClick: () => setSearchTerm(''), style: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' } }, '×')
        )
      ),

      filteredBusinesses.length === 0 ?
        React.createElement('div', { style: { textAlign: 'center', padding: '80px 24px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' } },
          React.createElement(Building2, { size: 64, color: '#cbd5e1', style: { marginBottom: '16px' } }),
          React.createElement('h3', { style: { fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' } }, 'No businesses found'),
          React.createElement('p', { style: { color: '#64748b' } }, searchTerm ? 'Try a different search term' : 'Businesses will appear here once they register')
        ) :
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' } },
          filteredBusinesses.map(business => {
            const Icon = getBusinessIcon(business.business_type);
            const iconGradient = getBusinessGradient(business.business_type);
            const status = getStatusStyle(business.status);
            const StatusIcon = status.icon;
            const usagePercent = getUsagePercentage(business.current_booking_count || 0);
            const isUpdating = updating === business.id;
            const isDeleting = deleting === business.id;
            
            return React.createElement('div', { key: business.id, style: { backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0' } },
              React.createElement('div', { style: { background: iconGradient, padding: '20px', position: 'relative', color: 'white' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                    React.createElement('div', { style: { width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' } }, Icon),
                    React.createElement('div', null,
                      React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', margin: 0, color: 'white' } }, business.name),
                      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' } },
                        React.createElement(MapPin, { size: 12, color: 'rgba(255,255,255,0.8)' }),
                        React.createElement('span', { style: { fontSize: '12px', color: 'rgba(255,255,255,0.8)' } }, business.city, ', ', business.state)
                      )
                    )
                  ),
                  React.createElement('div', { style: { backgroundColor: status.bg, padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' } },
                    React.createElement(StatusIcon, { size: 12, color: status.color }),
                    React.createElement('span', { style: { fontSize: '11px', fontWeight: '600', color: status.color } }, status.label)
                  )
                )
              ),
              React.createElement('div', { style: { padding: '20px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    React.createElement(Calendar, { size: 14, color: '#64748b' }),
                    React.createElement('span', { style: { fontSize: '13px', color: '#475569' } }, 'Joined ', formatDate(business.created_at))
                  ),
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    React.createElement(TrendingUp, { size: 14, color: '#10b981' }),
                    React.createElement('span', { style: { fontSize: '13px', fontWeight: '600', color: '#0f172a' } }, business.current_booking_count || 0, '/', business.booking_limit || 50, ' bookings')
                  )
                ),
                React.createElement('div', { style: { marginBottom: '20px' } },
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                    React.createElement('span', { style: { fontSize: '11px', fontWeight: '500', color: '#64748b' } }, 'Free tier usage'),
                    React.createElement('span', { style: { fontSize: '11px', fontWeight: '600', color: usagePercent >= 80 ? '#ef4444' : '#10b981' } }, Math.round(usagePercent), '%')
                  ),
                  React.createElement('div', { style: { height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' } },
                    React.createElement('div', { style: { width: usagePercent + '%', height: '100%', backgroundColor: usagePercent >= 80 ? '#ef4444' : usagePercent >= 60 ? '#f59e0b' : '#4f46e5', borderRadius: '3px' } })
                  )
                ),
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    React.createElement(Mail, { size: 14, color: '#94a3b8' }),
                    React.createElement('span', { style: { fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis' } }, business.email)
                  ),
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    React.createElement(Phone, { size: 14, color: '#94a3b8' }),
                    React.createElement('span', { style: { fontSize: '12px', color: '#475569' } }, business.phone)
                  )
                ),
                React.createElement('div', { style: { display: 'flex', gap: '10px' } },
                  business.status === 'pending' ? [
                    React.createElement('button', { key: 'approve', onClick: () => handleStatusUpdate(business.id, 'approved'), disabled: isUpdating, style: { flex: 1, padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' } }, isUpdating ? React.createElement(Loader2, { size: 14, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Check, { size: 14 }), 'Approve'),
                    React.createElement('button', { key: 'reject', onClick: () => handleStatusUpdate(business.id, 'rejected'), disabled: isUpdating, style: { flex: 1, padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' } }, isUpdating ? React.createElement(Loader2, { size: 14, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(X, { size: 14 }), 'Reject')
                  ] : null,
                  React.createElement('button', { onClick: () => openDeleteModal(business), disabled: isDeleting, style: { padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '12px', fontSize: '13px', fontWeight: '500', cursor: isDeleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: business.status !== 'pending' ? 1 : 'auto', minWidth: business.status !== 'pending' ? 'auto' : '80px' } }, isDeleting ? React.createElement(Loader2, { size: 14, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Trash2, { size: 14 }), 'Delete')
                )
              )
            );
          }
        )
      )
    )
  );
}

export default AdminDashboard;