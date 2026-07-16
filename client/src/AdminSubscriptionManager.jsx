// FILE: client/src/AdminSubscriptionManager.jsx
// Admin panel for managing subscription requests

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, Users, ArrowRight } from 'lucide-react';
import API_BASE from './config';

function AdminSubscriptionManager({ onBusinessUpdate }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState({});

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/businesses`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      if (data.success) {
        setBusinesses(data.businesses || []);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const upgradeBusiness = async (businessId) => {
    if (!confirm('Confirm upgrade for this business?')) return;
    
    setUpgrading({ ...upgrading, [businessId]: true });
    try {
      const response = await fetch(`${API_BASE}/api/admin/businesses/${businessId}/upgrade`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token 
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Business upgraded successfully!');
        fetchBusinesses();
        if (onBusinessUpdate) onBusinessUpdate();
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      alert('Failed to upgrade business');
    } finally {
      setUpgrading({ ...upgrading, [businessId]: false });
    }
  };

  const resetLimit = async (businessId) => {
    if (!confirm('Reset free limit for this business?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/businesses/${businessId}/reset-limit`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token 
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Limit reset successfully!');
        fetchBusinesses();
      }
    } catch (err) {
      console.error('Reset error:', err);
      alert('Failed to reset limit');
    }
  };

  const pendingUpgrades = businesses.filter(b => 
    b.current_booking_count >= b.booking_limit && b.status === 'approved'
  );

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '40px' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  return React.createElement('div', { style: { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' } },
    // Header
    React.createElement('div', { 
      style: { 
        padding: '20px 24px', 
        borderBottom: '1px solid #e2e8f0', 
        background: '#f8fafc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      } 
    },
      React.createElement('div', null,
        React.createElement('h3', { style: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 } }, 
          '📋 Subscription Requests'
        ),
        React.createElement('p', { style: { fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' } }, 
          `${pendingUpgrades.length} businesses need upgrade`
        )
      ),
      React.createElement('div', { 
        style: { 
          background: pendingUpgrades.length > 0 ? '#ef4444' : '#10b981', 
          color: 'white',
          padding: '4px 12px',
          borderRadius: '40px',
          fontSize: '12px',
          fontWeight: '600'
        } 
      }, pendingUpgrades.length > 0 ? `${pendingUpgrades.length} pending` : 'All good')
    ),
    
    React.createElement('div', { style: { padding: '24px' } },
      pendingUpgrades.length === 0 ? 
        React.createElement('div', { style: { textAlign: 'center', padding: '40px 20px' } },
          React.createElement(CheckCircle, { size: 48, color: '#10b981' }),
          React.createElement('p', { style: { color: '#64748b', marginTop: '12px', fontSize: '14px' } }, 
            'No businesses have reached their booking limit'
          )
        ) :
        pendingUpgrades.map(business => 
          React.createElement('div', { 
            key: business.id, 
            style: { 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 0', 
              borderBottom: '1px solid #f1f5f9' 
            } 
          },
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                React.createElement('div', { 
                  style: { 
                    width: '40px', 
                    height: '40px', 
                    background: '#fef3c7', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  } 
                }, React.createElement(Clock, { size: 20, color: '#d97706' })),
                React.createElement('div', null,
                  React.createElement('p', { style: { fontWeight: '600', color: '#0f172a', margin: 0 } }, business.name),
                  React.createElement('p', { style: { fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' } }, 
                    business.email + ' · ' + business.business_type
                  )
                )
              ),
              React.createElement('div', { 
                style: { 
                  marginTop: '8px', 
                  display: 'flex', 
                  gap: '16px',
                  fontSize: '12px',
                  color: '#64748b'
                } 
              },
                React.createElement('span', null, '📊 ' + business.current_booking_count + '/' + business.booking_limit + ' bookings'),
                React.createElement('span', null, '📅 ' + new Date(business.created_at).toLocaleDateString())
              )
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px', flexShrink: 0 } },
              React.createElement('button', {
                onClick: () => upgradeBusiness(business.id),
                disabled: upgrading[business.id],
                style: {
                  padding: '8px 20px',
                  background: upgrading[business.id] ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: upgrading[business.id] ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              },
                upgrading[business.id] ? 'Processing...' : React.createElement(React.Fragment, null, React.createElement(CheckCircle, { size: 14 }), 'Approve')
              ),
              React.createElement('button', {
                onClick: () => resetLimit(business.id),
                style: {
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }
              }, 'Reset Free')
            )
          )
        )
    )
  );
}

export default AdminSubscriptionManager;