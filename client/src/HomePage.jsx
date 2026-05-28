import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Trophy, PartyPopper, Shield, Search, MapPin, Phone, Star } from 'lucide-react';
import { showError } from './toast';
import RoomPage from './RoomPage';
import SportsBooking from './SportsBooking';
import EventBooking from './EventBooking';
import BusinessLogin from './BusinessLogin';
import BusinessDashboard from './BusinessDashboard';
import StaffDashboard from './StaffDashboard';
import HostLanding from './HostLanding';

const heroImages = {
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop',
  sports: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&h=400&fit=crop',
  event: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=400&fit=crop'
};

const heroDescriptions = {
  hotel: 'Discover and book the finest hotels across Nigeria',
  sports: 'Find and reserve courts, pitches, and facilities near you',
  event: 'Plan your next celebration at premier venues across Nigeria'
};

const businessImages = {
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=200&fit=crop'
  ],
  sports: [
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1533563906091-fdfdffc3e3c2?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&h=200&fit=crop'
  ],
  event: [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=200&fit=crop'
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
  const [showHostLanding, setShowHostLanding] = useState(false);
  const [heroKey, setHeroKey] = useState(0);
  const [heroTransitioning, setHeroTransitioning] = useState(false);

  const [businessUser, setBusinessUser] = useState(() => {
    const savedBusiness = localStorage.getItem('businessUser');
    return savedBusiness ? JSON.parse(savedBusiness) : null;
  });

  useEffect(() => {
    const checkCustomDomain = async () => {
      try {
        if (window.location.pathname !== '/') return;
        const currentDomain = window.location.hostname;
        const response = await fetch(`http://localhost:5000/api/domain-info?domain=${currentDomain}`);
        const data = await response.json();
        if (data.success && data.source === 'custom-domain-verified') navigate(`/book/${data.business.slug}`);
      } catch (error) {}
    };
    checkCustomDomain();
  }, []);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setHeroTransitioning(true);
    setTimeout(() => { setSelectedCategory(category); setResults([]); setLocation(''); setHeroKey(prev => prev + 1); setTimeout(() => setHeroTransitioning(false), 50); }, 200);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let searchParams = { location };
      if (selectedCategory === 'hotel') { searchParams.checkIn = checkIn; searchParams.checkOut = checkOut; searchParams.guests = guests; }
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`http://localhost:5000/api/businesses/search/category?category=${selectedCategory}&${params}`);
      const data = await response.json();
      if (data.success) { setResults(data.businesses); if (data.businesses.length === 0) showError(`No ${selectedCategory} found in ${location || 'that area'}`); }
    } catch (error) { showError('Something went wrong.'); }
    setLoading(false);
  };

  const handleDirectBook = (business) => { setSelectedBusiness(business); setShowDirectBooking(true); };
  const goToAdmin = () => { const savedAdmin = localStorage.getItem('admin'); if (savedAdmin) window.location.href = '/admin'; else navigate('/admin'); };

  if (showHostLanding) return <HostLanding onBack={() => setShowHostLanding(false)} />;
  if (businessUser) {
    if (businessUser.staffUser) return <StaffDashboard staff={businessUser.staffUser} business={businessUser} onLogout={() => { setBusinessUser(null); localStorage.removeItem('businessUser'); }} />;
    return <BusinessDashboard business={businessUser} onLogout={() => { setBusinessUser(null); localStorage.removeItem('businessUser'); }} />;
  }
  if (showDirectBooking && selectedBusiness) {
    if (selectedBusiness.business_type === 'hotel') return <RoomPage businessId={selectedBusiness.id} businessName={selectedBusiness.name} checkIn={checkIn} checkOut={checkOut} guests={guests} onBack={() => setShowDirectBooking(false)} />;
    if (selectedBusiness.business_type === 'sports') return <SportsBooking business={selectedBusiness} onBack={() => setShowDirectBooking(false)} />;
    if (selectedBusiness.business_type === 'event') return <EventBooking business={selectedBusiness} onBack={() => setShowDirectBooking(false)} />;
  }

  const getCategoryTitle = () => {
    if (selectedCategory === 'hotel') return 'Find Your Perfect Stay';
    if (selectedCategory === 'sports') return 'Book Your Court';
    if (selectedCategory === 'event') return 'Plan Your Next Event';
  };
  const getCategoryPlaceholder = () => { if (selectedCategory === 'hotel') return 'e.g., Abuja, Lagos'; if (selectedCategory === 'sports') return 'e.g., Abuja, Lagos'; if (selectedCategory === 'event') return 'e.g., Abuja, Lagos'; };

  return (
    <div className="app-container">
      {showBusinessLogin && (
        <div className="modal-overlay" onClick={() => setShowBusinessLogin(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <BusinessLogin onLogin={(business) => { setBusinessUser(business); localStorage.setItem('businessUser', JSON.stringify(business)); setShowBusinessLogin(false); }} />
            <button className="modal-close" onClick={() => setShowBusinessLogin(false)}>x</button>
          </div>
        </div>
      )}

      <div className="app-header page-enter">
        <h1 className="luxury-heading" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '34px' }}>
          <Building2 size={32} strokeWidth={2.5} color="var(--primary)" />
          Booking Hub
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary refined-focus" onClick={goToAdmin}><Shield size={16} strokeWidth={2} /> Admin</button>
          <button className="btn btn-secondary refined-focus" onClick={() => setShowHostLanding(true)}>Become a Host</button>
          <button className="btn btn-primary refined-focus" onClick={() => setShowBusinessLogin(true)}>Business Login</button>
        </div>
      </div>

      <div className="page-enter stagger-1" style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: 'white', padding: '8px', borderRadius: '18px', boxShadow: 'var(--shadow-sm)' }}>
        <button className={`btn ${selectedCategory === 'hotel' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleCategoryChange('hotel')} style={{ flex: 1, padding: '16px 20px', fontSize: '16px', fontWeight: '600' }}><Building2 size={20} strokeWidth={2} /> Hotels</button>
        <button className={`btn ${selectedCategory === 'sports' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleCategoryChange('sports')} style={{ flex: 1, padding: '16px 20px', fontSize: '16px', fontWeight: '600' }}><Trophy size={20} strokeWidth={2} /> Sports</button>
        <button className={`btn ${selectedCategory === 'event' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleCategoryChange('event')} style={{ flex: 1, padding: '16px 20px', fontSize: '16px', fontWeight: '600' }}><PartyPopper size={20} strokeWidth={2} /> Events</button>
      </div>

      <div key={heroKey} className="page-enter stagger-2" style={{ width: '100%', height: '300px', backgroundImage: `url(${heroImages[selectedCategory]})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden', opacity: heroTransitioning ? 0 : 1, transform: heroTransitioning ? 'scale(1.02)' : 'scale(1)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.55))', padding: '50px 40px 28px' }}>
          <h2 className="luxury-heading" style={{ color: 'white', fontSize: '30px', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{getCategoryTitle()}</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginTop: '6px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{heroDescriptions[selectedCategory]}</p>
        </div>
      </div>

      <div className="page-enter stagger-3" style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px', color: 'var(--gray-500)', fontSize: '13px', fontWeight: '500' }}>
        <span>13 venues across Lagos and Abuja</span><span>.</span><span>Instant confirmation</span><span>.</span><span>Pay online or at venue</span>
      </div>

      <div className="search-card page-enter stagger-4">
        <div className="form-group"><label>Location</label><input type="text" placeholder={getCategoryPlaceholder()} value={location} onChange={(e) => setLocation(e.target.value)} className="form-control refined-focus" /></div>
        {selectedCategory === 'hotel' && (<><div className="form-row"><div className="form-group"><label>Check-in</label><input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="form-control refined-focus" /></div><div className="form-group"><label>Check-out</label><input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="form-control refined-focus" /></div></div><div className="form-group"><label>Guests</label><select value={guests} onChange={(e) => setGuests(e.target.value)} className="form-control refined-focus">{[1,2,3,4,5,6].map(num => (<option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>))}</select></div></>)}
        {selectedCategory === 'sports' && (<div className="form-group"><label>Date (Optional)</label><input type="date" value={sportsDate} onChange={(e) => setSportsDate(e.target.value)} className="form-control refined-focus" min={new Date().toISOString().split('T')[0]} /></div>)}
        {selectedCategory === 'event' && (<div className="form-group"><label>Event Date (Optional)</label><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="form-control refined-focus" min={new Date().toISOString().split('T')[0]} /></div>)}
        <button onClick={handleSearch} disabled={loading} className="btn btn-primary refined-focus" style={{ width: '100%' }}><Search size={18} strokeWidth={2} />{loading ? 'Searching...' : `Search ${selectedCategory === 'hotel' ? 'Hotels' : selectedCategory === 'sports' ? 'Sports Facilities' : 'Event Venues'}`}</button>
      </div>

      {loading && (
        <div className="hotels-grid">
          <div className="skeleton skeleton-title" style={{ width: '300px', marginBottom: '24px' }}></div>
          {[1, 2, 3].map((i) => (<div key={i} className="skeleton" style={{ height: '280px', borderRadius: '16px', marginBottom: '16px', background: 'white' }}><div className="skeleton" style={{ height: '140px', borderRadius: '12px 12px 0 0' }}></div><div style={{ padding: '16px' }}><div className="skeleton skeleton-title" style={{ width: '200px' }}></div><div className="skeleton skeleton-text" style={{ width: '250px' }}></div><div className="skeleton skeleton-text" style={{ width: '150px' }}></div><div className="skeleton skeleton-text" style={{ width: '100%', height: '40px', marginTop: '16px', borderRadius: '8px' }}></div></div></div>))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="hotels-grid">
          <h2 className="luxury-heading" style={{ fontSize: '26px', marginBottom: '8px' }}>Available {selectedCategory === 'hotel' ? 'Hotels' : selectedCategory === 'sports' ? 'Sports Facilities' : 'Event Venues'}</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>{results.length} {results.length === 1 ? 'result' : 'results'} found</p>
          {results.map((business, index) => (
            <div key={business.id} className={`hotel-card premium-card page-enter stagger-${Math.min(index + 1, 6)}`} style={{ overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '140px', backgroundImage: `url(${getBusinessImage(business.business_type, index)})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', marginBottom: '16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{business.name}</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--gray-50)', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: 'var(--gray-600)' }}><Star size={14} strokeWidth={2} fill="#f59e0b" color="#f59e0b" /> 4.5</span>
              </div>
              <div className="hotel-location"><MapPin size={14} strokeWidth={2} /> {business.address}, {business.city}</div>
              <div className="hotel-contact"><Phone size={14} strokeWidth={2} /> {business.phone}</div>
              <p style={{ marginTop: '8px', color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.5' }}>{business.description ? business.description.substring(0, 120) + '...' : ''}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {business.business_type === 'hotel' && (<button onClick={() => handleDirectBook(business)} className="btn btn-success refined-focus" style={{ flex: 1 }}>View Rooms</button>)}
                <button onClick={() => navigate(`/book/${business.slug}`)} className="btn btn-secondary refined-focus" style={{ flex: 1 }}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && location && (
        <div className="empty-state page-enter">
          <div className="empty-state-icon"><Search size={64} strokeWidth={1.5} color="var(--gray-400)" /></div>
          <h3>No results found</h3>
          <p>We couldn't find any {selectedCategory === 'hotel' ? 'hotels' : selectedCategory === 'sports' ? 'sports facilities' : 'event venues'} in "{location}".</p>
          <button className="btn btn-secondary refined-focus" onClick={() => { setLocation(''); setSelectedCategory('hotel'); }}>Clear Search</button>
        </div>
      )}
    </div>
  );
}

export default HomePage;