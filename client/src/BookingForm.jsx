import { useState } from 'react';
import { ArrowLeft, Calendar, Users, CreditCard, MapPin, Clock } from 'lucide-react';
import { showError } from './toast';
import BookingConfirmation from './BookingConfirmation';

function BookingForm({ businessId, roomId, roomName, pricePerNight, checkIn, checkOut, guests, onBack, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights * pricePerNight;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || formData.name.trim().length < 2) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          roomId,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          checkIn,
          checkOut,
          guests,
          totalAmount: calculateTotal()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setBookingReference(data.booking.booking_reference);
        setBookingComplete(true);
        if (onSuccess) onSuccess(data.booking, formData.email);
      } else {
        setError(data.error || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // Show premium confirmation with Paystack payment
  if (bookingComplete) {
    return (
      <BookingConfirmation
        bookingReference={bookingReference}
        amount={calculateTotal()}
        email={formData.email}
        details={[
          { label: 'Room', value: roomName },
          { label: 'Check-in', value: checkIn },
          { label: 'Check-out', value: checkOut },
          { label: 'Nights', value: Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) },
          { label: 'Price per night', value: formatPrice(pricePerNight) }
        ]}
        onBack={() => window.location.href = '/'}
      />
    );
  }

  const nights = checkIn && checkOut 
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) 
    : 0;

  return (
    <div className="app-container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button 
          onClick={onBack} 
          className="btn btn-secondary" 
          style={{ marginBottom: '24px', padding: '10px 20px' }}
        >
          <ArrowLeft size={16} strokeWidth={2} /> Back to Rooms
        </button>

        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--gray-100)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', letterSpacing: '-0.015em' }}>
            Complete Your Booking
          </h2>

          <div style={{
            background: 'var(--gray-50)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
            border: '1px solid var(--gray-100)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--gray-900)' }}>
              Booking Summary
            </h3>
            
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} strokeWidth={1.5} /> Room
                </span>
                <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{roomName}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} strokeWidth={1.5} /> Check-in
                </span>
                <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{checkIn}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} strokeWidth={1.5} /> Check-out
                </span>
                <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{checkOut}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} strokeWidth={1.5} /> Nights
                </span>
                <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{nights}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={14} strokeWidth={1.5} /> Guests
                </span>
                <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{guests}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Price per night</span>
                  <span style={{ fontWeight: '500', color: 'var(--gray-700)', fontSize: '14px' }}>{formatPrice(pricePerNight)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--gray-900)' }}>Total</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-control"
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-control"
                placeholder="john@example.com"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="form-control"
                placeholder="08012345678"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-success"
              style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '8px' }}
            >
              <CreditCard size={18} strokeWidth={2} />
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookingForm;