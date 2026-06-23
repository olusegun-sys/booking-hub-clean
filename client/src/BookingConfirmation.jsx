import { CheckCircle, MapPin, Calendar, Clock, CreditCard, Hotel, Users, Bed, ArrowLeft } from 'lucide-react';

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
      currency: 'NGN',
      minimumFractionDigits: 0
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '560px', width: '100%', margin: '0 auto' }}>
        
        {/* Receipt Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(79, 70, 229, 0.12), 0 8px 24px rgba(0,0,0,0.04)',
          border: '1px solid rgba(226, 232, 240, 0.6)'
        }}>
          
          {/* Receipt Header - Premium Gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 50%, #6d28d9 100%)',
            padding: '40px 32px 32px',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-80px',
              left: '-40px',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '72px',
                height: '72px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                backdropFilter: 'blur(10px)'
              }}>
                <CheckCircle size={40} strokeWidth={2} style={{ color: 'white' }} />
              </div>
              <h2 style={{ 
                color: 'white', 
                fontSize: '26px', 
                fontWeight: '700', 
                margin: '0 0 4px',
                letterSpacing: '-0.5px'
              }}>
                Booking Confirmed
              </h2>
              <p style={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '400'
              }}>
                {today}
              </p>
            </div>
          </div>

          {/* Booking Reference Banner */}
          <div style={{
            background: '#f8fafc',
            padding: '14px 28px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              fontWeight: '600', 
              textTransform: 'uppercase', 
              letterSpacing: '0.8px' 
            }}>
              Booking Reference
            </span>
            <span style={{
              fontFamily: '"SF Mono", "Monaco", monospace',
              fontSize: '15px',
              fontWeight: '700',
              color: '#0f172a',
              background: 'white',
              padding: '4px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              {bookingReference}
            </span>
          </div>

          {/* Details Section */}
          <div style={{ padding: '28px 32px' }}>
            
            {/* Dynamic booking details */}
            {details && details.map((detail, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: index < details.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}>
                <span style={{ 
                  fontSize: '13px', 
                  color: '#64748b', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontWeight: '500'
                }}>
                  {detail.label === 'Hotel' ? <Hotel size={14} color="#94a3b8" /> :
                   detail.label === 'Room' ? <Bed size={14} color="#94a3b8" /> :
                   detail.label === 'Check-in' || detail.label === 'Check-out' ? <Calendar size={14} color="#94a3b8" /> :
                   detail.label === 'Guests' ? <Users size={14} color="#94a3b8" /> : null}
                  {detail.label}
                </span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#0f172a',
                  textAlign: 'right'
                }}>
                  {detail.value}
                </span>
              </div>
            ))}

            {/* Total - Premium Highlight */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0 0',
              marginTop: '8px',
              borderTop: '2px solid #4F46E5'
            }}>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '700', 
                color: '#0f172a'
              }}>
                Total
              </span>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: '800', 
                color: '#4F46E5'
              }}>
                {formatPrice(amount)}
              </span>
            </div>

            {/* Payment Status - Clean */}
            <div style={{
              marginTop: '20px',
              padding: '14px 18px',
              background: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle size={18} color="#22c55e" />
              <span style={{ fontSize: '13px', color: '#166534', fontWeight: '500' }}>
                {details?.find(d => d.label === 'Payment Method')?.value === 'Pay at Venue' 
                  ? 'No payment required now — pay when you arrive' 
                  : 'Payment will be processed securely'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Clean, No CTAs on Receipt */}
        <div style={{ 
          marginTop: '24px', 
          display: 'flex', 
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={goHome}
            style={{
              flex: 1,
              padding: '14px 24px',
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4338CA';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4F46E5';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.25)';
            }}
          >
            Back to Homepage
          </button>
          {onBack && (
            <button 
              onClick={onBack}
              style={{
                padding: '14px 20px',
                background: 'white',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '20px'
        }}>
          A confirmation email has been sent to your email address
        </p>
      </div>
    </div>
  );
}

export default BookingConfirmation;