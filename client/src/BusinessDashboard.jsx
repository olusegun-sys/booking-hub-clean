// client/src/BusinessDashboard.jsx
// =============================================
// PREMIUM BUSINESS DASHBOARD - 2026 LUXURY DESIGN
// Glass-morphism, gradients, animations, premium UX
// WITH DEBUG LOGGING FOR DATA DIAGNOSTICS
// =============================================

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, Settings, LogOut, 
  Hotel, Trophy, Sparkles, Image, Clock,
  DollarSign, ChevronRight, Menu, X,
  Building2, TrendingUp, Plus, ExternalLink,
  CheckCircle, Crown, Star, Zap, AlertTriangle,
  Sparkle, Gem, Rocket, Infinity, Shield, Award,
  Copy, Check, ArrowRight, Wallet, Building, Phone, Mail
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
// SUBSCRIPTION TIERS CONFIGURATION - PREMIUM
// ============================================================
const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    bookings: 50,
    icon: Star,
    iconBg: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
    badge: 'Free',
    badgeColor: '#94a3b8',
    features: [
      '50 bookings per month',
      'Basic dashboard',
      'Email support'
    ]
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 30000,
    bookings: 100,
    icon: Zap,
    iconBg: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
    badge: 'Popular',
    badgeColor: '#4f46e5',
    features: [
      '100 bookings per month',
      'Priority email support',
      'Advanced dashboard',
      'Staff management (5 users)',
      'Email notifications'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 50000,
    bookings: 999999,
    icon: Crown,
    iconBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    badge: 'Best Value',
    badgeColor: '#d97706',
    features: [
      '♾️ Unlimited bookings',
      'Priority support (Email + WhatsApp)',
      'Advanced analytics with charts',
      'Custom branding on booking page',
      'Staff management (unlimited)',
      'SMS notifications',
      'Dedicated account manager'
    ]
  }
};

