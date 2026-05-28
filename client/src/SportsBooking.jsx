import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Trophy, CheckCircle, Users, Phone } from 'lucide-react';
import { showError } from './toast';
import BookingConfirmation from './BookingConfirmation';
import GuestBookingForm from './components/forms/GuestBookingForm';

function SportsBooking({ business, onBack }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');

  const courts = [
    { id: 'court1', name: 'Court 1 - Hard Court', price: 5000 },
    { id: 'court2', name: 'Court 2 - Clay Court', price: 7500 },
    { id: 'court3', name: 'Court 3 - Grass Court', price: 10000 }
  ];

  const timeSlots = [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
    '18:00 - 19:00', '19:00 - 20:00'
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);
  };

  const handleBooking = () => {
    if (!selectedDate) { showError('Please select a date'); return; }
    if (!selectedCourt) { showError('Please select a court'); return; }
    if (!selectedTimeSlot) { showError('Please select a time slot'); return; }
    setShowBookingForm(true);
  };

  const handleBookingSuccess = (booking, email) => {
    setBookingDetails(booking);
    setCustomerEmail(email);
    setBookingComplete(true);
    setShowBookingForm(false);
  };

  const isTimeSlotPast = (slot) => {
    const slotStartTime = slot.split(' - ')[0];
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate > today) return false;
    if (selectedDate === today) {
      const now = new Date();
      const [hours, minutes] = slotStartTime.split(':').map(Number);
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(hours, minutes, 0, 0);
      return slotDateTime <= now;
    }
    return true;
  };

  if (bookingComplete) {
    const selectedCourtData = courts.find(c => c.id === selectedCourt);
    return (
      <BookingConfirmation
        bookingReference={bookingDetails?.booking_reference}
        amount={selectedCourtData?.price || 0}
        email={customerEmail}
        details={[
          { label: 'Court', value: selectedCourtData?.name },
          { label: 'Date', value: selectedDate },
          { label: 'Time', value: selectedTimeSlot }
        ]}
        onBack={onBack}
      />
    );
  }

  if (showBookingForm) {
    const selectedCourtData = courts.find(c => c.id === selectedCourt);
    return (
      <GuestBookingForm
        businessId={business.id}
        serviceType="sports"
        serviceDetails={{
          court: selectedCourtData.name,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          price: selectedCourtData.price
        }}
        totalAmount={selectedCourtData.price}
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
            <Trophy size={28} strokeWidth={2.5} color="var(--primary)" />
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
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '28px', letterSpacing: '-0.015em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={22} strokeWidth={2} color="var(--primary)" />
          Book a Tennis Court
        </h2>
        
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} strokeWidth={2} color="var(--primary)" /> Step 1: Select Date
          </label>
          <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTimeSlot(''); }}
            className="form-control" min={new Date().toISOString().split('T')[0]} />
        </div>

        {selectedDate && (
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} strokeWidth={2} color="var(--primary)" /> Step 2: Select Court
            </label>
            <div style={{ display: 'grid', gap: '10px' }}>
              {courts.map(court => (
                <div key={court.id} className={`room-card ${selectedCourt === court.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedCourt(court.id); setSelectedTimeSlot(''); }} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-900)' }}>{court.name}</span></div>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>{formatPrice(court.price)}<span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--gray-400)', marginLeft: '4px' }}>/ hour</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCourt && selectedDate && (
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} strokeWidth={2} color="var(--primary)" /> Step 3: Select Time Slot
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {timeSlots.map(slot => {
                if (isTimeSlotPast(slot)) return null;
                return (
                  <button key={slot} type="button" className={`btn ${selectedTimeSlot === slot ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedTimeSlot(slot)} style={{ padding: '12px', fontSize: '13px', fontWeight: '500' }}>{slot}</button>
                );
              })}
            </div>
          </div>
        )}

        <button className="btn btn-success" onClick={handleBooking} disabled={!selectedDate || !selectedCourt || !selectedTimeSlot}
          style={{ width: '100%', marginTop: '20px', padding: '16px', fontSize: '16px' }}>
          {!selectedDate ? <><Calendar size={18} strokeWidth={2} /> Select Date</> : !selectedCourt ? <><MapPin size={18} strokeWidth={2} /> Select Court</> : !selectedTimeSlot ? <><Clock size={18} strokeWidth={2} /> Select Time</> : <><CheckCircle size={18} strokeWidth={2} /> Book Court</>}
        </button>
      </div>

      <div className="hotel-card">
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>About {business.name}</h3>
        <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>{business.description}</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: '14px', background: 'var(--gray-100)', padding: '8px 14px', borderRadius: '8px' }}>
            <Clock size={14} strokeWidth={2} /><strong>Hours:</strong> 8:00 AM - 8:00 PM daily
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: '14px', background: 'var(--gray-100)', padding: '8px 14px', borderRadius: '8px' }}>
            <Phone size={14} strokeWidth={2} />{business.phone}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SportsBooking;