
// client/src/BusinessDashboard.jsx
// =============================================
// COMPLETE BUSINESS DASHBOARD - FIXED ₦ SYMBOL
// All currency values now display with ₦ Naira symbol
// =============================================

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, Settings, LogOut, 
  Hotel, Trophy, Sparkles, Image, Clock,
  DollarSign, ChevronRight, Menu, X,
  Building2, TrendingUp, Plus, ExternalLink,
  CheckCircle, Crown, Star, Zap, AlertTriangle
} from 'lucide-react';
import RoomPage from './RoomPage';
import BookingsManager from './BookingsManager';
import BusinessProfile from './BusinessProfile';
import BusinessSettings from './BusinessSettings';
import StaffManagement from './StaffManagement';
import UpgradeModal from './components/UpgradeModal';
import API_BASE from './config';

// ============================================================
// HELPER: Format currency with ₦ symbol
// ============================================================
function formatNaira(amount) {
  if (!amount && amount !== 0) return '₦0';
  return '₦' + Number(amount).toLocaleString();
}

// ============================================================
// SUBSCRIPTION TIERS CONFIGURATION
// ============================================================
const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    bookings: 50,
    icon: Star,
    color: '#94a3b8',
    badge: 'Free'
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 30000,
    bookings: 100,
    icon: Zap,
    color: '#4f46e5',
    badge: 'Popular'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 50000,
    bookings: 999999,
    icon: Crown,
    color: '#d97706',
    badge: 'Best Value'
  }
};

