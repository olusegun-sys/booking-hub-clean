import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Trophy, PartyPopper, Shield, Search, MapPin, Phone, Star, Sparkles, Clock, CreditCard, Award, ArrowRight, Calendar, Users, Headphones, Loader2 } from 'lucide-react';
import { showError } from './toast';
import RoomPage from './RoomPage';
import SportsBooking from './SportsBooking';
import EventBooking from './EventBooking';
import BusinessLogin from './BusinessLogin';
import BusinessDashboard from './BusinessDashboard';
import StaffDashboard from './StaffDashboard';
import HostLanding from './HostLanding';
import API_BASE from './config';  // <-- ADD THIS LINE

const brandIndigo = '#4F46E5';
const brandIndigoLight = '#6366F1';
const brandIndigoDark = '#4338CA';

const heroImages = {
  hotel: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920&h=650&fit=crop',
  sports: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1920&h=650&fit=crop',
  event: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1920&h=650&fit=crop'
};

const heroTitles = {
  hotel: 'Find Your Perfect Stay',
  sports: 'Book Your Court',
  event: 'Plan Your Event'
};

const heroSubtitles = {
  hotel: 'Discover and book the finest hotels across Nigeria',
  sports: 'Find and reserve courts, pitches, and facilities near you',
  event: 'Plan your next celebration at premier venues across Nigeria'
};

const businessImages = {
  hotel: [
    'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    'https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'
  ],
  sports: [
    'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'
  ],
  event: [
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    'https://images.pexels.com/photos/2608518/pexels-photo-2608518.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
    'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'
  ]
};

const getBusinessImage = (type, index) => {
  const images = businessImages[type] || businessImages.hotel;
  return images[index % images.length];
};

function HomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('hotel');
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [eventDate, setEventDate] = useState('');
  const [sportsDate, setSportsDate] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showDirectBooking, setShowDirectBooking] = useState(false);
  const [showBusinessLogin, setShowBusinessLogin] = useState(false);
  const [heroKey, setHeroKey] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  const [businessUser, setBusinessUser] = useState(() => {
    const savedBusiness = localStorage.getItem('businessUser');
    return savedBusiness ? JSON.parse(savedBusiness) : null;
  });

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkCustomDomain = async () => {
      try {
        if (window.location.pathname !== '/') return;
        const currentDomain = window.location.hostname;
        // FIXED: Use imported API_BASE
        const response = await fetch(`${API_BASE}/api/domain-info?domain=${currentDomain}`);
        const data = await response.json();
        if (data.success && data.source === 'custom-domain-verified') navigate(`/book/${data.business.slug}`);
      } catch (error) {}
    };
    checkCustomDomain();
  }, [navigate]);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setResults([]);
    setLocation('');
    setHeroKey(prev => prev + 1);
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      showError('Please enter a location');
      return;
    }
    setLoading(true);
    try {
      // FIXED: Use imported API_BASE
      let searchParams = { location };
      if (selectedCategory === 'hotel') {
        searchParams.checkIn = checkIn;
        searchParams.checkOut = checkOut;
        searchParams.guests = guests;
      }
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`${API_BASE}/api/businesses/search/category?category=${selectedCategory}&${params}`);
      const data = await response.json();
      if (data.success) {
        setResults(data.businesses);
        if (data.businesses.length === 0 && location) {
          showError(`No ${selectedCategory} found in ${location}`);
        }
        setTimeout(() => {
          const resultsElement = document.getElementById('results-section');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Search error:', error);
      showError('Something went wrong.');
    }
    setLoading(false);
  };

  const handleDirectBook = (business) => {
    setSelectedBusiness(business);
    setShowDirectBooking(true);
  };

  const goToAdmin = () => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) window.location.href = '/admin';
    else navigate('/admin');
  };

  if (businessUser) {
    if (businessUser.staffUser) return React.createElement(StaffDashboard, { staff: businessUser.staffUser, business: businessUser, onLogout: () => { setBusinessUser(null); localStorage.removeItem('businessUser'); } });
    return React.createElement(BusinessDashboard, { business: businessUser, onLogout: () => { setBusinessUser(null); localStorage.removeItem('businessUser'); } });
  }
  if (showDirectBooking && selectedBusiness) {
    if (selectedBusiness.business_type === 'hotel') return React.createElement(RoomPage, { businessId: selectedBusiness.id, businessName: selectedBusiness.name, checkIn: checkIn, checkOut: checkOut, guests: guests, onBack: () => setShowDirectBooking(false) });
    if (selectedBusiness.business_type === 'sports') return React.createElement(SportsBooking, { business: selectedBusiness, onBack: () => setShowDirectBooking(false) });
    if (selectedBusiness.business_type === 'event') return React.createElement(EventBooking, { business: selectedBusiness, onBack: () => setShowDirectBooking(false) });
  }

  const getCategoryPlaceholder = () => 'e.g., Lagos, Abuja, Port Harcourt';
  
  const getSearchButtonText = () => {
    if (loading) return 'Searching...';
    const texts = { hotel: 'Search Hotels', sports: 'Search Sports', event: 'Search Events' };
    return texts[selectedCategory];
  };

  // ========== STYLES ==========
  
  const containerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: isDesktop ? '20px 32px' : '16px 20px',
    minHeight: '100vh',
    background: '#ffffff'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isDesktop ? '32px' : '20px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: isDesktop ? '24px' : '20px',
    fontWeight: '700',
    color: brandIndigo,
    letterSpacing: '-0.01em',
    cursor: 'pointer'
  };

  const headerButtonsStyle = {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  };

  const buttonStyle = {
    padding: isDesktop ? '8px 20px' : '6px 14px',
    borderRadius: '100px',
    fontSize: isDesktop ? '14px' : '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: brandIndigo,
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'white',
    color: '#1a1a1a',
    border: '1px solid #e5e5e5'
  };

  // Hero Section
  const heroSectionStyle = {
    width: '100%',
    height: isDesktop ? '420px' : '320px',
    borderRadius: '20px',
    marginBottom: '32px',
    backgroundImage: `url(${heroImages[selectedCategory]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative'
  };

  const heroOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.55))',
    borderRadius: '20px'
  };

  const heroContentStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: isDesktop ? '40px 48px 48px' : '24px 24px 32px',
    color: 'white',
    zIndex: 2
  };

  const heroTitleStyle = {
    fontSize: isDesktop ? '44px' : '32px',
    fontWeight: '700',
    marginBottom: '12px',
    letterSpacing: '-0.02em',
    color: 'white',
    lineHeight: '1.2'
  };

  const heroSubtitleStyle = {
    fontSize: isDesktop ? '16px' : '14px',
    opacity: 0.9,
    color: 'white',
    lineHeight: '1.4'
  };

  const categoryCardStyle = (isActive) => ({
    flex: 1,
    minWidth: isDesktop ? 'auto' : '100%',
    padding: isDesktop ? '12px 16px' : '14px',
    background: isActive ? brandIndigo : 'white',
    border: isActive ? 'none' : '1px solid #e8e8e8',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? `0 2px 8px ${brandIndigo}33` : 'none',
    textAlign: 'center'
  });

  const categoryIconStyle = (isActive) => ({
    width: isDesktop ? '40px' : '44px',
    height: isDesktop ? '40px' : '44px',
    background: isActive ? 'rgba(255,255,255,0.15)' : '#f5f5f5',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px'
  });

  const categoryTitleStyle = (isActive) => ({
    fontWeight: '600',
    fontSize: isDesktop ? '14px' : '15px',
    marginBottom: '2px',
    color: isActive ? 'white' : '#1a1a1a'
  });

  const categoryDescStyle = (isActive) => ({
    fontSize: '11px',
    color: isActive ? 'rgba(255,255,255,0.7)' : '#999'
  });

  const trustBadgesStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: isDesktop ? '32px' : '20px',
    marginBottom: '32px',
    flexWrap: 'wrap'
  };

  const trustBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#666'
  };

  const searchCardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: isDesktop ? '24px 28px' : '20px',
    marginBottom: '48px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #eee'
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? '1fr 1fr 1fr 1fr auto' : '1fr',
    gap: '12px',
    alignItems: 'center'
  };

  const inputWrapperStyle = {
    position: 'relative'
  };

  const inputIconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    pointerEvents: 'none'
  };

  const inputFieldStyle = {
    width: '100%',
    padding: '12px 12px 12px 36px',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    background: '#fafafa'
  };

  const searchBtnStyle = {
    padding: '12px 24px',
    background: loading ? '#94a3b8' : brandIndigo,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  };

  const resultsHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  };

  const resultsTitleStyle = {
    fontSize: isDesktop ? '22px' : '18px',
    fontWeight: '600',
    color: '#1a1a1a'
  };

  const resultsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
    gap: '24px'
  };

  const resultCardStyle = {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    border: '1px solid #eee',
    cursor: 'pointer'
  };

  const resultImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  };

  const resultContentStyle = {
    padding: '16px'
  };

  const resultNameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px'
  };

  const resultTypeBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '500',
    background: '#EEF2FF',
    color: brandIndigo
  };

  const bookBtnStyle = {
    flex: 1,
    padding: '10px',
    background: brandIndigo,
    border: 'none',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '500',
    color: 'white',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease'
  };

  const detailsBtnStyle = {
    flex: 1,
    padding: '10px',
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease'
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
    gap: '32px',
    marginTop: '60px',
    paddingTop: '40px',
    borderTop: '1px solid #eee'
  };

  const featureItemStyle = {
    textAlign: 'center'
  };

  const featureIconStyle = {
    width: '44px',
    height: '44px',
    background: '#EEF2FF',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px'
  };

  const featureTitleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px'
  };

  const featureDescStyle = {
    fontSize: '12px',
    color: '#888'
  };

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: headerStyle },
      React.createElement('div', { style: logoStyle, onClick: () => window.location.reload() },
        React.createElement(Building2, { size: isDesktop ? 24 : 20, color: brandIndigo }),
        React.createElement('span', null, 'BookingHub')
      ),
      React.createElement('div', { style: headerButtonsStyle },
        React.createElement('button', { onClick: goToAdmin, style: secondaryButtonStyle, onMouseEnter: (e) => { e.currentTarget.style.borderColor = brandIndigo; }, onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; } },
          React.createElement(Shield, { size: 14 }), ' Admin'
        ),
        React.createElement('button', { onClick: () => navigate('/become-host'), style: secondaryButtonStyle, onMouseEnter: (e) => { e.currentTarget.style.borderColor = brandIndigo; }, onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; } },
          'Become a Host'
        ),
        React.createElement('button', { onClick: () => setShowBusinessLogin(true), style: primaryButtonStyle, onMouseEnter: (e) => { e.currentTarget.style.background = brandIndigoDark; }, onMouseLeave: (e) => { e.currentTarget.style.background = brandIndigo; } },
          'Business Login'
        )
      )
    ),

    React.createElement('div', { style: { display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' } },
      React.createElement('div', { onClick: () => handleCategoryChange('hotel'), style: categoryCardStyle(selectedCategory === 'hotel'), onMouseEnter: (e) => { if (selectedCategory !== 'hotel') { e.currentTarget.style.borderColor = brandIndigoLight; e.currentTarget.style.transform = 'translateY(-2px)'; } }, onMouseLeave: (e) => { if (selectedCategory !== 'hotel') { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.transform = 'translateY(0)'; } } },
        React.createElement('div', { style: categoryIconStyle(selectedCategory === 'hotel') },
          React.createElement(Building2, { size: isDesktop ? 20 : 18, color: selectedCategory === 'hotel' ? 'white' : brandIndigo })
        ),
        React.createElement('div', { style: categoryTitleStyle(selectedCategory === 'hotel') }, 'Hotels'),
        React.createElement('div', { style: categoryDescStyle(selectedCategory === 'hotel') }, 'Luxury stays')
      ),
      React.createElement('div', { onClick: () => handleCategoryChange('sports'), style: categoryCardStyle(selectedCategory === 'sports'), onMouseEnter: (e) => { if (selectedCategory !== 'sports') { e.currentTarget.style.borderColor = brandIndigoLight; e.currentTarget.style.transform = 'translateY(-2px)'; } }, onMouseLeave: (e) => { if (selectedCategory !== 'sports') { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.transform = 'translateY(0)'; } } },
        React.createElement('div', { style: categoryIconStyle(selectedCategory === 'sports') },
          React.createElement(Trophy, { size: isDesktop ? 20 : 18, color: selectedCategory === 'sports' ? 'white' : brandIndigo })
        ),
        React.createElement('div', { style: categoryTitleStyle(selectedCategory === 'sports') }, 'Sports'),
        React.createElement('div', { style: categoryDescStyle(selectedCategory === 'sports') }, 'Courts & pitches')
      ),
      React.createElement('div', { onClick: () => handleCategoryChange('event'), style: categoryCardStyle(selectedCategory === 'event'), onMouseEnter: (e) => { if (selectedCategory !== 'event') { e.currentTarget.style.borderColor = brandIndigoLight; e.currentTarget.style.transform = 'translateY(-2px)'; } }, onMouseLeave: (e) => { if (selectedCategory !== 'event') { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.transform = 'translateY(0)'; } } },
        React.createElement('div', { style: categoryIconStyle(selectedCategory === 'event') },
          React.createElement(PartyPopper, { size: isDesktop ? 20 : 18, color: selectedCategory === 'event' ? 'white' : brandIndigo })
        ),
        React.createElement('div', { style: categoryTitleStyle(selectedCategory === 'event') }, 'Events'),
        React.createElement('div', { style: categoryDescStyle(selectedCategory === 'event') }, 'Venues & halls')
      )
    ),

    React.createElement('div', { key: heroKey, style: heroSectionStyle },
      React.createElement('div', { style: heroOverlayStyle }),
      React.createElement('div', { style: heroContentStyle },
        React.createElement('h1', { style: heroTitleStyle }, heroTitles[selectedCategory]),
        React.createElement('p', { style: heroSubtitleStyle }, heroSubtitles[selectedCategory])
      )
    ),

    React.createElement('div', { style: trustBadgesStyle },
      React.createElement('div', { style: trustBadgeStyle }, React.createElement(Sparkles, { size: 14, color: brandIndigo }), '200+ venues'),
      React.createElement('div', { style: trustBadgeStyle }, React.createElement(Clock, { size: 14, color: brandIndigo }), 'Instant confirmation'),
      React.createElement('div', { style: trustBadgeStyle }, React.createElement(CreditCard, { size: 14, color: brandIndigo }), 'Pay online or at venue')
    ),

    React.createElement('div', { style: searchCardStyle },
      React.createElement('div', { style: formGridStyle },
        React.createElement('div', { style: inputWrapperStyle },
          React.createElement(MapPin, { size: 14, style: inputIconStyle }),
          React.createElement('input', { type: 'text', placeholder: getCategoryPlaceholder(), value: location, onChange: (e) => setLocation(e.target.value), onKeyPress: (e) => { if (e.key === 'Enter') handleSearch(); }, style: inputFieldStyle, onFocus: (e) => { e.target.style.borderColor = brandIndigo; e.target.style.background = 'white'; }, onBlur: (e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#fafafa'; } })
        ),
        selectedCategory === 'hotel' && React.createElement('div', { style: inputWrapperStyle },
          React.createElement(Calendar, { size: 14, style: inputIconStyle }),
          React.createElement('input', { type: 'date', value: checkIn, onChange: (e) => setCheckIn(e.target.value), style: inputFieldStyle, onFocus: (e) => { e.target.style.borderColor = brandIndigo; e.target.style.background = 'white'; }, onBlur: (e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#fafafa'; } })
        ),
        selectedCategory === 'hotel' && React.createElement('div', { style: inputWrapperStyle },
          React.createElement(Calendar, { size: 14, style: inputIconStyle }),
          React.createElement('input', { type: 'date', value: checkOut, onChange: (e) => setCheckOut(e.target.value), style: inputFieldStyle, onFocus: (e) => { e.target.style.borderColor = brandIndigo; e.target.style.background = 'white'; }, onBlur: (e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#fafafa'; } })
        ),
        selectedCategory === 'hotel' && React.createElement('div', { style: inputWrapperStyle },
          React.createElement(Users, { size: 14, style: inputIconStyle }),
          React.createElement('select', { value: guests, onChange: (e) => setGuests(parseInt(e.target.value)), style: { ...inputFieldStyle, cursor: 'pointer', appearance: 'none', paddingRight: '24px' }, onFocus: (e) => { e.target.style.borderColor = brandIndigo; e.target.style.background = 'white'; }, onBlur: (e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#fafafa'; } },
            [1,2,3,4,5,6].map(num => React.createElement('option', { key: num, value: num }, `${num} Guest${num > 1 ? 's' : ''}`))
          )
        ),
        (selectedCategory === 'sports' || selectedCategory === 'event') && React.createElement('div', { style: inputWrapperStyle },
          React.createElement(Calendar, { size: 14, style: inputIconStyle }),
          React.createElement('input', { type: 'date', value: selectedCategory === 'sports' ? sportsDate : eventDate, onChange: (e) => selectedCategory === 'sports' ? setSportsDate(e.target.value) : setEventDate(e.target.value), style: inputFieldStyle, min: new Date().toISOString().split('T')[0], onFocus: (e) => { e.target.style.borderColor = brandIndigo; e.target.style.background = 'white'; }, onBlur: (e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#fafafa'; } })
        ),
        React.createElement('button', { onClick: handleSearch, disabled: loading, style: searchBtnStyle, onMouseEnter: (e) => { if (!loading) e.currentTarget.style.background = brandIndigoDark; }, onMouseLeave: (e) => { e.currentTarget.style.background = brandIndigo; } },
          loading ? React.createElement(Loader2, { size: 16, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Search, { size: 14 }),
          getSearchButtonText()
        )
      )
    ),

    results.length > 0 && React.createElement('div', { id: 'results-section' },
      React.createElement('div', { style: resultsHeaderStyle },
        React.createElement('div', null,
          React.createElement('h2', { style: resultsTitleStyle }, `Available ${selectedCategory === 'hotel' ? 'Hotels' : selectedCategory === 'sports' ? 'Sports Facilities' : 'Event Venues'}`),
          React.createElement('p', { style: { fontSize: '13px', color: '#888', marginTop: '2px' } }, `${results.length} ${results.length === 1 ? 'result' : 'results'} found`)
        )
      )
    ),

    loading && React.createElement('div', { style: resultsGridStyle },
      [1,2,3].map(i => React.createElement('div', { key: i, style: { ...resultCardStyle, cursor: 'default' } },
        React.createElement('div', { style: { ...resultImageStyle, background: '#f0f0f0' } }),
        React.createElement('div', { style: resultContentStyle },
          React.createElement('div', { style: { width: '70%', height: '18px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '8px' } }),
          React.createElement('div', { style: { width: '40%', height: '12px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '12px' } }),
          React.createElement('div', { style: { width: '90%', height: '12px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '16px' } }),
          React.createElement('div', { style: { display: 'flex', gap: '10px' } },
            React.createElement('div', { style: { flex: 1, height: '36px', background: '#f0f0f0', borderRadius: '100px' } }),
            React.createElement('div', { style: { flex: 1, height: '36px', background: '#f0f0f0', borderRadius: '100px' } })
          )
        )
      ))
    ),

    !loading && results.length > 0 && React.createElement('div', { style: resultsGridStyle },
      results.map((business, index) => React.createElement('div', { key: business.id, style: resultCardStyle, onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${brandIndigo}1A`; }, onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } },
        React.createElement('img', { src: getBusinessImage(business.business_type, index), alt: business.name, style: resultImageStyle }),
        React.createElement('div', { style: resultContentStyle },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' } },
            React.createElement('div', null,
              React.createElement('h3', { style: resultNameStyle }, business.name),
              React.createElement('div', { style: { marginTop: '6px' } },
                React.createElement('div', { style: resultTypeBadgeStyle },
                  business.business_type === 'hotel' ? React.createElement(Building2, { size: 10 }) : business.business_type === 'sports' ? React.createElement(Trophy, { size: 10 }) : React.createElement(PartyPopper, { size: 10 }),
                  React.createElement('span', null, business.business_type === 'hotel' ? 'Hotel' : business.business_type === 'sports' ? 'Sports' : 'Event')
                )
              )
            ),
            React.createElement('div', { style: { textAlign: 'right' } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' } },
                React.createElement(Star, { size: 12, fill: '#f5a623', color: '#f5a623' }),
                React.createElement('span', { style: { fontWeight: '500', fontSize: '12px' } }, '4.9')
              ),
              React.createElement('div', { style: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a' } }, '₦0'),
              React.createElement('div', { style: { fontSize: '10px', color: '#999' } }, 'starting price')
            )
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '12px', marginBottom: '10px' } },
            React.createElement(MapPin, { size: 12 }),
            React.createElement('span', null, `${business.city || 'Lagos'}, ${business.state || 'Lagos'}`)
          ),
          React.createElement('p', { style: { color: '#888', fontSize: '12px', lineHeight: '1.4', marginBottom: '14px' } },
            business.description ? business.description.substring(0, 70) + '...' : 'Experience premium hospitality and comfort.'
          ),
          React.createElement('div', { style: { display: 'flex', gap: '10px' } },
            React.createElement('button', { onClick: () => handleDirectBook(business), style: bookBtnStyle, onMouseEnter: (e) => e.currentTarget.style.background = brandIndigoDark, onMouseLeave: (e) => e.currentTarget.style.background = brandIndigo }, 'Book Now', React.createElement(ArrowRight, { size: 12, style: { marginLeft: '4px' } })),
            React.createElement('button', { onClick: () => navigate(`/book/${business.slug}`), style: detailsBtnStyle, onMouseEnter: (e) => e.currentTarget.style.background = '#e8e8e8', onMouseLeave: (e) => e.currentTarget.style.background = '#f5f5f5' }, 'Details')
          )
        )
      ))
    ),

    !loading && results.length === 0 && location && React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px' } },
      React.createElement(Search, { size: 48, color: '#ccc', style: { marginBottom: '16px' } }),
      React.createElement('h3', { style: { fontSize: '18px', fontWeight: '500', color: '#1a1a1a', marginBottom: '8px' } }, 'No results found'),
      React.createElement('p', { style: { color: '#888', marginBottom: '20px', fontSize: '14px' } }, `We couldn't find any ${selectedCategory === 'hotel' ? 'hotels' : selectedCategory === 'sports' ? 'sports facilities' : 'event venues'} in "${location}".`),
      React.createElement('button', { onClick: () => { setLocation(''); setSelectedCategory('hotel'); }, style: { padding: '10px 24px', background: brandIndigo, border: 'none', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', color: 'white', fontSize: '13px' } }, 'Clear Search')
    ),

    !loading && results.length === 0 && !location && React.createElement('div', { style: featuresGridStyle },
      React.createElement('div', { style: featureItemStyle },
        React.createElement('div', { style: featureIconStyle }, React.createElement(Award, { size: 20, color: brandIndigo })),
        React.createElement('div', { style: featureTitleStyle }, 'Verified Venues'),
        React.createElement('div', { style: featureDescStyle }, 'All properties vetted')
      ),
      React.createElement('div', { style: featureItemStyle },
        React.createElement('div', { style: featureIconStyle }, React.createElement(Clock, { size: 20, color: brandIndigo })),
        React.createElement('div', { style: featureTitleStyle }, 'Instant Booking'),
        React.createElement('div', { style: featureDescStyle }, 'Immediate confirmation')
      ),
      React.createElement('div', { style: featureItemStyle },
        React.createElement('div', { style: featureIconStyle }, React.createElement(Shield, { size: 20, color: brandIndigo })),
        React.createElement('div', { style: featureTitleStyle }, 'Secure Payments'),
        React.createElement('div', { style: featureDescStyle }, 'Fraud protection')
      ),
      React.createElement('div', { style: featureItemStyle },
        React.createElement('div', { style: featureIconStyle }, React.createElement(Headphones, { size: 20, color: brandIndigo })),
        React.createElement('div', { style: featureTitleStyle }, '24/7 Support'),
        React.createElement('div', { style: featureDescStyle }, 'Always here to help')
      )
    ),

    showBusinessLogin && React.createElement(BusinessLogin, { onClose: () => setShowBusinessLogin(false) })
  );
}

export default HomePage;