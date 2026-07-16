// client/src/UnifiedBookingPage.jsx
// =============================================
// UNIFIED BOOKING PAGE - PREMIUM DESIGN INTEGRATION
// Integrated: HotelBooking design system
// Integrated: Location map with Google Maps
// Integrated: Reviews breakdown section
// Integrated: Premium glass-morphism effects
// Integrated: Mobile-first responsive design
// FIXED: isMobile ReferenceError (production fix)
// FIXED: Mobile header alignment (back button stays left)
// FIXED: Header container width on mobile (compact back button)
// FIXED: Booking modal - paymentMethod state properly declared
// FIXED: Booking modal - User icon replaced with Users
// FIXED: Booking modal - Wallet icon replaced with CreditCard
// FIXED: Booking modal - Loader2 replaced with Loader (already imported)
// =============================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Phone, Mail, Clock, DollarSign, 
  Trophy, Users, Star, Building2, Wind, Car, X, 
  ChevronLeft, ChevronRight, Wifi, Coffee, Tv, Bath, Calendar, Home,
  CheckCircle, Download, Printer, CreditCard, Bed, Utensils, Sparkles,
  Lock, CreditCard as CardIcon, Receipt, Check, Building, Loader,
  HeartHandshake, Dumbbell, Map, Navigation, Award, Shield, Crown,
  Headphones, Snowflake, Utensils as UtensilsIcon, ExternalLink, Info,
  Camera
} from 'lucide-react';
import RoomPage from './RoomPage';
import SportsBooking from './SportsBooking';
import EventBooking from './EventBooking';
import API_BASE from './config';

