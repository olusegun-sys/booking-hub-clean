import React, { useState, useEffect } from 'react';
import { 
  Building2, ArrowRight, CheckCircle, Star, Users, Calendar, 
  DollarSign, Shield, Clock, Smartphone, Globe, Zap, 
  Menu, X, TrendingUp, Wallet, Headphones, Sparkles,
  Mail, Phone, MapPin, ChevronLeft, ChevronRight, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function HostLanding() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showArrows, setShowArrows] = useState(false);

  // 5 high-quality hospitality images
  const slides = [
    { url: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=1400&h=788&fit=crop', alt: 'Luxury hotel suite with king bed and ocean view' },
    { url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?w=1400&h=788&fit=crop', alt: 'Modern apartment living room with city view' },
    { url: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?w=1400&h=788&fit=crop', alt: 'Indoor sports facility with basketball court' },
    { url: 'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?w=1400&h=788&fit=crop', alt: 'Elegant event venue with chandelier and stage' },
    { url: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?w=1400&h=788&fit=crop', alt: 'Luxury apartment rooftop with swimming pool' }
  ];

  // Navigate back to homepage
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

  // Auto-slide effect
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
            React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, padding: '8px 20px' } }, 'Start Free Trial')
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
          React.createElement('a', { href: '/signup', style: { display: 'block', textAlign: 'center', padding: '12px', backgroundColor: '#4f46e5', color: 'white', borderRadius: '40px', fontWeight: '600', textDecoration: 'none' } }, 'Start Free Trial →')
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
            'Get your own ', 
            React.createElement('span', { style: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'branded booking page'),
            ' in minutes'
          ),
          React.createElement('p', { style: { 
            fontSize: isDesktop ? '20px' : '16px', 
            color: '#475569', 
            lineHeight: '1.6',
            marginBottom: '32px'
          } }, 
            'Accept bookings, manage rooms, track revenue — all on your own domain. First 50 bookings free.'
          ),
          React.createElement('div', { style: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' } },
            React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, padding: isDesktop ? '14px 32px' : '12px 24px', fontSize: isDesktop ? '16px' : '14px' } }, 'Start Free Trial →'),
            React.createElement('a', { href: '#features', style: { ...secondaryButtonStyle, padding: isDesktop ? '14px 32px' : '12px 24px', fontSize: isDesktop ? '16px' : '14px' } }, 'Learn More')
          )
        ),
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
          React.createElement('div', null, React.createElement('div', { style: { fontSize: isDesktop ? '36px' : '32px', fontWeight: '800', color: '#4f46e5' } }, '5,000+'), React.createElement('p', { style: { fontSize: '14px', color: '#64748b', marginTop: '8px' } }, 'Monthly Bookings')),
          React.createElement('div', null, React.createElement('div', { style: { fontSize: isDesktop ? '36px' : '32px', fontWeight: '800', color: '#4f46e5' } }, '₦250M+'), React.createElement('p', { style: { fontSize: '14px', color: '#64748b', marginTop: '8px' } }, 'Revenue Tracked'))
        )
      )
    ),

    // Features Section
    React.createElement('section', { id: 'features', style: { padding: isDesktop ? '80px 0' : '60px 0', backgroundColor: '#f8fafc' } },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '48px' } },
          React.createElement('h2', { style: { fontSize: isDesktop ? '36px' : '28px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' } }, 'Everything you need to grow'),
          React.createElement('p', { style: { fontSize: isDesktop ? '18px' : '16px', color: '#475569', maxWidth: '600px', margin: '0 auto' } }, 'Built specifically for Nigerian hospitality businesses')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: isDesktop ? '32px' : '24px' } },
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Globe, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Your own domain'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'book.yourbusiness.com — professional booking page with your brand')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Wallet, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Paystack payments'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Cards, bank transfer, USSD — accept any payment method')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Users, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Staff management'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Add team members, control access, track performance')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Calendar, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Real-time dashboard'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Track bookings, revenue, and availability at a glance')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Shield, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Secure & reliable'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Enterprise-grade security on Supabase infrastructure')
          ),
          React.createElement('div', { style: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { width: '56px', height: '56px', backgroundColor: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' } }, React.createElement(Headphones, { size: 28, color: '#4f46e5' })),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, '24/7 support'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' } }, 'Local support team. We speak your language.')
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
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', maxWidth: '280px', margin: '0 auto' } }, 'Tell us about your business — hotel, sports venue, or event space')
          ),
          React.createElement('div', { style: { textAlign: 'center' } },
            React.createElement('div', { style: { width: '72px', height: '72px', backgroundColor: '#4f46e5', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', fontSize: '28px', fontWeight: '800' } }, '2'),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Set up your page'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', maxWidth: '280px', margin: '0 auto' } }, 'Add rooms, set prices, upload photos — make it yours')
          ),
          React.createElement('div', { style: { textAlign: 'center' } },
            React.createElement('div', { style: { width: '72px', height: '72px', backgroundColor: '#4f46e5', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', fontSize: '28px', fontWeight: '800' } }, '3'),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Start earning'),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', maxWidth: '280px', margin: '0 auto' } }, 'Share your booking link. Track every booking in real time')
          )
        )
      )
    ),

    // Testimonials - With working Nigerian/African images
    React.createElement('section', { id: 'testimonials', style: { padding: isDesktop ? '80px 0' : '60px 0', backgroundColor: '#f8fafc' } },
      React.createElement('div', { style: containerStyle },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '48px' } },
          React.createElement('h2', { style: { fontSize: isDesktop ? '36px' : '28px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' } }, 'Trusted by business owners'),
          React.createElement('p', { style: { fontSize: isDesktop ? '18px' : '16px', color: '#475569' } }, 'Join 200+ Nigerian businesses already using Booking Hub')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr', gap: '32px' } },
          // Amaka O. - Nigerian woman
          React.createElement('div', { style: { backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { display: 'flex', gap: '4px', marginBottom: '20px' } },
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' })
            ),
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#334155', marginBottom: '24px' } }, 
              '"Booking Hub transformed our reservations. Customers book directly from our website. We\'ve seen a 40% increase in direct bookings."'
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
              React.createElement('img', {
                src: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=80&h=80&fit=crop',
                alt: 'Amaka O.',
                style: { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }
              }),
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: '700', color: '#0f172a' } }, 'Amaka O.'),
                React.createElement('div', { style: { fontSize: '13px', color: '#64748b' } }, 'Preston Hotel, Lagos')
              )
            )
          ),
          // Chidi N. - Nigerian man (FIXED - working image)
          React.createElement('div', { style: { backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { display: 'flex', gap: '4px', marginBottom: '20px' } },
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' }),
              React.createElement(Star, { size: 18, color: '#fbbf24', fill: '#fbbf24' })
            ),
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#334155', marginBottom: '24px' } }, 
              '"The Paystack integration is seamless. My customers can pay with card, transfer, or USSD. Revenue tracking is a game-changer."'
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
              React.createElement('img', {
                src: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?w=80&h=80&fit=crop',
                alt: 'Chidi N.',
                style: { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }
              }),
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: '700', color: '#0f172a' } }, 'Chidi N.'),
                React.createElement('div', { style: { fontSize: '13px', color: '#64748b' } }, 'Lagos Sports Complex')
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
          React.createElement('h2', { style: { fontSize: isDesktop ? '36px' : '28px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' } }, 'Simple, transparent pricing'),
          React.createElement('p', { style: { fontSize: isDesktop ? '18px' : '16px', color: '#475569' } }, 'Start free. Pay only when you grow.')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr', gap: '32px', maxWidth: '800px', margin: '0 auto' } },
          React.createElement('div', { style: { backgroundColor: '#f8fafc', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' } },
            React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', marginBottom: '12px' } }, 'Free Trial'),
            React.createElement('div', { style: { fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' } }, '₦0', React.createElement('span', { style: { fontSize: '14px', fontWeight: '400', color: '#64748b' } }, '/first 50 bookings')),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 32px 0' } },
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' } }, React.createElement(CheckCircle, { size: 18, color: '#10b981' }), 'First 50 bookings free'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' } }, React.createElement(CheckCircle, { size: 18, color: '#10b981' }), 'Branded booking page'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' } }, React.createElement(CheckCircle, { size: 18, color: '#10b981' }), 'Paystack integration'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' } }, React.createElement(CheckCircle, { size: 18, color: '#10b981' }), 'Email notifications'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' } }, React.createElement(CheckCircle, { size: 18, color: '#10b981' }), 'Real-time dashboard')
            ),
            React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, width: '100%', justifyContent: 'center' } }, 'Start Free Trial →')
          ),
          React.createElement('div', { style: { backgroundColor: '#4f46e5', borderRadius: '24px', padding: '32px', color: 'white' } },
            React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: 'white' } }, 'Pro Plan'),
            React.createElement('div', { style: { fontSize: '36px', fontWeight: '800', marginBottom: '20px', color: 'white' } }, '₦20,000', React.createElement('span', { style: { fontSize: '14px', fontWeight: '400' } }, '/month')),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 32px 0' } },
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'white' } }, React.createElement(CheckCircle, { size: 18, color: '#a5b4fc' }), 'Unlimited bookings'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'white' } }, React.createElement(CheckCircle, { size: 18, color: '#a5b4fc' }), 'Custom domain'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'white' } }, React.createElement(CheckCircle, { size: 18, color: '#a5b4fc' }), 'Staff accounts'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'white' } }, React.createElement(CheckCircle, { size: 18, color: '#a5b4fc' }), 'Priority support'),
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'white' } }, React.createElement(CheckCircle, { size: 18, color: '#a5b4fc' }), 'Advanced analytics')
            ),
            React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, backgroundColor: 'white', color: '#4f46e5', width: '100%', justifyContent: 'center' } }, 'Get Started →')
          )
        )
      )
    ),

    // Final CTA
    React.createElement('section', { style: { padding: isDesktop ? '80px 0' : '60px 0', backgroundColor: '#4f46e5' } },
      React.createElement('div', { style: { ...containerStyle, textAlign: 'center' } },
        React.createElement('h2', { style: { fontSize: isDesktop ? '36px' : '28px', fontWeight: '800', color: 'white', marginBottom: '16px' } }, 'Ready to launch your booking page?'),
        React.createElement('p', { style: { fontSize: isDesktop ? '18px' : '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' } }, 'Join 200+ Nigerian businesses. First 50 bookings free. Cancel anytime.'),
        React.createElement('a', { href: '/signup', style: { ...ctaButtonStyle, backgroundColor: 'white', color: '#4f46e5', padding: isDesktop ? '16px 40px' : '14px 32px', fontSize: isDesktop ? '16px' : '14px' } }, 'Start Your Free Trial →'),
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
            React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' } }, 'The booking platform built for Nigerian hospitality businesses.')
          ),
          React.createElement('div', null,
            React.createElement('h4', { style: { fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '16px' } }, 'Product'),
            React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: 0 } },
              React.createElement('li', { style: { marginBottom: '8px' } }, React.createElement('a', { href: '#features', style: { color: '#94a3b8', textDecoration: 'none', fontSize: '13px' } }, 'Features')),
              React.createElement('li', { style: { marginBottom: '8px' } }, React.createElement('a', { href: '#pricing', style: { color: '#94a3b8', textDecoration: 'none', fontSize: '13px' } }, 'Pricing')),
              React.createElement('li', { style: { marginBottom: '8px' } }, React.createElement('a', { href: '/signup', style: { color: '#94a3b8', textDecoration: 'none', fontSize: '13px' } }, 'Start Free Trial'))
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
              React.createElement('li', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' } }, React.createElement(Mail, { size: 14 }), ' hello@bookinghub.com'),
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