function BusinessDashboard({ business: propBusiness, onLogout }) {
  // ============================================================
  // STATE
  // ============================================================
  const [activeTab, setActiveTab] = useState('overview');
  const [business, setBusiness] = useState(propBusiness || null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [hoveredTier, setHoveredTier] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select');
  const [paymentData, setPaymentData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // TOKEN & BUSINESS ID
  // ============================================================
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const businessId = business?.id || localStorage.getItem('businessId');

  // ============================================================
  // EFFECTS
  // ============================================================
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
      console.log('[BusinessDashboard] Initializing with businessId:', businessId);
      console.log('[BusinessDashboard] Token present:', token ? 'Yes' : 'No');
      console.log('[BusinessDashboard] API_BASE:', API_BASE);
      
      Promise.all([
        fetchBusinessData(), 
        fetchRooms(), 
        fetchBookings(),
        fetchSubscriptionStatus()
      ]).finally(() => {
        setLoading(false);
        console.log('[BusinessDashboard] Initial load complete');
      });
    } else {
      console.warn('[BusinessDashboard] No businessId found');
      setLoading(false);
    }
  }, [businessId]);

  // ============================================================
  // FETCH FUNCTIONS
  // ============================================================
  function fetchBusinessData() {
    const storedBusiness = localStorage.getItem('currentBusiness');
    if (storedBusiness) {
      try {
        const parsed = JSON.parse(storedBusiness);
        setBusiness(parsed);
        console.log('[BusinessDashboard] Loaded business from localStorage:', parsed.name);
      } catch(e) {
        console.error('[BusinessDashboard] Error parsing stored business:', e);
      }
    }
    
    if (!businessId) return Promise.resolve();
    
    console.log('[BusinessDashboard] Fetching business profile for:', businessId);
    
    return fetch(API_BASE + '/api/businesses/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        console.log('[BusinessDashboard] Profile response status:', res.status);
        if (res.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        return res.json();
      })
      .then(data => {
        console.log('[BusinessDashboard] Profile data:', data);
        if (data.success && data.business) {
          setBusiness(data.business);
          localStorage.setItem('currentBusiness', JSON.stringify(data.business));
          console.log('[BusinessDashboard] Business profile updated:', data.business.name);
        } else {
          console.error('[BusinessDashboard] Profile fetch failed:', data.error);
          setError(data.error || 'Failed to load business profile');
        }
      })
      .catch(err => {
        console.error('[BusinessDashboard] Fetch business error:', err);
        setError(err.message || 'Failed to load business data');
      });
  }

  function fetchRooms() {
    if (!businessId) return Promise.resolve();
    
    console.log('[BusinessDashboard] Fetching rooms for:', businessId);
    
    return fetch(API_BASE + '/api/businesses/' + businessId + '/rooms', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        console.log('[BusinessDashboard] Rooms response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('[BusinessDashboard] Rooms data:', data);
        if (data.success) {
          setRooms(data.rooms || []);
          console.log('[BusinessDashboard] Set rooms count:', data.rooms?.length || 0);
        } else {
          console.error('[BusinessDashboard] Rooms fetch failed:', data.error);
        }
      })
      .catch(err => console.error('[BusinessDashboard] Fetch rooms error:', err));
  }

  function fetchBookings() {
    if (!businessId) return Promise.resolve();
    
    console.log('[BusinessDashboard] Fetching bookings for businessId:', businessId);
    console.log('[BusinessDashboard] Using token:', token ? 'Present (starts with ' + token.substring(0, 10) + '...)' : 'Missing');
    
    return fetch(API_BASE + '/api/businesses/' + businessId + '/bookings', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        console.log('[BusinessDashboard] Bookings response status:', res.status);
        if (res.status === 401) {
          console.error('[BusinessDashboard] Unauthorized - token may be expired');
          setError('Session expired. Please login again.');
          return { success: false, error: 'Unauthorized' };
        }
        return res.json();
      })
      .then(data => {
        console.log('[BusinessDashboard] Bookings data received:', data);
        console.log('[BusinessDashboard] Bookings count:', data.bookings?.length || 0);
        if (data.success) {
          setBookings(data.bookings || []);
          console.log('[BusinessDashboard] Set bookings count:', data.bookings?.length || 0);
          if (data.bookings && data.bookings.length > 0) {
            console.log('[BusinessDashboard] First booking:', data.bookings[0]);
          }
        } else {
          console.error('[BusinessDashboard] Bookings fetch failed:', data.error);
          setError(data.error || 'Failed to load bookings');
        }
      })
      .catch(err => {
        console.error('[BusinessDashboard] Fetch bookings error:', err);
        setError('Network error loading bookings');
      });
  }

  // ============================================================
  // SUBSCRIPTION FUNCTIONS
  // ============================================================
  function fetchSubscriptionStatus() {
    if (!businessId) return Promise.resolve();
    
    console.log('[BusinessDashboard] Fetching subscription status for:', businessId);
    
    return fetch(API_BASE + '/api/businesses/' + businessId + '/subscription', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        console.log('[BusinessDashboard] Subscription response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('[BusinessDashboard] Subscription data:', data);
        if (data.success) {
          setSubscriptionData(data.data);
        } else if (data.fallback) {
          setSubscriptionData(data.fallback);
        } else {
          console.warn('[BusinessDashboard] No subscription data, using defaults');
          setSubscriptionData({
            plan: 'free',
            limit: 50,
            used: bookings.length || 0,
            remaining: 50 - (bookings.length || 0),
            percentage: 0,
            isPremium: false
          });
        }
      })
      .catch(err => {
        console.error('[BusinessDashboard] Fetch subscription error:', err);
        setSubscriptionData({
          plan: 'free',
          limit: 50,
          used: bookings.length || 0,
          remaining: 50 - (bookings.length || 0),
          percentage: 0,
          isPremium: false
        });
      });
  }

  function handleUpgradeClick(tierId) {
    setSelectedTier(tierId);
    setPaymentStep('payment');
    setShowUpgradeModal(true);
    
    const tier = SUBSCRIPTION_TIERS[tierId];
    const reference = `UPG-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    setPaymentData({
      plan: tierId,
      planName: tier.name,
      amount: tier.price,
      reference: reference,
      bankName: 'GTBank',
      accountNumber: '0123456789',
      accountName: 'Booking Hub Limited'
    });
  }

  function handleCopyReference() {
    if (paymentData?.reference) {
      navigator.clipboard.writeText(paymentData.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  async function handleConfirmPayment() {
    if (!businessId) {
      alert('Business ID not found. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        alert('Please login again.');
        return;
      }

      console.log('[BusinessDashboard] Submitting upgrade request for:', businessId);
      console.log('[BusinessDashboard] Plan:', selectedTier);
      console.log('[BusinessDashboard] Reference:', paymentData.reference);

      const response = await fetch(`${API_BASE}/api/businesses/${businessId}/upgrade-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedTier,
          paymentReference: paymentData.reference,
          notes: `Upgrade to ${selectedTier} plan - ${new Date().toLocaleDateString('en-NG')}`
        })
      });

      console.log('[BusinessDashboard] Upgrade response status:', response.status);

      const data = await response.json();
      console.log('[BusinessDashboard] Upgrade response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create upgrade request');
      }

      setPaymentStep('success');
      
      setTimeout(() => {
        setShowUpgradeModal(false);
        setPaymentStep('select');
        setSelectedTier(null);
        setPaymentData(null);
      }, 5000);
      
    } catch (error) {
      alert(error.message || 'Failed to submit upgrade request');
      console.error('[BusinessDashboard] Upgrade error:', error);
    } finally {
      setIsProcessing(false);
    }
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
    const tier = business?.subscription_status || 'free';
    return SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
  }

  function handleBusinessUpdate(updatedBusiness) {
    setBusiness({ ...updatedBusiness });
    localStorage.setItem('currentBusiness', JSON.stringify(updatedBusiness));
  }

  const handleUpgradeComplete = async (tierId) => {
    await fetchBusinessData();
    await fetchBookings();
    await fetchSubscriptionStatus();
    setShowUpgradeModal(false);
    setPaymentStep('select');
    setSelectedTier(null);
    setPaymentData(null);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('currentBusiness');
      window.location.href = '/login';
    }
  };

  // ============================================================
  // CALCULATIONS
  // ============================================================
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const limit = business?.booking_limit || 50;
  const usagePercent = limit > 0 ? (confirmedBookings / limit) * 100 : 0;
  const remaining = Math.max(0, limit - confirmedBookings);
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
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  // ============================================================
  // RENDER OVERVIEW
  // ============================================================
  const renderOverview = () => {
    const labels = getBusinessTypeLabels();
    const Icon = labels.icon;
    const currentTierData = getCurrentTier();
    
    const subData = subscriptionData || {
      plan: business?.subscription_status || 'free',
      used: confirmedBookings || 0,
      limit: business?.booking_limit || 50,
      remaining: Math.max(0, (business?.booking_limit || 50) - (confirmedBookings || 0)),
      percentage: business?.booking_limit > 0 ? Math.round(((confirmedBookings || 0) / (business?.booking_limit || 50)) * 100) : 0
    };
    
    return React.createElement('div', null,
      // Error message if any
      error && React.createElement('div', {
        style: {
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      },
        React.createElement(AlertTriangle, { size: 16, color: '#dc2626' }),
        React.createElement('span', { style: { color: '#991b1b', fontSize: '13px' } }, error)
      ),
      
      // Refresh button
      React.createElement('div', { style: { marginBottom: '16px', textAlign: 'right' } },
        React.createElement('button', {
          onClick: function() {
            console.log('[BusinessDashboard] Manual refresh triggered');
            setError(null);
            Promise.all([fetchBusinessData(), fetchRooms(), fetchBookings(), fetchSubscriptionStatus()]);
          },
          style: {
            padding: '8px 16px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500'
          }
        }, '🔄 Refresh Data')
      ),

      // Premium Plan Banner with Glass Effect
      React.createElement('div', {
        style: {
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)',
          borderRadius: '24px',
          padding: '32px 36px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(79, 70, 229, 0.3)'
        }
      },
        // Background decorative elements
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none'
          }
        }),
        React.createElement('div', {
          style: {
            position: 'absolute',
            bottom: '-40%',
            left: '-10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.2)',
            pointerEvents: 'none'
          }
        }),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 } },
          React.createElement('div', {
            style: {
              width: '64px',
              height: '64px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          },
            React.createElement(Crown, { size: 32, color: '#fcd34d' })
          ),
          React.createElement('div', null,
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
              React.createElement('h2', { style: { fontSize: '22px', fontWeight: '700', margin: 0, color: 'white' } }, currentTierData.name + ' Plan'),
              React.createElement('span', {
                style: {
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '500',
                  letterSpacing: '0.5px',
                  color: 'white'
                }
              }, currentTierData.badge)
            ),
            React.createElement('p', { style: { opacity: 0.9, fontSize: '14px', margin: '4px 0 0 0', color: 'white' } },
              currentTierData.bookings === 999999 
                ? '♾️ Unlimited bookings' 
                : currentTierData.bookings + ' bookings per month'
            )
          )
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 } },
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('span', { style: { fontSize: '14px', opacity: 0.7, color: 'white' } }, 'Price'),
            React.createElement('div', { style: { fontSize: '20px', fontWeight: '700', color: 'white' } },
              currentTierData.price === 0 ? 'Free' : formatNaira(currentTierData.price) + '/mo'
            )
          ),
          currentTierData.id !== 'pro' && React.createElement('button', {
            onClick: () => setActiveTab('subscription'),
            style: {
              padding: '12px 28px',
              background: 'white',
              color: '#4f46e5',
              border: 'none',
              borderRadius: '40px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            },
            onMouseEnter: (e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25)'; },
            onMouseLeave: (e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }
          }, '⬆ Upgrade Now')
        )
      ),

      // Stats Grid - Premium Glass Cards
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' } },
        // Revenue
        React.createElement('div', { 
          style: { 
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease'
          },
          onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; },
          onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Total Revenue'),
            React.createElement('div', { style: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(DollarSign, { size: 20, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '30px', fontWeight: '700', color: '#0f172a', margin: 0 } }, 
            formatNaira(totalRevenue)
          ),
          React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8', marginTop: '8px' } }, 'Lifetime revenue')
        ),
        // Bookings
        React.createElement('div', { 
          style: { 
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease'
          },
          onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; },
          onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Total Bookings'),
            React.createElement('div', { style: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Calendar, { size: 20, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '30px', fontWeight: '700', color: '#0f172a', margin: 0 } }, bookings.length),
          React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8', marginTop: '8px' } }, 'Total bookings received')
        ),
        // Rooms
        React.createElement('div', { 
          style: { 
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease'
          },
          onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; },
          onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Active ' + labels.plural),
            React.createElement('div', { style: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Icon, { size: 20, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '30px', fontWeight: '700', color: '#0f172a', margin: 0 } }, rooms.length),
          React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8', marginTop: '8px' } }, 'Total ' + labels.plural.toLowerCase())
        ),
        // Usage
        React.createElement('div', { 
          style: { 
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease'
          },
          onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; },
          onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '500', color: '#64748b' } }, 'Bookings Used'),
            React.createElement('div', { style: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(TrendingUp, { size: 20, color: '#4f46e5' })
            )
          ),
          React.createElement('h2', { style: { fontSize: '30px', fontWeight: '700', color: '#0f172a', margin: 0 } }, confirmedBookings + '/' + limit),
          React.createElement('div', { style: { marginTop: '10px', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' } },
            React.createElement('div', { 
              style: { 
                width: Math.min(usagePercent, 100) + '%', 
                height: '100%', 
                background: usagePercent > 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #4f46e5, #6366f1)', 
                borderRadius: '4px',
                transition: 'width 0.6s ease'
              } 
            })
          ),
          React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8', marginTop: '10px' } }, remaining + ' bookings remaining')
        )
      ),
      
      // Quick Actions
      React.createElement('div', { style: { background: 'white', borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.6)', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' } },
        React.createElement('div', { style: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbff' } },
          React.createElement('h3', { style: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 } }, '⚡ Quick Actions')
        ),
        React.createElement('div', { style: { padding: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' } },
          React.createElement('button', { 
            onClick: () => setActiveTab('rooms'), 
            style: { padding: '12px 28px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)' },
            onMouseEnter: (e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(79, 70, 229, 0.4)'; },
            onMouseLeave: (e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.3)'; }
          }, React.createElement(Plus, { size: 16 }), labels.action),
          React.createElement('button', { 
            onClick: () => setActiveTab('profile'), 
            style: { padding: '12px 28px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' },
            onMouseEnter: (e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; },
            onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }
          }, React.createElement(Image, { size: 16 }), 'Update Images'),
          React.createElement('button', { 
            onClick: () => setActiveTab('settings'), 
            style: { padding: '12px 28px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' },
            onMouseEnter: (e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; },
            onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }
          }, React.createElement(Clock, { size: 16 }), 'Set Hours'),
          React.createElement('button', { 
            onClick: () => window.open('/book/' + business?.slug, '_blank'), 
            style: { padding: '12px 28px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' },
            onMouseEnter: (e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; },
            onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }
          }, React.createElement(ExternalLink, { size: 16 }), 'View Page')
        )
      ),
      
      // Recent Bookings
      React.createElement('div', { style: { background: 'white', borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.6)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' } },
        React.createElement('div', { style: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement('h3', { style: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 } }, 
            '📋 Recent Bookings',
            React.createElement('span', { style: { fontSize: '12px', color: '#94a3b8', marginLeft: '8px' } }, 
              '(' + bookings.length + ' total)'
            )
          ),
          React.createElement('button', { 
            onClick: () => setActiveTab('bookings'), 
            style: { background: 'none', border: 'none', color: '#4f46e5', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }
          }, 'View All', React.createElement(ChevronRight, { size: 14 }))
        ),
        React.createElement('div', { style: { padding: '24px' } },
          bookings.slice(0, 5).map(booking => 
            React.createElement('div', { key: booking.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' } },
              React.createElement('div', null,
                React.createElement('p', { style: { fontWeight: '500', color: '#0f172a', margin: 0 } }, booking.customer_name || 'Guest'),
                React.createElement('p', { style: { fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' } }, booking.booking_reference || booking.id)
              ),
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('p', { style: { fontWeight: '600', color: '#4f46e5', margin: 0 } }, formatNaira(booking.total_amount || 0)),
                React.createElement('span', { 
                  style: { 
                    fontSize: '11px', 
                    padding: '2px 12px', 
                    borderRadius: '20px', 
                    background: booking.status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                    color: booking.status === 'confirmed' ? '#065f46' : '#92400e',
                    display: 'inline-block',
                    marginTop: '4px'
                  } 
                }, booking.status || 'pending')
              )
            )
          ),
          bookings.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '40px 20px' } },
            React.createElement(Calendar, { size: 40, color: '#cbd5e1' }),
            React.createElement('p', { style: { color: '#64748b', marginTop: '12px' } }, 'No bookings yet'),
            React.createElement('button', { 
              onClick: fetchBookings,
              style: { 
                marginTop: '8px',
                padding: '6px 16px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px'
              }
            }, 'Refresh')
          )
        )
      )
    );
  };

  // ============================================================
  // RENDER SUBSCRIPTION / PLANS TAB
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
      const isHovered = hoveredTier === tierId;

      return React.createElement('div', {
        key: tier.id,
        style: {
          background: isCurrent 
            ? 'linear-gradient(145deg, #ffffff, #fafbff)' 
            : 'white',
          borderRadius: '24px',
          padding: '32px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          border: isCurrent 
            ? '2px solid ' + tier.color 
            : '1px solid rgba(226, 232, 240, 0.6)',
          boxShadow: isCurrent 
            ? '0 20px 60px ' + tier.color + '22, 0 4px 20px rgba(0,0,0,0.04)' 
            : (isHovered ? '0 12px 40px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.04)'),
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer'
        },
        onMouseEnter: () => setHoveredTier(tierId),
        onMouseLeave: () => setHoveredTier(null),
        onClick: () => !isCurrent && handleUpgradeClick(tier.id)
      },
        // Premium Badge
        tier.badge && React.createElement('div', {
          style: {
            position: 'absolute',
            top: '-12px',
            right: '24px',
            background: 'linear-gradient(135deg, ' + tier.color + ', ' + (tierId === 'pro' ? '#f59e0b' : '#6366f1') + ')',
            color: 'white',
            fontSize: '11px',
            fontWeight: '700',
            padding: '6px 16px',
            borderRadius: '20px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 15px ' + tier.color + '44'
          }
        }, tier.badge),

        // Icon with Premium Gradient
        React.createElement('div', {
          style: {
            width: '64px',
            height: '64px',
            background: tier.iconBg,
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 25px ' + tier.color + '33',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.05) rotate(-3deg)' : 'scale(1) rotate(0deg)'
          }
        }, React.createElement(TierIcon, { size: 28, color: 'white' })),

        // Plan Name & Price
        React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' } },
          React.createElement('h3', {
            style: { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }
          }, tier.name + ' Plan'),
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('span', {
              style: { fontSize: '28px', fontWeight: '800', color: tier.color }
            }, isFree ? 'Free' : formatNaira(tier.price)),
            !isFree && React.createElement('span', {
              style: { fontSize: '14px', color: '#94a3b8', marginLeft: '4px' }
            }, '/mo')
          )
        ),

        // Booking Limit Badge
        React.createElement('div', {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: tier.color + '10',
            color: tier.color,
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px'
          }
        },
          React.createElement(Infinity, { size: 14 }),
          isUnlimited ? 'Unlimited bookings' : (tier.bookings + ' bookings/month')
        ),

        // Features List
        React.createElement('ul', { style: { margin: '0 0 24px 0', padding: 0, listStyle: 'none', flex: 1 } },
          tier.features.map((feature, index) =>
            React.createElement('li', {
              key: index,
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 0',
                color: '#475569',
                fontSize: '14px',
                borderBottom: index < tier.features.length - 1 ? '1px solid #f1f5f9' : 'none'
              }
            },
              React.createElement(CheckCircle, { size: 16, color: tier.color, style: { flexShrink: 0 } }),
              React.createElement('span', null, feature)
            )
          )
        ),

        // Action Button
        React.createElement('button', {
          onClick: (e) => { e.stopPropagation(); if (!isCurrent) handleUpgradeClick(tier.id); },
          disabled: isCurrent,
          style: {
            width: '100%',
            padding: '14px',
            background: isCurrent 
              ? '#f1f5f9' 
              : 'linear-gradient(135deg, ' + tier.color + ', ' + (tierId === 'pro' ? '#f59e0b' : '#6366f1') + ')',
            color: isCurrent ? '#94a3b8' : 'white',
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isCurrent ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isCurrent ? 'none' : ('0 4px 15px ' + tier.color + '44'),
            opacity: isCurrent ? 0.7 : 1
          },
          onMouseEnter: (e) => {
            if (!isCurrent) {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px ' + tier.color + '55';
            }
          },
          onMouseLeave: (e) => {
            if (!isCurrent) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px ' + tier.color + '44';
            }
          }
        }, 
          isCurrent 
            ? React.createElement(React.Fragment, null, '✓ ', React.createElement('span', { style: { fontWeight: '700' } }, 'Current Plan'))
            : React.createElement(React.Fragment, null, '✨ Upgrade to ', tier.name)
        )
      );
    };

    // Premium Header with Decorative Elements
    return React.createElement('div', null,
      React.createElement('div', { 
        style: { 
          marginBottom: '36px',
          position: 'relative',
          padding: '32px 0 20px 0'
        }
      },
        // Decorative gradient line
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #d97706, #4f46e5)',
            borderRadius: '4px',
            backgroundSize: '200% 100%',
            animation: 'gradientMove 4s ease-in-out infinite'
          }
        }),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' } },
          React.createElement('div', null,
            React.createElement('h1', {
              style: { 
                fontSize: isDesktop ? '32px' : '24px', 
                fontWeight: '800', 
                color: '#0f172a', 
                margin: '0 0 8px 0',
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }
            },
              '💎 Subscription Plans',
              React.createElement('span', {
                style: {
                  fontSize: '12px',
                  fontWeight: '500',
                  background: currentTierData.color + '15',
                  color: currentTierData.color,
                  padding: '4px 14px',
                  borderRadius: '20px'
                }
              }, currentTierData.name)
            ),
            React.createElement('p', {
              style: { fontSize: '16px', color: '#64748b', margin: 0 }
            }, 'Choose the perfect plan for your business growth')
          ),
          React.createElement('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              padding: '8px 16px',
              borderRadius: '40px',
              border: '1px solid #e2e8f0'
            }
          },
            React.createElement(Users, { size: 16, color: '#64748b' }),
            React.createElement('span', { style: { fontSize: '13px', color: '#475569', fontWeight: '500' } },
              confirmedBookings, ' of ', limit, ' bookings used'
            )
          )
        )
      ),

      // Premium Plan Cards Grid
      React.createElement('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
          gap: '24px',
          marginBottom: '32px'
        }
      }, tierOrder.map(renderTierCard)),

      // Premium Footer Note
      React.createElement('div', {
        style: {
          background: 'linear-gradient(135deg, #f8fafc, #eef2ff)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          border: '1px solid rgba(79, 70, 229, 0.1)'
        }
      },
        React.createElement(Shield, { size: 20, color: '#4f46e5', style: { flexShrink: 0, marginTop: '2px' } }),
        React.createElement('div', null,
          React.createElement('p', {
            style: { fontSize: '14px', color: '#475569', margin: 0, fontWeight: '500' }
          }, '🔒 Secure & Flexible'),
          React.createElement('p', {
            style: { fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }
          }, 'Upgrades take effect within 24 hours after payment verification. Cancel or downgrade anytime from Settings.')
        )
      )
    );
  };

  // ============================================================
  // RENDER UPGRADE MODAL - DIRECT PAYMENT (NO PLAN SELECTION)
  // ============================================================
  const renderUpgradeModal = () => {
    if (!showUpgradeModal) return null;

    const tier = selectedTier ? SUBSCRIPTION_TIERS[selectedTier] : null;
    if (!tier) return null;

    const isSuccess = paymentStep === 'success';
    const isProcessingState = isProcessing;

    // ============================================================
    // SUCCESS STEP
    // ============================================================
    if (isSuccess) {
      return React.createElement('div', {
        style: {
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        },
        onClick: () => {
          setShowUpgradeModal(false);
          setPaymentStep('select');
          setSelectedTier(null);
          setPaymentData(null);
        }
      },
        React.createElement('div', {
          style: {
            background: 'white',
            borderRadius: '32px',
            maxWidth: '480px',
            width: '100%',
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
            animation: 'scaleIn 0.4s ease'
          }
        },
          React.createElement('div', {
            style: {
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }
          },
            React.createElement(Check, { size: 40, color: '#065f46' })
          ),
          React.createElement('h2', {
            style: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }
          }, '✅ Upgrade Request Submitted!'),
          React.createElement('p', {
            style: { fontSize: '15px', color: '#64748b', margin: '0 0 24px 0' }
          },
            'We\'ve received your request to upgrade to ',
            React.createElement('strong', null, tier.name),
            ' Plan'
          ),
          React.createElement('div', {
            style: {
              background: '#f0fdf4',
              borderRadius: '16px',
              padding: '16px 20px',
              textAlign: 'left',
              marginBottom: '24px'
            }
          },
            React.createElement('p', {
              style: { fontSize: '13px', color: '#065f46', margin: '0 0 8px 0', fontWeight: '600' }
            }, '📋 Next Steps:'),
            React.createElement('ol', {
              style: { fontSize: '13px', color: '#065f46', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }
            },
              React.createElement('li', null, 'Transfer ', React.createElement('strong', null, formatNaira(paymentData?.amount)), ' to our account'),
              React.createElement('li', null, 'Use reference: ', React.createElement('strong', { style: { fontFamily: 'monospace', fontSize: '12px' } }, paymentData?.reference)),
              React.createElement('li', null, 'We\'ll verify and activate within ', React.createElement('strong', null, '24 hours'))
            )
          ),
          React.createElement('button', {
            onClick: () => {
              setShowUpgradeModal(false);
              setPaymentStep('select');
              setSelectedTier(null);
              setPaymentData(null);
            },
            style: {
              width: '100%',
              padding: '14px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }
          }, 'Go to Dashboard')
        )
      );
    }

    // ============================================================
    // PAYMENT STEP - PREMIUM REDESIGN
    // ============================================================
    return React.createElement('div', {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      },
      onClick: (e) => {
        if (e.target === e.currentTarget) {
          setShowUpgradeModal(false);
          setPaymentStep('select');
          setSelectedTier(null);
          setPaymentData(null);
        }
      }
    },
      React.createElement('div', {
        style: {
          background: 'white',
          borderRadius: '32px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.4s ease'
        }
      },
        // Header
        React.createElement('div', {
          style: {
            padding: '28px 32px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }
        },
          React.createElement('div', null,
            React.createElement('h2', {
              style: { fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }
            }, '💳 Complete Payment'),
            React.createElement('p', {
              style: { fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }
            }, 'Transfer the exact amount to our bank account')
          ),
          React.createElement('button', {
            onClick: () => {
              setShowUpgradeModal(false);
              setPaymentStep('select');
              setSelectedTier(null);
              setPaymentData(null);
            },
            style: {
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '0 8px'
            }
          }, '✕')
        ),

        // Plan Summary Banner
        React.createElement('div', {
          style: {
            margin: '24px 32px 0',
            background: 'linear-gradient(135deg, ' + tier.color + '15, ' + tier.color + '08)',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid ' + tier.color + '30',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }
        },
          React.createElement('div', null,
            React.createElement('span', {
              style: { fontSize: '12px', color: '#64748b', fontWeight: '500' }
            }, 'Upgrading to'),
            React.createElement('div', {
              style: { fontSize: '18px', fontWeight: '700', color: tier.color }
            }, tier.name + ' Plan')
          ),
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('span', {
              style: { fontSize: '12px', color: '#64748b', fontWeight: '500' }
            }, 'Amount'),
            React.createElement('div', {
              style: { fontSize: '22px', fontWeight: '800', color: tier.color }
            }, formatNaira(tier.price))
          )
        ),

        // Payment Details - Premium Redesign
        React.createElement('div', {
          style: { padding: '24px 32px' }
        },
          React.createElement('div', {
            style: {
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0'
            }
          },
            // Bank Header
            React.createElement('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '2px dashed #e2e8f0'
              }
            },
              React.createElement('div', {
                style: {
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              },
                React.createElement(Building, { size: 24, color: 'white' })
              ),
              React.createElement('div', null,
                React.createElement('div', {
                  style: { fontSize: '16px', fontWeight: '700', color: '#0f172a' }
                }, paymentData?.bankName),
                React.createElement('div', {
                  style: { fontSize: '13px', color: '#64748b' }
                }, paymentData?.accountName)
              )
            ),

            // Account Number - Highlighted
            React.createElement('div', {
              style: {
                background: 'white',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '12px',
                border: '2px solid #4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }
            },
              React.createElement('div', null,
                React.createElement('div', {
                  style: { fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }
                }, 'Account Number'),
                React.createElement('div', {
                  style: { fontSize: '20px', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace', letterSpacing: '2px' }
                }, paymentData?.accountNumber)
              ),
              React.createElement('div', {
                style: {
                  background: '#d1fae5',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  color: '#065f46',
                  fontWeight: '600'
                }
              }, '✓ Active')
            ),

            // Other Details in Grid
            React.createElement('div', {
              style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }
            },
              React.createElement('div', {
                style: {
                  background: 'white',
                  borderRadius: '10px',
                  padding: '12px 14px'
                }
              },
                React.createElement('div', {
                  style: { fontSize: '10px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }
                }, 'Plan'),
                React.createElement('div', {
                  style: { fontSize: '14px', fontWeight: '600', color: '#0f172a', textTransform: 'capitalize' }
                }, paymentData?.plan)
              ),
              React.createElement('div', {
                style: {
                  background: 'white',
                  borderRadius: '10px',
                  padding: '12px 14px'
                }
              },
                React.createElement('div', {
                  style: { fontSize: '10px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }
                }, 'Amount'),
                React.createElement('div', {
                  style: { fontSize: '14px', fontWeight: '600', color: '#0f172a' }
                }, formatNaira(paymentData?.amount))
              )
            ),

            // Reference - Copyable
            React.createElement('div', {
              style: {
                background: 'white',
                borderRadius: '10px',
                padding: '12px 14px',
                marginTop: '8px',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }
            },
              React.createElement('div', null,
                React.createElement('div', {
                  style: { fontSize: '10px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }
                }, 'Reference (Use as narration)'),
                React.createElement('div', {
                  style: { fontSize: '13px', fontWeight: '600', color: '#0f172a', fontFamily: 'monospace' }
                }, paymentData?.reference)
              ),
              React.createElement('button', {
                onClick: handleCopyReference,
                style: {
                  background: copied ? '#d1fae5' : '#eef2ff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: copied ? '#065f46' : '#4f46e5',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }
              },
                copied 
                  ? React.createElement(React.Fragment, null, React.createElement(Check, { size: 14 }), ' Copied')
                  : React.createElement(React.Fragment, null, React.createElement(Copy, { size: 14 }), ' Copy')
              )
            )
          ),

          // Important Note
          React.createElement('div', {
            style: {
              background: '#fffbeb',
              borderRadius: '12px',
              padding: '14px 16px',
              marginTop: '16px',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }
          },
            React.createElement(AlertTriangle, { size: 18, color: '#d97706', style: { flexShrink: 0, marginTop: '1px' } }),
            React.createElement('div', null,
              React.createElement('div', {
                style: { fontSize: '13px', fontWeight: '600', color: '#92400e' }
              }, '⚠️ Important'),
              React.createElement('div', {
                style: { fontSize: '12px', color: '#78350f' }
              },
                'Use the reference as narration. Verification takes ',
                React.createElement('strong', null, 'up to 24 hours')
              )
            )
          ),

          // Action Buttons
          React.createElement('div', {
            style: { marginTop: '20px', display: 'flex', gap: '12px' }
          },
            React.createElement('button', {
              onClick: handleConfirmPayment,
              disabled: isProcessingState,
              style: {
                flex: 1,
                padding: '14px 24px',
                background: isProcessingState ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isProcessingState ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isProcessingState ? 'none' : '0 4px 20px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.3s ease'
              },
              onMouseEnter: (e) => {
                if (!isProcessingState) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(79, 70, 229, 0.4)';
                }
              },
              onMouseLeave: (e) => {
                if (!isProcessingState) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.3)';
                }
              }
            },
              isProcessingState 
                ? React.createElement(React.Fragment, null, 
                    React.createElement('div', { style: { width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' } }),
                    ' Processing...'
                  )
                : React.createElement(React.Fragment, null,
                    React.createElement(Check, { size: 18 }),
                    ' I\'ve Made the Transfer'
                  )
            ),
            React.createElement('button', {
              onClick: () => {
                setShowUpgradeModal(false);
                setPaymentStep('select');
                setSelectedTier(null);
                setPaymentData(null);
              },
              style: {
                padding: '14px 20px',
                background: 'white',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              },
              onMouseEnter: (e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; },
              onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }
            }, 'Cancel')
          )
        )
      )
    );
  };

  // ============================================================
  // RENDER CONTENT
  // ============================================================
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

  // ============================================================
  // MAIN RENDER
  // ============================================================
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
        renderUpgradeModal()
      )
    )
  );
}

export default BusinessDashboard;