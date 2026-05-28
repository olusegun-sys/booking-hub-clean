import { MapPin } from 'lucide-react';

function DashboardLayout({ business, onLogout, children, actions, greeting, badge }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      {/* Unified Header */}
      <div style={{ 
        background: 'white', 
        padding: '16px 0', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', 
        borderBottom: '1px solid #e2e8f0', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10 
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            {greeting && (
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                {greeting}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '800', 
                color: '#0f172a', 
                letterSpacing: '-0.02em' 
              }}>
                {business ? business.name : 'Dashboard'}
              </h1>
              {badge && badge}
              {business && (
                <p style={{ 
                  margin: 0, 
                  color: '#64748b', 
                  fontSize: '13px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px' 
                }}>
                  <MapPin size={14} strokeWidth={2} /> {business.city}, {business.state}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {actions}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;