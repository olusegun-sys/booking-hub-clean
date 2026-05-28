import { CheckCircle, MapPin, Calendar, Clock, CreditCard } from 'lucide-react';
import PaystackPayment from './PaystackPayment';

function BookingConfirmation({ 
  bookingReference, 
  amount, 
  email, 
  details, 
  onBack 
}) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price || 0);
  };

  const goHome = () => {
    window.location.href = '/';
  };

  const today = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="app-container">
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        
        {/* Receipt Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--gray-100)'
        }}>
          
          {/* Receipt Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
            padding: '32px 28px',
            textAlign: 'center',
            color: 'white'
          }}>
            <CheckCircle size={40} strokeWidth={2.5} style={{ marginBottom: '12px', opacity: 0.95 }} />
            <h2 style={{ color: 'white', fontSize: '22px', fontWeight: '700', margin: '0 0 4px' }}>
              Booking Confirmed
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: 0 }}>
              {today}
            </p>
          </div>

          {/* Booking Reference Banner */}
          <div style={{
            background: 'var(--gray-50)',
            padding: '14px 28px',
            borderBottom: '1px solid var(--gray-100)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Reference
            </span>
            <span style={{
              fontFamily: '"SF Mono", "Monaco", monospace',
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--gray-900)',
              background: 'white',
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid var(--gray-200)'
            }}>
              {bookingReference}
            </span>
          </div>

          {/* Details Section */}
          <div style={{ padding: '24px 28px' }}>
            
            {/* Dynamic booking details */}
            {details && details.map((detail, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: index < details.length - 1 ? '1px solid var(--gray-100)' : 'none'
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  color: 'var(--gray-500)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  {detail.label === 'Court' || detail.label === 'Room' ? <MapPin size={14} strokeWidth={1.5} /> :
                   detail.label === 'Date' || detail.label === 'Check-in' || detail.label === 'Check-out' ? <Calendar size={14} strokeWidth={1.5} /> :
                   detail.label === 'Time' ? <Clock size={14} strokeWidth={1.5} /> : null}
                  {detail.label}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-900)' }}>
                  {detail.value}
                </span>
              </div>
            ))}

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0 0',
              marginTop: '4px'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-900)' }}>
                Total
              </span>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)' }}>
                {formatPrice(amount)}
              </span>
            </div>

            {/* Divider */}
            <div style={{ 
              borderTop: '1px dashed var(--gray-200)', 
              margin: '20px 0',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                padding: '0 12px',
                fontSize: '12px',
                color: 'var(--gray-400)',
                fontWeight: '500'
              }}>
                <CreditCard size={14} strokeWidth={1.5} style={{ marginRight: '4px', display: 'inline' }} />
                Payment
              </span>
            </div>

            {/* Payment Section */}
            <PaystackPayment
              bookingReference={bookingReference}
              amount={amount || 0}
              email={email}
              onSuccess={goHome}
              onCancel={goHome}
            />
          </div>
        </div>

        {/* Home Button */}
        <button 
          className="btn btn-primary" 
          onClick={goHome}
          style={{ width: '100%', padding: '14px', marginTop: '20px' }}
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );
}

export default BookingConfirmation;