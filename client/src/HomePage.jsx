// FILE: client/src/HomePage.jsx
// UPDATED 22 Sept 2026:
//  - REMOVED DestinationCards and PopularStays (both hardcoded fake data)
//  - ADDED real "Available on Plazzaa" grid — pulls approved businesses from /api/businesses
//  - Cards now use REAL image (cover_image || logo_url || rooms[0].images[0])
//  - Cards no longer show fake ₦0, fake 4.9 rating, or fake fallback description
//  - Clicking a card routes straight to /book/{slug} — no location toast
// UPDATED 22 Sept 2026 (later):
//  - Search card grid now ALWAYS renders 5 children so tracks never collapse
//  - Empty cells pad Food/Others tabs — no more width jump between tabs
//  - Search button has a fixed minWidth so its column can't stretch
//  - WHY: previously Stays had 5 children and Food/Others had 3 — the grid
//    collapsed the missing tracks and widened the rest, so the card's content
//    visually resized when switching tabs. Now every tab = 5 tracks = stable width.

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
import API_BASE from './config';

// Brand colors — still indigo until the full palette swap (post-demo)
const brandIndigo = '#4F46E5';
const brandIndigoLight = '#6366F1';
const brandIndigoDark = '#4338CA';

// ============================================================
// CATEGORY GROUPS
// ============================================================
const categoryGroups = {
  stays: ['hotel', 'apartment', 'event_hall', 'event'],
  food: ['restaurant', 'diner', 'cafe', 'other_food'],
  others: ['sports', 'spa', 'beauty_salon', 'activity_place']
};

const heroImages = {
  stays: 'https://www.savoydubai.com/wp-content/uploads/sites/183/2022/09/Savoy-Suites-Master-Bedroom-2BR-1-2200x1200.jpg',
  food: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS0klqKVCFMw_l2R1UnjsXzmvozatheQZ5dekGoBFyX1oFdK3HXtX7qvs&s=10',
  others: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGyiajxYGnmi6i-mnxHCw0ZifBMBDgMHeTbqJNki2TGLmA7CNHCbalzWIE&s=10'
};

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

// ============================================================
// IMAGE RESOLVER
// ============================================================
// WHY: Businesses can upload images in three places:
//  1. cover_image — legacy field, still respected if set
//  2. logo_url — what BusinessProfile writes today
//  3. rooms[].images[] — per-item, first is labelled "Primary" in RoomPage
// We show the SAME image the owner picked in their dashboard.
function resolveBusinessImage(business) {
  if (!business) return null;
  if (business.cover_image) return business.cover_image;
  if (business.logo_url) return business.logo_url;
  const rooms = business.rooms;
  if (Array.isArray(rooms) && rooms.length > 0) {
    const imgs = rooms[0]?.images;
    if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
  }
  return null;
}

// WHY: Never show "Lagos, Lagos". Show the real area, or nothing.
function formatBusinessArea(business) {
  if (!business) return '';
  const city = (business.city || '').trim();
  const state = (business.state || '').trim();
  if (city && state && city.toLowerCase() !== state.toLowerCase()) return `${city}, ${state}`;
  return city || state || '';
}

