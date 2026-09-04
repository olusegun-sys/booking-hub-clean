﻿// client/src/EventBooking.jsx
// =============================================
// EVENT BOOKING - DISPLAYS ACTUAL BUSINESS VENUES
// Fetches venues from the business's rooms table
// Uses business-defined pricing (base_price, included_guests, extra_guest_price)
// =============================================

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, Calendar, Users, Star, DollarSign, Clock, 
  CheckCircle, Sparkles, PartyPopper, Music, Cake, Briefcase, 
  Gift, GlassWater, Crown, Shield, Heart, Camera, Building2,
  Info, TrendingUp, AlertTriangle
} from 'lucide-react';
import GuestBookingForm from './components/forms/GuestBookingForm';
import API_BASE from './config';

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function formatPrice(price) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price || 0);
}

function getVenueIcon(venueName) {
  var name = venueName.toLowerCase();
  if (name.includes('banquet') || name.includes('hall')) return PartyPopper;
  if (name.includes('garden') || name.includes('outdoor')) return Sparkles;
  if (name.includes('conference') || name.includes('seminar')) return Briefcase;
  if (name.includes('wedding')) return Heart;
  if (name.includes('birthday')) return Cake;
  return Building2;
}

function getVenueColor(venueName) {
  var colors = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
  var hash = 0;
  for (var i = 0; i < venueName.length; i++) {
    hash = venueName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getVenueGradient(venueName) {
  var color = getVenueColor(venueName);
  return 'linear-gradient(135deg, ' + color + ', ' + color + '88)';
}

// ============================================================
// PRICE CALCULATOR - Uses business-defined pricing
// ============================================================
function calculateVenuePrice(venue, guests) {
  // Get values from the venue with fallbacks
  var basePrice = venue?.base_price || venue?.price_per_night || 0;
  var includedGuests = venue?.included_guests || venue?.capacity || 50;
  var extraGuestPrice = venue?.extra_guest_price || 2000;
  var maxCapacity = venue?.max_capacity || venue?.capacity || 300;
  
  // Cap guests at max capacity
  var actualGuests = Math.min(guests, maxCapacity);
  
  // If guests are within included amount, just base price
  if (actualGuests <= includedGuests) {
    return {
      basePrice: basePrice,
      includedGuests: includedGuests,
      extraGuests: 0,
      extraCharge: 0,
      total: basePrice,
      maxCapacity: maxCapacity,
      isOverCapacity: guests > maxCapacity
    };
  }
  
  // Calculate extra charge for additional guests
  var extraGuests = actualGuests - includedGuests;
  var extraCharge = extraGuests * extraGuestPrice;
  
  return {
    basePrice: basePrice,
    includedGuests: includedGuests,
    extraGuests: extraGuests,
    extraGuestPrice: extraGuestPrice,
    extraCharge: extraCharge,
    total: basePrice + extraCharge,
    maxCapacity: maxCapacity,
    isOverCapacity: guests > maxCapacity
  };
}

// ============================================================
// PREMIUM STYLES
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
    header: {
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226,232,240,0.3)',
      padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
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
    heroSection: {
      position: 'relative',
      width: '100%',
      height: isMobile ? '280px' : '350px',
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
    heroName: {
      fontSize: isMobile ? '24px' : '32px',
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
      fontSize: isMobile ? '12px' : '14px',
      opacity: 0.9,
      textShadow: '0 1px 10px rgba(0,0,0,0.2)',
      color: 'white'
    },
    heroBadges: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '8px'
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
    venueCountBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      background: 'rgba(79,70,229,0.1)',
      borderRadius: '40px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#4F46E5',
      marginBottom: '16px'
    },
    mainCard: {
      maxWidth: '800px',
      margin: '-20px auto 0',
      padding: isMobile ? '16px' : '24px',
      background: 'white',
      borderRadius: '24px 24px 0 0',
      position: 'relative',
      zIndex: 2,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
    },
    venueGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    venueCard: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '20px',
      border: '2px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    venueCardSelected: {
      background: '#EEF2FF',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '20px',
      border: '2px solid #4F46E5',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(79,70,229,0.12)',
      position: 'relative'
    },
    venueIconWrapper: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '12px'
    },
    venueName: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      marginBottom: '4px'
    },
    venueDescription: {
      fontSize: '12px',
      color: '#64748b',
      margin: '0 0 8px',
      lineHeight: '1.4'
    },
    venuePrice: {
      fontSize: '18px',
      fontWeight: '800',
      color: '#4F46E5',
      margin: '8px 0 4px'
    },
    venueCapacity: {
      fontSize: '12px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    venueCheck: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: '#4F46E5',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formLabel: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '6px'
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
    rangeInput: {
      width: '100%',
      padding: '0',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      accentColor: '#4F46E5'
    },
    rangeValue: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#4F46E5',
      marginTop: '8px'
    },
    priceCard: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f4f9 100%)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      marginBottom: '20px'
    },
    priceRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #e2e8f0'
    },
    priceRowLast: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0 0',
      borderTop: '2px solid #4F46E5',
      marginTop: '4px'
    },
    priceLabel: {
      color: '#64748b',
      fontSize: '14px'
    },
    priceValue: {
      fontWeight: '600',
      color: '#0f172a',
      fontSize: '14px'
    },
    priceTotal: {
      fontSize: '22px',
      fontWeight: '800',
      color: '#4F46E5'
    },
    priceExtra: {
      fontSize: '13px',
      color: '#d97706',
      fontWeight: '500'
    },
    bookButton: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(79,70,229,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    bookButtonDisabled: {
      width: '100%',
      padding: '16px',
      background: '#94a3b8',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'not-allowed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      background: '#f8fafc',
      borderRadius: '16px',
      border: '2px dashed #e2e8f0',
      marginBottom: '24px'
    },
    emptyStateIcon: {
      width: '48px',
      height: '48px',
      background: '#eef2ff',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 12px'
    },
    emptyStateTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#0f172a',
      margin: '0 0 4px'
    },
    emptyStateText: {
      fontSize: '13px',
      color: '#64748b',
      margin: 0
    },
    aboutCard: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px',
      background: 'white',
      borderRadius: '0 0 24px 24px',
      borderTop: '1px solid #f1f5f9'
    },
    aboutTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: '0 0 12px'
    },
    aboutText: {
      color: '#64748b',
      lineHeight: '1.8',
      fontSize: '14px',
      margin: 0
    },
    // Capacity warning
    capacityWarning: {
      background: '#fef2f2',
      borderRadius: '12px',
      padding: '12px 16px',
      border: '1px solid #fecaca',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
      color: '#991b1b',
      fontSize: '13px'
    }
  };
}