function BusinessDashboard({ business: propBusiness, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [business, setBusiness] = useState(propBusiness || null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  const token = localStorage.getItem('auth_token');
  const businessId = business?.id || localStorage.getItem('businessId');

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

  useEffect(() => {
    if (businessId) {
      Promise.all([fetchBusinessData(), fetchRooms(), fetchBookings()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [businessId]);

  function fetchBusinessData() {
    const storedBusiness = localStorage.getItem('currentBusiness');
    if (storedBusiness) {
      try {
        const parsed = JSON.parse(storedBusiness);
        setBusiness(parsed);
      } catch(e) {}
    }
    
    if (!businessId) return Promise.resolve();
    
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

  function getBusinessTypeLabels() {
    const type = business?.business_type;
    if (type === 'hotel') {
      return { 
        singular: 'Room', 
        plural: 'Rooms', 
        action: 'Add Room',
        icon: Hotel,
        iconColor: '#4f46e5'
      };
    } else if (type === 'sports') {
      return { 
        singular: 'Court', 
        plural: 'Courts', 
        action: 'Add Court',
        icon: Trophy,
        iconColor: '#059669'
      };
    } else if (type === 'event') {
      return { 
        singular: 'Venue', 
        plural: 'Venues', 
        action: 'Add Venue',
        icon: Sparkles,
        iconColor: '#d97706'
      };
    }
    return { 
      singular: 'Item', 
      plural: 'Items', 
      action: 'Add Item',
      icon: Building2,
      iconColor: '#4f46e5'
    };
  }

  const typeLabels = getBusinessTypeLabels();
  const TypeIcon = typeLabels.icon;

  function getBusinessTypeIcon() {
    const type = business?.business_type;
    if (type === 'hotel') return React.createElement(Hotel, { size: 20 });
    if (type === 'sports') return React.createElement(Trophy, { size: 20 });
    if (type === 'event') return React.createElement(Sparkles, { size: 20 });
    return React.createElement(Building2, { size: 20 });
  }

  function getBusinessTypeLabel() {
    const type = business?.business_type;
    if (type === 'hotel') return 'Hotel';
    if (type === 'sports') return 'Sports Facility';
    if (type === 'event') return 'Event Venue';
    return 'Business';
  }

  function getCurrentTier() {
    const tier = business?.subscription_tier || 'free';
    return SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
  }

  function handleBusinessUpdate(updatedBusiness) {
    setBusiness({ ...updatedBusiness });
    localStorage.setItem('currentBusiness', JSON.stringify(updatedBusiness));
  }

  const handleUpgrade = (tierId) => {
    setSelectedTier(tierId);
    setShowUpgradeModal(true);
  };

  const handleUpgradeComplete = async (tierId) => {
    await fetchBusinessData();
    await fetchBookings();
    setShowUpgradeModal(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentBusiness');
      window.location.href = '/login';
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const limit = business?.booking_limit || 50;
  const usagePercent = (confirmedBookings / limit) * 100;
  const remaining = limit - confirmedBookings;
  const currentTier = getCurrentTier();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'rooms', label: typeLabels.plural, icon: typeLabels.icon },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  // Render Overview
  const renderOverview = () => {
    const labels = getBusinessTypeLabels();
    const Icon = labels.icon;
    const currentTierData = getCurrentTier();
    
    return React.createElement('div', null,
      // Plan Banner
      React.createElement('div', {
        style: {
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          borderRadius: '20px',
          padding: '24px 32px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          color: 'white'
        }
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
          React.createElement('div', {
            style: {
              width: '56px',
              height: '56px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          },
            React.createElement(Crown, { size: 28, color: 'white' })
          ),
          React.createElement('div', null,
            React.createElement('h2', { style: { fontSize: '20px', fontWeight: '700', margin: '0 0 2px 0' } }, currentTierData.name + ' Plan'),
            React.createElement('p', { style: { opacity: 0.9, fontSize: '14px', margin: 0 } },
              currentTierData.bookings === 999999 
                ? '♾️ Unlimited bookings' 
                : currentTierData.bookings + ' bookings per month'
            )
          )
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          React.createElement('span', { style: { fontSize: '14px', opacity: 0.8 } },
            currentTierData.price === 0 ? 'Free' : formatNaira(currentTierData.price) + '/month'
          ),
          currentTierData.id !== 'pro' && React.createElement('button', {
            onClick: () => setActiveTab('subscription'),
            style: {
              padding: '10px 24px',
              background: 'white',
              color: '#4f46e5',
              border: 'none',
              borderRadius: '40px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }
          }, 'Upgrade')
        )
      ),

      // Stats Grid - FIXED ₦ symbol
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' } },
        React.createElement('div', { style: { background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eef2ff' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Total Revenue'),
            React.createElement('div', { style: { width: '36px', height: '36px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(DollarSign, { size: 18, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 } }, 
            formatNaira(totalRevenue)
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
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Active ' + labels.plural),
            React.createElement('div', { style: { width: '36px', height: '36px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Icon, { size: 18, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 } }, rooms.length),
          React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' } }, 'Total ' + labels.plural.toLowerCase())
        ),
        React.createElement('div', { style: { background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eef2ff' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Bookings Used'),
            React.createElement('div', { style: { width: '36px', height: '36px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(TrendingUp, { size: 18, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 } }, confirmedBookings + '/' + limit),
          React.createElement('div', { style: { marginTop: '8px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' } },
            React.createElement('div', { style: { width: Math.min(usagePercent, 100) + '%', height: '100%', background: usagePercent > 80 ? '#ef4444' : '#10b981', borderRadius: '3px' } })
          ),
          React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' } }, remaining + ' bookings remaining')
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
          }, React.createElement(Plus, { size: 16 }), labels.action),
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
      
      // Recent Bookings - FIXED ₦ symbol
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
                React.createElement('p', { style: { fontWeight: '600', color: '#4f46e5', margin: 0 } }, formatNaira(booking.total_amount)),
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

  // ============================================================
  // Render Subscription / Plans tab
  // Lists all tiers from SUBSCRIPTION_TIERS, highlights the
  // current plan, and lets the user upgrade via UpgradeModal.
  // ============================================================
  const renderSubscription = () => {
    const currentTierData = getCurrentTier();
    const tierOrder = ['free', 'starter', 'pro'];

    const renderTierCard = (tierId) => {
      const tier = SUBSCRIPTION_TIERS[tierId];
      const TierIcon = tier.icon;
      const isCurrent = currentTierData.id === tierId;
      const isFree = tier.price === 0;
      const isUnlimited = tier.bookings === 999999;

      return React.createElement('div', {
        key: tier.id,
        style: {
          background: 'white',
          borderRadius: '20px',
          border: isCurrent ? ('2px solid ' + tier.color) : '1px solid #eef2ff',
          padding: '28px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isCurrent ? ('0 12px 32px ' + tier.color + '22') : 'none'
        }
      },
        tier.badge && React.createElement('span', {
          style: {
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: tier.color + '15',
            color: tier.color,
            fontSize: '11px',
            fontWeight: '600',
            padding: '4px 10px',
            borderRadius: '20px'
          }
        }, tier.badge),

        React.createElement('div', {
          style: {
            width: '52px',
            height: '52px',
            background: tier.color + '15',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }
        }, React.createElement(TierIcon, { size: 26, color: tier.color })),

        React.createElement('h3', {
          style: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }
        }, tier.name + ' Plan'),

        React.createElement('div', {
          style: { display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }
        },
          React.createElement('span', {
            style: { fontSize: '28px', fontWeight: '700', color: tier.color }
          }, isFree ? 'Free' : formatNaira(tier.price)),
          !isFree && React.createElement('span', {
            style: { fontSize: '13px', color: '#94a3b8' }
          }, '/month')
        ),

        React.createElement('p', {
          style: { fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }
        }, isUnlimited ? '♾️ Unlimited bookings per month' : (tier.bookings + ' bookings per month')),

        React.createElement('button', {
          onClick: () => isCurrent ? null : handleUpgrade(tier.id),
          disabled: isCurrent,
          style: {
            marginTop: 'auto',
            width: '100%',
            padding: '12px',
            background: isCurrent ? '#f1f5f9' : tier.color,
            color: isCurrent ? '#94a3b8' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isCurrent ? 'default' : 'pointer'
          }
        }, isCurrent ? '✓ Current Plan' : ('Upgrade to ' + tier.name))
      );
    };

    return React.createElement('div', null,
      React.createElement('div', { style: { marginBottom: '28px' } },
        React.createElement('h1', {
          style: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }
        }, 'Subscription Plans'),
        React.createElement('p', {
          style: { fontSize: '14px', color: '#64748b', margin: 0 }
        }, 'View and manage your subscription plans. Your current plan is ',
          React.createElement('strong', { style: { color: currentTierData.color } }, currentTierData.name),
          '.')
      ),

      React.createElement('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
          gap: '20px',
          marginBottom: '28px'
        }
      }, tierOrder.map(renderTierCard)),

      React.createElement('div', {
        style: {
          background: '#eef2ff',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }
      },
        React.createElement(AlertTriangle, { size: 18, color: '#4f46e5', style: { flexShrink: 0, marginTop: '2px' } }),
        React.createElement('p', {
          style: { fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }
        }, 'Upgrading takes effect after payment verification (usually within 24 hours). You can downgrade to a lower plan at any time from Settings.')
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
      case 'subscription':
        return renderSubscription();
      default:
        return renderOverview();
    }
  };

  const navItemsWithSubscription = [
    ...navItems,
    { id: 'subscription', label: 'Plans', icon: Crown }
  ];

  return React.createElement('div', { style: { display: 'flex', minHeight: '100vh', background: '#f8fafc', position: 'relative' } },
    // Mobile overlay
    React.createElement('div', { 
      style: mobileMenuOpen && !isDesktop ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 998,
        backdropFilter: 'blur(4px)'
      } : { display: 'none' },
      onClick: () => setMobileMenuOpen(false) 
    }),
    
    // Mobile menu
    React.createElement('div', { 
      style: {
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
      }
    },
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
        navItemsWithSubscription.map(item => 
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
    React.createElement('div', { 
      style: {
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
      }
    },
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
        navItemsWithSubscription.map(item => 
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
    React.createElement('div', { 
      style: {
        flex: 1,
        minWidth: 0,
        background: '#f8fafc',
        minHeight: '100vh',
        marginLeft: isDesktop ? '280px' : '0',
        transition: 'margin-left 0.3s ease'
      }
    },
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
      React.createElement('div', { style: { padding: isDesktop ? '32px' : '20px' } }, 
        renderContent(),
        React.createElement(UpgradeModal, {
          isOpen: showUpgradeModal,
          onClose: () => setShowUpgradeModal(false),
          businessName: business?.name || 'Your Business',
          currentCount: bookings.length,
          limit: limit || 50,
          selectedTier: selectedTier,
          onUpgradeComplete: handleUpgradeComplete
        })
      )
    )
  );
}

export default BusinessDashboard;