// ============================================================
// BUSINESS CARD (shared by available grid + search results)
// ============================================================
function BusinessCard({ business, isDesktop, onClick }) {
  const display = businessTypeDisplay[business.business_type] || { label: 'Business', icon: Building2 };
  const TypeIcon = display.icon;
  const area = formatBusinessArea(business);
  const imageUrl = resolveBusinessImage(business);

  const cardStyle = { background: 'white', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s ease', border: '1px solid #eee', cursor: 'pointer' };
  const imageStyle = { width: '100%', height: '200px', objectFit: 'cover', display: 'block', background: '#f0f0f0' };
  const placeholderStyle = { width: '100%', height: '200px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' };
  const contentStyle = { padding: '16px' };
  const nameStyle = { fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' };
  const badgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '500', background: '#EEF2FF', color: brandIndigo };
  const areaStyle = { display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '12px', marginTop: '8px', marginBottom: '10px' };
  const descriptionStyle = { color: '#888', fontSize: '12px', lineHeight: '1.4', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
  const bookBtnStyle = { flex: 1, padding: '10px', background: brandIndigo, border: 'none', borderRadius: '100px', fontSize: '13px', fontWeight: '500', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' };

  return React.createElement('div',
    {
      style: cardStyle,
      onClick: onClick,
      onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${brandIndigo}1A`; },
      onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }
    },
    imageUrl
      ? React.createElement('img', { src: imageUrl, alt: business.name, style: imageStyle, onError: (e) => { e.currentTarget.style.display = 'none'; } })
      : React.createElement('div', { style: placeholderStyle }, 'No image yet'),

    React.createElement('div', { style: contentStyle },
      React.createElement('div', { style: { marginBottom: '10px' } },
        React.createElement('h3', { style: nameStyle }, business.name),
        React.createElement('div', { style: { marginTop: '6px' } },
          React.createElement('div', { style: badgeStyle },
            React.createElement(TypeIcon, { size: 10 }),
            React.createElement('span', null, display.label)
          )
        )
      ),
      area && React.createElement('div', { style: areaStyle },
        React.createElement(MapPin, { size: 12 }),
        React.createElement('span', null, area)
      ),
      business.description && React.createElement('p', { style: descriptionStyle }, business.description),
      React.createElement('div', { style: { display: 'flex', gap: '10px' } },
        React.createElement('button', {
          onClick: (e) => { e.stopPropagation(); onClick(); },
          style: bookBtnStyle,
          onMouseEnter: (e) => e.currentTarget.style.background = brandIndigoDark,
          onMouseLeave: (e) => e.currentTarget.style.background = brandIndigo
        }, 'Book Now', React.createElement(ArrowRight, { size: 12 }))
      )
    )
  );
}

function HomePage() {
  const navigate = useNavigate();

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

  const [approvedBusinesses, setApprovedBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  const [businessUser, setBusinessUser] = useState(() => {
    const savedBusiness = localStorage.getItem('businessUser');
    return savedBusiness ? JSON.parse(savedBusiness) : null;
  });

  useEffect(() => {
    function handleResize() { setIsDesktop(window.innerWidth >= 768); }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchApprovedBusinesses() {
      try {
        setLoadingBusinesses(true);
        const response = await fetch(`${API_BASE}/api/businesses`);
        const data = await response.json();
        if (!cancelled && data.success && Array.isArray(data.businesses)) {
          setApprovedBusinesses(data.businesses);
        }
      } catch (error) {
        console.error('Failed to load approved businesses:', error);
      } finally {
        if (!cancelled) setLoadingBusinesses(false);
      }
    }
    fetchApprovedBusinesses();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const checkCustomDomain = async () => {
      try {
        if (window.location.pathname !== '/') return;
        const currentDomain = window.location.hostname;
        const response = await fetch(`${API_BASE}/api/domain-info?domain=${currentDomain}`);
        const data = await response.json();
        if (data.success && data.source === 'custom-domain-verified') navigate(`/book/${data.business.slug}`);
      } catch (error) { /* optional */ }
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
    if (!location.trim()) { showError('Please enter a location'); return; }
    setLoading(true);
    try {
      const typesForGroup = categoryGroups[selectedCategory] || [];
      const categoryParam = typesForGroup.join(',');
      let searchParams = { location };
      if (selectedCategory === 'stays') { searchParams.checkIn = checkIn; searchParams.checkOut = checkOut; searchParams.guests = guests; }
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`${API_BASE}/api/businesses/search/category?category=${categoryParam}&${params}`);
      const data = await response.json();
      if (data.success) {
        setResults(data.businesses);
        if (data.businesses.length === 0 && location) showError(`No results found in ${location}`);
        setTimeout(() => { const el = document.getElementById('results-section'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
      }
    } catch (error) {
      console.error('Search error:', error);
      showError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleDirectBook = useCallback((business) => {
    if (!business || !business.slug) return;
    navigate(`/book/${business.slug}`);
  }, [navigate]);

  const goToAdmin = () => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) window.location.href = '/admin';
    else navigate('/admin');
  };

  if (businessUser) {
    if (businessUser.staffUser) {
      return React.createElement(StaffDashboard, { staff: businessUser.staffUser, business: businessUser, onLogout: () => { setBusinessUser(null); localStorage.removeItem('businessUser'); } });
    }
    return React.createElement(BusinessDashboard, { business: businessUser, onLogout: () => { setBusinessUser(null); localStorage.removeItem('businessUser'); } });
  }

  const getCategoryPlaceholder = () => 'e.g., Lagos, Abuja, Port Harcourt';
  const getSearchButtonText = () => { if (loading) return 'Searching...'; return { stays: 'Search Stays', food: 'Search Food', others: 'Search Others' }[selectedCategory]; };
  const getResultsHeading = () => ({ stays: 'Available Stays', food: 'Food Options', others: 'Available in Others' })[selectedCategory];
  const getNoResultsCopy = () => ({ stays: 'stays', food: 'food options', others: 'options' })[selectedCategory];

  // ========== STYLES ==========
  const containerStyle = { maxWidth: '1280px', margin: '0 auto', padding: isDesktop ? '20px 32px' : '16px 20px', minHeight: '100vh', background: '#ffffff' };
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDesktop ? '32px' : '16px', flexWrap: 'wrap', gap: isDesktop ? '16px' : '8px' };
  const logoStyle = { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 };
  const logoImgStyle = { height: isDesktop ? '28px' : '24px', width: isDesktop ? '28px' : '24px', backgroundColor: brandIndigo, WebkitMaskImage: 'url(/plazzaa-icon-1.png)', maskImage: 'url(/plazzaa-icon-1.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', display: 'block', flexShrink: 0 };
  const logoTextStyle = { fontSize: isDesktop ? '20px' : '17px', fontWeight: '800', color: brandIndigo, letterSpacing: '-0.02em' };
  const headerButtonsStyle = { display: 'flex', gap: isDesktop ? '12px' : '6px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' };
  const buttonStyle = { padding: isDesktop ? '8px 20px' : '6px 10px', borderRadius: '100px', fontSize: isDesktop ? '14px' : '11px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', whiteSpace: 'nowrap' };
  const primaryButtonStyle = { ...buttonStyle, background: brandIndigo, color: 'white' };
  const secondaryButtonStyle = { ...buttonStyle, background: 'white', color: '#1a1a1a', border: '1px solid #e5e5e5' };
  const heroSectionStyle = { width: '100%', height: isDesktop ? '420px' : '320px', borderRadius: '20px', marginBottom: isDesktop ? '32px' : '24px', backgroundImage: `url(${heroImages[selectedCategory]})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', position: 'relative' };
  const heroOverlayStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.55))', borderRadius: '20px' };
  const heroContentStyle = { position: 'absolute', bottom: 0, left: 0, right: 0, padding: isDesktop ? '40px 48px 48px' : '24px 24px 32px', color: 'white', zIndex: 2 };
  const heroTitleStyle = { fontSize: isDesktop ? '44px' : '32px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.02em', color: 'white', lineHeight: '1.2' };
  const heroSubtitleStyle = { fontSize: isDesktop ? '16px' : '14px', opacity: 0.9, color: 'white', lineHeight: '1.4' };
  const categoryCardStyle = (isActive) => ({ flex: 1, minWidth: isDesktop ? 'auto' : '0', padding: isDesktop ? '12px 16px' : '8px 6px', background: isActive ? brandIndigo : 'white', border: isActive ? 'none' : '1px solid #e8e8e8', borderRadius: isDesktop ? '16px' : '10px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: isActive ? `0 2px 8px ${brandIndigo}33` : 'none', textAlign: 'center' });
  const categoryIconStyle = (isActive) => ({ width: isDesktop ? '40px' : '28px', height: isDesktop ? '40px' : '28px', background: isActive ? 'rgba(255,255,255,0.15)' : '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' });
  const categoryTitleStyle = (isActive) => ({ fontWeight: '600', fontSize: isDesktop ? '14px' : '11px', marginBottom: '0px', color: isActive ? 'white' : '#1a1a1a' });
  const categoryDescStyle = (isActive) => ({ fontSize: '10px', color: isActive ? 'rgba(255,255,255,0.7)' : '#999', display: isDesktop ? 'block' : 'none' });
  const trustBadgesStyle = { display: 'flex', justifyContent: 'center', gap: isDesktop ? '32px' : '20px', marginBottom: '32px', flexWrap: 'wrap' };
  const trustBadgeStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', color: '#666' };
  const searchCardStyle = { background: 'white', borderRadius: '20px', padding: isDesktop ? '24px 28px' : '20px', marginBottom: '48px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', width: '100%', boxSizing: 'border-box' };
  // WHY: Grid ALWAYS has 5 tracks on desktop. Empty cells fill the tabs that show fewer fields,
  // so no track collapses and no remaining track stretches. Width stays identical across tabs.
  const formGridStyle = { display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr 1fr 1fr auto' : '1fr', gap: '12px', alignItems: 'center', width: '100%' };
  const inputWrapperStyle = { position: 'relative' };
  // WHY: Empty cells are hidden on mobile so the stacked layout shows only the fields relevant
  // to the current tab. On desktop they reserve a grid track so the row never reflows.
  const emptyCellStyle = { display: isDesktop ? 'block' : 'none' };
  const inputIconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' };
  const inputFieldStyle = { width: '100%', padding: '12px 12px 12px 36px', border: '1px solid #e5e5e5', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#fafafa' };
  // WHY: minWidth + a fixed track for the button mean the button never grows or shrinks,
  // regardless of how many empty cells are on the row. This is what stops the "resize" jitter.
  const searchBtnStyle = { padding: '12px 24px', minWidth: isDesktop ? '160px' : 'auto', background: loading ? '#94a3b8' : brandIndigo, color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', justifyContent: 'center', transition: 'all 0.2s ease' };
  const sectionHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' };
  const sectionTitleStyle = { fontSize: isDesktop ? '22px' : '18px', fontWeight: '600', color: '#1a1a1a' };
  const sectionSubtitleStyle = { fontSize: '13px', color: '#888', marginTop: '4px' };
  const resultsGridStyle = { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', gap: '24px' };
  const featuresGridStyle = { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '32px', marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #eee' };
  const featureItemStyle = { textAlign: 'center' };
  const featureIconStyle = { width: '44px', height: '44px', background: '#EEF2FF', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' };
  const featureTitleStyle = { fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' };
  const featureDescStyle = { fontSize: '12px', color: '#888' };
  const skeletonCardStyle = { background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee' };
  const skeletonImageStyle = { width: '100%', height: '200px', background: '#f0f0f0' };
  const skeletonContentStyle = { padding: '16px' };

  // ========== RENDER ==========
  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: headerStyle },
      React.createElement('div', { style: logoStyle, onClick: () => window.location.reload() },
        React.createElement('div', { style: logoImgStyle, role: 'img', 'aria-label': 'Plazzaa' }),
        React.createElement('span', { style: logoTextStyle }, 'Plazzaa')
      ),
      React.createElement('div', { style: headerButtonsStyle },
        React.createElement('button', { onClick: goToAdmin, style: secondaryButtonStyle, onMouseEnter: (e) => { e.currentTarget.style.borderColor = brandIndigo; }, onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; } },
          React.createElement(Shield, { size: isDesktop ? 14 : 12 }), isDesktop ? ' Admin' : ''
        ),
        React.createElement('button', { onClick: () => navigate('/become-host'), style: secondaryButtonStyle, onMouseEnter: (e) => { e.currentTarget.style.borderColor = brandIndigo; }, onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#e5e5e5'; } },
          isDesktop ? 'Become a Host' : 'Host'
        ),
        React.createElement('button', { onClick: () => setShowBusinessLogin(true), style: primaryButtonStyle, onMouseEnter: (e) => { e.currentTarget.style.background = brandIndigoDark; }, onMouseLeave: (e) => { e.currentTarget.style.background = brandIndigo; } },
          isDesktop ? 'Business Login' : 'Login'
        )
      )
    ),

    React.createElement('div', { style: { display: 'flex', gap: isDesktop ? '16px' : '8px', marginBottom: isDesktop ? '32px' : '16px', flexWrap: 'nowrap' } },
      React.createElement('div', { onClick: () => handleCategoryChange('stays'), style: categoryCardStyle(selectedCategory === 'stays') },
        React.createElement('div', { style: categoryIconStyle(selectedCategory === 'stays') }, React.createElement(Building2, { size: isDesktop ? 20 : 14, color: selectedCategory === 'stays' ? 'white' : brandIndigo })),
        React.createElement('div', { style: categoryTitleStyle(selectedCategory === 'stays') }, 'Stays'),
        React.createElement('div', { style: categoryDescStyle(selectedCategory === 'stays') }, 'Hotels, apartments & venues')
      ),
      React.createElement('div', { onClick: () => handleCategoryChange('food'), style: categoryCardStyle(selectedCategory === 'food') },
        React.createElement('div', { style: categoryIconStyle(selectedCategory === 'food') }, React.createElement(Utensils, { size: isDesktop ? 20 : 14, color: selectedCategory === 'food' ? 'white' : brandIndigo })),
        React.createElement('div', { style: categoryTitleStyle(selectedCategory === 'food') }, 'Food'),
        React.createElement('div', { style: categoryDescStyle(selectedCategory === 'food') }, 'Restaurants, cafés & more')
      ),
      React.createElement('div', { onClick: () => handleCategoryChange('others'), style: categoryCardStyle(selectedCategory === 'others') },
        React.createElement('div', { style: categoryIconStyle(selectedCategory === 'others') }, React.createElement(Sparkles, { size: isDesktop ? 20 : 14, color: selectedCategory === 'others' ? 'white' : brandIndigo })),
        React.createElement('div', { style: categoryTitleStyle(selectedCategory === 'others') }, 'Others'),
        React.createElement('div', { style: categoryDescStyle(selectedCategory === 'others') }, 'Spas, salons & activities')
      )
    ),

    React.createElement('div', { key: heroKey, style: heroSectionStyle },
      React.createElement('div', { style: heroOverlayStyle }),
      React.createElement('div', { style: heroContentStyle },
        React.createElement('h1', { style: heroTitleStyle }, heroTitles[selectedCategory]),
        React.createElement('p', { style: heroSubtitleStyle }, heroSubtitles[selectedCategory])
      )
    ),

    // SEARCH CARD — always 5 grid children so tracks never collapse
    React.createElement('div', { style: searchCardStyle },
      React.createElement('div', { style: formGridStyle },
        // Cell 1: Location — always rendered
        React.createElement('div', { style: inputWrapperStyle },
          React.createElement(MapPin, { size: 14, style: inputIconStyle }),
          React.createElement('input', { type: 'text', placeholder: getCategoryPlaceholder(), value: location, onChange: (e) => setLocation(e.target.value), onKeyPress: (e) => { if (e.key === 'Enter') handleSearch(); }, style: inputFieldStyle })
        ),
        // Cell 2: Stays check-in OR Food/Others date OR empty placeholder
        selectedCategory === 'stays'
          ? React.createElement('div', { style: inputWrapperStyle },
              React.createElement(Calendar, { size: 14, style: inputIconStyle }),
              React.createElement('input', { type: 'date', value: checkIn, onChange: (e) => setCheckIn(e.target.value), style: inputFieldStyle })
            )
          : (selectedCategory === 'food' || selectedCategory === 'others')
            ? React.createElement('div', { style: inputWrapperStyle },
                React.createElement(Calendar, { size: 14, style: inputIconStyle }),
                React.createElement('input', { type: 'date', value: selectedCategory === 'food' ? foodDate : otherDate, onChange: (e) => selectedCategory === 'food' ? setFoodDate(e.target.value) : setOtherDate(e.target.value), style: inputFieldStyle, min: new Date().toISOString().split('T')[0] })
              )
            : React.createElement('div', { style: emptyCellStyle }),
        // Cell 3: Stays check-out OR empty placeholder
        selectedCategory === 'stays'
          ? React.createElement('div', { style: inputWrapperStyle },
              React.createElement(Calendar, { size: 14, style: inputIconStyle }),
              React.createElement('input', { type: 'date', value: checkOut, onChange: (e) => setCheckOut(e.target.value), style: inputFieldStyle })
            )
          : React.createElement('div', { style: emptyCellStyle }),
        // Cell 4: Stays guests OR empty placeholder
        selectedCategory === 'stays'
          ? React.createElement('div', { style: inputWrapperStyle },
              React.createElement(Users, { size: 14, style: inputIconStyle }),
              React.createElement('select', { value: guests, onChange: (e) => setGuests(parseInt(e.target.value)), style: { ...inputFieldStyle, cursor: 'pointer', appearance: 'none', paddingRight: '24px' } },
                [1, 2, 3, 4, 5, 6].map(num => React.createElement('option', { key: num, value: num }, `${num} Guest${num > 1 ? 's' : ''}`))
              )
            )
          : React.createElement('div', { style: emptyCellStyle }),
        // Cell 5: Search button — always rendered, fixed width
        React.createElement('button', { onClick: handleSearch, disabled: loading, style: searchBtnStyle },
          loading ? React.createElement(Loader2, { size: 16, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Search, { size: 14 }),
          getSearchButtonText()
        )
      )
    ),

    React.createElement('div', { style: trustBadgesStyle },
      React.createElement('div', { style: trustBadgeStyle }, React.createElement(Sparkles, { size: 14, color: brandIndigo }), '200+ venues'),
      React.createElement('div', { style: trustBadgeStyle }, React.createElement(Clock, { size: 14, color: brandIndigo }), 'Instant confirmation'),
      React.createElement('div', { style: trustBadgeStyle }, React.createElement(CreditCard, { size: 14, color: brandIndigo }), 'Pay online or at venue')
    ),

    // AVAILABLE ON PLAZZAA
    results.length === 0 && React.createElement('div', { style: { marginBottom: '48px' } },
      React.createElement('div', { style: sectionHeaderStyle },
        React.createElement('div', null,
          React.createElement('h2', { style: sectionTitleStyle }, 'Available on Plazzaa'),
          React.createElement('p', { style: sectionSubtitleStyle },
            approvedBusinesses.length > 0
              ? `${approvedBusinesses.length} ${approvedBusinesses.length === 1 ? 'business' : 'businesses'} accepting bookings`
              : 'Businesses are being onboarded — check back soon'
          )
        )
      ),
      loadingBusinesses && React.createElement('div', { style: resultsGridStyle },
        [1, 2, 3].map(i =>
          React.createElement('div', { key: i, style: skeletonCardStyle },
            React.createElement('div', { style: skeletonImageStyle }),
            React.createElement('div', { style: skeletonContentStyle },
              React.createElement('div', { style: { width: '70%', height: '18px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '8px' } }),
              React.createElement('div', { style: { width: '40%', height: '12px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '12px' } }),
              React.createElement('div', { style: { width: '90%', height: '12px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '16px' } })
            )
          )
        )
      ),
      !loadingBusinesses && approvedBusinesses.length > 0 && React.createElement('div', { style: resultsGridStyle },
        approvedBusinesses.map((business) =>
          React.createElement(BusinessCard, { key: business.id, business: business, isDesktop: isDesktop, onClick: () => handleDirectBook(business) })
        )
      )
    ),

    // SEARCH RESULTS
    results.length > 0 && React.createElement('div', { id: 'results-section', style: { marginBottom: '48px' } },
      React.createElement('div', { style: sectionHeaderStyle },
        React.createElement('div', null,
          React.createElement('h2', { style: sectionTitleStyle }, getResultsHeading()),
          React.createElement('p', { style: sectionSubtitleStyle }, `${results.length} ${results.length === 1 ? 'result' : 'results'} found`)
        )
      ),
      React.createElement('div', { style: resultsGridStyle },
        results.map((business) =>
          React.createElement(BusinessCard, { key: business.id, business: business, isDesktop: isDesktop, onClick: () => handleDirectBook(business) })
        )
      )
    ),

    !loading && results.length === 0 && location && React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px' } },
      React.createElement(Search, { size: 48, color: '#ccc', style: { marginBottom: '16px' } }),
      React.createElement('h3', { style: { fontSize: '18px', fontWeight: '500', color: '#1a1a1a', marginBottom: '8px' } }, 'No results found'),
      React.createElement('p', { style: { color: '#888', marginBottom: '20px', fontSize: '14px' } }, `We couldn't find any ${getNoResultsCopy()} in "${location}".`),
      React.createElement('button', { onClick: () => { setLocation(''); setSelectedCategory('stays'); }, style: { padding: '10px 24px', background: brandIndigo, border: 'none', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', color: 'white', fontSize: '13px' } }, 'Clear Search')
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