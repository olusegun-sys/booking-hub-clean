// FILE: client/src/HostLanding.jsx
// UPDATED 19 Sept 2026: Repositioned for Stays/Food/Others (was event-venue-only)
// UPDATED 19 Sept 2026: 6 new slideshow images added (13 total)
// UPDATED 19 Sept 2026: Staff Management card → Instant Notifications
// UPDATED 19 Sept 2026: Footer email → hello@myplazzaa.com
// NOTE: Brand name still "BookingHub" — logo swap pending from Emmanuel

import React, { useState, useEffect } from 'react';
import { 
  Building2, ArrowRight, CheckCircle, Star, Users, Calendar, 
  DollarSign, Shield, Clock, Smartphone, Globe, Zap, 
  Menu, X, TrendingUp, Wallet, Headphones, Sparkles,
  Mail, Phone, MapPin, ChevronLeft, ChevronRight, ArrowLeft,
  Crown, Gem, Rocket, PartyPopper, Music, Cake, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function HostLanding() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showArrows, setShowArrows] = useState(false);

  // ============================================================
  // SLIDESHOW IMAGES — Mixed across Stays, Food, Others
  // 7 existing event/venue images + 6 new images across categories
  // ============================================================
  const slides = [
    // Existing event venue images
    { 
      url: 'https://apartments.ng/oc-content/plugins/blog/img/blog/1012.jpg', 
      alt: 'Luxury venue in Lagos with elegant decor for weddings and parties' 
    },
    { 
      url: 'https://paradiseeventarena.com.ng/images/event4.jpg', 
      alt: 'Beautiful event hall with stage and seating for corporate events and celebrations' 
    },
    { 
      url: 'https://images.squarespace-cdn.com/content/v1/5de6af362625a4608a2aff63/f99364bc-2713-4254-9145-6eb75a51b951/thecondolagos_1724016048899.jpeg', 
      alt: 'The Condo Lagos - Modern event space with contemporary design' 
    },
    { 
      url: 'https://i0.wp.com/outravelandtour.com/wp-content/uploads/2025/05/unnamed-7.webp?fit=786%2C561&ssl=1', 
      alt: 'Nigerian wedding reception setup with traditional decor and ambiance' 
    },
    { 
      url: 'https://kehfpqtovuullzvenhgr.supabase.co/storage/v1/object/public/blog-media/mpgynhtv-wrksm-6d4e8161e4e1f98c701208b8e4f20063.webp', 
      alt: 'Luxury venue with chandeliers and premium seating arrangements' 
    },
    { 
      url: 'https://apartments.ng/oc-content/plugins/blog/img/blog/1012.jpg', 
      alt: 'Elegant celebration venue with modern finishes and ambient lighting' 
    },
    { 
      url: 'https://paradiseeventarena.com.ng/images/event4.jpg', 
      alt: 'Spacious event hall with professional stage setup for conferences and galas' 
    },
    // NEW — Stays
    { 
      url: 'https://image-tc.galaxy.tf/wijpeg-dpc83c0rm760hobndf6les3wk/file.jpg', 
      alt: 'Modern hotel room with comfortable furnishings' 
    },
    // NEW — Food
    { 
      url: 'https://images.jdmagicbox.com/v2/comp/kolkata/s1/033pxx33.xx33.251029132716.e1s1/catalogue/sab-cafe-and-restaurant-belgharia-kolkata-restaurants-j5q0ve4g0k.jpg', 
      alt: 'Café and restaurant interior with warm seating' 
    },
    { 
      url: 'https://copperandashdesign.com/wp-content/uploads/2024/07/g-restaurant-1.jpg', 
      alt: 'Restaurant dining space with modern decor' 
    },
    // NEW — Others (Spa / Sports)
    { 
      url: 'https://s3-media0.fl.yelpcdn.com/bphoto/8I-EWHCn5r9ej8jZaoB7yg/l.jpg', 
      alt: 'Spa treatment room with calming ambiance' 
    },
    { 
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3ggMTUN2DW27NXqv3DMCl7fPfA88B5_L_AAtbLgqgV2kwJXFsk3H9JCg&s=10', 
      alt: 'Modern salon or activity space' 
    },
    { 
      url: 'https://courtsunlimitedut.com/wp-content/uploads/2024/04/Outdoor-Basketball-Court-Costs.jpg', 
      alt: 'Outdoor sports court ready for bookings' 
    }
  ];

  const goBackToHome = () => {
    navigate('/', { replace: false });
  };

  useEffect(function() {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return function() { window.removeEventListener('resize', handleResize); };
  }, []);

  useEffect(function() {
    var interval = setInterval(function() {
      setCurrentSlide(function(prev) {
        return (prev + 1) % slides.length;
      });
    }, 5000);
    return function() { clearInterval(interval); };
  }, [slides.length]);

  const goToSlide = function(index) {
    setCurrentSlide(index);
  };

  const nextSlide = function() {
    setCurrentSlide(function(prev) { return (prev + 1) % slides.length; });
  };

  const prevSlide = function() {
    setCurrentSlide(function(prev) { return (prev - 1 + slides.length) % slides.length; });
  };

  const scrollToSection = function(id) {
    var element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Styles
  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid #e2e8f0',
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255,255,255,0.95)'
  };

  const containerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: isDesktop ? '0 32px' : '0 20px'
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isDesktop ? '20px 0' : '16px 0'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: isDesktop ? '24px' : '20px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    cursor: 'pointer'
  };

  const backButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const desktopNavStyle = {
    display: isDesktop ? 'flex' : 'none',
    gap: '32px',
    alignItems: 'center'
  };

  const mobileMenuButtonStyle = {
    display: isDesktop ? 'none' : 'flex',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px'
  };

  const mobileMenuStyle = {
    display: mobileMenuOpen ? 'flex' : 'none',
    flexDirection: 'column',
    backgroundColor: 'white',
    padding: '20px',
    gap: '16px',
    borderTop: '1px solid #e2e8f0'
  };

  const ctaButtonStyle = {
    padding: isDesktop ? '12px 28px' : '10px 20px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: isDesktop ? '15px' : '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none'
  };

  const secondaryButtonStyle = {
    padding: isDesktop ? '12px 28px' : '10px 20px',
    backgroundColor: 'white',
    color: '#4f46e5',
    border: '2px solid #4f46e5',
    borderRadius: '40px',
    fontSize: isDesktop ? '15px' : '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none'
  };

  return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#ffffff' } },
    // Header
    React.createElement('header', { style: headerStyle },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: navStyle },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
            React.createElement('button', { 
              onClick: goBackToHome, 
              style: backButtonStyle,
              onMouseEnter: function(e) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#4f46e5'; },
              onMouseLeave: function(e) { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }
            },
              React.createElement(ArrowLeft, { size: 16 }),
              'Back to Home'
            ),
            React.createElement('div', { style: logoStyle, onClick: goBackToHome },
              React.createElement(Building2, { size: isDesktop ? 28 : 24, color: '#4f46e5' }),
              React.createElement('span', null, 'BookingHub')
            )
          ),
          React.createElement('div', { style: desktopNavStyle },
            React.createElement('button', { onClick: function() { scrollToSection('features'); }, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '500', color: '#475569' } }, 'Features'),
            React.createElement('button', { onClick: function() { scrollToSection('pricing'); }, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '500', color: '#475569' } }, 'Pricing'),
            React.createElement('button', { onClick: function() { scrollToSection('testimonials'); }, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '500', color: '#475569' } }, 'Testimonials'),
            React.createElement('a', { href: '/login', style: { ...secondaryButtonStyle, padding: '8px 20px' } }, 'Sign In'),
            React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, padding: '8px 20px' } }, 'Get Started')
          ),
          React.createElement('button', { onClick: function() { setMobileMenuOpen(!mobileMenuOpen); }, style: mobileMenuButtonStyle },
            mobileMenuOpen ? React.createElement(X, { size: 24 }) : React.createElement(Menu, { size: 24 })
          )
        ),
        React.createElement('div', { style: mobileMenuStyle },
          React.createElement('button', { onClick: function() { scrollToSection('features'); }, style: { background: 'none', border: 'none', cursor: 'pointer', padding: '12px', textAlign: 'left', fontSize: '16px' } }, 'Features'),
          React.createElement('button', { onClick: function() { scrollToSection('pricing'); }, style: { background: 'none', border: 'none', cursor: 'pointer', padding: '12px', textAlign: 'left', fontSize: '16px' } }, 'Pricing'),
          React.createElement('button', { onClick: function() { scrollToSection('testimonials'); }, style: { background: 'none', border: 'none', cursor: 'pointer', padding: '12px', textAlign: 'left', fontSize: '16px' } }, 'Testimonials'),
          React.createElement('a', { href: '/login', style: { display: 'block', textAlign: 'center', padding: '12px', borderTop: '1px solid #e2e8f0', color: '#475569', textDecoration: 'none' } }, 'Sign In'),
          React.createElement('a', { href: '/signup', style: { display: 'block', textAlign: 'center', padding: '12px', backgroundColor: '#4f46e5', color: 'white', borderRadius: '40px', fontWeight: '600', textDecoration: 'none' } }, 'Get Started →')
        )
      )
    ),

    // Hero Section
    React.createElement('section', { style: { backgroundColor: '#f8fafc', paddingTop: isDesktop ? '60px' : '40px', paddingBottom: isDesktop ? '60px' : '40px' } },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: { textAlign: 'center', maxWidth: '800px', margin: '0 auto' } },
          React.createElement('div', { style: { 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: '#eef2ff', 
            padding: '8px 16px', 
            borderRadius: '40px',
            marginBottom: '24px'
          } },
            React.createElement(Sparkles, { size: 16, color: '#4f46e5' }),
            React.createElement('span', { style: { fontSize: '13px', fontWeight: '600', color: '#4f46e5' } }, 'Trusted by 200+ Nigerian businesses')
          ),
          React.createElement('h1', { style: { 
            fontSize: isDesktop ? '56px' : '36px', 
            fontWeight: '800', 
            lineHeight: '1.2',
            marginBottom: '20px',
            color: '#0f172a'
          } }, 
            'The all-in-one platform for ',
            React.createElement('span', { style: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'businesses'),
            ' in Nigeria'
          ),
          React.createElement('p', { style: { 
            fontSize: isDesktop ? '20px' : '16px', 
            color: '#475569', 
            lineHeight: '1.6',
            marginBottom: '32px'
          } }, 
            'Accept bookings, manage orders, appointments, and stays — all on your own domain. First 50 bookings free.'
          ),
          React.createElement('div', { style: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' } },
            React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, padding: isDesktop ? '14px 32px' : '12px 24px', fontSize: isDesktop ? '16px' : '14px' } }, 'Get Started →'),
            React.createElement('a', { href: '#features', style: { ...secondaryButtonStyle, padding: isDesktop ? '14px 32px' : '12px 24px', fontSize: isDesktop ? '16px' : '14px' } }, 'Learn More')
          )
        ),
        // Slideshow
        React.createElement('div', { 
          style: { marginTop: '48px', position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)' },
          onMouseEnter: function() { setShowArrows(true); },
          onMouseLeave: function() { setShowArrows(false); }
        },
          React.createElement('div', { style: { position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#e2e8f0' } },
            slides.map(function(slide, index) {
              var isActive = index === currentSlide;
              return React.createElement('img', {
                key: index,
                src: slide.url,
                alt: slide.alt,
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }
              });
            })
          ),
          showArrows && React.createElement('button', {
            onClick: prevSlide,
            style: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', zIndex: 10 }
          }, React.createElement(ChevronLeft, { size: 20, color: '#1e293b' })),
          showArrows && React.createElement('button', {
            onClick: nextSlide,
            style: { position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', zIndex: 10 }
          }, React.createElement(ChevronRight, { size: 20, color: '#1e293b' })),
          React.createElement('div', { style: { position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 } },
            slides.map(function(_, index) {
              var isActive = index === currentSlide;
              return React.createElement('button', {
                key: index,
                onClick: function() { goToSlide(index); },
                style: { width: isActive ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: isActive ? '#4f46e5' : 'rgba(255,255,255,0.6)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }
              });
            })
          )
        )
      )
    ),

    // Stats Section
    React.createElement('section', { style: { padding: isDesktop ? '60px 0' : '40px 0', backgroundColor: 'white' } },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: isDesktop ? '32px' : '24px', textAlign: 'center' } },
          React.createElement('div', null, React.createElement('div', { style: { fontSize: isDesktop ? '36px' : '32px', fontWeight: '800', color: '#4f46e5' } }, '200+'), React.createElement('p', { style: { fontSize: '14px', color: '#64748b', marginTop: '8px' } }, 'Active Businesses')),
          React.createElement('div', null, React.createElement('div', { style: { fontSize: isDesktop ? '36px' : '32px', fontWeight: '800', color: '#4f46e5' } }, '5,000+'), React.createElement('p', { style: { fontSize: '14px', color: '#64748b', marginTop: '8px' } }, 'Monthly Bookings Processed')),
          React.createElement('div', null, React.createElement('div', { style: { fontSize: isDesktop ? '36px' : '32px', fontWeight: '800', color: '#4f46e5' } }, '₦250M+'), React.createElement('p', { style: { fontSize: '14px', color: '#64748b', marginTop: '8px' } }, 'Revenue Tracked'))
        )
      )
    ),

    // Features Section
    React.createElement('section', { id: 'features', style: { padding: isDesktop ? '80px 0' : '60px 0', backgroundColor: '#f8fafc' } },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '48px' } },
          React.createElement('h2', { style: { fontSize: isDesktop ? '36px' : '28px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' } }, 'Everything you need to grow your business'),
          React.createElement('p', { style: { fontSize: isDesktop ? '18px' : '16px', color: '#475569', maxWidth: '600px', margin: '0 auto' } }, 'Built for every kind of Nigerian business — Stays, Food & more')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: isDesktop ? '32px' : '24px' } },
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(PartyPopper, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Professional Booking Page'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Your own branded page — book.yourbusiness.com. Showcase your business with photos, features, and pricing.')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Wallet, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Flexible Payment Options'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Paystack integration coming soon. Accept pay-at-venue bookings today with automated confirmation emails.')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Bell, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Instant Notifications'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Every booking triggers an email to you and your customer — automatically. No missed orders, no manual follow-ups.')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Calendar, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Real-time Dashboard'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Track bookings, revenue, and availability at a glance. Know exactly what\'s happening with your business.')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Shield, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Secure & Reliable'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Enterprise-grade security on Supabase infrastructure. Your data is safe with us.')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Headphones, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, '24/7 Local Support'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Local support team based in Lagos. We speak your language and understand your business.')
          )
        )
      )
    ),

    // How It Works
    React.createElement('section', { style: { padding: isDesktop ? '80px 0' : '60px 0', backgroundColor: 'white' } },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '48px' } },
          React.createElement('h2', { style: { fontSize: isDesktop ? '36px' : '28px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' } }, 'Launch in 3 simple steps'),
          React.createElement('p', { style: { fontSize: isDesktop ? '18px' : '16px', color: '#475569' } }, 'From signup to accepting bookings in under 5 minutes')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: isDesktop ? '48px' : '32px' } },
          React.createElement('div', { style: { textAlign: 'center' } },
            React.createElement('div', { style: { width: '72px', height: '72px', backgroundColor: '#4f46e5', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', fontSize: '28px', fontWeight: '800' } }, '1'),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Create your account'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', maxWidth: '280px', margin: '0 auto' } }, 'Tell us about your business — Stays, Food, or Others')
          ),
          React.createElement('div', { style: { textAlign: 'center' } },
            React.createElement('div', { style: { width: '72px', height: '72px', backgroundColor: '#4f46e5', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', fontSize: '28px', fontWeight: '800' } }, '2'),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Set up your items'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', maxWidth: '280px', margin: '0 auto' } }, 'Add your items, set pricing, upload photos — make your page shine')
          ),
          React.createElement('div', { style: { textAlign: 'center' } },
            React.createElement('div', { style: { width: '72px', height: '72px', backgroundColor: '#4f46e5', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', fontSize: '28px', fontWeight: '800' } }, '3'),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Start earning'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', maxWidth: '280px', margin: '0 auto' } }, 'Share your booking link. Track every booking and revenue in real time')
          )
        )
      )
    ),

    // Testimonials
    React.createElement('section', { id: 'testimonials', style: { padding: isDesktop ? '80px 0' : '60px 0', backgroundColor: '#f8fafc' } },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '48px' } },
          React.createElement('h2', { style: { fontSize: isDesktop ? '36px' : '28px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' } }, 'Trusted by Nigerian businesses'),
          React.createElement('p', { style: { fontSize: isDesktop ? '18px' : '16px', color: '#475569' } }, 'Join 200+ Nigerian businesses already using Booking Hub')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr', gap: '32px' } },
          // Testimonial 1
          React.createElement('div', { style: { backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { display: 'flex', gap: '4px', marginBottom: '20px' } },
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' })
            ),
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#334155', marginBottom: '24px' } }, 
              '"Booking Hub transformed how we manage bookings. Clients book directly online, we get instant notifications, and our team stays organized. Bookings are up 40%. It\'s a game-changer for our business."'
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
              React.createElement('img', {
                src: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=80&h=80&fit=crop',
                alt: 'Amaka O.',
                style: { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }
              }),
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: '700', color: '#0f172a' } }, 'Amaka O.'),
                React.createElement('div', { style: { fontSize: '13px', color: '#64748b' } }, 'The Grand Event Centre, Lagos')
              )
            )
          ),
          // Testimonial 2
          React.createElement('div', { style: { backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { display: 'flex', gap: '4px', marginBottom: '20px' } },
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' })
            ),
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#334155', marginBottom: '24px' } }, 
              '"We run multiple spaces and Booking Hub helps us manage everything from one dashboard. Our staff love how easy it is to check availability and process bookings. Professional, reliable, built for Nigeria."'
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
              React.createElement('img', {
                src: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?w=80&h=80&fit=crop',
                alt: 'Chidi N.',
                style: { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }
              }),
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: '700', color: '#0f172a' } }, 'Chidi N.'),
                React.createElement('div', { style: { fontSize: '13px', color: '#64748b' } }, 'Platinum Halls, Abuja')
              )
            )
          )
        )
      )
    ),

    // Pricing Section
    React.createElement('section', { id: 'pricing', style: { padding: isDesktop ? '80px 0' : '60px 0', backgroundColor: 'white' } },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '48px' } },
          React.createElement('h2', { style: { fontSize: isDesktop ? '36px' : '28px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' } }, 'Choose the perfect plan for your business'),
          React.createElement('p', { style: { fontSize: isDesktop ? '18px' : '16px', color: '#475569' } }, 'Start free. Upgrade when you grow.')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: '24px', maxWidth: '900px', margin: '0 auto' } },
          // Free Tier
          React.createElement('div', { style: { 
            backgroundColor: '#f8fafc', 
            borderRadius: '24px', 
            padding: '32px', 
            border: '1px solid #e2e8f0',
            position: 'relative'
          } },
            React.createElement('div', { style: { 
              display: 'inline-block', 
              backgroundColor: '#94a3b8', 
              color: 'white', 
              fontSize: '10px', 
              fontWeight: '700', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              textTransform: 'uppercase',
              marginBottom: '16px',
              letterSpacing: '0.5px'
            } }, 'Free'),
            React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', marginBottom: '4px' } }, 'Free Plan'),
            React.createElement('div', { style: { fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' } }, '₦0', React.createElement('span', { style: { fontSize: '14px', fontWeight: '400', color: '#64748b' } }, '/month')),
            React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '20px' } }, '50 bookings per month'),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 24px 0' } },
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), '50 bookings per month'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Basic dashboard'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Email support')
            ),
            React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, width: '100%', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'default' } }, '✓ Current Plan')
          ),

          // Starter Tier
          React.createElement('div', { style: { 
            backgroundColor: '#eef2ff', 
            borderRadius: '24px', 
            padding: '32px', 
            border: '2px solid #4f46e5',
            position: 'relative',
            transform: isDesktop ? 'scale(1.02)' : 'scale(1)'
          } },
            React.createElement('div', { style: { 
              display: 'inline-block', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              fontSize: '10px', 
              fontWeight: '700', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              textTransform: 'uppercase',
              marginBottom: '16px',
              letterSpacing: '0.5px'
            } }, 'Popular'),
            React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', marginBottom: '4px' } }, 'Starter Plan'),
            React.createElement('div', { style: { fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' } }, '₦30,000', React.createElement('span', { style: { fontSize: '14px', fontWeight: '400', color: '#64748b' } }, '/month')),
            React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '20px' } }, '100 bookings per month'),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 24px 0' } },
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), '100 bookings per month'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Priority email support'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Advanced dashboard'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Instant notifications'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Email notifications')
            ),
            React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, width: '100%', justifyContent: 'center', backgroundColor: '#4f46e5' } }, 'Get Started →')
          ),

          // Pro Tier
          React.createElement('div', { style: { 
            backgroundColor: '#fffbeb', 
            borderRadius: '24px', 
            padding: '32px', 
            border: '2px solid #d97706',
            position: 'relative'
          } },
            React.createElement('div', { style: { 
              display: 'inline-flex', 
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#d97706', 
              color: 'white', 
              fontSize: '10px', 
              fontWeight: '700', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              textTransform: 'uppercase',
              marginBottom: '16px',
              letterSpacing: '0.5px'
            } },
              React.createElement(Crown, { size: 12 }),
              'Best Value'
            ),
            React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', marginBottom: '4px' } }, 'Pro Plan'),
            React.createElement('div', { style: { fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' } }, '₦50,000', React.createElement('span', { style: { fontSize: '14px', fontWeight: '400', color: '#64748b' } }, '/month')),
            React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '20px' } }, React.createElement('span', { style: { fontWeight: '700', color: '#d97706' } }, '♾️ Unlimited'), ' bookings'),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 24px 0' } },
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), '♾️ Unlimited bookings'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Priority support (Email + WhatsApp)'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Advanced analytics with charts'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Custom branding on booking page'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'SMS notifications'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '14px', color: '#475569' } }, React.createElement(CheckCircle, { size: 16, color: '#10b981' }), 'Dedicated account manager')
            ),
            React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, width: '100%', justifyContent: 'center', backgroundColor: '#d97706' } }, 'Get Started →')
          )
        ),
        React.createElement('p', { style: { textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '32px' } }, 'All plans include: Branded booking page · Real-time dashboard · Email notifications')
      )
    ),

    // Final CTA
    React.createElement('section', { style: { padding: isDesktop ? '80px 0' : '60px 0', backgroundColor: '#4f46e5' } },
      React.createElement('div', { style: { ...containerStyle, textAlign: 'center' } },
        React.createElement('h2', { style: { fontSize: isDesktop ? '36px' : '28px', fontWeight: '800', color: 'white', marginBottom: '16px' } }, 'Ready to launch your booking page?'),
        React.createElement('p', { style: { fontSize: isDesktop ? '18px' : '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' } }, 'Join 200+ Nigerian businesses. First 50 bookings free. Cancel anytime.'),
        React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, backgroundColor: 'white', color: '#4f46e5', padding: isDesktop ? '16px 40px' : '14px 32px', fontSize: isDesktop ? '16px' : '14px' } }, 'Get Started →'),
        React.createElement('p', { style: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '24px' } }, 'No credit card required. Free for first 50 bookings.')
      )
    ),

    // Footer
    React.createElement('footer', { style: { backgroundColor: '#0f172a', padding: isDesktop ? '60px 0 40px' : '40px 0 30px' } },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr', gap: isDesktop ? '40px' : '32px', marginBottom: '40px' } },
          React.createElement('div', null,
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' } },
              React.createElement(Building2, { size: 24, color: '#818cf8' }),
              React.createElement('span', { style: { fontSize: '18px', fontWeight: '800', color: 'white' } }, 'BookingHub')
            ),
            React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' } }, 'The booking platform built for Nigerian businesses.')
          ),
          React.createElement('div', null,
            React.createElement('h4', { style: { fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '16px' } }, 'Product'),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: 0 } },
              React.createElement('li', { style: { marginBottom: '8px' } }, React.createElement('a', { href: '#features', style: { color: '#94a3b8', textDecoration: 'none', fontSize: '13px' } }, 'Features')),
              React.createElement('li', { style: { marginBottom: '8px' } }, React.createElement('a', { href: '#pricing', style: { color: '#94a3b8', textDecoration: 'none', fontSize: '13px' } }, 'Pricing')),
              React.createElement('li', { style: { marginBottom: '8px' } }, React.createElement('a', { href: '/signup', style: { color: '#94a3b8', textDecoration: 'none', fontSize: '13px' } }, 'Get Started'))
            )
          ),
          React.createElement('div', null,
            React.createElement('h4', { style: { fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '16px' } }, 'Company'),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: 0 } },
              React.createElement('li', { style: { marginBottom: '8px' } }, React.createElement('a', { href: '/about', style: { color: '#94a3b8', textDecoration: 'none', fontSize: '13px' } }, 'About')),
              React.createElement('li', { style: { marginBottom: '8px' } }, React.createElement('a', { href: '/contact', style: { color: '#94a3b8', textDecoration: 'none', fontSize: '13px' } }, 'Contact'))
            )
          ),
          React.createElement('div', null,
            React.createElement('h4', { style: { fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '16px' } }, 'Contact'),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: 0 } },
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' } }, React.createElement(Mail, { size: 14 }), ' hello@myplazzaa.com'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' } }, React.createElement(Phone, { size: 14 }), ' +234 123 456 7890'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' } }, React.createElement(MapPin, { size: 14 }), ' Lagos, Nigeria')
            )
          )
        ),
        React.createElement('div', { style: { borderTop: '1px solid #1e293b', paddingTop: '24px', textAlign: 'center', fontSize: '12px', color: '#64748b' } },
          React.createElement('p', null, '© 2026 Booking Hub. All rights reserved. Built for Nigerian businesses.')
        )
      )
    )
  );
}

export default HostLanding;