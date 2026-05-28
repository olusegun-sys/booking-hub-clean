﻿import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Phone, Mail, Clock, DollarSign, 
  Trophy, Users, Star, Building2, Wind, Car, X, 
  ChevronLeft, ChevronRight, Wifi, Coffee, Tv, Bath, Calendar, Home,
  CheckCircle, Download, Printer, CreditCard, Bed, Utensils, Sparkles,
  Lock, CreditCard as CardIcon, Receipt, Check, Building, Loader
} from 'lucide-react';
import RoomPage from './RoomPage';
import SportsBooking from './SportsBooking';
import EventBooking from './EventBooking';

// Dynamic API base - works on desktop and mobile
var API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'http://' + window.location.hostname + ':5000';

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

var defaultHotelHero = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop';

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

function UnifiedBookingPage() {
  var _useParams = useParams();
  var businessSlug = _useParams.businessSlug;
  var navigate = useNavigate();
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

  function fetchBusinessData() {
    setLoading(true);
    fetch(API_BASE + '/api/businesses/slug/' + businessSlug)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.success && data.business) {
          setBusiness(data.business);
          return fetch(API_BASE + '/api/businesses/' + data.business.id + '/rooms')
            .then(function (r) { return r.json(); })
            .then(function (roomsData) {
              if (roomsData.success) setRooms(roomsData.rooms || []);
              return fetch(API_BASE + '/api/businesses/' + data.business.id + '/gallery')
                .then(function (r) { return r.json(); })
                .then(function (galleryData) {
                  if (galleryData && galleryData.images) setGalleryImages(galleryData.images);
                  setLoading(false);
                });
            });
        } else {
          setError('Business not found');
          setLoading(false);
        }
      })
      .catch(function (err) {
        console.error('Fetch error:', err);
        setError('Could not load business');
        setLoading(false);
      });
  }

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
        React.createElement('button', { className: 'btn btn-primary', onClick: function () { navigate('/'); } }, 'Go Home')
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
  var badgeColor = business.business_type === 'hotel' ? '#4f46e5' : business.business_type === 'sports' ? '#059669' : '#d97706';

  return React.createElement('div', { style: { background: '#f5f7fb', minHeight: '100vh' } },

    // Header
    React.createElement('div', { className: 'app-header' },
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' } },
          business.logo_url && React.createElement('img', { 
            src: business.logo_url, 
            alt: business.name, 
            style: { width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', background: 'white', padding: '0.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } 
          }),
          React.createElement('div', null,
            React.createElement('h1', { style: { margin: 0, fontSize: '1.25rem' } }, business.name),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' } },
              React.createElement('span', { 
                style: { 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.25rem', 
                  background: badgeColor + '15', 
                  color: badgeColor, 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.7rem', 
                  fontWeight: '600' 
                } 
              }, badgeType),
              React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.7rem' } },
                React.createElement(MapPin, { size: 12 }), business.city + ', ' + business.state
              )
            )
          )
        )
      ),
      React.createElement('button', { 
        className: 'btn btn-secondary', 
        onClick: function () { navigate('/'); }, 
        style: { whiteSpace: 'nowrap' } 
      },
        React.createElement(ArrowLeft, { size: 16 }), ' Back'
      )
    ),

    // Hero Section
    React.createElement('div', { className: 'hero-section', style: { position: 'relative', height: '55vh', minHeight: '400px' } },
      React.createElement('div', { 
        className: 'hero-background', 
        style: { backgroundImage: 'url(' + getHeroImage() + ')' } 
      }),
      React.createElement('div', { className: 'hero-overlay', style: { background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' } }),
      React.createElement('div', { className: 'hero-content', style: { position: 'relative', zIndex: 2, padding: '1.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' } },
        business.logo_url && React.createElement('img', { 
          src: business.logo_url, 
          alt: business.name, 
          className: 'hero-logo',
          style: { 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px', 
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            background: 'white',
            padding: '4px'
          } 
        }),
        React.createElement('h1', { 
          className: 'hero-title', 
          style: { fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '-0.02em' } 
        }, business.name.split(' ').map(function(word, i) { 
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ')),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' } },
          React.createElement('span', { 
            style: { 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              background: 'rgba(0,0,0,0.5)', 
              backdropFilter: 'blur(8px)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.7rem', 
              color: 'white' 
            } 
          },
            React.createElement(MapPin, { size: 12 }), business.city + ', ' + business.state
          ),
          React.createElement('span', { 
            style: { 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              background: 'rgba(0,0,0,0.5)', 
              backdropFilter: 'blur(8px)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.7rem', 
              color: 'white' 
            } 
          },
            React.createElement(Star, { size: 12, fill: '#fbbf24', color: '#fbbf24' }), '4.9 · Premium Host'
          )
        ),
        React.createElement('p', { 
          className: 'hero-description',
          style: { color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }
        }, 
          (business.description || business.about_text || 'Experience luxury and comfort in the heart of the city')?.substring(0, 120) + '...'
        )
      )
    ),

    // Floating Date Picker
    business.business_type === 'hotel' && React.createElement('div', { className: 'floating-picker', style: { position: 'sticky', top: '1rem', zIndex: 100, display: 'flex', justifyContent: 'center', marginTop: '-1.5rem', marginBottom: '2rem' } },
      React.createElement('div', { className: 'picker-container', style: { background: 'white', borderRadius: '60px', padding: '0.75rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)' } },
        React.createElement('div', { className: 'picker-group', style: { textAlign: 'center' } },
          React.createElement('span', { className: 'picker-label', style: { fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', display: 'block' } }, 'Check-in'),
          React.createElement('input', { 
            type: 'date', 
            value: dateRange.checkIn, 
            onChange: function (e) { setDateRange({ ...dateRange, checkIn: e.target.value }); }, 
            className: 'picker-input',
            style: { border: 'none', fontSize: '0.9rem', fontWeight: '600', padding: '0.25rem 0', background: 'transparent', outline: 'none', textAlign: 'center' }
          })
        ),
        React.createElement('div', { className: 'picker-group', style: { textAlign: 'center' } },
          React.createElement('span', { className: 'picker-label', style: { fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', display: 'block' } }, 'Check-out'),
          React.createElement('input', { 
            type: 'date', 
            value: dateRange.checkOut, 
            onChange: function (e) { setDateRange({ ...dateRange, checkOut: e.target.value }); }, 
            className: 'picker-input',
            style: { border: 'none', fontSize: '0.9rem', fontWeight: '600', padding: '0.25rem 0', background: 'transparent', outline: 'none', textAlign: 'center' }
          })
        ),
        React.createElement('div', { className: 'picker-group', style: { textAlign: 'center', position: 'relative' } },
          React.createElement('span', { className: 'picker-label', style: { fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', display: 'block' } }, 'Guests'),
          React.createElement('button', { 
            onClick: function () { setShowGuestPicker(!showGuestPicker); }, 
            style: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' } 
          },
            React.createElement(Users, { size: 14 }), guests + ' guest' + (guests > 1 ? 's' : '')
          ),
          showGuestPicker && React.createElement('div', { 
            style: { 
              position: 'absolute', 
              top: '100%', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              marginTop: '0.5rem', 
              background: 'white', 
              borderRadius: '16px', 
              padding: '1rem', 
              boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)', 
              minWidth: '160px', 
              zIndex: 10,
              textAlign: 'center'
            } 
          },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' } },
              React.createElement('button', { 
                onClick: function () { setGuests(Math.max(1, guests - 1)); }, 
                style: { width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '18px' } 
              }, '-'),
              React.createElement('span', { style: { fontWeight: '600', fontSize: '16px' } }, guests),
              React.createElement('button', { 
                onClick: function () { setGuests(Math.min(20, guests + 1)); }, 
                style: { width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '18px' } 
              }, '+')
            ),
            React.createElement('button', { 
              onClick: function () { setShowGuestPicker(false); }, 
              style: { width: '100%', padding: '0.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' } 
            }, 'Apply')
          )
        )
      )
    ),

    // Main Content
    React.createElement('div', { className: 'app-container' },

      // Story Section
      (business.about_text || business.description) && React.createElement('div', { className: 'hotel-card', style: { marginBottom: '1.5rem', borderRadius: '24px' } },
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', letterSpacing: '-0.02em' } }, business.about_text ? 'Our Story' : 'About ' + business.name),
        React.createElement('p', { style: { color: '#475569', lineHeight: '1.7', marginBottom: '0.75rem', fontSize: '0.95rem' } },
          expandedStory 
            ? (business.about_text || business.description) 
            : (business.about_text || business.description || '').substring(0, 200) + ((business.about_text || business.description || '').length > 200 ? '...' : '')
        ),
        (business.about_text || business.description || '').length > 200 && React.createElement('button', {
          onClick: function () { setExpandedStory(!expandedStory); },
          style: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }
        }, expandedStory ? 'Show less' : 'Read more')
      ),

      // Gallery Section
      galleryImages.length > 0 && React.createElement('div', { style: { marginBottom: '2rem' } },
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', letterSpacing: '-0.02em' } }, 'Photo Gallery'),
        React.createElement('div', { className: 'booking-gallery-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' } },
          galleryImages.map(function (img, i) {
            return React.createElement('div', { 
              key: img.id, 
              className: 'booking-gallery-item', 
              onClick: function () { openLightbox(i); },
              style: { 
                borderRadius: '16px', 
                overflow: 'hidden', 
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                aspectRatio: '4/3'
              },
              onMouseEnter: function(e) { 
                e.currentTarget.style.transform = 'scale(1.02)'; 
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15)';
              },
              onMouseLeave: function(e) { 
                e.currentTarget.style.transform = 'scale(1)'; 
                e.currentTarget.style.boxShadow = 'none';
              }
            },
              React.createElement('img', { 
                src: img.image_url, 
                alt: img.file_name || 'Gallery ' + (i + 1), 
                className: 'booking-gallery-image', 
                style: { width: '100%', height: '100%', objectFit: 'cover' },
                loading: 'lazy' 
              })
            );
          })
        )
      ),

      // Rooms Section
      business.business_type === 'hotel' && React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', letterSpacing: '-0.02em' } }, 'Available Rooms'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
          availableRooms.length === 0 && React.createElement('div', { className: 'empty-state', style: { textAlign: 'center', padding: '3rem' } },
            React.createElement('p', null, 'No rooms available at the moment.')
          ),
          availableRooms.map(function (room) {
            return React.createElement('div', { 
              key: room.id, 
              style: { 
                background: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap'
              },
              onMouseEnter: function(e) { 
                e.currentTarget.style.transform = 'translateY(-4px)'; 
                e.currentTarget.style.boxShadow = '0 20px 30px -12px rgba(0,0,0,0.15)';
              },
              onMouseLeave: function(e) { 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }
            },
              React.createElement('div', { 
                style: { 
                  width: '280px', 
                  flexShrink: 0, 
                  position: 'relative',
                  background: '#f1f5f9'
                } 
              },
                React.createElement('img', { 
                  src: getRoomImage(room.name), 
                  alt: room.name, 
                  style: { width: '100%', height: '100%', objectFit: 'cover', minHeight: '240px' } 
                }),
                React.createElement('div', { 
                  style: { 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem', 
                    background: 'rgba(0,0,0,0.8)', 
                    backdropFilter: 'blur(8px)', 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '40px', 
                    fontWeight: '700', 
                    fontSize: '0.9rem' 
                  } 
                },
                  formatPrice(room.price_per_night),
                  React.createElement('span', { style: { fontSize: '0.65rem', fontWeight: 'normal' } }, ' / night')
                )
              ),
              React.createElement('div', { style: { flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' } },
                  React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: '700', margin: 0, letterSpacing: '-0.01em' } }, room.name),
                  React.createElement('span', { 
                    style: { 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '40px', 
                      fontSize: '0.7rem', 
                      fontWeight: '600',
                      background: room.status === 'available' ? '#d1fae5' : '#fee2e2',
                      color: room.status === 'available' ? '#065f46' : '#991b1b'
                    } 
                  }, room.status)
                ),
                React.createElement('div', { style: { display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap' } },
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem' } }, 
                    React.createElement(Bed, { size: 12 }), ' ' + room.capacity + ' guests'
                  ),
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem' } }, 
                    React.createElement(Star, { size: 12, fill: '#fbbf24', color: '#fbbf24' }), ' 4.9'
                  ),
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem' } }, 
                    React.createElement(Home, { size: 12 }), ' ' + (room.type || 'Standard')
                  )
                ),
                React.createElement('p', { style: { color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.6' } }, 
                  room.description || 'Comfortable space with modern amenities, perfect for your stay.'
                ),
                React.createElement('div', { style: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' } },
                  React.createElement('div', { style: { width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' } }, 
                    React.createElement(Wifi, { size: 16 })
                  ),
                  React.createElement('div', { style: { width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' } }, 
                    React.createElement(Coffee, { size: 16 })
                  ),
                  React.createElement('div', { style: { width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' } }, 
                    React.createElement(Tv, { size: 16 })
                  ),
                  React.createElement('div', { style: { width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' } }, 
                    React.createElement(Bath, { size: 16 })
                  ),
                  room.capacity > 2 && React.createElement('div', { style: { width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' } }, 
                    React.createElement(Users, { size: 16 })
                  )
                ),
                React.createElement('button', {
                  onClick: function (e) { 
                    e.preventDefault();
                    handleBookNow(room);
                  },
                  className: 'btn btn-primary',
                  style: { 
                    alignSelf: 'flex-start', 
                    padding: '0.875rem 1.75rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    borderRadius: '40px',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    border: 'none',
                    color: 'white',
                    transition: 'all 0.2s ease'
                  },
                  onMouseEnter: function(e) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(79,70,229,0.35)';
                  },
                  onMouseLeave: function(e) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }, 'Book Now →')
              )
            );
          })
        )
      ),

      // Sports/Event CTA
      business.business_type !== 'hotel' && React.createElement('div', { className: 'hotel-card', style: { textAlign: 'center', marginTop: '1.5rem', borderRadius: '24px', padding: '2rem' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' } },
          business.business_type === 'sports' 
            ? React.createElement(Trophy, { size: 48, color: '#4f46e5', strokeWidth: 1.5 })
            : React.createElement(Sparkles, { size: 48, color: '#4f46e5', strokeWidth: 1.5 })
        ),
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '-0.02em' } }, 
          business.business_type === 'sports' ? 'Ready to Play?' : 'Ready to Celebrate?'
        ),
        React.createElement('p', { style: { color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' } }, 
          'Select your date and time to get started with your booking.'
        ),
        React.createElement('button', { 
          className: 'btn btn-primary', 
          onClick: function () { setBookingStarted(true); }, 
          style: { 
            padding: '0.875rem 2rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            borderRadius: '40px',
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          },
          onMouseEnter: function(e) {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(79,70,229,0.35)';
          },
          onMouseLeave: function(e) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }
        },
          business.business_type === 'sports' ? 'Book a Court →' : 'Plan Your Event →'
        ),
        React.createElement('p', { style: { color: '#94a3b8', fontSize: '0.7rem', marginTop: '1rem' } }, 
          'No payment required to book'
        )
      )
    ),

    // Lightbox
    lightboxOpen && React.createElement('div', { className: 'lightbox-backdrop', onClick: closeLightbox, style: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' } },
      React.createElement('div', { className: 'lightbox-container', onClick: function (e) { e.stopPropagation(); }, style: { position: 'relative', maxWidth: '90vw', maxHeight: '85vh' } },
        React.createElement('button', { className: 'lightbox-close', onClick: closeLightbox, style: { position: 'absolute', top: '-3rem', right: 0, width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, React.createElement(X, { size: 24 })),
        React.createElement('button', { 
          className: 'lightbox-nav', 
          onClick: goToPrev, 
          style: { position: 'absolute', top: '50%', left: '-3rem', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '2.5rem', height: '2.5rem', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' } 
        }, React.createElement(ChevronLeft, { size: 28 })),
        React.createElement('img', { 
          src: galleryImages[lightboxIndex] ? galleryImages[lightboxIndex].image_url : '', 
          alt: 'Gallery', 
          className: 'lightbox-image', 
          style: { maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px' } 
        }),
        React.createElement('button', { 
          className: 'lightbox-nav', 
          onClick: goToNext, 
          style: { position: 'absolute', top: '50%', right: '-3rem', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '2.5rem', height: '2.5rem', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' } 
        }, React.createElement(ChevronRight, { size: 28 })),
        React.createElement('div', { 
          style: { position: 'absolute', bottom: '-2.5rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' } 
        }, (lightboxIndex + 1) + ' / ' + galleryImages.length)
      )
    ),

    // Booking Modal - Single Modal Flow
    showBookingForm && selectedRoom && React.createElement(BookingFormModal, {
      business: business,
      room: selectedRoom,
      dateRange: dateRange,
      guests: guests,
      onClose: function () { setShowBookingForm(false); },
      onSuccess: function () { setShowBookingForm(false); },
      API_BASE: API_BASE,
      formatPrice: formatPrice,
      businessName: business.name
    })
  );
}

// ============================================================
// SINGLE MODAL FLOW - Complete Booking + Payment Choice in One Modal
// ============================================================

function BookingFormModal({ business, room, dateRange, guests, onClose, onSuccess, API_BASE, formatPrice, businessName }) {
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

  React.useEffect(function() {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    window.addEventListener('resize', handleResize);
    return function() { window.removeEventListener('resize', handleResize); };
  }, []);

  // Prevent body scroll when modal is open
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

  // Create booking function - called after user chooses payment method
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
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json(); 
      })
      .then(function (data) {
        if (data.success && data.booking) {
          setCreatedBooking(data.booking);
          setIsCreatingBooking(false);
          
          if (paymentMethod === 'venue') {
            // Pay at Venue - show receipt immediately
            setPaymentReceipt({
              bookingReference: data.booking.booking_reference,
              paymentMethod: 'Pay at Venue',
              amountPaid: totalAmount,
              paidAt: new Date().toLocaleString()
            });
            setShowReceipt(true);
          } else if (paymentMethod === 'card') {
            // Pay with Card - show Paystack
            setShowPaystack(true);
          }
        } else {
          alert('Failed to create booking. Please try again.');
          setIsCreatingBooking(false);
        }
      })
      .catch(function (err) { 
        console.error('Create booking error:', err);
        alert('Something went wrong. Please try again.'); 
        setIsCreatingBooking(false);
      });
  }

  // Load Paystack script when needed
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

  // Receipt Modal
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
      formatPrice: formatPrice
    });
  }

  // Modal overlay styles
  var modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  };

  var modalContentStyle = {
    maxWidth: isDesktop ? '520px' : '500px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    overflow: 'hidden',
    background: 'white',
    borderRadius: '28px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative',
    maxHeight: isDesktop ? '90vh' : '85vh',
    height: 'auto'
  };

  var contentContainerStyle = {
    flex: 1,
    padding: isDesktop ? '20px 24px' : '24px',
    overflowY: 'auto'
  };

  // Show Paystack payment UI
  if (showPaystack && createdBooking && !showReceipt) {
    return React.createElement('div', { className: 'modal-overlay', onClick: onClose, style: modalOverlayStyle },
      React.createElement('div', { 
        className: 'modal-content', 
        onClick: function (e) { e.stopPropagation(); },
        style: modalContentStyle
      },
        React.createElement('div', { style: { 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: isDesktop ? '16px 24px' : '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        } },
          React.createElement('div', null,
            React.createElement('h3', { style: { margin: 0, fontSize: '1rem', fontWeight: '600', opacity: 0.9 } }, 'Complete Payment'),
            React.createElement('p', { style: { margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.8 } }, room.name)
          ),
          React.createElement('button', { 
            onClick: function() { setShowPaystack(false); },
            style: { background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }
          }, React.createElement(X, { size: 20 }))
        ),
        React.createElement('div', { style: { padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('span', { style: { fontSize: '0.85rem', color: '#64748b' } }, 'Total to pay'),
            React.createElement('span', { style: { fontSize: '1.5rem', fontWeight: '800', color: '#4f46e5' } }, formatPrice(totalAmount))
          )
        ),
        React.createElement('div', { style: { padding: '24px' } },
          !paystackLoaded ?
            React.createElement('div', { style: { textAlign: 'center', padding: '20px' } },
              React.createElement(Loader, { size: 32, style: { animation: 'spin 1s linear infinite', margin: '0 auto', color: '#4f46e5' } }),
              React.createElement('p', { style: { marginTop: '12px', fontSize: '14px', color: '#64748b' } }, 'Loading payment gateway...')
            )
          :
            React.createElement('div', null,
              paymentError && React.createElement('div', { style: { marginBottom: '16px', padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '12px', fontSize: '14px' } }, paymentError),
              React.createElement('button', {
                onClick: handlePaystackPayment,
                disabled: isPaying,
                style: {
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  border: 'none',
                  borderRadius: '40px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: isPaying ? 'not-allowed' : 'pointer',
                  opacity: isPaying ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }
              },
                React.createElement(CreditCard, { size: 18 }),
                isPaying ? 'Processing...' : 'Pay ' + formatPrice(totalAmount) + ' Now'
              ),
              React.createElement('button', {
                onClick: function() { setShowPaystack(false); },
                style: {
                  width: '100%',
                  padding: '14px',
                  marginTop: '12px',
                  background: 'white',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '40px',
                  color: '#64748b',
                  fontWeight: '500',
                  cursor: 'pointer'
                }
              }, 'Back to Pay at Venue')
            )
        )
      )
    );
  }

  // Main Booking Form with Payment Options
  return React.createElement('div', { 
    className: 'modal-overlay', 
    onClick: onClose, 
    style: modalOverlayStyle
  },
    React.createElement('div', { 
      className: 'modal-content', 
      onClick: function (e) { e.stopPropagation(); },
      style: modalContentStyle
    },
      // Header
      React.createElement('div', { style: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: isDesktop ? '16px 24px' : '20px 24px',
        borderBottom: '1px solid #e2e8f0',
        background: 'white',
        flexShrink: 0
      } },
        React.createElement('h3', { style: { margin: 0, fontSize: isDesktop ? '1.1rem' : '1.25rem', fontWeight: '700', color: '#0f172a' } }, 'Complete Your Booking'),
        React.createElement('button', { 
          onClick: onClose, 
          style: { 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: '8px', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8'
          }
        }, React.createElement(X, { size: 20 }))
      ),
      
      // Content
      React.createElement('div', { style: contentContainerStyle },
        // Booking Summary Card
        React.createElement('div', { style: { 
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
          padding: isDesktop ? '12px' : '16px', 
          borderRadius: '16px', 
          marginBottom: isDesktop ? '16px' : '20px' 
        } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' } },
            React.createElement('div', { style: { width: isDesktop ? '40px' : '48px', height: isDesktop ? '40px' : '48px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Bed, { size: isDesktop ? 20 : 24, color: '#4f46e5' })
            ),
            React.createElement('div', null,
              React.createElement('h4', { style: { fontWeight: '700', fontSize: isDesktop ? '0.95rem' : '1rem', margin: 0, color: '#0f172a' } }, room.name),
              React.createElement('p', { style: { fontSize: '0.7rem', color: '#64748b', margin: 0 } }, room.type || 'Standard')
            )
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' } },
            React.createElement('div', null,
              React.createElement('span', { style: { fontSize: '0.65rem', color: '#94a3b8', display: 'block' } }, 'Check-in'),
              React.createElement('span', { style: { fontSize: isDesktop ? '0.8rem' : '0.85rem', fontWeight: '600', color: '#0f172a' } }, new Date(dateRange.checkIn).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }))
            ),
            React.createElement('div', null,
              React.createElement('span', { style: { fontSize: '0.65rem', color: '#94a3b8', display: 'block' } }, 'Check-out'),
              React.createElement('span', { style: { fontSize: isDesktop ? '0.8rem' : '0.85rem', fontWeight: '600', color: '#0f172a' } }, new Date(dateRange.checkOut).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }))
            ),
            React.createElement('div', null,
              React.createElement('span', { style: { fontSize: '0.65rem', color: '#94a3b8', display: 'block' } }, 'Guests'),
              React.createElement('span', { style: { fontSize: isDesktop ? '0.8rem' : '0.85rem', fontWeight: '600', color: '#0f172a' } }, guests + ' guest' + (guests > 1 ? 's' : ''))
            )
          ),
          React.createElement('div', { style: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '12px',
            marginTop: '8px',
            borderTop: '1px solid #e2e8f0'
          } },
            React.createElement('span', { style: { fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' } }, 'Total Amount'),
            React.createElement('span', { style: { fontSize: isDesktop ? '1.2rem' : '1.25rem', fontWeight: '800', color: '#4f46e5' } }, formatPrice(totalAmount))
          )
        ),
        
        // Customer Form
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: isDesktop ? '12px' : '16px', marginBottom: isDesktop ? '20px' : '24px' } },
          React.createElement('input', { 
            type: 'text', 
            placeholder: 'Full Name *', 
            value: formData.name, 
            onChange: function (e) { setFormData({ ...formData, name: e.target.value }); }, 
            style: { 
              width: '100%',
              padding: isDesktop ? '12px 16px' : '14px 16px', 
              border: '1.5px solid #e2e8f0', 
              borderRadius: '14px', 
              fontSize: isDesktop ? '0.85rem' : '0.9rem',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s'
            },
            onFocus: function(e) { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
            onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
          }),
          React.createElement('input', { 
            type: 'email', 
            placeholder: 'Email Address *', 
            value: formData.email, 
            onChange: function (e) { setFormData({ ...formData, email: e.target.value }); }, 
            style: { 
              width: '100%',
              padding: isDesktop ? '12px 16px' : '14px 16px', 
              border: '1.5px solid #e2e8f0', 
              borderRadius: '14px', 
              fontSize: isDesktop ? '0.85rem' : '0.9rem',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s'
            },
            onFocus: function(e) { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
            onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
          }),
          React.createElement('input', { 
            type: 'tel', 
            placeholder: 'Phone Number *', 
            value: formData.phone, 
            onChange: function (e) { setFormData({ ...formData, phone: e.target.value }); }, 
            style: { 
              width: '100%',
              padding: isDesktop ? '12px 16px' : '14px 16px', 
              border: '1.5px solid #e2e8f0', 
              borderRadius: '14px', 
              fontSize: isDesktop ? '0.85rem' : '0.9rem',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s'
            },
            onFocus: function(e) { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
            onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
          }),
          React.createElement('textarea', { 
            placeholder: 'Special Requests (optional)', 
            value: formData.specialRequests, 
            onChange: function (e) { setFormData({ ...formData, specialRequests: e.target.value }); }, 
            rows: 2, 
            style: { 
              width: '100%',
              padding: isDesktop ? '12px 16px' : '14px 16px', 
              border: '1.5px solid #e2e8f0', 
              borderRadius: '14px', 
              fontSize: isDesktop ? '0.85rem' : '0.9rem', 
              fontFamily: 'inherit', 
              resize: 'vertical',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s'
            },
            onFocus: function(e) { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; },
            onBlur: function(e) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
          })
        ),
        
        // Payment Options
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
          // Pay at Venue - Primary Button
          React.createElement('button', {
            onClick: function () { createAndProcessBooking('venue'); },
            disabled: isCreatingBooking,
            style: {
              width: '100%',
              padding: isDesktop ? '16px' : '18px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '40px',
              color: 'white',
              fontSize: isDesktop ? '0.95rem' : '1rem',
              fontWeight: '600',
              cursor: isCreatingBooking ? 'not-allowed' : 'pointer',
              opacity: isCreatingBooking ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s ease'
            },
            onMouseEnter: function(e) {
              if (!isCreatingBooking) {
                e.currentTarget.style.transform = 'scale(1.01)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16,185,129,0.3)';
              }
            },
            onMouseLeave: function(e) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }
          },
            React.createElement(Building2, { size: 20 }),
            isCreatingBooking ? 'Processing...' : 'Pay at Venue'
          ),
          
          // Divider
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' } },
            React.createElement('div', { style: { flex: 1, height: '1px', background: '#e2e8f0' } }),
            React.createElement('span', { style: { fontSize: '12px', color: '#94a3b8' } }, 'or pay online'),
            React.createElement('div', { style: { flex: 1, height: '1px', background: '#e2e8f0' } })
          ),
          
          // Pay with Card - Secondary Button
          React.createElement('button', {
            onClick: function () { createAndProcessBooking('card'); },
            disabled: isCreatingBooking,
            style: {
              width: '100%',
              padding: isDesktop ? '14px' : '16px',
              background: 'white',
              border: '1.5px solid #e2e8f0',
              borderRadius: '40px',
              color: '#475569',
              fontSize: isDesktop ? '0.9rem' : '0.95rem',
              fontWeight: '500',
              cursor: isCreatingBooking ? 'not-allowed' : 'pointer',
              opacity: isCreatingBooking ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            },
            onMouseEnter: function(e) {
              if (!isCreatingBooking) {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'scale(1.01)';
              }
            },
            onMouseLeave: function(e) {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'scale(1)';
            }
          },
            React.createElement(CreditCard, { size: 18 }),
            'Pay with Card'
          )
          // REMOVED: Footer note text "No payment required now for Pay at Venue — pay when you arrive"
        )
      )
    )
  );
}

// ============================================================
// RECEIPT MODAL COMPONENT - Clean & Professional
// ============================================================

function ReceiptModal({ receipt, booking, room, dateRange, guests, businessName, onClose, onSuccess, formatPrice }) {
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

  var nights = dateRange.checkIn && dateRange.checkOut 
    ? Math.ceil((new Date(dateRange.checkOut) - new Date(dateRange.checkIn)) / (1000 * 60 * 60 * 24))
    : 1;

  return React.createElement('div', { 
    className: 'modal-overlay', 
    onClick: function() { if (!isClosing) handleDone(); },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }
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
        borderRadius: '28px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxHeight: 'none',
        height: 'auto'
      } 
    },
      // Success Header
      React.createElement('div', { style: { 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: isDesktop ? '28px 24px' : '32px 24px',
        textAlign: 'center',
        color: 'white',
        borderRadius: '28px 28px 0 0'
      } },
        React.createElement('div', { style: { 
          width: '64px', 
          height: '64px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 16px'
        } },
          React.createElement(Check, { size: 32, strokeWidth: 2 })
        ),
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' } }, 'Booking Confirmed!'),
        React.createElement('p', { style: { fontSize: '0.9rem', opacity: 0.9, margin: 0 } }, 
          receipt.paymentMethod === 'Pay at Venue' 
            ? 'Your booking has been confirmed. Pay upon arrival.'
            : 'Payment successful! Your booking is confirmed.'
        )
      ),
      
      // Receipt Content
      React.createElement('div', { id: 'receipt-content', style: { padding: '24px' } },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' } },
          React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '700', marginBottom: '4px', color: '#0f172a' } }, businessName),
          React.createElement('p', { style: { fontSize: '0.7rem', color: '#94a3b8' } }, 'Booking Confirmation')
        ),
        
        React.createElement('div', { style: { 
          background: '#f8fafc', 
          padding: '12px', 
          borderRadius: '12px', 
          textAlign: 'center',
          marginBottom: '24px'
        } },
          React.createElement('p', { style: { fontSize: '0.65rem', color: '#64748b', marginBottom: '4px' } }, 'Booking Reference'),
          React.createElement('p', { style: { fontSize: '0.9rem', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '1px', color: '#0f172a' } }, receipt.bookingReference)
        ),
        
        booking && React.createElement('div', { style: { marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px' } },
          React.createElement('p', { style: { fontSize: '0.7rem', fontWeight: '600', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 'Customer Details'),
          React.createElement('p', { style: { fontSize: '0.85rem', fontWeight: '500', color: '#0f172a', marginBottom: '4px' } }, booking.customer_name),
          React.createElement('p', { style: { fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' } }, booking.customer_email),
          React.createElement('p', { style: { fontSize: '0.75rem', color: '#64748b' } }, booking.customer_phone)
        ),
        
        React.createElement('div', { style: { 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '16px',
          marginTop: '8px',
          borderTop: '2px solid #4f46e5'
        } },
          React.createElement('span', { style: { fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' } }, 'Total ' + (receipt.paymentMethod === 'Pay at Venue' ? 'to pay' : 'paid')),
          React.createElement('span', { style: { fontSize: '1.25rem', fontWeight: '800', color: receipt.paymentMethod === 'Pay at Venue' ? '#d97706' : '#10b981' } }, formatPrice(receipt.amountPaid))
        ),
        
        React.createElement('p', { style: { fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' } }, 
          receipt.paymentMethod === 'Pay at Venue' 
            ? 'A confirmation email has been sent. Please pay upon arrival.'
            : 'A confirmation email has been sent to your email address.'
        )
      ),
      
      // Footer Buttons
      React.createElement('div', { style: { 
        padding: '16px 24px 24px',
        display: 'flex',
        gap: '12px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
        borderRadius: '0 0 28px 28px'
      } },
        React.createElement('button', { 
          onClick: handleDownload, 
          style: { 
            flex: 1, 
            padding: '12px',
            background: 'white',
            border: '1.5px solid #e2e8f0',
            borderRadius: '40px',
            color: '#475569',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          },
          onMouseEnter: function(e) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; },
          onMouseLeave: function(e) { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }
        }, React.createElement(Download, { size: 16 }), 'Receipt'),
        React.createElement('button', { 
          onClick: handleDone, 
          style: { 
            flex: 1, 
            padding: '12px', 
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            border: 'none',
            borderRadius: '40px',
            color: 'white',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer'
          },
          onMouseEnter: function(e) { e.currentTarget.style.transform = 'scale(1.01)'; },
          onMouseLeave: function(e) { e.currentTarget.style.transform = 'scale(1)'; }
        }, 'Done')
      )
    )
  );
}

export default UnifiedBookingPage;