// FILE: client/src/HomePage.jsx
// UPDATED 19 Sept 2026: Categories changed to Stays/Food/Others (group-based search)
// Book Now routes to /book/{slug} so all business types work via UnifiedBookingPage

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Utensils,
  Sparkles,
  Shield, 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  Clock, 
  CreditCard, 
  Award, 
  ArrowRight, 
  Calendar, 
  Users, 
  Headphones, 
  Loader2
} from 'lucide-react';
import { showError } from './toast';
import BusinessLogin from './BusinessLogin';
import BusinessDashboard from './BusinessDashboard';
import StaffDashboard from './StaffDashboard';
import DestinationCards from './components/DestinationCards';
import PopularStays from './components/PopularStays';
import API_BASE from './config';

// Brand colors - consistent indigo theme
const brandIndigo = '#4F46E5';
const brandIndigoLight = '#6366F1';
const brandIndigoDark = '#4338CA';

// ============================================================
// CATEGORY GROUPS
// ============================================================
// WHY: The homepage shows 3 groups, but the database stores 11 specific
// business types. This map translates group → business_type values so a
// search for "Stays" finds hotels, apartments, and event halls.
const categoryGroups = {
  stays: ['hotel', 'apartment', 'event_hall', 'event'],
  food: ['restaurant', 'diner', 'cafe', 'other_food'],
  others: ['sports', 'spa', 'beauty_salon', 'activity_place']
};

// Hero images for each group (first URL per category from provided list)
const heroImages = {
  stays: 'https://www.savoydubai.com/wp-content/uploads/sites/183/2022/09/Savoy-Suites-Master-Bedroom-2BR-1-2200x1200.jpg',
  food: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS0klqKVCFMw_l2R1UnjsXzmvozatheQZ5dekGoBFyX1oFdK3HXtX7qvs&s=10',
  others: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGyiajxYGnmi6i-mnxHCw0ZifBMBDgMHeTbqJNki2TGLmA7CNHCbalzWIE&s=10'
};

// Hero titles and subtitles per group
const heroTitles = {
  stays: 'Find Your Perfect Stay',
  food: 'Order From the Best',
  others: 'Book Anything'
};

const heroSubtitles = {
  stays: 'Discover hotels, apartments, and venues across Nigeria',
  food: 'Discover restaurants, cafés, and food spots near you',
  others: 'Spas, salons, sports, and activities — all in one place'
};

// Business images for search result cards (grouped)
const businessImages = {
  stays: [
    'https://www.savoydubai.com/wp-content/uploads/sites/183/2022/09/Savoy-Suites-Master-Bedroom-2BR-1-2200x1200.jpg',
    'https://image-tc.galaxy.tf/wijpeg-dpc83c0rm760hobndf6les3wk/file.jpg',
    'https://pub-c3c5765215d14e3d882d51123be2ba44.r2.dev/media/images/diary/2025-09-27%2022%3A06%3A53.871437%2B00%3A00/.jpeg'
  ],
  food: [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS0klqKVCFMw_l2R1UnjsXzmvozatheQZ5dekGoBFyX1oFdK3HXtX7qvs&s=10',
    'https://images.jdmagicbox.com/v2/comp/kolkata/s1/033pxx33.xx33.251029132716.e1s1/catalogue/sab-cafe-and-restaurant-belgharia-kolkata-restaurants-j5q0ve4g0k.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH_r3Fi031vv8vHSYWtrSBAolln592tf14vYEMvr7dS-WDFPmT75RI15Dg&s=10'
  ],
  others: [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGyiajxYGnmi6i-mnxHCw0ZifBMBDgMHeTbqJNki2TGLmA7CNHCbalzWIE&s=10',
    'https://s3-media0.fl.yelpcdn.com/bphoto/8I-EWHCn5r9ej8jZaoB7yg/l.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3ggMTUN2DW27NXqv3DMCl7fPfA88B5_L_AAtbLgqgV2kwJXFsk3H9JCg&s=10'
  ]
};

// WHY: Result cards can show any specific business_type. Map each
// specific type back to its display group so we pick the right images.
const businessTypeToGroup = {
  hotel: 'stays', apartment: 'stays', event_hall: 'stays', event: 'stays',
  restaurant: 'food', diner: 'food', cafe: 'food', other_food: 'food',
  sports: 'others', spa: 'others', beauty_salon: 'others', activity_place: 'others'
};

