function BookingCard({ booking, formatPrice, formatDate }) {
  return (
    <div className="booking-card" style={{ 
      transition: 'all 0.25s ease',
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      {/* Top Row: Customer Name + Status */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '700', 
            color: '#1e293b'
          }}>
            {booking.customer_name}
          </h3>
          <span style={{ 
            fontFamily: 'monospace',
            fontSize: '11px',
            fontWeight: '500',
            color: '#64748b',
            background: '#f1f5f9',
            padding: '2px 8px',
            borderRadius: '20px',
            display: 'inline-block',
            marginTop: '4px'
          }}>
            {booking.booking_reference}
          </span>
        </div>
        <span className={`status-badge status-${booking.status || 'confirmed'}`} style={{
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          background: booking.status === 'confirmed' ? '#d1fae5' : '#fee2e2',
          color: booking.status === 'confirmed' ? '#065f46' : '#991b1b'
        }}>
          {booking.status || 'confirmed'}
        </span>
      </div>

      {/* Details Row: 3-4 columns side by side */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Check-in
          </span>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>
            {formatDate(booking.check_in_date)}
          </span>
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Check-out
          </span>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>
            {formatDate(booking.check_out_date)}
          </span>
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Guests
          </span>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>
            {booking.number_of_guests || 1}
          </span>
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Total
          </span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#4f46e5' }}>
            {formatPrice(booking.total_amount)}
            {booking.payment_status === 'paid' && (
              <span style={{ marginLeft: '6px', fontSize: '10px', color: '#10b981', fontWeight: '600' }}>PAID</span>
            )}
          </span>
        </div>
      </div>

      {/* Contact Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '12px'
      }}>
        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📞 {booking.customer_phone}
        </span>
        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ✉️ {booking.customer_email}
        </span>
      </div>
    </div>
  );
}

export default BookingCard;