// ============================================================
// FIX: isMobile detection hook with SSR support and debouncing
// ============================================================
function useIsMobile(breakpoint) {
  if (breakpoint === undefined) breakpoint = 768;
  
  var getInitialState = function() {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  };
  
  var _useState = React.useState(getInitialState);
  var isMobile = _useState[0];
  var setIsMobile = _useState[1];

  React.useEffect(function() {
    if (typeof window === 'undefined') return;
    
    var handleResize = function() {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    var timeoutId = null;
    var debouncedResize = function() {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    handleResize();
    
    return function() {
      window.removeEventListener('resize', debouncedResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [breakpoint]);

  return isMobile;
}

// ============================================================
// PREMIUM STYLES - Integrated from HotelBooking
// ============================================================
function createStyles(isMobile) {
  return {
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: '0',
      background: '#f5f7fa',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    
    // ===== HEADER =====
    header: {
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226,232,240,0.3)',
      padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    },
    headerContent: { display: 'flex', alignItems: 'center', gap: isMobile ? '0.25rem' : '0.75rem', justifyContent: 'flex-start', flexWrap: 'nowrap', width: isMobile ? 'auto' : '100%', maxWidth: '100%', overflow: 'hidden', flex: isMobile ? '0 1 auto' : '1 1 auto' },
    backButton: {
      whiteSpace: 'nowrap',
      background: 'rgba(79,70,229,0.08)',
      border: '1px solid rgba(79,70,229,0.12)',
      color: '#4f46e5',
      padding: isMobile ? '0.2rem 0.4rem' : '0.4rem 0.8rem',
      borderRadius: '40px',
      fontSize: isMobile ? '0.65rem' : '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.1rem' : '0.25rem',
      transition: 'all 0.3s ease',
      flexShrink: 0,
      lineHeight: 1
    },
    logo: { width: isMobile ? '24px' : '36px', height: isMobile ? '24px' : '36px', borderRadius: '6px', objectFit: 'cover', background: 'white', padding: '0.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flexShrink: 0 },
    businessNameContainer: { minWidth: 0, flex: isMobile ? '0 1 auto' : '0 1 auto', overflow: 'hidden', maxWidth: isMobile ? '120px' : '200px', flexShrink: 1 },
    businessName: {
      margin: 0,
      fontSize: isMobile ? '0.8rem' : '1rem',
      fontWeight: '700',
      color: '#0f172a',
      letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: 1.2
    },
    businessBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.1rem',
      padding: isMobile ? '0.05rem 0.3rem' : '0.1rem 0.4rem',
      borderRadius: '9999px',
      fontSize: isMobile ? '0.4rem' : '0.5rem',
      fontWeight: '600'
    },
    businessLocation: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.1rem',
      color: '#64748b',
      fontSize: isMobile ? '0.45rem' : '0.55rem'
    },
    
    // ===== HERO =====
    heroSection: {
      position: 'relative',
      width: '100%',
      height: isMobile ? '350px' : '450px',
      background: '#1a1a2e',
      overflow: 'hidden'
    },
    heroImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
    },
    heroContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: isMobile ? '20px 16px 24px' : '32px 40px 40px',
      color: 'white'
    },
    heroTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '8px'
    },
    heroName: {
      fontSize: isMobile ? '26px' : '36px',
      fontWeight: '800',
      margin: '0 0 2px',
      letterSpacing: '-0.5px',
      textShadow: '0 2px 20px rgba(0,0,0,0.3)',
      color: 'white'
    },
    heroLocation: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: isMobile ? '13px' : '15px',
      opacity: 0.9,
      textShadow: '0 1px 10px rgba(0,0,0,0.2)',
      color: 'white'
    },
    heroBadges: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    heroBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 12px',
      borderRadius: '40px',
      fontSize: '11px',
      fontWeight: '600',
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'white'
    },
    heroDescription: {
      fontSize: isMobile ? '13px' : '15px',
      opacity: 0.9,
      maxWidth: '80%',
      lineHeight: '1.5',
      marginBottom: '12px',
      textShadow: '0 1px 10px rgba(0,0,0,0.2)',
      color: 'white'
    },
    
    // ===== DATE PICKER WIDGET =====
    bookingWidget: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '12px 14px' : '16px 20px',
      marginTop: '12px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      alignItems: 'center',
      boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      maxWidth: '100%'
    },
    widgetField: {
      flex: 1,
      minWidth: '80px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    widgetLabel: {
      fontSize: '9px',
      fontWeight: '600',
      textTransform: 'uppercase',
      color: '#94a3b8',
      letterSpacing: '0.5px',
      display: 'block'
    },
    widgetDateInput: {
      width: '100%',
      padding: '6px 0',
      border: 'none',
      background: 'transparent',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '600',
      color: '#0f172a',
      cursor: 'pointer',
      outline: 'none',
      fontFamily: 'inherit',
      borderBottom: '2px solid #4F46E5',
      transition: 'border-color 0.2s ease'
    },
    widgetValue: {
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '600',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    widgetDivider: {
      width: '1px',
      height: '28px',
      background: '#e2e8f0'
    },
    widgetButton: {
      padding: isMobile ? '10px 16px' : '12px 28px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(79,70,229,0.25)',
      flexShrink: 0,
      width: isMobile ? '100%' : 'auto'
    },
    
    // ===== HIGHLIGHTS =====
    highlightsSection: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '16px 18px' : '20px 24px',
      margin: '20px 16px 16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    },
    highlightsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: '12px'
    },
    highlightItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      background: '#f8fafc',
      borderRadius: '12px',
      transition: 'all 0.2s ease'
    },
    highlightIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    highlightText: {
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: '500',
      color: '#0f172a',
      lineHeight: '1.3'
    },
    
    // ===== CONTENT AREA =====
    contentArea: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0 0 80px' : '0 20px 80px'
    },
    sectionCard: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '18px 16px' : '24px 28px',
      marginBottom: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '8px'
    },
    sectionTitle: {
      fontSize: isMobile ? '17px' : '19px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    sectionText: {
      fontSize: isMobile ? '13px' : '14px',
      color: '#475569',
      lineHeight: '1.8',
      margin: '0 0 12px'
    },
    amenitiesTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      paddingTop: '12px',
      borderTop: '1px solid #f1f5f9'
    },
    amenityTag: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      background: '#f8fafc',
      borderRadius: '40px',
      fontSize: '12px',
      fontWeight: '500',
      color: '#475569',
      border: '1px solid #f1f5f9'
    },
    
    // ===== GALLERY =====
    galleryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: '6px',
      marginTop: '10px'
    },
    galleryImage: {
      width: '100%',
      aspectRatio: '1/1',
      objectFit: 'cover',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'transform 0.3s ease'
    },
    
    // ===== LOCATION =====
    locationMap: {
      width: '100%',
      height: isMobile ? '200px' : '250px',
      borderRadius: '12px',
      background: '#e2e8f0',
      marginTop: '10px',
      overflow: 'hidden',
      position: 'relative'
    },
    locationMapIframe: {
      width: '100%',
      height: '100%',
      border: 'none'
    },
    locationPlaces: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '10px'
    },
    locationPlace: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      background: '#f8fafc',
      borderRadius: '40px',
      fontSize: '12px',
      color: '#475569',
      border: '1px solid #f1f5f9'
    },
    
    // ===== REVIEWS =====
    reviewsHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    reviewsScore: {
      fontSize: isMobile ? '28px' : '32px',
      fontWeight: '800',
      color: '#0f172a',
      lineHeight: '1'
    },
    reviewsScoreLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#0f172a'
    },
    reviewsScoreSub: {
      fontSize: '12px',
      color: '#94a3b8'
    },
    reviewsBreakdown: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: '8px',
      marginTop: '12px'
    },
    reviewCategory: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid #f1f5f9'
    },
    reviewCategoryName: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '500'
    },
    reviewCategoryScore: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#0f172a'
    },
    reviewBar: {
      width: '100%',
      height: '4px',
      background: '#f1f5f9',
      borderRadius: '4px',
      marginTop: '2px',
      overflow: 'hidden'
    },
    reviewBarFill: {
      height: '100%',
      borderRadius: '4px',
      background: '#4F46E5'
    },
    
    // ===== ROOMS =====
    roomsSection: {
      marginTop: '16px'
    },
    roomsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '0 16px'
    },
    roomsTitle: {
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: '700',
      color: '#0f172a',
      letterSpacing: '-0.3px',
      margin: 0
    },
    roomsCount: {
      fontSize: '13px',
      color: '#94a3b8',
      fontWeight: '500'
    },
    roomsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '16px',
      padding: '0 16px'
    },
    
    // ===== ROOM CARD =====
    roomCard: {
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '2px solid transparent',
      position: 'relative'
    },
    roomCardSelected: {
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 40px rgba(79,70,229,0.12)',
      border: '2px solid #4F46E5',
      position: 'relative'
    },
    roomCardContent: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: isMobile ? 'auto' : '100%'
    },
    roomImageWrapper: {
      position: 'relative',
      width: isMobile ? '100%' : '160px',
      minHeight: isMobile ? '160px' : '100%',
      overflow: 'hidden',
      background: '#f1f5f9',
      flexShrink: 0
    },
    roomImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.6s ease',
      minHeight: isMobile ? '160px' : '100%'
    },
    roomBadge: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      padding: '2px 10px',
      borderRadius: '40px',
      fontSize: '9px',
      fontWeight: '700',
      color: 'white',
      letterSpacing: '0.3px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    },
    roomSelectedBadge: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      padding: '2px 10px',
      borderRadius: '40px',
      fontSize: '9px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      boxShadow: '0 2px 12px rgba(79,70,229,0.3)'
    },
    roomInfo: {
      flex: 1,
      padding: isMobile ? '12px 14px' : '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    roomHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '4px',
      gap: '8px'
    },
    roomName: {
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    roomTypeTag: {
      fontSize: '9px',
      color: '#64748b',
      backgroundColor: '#f1f5f9',
      padding: '2px 8px',
      borderRadius: '40px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    },
    roomMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      fontSize: '11px',
      color: '#64748b',
      marginBottom: '4px'
    },
    roomMetaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    roomRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '4px'
    },
    roomRatingStars: {
      display: 'flex',
      alignItems: 'center',
      gap: '1px'
    },
    roomRatingText: {
      fontSize: '11px',
      fontWeight: '600',
      color: '#0f172a'
    },
    roomReviewCount: {
      fontSize: '11px',
      color: '#94a3b8'
    },
    roomPriceSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto',
      paddingTop: '10px',
      borderTop: '1px solid #f1f5f9',
      gap: '12px',
      flexWrap: 'wrap'
    },
    roomPriceLeft: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1
    },
    roomPriceWas: {
      fontSize: '12px',
      color: '#94a3b8',
      textDecoration: 'line-through'
    },
    roomPriceNow: {
      fontSize: '18px',
      fontWeight: '800',
      color: '#4F46E5',
      letterSpacing: '-0.5px',
      whiteSpace: 'nowrap'
    },
    roomPricePer: {
      fontSize: '10px',
      fontWeight: '400',
      color: '#94a3b8'
    },
    roomReserveButton: {
      padding: '6px 14px',
      background: '#4F46E5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(79,70,229,0.2)',
      whiteSpace: 'nowrap',
      flexShrink: 0
    },
    roomReserveButtonSelected: {
      padding: '6px 14px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 12px rgba(79,70,229,0.3)',
      whiteSpace: 'nowrap',
      flexShrink: 0
    },
    
    // ===== LIGHTBOX =====
    lightboxOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    },
    lightboxImage: {
      maxWidth: '90%',
      maxHeight: '90%',
      objectFit: 'contain'
    },
    lightboxNav: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.15)',
      border: 'none',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '24px',
      transition: 'background 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    lightboxClose: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '32px',
      cursor: 'pointer',
      padding: '8px',
      transition: 'transform 0.3s ease'
    },
    
    // ===== MODAL =====
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '0'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '28px 28px 0 0',
      maxWidth: '560px',
      width: '100%',
      maxHeight: '92vh',
      overflowY: 'auto',
      boxShadow: '0 -20px 80px rgba(0,0,0,0.15)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    },
    modalHandle: {
      width: '36px',
      height: '4px',
      borderRadius: '4px',
      background: '#e2e8f0',
      margin: '12px auto 8px'
    },
    modalHeader: {
      padding: '16px 24px 16px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'white'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    modalClose: {
      background: '#f1f5f9',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      padding: '8px',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px'
    },
    modalBody: {
      padding: '24px'
    },
    modalSummary: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f4f9 100%)',
      borderRadius: '16px',
      padding: '16px 20px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0'
    },
    modalSummaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      fontSize: '13px'
    },
    modalSummaryLabel: {
      color: '#94a3b8',
      fontWeight: '500'
    },
    modalSummaryValue: {
      fontWeight: '600',
      color: '#0f172a'
    },
    formGroup: {
      marginBottom: '16px'
    },
    formLabel: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '4px',
      letterSpacing: '0.2px'
    },
    formInput: {
      width: '100%',
      padding: '12px 14px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      background: 'white'
    },
    paymentOptions: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '8px'
    },
    paymentOption: {
      padding: '14px 12px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      background: 'white'
    },
    paymentOptionSelected: {
      padding: '14px 12px',
      border: '2px solid #4F46E5',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      background: '#EEF2FF'
    },
    paymentOptionPrimary: {
      padding: '16px 12px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      background: 'white',
      position: 'relative'
    },
    paymentOptionPrimarySelected: {
      padding: '16px 12px',
      border: '2px solid #4F46E5',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      background: '#EEF2FF',
      boxShadow: '0 0 0 3px rgba(79,70,229,0.08)',
      position: 'relative'
    },
    paymentOptionIcon: {
      display: 'block',
      margin: '0 auto 6px'
    },
    paymentOptionLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#0f172a',
      display: 'block'
    },
    paymentOptionDesc: {
      fontSize: '10px',
      color: '#94a3b8',
      display: 'block',
      marginTop: '2px'
    },
    submitButton: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
      boxShadow: '0 4px 20px rgba(79,70,229,0.2)',
      letterSpacing: '0.2px'
    },
    submitButtonDisabled: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#94a3b8',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'not-allowed',
      marginTop: '8px'
    },
    recommendedBadge: {
      marginTop: '6px',
      padding: '2px 12px',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
      borderRadius: '20px',
      display: 'inline-block',
      fontSize: '9px',
      fontWeight: '700',
      color: '#4F46E5',
      letterSpacing: '0.3px'
    },
    
    // ===== SPORTS/EVENT CTA =====
    ctaCard: {
      textAlign: 'center',
      marginTop: isMobile ? '1rem' : '1.5rem',
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '1.5rem' : '2rem',
      background: 'white',
      border: '1px solid rgba(226,232,240,0.4)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
    },
    ctaButton: {
      padding: isMobile ? '0.6rem 1.5rem' : '0.75rem 2rem',
      fontSize: isMobile ? '0.8rem' : '0.85rem',
      fontWeight: '600',
      borderRadius: '40px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
      width: isMobile ? '100%' : 'auto'
    }
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
var sportsImages = [
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1533563906091-fdfdffc3e3c2?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&h=400&fit=crop'
];

var eventImages = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=400&fit=crop'
];

var defaultHotelHero = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=600&fit=crop';

