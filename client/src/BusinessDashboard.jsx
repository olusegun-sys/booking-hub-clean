// client/src/BusinessDashboard.jsx
// =============================================
// BUSINESS DASHBOARD — RESTYLED 19 Oct 2026
// Colours: plz-blue #2D60EA (was indigo #4f46e5)
// Fonts: Manrope prepended
// Cards: 14px radius (was 20px)
// Buttons: 10px soft rectangle (was 40px pill)
// Sidebar: matches Emmanuel's design — solid pill active state
// Logic unchanged — only styling
// =============================================

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Settings, LogOut, 
  Hotel, Trophy, Sparkles, Image, Clock,
  DollarSign, ChevronRight, Menu, X,
  Building2, TrendingUp, Plus, ExternalLink,
  CheckCircle, Crown, Star, Zap, AlertTriangle,
  Sparkle, Gem, Rocket, Infinity as InfinityIcon, Shield, Award,
  Copy, Check, ArrowRight, Wallet, Building, Phone, Mail,
  PartyPopper, Music, Cake, Briefcase, Gift, GlassWater,
  Link as LinkIcon,
  Utensils, Coffee, Scissors, Car, Dumbbell
} from 'lucide-react';
import RoomPage from './RoomPage';
import BookingsManager from './BookingsManager';
import BusinessProfile from './BusinessProfile';
import BusinessSettings from './BusinessSettings';
import UpgradeModal from './components/UpgradeModal';
import API_BASE from './config';

// ============================================================
// DESIGN TOKENS — plz-blue palette
// ============================================================
// WHY: centralised so a future global swap only changes one place.
// Aligned to Plazzaa marketing design (#2D60EA primary).
const PLZ_BLUE = '#2D60EA';
const PLZ_BLUE_DEEP = '#1F47B4';
const PLZ_BLUE_TINT = '#E8F4FF';
const PLZ_INK = '#18181B';
const PLZ_BODY = '#52525B';
const PLZ_GREY = '#A1A1AA';
const PLZ_LINE = '#E4E4E7';
const PLZ_SURFACE = '#F4F4F5';
const PLZ_CREAM = '#FEF8E7';
const PLZ_ERROR = '#C0395A';
const PLZ_ERROR_TINT = '#FDEEF0';
const PLZ_SUCCESS = '#1B7F43';
const PLZ_SUCCESS_TINT = '#EAF7EF';
const PLZ_WARN = '#B0840F';
const PLZ_WARN_TINT = '#FEF8E7';

// WHY: prepended to the app's existing font stack so his marketing
// pages and our product pages share typography. Falls back to system
// fonts if Manrope hasn't loaded yet (browser default).
const FONT_STACK = "'Manrope', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// WHY: card radius is one design token — matching his cards (14px).
const CARD_RADIUS = '14px';
const CARD_RADIUS_LG = '16px';

// ============================================================
// HELPERS
// ============================================================
function formatNaira(amount) {
  if (!amount && amount !== 0) return '₦0';
  return '₦' + Number(amount).toLocaleString();
}

function getBookingBaseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return 'https://booking-frontend-clean.onrender.com';
}

