function StatsCard({ icon: Icon, iconColor = '#4f46e5', iconBg = '#eef2ff', label, value, format }) {
  return (
    <div style={{ 
      background: 'white',
      borderRadius: '20px',
      padding: '22px',
      border: '1px solid #f1f5f9',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 30px -12px rgba(0,0,0,0.15)';
      e.currentTarget.style.borderColor = '#e2e8f0';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
      e.currentTarget.style.borderColor = '#f1f5f9';
    }}>
      {/* Top accent bar - dynamic color based on iconColor */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, ' + iconColor + ', ' + iconColor + '80)'
      }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '600', 
            marginBottom: '8px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>
            {label}
          </p>
          <h3 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            color: '#0f172a', 
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            {format !== undefined ? format(value) : value}
          </h3>
        </div>
        <div style={{ 
          background: iconBg, 
          padding: '12px', 
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} strokeWidth={2} color={iconColor} />
        </div>
      </div>
    </div>
  );
}

export default StatsCard;