function getRoomImage(roomName) {
  var name = roomName.toLowerCase();
  if (name.includes('suite')) return 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop';
  if (name.includes('king') || name.includes('executive')) return 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop';
  if (name.includes('family')) return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=400&fit=crop';
  if (name.includes('deluxe')) return 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop';
  if (name.includes('penthouse')) return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop';
  return 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop';
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price || 0);
}

function getBadgeColor(type) {
  var colors = {
    'Suite': '#8B5CF6',
    'Deluxe': '#F59E0B',
    'Executive': '#10B981',
    'Presidential': '#EC4899',
    'Family': '#3B82F6',
    'Standard': '#6B7280',
    'Premium': '#EC4899'
  };
  return colors[type] || '#6B7280';
}

function renderStars(rating) {
  var fullStars = Math.floor(rating);
  var halfStar = rating % 1 >= 0.5;
  var emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  var stars = [];
  for (var i = 0; i < fullStars; i++) {
    stars.push(React.createElement(Star, { key: 'full-' + i, size: 12, fill: '#F59E0B', color: '#F59E0B' }));
  }
  if (halfStar) {
    stars.push(React.createElement(Star, { key: 'half', size: 12, fill: '#F59E0B', color: '#F59E0B', style: { opacity: 0.5 } }));
  }
  for (var j = 0; j < emptyStars; j++) {
    stars.push(React.createElement(Star, { key: 'empty-' + j, size: 12, color: '#E2E8F0' }));
  }
  return React.createElement('span', { style: { display: 'flex', gap: '1px' } }, ...stars);
}