// ============================================================
// PREMIUM HERO IMAGES FOR EVENTS
// ============================================================
var eventHeroImages = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=400&fit=crop'
];

// ============================================================
// MAIN COMPONENT - EventBooking
// ============================================================
function EventBooking({ business, onBack }) {
  var isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  var styles = createStyles(isMobile);
  
  var [selectedVenue, setSelectedVenue] = useState(null);
  var [eventDate, setEventDate] = useState('');
  var [attendees, setAttendees] = useState(50);
  var [venues, setVenues] = useState([]);
  var [loadingVenues, setLoadingVenues] = useState(true);
  var [showBookingForm, setShowBookingForm] = useState(false);
  var [bookingComplete, setBookingComplete] = useState(false);
  var [bookingDetails, setBookingDetails] = useState(null);
  var [customerEmail, setCustomerEmail] = useState('');
  var [heroIndex, setHeroIndex] = useState(0);

  // ============================================================
  // FETCH VENUES FROM BUSINESS
  // ============================================================
  useEffect(function() {
    setHeroIndex(Math.floor(Math.random() * eventHeroImages.length));
  }, []);

  useEffect(function() {
    if (business && business.id) {
      var token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      console.log('[EventBooking] Fetching venues for business:', business.id);
      
      fetch(API_BASE + '/api/businesses/' + business.id + '/rooms', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(function(res) {
          console.log('[EventBooking] Venues response status:', res.status);
          return res.json();
        })
        .then(function(data) {
          console.log('[EventBooking] Venues data:', data);
          if (data.success) {
            setVenues(data.rooms || []);
            console.log('[EventBooking] Set venues count:', data.rooms?.length || 0);
          } else {
            console.error('[EventBooking] Failed to fetch venues:', data.error);
          }
          setLoadingVenues(false);
        })
        .catch(function(err) {
          console.error('[EventBooking] Error fetching venues:', err);
          setLoadingVenues(false);
        });
    }
  }, [business]);

  // ============================================================
  // HANDLERS - Uses business-defined pricing
  // ============================================================
  var getPriceBreakdown = function() {
    if (!selectedVenue) return null;
    return calculateVenuePrice(selectedVenue, attendees);
  };

  var handleBooking = function() {
    if (!selectedVenue) return;
    if (!eventDate) return;
    setShowBookingForm(true);
  };

  var handleBookingSuccess = function(booking, email) {
    setBookingDetails(booking);
    setCustomerEmail(email);
    setBookingComplete(true);
    setShowBookingForm(false);
  };

  var getHeroImage = function() {
    if (business && business.cover_image) return business.cover_image;
    return eventHeroImages[heroIndex] || eventHeroImages[0];
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (loadingVenues) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' } },
      React.createElement('div', { style: { width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' } })
    );
  }

  if (bookingComplete) {
    var priceResult = getPriceBreakdown();
    return React.createElement('div', { className: 'app-container', style: { padding: '20px', maxWidth: '600px', margin: '0 auto' } },
      React.createElement('div', { style: { textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' } },
        React.createElement('div', { style: { width: '64px', height: '64px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' } },
          React.createElement(CheckCircle, { size: 32, color: '#10b981' })
        ),
        React.createElement('h2', { style: { fontSize: '24px', fontWeight: '700', marginTop: '16px' } }, 'Booking Confirmed!'),
        React.createElement('p', { style: { color: '#64748b' } }, 'Your event booking has been confirmed.'),
        React.createElement('div', { style: { background: '#f8fafc', borderRadius: '12px', padding: '16px', margin: '20px 0', textAlign: 'left' } },
          React.createElement('p', null, React.createElement('strong', null, 'Venue: '), selectedVenue?.name),
          React.createElement('p', null, React.createElement('strong', null, 'Date: '), eventDate),
          React.createElement('p', null, React.createElement('strong', null, 'Attendees: '), attendees),
          React.createElement('p', null, React.createElement('strong', null, 'Total: '), formatPrice(priceResult?.total || 0))
        ),
        React.createElement('button', {
          onClick: onBack,
          style: {
            padding: '12px 32px',
            background: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '40px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }
        }, 'Back to Booking Page')
      )
    );
  }

  if (showBookingForm) {
    var priceData = getPriceBreakdown();
    return React.createElement(GuestBookingForm, {
      businessId: business.id,
      serviceType: 'event',
      serviceDetails: {
        venueName: selectedVenue?.name,
        date: eventDate,
        attendees: attendees,
        totalPrice: priceData?.total || 0,
        basePrice: priceData?.basePrice || 0,
        extraCharge: priceData?.extraCharge || 0
      },
      totalAmount: priceData?.total || 0,
      onBack: function() { setShowBookingForm(false); },
      onSuccess: handleBookingSuccess
    });
  }

  var priceBreakdown = getPriceBreakdown();
  var totalPrice = priceBreakdown?.total || 0;

  return React.createElement('div', { style: styles.container },
    // ===== HEADER =====
    React.createElement('div', { style: styles.header },
      React.createElement('button', {
        onClick: onBack,
        style: styles.backButton,
        onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(79,70,229,0.15)'; },
        onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(79,70,229,0.08)'; }
      },
        React.createElement(ArrowLeft, { size: isMobile ? 12 : 14 }),
        React.createElement('span', { style: { display: isMobile ? 'none' : 'inline' } }, 'Back')
      ),
      React.createElement('h1', { style: styles.businessName }, business.name)
    ),

    // ===== HERO =====
    React.createElement('div', { style: styles.heroSection },
      React.createElement('img', { src: getHeroImage(), alt: business.name, style: styles.heroImage, onError: function(e) { e.currentTarget.src = eventHeroImages[0]; } }),
      React.createElement('div', { style: styles.heroOverlay }),
      React.createElement('div', { style: styles.heroContent },
        React.createElement('h1', { style: styles.heroName }, business.name),
        React.createElement('div', { style: styles.heroLocation },
          React.createElement(MapPin, { size: 14 }),
          business.city + ', ' + business.state
        ),
        React.createElement('div', { style: styles.heroBadges },
          React.createElement('span', { style: styles.heroBadge },
            React.createElement(Star, { size: 12, fill: '#F59E0B', color: '#F59E0B' }),
            '4.9'
          ),
          React.createElement('span', { style: { ...styles.heroBadge, background: 'rgba(251, 146, 60, 0.3)', border: '1px solid rgba(251, 146, 60, 0.3)' } },
            React.createElement(Sparkles, { size: 12 }),
            'Premium Venue'
          ),
          React.createElement('span', { style: { ...styles.heroBadge, background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.3)' } },
            React.createElement(Shield, { size: 12 }),
            'Verified'
          ),
          React.createElement('span', { style: { ...styles.heroBadge, background: 'rgba(236, 72, 153, 0.3)', border: '1px solid rgba(236, 72, 153, 0.3)' } },
            React.createElement(PartyPopper, { size: 12 }),
            'Celebration Ready'
          )
        )
      )
    ),

    // ===== MAIN CARD =====
    React.createElement('div', { style: styles.mainCard },
      // Venue Count Badge
      React.createElement('div', { style: styles.venueCountBadge },
        React.createElement(Building2, { size: 14 }),
        venues.length + ' venue' + (venues.length !== 1 ? 's' : '') + ' available'
      ),

      // ===== VENUE SELECTION =====
      React.createElement('div', { style: styles.formGroup },
        React.createElement('label', { style: styles.formLabel },
          React.createElement(Sparkles, { size: 16, style: { display: 'inline', marginRight: '6px' } }),
          'Step 1: Select Your Venue'
        ),
        
        venues.length === 0 ? 
          React.createElement('div', { style: styles.emptyState },
            React.createElement('div', { style: styles.emptyStateIcon },
              React.createElement(Building2, { size: 24, color: '#4F46E5' })
            ),
            React.createElement('h3', { style: styles.emptyStateTitle }, 'No Venues Available'),
            React.createElement('p', { style: styles.emptyStateText }, 'This business hasn\'t added any venues yet. Check back later!')
          ) :
          React.createElement('div', { style: styles.venueGrid },
            venues.map(function(venue) {
              var Icon = getVenueIcon(venue.name);
              var color = getVenueColor(venue.name);
              var gradient = getVenueGradient(venue.name);
              var isSelected = selectedVenue && selectedVenue.id === venue.id;
              var cardStyle = isSelected ? styles.venueCardSelected : styles.venueCard;
              
              // Get pricing for display
              var basePrice = venue?.base_price || venue?.price_per_night || 0;
              var includedGuests = venue?.included_guests || venue?.capacity || 50;
              var maxCapacity = venue?.max_capacity || venue?.capacity || 300;
              var extraGuestPrice = venue?.extra_guest_price || 2000;
              
              return React.createElement('div', {
                key: venue.id,
                style: cardStyle,
                onClick: function() { setSelectedVenue(venue); },
                onMouseEnter: function(e) {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                },
                onMouseLeave: function(e) {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }
              },
                React.createElement('div', { style: { ...styles.venueIconWrapper, background: gradient + '20' } },
                  React.createElement(Icon, { size: 24, color: color })
                ),
                React.createElement('h4', { style: styles.venueName }, venue.name),
                React.createElement('p', { style: styles.venueDescription }, venue.description || 'Perfect venue for your event'),
                React.createElement('div', { style: styles.venuePrice }, formatPrice(basePrice)),
                React.createElement('div', { style: styles.venueCapacity },
                  React.createElement(Users, { size: 12 }),
                  'Up to ' + includedGuests + ' guests included'
                ),
                maxCapacity > includedGuests && React.createElement('div', { style: { fontSize: '11px', color: '#d97706', marginTop: '2px' } },
                  '+' + formatPrice(extraGuestPrice) + ' per extra guest'
                ),
                isSelected && React.createElement('div', { style: styles.venueCheck },
                  React.createElement(CheckCircle, { size: 14, color: 'white' })
                )
              );
            })
          )
      ),

      // Step 2: Date
      React.createElement('div', { style: styles.formGroup },
        React.createElement('label', { style: styles.formLabel },
          React.createElement(Calendar, { size: 16, style: { display: 'inline', marginRight: '6px' } }),
          'Step 2: Select Event Date'
        ),
        React.createElement('input', {
          type: 'date',
          value: eventDate,
          onChange: function(e) { setEventDate(e.target.value); },
          style: styles.formInput,
          min: new Date().toISOString().split('T')[0],
          onFocus: function(e) { e.currentTarget.style.borderColor = '#4F46E5'; },
          onBlur: function(e) { e.currentTarget.style.borderColor = '#e2e8f0'; }
        })
      ),

      // Step 3: Attendees
      React.createElement('div', { style: styles.formGroup },
        React.createElement('label', { style: styles.formLabel },
          React.createElement(Users, { size: 16, style: { display: 'inline', marginRight: '6px' } }),
          'Step 3: Number of Attendees'
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
          React.createElement('span', { style: { fontSize: '14px', color: '#64748b', fontWeight: '500' } }, '10'),
          React.createElement('input', {
            type: 'range',
            min: '10',
            max: (selectedVenue?.max_capacity || selectedVenue?.capacity || 300),
            value: attendees,
            onChange: function(e) { 
              var val = parseInt(e.target.value);
              var maxCap = selectedVenue?.max_capacity || selectedVenue?.capacity || 300;
              setAttendees(Math.min(val, maxCap));
            },
            style: styles.rangeInput
          }),
          React.createElement('span', { style: { fontSize: '14px', color: '#64748b', fontWeight: '500' } }, selectedVenue?.max_capacity || selectedVenue?.capacity || 300)
        ),
        React.createElement('div', { style: styles.rangeValue }, attendees + ' guests'),
        // Capacity warning
        selectedVenue && attendees > (selectedVenue?.max_capacity || selectedVenue?.capacity || 300) && 
          React.createElement('div', { style: styles.capacityWarning },
            React.createElement(AlertTriangle, { size: 16 }),
            'Maximum capacity is ' + (selectedVenue?.max_capacity || selectedVenue?.capacity || 300) + ' guests'
          )
      ),

      // Price Summary - Uses business-defined pricing
      selectedVenue && priceBreakdown && React.createElement('div', { style: styles.priceCard },
        React.createElement('p', { style: { fontSize: '13px', fontWeight: '600', color: '#64748b', margin: '0 0 12px' } }, '💰 Price Breakdown'),
        
        // Base price
        React.createElement('div', { style: styles.priceRow },
          React.createElement('span', { style: styles.priceLabel }, 
            'Base Price (up to ' + priceBreakdown.includedGuests + ' guests)'
          ),
          React.createElement('span', { style: styles.priceValue }, formatPrice(priceBreakdown.basePrice))
        ),
        
        // Extra guests (if any)
        priceBreakdown.extraGuests > 0 && React.createElement('div', { style: styles.priceRow },
          React.createElement('span', { style: styles.priceLabel },
            priceBreakdown.extraGuests + ' extra guests × ' + formatPrice(priceBreakdown.extraGuestPrice)
          ),
          React.createElement('span', { style: styles.priceExtra }, '+' + formatPrice(priceBreakdown.extraCharge))
        ),
        
        // Total
        React.createElement('div', { style: styles.priceRowLast },
          React.createElement('span', { style: { fontWeight: '600', color: '#0f172a' } }, 'Total'),
          React.createElement('span', { style: styles.priceTotal }, formatPrice(priceBreakdown.total))
        )
      ),

      // Book Button
      React.createElement('button', {
        onClick: handleBooking,
        disabled: !selectedVenue || !eventDate,
        style: selectedVenue && eventDate ? styles.bookButton : styles.bookButtonDisabled,
        onMouseEnter: function(e) {
          if (selectedVenue && eventDate) {
            e.currentTarget.style.transform = 'scale(1.01)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,70,229,0.3)';
          }
        },
        onMouseLeave: function(e) {
          if (selectedVenue && eventDate) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.2)';
          }
        }
      },
        !selectedVenue ? React.createElement(React.Fragment, null,
          React.createElement(Sparkles, { size: 18 }),
          ' Select a Venue'
        ) : !eventDate ? React.createElement(React.Fragment, null,
          React.createElement(Calendar, { size: 18 }),
          ' Select Event Date'
        ) : React.createElement(React.Fragment, null,
          React.createElement(CheckCircle, { size: 18 }),
          ' Continue to Booking'
        )
      )
    ),

    // ===== ABOUT =====
    business.description && React.createElement('div', { style: styles.aboutCard },
      React.createElement('h3', { style: styles.aboutTitle }, 'About ' + business.name),
      React.createElement('p', { style: styles.aboutText }, business.description)
    )
  );
}

export default EventBooking;