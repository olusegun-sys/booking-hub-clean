import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Star, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { showError } from './toast';
import BookingConfirmation from './BookingConfirmation';
import GuestBookingForm from './components/forms/GuestBookingForm';

function EventBooking({ business, onBack }) {
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [attendees, setAttendees] = useState(50);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');

  const eventTypes = [
    { id: 'birthday', name: 'Birthday Party', basePrice: 150000, maxCapacity: 100 },
    { id: 'wedding', name: 'Wedding Reception', basePrice: 450000, maxCapacity: 300 },
    { id: 'seminar', name: 'Corporate Seminar', basePrice: 200000, maxCapacity: 200 },
    { id: 'conference', name: 'Conference', basePrice: 350000, maxCapacity: 250 }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);
  };

  const calculatePrice = () => {
    const selected = eventTypes.find(e => e.id === eventType);
    if (!selected) return 0;
    let price = selected.basePrice;
    if (attendees > 50) price += (attendees - 50) * 2000;
    return price;
  };

  const handleBooking = () => {
    if (!eventType) { showError('Please select an event type'); return; }
    if (!eventDate) { showError('Please select an event date'); return; }
    setShowBookingForm(true);
  };

  const handleBookingSuccess = (booking, email) => {
    setBookingDetails(booking);
    setCustomerEmail(email);
    setBookingComplete(true);
    setShowBookingForm(false);
  };

  if (bookingComplete) {
    const selectedEvent = eventTypes.find(e => e.id === eventType);
    return (
      <BookingConfirmation
        bookingReference={bookingDetails?.booking_reference}
        amount={calculatePrice()}
        email={customerEmail}
        details={[
          { label: 'Event', value: selectedEvent?.name },
          { label: 'Date', value: eventDate },
          { label: 'Attendees', value: attendees }
        ]}
        onBack={onBack}
      />
    );
  }

  if (showBookingForm) {
    return (
      <GuestBookingForm
        businessId={business.id}
        serviceType="event"
        serviceDetails={{
          eventType: eventTypes.find(e => e.id === eventType)?.name,
          date: eventDate,
          attendees: attendees
        }}
        totalAmount={calculatePrice()}
        onBack={() => setShowBookingForm(false)}
        onSuccess={handleBookingSuccess}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '30px', fontWeight: '800' }}>
            <Star size={28} strokeWidth={2.5} color="var(--primary)" />
            {business.name}
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} strokeWidth={2} /> {business.city}, {business.state}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '10px 20px' }}>
          <ArrowLeft size={16} strokeWidth={2} /> Back
        </button>
      </div>

      <div className="search-card">
        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={22} strokeWidth={2} color="var(--primary)" /> Book Your Event
        </h2>
        
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={16} strokeWidth={2} color="var(--primary)" /> Step 1: Select Event Type
          </label>
          <div style={{ display: 'grid', gap: '10px' }}>
            {eventTypes.map(event => (
              <div key={event.id} className={`room-card ${eventType === event.id ? 'selected' : ''}`}
                onClick={() => setEventType(event.id)}>
                <div className="room-header">
                  <span className="room-name">{event.name}</span>
                  <span className="room-price">From {formatPrice(event.basePrice)}</span>
                </div>
                <p style={{ marginTop: '10px', color: 'var(--gray-500)', fontSize: '14px' }}>
                  <Users size={14} strokeWidth={2} style={{ marginRight: '6px', display: 'inline' }} />
                  Max Capacity: {event.maxCapacity} guests
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} strokeWidth={2} color="var(--primary)" /> Step 2: Select Date
          </label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
            className="form-control" min={new Date().toISOString().split('T')[0]} />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} strokeWidth={2} color="var(--primary)" /> Step 3: Number of Attendees: {attendees}
          </label>
          <input type="range" min="10" max="300" value={attendees}
            onChange={(e) => setAttendees(parseInt(e.target.value))} className="form-control" style={{ padding: 0 }} />
        </div>

        {eventType && (
          <div className="hotel-card" style={{ marginTop: '20px', background: 'var(--gray-50)', border: '1px solid var(--gray-100)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <DollarSign size={18} strokeWidth={2} color="var(--primary)" /> Price Estimate
            </h3>
            <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginTop: '10px' }}>{formatPrice(calculatePrice())}</p>
            <p style={{ marginTop: '10px', color: 'var(--gray-500)', fontSize: '14px' }}>Includes venue rental and basic setup</p>
          </div>
        )}

        <button className="btn btn-success" onClick={handleBooking} disabled={!eventType || !eventDate}
          style={{ width: '100%', marginTop: '20px', padding: '16px', fontSize: '16px' }}>
          {!eventType ? <><Star size={18} strokeWidth={2} /> Select Event</> : !eventDate ? <><Calendar size={18} strokeWidth={2} /> Select Date</> : <><CheckCircle size={18} strokeWidth={2} /> Continue to Booking</>}
        </button>
      </div>

      <div className="hotel-card">
        <h3>About {business.name}</h3>
        <p style={{ marginTop: '12px', color: 'var(--gray-600)', lineHeight: '1.7' }}>{business.description}</p>
      </div>
    </div>
  );
}

export default EventBooking;