// ============================================================
// MAIN COMPONENT - UnifiedBookingPage
// ============================================================
function UnifiedBookingPage() {
  var _useParams = useParams();
  var businessSlug = _useParams.businessSlug;
  var navigate = useNavigate();
  
  var isMobile = useIsMobile();
  var styles = createStyles(isMobile);
  
  var _useState = React.useState(null);
  var business = _useState[0];
  var setBusiness = _useState[1];
  var _useState2 = React.useState([]);
  var rooms = _useState2[0];
  var setRooms = _useState2[1];
  var _useState3 = React.useState([]);
  var galleryImages = _useState3[0];
  var setGalleryImages = _useState3[1];
  var _useState4 = React.useState(true);
  var loading = _useState4[0];
  var setLoading = _useState4[1];
  var _useState5 = React.useState('');
  var error = _useState5[0];
  var setError = _useState5[1];
  var _useState6 = React.useState(false);
  var bookingStarted = _useState6[0];
  var setBookingStarted = _useState6[1];
  var _useState7 = React.useState(Math.floor(Math.random() * 3));
  var imageIndex = _useState7[0];
  var _useState8 = React.useState(false);
  var lightboxOpen = _useState8[0];
  var setLightboxOpen = _useState8[1];
  var _useState9 = React.useState(0);
  var lightboxIndex = _useState9[0];
  var setLightboxIndex = _useState9[1];
  var _useState10 = React.useState({ checkIn: '', checkOut: '' });
  var dateRange = _useState10[0];
  var setDateRange = _useState10[1];
  var _useState11 = React.useState(1);
  var guests = _useState11[0];
  var setGuests = _useState11[1];
  var _useState12 = React.useState(false);
  var showGuestPicker = _useState12[0];
  var setShowGuestPicker = _useState12[1];
  var _useState13 = React.useState(null);
  var selectedRoom = _useState13[0];
  var setSelectedRoom = _useState13[1];
  var _useState14 = React.useState(false);
  var showBookingForm = _useState14[0];
  var setShowBookingForm = _useState14[1];
  var _useState15 = React.useState(false);
  var expandedStory = _useState15[0];
  var setExpandedStory = _useState15[1];

  // ============================================================
  // FETCH BUSINESS DATA
  // ============================================================
  function fetchBusinessData() {
    setLoading(true);
    
    var url = API_BASE + '/api/businesses/slug/' + businessSlug;
    
    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }
        return response.json();
      })
      .then(function (data) {
        if (data.success && data.business) {
          setBusiness(data.business);
          return fetch(API_BASE + '/api/businesses/' + data.business.id + '/rooms')
            .then(function (r) { return r.json(); })
            .then(function (roomsData) {
              if (roomsData.success) {
                setRooms(roomsData.rooms || []);
              }
              return fetch(API_BASE + '/api/businesses/' + data.business.id + '/gallery')
                .then(function (r) { return r.json(); })
                .then(function (galleryData) {
                  if (galleryData && galleryData.images) {
                    setGalleryImages(galleryData.images);
                  }
                  setLoading(false);
                });
            });
        } else {
          setError(data.error || 'Business not found');
          setLoading(false);
        }
      })
      .catch(function (err) {
        console.error('[UnifiedBookingPage] Fetch error:', err);
        if (err.message.includes('Failed to fetch')) {
          setError('Cannot connect to server. Please check your network connection.');
        } else if (err.message.includes('404')) {
          setError('Business not found. The page you\'re looking for doesn\'t exist.');
        } else {
          setError('Could not load business: ' + err.message);
        }
        setLoading(false);
      });
  }

  React.useEffect(function () { 
    fetchBusinessData(); 
  }, [businessSlug]);

  React.useEffect(function () {
    if (!lightboxOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { goToPrev(); return; }
      if (e.key === 'ArrowRight') { goToNext(); return; }
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return function () {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, lightboxIndex, galleryImages.length]);

  function openLightbox(index) { setLightboxIndex(index); setLightboxOpen(true); }
  function closeLightbox() { setLightboxOpen(false); }
  function goToPrev() { setLightboxIndex(function (prev) { return prev === 0 ? galleryImages.length - 1 : prev - 1; }); }
  function goToNext() { setLightboxIndex(function (prev) { return prev === galleryImages.length - 1 ? 0 : prev + 1; }); }

  function handleBookNow(room) {
    if (!dateRange.checkIn || !dateRange.checkOut) {
      alert('Please select check-in and check-out dates first');
      return;
    }
    setSelectedRoom(room);
    setShowBookingForm(true);
  }

  function getHeroImage() {
    if (business && business.cover_image) return business.cover_image;
    if (business && business.business_type === 'hotel') return defaultHotelHero;
    if (business && business.business_type === 'sports') return sportsImages[imageIndex];
    if (business && business.business_type === 'event') return eventImages[imageIndex];
    return defaultHotelHero;
  }

  if (loading) {
    return React.createElement('div', { className: 'app-container', style: { textAlign: 'center', padding: '3rem' } },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('p', { style: { marginTop: '1rem', color: '#64748b' } }, 'Loading...')
    );
  }

  if (error || !business) {
    return React.createElement('div', { className: 'app-container' },
      React.createElement('div', { className: 'empty-state' },
        React.createElement(MapPin, { size: 48, strokeWidth: 1.5, color: '#94a3b8', style: { marginBottom: '1rem' } }),
        React.createElement('h3', null, 'Business not found'),
        React.createElement('p', null, error || "The page you're looking for doesn't exist."),
        React.createElement('button', { 
          className: 'btn btn-primary', 
          onClick: function () { navigate('/'); },
          style: {
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '40px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 4px 16px rgba(79,70,229,0.25)'
          }
        }, 'Go Home')
      )
    );
  }

  if (bookingStarted) {
    if (business.business_type === 'hotel') {
      return React.createElement(RoomPage, { 
        businessId: business.id, 
        businessName: business.name, 
        businessType: business.business_type, 
        onBack: function () { navigate('/'); } 
      });
    }
    if (business.business_type === 'sports') {
      return React.createElement(SportsBooking, { 
        business: business, 
        onBack: function () { setBookingStarted(false); } 
      });
    }
    if (business.business_type === 'event') {
      return React.createElement(EventBooking, { 
        business: business, 
        onBack: function () { setBookingStarted(false); } 
      });
    }
  }

  var availableRooms = rooms.filter(function (r) { return r.status === 'available'; });
  var badgeType = business.business_type === 'hotel' ? 'Hotel' : business.business_type === 'sports' ? 'Sports Facility' : 'Event Venue';
  var badgeColor = business.business_type === 'hotel' ? '#4F46E5' : business.business_type === 'sports' ? '#059669' : '#d97706';

  // ===== HIGHLIGHTS DATA =====
  var highlights = [
    { icon: HeartHandshake, color: '#EC4899', bgColor: '#FCE4EC', label: 'Loved by couples' },
    { icon: UtensilsIcon, color: '#F59E0B', bgColor: '#FEF3C7', label: 'Top rated breakfast' },
    { icon: Dumbbell, color: '#10B981', bgColor: '#D1FAE5', label: 'Fitness center' },
    { icon: Map, color: '#3B82F6', bgColor: '#DBEAFE', label: 'Central location' }
  ];

  var nearbyPlaces = [
    { name: 'City Center', distance: '5 min walk' },
    { name: 'Shopping Mall', distance: '10 min walk' },
    { name: 'Business District', distance: '15 min drive' },
    { name: 'Airport', distance: '30 min drive' }
  ];

  var reviewCategories = [
    { name: 'Cleanliness', score: 9.4 },
    { name: 'Amenities', score: 8.8 },
    { name: 'Service', score: 9.2 },
    { name: 'Location', score: 9.6 },
    { name: 'Value', score: 8.5 },
    { name: 'Comfort', score: 9.0 }
  ];

  var amenityIcons = {
    'Free Wi-Fi': { icon: Wifi, color: '#3B82F6' },
    'Air Conditioning': { icon: Snowflake, color: '#06B6D4' },
    '24/7 Support': { icon: Headphones, color: '#8B5CF6' },
    'Secure Booking': { icon: Shield, color: '#10B981' },
    'Restaurant': { icon: UtensilsIcon, color: '#F59E0B' },
    'Room Service': { icon: Coffee, color: '#EC4899' },
    'Parking': { icon: Car, color: '#6B7280' },
    'Laundry': { icon: Sparkles, color: '#3B82F6' }
  };

  var defaultAmenities = ['Free Wi-Fi', 'Air Conditioning', '24/7 Support', 'Secure Booking', 'Restaurant', 'Room Service', 'Parking', 'Laundry'];

  // ============================================================
  // RENDER
  // ============================================================
  return React.createElement('div', { style: styles.container },

    // ===== HEADER =====
    React.createElement('div', { style: styles.header },
      React.createElement('div', { style: { ...styles.headerContent, width: 'auto' } },
        React.createElement('button', { 
          className: 'btn btn-secondary', 
          onClick: function () { navigate('/'); }, 
          style: styles.backButton,
          onMouseEnter: function(e) { 
            e.currentTarget.style.background = 'rgba(79,70,229,0.15)';
          },
          onMouseLeave: function(e) { 
            e.currentTarget.style.background = 'rgba(79,70,229,0.08)';
          }
        },
          React.createElement(ArrowLeft, { size: isMobile ? 12 : 14 }), 
          React.createElement('span', { style: { display: isMobile ? 'none' : 'inline' } }, 'Back')
        ),
        business.logo_url && React.createElement('img', { 
          src: business.logo_url, 
          alt: business.name, 
          style: styles.logo
        }),
        React.createElement('div', { style: styles.businessNameContainer },
          React.createElement('h1', { style: styles.businessName }, business.name),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'wrap' } },
            React.createElement('span', { 
              style: { ...styles.businessBadge, background: badgeColor + '15', color: badgeColor } 
            }, badgeType),
            React.createElement('span', { style: styles.businessLocation },
              React.createElement(MapPin, { size: isMobile ? 8 : 10 }), 
              business.city
            )
          )
        )
      )
    ),

    // ===== HERO =====
    React.createElement('div', { style: styles.heroSection },
      React.createElement('img', {
        src: getHeroImage(),
        alt: business?.name || 'Hotel',
        style: styles.heroImage,
        onError: function(e) { e.currentTarget.src = defaultHotelHero; }
      }),
      React.createElement('div', { style: styles.heroOverlay }),
      React.createElement('div', { style: styles.heroContent },
        React.createElement('div', { style: styles.heroTop },
          React.createElement('div', null,
            React.createElement('h1', { style: styles.heroName }, business?.name || 'Hotel'),
            React.createElement('div', { style: styles.heroLocation },
              React.createElement(MapPin, { size: 14 }),
              business?.city || 'Lagos', ', ', business?.state || 'Lagos'
            )
          ),
          React.createElement('div', { style: styles.heroBadges },
            React.createElement('div', { style: styles.heroBadge },
              React.createElement(Star, { size: 12, fill: '#F59E0B', color: '#F59E0B' }),
              '4.9'
            ),
            React.createElement('div', { style: { ...styles.heroBadge, background: 'rgba(79,70,229,0.3)', border: '1px solid rgba(79,70,229,0.3)' } },
              React.createElement(Crown, { size: 12 }),
              'Premium Host'
            ),
            React.createElement('div', { style: { ...styles.heroBadge, background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.3)' } },
              React.createElement(Shield, { size: 12 }),
              'Verified'
            )
          )
        ),
        business?.description && React.createElement('p', { style: styles.heroDescription }, business.description),
        
        // Date Picker Widget
        business.business_type === 'hotel' && React.createElement('div', { style: styles.bookingWidget },
          React.createElement('div', { style: styles.widgetField },
            React.createElement('span', { style: styles.widgetLabel }, 'Check-in'),
            React.createElement('input', {
              type: 'date',
              value: dateRange.checkIn || '',
              onChange: function(e) {
                var newDate = e.target.value;
                setDateRange({ ...dateRange, checkIn: newDate });
                if (newDate && !dateRange.checkOut) {
                  var nextDay = new Date(newDate);
                  nextDay.setDate(nextDay.getDate() + 1);
                  setDateRange({ checkIn: newDate, checkOut: nextDay.toISOString().split('T')[0] });
                }
              },
              style: { ...styles.widgetDateInput, borderBottom: '2px solid #4F46E5' },
              min: new Date().toISOString().split('T')[0]
            })
          ),
          React.createElement('div', { style: styles.widgetDivider }),
          React.createElement('div', { style: styles.widgetField },
            React.createElement('span', { style: styles.widgetLabel }, 'Check-out'),
            React.createElement('input', {
              type: 'date',
              value: dateRange.checkOut || '',
              onChange: function(e) { setDateRange({ ...dateRange, checkOut: e.target.value }); },
              style: { ...styles.widgetDateInput, borderBottom: '2px solid #4F46E5' },
              min: dateRange.checkIn || new Date().toISOString().split('T')[0]
            })
          ),
          React.createElement('div', { style: styles.widgetDivider }),
          React.createElement('div', { style: styles.widgetField },
            React.createElement('span', { style: styles.widgetLabel }, 'Guests'),
            React.createElement('button', {
              onClick: function() { setShowGuestPicker(!showGuestPicker); },
              style: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: isMobile ? '13px' : '14px', fontWeight: '600', padding: '6px 0', display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a', width: '100%' }
            },
              React.createElement(Users, { size: 14, color: '#4F46E5' }),
              guests + ' guest' + (guests > 1 ? 's' : '')
            ),
            showGuestPicker && React.createElement('div', { 
              style: { 
                position: 'absolute', 
                top: '100%', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                marginTop: '0.5rem', 
                background: 'white', 
                borderRadius: '14px', 
                padding: '0.75rem', 
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)', 
                minWidth: '140px', 
                zIndex: 10,
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              } 
            },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                React.createElement('button', { 
                  onClick: function() { setGuests(Math.max(1, guests - 1)); }, 
                  style: { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#0f172a' } 
                }, '-'),
                React.createElement('span', { style: { fontWeight: '600', fontSize: '14px', color: '#0f172a' } }, guests),
                React.createElement('button', { 
                  onClick: function() { setGuests(Math.min(20, guests + 1)); }, 
                  style: { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#0f172a' } 
                }, '+')
              ),
              React.createElement('button', { 
                onClick: function() { setShowGuestPicker(false); }, 
                style: { width: '100%', padding: '0.4rem', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.7rem' } 
              }, 'Apply')
            )
          ),
          React.createElement('button', {
            style: styles.widgetButton,
            onMouseEnter: function(e) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,70,229,0.35)';
            },
            onMouseLeave: function(e) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.25)';
            },
            onClick: function() {
              if (!dateRange.checkIn || !dateRange.checkOut) {
                alert('Please select check-in and check-out dates');
                return;
              }
              document.querySelector('.rooms-section')?.scrollIntoView({ behavior: 'smooth' });
            }
          }, 'Find Rooms')
        )
      )
    ),

    // ===== HIGHLIGHTS =====
    React.createElement('div', { style: styles.highlightsSection },
      React.createElement('div', { style: styles.highlightsGrid },
        highlights.map(function(highlight, idx) {
          var IconComponent = highlight.icon;
          return React.createElement('div', { key: idx, style: styles.highlightItem },
            React.createElement('div', { style: { ...styles.highlightIcon, background: highlight.bgColor } },
              React.createElement(IconComponent, { size: 16, color: highlight.color })
            ),
            React.createElement('span', { style: styles.highlightText }, highlight.label)
          );
        })
      )
    ),

    // ===== CONTENT AREA =====
    React.createElement('div', { style: styles.contentArea },

      // ===== STORY SECTION =====
      (business.about_text || business.description) && React.createElement('div', { style: styles.sectionCard },
        React.createElement('div', { style: styles.sectionHeader },
          React.createElement('h2', { style: styles.sectionTitle }, business.about_text ? 'Our Story' : 'About ' + business.name),
          React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' } }, 
            business?.city || 'Lagos', ', Nigeria'
          )
        ),
        React.createElement('p', { style: styles.sectionText },
          expandedStory 
            ? (business.about_text || business.description) 
            : (business.about_text || business.description || '').substring(0, isMobile ? 120 : 200) + ((business.about_text || business.description || '').length > (isMobile ? 120 : 200) ? '...' : '')
        ),
        (business.about_text || business.description || '').length > (isMobile ? 120 : 200) && React.createElement('button', {
          onClick: function() { setExpandedStory(!expandedStory); },
          style: { background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontWeight: '600', fontSize: isMobile ? '0.7rem' : '0.8rem', padding: '0.25rem 0' }
        }, expandedStory ? 'Show less' : 'Read more'),
        
        React.createElement('div', { style: styles.amenitiesTags },
          defaultAmenities.map(function(amenity, idx) {
            var amenityData = amenityIcons[amenity];
            var IconComponent = amenityData?.icon || Check;
            var iconColor = amenityData?.color || '#10B981';
            return React.createElement('span', { key: idx, style: styles.amenityTag },
              React.createElement(IconComponent, { size: 14, color: iconColor }),
              amenity
            );
          })
        )
      ),

      // ===== GALLERY =====
      galleryImages.length > 0 && React.createElement('div', { style: styles.sectionCard },
        React.createElement('div', { style: styles.sectionHeader },
          React.createElement('h2', { style: styles.sectionTitle }, 'Photo Gallery'),
          React.createElement('span', { style: { fontSize: '12px', color: '#94a3b8', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' } },
            React.createElement(Camera, { size: 14 }),
            galleryImages.length + ' photos'
          )
        ),
        React.createElement('div', { style: styles.galleryGrid },
          galleryImages.slice(0, isMobile ? 6 : galleryImages.length).map(function(img, i) {
            return React.createElement('img', {
              key: img.id || i,
              src: img.image_url || img,
              alt: img.file_name || 'Gallery ' + (i + 1),
              style: styles.galleryImage,
              onError: function(e) { e.currentTarget.src = defaultHotelHero; },
              onClick: function() { openLightbox(i); }
            });
          })
        )
      ),

      // ===== LOCATION =====
      React.createElement('div', { style: styles.sectionCard },
        React.createElement('div', { style: styles.sectionHeader },
          React.createElement('h2', { style: styles.sectionTitle }, 'Explore the area'),
          React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' } }, 
            business?.city || 'Lagos', ', Nigeria'
          )
        ),
        React.createElement('div', { style: styles.locationMap },
          React.createElement('iframe', {
            src: 'https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=' + encodeURIComponent(business?.city + ', ' + business?.state || 'Lagos, Nigeria'),
            style: styles.locationMapIframe,
            allowFullScreen: true,
            loading: 'lazy',
            referrerPolicy: 'no-referrer-when-downgrade',
            title: 'Location map'
          })
        ),
        React.createElement('div', { style: styles.locationPlaces },
          nearbyPlaces.map(function(place, idx) {
            return React.createElement('span', { key: idx, style: styles.locationPlace },
              React.createElement(MapPin, { size: 10, color: '#64748b' }),
              place.name,
              React.createElement('span', { style: { color: '#94a3b8', fontSize: '10px' } }, '\u00b7 ' + place.distance)
            );
          })
        )
      ),

      // ===== REVIEWS =====
      React.createElement('div', { style: styles.sectionCard },
        React.createElement('div', { style: styles.reviewsHeader },
          React.createElement('span', { style: styles.reviewsScore }, '4.9'),
          React.createElement('div', null,
            React.createElement('div', { style: styles.reviewsScoreLabel }, 'Wonderful'),
            React.createElement('span', { style: styles.reviewsScoreSub }, 'See all 5,356 reviews >')
          )
        ),
        React.createElement('div', { style: styles.reviewsBreakdown },
          reviewCategories.map(function(cat, idx) {
            return React.createElement('div', { key: idx },
              React.createElement('div', { style: styles.reviewCategory },
                React.createElement('span', { style: styles.reviewCategoryName }, cat.name),
                React.createElement('span', { style: styles.reviewCategoryScore }, cat.score.toFixed(1))
              ),
              React.createElement('div', { style: styles.reviewBar },
                React.createElement('div', { style: { ...styles.reviewBarFill, width: (cat.score / 10) * 100 + '%' } })
              )
            );
          })
        )
      ),

      // ===== ROOMS =====
      business.business_type === 'hotel' && React.createElement('div', { className: 'rooms-section' },
        React.createElement('div', { style: styles.roomsHeader },
          React.createElement('h2', { style: styles.roomsTitle }, 'Choose your room'),
          React.createElement('span', { style: styles.roomsCount }, availableRooms.length + ' rooms available')
        ),
        React.createElement('div', { style: styles.roomsGrid },
          availableRooms.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px' } },
            React.createElement(Bed, { size: 48, color: '#cbd5e1' }),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '12px' } }, 'No Rooms Available'),
            React.createElement('p', { style: { color: '#94a3b8', fontSize: '14px', marginTop: '4px' } }, 'No rooms available for your selected dates')
          ),
          availableRooms.map(function(room) {
            var isSelected = selectedRoom && selectedRoom.id === room.id;
            var roomBadgeColor = getBadgeColor(room.type || 'Standard');
            
            return React.createElement('div', { 
              key: room.id,
              style: isSelected ? styles.roomCardSelected : styles.roomCard,
              onClick: function() {
                if (!dateRange.checkIn || !dateRange.checkOut) {
                  alert('Please select check-in and check-out dates first');
                  return;
                }
                setSelectedRoom(isSelected ? null : room);
              },
              onMouseEnter: function(e) {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                }
              },
              onMouseLeave: function(e) {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                }
              }
            },
              React.createElement('div', { style: styles.roomCardContent },
                React.createElement('div', { style: styles.roomImageWrapper },
                  React.createElement('img', {
                    src: getRoomImage(room.name),
                    alt: room.name,
                    style: styles.roomImage,
                    onError: function(e) { e.currentTarget.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop'; }
                  }),
                  React.createElement('div', { style: { ...styles.roomBadge, background: roomBadgeColor } }, 
                    room.type || 'Standard'
                  ),
                  isSelected && React.createElement('div', { style: styles.roomSelectedBadge },
                    React.createElement(Check, { size: 10 }),
                    'Selected'
                  ),
                  React.createElement('div', { 
                    style: { 
                      position: 'absolute', 
                      bottom: '8px', 
                      left: '8px',
                      background: room.status === 'available' ? '#10B981' : '#EF4444',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '40px',
                      fontSize: '8px',
                      fontWeight: '600'
                    } 
                  }, room.status || 'available')
                ),
                React.createElement('div', { style: styles.roomInfo },
                  React.createElement('div', null,
                    React.createElement('div', { style: styles.roomHeader },
                      React.createElement('h4', { style: styles.roomName }, room.name),
                      React.createElement('span', { style: styles.roomTypeTag }, room.type || 'Standard')
                    ),
                    React.createElement('div', { style: styles.roomMeta },
                      React.createElement('span', { style: styles.roomMetaItem },
                        React.createElement(Users, { size: 11 }),
                        'Sleeps ' + (room.capacity || 2)
                      ),
                      React.createElement('span', { style: styles.roomMetaItem },
                        React.createElement(Bed, { size: 11 }),
                        room.bed_type || 'Standard'
                      ),
                      React.createElement('span', { style: styles.roomMetaItem },
                        React.createElement(Check, { size: 11, color: '#10B981' }),
                        'Free Wi-Fi'
                      )
                    ),
                    React.createElement('div', { style: styles.roomRating },
                      React.createElement('span', { style: styles.roomRatingStars },
                        renderStars(4.9)
                      ),
                      React.createElement('span', { style: styles.roomRatingText }, '4.9'),
                      React.createElement('span', { style: styles.roomReviewCount }, '(124 reviews)')
                    ),
                    room.description && React.createElement('p', { 
                      style: { 
                        fontSize: '12px', 
                        color: '#64748b', 
                        lineHeight: '1.4', 
                        margin: '4px 0', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden' 
                      } 
                    }, room.description)
                  ),
                  React.createElement('div', { style: styles.roomPriceSection },
                    React.createElement('div', { style: styles.roomPriceLeft },
                      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
                        React.createElement('span', { style: styles.roomPriceNow },
                          formatPrice(room.price_per_night || 0),
                          React.createElement('span', { style: styles.roomPricePer }, ' / night')
                        )
                      ),
                      React.createElement('span', { style: { fontSize: '9px', color: '#94a3b8', marginTop: '2px' } }, 
                        'Reserve now, pay later'
                      )
                    ),
                    React.createElement('button', {
                      onClick: function(e) {
                        e.stopPropagation();
                        if (!dateRange.checkIn || !dateRange.checkOut) {
                          alert('Please select check-in and check-out dates first');
                          return;
                        }
                        handleBookNow(room);
                      },
                      style: isSelected ? styles.roomReserveButtonSelected : styles.roomReserveButton,
                      onMouseEnter: function(e) {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#4338CA';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        } else {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.3)';
                        }
                      },
                      onMouseLeave: function(e) {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#4F46E5';
                          e.currentTarget.style.transform = 'scale(1)';
                        } else {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.2)';
                        }
                      }
                    }, isSelected ? 'Book Now' : 'Reserve')
                  )
                )
              )
            );
          })
        )
      ),

      // ===== SPORTS/EVENT CTA =====
      business.business_type !== 'hotel' && React.createElement('div', { style: styles.ctaCard },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '0.5rem' : '0.75rem' } },
          business.business_type === 'sports' 
            ? React.createElement(Trophy, { size: isMobile ? 32 : 40, color: '#4F46E5', strokeWidth: 1.5 })
            : React.createElement(Sparkles, { size: isMobile ? 32 : 40, color: '#4F46E5', strokeWidth: 1.5 })
        ),
        React.createElement('h2', { 
          style: { 
            fontSize: isMobile ? '1.1rem' : '1.25rem', 
            fontWeight: '700', 
            marginBottom: '0.25rem', 
            letterSpacing: '-0.02em',
            color: '#0f172a'
          } 
        }, 
          business.business_type === 'sports' ? 'Ready to Play?' : 'Ready to Celebrate?'
        ),
        React.createElement('p', { 
          style: { 
            color: '#64748b', 
            marginBottom: '1rem', 
            fontSize: isMobile ? '0.8rem' : '0.85rem', 
            maxWidth: '400px', 
            margin: '0 auto 1rem' 
          } 
        }, 
          'Select your date and time to get started with your booking.'
        ),
        React.createElement('button', { 
          className: 'btn btn-primary', 
          onClick: function() { setBookingStarted(true); }, 
          style: styles.ctaButton,
          onMouseEnter: function(e) {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(79,70,229,0.3)';
          },
          onMouseLeave: function(e) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.2)';
          }
        },
          business.business_type === 'sports' ? 'Book a Court ?' : 'Plan Your Event ?'
        ),
        React.createElement('p', { 
          style: { 
            color: '#94a3b8', 
            fontSize: isMobile ? '0.55rem' : '0.65rem', 
            marginTop: '0.5rem' 
          } 
        }, 
          'No payment required to book'
        )
      )
    ),

    // ===== LIGHTBOX =====
    lightboxOpen && React.createElement('div', { 
      style: styles.lightboxOverlay,
      onClick: closeLightbox
    },
      React.createElement('button', {
        style: { ...styles.lightboxNav, left: isMobile ? '0.5rem' : '20px' },
        onClick: function(e) {
          e.stopPropagation();
          goToPrev();
        },
        onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; },
        onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }
      }, '‹'),
      React.createElement('img', {
        src: galleryImages[lightboxIndex]?.image_url || galleryImages[lightboxIndex] || '',
        alt: 'Gallery',
        style: styles.lightboxImage
      }),
      React.createElement('button', {
        style: { ...styles.lightboxNav, right: isMobile ? '0.5rem' : '20px' },
        onClick: function(e) {
          e.stopPropagation();
          goToNext();
        },
        onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; },
        onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }
      }, '›'),
      React.createElement('button', {
        style: styles.lightboxClose,
        onClick: function(e) {
          e.stopPropagation();
          closeLightbox();
        },
        onMouseEnter: function(e) { e.currentTarget.style.transform = 'scale(1.1)'; },
        onMouseLeave: function(e) { e.currentTarget.style.transform = 'scale(1)'; }
      }, '\u00d7')
    ),

    // ===== BOOKING MODAL =====
    showBookingForm && selectedRoom && React.createElement(BookingFormModal, {
      business: business,
      room: selectedRoom,
      dateRange: dateRange,
      guests: guests,
      onClose: function() { setShowBookingForm(false); },
      onSuccess: function() { setShowBookingForm(false); },
      API_BASE: API_BASE,
      formatPrice: formatPrice,
      businessName: business.name,
      isMobile: isMobile,
      styles: styles
    })
  );
}

