import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomPage from './RoomPage';

function PublicBusinessPage() {
  const { businessSlug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showRoomSelection, setShowRoomSelection] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, [businessSlug]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/businesses/slug/${businessSlug}`);
      const data = await response.json();
      
      if (data.success && data.business) {
        setBusiness(data.business);
      } else {
        setError('Business not found');
      }
    } catch (error) {
      setError('Could not load business');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="alert alert-error">
          <h2>? {error}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (showRoomSelection) {
    return (
      <RoomPage 
        businessId={business.id}
        businessName={business.name}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        onBack={() => setShowRoomSelection(false)}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>{business.name}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ? Back to Search
        </button>
      </div>

      <div className="search-card">
        <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>
          Book your stay at {business.name}
        </h2>
        
        <p style={{ marginBottom: '24px', color: '#64748b' }}>
          ?? {business.address}, {business.city}, {business.state}
        </p>

        <div className="form-row">
          <div className="form-group">
            <label>Check-in</label>
            <input 
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Check-out</label>
            <input 
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Guests</label>
          <select 
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="form-control"
          >
            {[1,2,3,4,5,6].map(num => (
              <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setShowRoomSelection(true)}
          disabled={!checkIn || !checkOut}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Check Availability
        </button>
      </div>

      <div className="hotel-card">
        <h3>About {business.name}</h3>
        <p style={{ marginTop: '12px', color: '#475569' }}>
          {business.description || 'Welcome to our hotel! We offer comfortable rooms and excellent service.'}
        </p>
        <div className="hotel-contact" style={{ marginTop: '20px' }}>
          ?? {business.phone} | ?? {business.email}
        </div>
      </div>
    </div>
  );
}

export default PublicBusinessPage;