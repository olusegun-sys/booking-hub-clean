import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Trophy, Star, CheckCircle, Users } from 'lucide-react';

function GuestBookingForm({ businessId, serviceType, serviceDetails, totalAmount, onBack, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const bookingRef = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          totalAmount,
          bookingType: serviceType,
          bookingDetails: serviceDetails,
          bookingReference: bookingRef
        })
      });
      const data = await response.json();
      if (data.success) {
        onSuccess({ ...data.booking, booking_reference: bookingRef }, formData.email);
      } else {
        setError(data.error || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const getServiceIcon = () => {
    if (serviceType === 'sports') return <Trophy size={14} strokeWidth={1.5} />;
    if (serviceType === 'event') return <Star size={14} strokeWidth={1.5} />;
    return <MapPin size={14} strokeWidth={1.5} />;
  };

  const getServiceLabel = () => {
    if (serviceType === 'sports') return 'Court';
    if (serviceType === 'event') return 'Event';
    return 'Service';
  };

  return (
    <div className="app-container">
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '24px', padding: '10px 20px' }}>
          <ArrowLeft size={16} strokeWidth={2} /> Back
        </button>
        <div style={{
          background: 'white', borderRadius: '20px', padding: '32px',
          boxShadow: 'var(--shadow-xl)', border: '1px solid var(--gray-100)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', letterSpacing: '-0.015em' }}>
            Complete Your Booking
          </h2>

          <div style={{
            background: 'var(--gray-50)', borderRadius: '16px', padding: '24px',
            marginBottom: '28px', border: '1px solid var(--gray-100)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} strokeWidth={2} color="var(--primary)" /> Booking Summary
            </h3>
            <div style={{ display: 'grid', gap: '14px' }}>
              {serviceDetails.court && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getServiceIcon()} {getServiceLabel()}
                  </span>
                  <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{serviceDetails.court}</span>
                </div>
              )}
              {serviceDetails.eventType && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getServiceIcon()} {getServiceLabel()}
                  </span>
                  <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{serviceDetails.eventType}</span>
                </div>
              )}
              {serviceDetails.date && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} strokeWidth={1.5} /> Date
                  </span>
                  <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{serviceDetails.date}</span>
                </div>
              )}
              {serviceDetails.timeSlot && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} strokeWidth={1.5} /> Time
                  </span>
                  <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{serviceDetails.timeSlot}</span>
                </div>
              )}
              {serviceDetails.attendees && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} strokeWidth={1.5} /> Attendees
                  </span>
                  <span style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '14px' }}>{serviceDetails.attendees}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--gray-900)' }}>Total</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" required className="form-control" value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" required className="form-control" value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input type="tel" required className="form-control" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="08012345678" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-success" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
              {loading ? 'Processing...' : <><CheckCircle size={18} strokeWidth={2} /> Confirm Booking</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GuestBookingForm;