// ============================================================
// BOOKING FORM MODAL - COMPLETE FIX
// Fixed: paymentMethod state properly declared
// Fixed: User icon replaced with Users (already imported)
// Fixed: Wallet icon replaced with CreditCard (already imported)
// Fixed: Loader2 replaced with Loader (already imported)
// ============================================================
function BookingFormModal({ business, room, dateRange, guests, onClose, onSuccess, API_BASE, formatPrice, businessName, isMobile, styles }) {
  // ===== STATE DECLARATIONS - ALL MUST BE DEFINED =====
  var _useState = React.useState({ name: '', email: '', phone: '', specialRequests: '' });
  var formData = _useState[0];
  var setFormData = _useState[1];
  
  var _useState2 = React.useState(null);
  var createdBooking = _useState2[0];
  var setCreatedBooking = _useState2[1];
  
  var _useState3 = React.useState(false);
  var isCreatingBooking = _useState3[0];
  var setIsCreatingBooking = _useState3[1];
  
  var _useState4 = React.useState(false);
  var showReceipt = _useState4[0];
  var setShowReceipt = _useState4[1];
  
  var _useState5 = React.useState(null);
  var paymentReceipt = _useState5[0];
  var setPaymentReceipt = _useState5[1];
  
  var _useState6 = React.useState(false);
  var showPaystack = _useState6[0];
  var setShowPaystack = _useState6[1];
  
  var _useState7 = React.useState(false);
  var paystackLoaded = _useState7[0];
  var setPaystackLoaded = _useState7[1];
  
  var _useState8 = React.useState(false);
  var isPaying = _useState8[0];
  var setIsPaying = _useState8[1];
  
  var _useState9 = React.useState('');
  var paymentError = _useState9[0];
  var setPaymentError = _useState9[1];
  
  var _useState10 = React.useState(window.innerWidth >= 768);
  var isDesktop = _useState10[0];
  var setIsDesktop = _useState10[1];
  
  // ===== FIX: paymentMethod MUST be declared =====
  var _useState11 = React.useState('venue');
  var paymentMethod = _useState11[0];
  var setPaymentMethod = _useState11[1];

  React.useEffect(function() {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    window.addEventListener('resize', handleResize);
    return function() { window.removeEventListener('resize', handleResize); };
  }, []);

  React.useEffect(function() {
    document.body.style.overflow = 'hidden';
    return function() {
      document.body.style.overflow = '';
    };
  }, []);

  var nights = dateRange.checkIn && dateRange.checkOut 
    ? Math.ceil((new Date(dateRange.checkOut) - new Date(dateRange.checkIn)) / (1000 * 60 * 60 * 24))
    : 1;
  var totalAmount = (room.price_per_night || 0) * nights;

  function createAndProcessBooking(paymentMethod) {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsCreatingBooking(true);
    setPaymentError('');
    
    var bookingData = {
      businessId: business.id,
      roomId: room.id,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      totalAmount: totalAmount,
      checkIn: dateRange.checkIn,
      checkOut: dateRange.checkOut,
      guests: guests,
      specialRequests: formData.specialRequests
    };
    
    fetch(API_BASE + '/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    })
      .then(function (response) { 
        if (!response.ok) {
          return response.json().then(function(errData) {
            throw new Error(errData.error || 'HTTP ' + response.status);
          });
        }
        return response.json(); 
      })
      .then(function (data) {
        if (data.success && data.booking) {
          setCreatedBooking(data.booking);
          setIsCreatingBooking(false);
          
          if (paymentMethod === 'venue') {
            setPaymentReceipt({
              bookingReference: data.booking.booking_reference,
              paymentMethod: 'Pay at Venue',
              amountPaid: totalAmount,
              paidAt: new Date().toLocaleString()
            });
            setShowReceipt(true);
          } else if (paymentMethod === 'card') {
            setShowPaystack(true);
          }
        } else {
          alert('Failed to create booking. Please try again.');
          setIsCreatingBooking(false);
        }
      })
      .catch(function (err) { 
        console.error('[BookingFormModal] Create booking error:', err);
        var errorMessage = err.message || 'Something went wrong. Please try again.';
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          alert('You do not have permission to create bookings. Please contact the business owner.');
        } else if (errorMessage.includes('429')) {
          alert('Booking limit reached. Please contact the business owner.');
        } else if (errorMessage.includes('Failed to fetch')) {
          alert('Cannot connect to server. Please check your internet connection.');
        } else {
          alert(errorMessage);
        }
        setIsCreatingBooking(false);
      });
  }

  React.useEffect(function () {
    if (showPaystack && !window.PaystackPop) {
      var script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = function () {
        setTimeout(function() { setPaystackLoaded(true); }, 100);
      };
      script.onerror = function () {
        setPaymentError('Failed to load payment gateway. Please use "Pay at Venue".');
        setShowPaystack(false);
      };
      document.body.appendChild(script);
    } else if (showPaystack && window.PaystackPop) {
      setPaystackLoaded(true);
    }
  }, [showPaystack]);

  function handlePaystackPayment() {
    if (!window.PaystackPop) {
      setPaymentError('Payment gateway not ready. Please use "Pay at Venue".');
      return;
    }
    
    setIsPaying(true);
    setPaymentError('');
    
    var amountInKobo = totalAmount * 100;
    
    fetch(API_BASE + '/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingReference: createdBooking.booking_reference,
        email: formData.email,
        amount: amountInKobo
      })
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data.success) {
          throw new Error(data.error || 'Could not initialize payment');
        }
        
        var paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        if (!paystackKey) {
          throw new Error('Payment configuration error');
        }
        
        var handler = window.PaystackPop.setup({
          key: paystackKey,
          email: formData.email,
          amount: amountInKobo,
          ref: data.reference,
          currency: 'NGN',
          metadata: {
            custom_fields: [{
              display_name: "Booking Reference",
              variable_name: "booking_reference",
              value: createdBooking.booking_reference
            }]
          },
          onClose: function () {
            setIsPaying(false);
          },
          callback: function (response) {
            verifyPayment(response.reference);
          }
        });
        
        handler.openIframe();
      })
      .catch(function (err) {
        console.error('Payment init error:', err);
        setPaymentError(err.message || 'Something went wrong. Please use "Pay at Venue".');
        setIsPaying(false);
      });
  }
  
  function verifyPayment(reference) {
    fetch(API_BASE + '/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: reference,
        bookingReference: createdBooking.booking_reference
      })
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.success) {
          setPaymentReceipt({
            bookingReference: createdBooking.booking_reference,
            paymentMethod: 'Card (Paystack)',
            amountPaid: totalAmount,
            paidAt: new Date().toLocaleString(),
            transactionId: reference
          });
          setShowReceipt(true);
          setShowPaystack(false);
        } else {
          setPaymentError('Payment verification failed. Your booking is confirmed but payment needs verification.');
        }
        setIsPaying(false);
      })
      .catch(function () {
        setPaymentError('Payment verification failed. Your booking is confirmed but payment needs verification.');
        setIsPaying(false);
      });
  }

  if (showReceipt && paymentReceipt) {
    return React.createElement(ReceiptModal, {
      receipt: paymentReceipt,
      booking: createdBooking,
      room: room,
      dateRange: dateRange,
      guests: guests,
      businessName: businessName,
      onClose: onClose,
      onSuccess: onSuccess,
      formatPrice: formatPrice,
      isMobile: isMobile
    });
  }

  // ===== Modal Render =====
  var modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 0
  };

  var modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: isMobile ? '28px 28px 0 0' : '28px',
    maxWidth: '560px',
    width: '100%',
    maxHeight: isMobile ? '92vh' : '85vh',
    overflowY: 'auto',
    boxShadow: isMobile ? '0 -20px 80px rgba(0,0,0,0.15)' : '0 25px 50px -12px rgba(0,0,0,0.25)',
    paddingBottom: 'env(safe-area-inset-bottom)'
  };

  return React.createElement('div', { 
    className: 'modal-overlay', 
    onClick: function(e) { if (e.target === e.currentTarget) onClose(); },
    style: modalOverlayStyle
  },
    React.createElement('div', { 
      className: 'modal-content', 
      onClick: function (e) { e.stopPropagation(); },
      style: modalContentStyle
    },
      React.createElement('div', { style: styles.modalHandle }),
      React.createElement('div', { style: styles.modalHeader },
        React.createElement('h3', { style: styles.modalTitle }, 'Complete Your Booking'),
        React.createElement('button', { 
          onClick: onClose,
          style: styles.modalClose,
          onMouseEnter: function(e) { e.currentTarget.style.backgroundColor = '#e2e8f0'; },
          onMouseLeave: function(e) { e.currentTarget.style.backgroundColor = '#f1f5f9'; }
        }, React.createElement(X, { size: 18 }))
      ),
      React.createElement('div', { style: styles.modalBody },
        React.createElement('div', { style: styles.modalSummary },
          React.createElement('div', { style: styles.modalSummaryRow },
            React.createElement('span', { style: styles.modalSummaryLabel }, 'Room'),
            React.createElement('span', { style: styles.modalSummaryValue }, room.name)
          ),
          React.createElement('div', { style: styles.modalSummaryRow },
            React.createElement('span', { style: styles.modalSummaryLabel }, 'Total'),
            React.createElement('span', { style: { ...styles.modalSummaryValue, color: '#4F46E5', fontWeight: '700' } }, 
              formatPrice(totalAmount)
            )
          )
        ),
        // ===== FULL NAME FIELD - Using Users icon =====
        React.createElement('div', { style: styles.formGroup },
          React.createElement('label', { style: styles.formLabel },
            React.createElement(Users, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
            'Full Name *'
          ),
          React.createElement('input', {
            type: 'text',
            name: 'name',
            value: formData.name,
            onChange: function(e) { setFormData({ ...formData, name: e.target.value }); },
            placeholder: 'Enter your full name',
            style: styles.formInput,
            onFocus: function(e) { e.target.style.borderColor = '#4F46E5'; },
            onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; }
          })
        ),
        // ===== EMAIL FIELD =====
        React.createElement('div', { style: styles.formGroup },
          React.createElement('label', { style: styles.formLabel },
            React.createElement(Mail, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
            'Email Address *'
          ),
          React.createElement('input', {
            type: 'email',
            name: 'email',
            value: formData.email,
            onChange: function(e) { setFormData({ ...formData, email: e.target.value }); },
            placeholder: 'your@email.com',
            style: styles.formInput,
            onFocus: function(e) { e.target.style.borderColor = '#4F46E5'; },
            onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; }
          })
        ),
        // ===== PHONE FIELD =====
        React.createElement('div', { style: styles.formGroup },
          React.createElement('label', { style: styles.formLabel },
            React.createElement(Phone, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
            'Phone Number *'
          ),
          React.createElement('input', {
            type: 'tel',
            name: 'phone',
            value: formData.phone,
            onChange: function(e) { setFormData({ ...formData, phone: e.target.value }); },
            placeholder: '080 1234 5678',
            style: styles.formInput,
            onFocus: function(e) { e.target.style.borderColor = '#4F46E5'; },
            onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; }
          })
        ),
        // ===== SPECIAL REQUESTS =====
        React.createElement('div', { style: styles.formGroup },
          React.createElement('label', { style: styles.formLabel }, 'Special Requests'),
          React.createElement('textarea', {
            name: 'specialRequests',
            value: formData.specialRequests,
            onChange: function(e) { setFormData({ ...formData, specialRequests: e.target.value }); },
            placeholder: 'Any special requests...',
            style: { ...styles.formInput, minHeight: '50px', resize: 'vertical', fontFamily: 'inherit' },
            onFocus: function(e) { e.target.style.borderColor = '#4F46E5'; },
            onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; }
          })
        ),
        // ===== PAYMENT METHOD - Using CreditCard icon =====
        React.createElement('div', { style: styles.formGroup },
          React.createElement('label', { style: styles.formLabel },
            React.createElement(CreditCard, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
            'Payment Method'
          ),
          React.createElement('div', { style: styles.paymentOptions },
            React.createElement('div', {
              style: paymentMethod === 'venue' ? styles.paymentOptionPrimarySelected : styles.paymentOptionPrimary,
              onClick: function() { setPaymentMethod('venue'); }
            },
              React.createElement(MapPin, { size: 20, color: paymentMethod === 'venue' ? '#4F46E5' : '#64748b', style: styles.paymentOptionIcon }),
              React.createElement('span', { style: styles.paymentOptionLabel }, 'Pay at Venue'),
              React.createElement('span', { style: styles.paymentOptionDesc }, 'Pay when you arrive'),
              paymentMethod === 'venue' && React.createElement('div', { style: styles.recommendedBadge }, 'RECOMMENDED')
            ),
            React.createElement('div', {
              style: paymentMethod === 'card' ? styles.paymentOptionSelected : styles.paymentOption,
              onClick: function() { setPaymentMethod('card'); }
            },
              React.createElement(CreditCard, { size: 20, color: paymentMethod === 'card' ? '#4F46E5' : '#64748b', style: styles.paymentOptionIcon }),
              React.createElement('span', { style: styles.paymentOptionLabel }, 'Pay with Card'),
              React.createElement('span', { style: styles.paymentOptionDesc }, 'Secure online payment')
            )
          )
        ),
        // ===== SUBMIT BUTTON - FIXED: Loader2 replaced with Loader =====
        React.createElement('button', {
          onClick: function() { createAndProcessBooking(paymentMethod); },
          disabled: isCreatingBooking,
          style: isCreatingBooking ? styles.submitButtonDisabled : styles.submitButton,
          onMouseEnter: function(e) {
            if (!isCreatingBooking) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(79,70,229,0.3)';
            }
          },
          onMouseLeave: function(e) {
            if (!isCreatingBooking) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.2)';
            }
          }
        },
          isCreatingBooking ? 
            React.createElement(Loader, { size: 18, style: { animation: 'spin 1s linear infinite', display: 'inline', marginRight: '8px' } }) :
            React.createElement(Check, { size: 18, style: { display: 'inline', marginRight: '8px' } }),
          isCreatingBooking ? 'Processing...' : paymentMethod === 'venue' ? 'Confirm & Pay at Venue' : 'Pay with Card'
        )
      )
    )
  );
}

// ============================================================
// RECEIPT MODAL - Mobile Responsive
// ============================================================
function ReceiptModal({ receipt, booking, room, dateRange, guests, businessName, onClose, onSuccess, formatPrice, isMobile }) {
  var _useState = React.useState(false);
  var isClosing = _useState[0];
  var setIsClosing = _useState[1];
  var _useState2 = React.useState(window.innerWidth >= 768);
  var isDesktop = _useState2[0];

  React.useEffect(function() {
    document.body.style.overflow = 'hidden';
    return function() {
      document.body.style.overflow = '';
    };
  }, []);

  function handleDone() {
    setIsClosing(true);
    setTimeout(function() {
      onSuccess();
      onClose();
    }, 300);
  }

  function handleDownload() {
    var receiptHtml = document.getElementById('receipt-content');
    if (receiptHtml) {
      var printWindow = window.open('', '_blank');
      printWindow.document.write('<!DOCTYPE html><html><head><title>Booking Receipt</title><style>');
      printWindow.document.write('body { font-family: Inter, system-ui, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; background: #f8fafc; }');
      printWindow.document.write('.receipt-card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }');
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<div class="receipt-card">');
      printWindow.document.write(receiptHtml.cloneNode(true).outerHTML);
      printWindow.document.write('</div></body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }

  return React.createElement('div', { 
    className: 'modal-overlay', 
    onClick: function() { if (!isClosing) handleDone(); },
    style: { 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.7)', 
      backdropFilter: 'blur(8px)', 
      display: 'flex', 
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center', 
      zIndex: 9999, 
      padding: isMobile ? '0' : '20px'
    } 
  },
    React.createElement('div', { 
      className: 'modal-content', 
      onClick: function (e) { e.stopPropagation(); },
      style: { 
        maxWidth: '480px', 
        width: '100%', 
        padding: 0,
        overflow: 'visible',
        background: 'white',
        borderRadius: isMobile ? '24px 24px 0 0' : '28px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxHeight: 'none',
        height: 'auto',
        marginTop: isMobile ? 'auto' : 0
      } 
    },
      React.createElement('div', { style: { 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: isMobile ? '20px 16px' : '28px 24px',
        textAlign: 'center',
        color: 'white',
        borderRadius: isMobile ? '24px 24px 0 0' : '28px 28px 0 0'
      } },
        React.createElement('div', { style: { 
          width: isMobile ? '48px' : '64px', 
          height: isMobile ? '48px' : '64px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 12px'
        } },
          React.createElement(Check, { size: isMobile ? 24 : 32, strokeWidth: 2 })
        ),
        React.createElement('h2', { style: { fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '700', marginBottom: '4px' } }, 'Booking Confirmed!'),
        React.createElement('p', { style: { fontSize: isMobile ? '0.75rem' : '0.9rem', opacity: 0.9, margin: 0 } }, 
          receipt.paymentMethod === 'Pay at Venue' 
            ? 'Your booking has been confirmed. Pay upon arrival.'
            : 'Payment successful! Your booking is confirmed.'
        )
      ),
      
      React.createElement('div', { id: 'receipt-content', style: { padding: isMobile ? '16px' : '24px' } },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' } },
          React.createElement('h3', { style: { fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: '700', marginBottom: '2px', color: '#0f172a' } }, businessName),
          React.createElement('p', { style: { fontSize: isMobile ? '0.6rem' : '0.7rem', color: '#94a3b8' } }, 'Booking Confirmation')
        ),
        
        React.createElement('div', { style: { 
          background: '#f8fafc', 
          padding: isMobile ? '8px' : '12px', 
          borderRadius: '12px', 
          textAlign: 'center',
          marginBottom: '16px'
        } },
          React.createElement('p', { style: { fontSize: isMobile ? '0.55rem' : '0.65rem', color: '#64748b', marginBottom: '2px' } }, 'Booking Reference'),
          React.createElement('p', { style: { fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '1px', color: '#0f172a' } }, receipt.bookingReference)
        ),
        
        booking && React.createElement('div', { style: { marginBottom: '16px', padding: isMobile ? '12px' : '16px', background: '#f8fafc', borderRadius: '16px' } },
          React.createElement('p', { style: { fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 'Customer Details'),
          React.createElement('p', { style: { fontSize: isMobile ? '0.8rem' : '0.85rem', fontWeight: '500', color: '#0f172a', marginBottom: '2px' } }, booking.customer_name),
          React.createElement('p', { style: { fontSize: isMobile ? '0.65rem' : '0.75rem', color: '#64748b', marginBottom: '1px' } }, booking.customer_email),
          React.createElement('p', { style: { fontSize: isMobile ? '0.65rem' : '0.75rem', color: '#64748b' } }, booking.customer_phone)
        ),
        
        React.createElement('div', { style: { 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '12px',
          marginTop: '4px',
          borderTop: '2px solid #4f46e5'
        } },
          React.createElement('span', { style: { fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: '600', color: '#0f172a' } }, 'Total ' + (receipt.paymentMethod === 'Pay at Venue' ? 'to pay' : 'paid')),
          React.createElement('span', { style: { fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: '800', color: receipt.paymentMethod === 'Pay at Venue' ? '#d97706' : '#10b981' } }, formatPrice(receipt.amountPaid))
        ),
        
        React.createElement('p', { style: { fontSize: isMobile ? '0.55rem' : '0.65rem', color: '#94a3b8', textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' } }, 
          receipt.paymentMethod === 'Pay at Venue' 
            ? 'A confirmation email has been sent. Please pay upon arrival.'
            : 'A confirmation email has been sent to your email address.'
        )
      ),
      
      React.createElement('div', { style: { 
        padding: isMobile ? '12px 16px 16px' : '16px 24px 24px',
        display: 'flex',
        gap: '10px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
        borderRadius: '0 0 24px 24px'
      } },
        React.createElement('button', { 
          onClick: handleDownload, 
          style: { 
            flex: 1, 
            padding: isMobile ? '10px' : '12px',
            background: 'white',
            border: '1.5px solid #e2e8f0',
            borderRadius: '40px',
            color: '#475569',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            justifyContent: 'center'
          },
          onMouseEnter: function(e) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; },
          onMouseLeave: function(e) { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }
        }, React.createElement(Download, { size: isMobile ? 14 : 16 }), 'Receipt'),
        React.createElement('button', { 
          onClick: handleDone, 
          style: { 
            flex: 1, 
            padding: isMobile ? '10px' : '12px', 
            background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '40px',
            color: 'white',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(79,70,229,0.25)'
          },
          onMouseEnter: function(e) { e.currentTarget.style.transform = 'scale(1.01)'; },
          onMouseLeave: function(e) { e.currentTarget.style.transform = 'scale(1)'; }
        }, 'Done')
      )
    )
  );
}

export default UnifiedBookingPage;