// ============================================================
// SUBSCRIPTION TIERS — blue palette
// ============================================================
const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    bookings: 50,
    icon: Star,
    iconBg: 'linear-gradient(135deg, #E4E4E7, #D4D4D8)',
    color: '#52525B',
    gradient: 'linear-gradient(135deg, #F4F4F5, #E4E4E7)',
    badge: 'Free',
    badgeColor: '#A1A1AA',
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
    iconBg: 'linear-gradient(135deg, #2D60EA, #1F47B4)',
    color: PLZ_BLUE,
    gradient: 'linear-gradient(135deg, #E8F4FF, #D6E9FF)',
    badge: 'Popular',
    badgeColor: PLZ_BLUE,
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select');
  const [paymentData, setPaymentData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // TOKEN & BUSINESS ID
  // ============================================================
  const token = localStorage.getItem('business_token')
             || localStorage.getItem('auth_token')
             || localStorage.getItem('token');
  const businessId = business?.id || localStorage.getItem('businessId');

  // ============================================================
  // BOOKING LINK
  // ============================================================
  const bookingLink = business?.slug 
    ? getBookingBaseUrl() + '/book/' + business.slug 
    : '';

  function handleCopyBookingLink() {
    if (!bookingLink) return;
    navigator.clipboard.writeText(bookingLink).then(function() {
      setLinkCopied(true);
      setTimeout(function() { setLinkCopied(false); }, 3000);
    }).catch(function() {
      const textArea = document.createElement('textarea');
      textArea.value = bookingLink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setLinkCopied(true);
        setTimeout(function() { setLinkCopied(false); }, 3000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
      document.body.removeChild(textArea);
    });
  }

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
  // FETCH FUNCTIONS (unchanged)
  // ============================================================
  function fetchBusinessData() {
    const storedBusiness = localStorage.getItem('currentBusiness');
    if (storedBusiness) {
      try {
        const parsed = JSON.parse(storedBusiness);
        setBusiness(parsed);
      } catch(e) {
        console.error('[BusinessDashboard] Error parsing stored business:', e);
      }
    }
    
    if (!businessId) return Promise.resolve();
    
    return fetch(API_BASE + '/api/businesses/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        if (res.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        return res.json();
      })
      .then(data => {
        if (data.success && data.business) {
          setBusiness(data.business);
          localStorage.setItem('currentBusiness', JSON.stringify(data.business));
        } else {
          setError(data.error || 'Failed to load business profile');
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to load business data');
      });
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
      .catch(err => console.error('[BusinessDashboard] Fetch rooms error:', err));
  }

  function fetchBookings() {
    if (!businessId) return Promise.resolve();
    return fetch(API_BASE + '/api/businesses/' + businessId + '/bookings', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        if (res.status === 401) {
          setError('Session expired. Please login again.');
          return { success: false, error: 'Unauthorized' };
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setBookings(data.bookings || []);
        } else {
          setError(data.error || 'Failed to load bookings');
        }
      })
      .catch(err => {
        setError('Network error loading bookings');
      });
  }

  // ============================================================
  // SUBSCRIPTION FUNCTIONS (unchanged)
  // ============================================================
  function fetchSubscriptionStatus() {
    if (!businessId) return Promise.resolve();
    return fetch(API_BASE + '/api/businesses/' + businessId + '/subscription', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubscriptionData(data.data);
        } else if (data.fallback) {
          setSubscriptionData(data.fallback);
        } else {
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
      accountName: 'Plazzaa Limited'
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
      const token = localStorage.getItem('business_token')
                 || localStorage.getItem('auth_token')
                 || localStorage.getItem('token');
      if (!token) {
        alert('Please login again.');
        return;
      }

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

      const data = await response.json();

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

  // ============================================================
  // BUSINESS TYPE CONFIG (unchanged)
  // ============================================================
  function getBusinessTypeConfig() {
    const raw = business?.business_type;
    const type = (raw || '').toString().toLowerCase().trim();

    const configs = {
      hotel: { label: 'Hotel', singular: 'Room', plural: 'Rooms', action: 'Add Room', icon: Hotel, iconColor: PLZ_BLUE },
      apartment: { label: 'Apartment', singular: 'Apartment', plural: 'Apartments', action: 'Add Apartment', icon: Building2, iconColor: PLZ_BLUE },
      event_hall: { label: 'Event Hall', singular: 'Hall', plural: 'Halls', action: 'Add Hall', icon: PartyPopper, iconColor: '#d97706' },
      event: { label: 'Events', singular: 'Venue', plural: 'Venues', action: 'Add Venue', icon: Sparkles, iconColor: '#d97706' },
      restaurant: { label: 'Restaurant', singular: 'Menu Item', plural: 'Menu & Services', action: 'Add Menu Item', icon: Utensils, iconColor: '#ea580c' },
      diner: { label: 'Diner', singular: 'Menu Item', plural: 'Menu & Services', action: 'Add Menu Item', icon: Utensils, iconColor: '#ea580c' },
      cafe: { label: 'Café', singular: 'Item', plural: 'Menu & Services', action: 'Add Item', icon: Coffee, iconColor: '#b45309' },
      other_food: { label: 'Food', singular: 'Item', plural: 'Menu & Services', action: 'Add Item', icon: Utensils, iconColor: '#ea580c' },
      sports: { label: 'Sports', singular: 'Court', plural: 'Courts', action: 'Add Court', icon: Trophy, iconColor: '#059669' },
      spa: { label: 'Spa', singular: 'Service', plural: 'Services', action: 'Add Service', icon: Sparkles, iconColor: '#0891b2' },
      beauty_salon: { label: 'Salon', singular: 'Service', plural: 'Services', action: 'Add Service', icon: Scissors, iconColor: '#db2777' },
      salon: { label: 'Salon', singular: 'Service', plural: 'Services', action: 'Add Service', icon: Scissors, iconColor: '#db2777' },
      nails: { label: 'Nails', singular: 'Service', plural: 'Services', action: 'Add Service', icon: Sparkle, iconColor: '#db2777' },
      car_wash: { label: 'Car Wash', singular: 'Service', plural: 'Services', action: 'Add Service', icon: Car, iconColor: '#0ea5e9' },
      'car-wash': { label: 'Car Wash', singular: 'Service', plural: 'Services', action: 'Add Service', icon: Car, iconColor: '#0ea5e9' },
      carwash: { label: 'Car Wash', singular: 'Service', plural: 'Services', action: 'Add Service', icon: Car, iconColor: '#0ea5e9' },
      activity_place: { label: 'Activities', singular: 'Activity', plural: 'Activities', action: 'Add Activity', icon: Dumbbell, iconColor: '#7c3aed' }
    };

    return configs[type] || {
      label: 'Business', singular: 'Item', plural: 'Items', action: 'Add Item', icon: Building2, iconColor: PLZ_BLUE
    };
  }

  function getBusinessTypeLabels() { return getBusinessTypeConfig(); }
  const typeLabels = getBusinessTypeLabels();
  const TypeIcon = typeLabels.icon;

  function getBusinessTypeIcon() {
    const config = getBusinessTypeConfig();
    return React.createElement(config.icon, { size: 14 });
  }

  function getBusinessTypeLabel() { return getBusinessTypeConfig().label; }

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
    localStorage.removeItem('business_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('currentBusiness');

    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  // ============================================================
  // CALCULATIONS (unchanged)
  // ============================================================
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const limit = business?.booking_limit || 50;
  const usagePercent = limit > 0 ? (confirmedBookings / limit) * 100 : 0;
  const remaining = Math.max(0, limit - confirmedBookings);
  const currentTier = getCurrentTier();

  // ============================================================
  // NAV ITEMS
  // ============================================================
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'rooms', label: typeLabels.plural, icon: TypeIcon },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return React.createElement('div', { 
      style: { 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        minHeight: '100vh', background: PLZ_SURFACE, fontFamily: FONT_STACK 
      } 
    },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  // ============================================================
  // RENDER OVERVIEW — RESTYLED
  // ============================================================
  const renderOverview = () => {
    const labels = getBusinessTypeLabels();
    const Icon = labels.icon;
    const currentTierData = getCurrentTier();
    
    return React.createElement('div', null,
      // Error message
      error && React.createElement('div', {
        style: {
          backgroundColor: PLZ_ERROR_TINT,
          border: '1px solid ' + PLZ_ERROR + '33',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      },
        React.createElement(AlertTriangle, { size: 16, color: PLZ_ERROR }),
        React.createElement('span', { style: { color: PLZ_ERROR, fontSize: '13px' } }, error)
      ),

      // Plan Banner — darker plz-blue gradient, softer radius
      React.createElement('div', {
        style: {
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2D60EA 60%, #4A7DFF 100%)',
          borderRadius: CARD_RADIUS_LG,
          padding: isDesktop ? '28px 32px' : '20px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(45, 96, 234, 0.25)',
          fontFamily: FONT_STACK
        }
      },
        React.createElement('div', {
          style: {
            position: 'absolute', top: '-50%', right: '-20%',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', pointerEvents: 'none'
          }
        }),
        React.createElement('div', {
          style: {
            position: 'absolute', bottom: '-40%', left: '-10%',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', pointerEvents: 'none'
          }
        }),
        React.createElement('div', { 
          style: { 
            display: 'flex', alignItems: 'center', gap: '14px', 
            position: 'relative', zIndex: 1, flexWrap: 'wrap' 
          } 
        },
          React.createElement('div', {
            style: {
              width: '52px', height: '52px',
              background: 'rgba(255,255,255,0.18)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              flexShrink: 0
            }
          },
            React.createElement(Crown, { size: 26, color: '#FFD166' })
          ),
          React.createElement('div', { style: { minWidth: 0, flex: 1 } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
              React.createElement('h2', { 
                style: { 
                  fontSize: isDesktop ? '19px' : '16px', 
                  fontWeight: '600', margin: 0, color: 'white',
                  letterSpacing: '-0.01em'
                } 
              }, currentTierData.name + ' Plan'),
              React.createElement('span', {
                style: {
                  background: 'rgba(255,255,255,0.22)',
                  padding: '2px 10px', borderRadius: '20px',
                  fontSize: '10px', fontWeight: '600',
                  letterSpacing: '0.5px', color: 'white'
                }
              }, currentTierData.badge)
            ),
            React.createElement('p', { 
              style: { 
                opacity: 0.92, fontSize: isDesktop ? '13px' : '12px',
                margin: '4px 0 0 0', color: 'white'
              } 
            },
              currentTierData.bookings === 999999 
                ? '♾️ Unlimited bookings' 
                : currentTierData.bookings + ' bookings per month'
            )
          )
        ),
        React.createElement('div', { 
          style: { 
            display: 'flex', alignItems: 'center', gap: '12px',
            position: 'relative', zIndex: 1, flexWrap: 'wrap'
          } 
        },
          React.createElement('div', { style: { textAlign: isDesktop ? 'right' : 'left' } },
            React.createElement('span', { 
              style: { fontSize: '11px', opacity: 0.75, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' } 
            }, 'Price'),
            React.createElement('div', { 
              style: { fontSize: isDesktop ? '18px' : '16px', fontWeight: '700', color: 'white' } 
            },
              currentTierData.price === 0 ? 'Free' : formatNaira(currentTierData.price) + '/mo'
            )
          ),
          currentTierData.id !== 'pro' && React.createElement('button', {
            onClick: () => setActiveTab('subscription'),
            style: {
              padding: isDesktop ? '10px 22px' : '8px 16px',
              background: 'white', color: PLZ_BLUE,
              border: 'none', borderRadius: '10px',
              fontSize: isDesktop ? '13px' : '12px',
              fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap', fontFamily: FONT_STACK
            },
            onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-1px)'; },
            onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)'; }
          }, '⬆ Upgrade')
        )
      ),

      // Booking Link Card — refined
      React.createElement('div', {
        style: {
          background: 'white',
          borderRadius: CARD_RADIUS,
          padding: isDesktop ? '20px 22px' : '16px 18px',
          marginBottom: '20px',
          border: '1px solid ' + PLZ_LINE,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: FONT_STACK
        }
      },
        React.createElement('div', {
          style: {
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, ' + PLZ_BLUE + ', #4A7DFF)'
          }
        }),
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }
        },
          React.createElement('div', {
            style: {
              width: '36px', height: '36px', borderRadius: '10px',
              background: PLZ_BLUE_TINT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }
          },
            React.createElement(LinkIcon, { size: 18, color: PLZ_BLUE })
          ),
          React.createElement('h3', {
            style: {
              fontSize: isDesktop ? '15px' : '14px',
              fontWeight: '600', color: PLZ_INK,
              margin: 0, letterSpacing: '-0.01em'
            }
          }, 'Your Booking Link')
        ),
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: isDesktop ? 'center' : 'stretch',
            gap: isDesktop ? '12px' : '8px',
            background: PLZ_SURFACE,
            borderRadius: '10px',
            padding: isDesktop ? '10px 12px 10px 16px' : '8px 8px 8px 12px',
            border: '1px solid ' + PLZ_LINE,
            flexDirection: isDesktop ? 'row' : 'column'
          }
        },
          React.createElement('div', {
            style: { flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '8px' }
          },
            React.createElement('code', {
              style: {
                fontSize: isDesktop ? '13px' : '11px',
                color: PLZ_BODY,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                width: '100%', display: 'block'
              }
            }, bookingLink || 'Loading...')
          ),
          React.createElement('button', {
            onClick: handleCopyBookingLink,
            disabled: !bookingLink,
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: isDesktop ? '9px 16px' : '9px 14px',
              background: linkCopied ? PLZ_SUCCESS : PLZ_BLUE,
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: isDesktop ? '13px' : '12px', fontWeight: '600',
              cursor: bookingLink ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all 0.2s ease',
              boxShadow: linkCopied 
                ? '0 2px 8px rgba(27, 127, 67, 0.25)' 
                : '0 2px 8px rgba(45, 96, 234, 0.25)',
              width: isDesktop ? 'auto' : '100%',
              fontFamily: FONT_STACK
            },
            onMouseEnter: (e) => {
              if (bookingLink && !linkCopied) {
                e.currentTarget.style.background = PLZ_BLUE_DEEP;
              }
            },
            onMouseLeave: (e) => {
              if (!linkCopied) {
                e.currentTarget.style.background = PLZ_BLUE;
              }
            }
          },
            linkCopied 
              ? React.createElement(React.Fragment, null, React.createElement(Check, { size: 14 }), 'Copied!')
              : React.createElement(React.Fragment, null, React.createElement(Copy, { size: 14 }), 'Copy Link')
          )
        )
      ),

      // Stats Grid — refined cards
      React.createElement('div', { 
        style: { 
          display: 'grid', 
          gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
          gap: '16px', marginBottom: '24px',
          fontFamily: FONT_STACK
        } 
      },
        renderStatCard({
          label: 'Total Revenue',
          value: formatNaira(totalRevenue),
          icon: DollarSign,
          iconColor: PLZ_BLUE,
          desc: 'Lifetime revenue',
          isDesktop: isDesktop
        }),
        renderStatCard({
          label: 'Total Bookings',
          value: bookings.length,
          icon: Calendar,
          iconColor: PLZ_BLUE,
          desc: 'Total bookings received',
          isDesktop: isDesktop
        }),
        renderStatCard({
          label: 'Active ' + labels.plural,
          value: rooms.length,
          icon: Icon,
          iconColor: labels.iconColor,
          desc: 'Total ' + labels.plural.toLowerCase(),
          isDesktop: isDesktop
        }),
        React.createElement('div', { 
          style: { 
            background: 'white',
            borderRadius: CARD_RADIUS,
            padding: isDesktop ? '20px' : '16px',
            border: '1px solid ' + PLZ_LINE,
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.2s ease'
          },
          onMouseEnter: (e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)'; },
          onMouseLeave: (e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.04)'; }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' } },
            React.createElement('span', { style: { fontSize: isDesktop ? '12px' : '11px', fontWeight: '500', color: PLZ_BODY } }, 'Bookings Used'),
            React.createElement('div', { 
              style: { 
                width: '36px', height: '36px', 
                background: PLZ_BLUE_TINT, 
                borderRadius: '10px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              } 
            },
              React.createElement(TrendingUp, { size: 18, color: PLZ_BLUE })
            )
          ),
          React.createElement('h2', { 
            style: { fontSize: isDesktop ? '24px' : '20px', fontWeight: '600', color: PLZ_INK, margin: 0, letterSpacing: '-0.02em' } 
          }, confirmedBookings + '/' + limit),
          React.createElement('div', { 
            style: { marginTop: '8px', height: '5px', background: PLZ_SURFACE, borderRadius: '4px', overflow: 'hidden' } 
          },
            React.createElement('div', { 
              style: { 
                width: Math.min(usagePercent, 100) + '%', 
                height: '100%',
                background: usagePercent > 80 
                  ? 'linear-gradient(90deg, ' + PLZ_ERROR + ', #a32e4c)' 
                  : 'linear-gradient(90deg, ' + PLZ_BLUE + ', #4A7DFF)',
                borderRadius: '4px', transition: 'width 0.6s ease'
              } 
            })
          ),
          React.createElement('p', { style: { fontSize: isDesktop ? '12px' : '11px', color: PLZ_GREY, marginTop: '8px' } }, remaining + ' bookings remaining')
        )
      ),
      
      // Quick Actions — refined
      React.createElement('div', { 
        style: { 
          background: 'white', 
          borderRadius: CARD_RADIUS, 
          border: '1px solid ' + PLZ_LINE, 
          overflow: 'hidden', 
          marginBottom: '24px', 
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          fontFamily: FONT_STACK
        } 
      },
        React.createElement('div', { 
          style: { 
            padding: isDesktop ? '16px 22px' : '14px 18px', 
            borderBottom: '1px solid ' + PLZ_LINE, 
            background: '#FAFBFF' 
          } 
        },
          React.createElement('h3', { 
            style: { fontSize: isDesktop ? '15px' : '14px', fontWeight: '600', color: PLZ_INK, margin: 0 } 
          }, '⚡ Quick Actions')
        ),
        React.createElement('div', { 
          style: { 
            padding: isDesktop ? '18px 22px' : '16px 18px',
            display: 'flex', gap: '10px', flexWrap: 'wrap'
          } 
        },
          React.createElement('button', { 
            onClick: () => setActiveTab('rooms'), 
            style: { 
              padding: isDesktop ? '10px 18px' : '10px 16px',
              background: PLZ_BLUE, color: 'white',
              border: 'none', borderRadius: '10px',
              fontSize: isDesktop ? '13px' : '12px', fontWeight: '600',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(45, 96, 234, 0.25)',
              fontFamily: FONT_STACK
            },
            onMouseEnter: (e) => { e.currentTarget.style.background = PLZ_BLUE_DEEP; },
            onMouseLeave: (e) => { e.currentTarget.style.background = PLZ_BLUE; }
          }, React.createElement(Plus, { size: 14 }), labels.action),
          React.createElement('button', { 
            onClick: () => setActiveTab('profile'), 
            style: { 
              padding: isDesktop ? '10px 18px' : '10px 16px',
              background: 'white', color: PLZ_BODY,
              border: '1px solid ' + PLZ_LINE, borderRadius: '10px',
              fontSize: isDesktop ? '13px' : '12px', fontWeight: '500',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s ease',
              fontFamily: FONT_STACK
            },
            onMouseEnter: (e) => { e.currentTarget.style.borderColor = PLZ_BLUE; e.currentTarget.style.color = PLZ_BLUE; },
            onMouseLeave: (e) => { e.currentTarget.style.borderColor = PLZ_LINE; e.currentTarget.style.color = PLZ_BODY; }
          }, React.createElement(Image, { size: 14 }), 'Update Images'),
          React.createElement('button', { 
            onClick: () => setActiveTab('settings'), 
            style: { 
              padding: isDesktop ? '10px 18px' : '10px 16px',
              background: 'white', color: PLZ_BODY,
              border: '1px solid ' + PLZ_LINE, borderRadius: '10px',
              fontSize: isDesktop ? '13px' : '12px', fontWeight: '500',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s ease',
              fontFamily: FONT_STACK
            },
            onMouseEnter: (e) => { e.currentTarget.style.borderColor = PLZ_BLUE; e.currentTarget.style.color = PLZ_BLUE; },
            onMouseLeave: (e) => { e.currentTarget.style.borderColor = PLZ_LINE; e.currentTarget.style.color = PLZ_BODY; }
          }, React.createElement(Clock, { size: 14 }), 'Set Hours')
        )
      ),
      
      // Recent Bookings — refined
      React.createElement('div', { 
        style: { 
          background: 'white', 
          borderRadius: CARD_RADIUS, 
          border: '1px solid ' + PLZ_LINE, 
          overflow: 'hidden', 
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          fontFamily: FONT_STACK
        } 
      },
        React.createElement('div', { 
          style: { 
            padding: isDesktop ? '16px 22px' : '14px 18px',
            borderBottom: '1px solid ' + PLZ_LINE,
            background: '#FAFBFF',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '8px'
          } 
        },
          React.createElement('h3', { 
            style: { fontSize: isDesktop ? '15px' : '14px', fontWeight: '600', color: PLZ_INK, margin: 0 } 
          },
            '📋 Recent Bookings',
            React.createElement('span', { style: { fontSize: '11px', color: PLZ_GREY, marginLeft: '8px' } }, 
              '(' + bookings.length + ' total)'
            )
          ),
          React.createElement('button', { 
            onClick: () => setActiveTab('bookings'), 
            style: { 
              background: 'none', border: 'none', color: PLZ_BLUE, 
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_STACK
            }
          }, 'View All', React.createElement(ChevronRight, { size: 14 }))
        ),
        React.createElement('div', { style: { padding: isDesktop ? '18px 22px' : '16px 18px' } },
          bookings.slice(0, 5).map(booking => 
            React.createElement('div', { 
              key: booking.id, 
              style: { 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid ' + PLZ_LINE, gap: '12px'
              } 
            },
              React.createElement('div', { style: { minWidth: 0, flex: 1 } },
                React.createElement('p', { 
                  style: { 
                    fontWeight: '600', color: PLZ_INK, margin: 0,
                    fontSize: isDesktop ? '14px' : '13px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  } 
                }, booking.customer_name || 'Guest'),
                React.createElement('p', { 
                  style: { 
                    fontSize: isDesktop ? '12px' : '11px', color: PLZ_BODY,
                    margin: '2px 0 0 0',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  } 
                }, booking.booking_reference || booking.id)
              ),
              React.createElement('div', { style: { textAlign: 'right', flexShrink: 0 } },
                React.createElement('p', { 
                  style: { fontWeight: '600', color: PLZ_BLUE, margin: 0, fontSize: isDesktop ? '14px' : '13px' } 
                }, formatNaira(booking.total_amount || 0)),
                React.createElement('span', { 
                  style: { 
                    fontSize: '10px', padding: '2px 10px', borderRadius: '20px',
                    background: booking.status === 'confirmed' ? PLZ_SUCCESS_TINT : PLZ_WARN_TINT,
                    color: booking.status === 'confirmed' ? PLZ_SUCCESS : PLZ_WARN,
                    display: 'inline-block', marginTop: '3px', fontWeight: '600'
                  } 
                }, booking.status || 'pending')
              )
            )
          ),
          bookings.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '32px 16px' } },
            React.createElement(Calendar, { size: 36, color: '#CBD5E1' }),
            React.createElement('p', { style: { color: PLZ_BODY, marginTop: '10px', fontSize: '13px' } }, 'No bookings yet'),
            React.createElement('button', { 
              onClick: fetchBookings,
              style: { 
                marginTop: '8px', padding: '8px 16px',
                backgroundColor: PLZ_BLUE, color: 'white',
                border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                fontFamily: FONT_STACK
              }
            }, 'Refresh')
          )
        )
      )
    );
  };

  // Helper — stat card
  function renderStatCard({ label, value, icon: Icon, iconColor, desc, isDesktop }) {
    return React.createElement('div', { 
      style: { 
        background: 'white',
        borderRadius: CARD_RADIUS,
        padding: isDesktop ? '20px' : '16px',
        border: '1px solid ' + PLZ_LINE,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.2s ease',
        fontFamily: FONT_STACK
      },
      onMouseEnter: (e) => { 
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)'; 
        e.currentTarget.style.transform = 'translateY(-2px)'; 
      },
      onMouseLeave: (e) => { 
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.04)'; 
        e.currentTarget.style.transform = 'translateY(0)'; 
      }
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' } },
        React.createElement('span', { style: { fontSize: isDesktop ? '12px' : '11px', fontWeight: '500', color: PLZ_BODY } }, label),
        React.createElement('div', { 
          style: { 
            width: '36px', height: '36px', 
            background: PLZ_BLUE_TINT, 
            borderRadius: '10px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          } 
        },
          React.createElement(Icon, { size: 18, color: iconColor })
        )
      ),
      React.createElement('h2', { 
        style: { fontSize: isDesktop ? '24px' : '20px', fontWeight: '600', color: PLZ_INK, margin: 0, letterSpacing: '-0.02em' } 
      }, value),
      React.createElement('p', { style: { fontSize: isDesktop ? '12px' : '11px', color: PLZ_GREY, marginTop: '6px' } }, desc)
    );
  }

  // ============================================================
  // RENDER SUBSCRIPTION — blue accents
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
          background: isCurrent ? 'linear-gradient(145deg, #ffffff, #FAFBFF)' : 'white',
          borderRadius: CARD_RADIUS_LG,
          padding: isDesktop ? '28px' : '22px 18px',
          position: 'relative',
          display: 'flex', flexDirection: 'column',
          border: isCurrent ? '2px solid ' + tier.color : '1px solid ' + PLZ_LINE,
          boxShadow: isCurrent 
            ? '0 16px 40px ' + tier.color + '22, 0 1px 3px rgba(15, 23, 42, 0.04)' 
            : (isHovered ? '0 8px 24px rgba(15, 23, 42, 0.08)' : '0 1px 3px rgba(15, 23, 42, 0.04)'),
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          fontFamily: FONT_STACK
        },
        onMouseEnter: () => setHoveredTier(tierId),
        onMouseLeave: () => setHoveredTier(null),
        onClick: () => !isCurrent && handleUpgradeClick(tier.id)
      },
        tier.badge && React.createElement('div', {
          style: {
            position: 'absolute', top: '-12px', right: '20px',
            background: tier.color,
            color: 'white', fontSize: '10px', fontWeight: '700',
            padding: '5px 14px', borderRadius: '16px',
            letterSpacing: '0.5px', textTransform: 'uppercase',
            boxShadow: '0 4px 12px ' + tier.color + '44',
            fontFamily: FONT_STACK
          }
        }, tier.badge),

        React.createElement('div', {
          style: {
            width: '56px', height: '56px',
            background: tier.iconBg, borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '18px',
            boxShadow: '0 6px 18px ' + tier.color + '33',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)'
          }
        }, React.createElement(TierIcon, { size: 26, color: 'white' })),

        React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' } },
          React.createElement('h3', { style: { fontSize: '20px', fontWeight: '600', color: PLZ_INK, margin: 0, letterSpacing: '-0.01em' } }, tier.name + ' Plan'),
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('span', { style: { fontSize: '26px', fontWeight: '700', color: tier.color, letterSpacing: '-0.02em' } }, isFree ? 'Free' : formatNaira(tier.price)),
            !isFree && React.createElement('span', { style: { fontSize: '13px', color: PLZ_GREY, marginLeft: '4px' } }, '/mo')
          )
        ),

        React.createElement('div', {
          style: {
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: tier.color + '10', color: tier.color,
            padding: '4px 12px', borderRadius: '16px',
            fontSize: '12px', fontWeight: '600',
            marginBottom: '18px', fontFamily: FONT_STACK
          }
        },
          React.createElement(InfinityIcon, { size: 13 }),
          isUnlimited ? 'Unlimited bookings' : (tier.bookings + ' bookings/month')
        ),

        React.createElement('ul', { style: { margin: '0 0 20px 0', padding: 0, listStyle: 'none', flex: 1 } },
          tier.features.map((feature, index) =>
            React.createElement('li', {
              key: index,
              style: {
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '6px 0', color: PLZ_BODY, fontSize: '13px',
                borderBottom: index < tier.features.length - 1 ? '1px solid ' + PLZ_LINE : 'none'
              }
            },
              React.createElement(CheckCircle, { size: 15, color: tier.color, style: { flexShrink: 0 } }),
              React.createElement('span', null, feature)
            )
          )
        ),

        React.createElement('button', {
          onClick: (e) => { e.stopPropagation(); if (!isCurrent) handleUpgradeClick(tier.id); },
          disabled: isCurrent,
          style: {
            width: '100%', padding: '13px',
            background: isCurrent ? PLZ_SURFACE : tier.color,
            color: isCurrent ? PLZ_GREY : 'white',
            border: 'none', borderRadius: '10px',
            fontSize: '14px', fontWeight: '600',
            cursor: isCurrent ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isCurrent ? 'none' : ('0 4px 12px ' + tier.color + '44'),
            opacity: isCurrent ? 0.7 : 1,
            fontFamily: FONT_STACK
          }
        }, 
          isCurrent 
            ? React.createElement(React.Fragment, null, '✓ ', React.createElement('span', { style: { fontWeight: '700' } }, 'Current Plan'))
            : React.createElement(React.Fragment, null, 'Upgrade to ', tier.name)
        )
      );
    };

    return React.createElement('div', { style: { fontFamily: FONT_STACK } },
      React.createElement('div', { 
        style: { marginBottom: '32px', position: 'relative', padding: '28px 0 16px 0' }
      },
        React.createElement('div', {
          style: {
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, ' + PLZ_BLUE + ', #4A7DFF, ' + PLZ_BLUE + ')',
            borderRadius: '3px', backgroundSize: '200% 100%',
            animation: 'gradientMove 4s ease-in-out infinite'
          }
        }),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' } },
          React.createElement('div', null,
            React.createElement('h1', {
              style: { 
                fontSize: isDesktop ? '28px' : '22px', fontWeight: '700', 
                color: PLZ_INK, margin: '0 0 8px 0', letterSpacing: '-0.02em',
                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
              }
            },
              'Subscription Plans',
              React.createElement('span', {
                style: {
                  fontSize: '11px', fontWeight: '600',
                  background: currentTierData.color + '15',
                  color: currentTierData.color,
                  padding: '4px 12px', borderRadius: '16px'
                }
              }, currentTierData.name)
            ),
            React.createElement('p', {
              style: { fontSize: isDesktop ? '15px' : '13px', color: PLZ_BODY, margin: 0 }
            }, 'Choose the perfect plan for your business growth')
          )
        )
      ),

      React.createElement('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
          gap: '20px', marginBottom: '28px'
        }
      }, tierOrder.map(renderTierCard)),

      React.createElement('div', {
        style: {
          background: PLZ_SURFACE,
          borderRadius: CARD_RADIUS,
          padding: isDesktop ? '18px 22px' : '16px 18px',
          display: 'flex', alignItems: 'flex-start', gap: '14px',
          border: '1px solid ' + PLZ_LINE
        }
      },
        React.createElement(Shield, { size: 20, color: PLZ_BLUE, style: { flexShrink: 0, marginTop: '2px' } }),
        React.createElement('div', null,
          React.createElement('p', {
            style: { fontSize: '13px', color: PLZ_INK, margin: 0, fontWeight: '600' }
          }, 'Secure & Flexible'),
          React.createElement('p', {
            style: { fontSize: '12px', color: PLZ_BODY, margin: '4px 0 0 0' }
          }, 'Upgrades take effect within 24 hours after payment verification. Cancel or downgrade anytime from Settings.')
        )
      )
    );
  };

  // ============================================================
  // RENDER UPGRADE MODAL — blue accents
  // ============================================================
  const renderUpgradeModal = () => {
    if (!showUpgradeModal) return null;

    const tier = selectedTier ? SUBSCRIPTION_TIERS[selectedTier] : null;
    if (!tier) return null;

    const isSuccess = paymentStep === 'success';
    const isProcessingState = isProcessing;

    const closeModal = () => {
      setShowUpgradeModal(false);
      setPaymentStep('select');
      setSelectedTier(null);
      setPaymentData(null);
    };

    if (isSuccess) {
      return React.createElement('div', {
        style: {
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px', fontFamily: FONT_STACK
        },
        onClick: closeModal
      },
        React.createElement('div', {
          style: {
            background: 'white', borderRadius: '20px',
            maxWidth: '480px', width: '100%',
            padding: isDesktop ? '40px 36px' : '28px 22px',
            textAlign: 'center',
            boxShadow: '0 30px 60px rgba(15, 23, 42, 0.25)',
            animation: 'scaleIn 0.3s ease'
          }
        },
          React.createElement('div', {
            style: {
              width: '72px', height: '72px',
              background: PLZ_SUCCESS_TINT,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }
          },
            React.createElement(Check, { size: 36, color: PLZ_SUCCESS })
          ),
          React.createElement('h2', {
            style: { fontSize: '22px', fontWeight: '700', color: PLZ_INK, margin: '0 0 8px 0', letterSpacing: '-0.02em' }
          }, 'Upgrade Request Submitted'),
          React.createElement('p', {
            style: { fontSize: '14px', color: PLZ_BODY, margin: '0 0 20px 0' }
          },
            'We\'ve received your request to upgrade to ',
            React.createElement('strong', null, tier.name),
            ' Plan'
          ),
          React.createElement('div', {
            style: {
              background: PLZ_SUCCESS_TINT,
              borderRadius: '12px',
              padding: '16px 18px',
              textAlign: 'left',
              marginBottom: '20px'
            }
          },
            React.createElement('p', {
              style: { fontSize: '12px', color: PLZ_SUCCESS, margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }
            }, 'Next Steps'),
            React.createElement('ol', {
              style: { fontSize: '13px', color: PLZ_SUCCESS, margin: 0, paddingLeft: '18px', lineHeight: '1.7' }
            },
              React.createElement('li', null, 'Transfer ', React.createElement('strong', null, formatNaira(paymentData?.amount)), ' to our account'),
              React.createElement('li', null, 'Use reference: ', React.createElement('strong', { style: { fontFamily: 'monospace', fontSize: '12px' } }, paymentData?.reference)),
              React.createElement('li', null, 'We\'ll verify and activate within ', React.createElement('strong', null, '24 hours'))
            )
          ),
          React.createElement('button', {
            onClick: closeModal,
            style: {
              width: '100%', padding: '12px',
              background: PLZ_BLUE, color: 'white',
              border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              fontFamily: FONT_STACK
            }
          }, 'Go to Dashboard')
        )
      );
    }

    return React.createElement('div', {
      style: {
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '20px', fontFamily: FONT_STACK
      },
      onClick: (e) => { if (e.target === e.currentTarget) closeModal(); }
    },
      React.createElement('div', {
        style: {
          background: 'white', borderRadius: '20px',
          maxWidth: '520px', width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.3)',
          animation: 'slideUp 0.3s ease'
        }
      },
        React.createElement('div', {
          style: {
            padding: isDesktop ? '24px 28px' : '20px 20px',
            borderBottom: '1px solid ' + PLZ_LINE,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }
        },
          React.createElement('div', null,
            React.createElement('h2', {
              style: { fontSize: '18px', fontWeight: '700', color: PLZ_INK, margin: 0, letterSpacing: '-0.01em' }
            }, 'Complete Payment'),
            React.createElement('p', {
              style: { fontSize: '13px', color: PLZ_BODY, margin: '4px 0 0 0' }
            }, 'Transfer the exact amount to our bank account')
          ),
          React.createElement('button', {
            onClick: closeModal,
            style: {
              background: 'none', border: 'none',
              fontSize: '22px', cursor: 'pointer', color: PLZ_GREY, padding: '0 8px'
            }
          }, '✕')
        ),

        React.createElement('div', {
          style: {
            margin: isDesktop ? '20px 28px 0' : '16px 20px 0',
            background: tier.color + '10',
            borderRadius: '12px',
            padding: '14px 18px',
            border: '1px solid ' + tier.color + '30',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '8px'
          }
        },
          React.createElement('div', null,
            React.createElement('span', { style: { fontSize: '11px', color: PLZ_BODY, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' } }, 'Upgrading to'),
            React.createElement('div', { style: { fontSize: '17px', fontWeight: '700', color: tier.color, marginTop: '2px' } }, tier.name + ' Plan')
          ),
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('span', { style: { fontSize: '11px', color: PLZ_BODY, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' } }, 'Amount'),
            React.createElement('div', { style: { fontSize: '20px', fontWeight: '700', color: tier.color, marginTop: '2px' } }, formatNaira(tier.price))
          )
        ),

        React.createElement('div', {
          style: { padding: isDesktop ? '20px 28px' : '16px 20px' }
        },
          React.createElement('div', {
            style: {
              background: PLZ_SURFACE,
              borderRadius: '12px',
              padding: isDesktop ? '18px' : '14px',
              border: '1px solid ' + PLZ_LINE
            }
          },
            React.createElement('div', {
              style: {
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '14px', paddingBottom: '14px',
                borderBottom: '2px dashed ' + PLZ_LINE
              }
            },
              React.createElement('div', {
                style: {
                  width: '44px', height: '44px',
                  background: PLZ_BLUE,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }
              },
                React.createElement(Building, { size: 22, color: 'white' })
              ),
              React.createElement('div', { style: { minWidth: 0 } },
                React.createElement('div', { style: { fontSize: '15px', fontWeight: '700', color: PLZ_INK } }, paymentData?.bankName),
                React.createElement('div', { style: { fontSize: '12px', color: PLZ_BODY } }, paymentData?.accountName)
              )
            ),

            React.createElement('div', {
              style: {
                background: 'white', borderRadius: '10px',
                padding: '12px 14px', marginBottom: '10px',
                border: '2px solid ' + PLZ_BLUE,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '8px'
              }
            },
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '10px', color: PLZ_BODY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' } }, 'Account Number'),
                React.createElement('div', { style: { fontSize: '18px', fontWeight: '700', color: PLZ_INK, fontFamily: 'monospace', letterSpacing: '2px', marginTop: '2px' } }, paymentData?.accountNumber)
              ),
              React.createElement('div', {
                style: {
                  background: PLZ_SUCCESS_TINT,
                  padding: '4px 10px', borderRadius: '16px',
                  fontSize: '10px', color: PLZ_SUCCESS, fontWeight: '600'
                }
              }, '✓ Active')
            ),

            React.createElement('div', {
              style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }
            },
              React.createElement('div', {
                style: { background: 'white', borderRadius: '8px', padding: '10px 12px' }
              },
                React.createElement('div', { style: { fontSize: '10px', color: PLZ_GREY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' } }, 'Plan'),
                React.createElement('div', { style: { fontSize: '13px', fontWeight: '600', color: PLZ_INK, textTransform: 'capitalize', marginTop: '2px' } }, paymentData?.plan)
              ),
              React.createElement('div', {
                style: { background: 'white', borderRadius: '8px', padding: '10px 12px' }
              },
                React.createElement('div', { style: { fontSize: '10px', color: PLZ_GREY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' } }, 'Amount'),
                React.createElement('div', { style: { fontSize: '13px', fontWeight: '600', color: PLZ_INK, marginTop: '2px' } }, formatNaira(paymentData?.amount))
              )
            ),

            React.createElement('div', {
              style: {
                background: 'white', borderRadius: '8px',
                padding: '10px 12px', marginTop: '8px',
                border: '1px dashed #CBD5E1',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '8px'
              }
            },
              React.createElement('div', { style: { minWidth: 0, flex: 1 } },
                React.createElement('div', { style: { fontSize: '10px', color: PLZ_GREY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' } }, 'Reference'),
                React.createElement('div', { style: { fontSize: '12px', fontWeight: '600', color: PLZ_INK, fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '2px' } }, paymentData?.reference)
              ),
              React.createElement('button', {
                onClick: handleCopyReference,
                style: {
                  background: copied ? PLZ_SUCCESS_TINT : PLZ_BLUE_TINT,
                  border: 'none', borderRadius: '8px',
                  padding: '6px 12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px',
                  color: copied ? PLZ_SUCCESS : PLZ_BLUE,
                  fontWeight: '600', flexShrink: 0, fontFamily: FONT_STACK
                }
              },
                copied 
                  ? React.createElement(React.Fragment, null, React.createElement(Check, { size: 12 }), ' Copied')
                  : React.createElement(React.Fragment, null, React.createElement(Copy, { size: 12 }), ' Copy')
              )
            )
          ),

          React.createElement('div', {
            style: {
              background: PLZ_WARN_TINT,
              borderRadius: '10px',
              padding: '12px 14px', marginTop: '14px',
              border: '1px solid #F2D98E',
              display: 'flex', alignItems: 'flex-start', gap: '10px'
            }
          },
            React.createElement(AlertTriangle, { size: 16, color: PLZ_WARN, style: { flexShrink: 0, marginTop: '1px' } }),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: '12px', fontWeight: '600', color: PLZ_WARN } }, 'Important'),
              React.createElement('div', { style: { fontSize: '11px', color: '#78350F', marginTop: '2px' } },
                'Use the reference as narration. Verification takes ',
                React.createElement('strong', null, 'up to 24 hours')
              )
            )
          ),

          React.createElement('div', {
            style: { marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }
          },
            React.createElement('button', {
              onClick: handleConfirmPayment,
              disabled: isProcessingState,
              style: {
                flex: 1, minWidth: '140px',
                padding: '12px 20px',
                background: isProcessingState ? PLZ_GREY : PLZ_BLUE,
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600',
                cursor: isProcessingState ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: isProcessingState ? 'none' : '0 4px 14px rgba(45, 96, 234, 0.25)',
                fontFamily: FONT_STACK
              }
            },
              isProcessingState 
                ? React.createElement(React.Fragment, null, 
                    React.createElement('div', { 
                      style: { 
                        width: '16px', height: '16px', 
                        border: '2px solid white', borderTop: '2px solid transparent', 
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite' 
                      } 
                    }),
                    ' Processing...'
                  )
                : React.createElement(React.Fragment, null,
                    React.createElement(Check, { size: 16 }),
                    ' I\'ve Made the Transfer'
                  )
            ),
            React.createElement('button', {
              onClick: closeModal,
              style: {
                padding: '12px 18px',
                background: 'white', color: PLZ_BODY,
                border: '1px solid ' + PLZ_LINE, borderRadius: '10px',
                fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                fontFamily: FONT_STACK
              }
            }, 'Cancel')
          )
        )
      )
    );
  };

  // ============================================================
  // RENDER CONTENT (unchanged)
  // ============================================================
  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'rooms':
        return React.createElement(RoomPage, { business: business, onBack: () => setActiveTab('overview') });
      case 'bookings':
        return React.createElement(BookingsManager, { businessId: businessId, bookings: bookings, onBookingsUpdate: fetchBookings });
      case 'profile':
        return React.createElement(BusinessProfile, { business: business, onBack: () => setActiveTab('overview'), onUpdate: handleBusinessUpdate });
      case 'settings':
        return React.createElement(BusinessSettings, { business: business, onBack: () => setActiveTab('overview'), onBusinessUpdate: fetchBusinessData });
      case 'subscription': return renderSubscription();
      default: return renderOverview();
    }
  };

  const navItemsWithSubscription = [
    ...navItems,
    { id: 'subscription', label: 'Plans', icon: Crown }
  ];

  // ============================================================
  // SIDEBAR STYLES — matching his design language
  // ============================================================
  const sidebarNavItemStyle = (isActive) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '10px',
    padding: '10px 12px',
    background: isActive ? PLZ_BLUE : 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: isActive ? 'white' : PLZ_BODY,
    fontWeight: isActive ? '600' : '500',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '2px',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    fontFamily: FONT_STACK
  });

  const sidebarIconWrapStyle = {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return React.createElement('div', { 
    style: { 
      display: 'flex', minHeight: '100vh', 
      background: '#F7F8FB', position: 'relative',
      fontFamily: FONT_STACK
    } 
  },
    // Mobile overlay
    React.createElement('div', { 
      style: mobileMenuOpen && !isDesktop ? {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        zIndex: 998, backdropFilter: 'blur(4px)'
      } : { display: 'none' },
      onClick: () => setMobileMenuOpen(false) 
    }),
    
    // Mobile menu
    React.createElement('div', { 
      style: {
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: '280px', background: 'white', zIndex: 999,
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
        overflowY: 'auto'
      }
    },
      React.createElement('div', { 
        style: { 
          padding: '20px 16px', 
          borderBottom: '1px solid ' + PLZ_LINE, 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
        } 
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 } },
          business?.logo_url ? 
            React.createElement('img', { 
              src: business.logo_url, alt: business.name, 
              style: { width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 } 
            }) :
            React.createElement('div', { 
              style: { 
                width: '36px', height: '36px', background: PLZ_BLUE, 
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
              } 
            },
              React.createElement(Building2, { size: 18, color: 'white' })
            ),
          React.createElement('div', { style: { minWidth: 0 } },
            React.createElement('h2', { 
              style: { 
                fontSize: '15px', fontWeight: '600', margin: 0, color: PLZ_INK,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              } 
            }, business?.name || 'Business'),
            React.createElement('p', { 
              style: { fontSize: '11px', color: PLZ_BODY, margin: '2px 0 0 0' } 
            }, getBusinessTypeLabel())
          )
        ),
        React.createElement('button', { 
          onClick: () => setMobileMenuOpen(false), 
          style: { background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 } 
        },
          React.createElement(X, { size: 18, color: PLZ_BODY })
        )
      ),
      React.createElement('nav', { style: { padding: '12px 10px' } },
        navItemsWithSubscription.map(item => 
          React.createElement('button', {
            key: item.id,
            onClick: () => { setActiveTab(item.id); setMobileMenuOpen(false); },
            style: sidebarNavItemStyle(activeTab === item.id)
          },
            React.createElement('div', { style: sidebarIconWrapStyle },
              React.createElement(item.icon, { size: 16 })
            ),
            React.createElement('span', null, item.label)
          )
        ),
        React.createElement('button', {
          onClick: handleLogout,
          style: {
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            gap: '10px', padding: '10px 12px',
            background: 'transparent', border: 'none',
            borderRadius: '10px', color: PLZ_ERROR,
            fontWeight: '500', fontSize: '13px',
            cursor: 'pointer', marginTop: '16px',
            textAlign: 'left', fontFamily: FONT_STACK
          }
        },
          React.createElement('div', { style: sidebarIconWrapStyle },
            React.createElement(LogOut, { size: 16 })
          ),
          React.createElement('span', null, 'Logout')
        )
      )
    ),
    
    // Desktop Sidebar
    React.createElement('div', { 
      style: {
        width: isDesktop ? '240px' : '0',
        flexShrink: 0, background: 'white',
        borderRight: '1px solid ' + PLZ_LINE,
        position: 'fixed', top: 0, left: 0, height: '100vh',
        overflowY: 'auto', zIndex: 100,
        transition: 'width 0.3s ease'
      }
    },
      React.createElement('div', { style: { padding: '20px 16px', borderBottom: '1px solid ' + PLZ_LINE } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
          business?.logo_url ? 
            React.createElement('img', { 
              key: business.logo_url + Date.now(),
              src: business.logo_url, alt: business.name, 
              style: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 } 
            }) :
            React.createElement('div', { 
              style: { 
                width: '40px', height: '40px', background: PLZ_BLUE, 
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
              } 
            },
              React.createElement(Building2, { size: 20, color: 'white' })
            ),
          React.createElement('div', { style: { minWidth: 0, flex: 1 } },
            React.createElement('h2', { 
              style: { 
                fontSize: '14px', fontWeight: '600', margin: 0, color: PLZ_INK,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              } 
            }, business?.name || 'Business'),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' } },
              getBusinessTypeIcon(),
              React.createElement('span', { style: { fontSize: '10px', color: PLZ_BODY } }, getBusinessTypeLabel())
            )
          )
        )
      ),
      React.createElement('nav', { style: { padding: '12px 10px' } },
        navItemsWithSubscription.map(item => 
          React.createElement('button', {
            key: item.id,
            onClick: () => setActiveTab(item.id),
            style: sidebarNavItemStyle(activeTab === item.id)
          },
            React.createElement('div', { style: sidebarIconWrapStyle },
              React.createElement(item.icon, { size: 16 })
            ),
            React.createElement('span', null, item.label)
          )
        ),
        React.createElement('button', {
          onClick: handleLogout,
          style: {
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            gap: '10px', padding: '10px 12px',
            background: 'transparent', border: 'none',
            borderRadius: '10px', color: PLZ_ERROR,
            fontWeight: '500', fontSize: '13px',
            cursor: 'pointer', marginTop: '16px',
            textAlign: 'left', fontFamily: FONT_STACK
          }
        },
          React.createElement('div', { style: sidebarIconWrapStyle },
            React.createElement(LogOut, { size: 16 })
          ),
          React.createElement('span', null, 'Logout')
        )
      )
    ),
    
    // Main content
    React.createElement('div', { 
      style: {
        flex: 1, minWidth: 0,
        background: '#F7F8FB',
        minHeight: '100vh',
        marginLeft: isDesktop ? '240px' : '0',
        transition: 'margin-left 0.3s ease'
      }
    },
      // Mobile header
      !isDesktop && React.createElement('div', { 
        style: { 
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderBottom: '1px solid ' + PLZ_LINE,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50
        } 
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 } },
          business?.logo_url ? 
            React.createElement('img', { 
              src: business.logo_url, alt: business.name, 
              style: { width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 } 
            }) :
            React.createElement('div', { 
              style: { 
                width: '32px', height: '32px', background: PLZ_BLUE, 
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
              } 
            },
              React.createElement(Building2, { size: 16, color: 'white' })
            ),
          React.createElement('div', { style: { minWidth: 0 } },
            React.createElement('h1', { 
              style: { 
                fontSize: '14px', fontWeight: '600', margin: 0, color: PLZ_INK,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              } 
            }, business?.name || 'Dashboard'),
            React.createElement('p', { style: { fontSize: '10px', color: PLZ_BODY, margin: '1px 0 0 0' } }, getBusinessTypeLabel())
          )
        ),
        React.createElement('button', { 
          onClick: () => setMobileMenuOpen(true), 
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 } 
        },
          React.createElement(Menu, { size: 20, color: PLZ_INK })
        )
      ),
      
      // Content area
      React.createElement('div', { 
        style: { 
          padding: isDesktop ? '24px' : '16px',
          maxWidth: '1400px',
          margin: '0 auto'
        } 
      }, 
        renderContent(),
        renderUpgradeModal()
      )
    )
  );
}

export default BusinessDashboard;