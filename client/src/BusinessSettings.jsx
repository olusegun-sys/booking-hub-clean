import React, { useState, useEffect } from 'react';
import { Clock, X, Plus, Trash2, AlertCircle, CheckCircle, Globe, Copy, Check, Save, Calendar, ArrowLeft } from 'lucide-react';
import API_BASE from './config';

function BusinessSettings({ business, onBack, onBusinessUpdate }) {
  const [operatingHours, setOperatingHours] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDesktop, setIsDesktop] = useState(true);

  // Domain settings state
  const [customDomain, setCustomDomain] = useState(business?.custom_domain || '');
  const [domainCopied, setDomainCopied] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const token = localStorage.getItem('auth_token');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];

  useEffect(function() {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchData();
    return function() { window.removeEventListener('resize', handleResize); };
  }, [business.id]);

  function fetchData() {
    setLoading(true);
    Promise.all([fetchOperatingHours(), fetchBlockedDates()])
      .finally(function() { setLoading(false); });
  }

  function fetchOperatingHours() {
    return fetch(API_BASE + '/api/businesses/' + business.id + '/operating-hours', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success && data.operatingHours && data.operatingHours.length > 0) {
          setOperatingHours(data.operatingHours);
        } else {
          var defaultHours = daysOfWeek.map(function(day, index) {
            return { day_of_week: index, day_name: day, is_open: true, open_time: '09:00', close_time: '21:00' };
          });
          setOperatingHours(defaultHours);
        }
      })
      .catch(function() { showMessage('error', 'Failed to load operating hours'); });
  }

  function fetchBlockedDates() {
    return fetch(API_BASE + '/api/businesses/' + business.id + '/blocked-dates', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) setBlockedDates(data.blockedDates || []);
      })
      .catch(function() {});
  }

  function showMessage(type, text) {
    setMessage({ type: type, text: text });
    setTimeout(function() { setMessage({ type: '', text: '' }); }, 3000);
  }

  function toggleDayOpen(index) {
    var updated = operatingHours.slice();
    updated[index].is_open = !updated[index].is_open;
    setOperatingHours(updated);
  }

  function updateHour(index, field, value) {
    var updated = operatingHours.slice();
    updated[index][field] = value;
    setOperatingHours(updated);
  }

  function saveOperatingHours() {
    setSaving(true);
    fetch(API_BASE + '/api/businesses/' + business.id + '/operating-hours', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ operatingHours: operatingHours })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) showMessage('success', 'Operating hours saved');
        else showMessage('error', 'Failed to save');
      })
      .catch(function() { showMessage('error', 'Something went wrong'); })
      .finally(function() { setSaving(false); });
  }

  function addBlockedDate() {
    if (!newBlockedDate) {
      showMessage('error', 'Please select a date');
      return;
    }
    setSaving(true);
    fetch(API_BASE + '/api/businesses/' + business.id + '/block-date', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ date: newBlockedDate, reason: newBlockedReason || 'Blocked' })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          setBlockedDates(blockedDates.concat([data.blockedDate]));
          setNewBlockedDate('');
          setNewBlockedReason('');
          showMessage('success', 'Date blocked');
        } else showMessage('error', 'Failed to block date');
      })
      .catch(function() { showMessage('error', 'Something went wrong'); })
      .finally(function() { setSaving(false); });
  }

  function removeBlockedDate(date) {
    setSaving(true);
    fetch(API_BASE + '/api/businesses/' + business.id + '/block-date/' + date, { 
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          setBlockedDates(blockedDates.filter(function(d) { return d.date !== date; }));
          showMessage('success', 'Date unblocked');
        } else showMessage('error', 'Failed to unblock');
      })
      .catch(function() { showMessage('error', 'Something went wrong'); })
      .finally(function() { setSaving(false); });
  }

  // FIXED: Generate verification code - No business ID in URL, uses session token
  function generateVerificationCode() {
    setVerifyingDomain(true);
    fetch(API_BASE + '/api/businesses/generate-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          setVerificationCode(data.verificationCode);
          showMessage('success', 'Verification code generated. Add this TXT record to your DNS.');
        } else {
          showMessage('error', data.error || 'Failed to generate code');
        }
      })
      .catch(function() { showMessage('error', 'Something went wrong'); })
      .finally(function() { setVerifyingDomain(false); });
  }

  // FIXED: Verify domain - No business ID in URL, uses session token
  function verifyDomain() {
    if (!customDomain) {
      showMessage('error', 'Please enter a domain');
      return;
    }
    setVerifyingDomain(true);
    fetch(API_BASE + '/api/businesses/check-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ custom_domain: customDomain })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          showMessage('success', 'Domain verified successfully!');
          if (onBusinessUpdate) onBusinessUpdate();
        } else {
          showMessage('error', data.error || 'Verification failed. Please add the TXT record to your DNS and try again.');
        }
      })
      .catch(function() { showMessage('error', 'Something went wrong'); })
      .finally(function() { setVerifyingDomain(false); });
  }

  function copyDomainCode() {
    navigator.clipboard.writeText(verificationCode);
    setDomainCopied(true);
    setTimeout(function() { setDomainCopied(false); }, 2000);
  }

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  var containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: isDesktop ? '32px' : '16px'
  };

  var headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isDesktop ? '32px' : '24px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  var titleStyle = {
    fontSize: isDesktop ? '24px' : '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  };

  var backButtonStyle = {
    padding: isDesktop ? '10px 20px' : '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontSize: isDesktop ? '14px' : '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  var gridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
    gap: isDesktop ? '32px' : '20px'
  };

  var cardStyle = {
    backgroundColor: 'white',
    borderRadius: isDesktop ? '20px' : '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  };

  var cardHeaderStyle = {
    padding: isDesktop ? '20px 24px' : '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  var cardTitleStyle = {
    fontSize: isDesktop ? '18px' : '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  };

  var cardBodyStyle = {
    padding: isDesktop ? '24px' : '20px'
  };

  var hoursContainerStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
    gap: isDesktop ? '16px' : '12px'
  };

  var hourRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isDesktop ? '12px 16px' : '12px 0',
    borderBottom: '1px solid #f1f5f9'
  };

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: headerStyle },
      React.createElement('button', { onClick: onBack, style: backButtonStyle },
        React.createElement(ArrowLeft, { size: 16 }),
        ' Back to Dashboard'
      ),
      React.createElement('h1', { style: titleStyle }, 'Settings')
    ),

    message.text && React.createElement('div', { style: {
      padding: '12px 16px',
      borderRadius: '10px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
      color: message.type === 'success' ? '#065f46' : '#991b1b'
    } },
      message.type === 'success' ? React.createElement(CheckCircle, { size: 18 }) : React.createElement(AlertCircle, { size: 18 }),
      message.text
    ),

    React.createElement('div', { style: gridStyle },
      // Operating Hours Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement(Clock, { size: isDesktop ? 20 : 18, color: '#4f46e5' }),
          React.createElement('h3', { style: cardTitleStyle }, 'Operating Hours')
        ),
        React.createElement('div', { style: cardBodyStyle },
          React.createElement('div', { style: hoursContainerStyle },
            operatingHours.map(function(hour, idx) {
              return React.createElement('div', { key: idx, style: hourRowStyle },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                  React.createElement('div', {
                    onClick: function() { toggleDayOpen(idx); },
                    style: {
                      width: '44px',
                      height: '24px',
                      backgroundColor: hour.is_open ? '#4f46e5' : '#cbd5e1',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s'
                    }
                  },
                    React.createElement('div', {
                      style: {
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: hour.is_open ? '22px' : '2px',
                        transition: 'all 0.2s'
                      }
                    })
                  ),
                  React.createElement('span', { style: { fontWeight: '600', minWidth: '90px', fontSize: isDesktop ? '14px' : '13px' } }, hour.day_name)
                ),
                hour.is_open ? 
                  React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                    React.createElement('select', {
                      value: hour.open_time,
                      onChange: function(e) { updateHour(idx, 'open_time', e.target.value); },
                      style: {
                        padding: isDesktop ? '8px 12px' : '6px 10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: isDesktop ? '13px' : '12px',
                        backgroundColor: 'white'
                      }
                    }, timeSlots.map(function(t) { return React.createElement('option', { key: t, value: t }, t); })),
                    React.createElement('span', { style: { fontSize: '12px' } }, 'to'),
                    React.createElement('select', {
                      value: hour.close_time,
                      onChange: function(e) { updateHour(idx, 'close_time', e.target.value); },
                      style: {
                        padding: isDesktop ? '8px 12px' : '6px 10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: isDesktop ? '13px' : '12px',
                        backgroundColor: 'white'
                      }
                    }, timeSlots.map(function(t) { return React.createElement('option', { key: t, value: t }, t); }))
                  ) :
                  React.createElement('span', { style: { fontSize: '13px', color: '#94a3b8' } }, 'Closed')
              );
            })
          ),
          React.createElement('div', { style: { marginTop: '24px', textAlign: 'right' } },
            React.createElement('button', {
              onClick: saveOperatingHours,
              disabled: saving,
              style: {
                padding: isDesktop ? '10px 24px' : '10px 20px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: isDesktop ? '14px' : '13px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, React.createElement(Save, { size: isDesktop ? 16 : 14 }), saving ? 'Saving...' : 'Save Hours')
          )
        )
      ),

      // Custom Domain Settings Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement(Globe, { size: isDesktop ? 20 : 18, color: '#4f46e5' }),
          React.createElement('h3', { style: cardTitleStyle }, 'Custom Domain')
        ),
        React.createElement('div', { style: cardBodyStyle },
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } }, 
            'Connect your own domain (e.g., book.yourbusiness.com). Once verified, your booking page will be available at your custom domain.'
          ),
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#475569' } }, 'Custom Domain'),
            React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
              React.createElement('input', {
                type: 'text',
                value: customDomain,
                onChange: function(e) { setCustomDomain(e.target.value); },
                placeholder: 'book.yourbusiness.com',
                style: {
                  flex: 1,
                  padding: '12px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  minWidth: '200px'
                }
              }),
              React.createElement('button', {
                onClick: verifyDomain,
                disabled: !customDomain || verifyingDomain,
                style: {
                  padding: '12px 24px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: (!customDomain || verifyingDomain) ? 'not-allowed' : 'pointer'
                }
              }, verifyingDomain ? 'Verifying...' : 'Verify Domain')
            )
          ),
          business.custom_domain && business.is_domain_verified && React.createElement('div', { style: {
            backgroundColor: '#d1fae5',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#065f46'
          } },
            React.createElement(CheckCircle, { size: 16 }),
            'Domain verified: ', business.custom_domain
          ),
          React.createElement('button', {
            onClick: generateVerificationCode,
            disabled: verifyingDomain,
            style: {
              width: '100%',
              padding: '10px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }
          }, 'Generate DNS Verification Code'),
          verificationCode && React.createElement('div', { style: {
            marginTop: '16px',
            padding: '14px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          } },
            React.createElement('div', { style: { fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#475569' } }, 'Add this TXT record to your DNS:'),
            React.createElement('div', { style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            } },
              React.createElement('code', { style: {
                background: '#e2e8f0',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                flex: 1
              } }, verificationCode),
              React.createElement('button', {
                onClick: copyDomainCode,
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              }, domainCopied ? React.createElement(Check, { size: 14 }) : React.createElement(Copy, { size: 14 }), domainCopied ? 'Copied!' : 'Copy')
            )
          )
        )
      ),

      // Blocked Dates Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement(Calendar, { size: isDesktop ? 20 : 18, color: '#ef4444' }),
          React.createElement('h3', { style: cardTitleStyle }, 'Blocked Dates')
        ),
        React.createElement('div', { style: cardBodyStyle },
          React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' } },
            React.createElement('input', {
              type: 'date',
              value: newBlockedDate,
              onChange: function(e) { setNewBlockedDate(e.target.value); },
              style: {
                flex: 2,
                padding: '12px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px'
              }
            }),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Reason (optional)',
              value: newBlockedReason,
              onChange: function(e) { setNewBlockedReason(e.target.value); },
              style: {
                flex: 3,
                padding: '12px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px'
              }
            }),
            React.createElement('button', {
              onClick: addBlockedDate,
              disabled: saving,
              style: {
                padding: '12px 20px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }
            }, React.createElement(Plus, { size: 14 }), 'Block')
          ),
          blockedDates.length === 0 ?
            React.createElement('p', { style: { textAlign: 'center', color: '#94a3b8', padding: '40px' } }, 'No blocked dates') :
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
              blockedDates.map(function(date, idx) {
                return React.createElement('div', { key: idx, style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '10px'
                } },
                  React.createElement('div', null,
                    React.createElement('div', { style: { fontWeight: '600', fontSize: '14px' } }, new Date(date.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })),
                    date.reason && React.createElement('div', { style: { fontSize: '12px', color: '#dc2626' } }, date.reason)
                  ),
                  React.createElement('button', {
                    onClick: function() { removeBlockedDate(date.date); },
                    style: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }
                  }, React.createElement(Trash2, { size: 18 }))
                );
              })
            )
        )
      )
    )
  );
}

export default BusinessSettings;