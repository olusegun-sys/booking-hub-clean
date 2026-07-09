// FILE: client/src/BusinessDashboard.jsx
// COMPLETE FIX - handleBusinessUpdate creates new object reference to force re-render

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, Settings, LogOut, 
  Hotel, Trophy, Sparkles, Image, Clock,
  DollarSign, ChevronRight, Menu, X,
  Building2, TrendingUp, Plus, ExternalLink
} from 'lucide-react';
import RoomPage from './RoomPage';
import BookingsManager from './BookingsManager';
import BusinessProfile from './BusinessProfile';
import BusinessSettings from './BusinessSettings';
import StaffManagement from './StaffManagement';
import API_BASE from './config';

function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [business, setBusiness] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const token = localStorage.getItem('auth_token');
  const businessId = (() => {
    const currentBusiness = localStorage.getItem('currentBusiness');
    if (currentBusiness) {
      try {
        const parsed = JSON.parse(currentBusiness);
        return parsed.id;
      } catch(e) {}
    }
    return localStorage.getItem('businessId');
  })();

  useEffect(() => {
    function handleResize() {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileMenuOpen(false);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for profile updates
  useEffect(() => {
    function handleProfileUpdate(event) {
      if (event.detail && event.detail.business) {
        console.log('[BusinessDashboard] Profile update event received:', event.detail.business);
        // CRITICAL FIX: Create new object reference
        setBusiness({ ...event.detail.business });
        localStorage.setItem('currentBusiness', JSON.stringify(event.detail.business));
      }
    }
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    Promise.all([fetchBusinessData(), fetchRooms(), fetchBookings()]).finally(() => {
      setLoading(false);
    });
  }, []);

  function fetchBusinessData() {
    const storedBusiness = localStorage.getItem('currentBusiness');
    if (storedBusiness) {
      try {
        const parsed = JSON.parse(storedBusiness);
        setBusiness(parsed);
      } catch(e) {}
    }
    
    return fetch(API_BASE + '/api/businesses/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.business) {
          setBusiness(data.business);
          localStorage.setItem('currentBusiness', JSON.stringify(data.business));
        }
      })
      .catch(err => console.error('Fetch business error:', err));
  }

  function fetchRooms() {
    if (!businessId) return Promise.resolve();
    return fetch(API_BASE + '/api/businesses/' + businessId + '/rooms', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRooms(data.rooms || []);
        }
      })
      .catch(err => console.error('Fetch rooms error:', err));
  }

  function fetchBookings() {
    if (!businessId) return Promise.resolve();
    return fetch(API_BASE + '/api/businesses/' + businessId + '/bookings', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBookings(data.bookings || []);
        }
      })
      .catch(err => console.error('Fetch bookings error:', err));
  }

  // CRITICAL FIX: Create new object reference to force re-render
  function handleBusinessUpdate(updatedBusiness) {
    console.log('[BusinessDashboard] handleBusinessUpdate called with:', updatedBusiness);
    console.log('[BusinessDashboard] Logo URL:', updatedBusiness?.logo_url);
    console.log('[BusinessDashboard] Cover URL:', updatedBusiness?.cover_image);
    
    // CRITICAL FIX: Create a new object reference to force re-render
    setBusiness({ ...updatedBusiness });
    
    // Update localStorage
    localStorage.setItem('currentBusiness', JSON.stringify(updatedBusiness));
    
    // Dispatch custom event for other components
    const updateEvent = new CustomEvent('profileUpdated', { 
      detail: { business: updatedBusiness } 
    });
    window.dispatchEvent(updateEvent);
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms', icon: Hotel },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getBusinessTypeIcon = () => {
    const type = business?.business_type;
    if (type === 'hotel') return React.createElement(Hotel, { size: 20 });
    if (type === 'sports') return React.createElement(Trophy, { size: 20 });
    if (type === 'event') return React.createElement(Sparkles, { size: 20 });
    return React.createElement(Building2, { size: 20 });
  };

  const getBusinessTypeLabel = () => {
    const type = business?.business_type;
    if (type === 'hotel') return 'Hotel';
    if (type === 'sports') return 'Sports Facility';
    if (type === 'event') return 'Event Venue';
    return 'Business';
  };

  // Calculate stats
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const bookingLimit = business?.booking_limit || 50;
  const usagePercent = (confirmedBookings / bookingLimit) * 100;
  const remainingBookings = bookingLimit - confirmedBookings;

  // Logout redirect
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentBusiness');
    window.location.href = '/login';
  };

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  // ============================================================
  // LAYOUT STYLES
  // ============================================================

  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    position: 'relative'
  };

  const sidebarStyle = {
    width: isDesktop ? '280px' : '0',
    flexShrink: 0,
    background: 'white',
    borderRight: '1px solid #e2e8f0',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 100,
    transition: 'width 0.3s ease'
  };

  const mainContentStyle = {
    flex: 1,
    minWidth: 0,
    background: '#f8fafc',
    minHeight: '100vh',
    marginLeft: isDesktop ? '280px' : '0',
    transition: 'margin-left 0.3s ease'
  };

  const mobileMenuOverlay = mobileMenuOpen && !isDesktop ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 998,
    backdropFilter: 'blur(4px)'
  } : { display: 'none' };

  const mobileMenuStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    background: 'white',
    zIndex: 999,
    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease',
    boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
    overflowY: 'auto'
  };

  const renderOverview = () => {
    return React.createElement('div', null,
      // Stats Grid
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' } },
        React.createElement('div', { style: { background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eef2ff' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Total Revenue'),
            React.createElement('div', { style: { width: '36px', height: '36px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(DollarSign, { size: 18, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 } }, 
            '₦' + totalRevenue.toLocaleString()
          ),
          React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' } }, 'Lifetime revenue')
        ),
        React.createElement('div', { style: { background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eef2ff' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Total Bookings'),
            React.createElement('div', { style: { width: '36px', height: '36px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Calendar, { size: 18, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 } }, bookings.length),
          React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' } }, 'Total bookings received')
        ),
        React.createElement('div', { style: { background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eef2ff' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Active Rooms'),
            React.createElement('div', { style: { width: '36px', height: '36px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Hotel, { size: 18, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 } }, rooms.length),
          React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' } }, 'Total rooms/units')
        ),
        React.createElement('div', { style: { background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eef2ff' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Free Tier Usage'),
            React.createElement('div', { style: { width: '36px', height: '36px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(TrendingUp, { size: 18, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 } }, confirmedBookings + '/' + bookingLimit),
          React.createElement('div', { style: { marginTop: '8px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' } },
            React.createElement('div', { style: { width: usagePercent + '%', height: '100%', background: usagePercent > 80 ? '#ef4444' : '#10b981', borderRadius: '3px' } })
          ),
          React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' } }, remainingBookings + ' bookings remaining')
        )
      ),
      
      // Quick Actions
      React.createElement('div', { style: { background: 'white', borderRadius: '20px', border: '1px solid #eef2ff', overflow: 'hidden', marginBottom: '32px' } },
        React.createElement('div', { style: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbff' } },
          React.createElement('h3', { style: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 } }, 'Quick Actions')
        ),
        React.createElement('div', { style: { padding: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' } },
          React.createElement('button', { 
            onClick: () => setActiveTab('rooms'), 
            style: { padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
          }, React.createElement(Plus, { size: 16 }), 'Add Room'),
          React.createElement('button', { 
            onClick: () => setActiveTab('profile'), 
            style: { padding: '12px 24px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
          }, React.createElement(Image, { size: 16 }), 'Update Images'),
          React.createElement('button', { 
            onClick: () => setActiveTab('settings'), 
            style: { padding: '12px 24px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
          }, React.createElement(Clock, { size: 16 }), 'Set Hours'),
          React.createElement('button', { 
            onClick: () => window.open('/book/' + business?.slug, '_blank'), 
            style: { padding: '12px 24px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
          }, React.createElement(ExternalLink, { size: 16 }), 'View Page')
        )
      ),
      
      // Recent Bookings
      React.createElement('div', { style: { background: 'white', borderRadius: '20px', border: '1px solid #eef2ff', overflow: 'hidden' } },
        React.createElement('div', { style: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement('h3', { style: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 } }, 'Recent Bookings'),
          React.createElement('button', { 
            onClick: () => setActiveTab('bookings'), 
            style: { background: 'none', border: 'none', color: '#4f46e5', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }
          }, 'View All', React.createElement(ChevronRight, { size: 14 }))
        ),
        React.createElement('div', { style: { padding: '24px' } },
          bookings.slice(0, 5).map(booking => 
            React.createElement('div', { key: booking.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' } },
              React.createElement('div', null,
                React.createElement('p', { style: { fontWeight: '500', color: '#0f172a', margin: 0 } }, booking.customer_name),
                React.createElement('p', { style: { fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' } }, booking.booking_reference)
              ),
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('p', { style: { fontWeight: '600', color: '#4f46e5', margin: 0 } }, '₦' + (booking.total_amount || 0).toLocaleString()),
                React.createElement('span', { 
                  style: { 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '20px', 
                    background: booking.status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                    color: booking.status === 'confirmed' ? '#065f46' : '#92400e',
                    display: 'inline-block',
                    marginTop: '4px'
                  } 
                }, booking.status)
              )
            )
          ),
          bookings.length === 0 && React.createElement('p', { style: { textAlign: 'center', color: '#64748b', padding: '40px' } }, 'No bookings yet')
        )
      )
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return renderOverview();
      case 'rooms':
        return React.createElement(RoomPage, { 
          business: business,
          onBack: () => setActiveTab('overview')
        });
      case 'bookings':
        return React.createElement(BookingsManager, { 
          businessId: businessId,
          bookings: bookings,
          onBookingsUpdate: fetchBookings
        });
      case 'profile':
        return React.createElement(BusinessProfile, { 
          business: business, 
          onBack: () => setActiveTab('overview'),
          onUpdate: handleBusinessUpdate
        });
      case 'staff':
        return React.createElement(StaffManagement, { 
          business: business,
          onBack: () => setActiveTab('overview')
        });
      case 'settings':
        return React.createElement(BusinessSettings, { 
          business: business,
          onBack: () => setActiveTab('overview'),
          onBusinessUpdate: fetchBusinessData
        });
      default:
        return renderOverview();
    }
  };

  return React.createElement('div', { style: containerStyle },
    // Mobile menu overlay
    React.createElement('div', { style: mobileMenuOverlay, onClick: () => setMobileMenuOpen(false) }),
    
    // Mobile menu
    React.createElement('div', { style: mobileMenuStyle },
      React.createElement('div', { style: { padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          business?.logo_url ? 
            React.createElement('img', { src: business.logo_url, alt: business.name, style: { width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' } }) :
            React.createElement('div', { style: { width: '40px', height: '40px', background: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Building2, { size: 20, color: 'white' })
            ),
          React.createElement('div', null,
            React.createElement('h2', { style: { fontSize: '16px', fontWeight: '700', margin: 0, color: '#0f172a' } }, business?.name || 'Business'),
            React.createElement('p', { style: { fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' } }, getBusinessTypeLabel())
          )
        ),
        React.createElement('button', { onClick: () => setMobileMenuOpen(false), style: { background: 'none', border: 'none', cursor: 'pointer' } },
          React.createElement(X, { size: 20, color: '#64748b' })
        )
      ),
      React.createElement('nav', { style: { padding: '16px' } },
        navItems.map(item => 
          React.createElement('button', {
            key: item.id,
            onClick: () => { setActiveTab(item.id); setMobileMenuOpen(false); },
            style: {
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: activeTab === item.id ? '#eef2ff' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: activeTab === item.id ? '#4f46e5' : '#475569',
              fontWeight: activeTab === item.id ? '600' : '500',
              cursor: 'pointer',
              marginBottom: '4px'
            }
          },
            React.createElement(item.icon, { size: 18 }),
            item.label
          )
        ),
        React.createElement('button', {
          onClick: handleLogout,
          style: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: '#ef4444',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '16px'
          }
        },
          React.createElement(LogOut, { size: 18 }),
          'Logout'
        )
      )
    ),
    
    // Desktop Sidebar
    React.createElement('div', { style: sidebarStyle },
      React.createElement('div', { style: { padding: '28px 20px', borderBottom: '1px solid #e2e8f0' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          business?.logo_url ? 
            React.createElement('img', { 
              key: business.logo_url + Date.now(),
              src: business.logo_url, 
              alt: business.name, 
              style: { width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' } 
            }) :
            React.createElement('div', { style: { width: '48px', height: '48px', background: '#4f46e5', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Building2, { size: 24, color: 'white' })
            ),
          React.createElement('div', null,
            React.createElement('h2', { style: { fontSize: '16px', fontWeight: '700', margin: 0, color: '#0f172a' } }, business?.name || 'Business'),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' } },
              getBusinessTypeIcon(),
              React.createElement('span', { style: { fontSize: '11px', color: '#64748b' } }, getBusinessTypeLabel())
            )
          )
        )
      ),
      React.createElement('nav', { style: { padding: '16px' } },
        navItems.map(item => 
          React.createElement('button', {
            key: item.id,
            onClick: () => setActiveTab(item.id),
            style: {
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: activeTab === item.id ? '#eef2ff' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: activeTab === item.id ? '#4f46e5' : '#475569',
              fontWeight: activeTab === item.id ? '600' : '500',
              cursor: 'pointer',
              marginBottom: '4px'
            }
          },
            React.createElement(item.icon, { size: 18 }),
            item.label
          )
        ),
        React.createElement('button', {
          onClick: handleLogout,
          style: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: '#ef4444',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '16px'
          }
        },
          React.createElement(LogOut, { size: 18 }),
          'Logout'
        )
      )
    ),
    
    // Main Content
    React.createElement('div', { style: mainContentStyle },
      // Mobile Header
      !isDesktop && React.createElement('div', { style: { background: 'white', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          business?.logo_url ? 
            React.createElement('img', { src: business.logo_url, alt: business.name, style: { width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' } }) :
            React.createElement('div', { style: { width: '36px', height: '36px', background: '#4f46e5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Building2, { size: 18, color: 'white' })
            ),
          React.createElement('div', null,
            React.createElement('h1', { style: { fontSize: '16px', fontWeight: '700', margin: 0, color: '#0f172a' } }, business?.name || 'Dashboard'),
            React.createElement('p', { style: { fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' } }, getBusinessTypeLabel())
          )
        ),
        React.createElement('button', { onClick: () => setMobileMenuOpen(true), style: { background: 'none', border: 'none', cursor: 'pointer' } },
          React.createElement(Menu, { size: 24, color: '#0f172a' })
        )
      ),
      
      // Content Area
      React.createElement('div', { style: { padding: isDesktop ? '32px' : '20px' } }, renderContent())
    )
  );
}

export default BusinessDashboard;