// WHY: Display name + icon for each specific business_type on result cards.
const businessTypeDisplay = {
  hotel: { label: 'Hotel', icon: Building2 },
  apartment: { label: 'Apartment', icon: Building2 },
  event_hall: { label: 'Event Hall', icon: Building2 },
  event: { label: 'Event Venue', icon: Building2 },
  restaurant: { label: 'Restaurant', icon: Utensils },
  diner: { label: 'Diner', icon: Utensils },
  cafe: { label: 'Café', icon: Utensils },
  other_food: { label: 'Food', icon: Utensils },
  sports: { label: 'Sports', icon: Sparkles },
  spa: { label: 'Spa', icon: Sparkles },
  beauty_salon: { label: 'Salon', icon: Sparkles },
  activity_place: { label: 'Activity', icon: Sparkles }
};

// Helper function to get business image based on business_type (via group)
const getBusinessImage = (businessType, index) => {
  const group = businessTypeToGroup[businessType] || 'stays';
  const images = businessImages[group] || businessImages.stays;
  return images[index % images.length];
};

function HomePage() {
  const navigate = useNavigate();
  
  // State
  const [selectedCategory, setSelectedCategory] = useState('stays');
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [otherDate, setOtherDate] = useState('');
  const [foodDate, setFoodDate] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBusinessLogin, setShowBusinessLogin] = useState(false);
  const [heroKey, setHeroKey] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  // Business user state from localStorage
  const [businessUser, setBusinessUser] = useState(() => {
    const savedBusiness = localStorage.getItem('businessUser');
    return savedBusiness ? JSON.parse(savedBusiness) : null;
  });

  // Handle window resize for responsive design
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check custom domain
  useEffect(() => {
    const checkCustomDomain = async () => {
      try {
        if (window.location.pathname !== '/') return;
        const currentDomain = window.location.hostname;
        const response = await fetch(`${API_BASE}/api/domain-info?domain=${currentDomain}`);
        const data = await response.json();
        if (data.success && data.source === 'custom-domain-verified') {
          navigate(`/book/${data.business.slug}`);
        }
      } catch (error) {
        // Silent fail - custom domain check is optional
      }
    };
    checkCustomDomain();
  }, [navigate]);

  // Handle category change
  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setResults([]);
    setLocation('');
    setHeroKey(prev => prev + 1);
  };

  // Handle search - uses state location
  const handleSearch = async () => {
    if (!location.trim()) {
      showError('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      // WHY: Send comma-separated business types for the selected group.
      // Backend expands this into an IN query.
      const typesForGroup = categoryGroups[selectedCategory] || [];
      const categoryParam = typesForGroup.join(',');

      let searchParams = { location };
      if (selectedCategory === 'stays') {
        searchParams.checkIn = checkIn;
        searchParams.checkOut = checkOut;
        searchParams.guests = guests;
      }
      
      const params = new URLSearchParams(searchParams);
      const response = await fetch(
        `${API_BASE}/api/businesses/search/category?category=${categoryParam}&${params}`
      );
      const data = await response.json();
      
      if (data.success) {
        setResults(data.businesses);
        if (data.businesses.length === 0 && location) {
          showError(`No results found in ${location}`);
        }
        
        // Scroll to results
        setTimeout(() => {
          const resultsElement = document.getElementById('results-section');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Search error:', error);
      showError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // Handle search with explicit location parameter (for destination cards)
  const handleSearchWithLocation = async (searchLocation) => {
    if (!searchLocation || !searchLocation.trim()) {
      showError('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const typesForGroup = categoryGroups[selectedCategory] || [];
      const categoryParam = typesForGroup.join(',');

      let searchParams = { location: searchLocation };
      if (selectedCategory === 'stays') {
        searchParams.checkIn = checkIn;
        searchParams.checkOut = checkOut;
        searchParams.guests = guests;
      }
      
      const params = new URLSearchParams(searchParams);
      const response = await fetch(
        `${API_BASE}/api/businesses/search/category?category=${categoryParam}&${params}`
      );
      const data = await response.json();
      
      if (data.success) {
        setResults(data.businesses);
        if (data.businesses.length === 0 && searchLocation) {
          showError(`No results found in ${searchLocation}`);
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
      showError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // WHY: Every "Book Now" click routes to the UnifiedBookingPage.
  // That page handles ALL business types (hotel, apartment, restaurant,
  // spa, sports, event_hall, etc.) via its own business-type-aware config.
  // Routing through it avoids duplicating logic and prevents blank pages.
  const handleDirectBook = (business) => {
    navigate(`/book/${business.slug}`);
  };

  // Navigate to admin
  const goToAdmin = () => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      window.location.href = '/admin';
    } else {
      navigate('/admin');
    }
  };

  // Render business dashboard if logged in
  if (businessUser) {
    if (businessUser.staffUser) {
      return React.createElement(StaffDashboard, { 
        staff: businessUser.staffUser, 
        business: businessUser, 
        onLogout: () => { 
          setBusinessUser(null); 
          localStorage.removeItem('businessUser'); 
        } 
      });
    }
    return React.createElement(BusinessDashboard, { 
      business: businessUser, 
      onLogout: () => { 
        setBusinessUser(null); 
        localStorage.removeItem('businessUser'); 
      } 
    });
  }

  // Helper functions
  const getCategoryPlaceholder = () => 'e.g., Lagos, Abuja, Port Harcourt';
  
  const getSearchButtonText = () => {
    if (loading) return 'Searching...';
    const texts = { 
      stays: 'Search Stays', 
      food: 'Search Food', 
      others: 'Search Others' 
    };
    return texts[selectedCategory];
  };

  const getResultsHeading = () => {
    const headings = {
      stays: 'Available Stays',
      food: 'Food Options',
      others: 'Available in Others'
    };
    return headings[selectedCategory];
  };

  const getNoResultsCopy = () => {
    const copy = {
      stays: 'stays',
      food: 'food options',
      others: 'options'
    };
    return copy[selectedCategory];
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
    marginBottom: isDesktop ? '32px' : '16px',
    flexWrap: 'wrap',
    gap: isDesktop ? '16px' : '8px'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: isDesktop ? '24px' : '18px',
    fontWeight: '700',
    color: brandIndigo,
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    flexShrink: 0
  };

  const headerButtonsStyle = {
    display: 'flex',
    gap: isDesktop ? '12px' : '6px',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end'
  };

  const buttonStyle = {
    padding: isDesktop ? '8px 20px' : '6px 10px',
    borderRadius: '100px',
    fontSize: isDesktop ? '14px' : '11px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    whiteSpace: 'nowrap'
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
    marginBottom: isDesktop ? '32px' : '24px',
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

  // Category Cards
  const categoryCardStyle = (isActive) => ({
    flex: 1,
    minWidth: isDesktop ? 'auto' : '0',
    padding: isDesktop ? '12px 16px' : '8px 6px',
    background: isActive ? brandIndigo : 'white',
    border: isActive ? 'none' : '1px solid #e8e8e8',
    borderRadius: isDesktop ? '16px' : '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? `0 2px 8px ${brandIndigo}33` : 'none',
    textAlign: 'center'
  });

  const categoryIconStyle = (isActive) => ({
    width: isDesktop ? '40px' : '28px',
    height: isDesktop ? '40px' : '28px',
    background: isActive ? 'rgba(255,255,255,0.15)' : '#f5f5f5',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 4px'
  });

  const categoryTitleStyle = (isActive) => ({
    fontWeight: '600',
    fontSize: isDesktop ? '14px' : '11px',
    marginBottom: '0px',
    color: isActive ? 'white' : '#1a1a1a'
  });

  const categoryDescStyle = (isActive) => ({
    fontSize: '10px',
    color: isActive ? 'rgba(255,255,255,0.7)' : '#999',
    display: isDesktop ? 'block' : 'none'
  });

  // Trust Badges
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

  // Search Card
  const searchCardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: isDesktop ? '24px 28px' : '20px',
    marginBottom: '48px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0',
    width: '100%'
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

  // Results Section
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

  // Features Section
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

  // ========== RENDER ==========
  return React.createElement('div', { style: containerStyle },
    // Header
    React.createElement('div', { style: headerStyle },
      React.createElement('div', { style: logoStyle, onClick: () => window.location.reload() },
        React.createElement(Building2, { size: isDesktop ? 24 : 18, color: brandIndigo }),
        React.createElement('span', null, 'BookingHub')  // NOTE: logo swap comes later from Emmanuel's file
      ),
      React.createElement('div', { style: headerButtonsStyle },
        React.createElement('button', 
          { 
            onClick: goToAdmin, 
            style: secondaryButtonStyle,
            onMouseEnter: (e) => { e.currentTarget.style.borderColor = brandIndigo; },
            onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; }
          },
          React.createElement(Shield, { size: isDesktop ? 14 : 12 }), 
          isDesktop ? ' Admin' : ''
        ),
        React.createElement('button', 
          { 
            onClick: () => navigate('/become-host'), 
            style: secondaryButtonStyle,
            onMouseEnter: (e) => { e.currentTarget.style.borderColor = brandIndigo; },
            onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; }
          },
          isDesktop ? 'Become a Host' : 'Host'
        ),
        React.createElement('button', 
          { 
            onClick: () => setShowBusinessLogin(true), 
            style: primaryButtonStyle,
            onMouseEnter: (e) => { e.currentTarget.style.background = brandIndigoDark; },
            onMouseLeave: (e) => { e.currentTarget.style.background = brandIndigo; }
          },
          isDesktop ? 'Business Login' : 'Login'
        )
      )
    ),

    // Category Cards
    React.createElement('div', { 
      style: { 
        display: 'flex', 
        gap: isDesktop ? '16px' : '8px',
        marginBottom: isDesktop ? '32px' : '16px',
        flexWrap: 'nowrap'
      } 
    },
      // STAYS
      React.createElement('div', 
        { 
          onClick: () => handleCategoryChange('stays'), 
          style: categoryCardStyle(selectedCategory === 'stays'),
          onMouseEnter: (e) => { 
            if (selectedCategory !== 'stays') { 
              e.currentTarget.style.borderColor = brandIndigoLight; 
              e.currentTarget.style.transform = 'translateY(-2px)'; 
            } 
          },
          onMouseLeave: (e) => { 
            if (selectedCategory !== 'stays') { 
              e.currentTarget.style.borderColor = '#e8e8e8'; 
              e.currentTarget.style.transform = 'translateY(0)'; 
            } 
          }
        },
        React.createElement('div', { style: categoryIconStyle(selectedCategory === 'stays') },
          React.createElement(Building2, { size: isDesktop ? 20 : 14, color: selectedCategory === 'stays' ? 'white' : brandIndigo })
        ),
        React.createElement('div', { style: categoryTitleStyle(selectedCategory === 'stays') }, 'Stays'),
        React.createElement('div', { style: categoryDescStyle(selectedCategory === 'stays') }, 'Hotels, apartments & venues')
      ),
      
      // FOOD
      React.createElement('div', 
        { 
          onClick: () => handleCategoryChange('food'), 
          style: categoryCardStyle(selectedCategory === 'food'),
          onMouseEnter: (e) => { 
            if (selectedCategory !== 'food') { 
              e.currentTarget.style.borderColor = brandIndigoLight; 
              e.currentTarget.style.transform = 'translateY(-2px)'; 
            } 
          },
          onMouseLeave: (e) => { 
            if (selectedCategory !== 'food') { 
              e.currentTarget.style.borderColor = '#e8e8e8'; 
              e.currentTarget.style.transform = 'translateY(0)'; 
            } 
          }
        },
        React.createElement('div', { style: categoryIconStyle(selectedCategory === 'food') },
          React.createElement(Utensils, { size: isDesktop ? 20 : 14, color: selectedCategory === 'food' ? 'white' : brandIndigo })
        ),
        React.createElement('div', { style: categoryTitleStyle(selectedCategory === 'food') }, 'Food'),
        React.createElement('div', { style: categoryDescStyle(selectedCategory === 'food') }, 'Restaurants, cafés & more')
      ),
      
      // OTHERS
      React.createElement('div', 
        { 
          onClick: () => handleCategoryChange('others'), 
          style: categoryCardStyle(selectedCategory === 'others'),
          onMouseEnter: (e) => { 
            if (selectedCategory !== 'others') { 
              e.currentTarget.style.borderColor = brandIndigoLight; 
              e.currentTarget.style.transform = 'translateY(-2px)'; 
            } 
          },
          onMouseLeave: (e) => { 
            if (selectedCategory !== 'others') { 
              e.currentTarget.style.borderColor = '#e8e8e8'; 
              e.currentTarget.style.transform = 'translateY(0)'; 
            } 
          }
        },
        React.createElement('div', { style: categoryIconStyle(selectedCategory === 'others') },
          React.createElement(Sparkles, { size: isDesktop ? 20 : 14, color: selectedCategory === 'others' ? 'white' : brandIndigo })
        ),
        React.createElement('div', { style: categoryTitleStyle(selectedCategory === 'others') }, 'Others'),
        React.createElement('div', { style: categoryDescStyle(selectedCategory === 'others') }, 'Spas, salons & activities')
      )
    ),

    // Hero Section
    React.createElement('div', { key: heroKey, style: heroSectionStyle },
      React.createElement('div', { style: heroOverlayStyle }),
      React.createElement('div', { style: heroContentStyle },
        React.createElement('h1', { style: heroTitleStyle }, heroTitles[selectedCategory]),
        React.createElement('p', { style: heroSubtitleStyle }, heroSubtitles[selectedCategory])
      )
    ),

    // Search Card
    React.createElement('div', { style: searchCardStyle },
      React.createElement('div', { style: formGridStyle },
        // Location Input
        React.createElement('div', { style: inputWrapperStyle },
          React.createElement(MapPin, { size: 14, style: inputIconStyle }),
          React.createElement('input', { 
            type: 'text', 
            placeholder: getCategoryPlaceholder(), 
            value: location, 
            onChange: (e) => setLocation(e.target.value), 
            onKeyPress: (e) => { if (e.key === 'Enter') handleSearch(); }, 
            style: inputFieldStyle,
            onFocus: (e) => { e.currentTarget.style.borderColor = brandIndigo; e.currentTarget.style.background = 'white'; },
            onBlur: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fafafa'; }
          })
        ),
        
        // STAYS - Check-in
        selectedCategory === 'stays' && React.createElement('div', { style: inputWrapperStyle },
          React.createElement(Calendar, { size: 14, style: inputIconStyle }),
          React.createElement('input', { 
            type: 'date', 
            value: checkIn, 
            onChange: (e) => setCheckIn(e.target.value), 
            style: inputFieldStyle,
            onFocus: (e) => { e.currentTarget.style.borderColor = brandIndigo; e.currentTarget.style.background = 'white'; },
            onBlur: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fafafa'; }
          })
        ),
        
        // STAYS - Check-out
        selectedCategory === 'stays' && React.createElement('div', { style: inputWrapperStyle },
          React.createElement(Calendar, { size: 14, style: inputIconStyle }),
          React.createElement('input', { 
            type: 'date', 
            value: checkOut, 
            onChange: (e) => setCheckOut(e.target.value), 
            style: inputFieldStyle,
            onFocus: (e) => { e.currentTarget.style.borderColor = brandIndigo; e.currentTarget.style.background = 'white'; },
            onBlur: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fafafa'; }
          })
        ),
        
        // STAYS - Guests
        selectedCategory === 'stays' && React.createElement('div', { style: inputWrapperStyle },
          React.createElement(Users, { size: 14, style: inputIconStyle }),
          React.createElement('select', { 
            value: guests, 
            onChange: (e) => setGuests(parseInt(e.target.value)), 
            style: { ...inputFieldStyle, cursor: 'pointer', appearance: 'none', paddingRight: '24px' },
            onFocus: (e) => { e.currentTarget.style.borderColor = brandIndigo; e.currentTarget.style.background = 'white'; },
            onBlur: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fafafa'; }
          },
            [1, 2, 3, 4, 5, 6].map(num => 
              React.createElement('option', { key: num, value: num }, `${num} Guest${num > 1 ? 's' : ''}`)
            )
          )
        ),
        
        // FOOD / OTHERS - single date
        (selectedCategory === 'food' || selectedCategory === 'others') && React.createElement('div', { style: inputWrapperStyle },
          React.createElement(Calendar, { size: 14, style: inputIconStyle }),
          React.createElement('input', { 
            type: 'date', 
            value: selectedCategory === 'food' ? foodDate : otherDate, 
            onChange: (e) => selectedCategory === 'food' ? setFoodDate(e.target.value) : setOtherDate(e.target.value), 
            style: inputFieldStyle,
            min: new Date().toISOString().split('T')[0],
            onFocus: (e) => { e.currentTarget.style.borderColor = brandIndigo; e.currentTarget.style.background = 'white'; },
            onBlur: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fafafa'; }
          })
        ),
        
        // Search Button
        React.createElement('button', { 
          onClick: handleSearch, 
          disabled: loading, 
          style: searchBtnStyle,
          onMouseEnter: (e) => { if (!loading) e.currentTarget.style.background = brandIndigoDark; },
          onMouseLeave: (e) => { e.currentTarget.style.background = brandIndigo; }
        },
          loading ? React.createElement(Loader2, { size: 16, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Search, { size: 14 }),
          getSearchButtonText()
        )
      )
    ),

    // Trust Badges
    React.createElement('div', { style: trustBadgesStyle },
      React.createElement('div', { style: trustBadgeStyle }, 
        React.createElement(Sparkles, { size: 14, color: brandIndigo }), 
        '200+ venues'
      ),
      React.createElement('div', { style: trustBadgeStyle }, 
        React.createElement(Clock, { size: 14, color: brandIndigo }), 
        'Instant confirmation'
      ),
      React.createElement('div', { style: trustBadgeStyle }, 
        React.createElement(CreditCard, { size: 14, color: brandIndigo }), 
        'Pay online or at venue'
      )
    ),

    // Destination Cards Section
    React.createElement(DestinationCards, {
      onSelectLocation: (location) => {
        setLocation(location);
        handleSearchWithLocation(location);
      }
    }),

    // Popular Stays Section
    React.createElement(PopularStays, {
      onSelectHotel: (hotel) => {
        if (hotel && hotel.location) {
          setLocation(hotel.location);
          setTimeout(() => handleSearch(), 300);
        }
      }
    }),

    // Results Section
    results.length > 0 && React.createElement('div', { id: 'results-section' },
      React.createElement('div', { style: resultsHeaderStyle },
        React.createElement('div', null,
          React.createElement('h2', { style: resultsTitleStyle }, getResultsHeading()),
          React.createElement('p', { style: { fontSize: '13px', color: '#888', marginTop: '2px' } }, 
            `${results.length} ${results.length === 1 ? 'result' : 'results'} found`
          )
        )
      )
    ),

    // Loading Skeletons
    loading && React.createElement('div', { style: resultsGridStyle },
      [1, 2, 3].map(i => 
        React.createElement('div', { key: i, style: { ...resultCardStyle, cursor: 'default' } },
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
        )
      )
    ),

    // Results Grid
    !loading && results.length > 0 && React.createElement('div', { style: resultsGridStyle },
      results.map((business, index) => {
        // WHY: Resolve display label + icon for this specific business_type.
        const display = businessTypeDisplay[business.business_type] || { label: 'Business', icon: Building2 };
        const TypeIcon = display.icon;

        return React.createElement('div', 
          { 
            key: business.id, 
            style: resultCardStyle,
            onMouseEnter: (e) => { 
              e.currentTarget.style.transform = 'translateY(-4px)'; 
              e.currentTarget.style.boxShadow = `0 8px 20px ${brandIndigo}1A`; 
            },
            onMouseLeave: (e) => { 
              e.currentTarget.style.transform = 'translateY(0)'; 
              e.currentTarget.style.boxShadow = 'none'; 
            }
          },
          // Image
          React.createElement('img', { 
            src: getBusinessImage(business.business_type, index), 
            alt: business.name, 
            style: resultImageStyle 
          }),
          
          // Content
          React.createElement('div', { style: resultContentStyle },
            // Header with name and rating
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' } },
              React.createElement('div', null,
                React.createElement('h3', { style: resultNameStyle }, business.name),
                React.createElement('div', { style: { marginTop: '6px' } },
                  React.createElement('div', { style: resultTypeBadgeStyle },
                    React.createElement(TypeIcon, { size: 10 }),
                    React.createElement('span', null, display.label)
                  )
                )
              ),
              // Rating
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' } },
                  React.createElement(Star, { size: 12, fill: '#f5a623', color: '#f5a623' }),
                  React.createElement('span', { style: { fontWeight: '500', fontSize: '12px' } }, '4.9')
                ),
                React.createElement('div', { style: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a' } }, '₦0'),
                React.createElement('div', { style: { fontSize: '10px', color: '#999' } }, 'starting price')
              )
            ),
            
            // Location
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '12px', marginBottom: '10px' } },
              React.createElement(MapPin, { size: 12 }),
              React.createElement('span', null, `${business.city || 'Lagos'}, ${business.state || 'Lagos'}`)
            ),
            
            // Description
            React.createElement('p', { style: { color: '#888', fontSize: '12px', lineHeight: '1.4', marginBottom: '14px' } },
              business.description ? business.description.substring(0, 70) + '...' : 'Experience premium hospitality and comfort.'
            ),
            
            // Action Buttons
            React.createElement('div', { style: { display: 'flex', gap: '10px' } },
              React.createElement('button', { 
                onClick: () => handleDirectBook(business), 
                style: bookBtnStyle,
                onMouseEnter: (e) => e.currentTarget.style.background = brandIndigoDark,
                onMouseLeave: (e) => e.currentTarget.style.background = brandIndigo
              }, 
                'Book Now', 
                React.createElement(ArrowRight, { size: 12, style: { marginLeft: '4px' } })
              ),
              React.createElement('button', { 
                onClick: () => navigate(`/book/${business.slug}`), 
                style: detailsBtnStyle,
                onMouseEnter: (e) => e.currentTarget.style.background = '#e8e8e8',
                onMouseLeave: (e) => e.currentTarget.style.background = '#f5f5f5'
              }, 
                'Details'
              )
            )
          )
        );
      })
    ),

    // No Results
    !loading && results.length === 0 && location && React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px' } },
      React.createElement(Search, { size: 48, color: '#ccc', style: { marginBottom: '16px' } }),
      React.createElement('h3', { style: { fontSize: '18px', fontWeight: '500', color: '#1a1a1a', marginBottom: '8px' } }, 'No results found'),
      React.createElement('p', { style: { color: '#888', marginBottom: '20px', fontSize: '14px' } }, 
        `We couldn't find any ${getNoResultsCopy()} in "${location}".`
      ),
      React.createElement('button', { 
        onClick: () => { setLocation(''); setSelectedCategory('stays'); }, 
        style: { padding: '10px 24px', background: brandIndigo, border: 'none', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', color: 'white', fontSize: '13px' } 
      }, 
        'Clear Search'
      )
    ),

    // Features Section
    !loading && results.length === 0 && !location && React.createElement('div', { style: featuresGridStyle },
      React.createElement('div', { style: featureItemStyle },
        React.createElement('div', { style: featureIconStyle }, 
          React.createElement(Award, { size: 20, color: brandIndigo })
        ),
        React.createElement('div', { style: featureTitleStyle }, 'Verified Venues'),
        React.createElement('div', { style: featureDescStyle }, 'All properties vetted')
      ),
      React.createElement('div', { style: featureItemStyle },
        React.createElement('div', { style: featureIconStyle }, 
          React.createElement(Clock, { size: 20, color: brandIndigo })
        ),
        React.createElement('div', { style: featureTitleStyle }, 'Instant Booking'),
        React.createElement('div', { style: featureDescStyle }, 'Immediate confirmation')
      ),
      React.createElement('div', { style: featureItemStyle },
        React.createElement('div', { style: featureIconStyle }, 
          React.createElement(Shield, { size: 20, color: brandIndigo })
        ),
        React.createElement('div', { style: featureTitleStyle }, 'Secure Payments'),
        React.createElement('div', { style: featureDescStyle }, 'Fraud protection')
      ),
      React.createElement('div', { style: featureItemStyle },
        React.createElement('div', { style: featureIconStyle }, 
          React.createElement(Headphones, { size: 20, color: brandIndigo })
        ),
        React.createElement('div', { style: featureTitleStyle }, '24/7 Support'),
        React.createElement('div', { style: featureDescStyle }, 'Always here to help')
      )
    ),

    // Business Login Modal
    showBusinessLogin && React.createElement(BusinessLogin, { 
      onClose: () => setShowBusinessLogin(false) 
    })
  );
}

export default HomePage;