import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomPage from './RoomPage';
import SportsBooking from './SportsBooking';
import EventBooking from './EventBooking';

function PublicBusinessPage() {
  const { businessSlug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showBooking, setShowBooking] = useState(false);

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
          <h2>Error: {error}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Show appropriate booking interface based on business type
  if (showBooking) {
    if (business.business_type === 'hotel') {
      return (
        <RoomPage 
          businessId={business.id}
          businessName={business.name}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onBack={() => setShowBooking(false)}
        />
      );
    } else if (business.business_type === 'sports') {
      return (
        <SportsBooking 
          business={business}
          onBack={() => setShowBooking(false)}
        />
      );
    } else if (business.business_type === 'event') {
      return (
        <EventBooking 
          business={business}
          onBack={() => setShowBooking(false)}
        />
      );
    }
  }

  // Render different booking forms based on business type
  const renderBookingForm = () => {
    if (business.business_type === 'hotel') {
      return (
        <>
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
            onClick={() => setShowBooking(true)}
            disabled={!checkIn || !checkOut}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Check Availability
          </button>
        </>
      );
    } else if (business.business_type === 'sports') {
      return (
        <>
          <p style={{ marginBottom: '20px', color: '#64748b' }}>
            Book a tennis court by the hour. Select your preferred date and time.
          </p>
          <button 
            onClick={() => setShowBooking(true)}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Book a Court
          </button>
        </>
      );
    } else if (business.business_type === 'event') {
      return (
        <>
          <p style={{ marginBottom: '20px', color: '#64748b' }}>
            Host your event with us. Choose from various event types and packages.
          </p>
          <button 
            onClick={() => setShowBooking(true)}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Plan Your Event
          </button>
        </>
      );
    }
  };

  const getTypeLabel = () => {
    const types = { hotel: 'Hotel', sports: 'Sports Facility', event: 'Event Venue' };
    return types[business.business_type] || 'Business';
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div>
          <h1>{business.name}</h1>
          <span style={{ 
            fontSize: '14px', 
            background: '#6366f1', 
            color: 'white', 
            padding: '4px 12px', 
            borderRadius: '20px',
            marginLeft: '10px'
          }}>
            {getTypeLabel()}
          </span>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Back to Search
        </button>
      </div>

      <div className="search-card">
        <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>
          Book at {business.name}
        </h2>
        
        <p style={{ marginBottom: '24px', color: '#64748b' }}>
          Location: {business.address}, {business.city}, {business.state}
        </p>

        {renderBookingForm()}
      </div>

      <div className="hotel-card">
        <h3>About {business.name}</h3>
        <p style={{ marginTop: '12px', color: '#475569' }}>
          {business.description || `Welcome to ${business.name}!`}
        </p>
        <div className="hotel-contact" style={{ marginTop: '20px' }}>
          Phone: {business.phone} | Email: {business.email}
        </div>
      </div>
    </div>
  );
}

export default PublicBusinessPage;