// FILE: client/src/BusinessSettings.jsx
// RESTYLED 21 Oct 2026 (Session 4) — unified with PLZ tokens.
// Preserved: all fetch URLs, all business logic, all payload shapes.
// One intentional behaviour fix (see getBusinessToken below):
// reads 'business_token' first to match the 21 Sept scoped-token refactor.

import React, { useState, useEffect } from 'react';
import {
  Clock, X, Plus, Trash2, AlertCircle, CheckCircle, Globe, Copy, Check, Save, Calendar, ArrowLeft, TimerIcon,
  Phone, MapPin, ChevronDown, ChevronRight
} from 'lucide-react';
import API_BASE from './config';

// ============================================================
// DESIGN TOKENS — matches Plazzaa marketing design
// ============================================================
const PLZ = {
  blue: '#2D60EA',
  blueDeep: '#1F47B4',
  blueTint: '#E8F4FF',
  ink: '#18181B',
  body: '#52525B',
  muted: '#A1A1AA',
  line: '#E4E4E7',
  surface: '#F4F4F5',
  success: '#1B7F43',
  successTint: '#E7F4EC',
  warning: '#B0840F',
  warningTint: '#FBF3DD',
  danger: '#C0395A',
  dangerTint: '#FCECEF',
  radiusSm: '10px',
  radiusMd: '14px',
  radiusLg: '16px',
  radiusXl: '20px',
  font: "'Manrope', 'Inter', system-ui, -apple-system, sans-serif",
  shadowSm: '0 1px 3px rgba(15, 23, 42, 0.04)',
  shadowMd: '0 8px 24px rgba(15, 23, 42, 0.06)'
};

// ============================================================
// TOKEN HELPER — matches RoomPage (7 Oct scoped-token fix)
// ============================================================
// WHY: The 21 Sept scoped-token refactor moved business sessions to
// `business_token`. This file was still reading only `auth_token`,
// producing `Authorization: Bearer null` → 401 on every Settings save
// for any business signed up after 21 Sept. Reading business_token
// first restores the same behaviour as RoomPage and Emmanuel's login.
function getBusinessToken() {
  return (
    localStorage.getItem('business_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    null
  );
}

function BusinessSettings({ business, onBack, onBusinessUpdate }) {
  const [operatingHours, setOperatingHours] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDesktop, setIsDesktop] = useState(true);

  const [customDomain, setCustomDomain] = useState(business?.custom_domain || '');
  const [domainCopied, setDomainCopied] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);

  // WHY: token read fresh via helper — no longer captured once at mount.
  const token = getBusinessToken();

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
    Promise.all([
      fetchOperatingHours(),
      fetchBlockedDates()
    ])
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
    setTimeout(function() { setMessage({ type: '', text: '' }); }, 5000);
  }

  // ============================================================
  // OPERATING HOURS
  // ============================================================
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

  // ============================================================
  // BLOCKED DATES
  // ============================================================
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

  // ============================================================
  // DOMAIN
  // ============================================================
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
          setExpiresAt(data.expiresAt);

          if (data.expiresAt) {
            const expiryDate = new Date(data.expiresAt);
            const hoursLeft = Math.round((expiryDate - new Date()) / (1000 * 60 * 60));
            showMessage('success', 'Verification code generated! It expires in ' + hoursLeft + ' hours.');
          } else {
            showMessage('success', 'Verification code generated! Add this TXT record to your DNS.');
          }
        } else {
          showMessage('error', data.error || 'Failed to generate code');
        }
      })
      .catch(function() {
        showMessage('error', 'Something went wrong');
      })
      .finally(function() { setVerifyingDomain(false); });
  }

  function verifyDomain() {
    if (!customDomain) {
      showMessage('error', 'Please enter a domain');
      return;
    }

    if (!verificationCode) {
      showMessage('error', 'Please generate a verification code first');
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
          showMessage('success', 'Domain verified successfully! Your booking page is now live at this domain.');
          setVerificationCode('');
          setExpiresAt(null);
          if (onBusinessUpdate) onBusinessUpdate();
        } else {
          showMessage('error', data.error || 'Verification failed. Please check DNS and try again.');
        }
      })
      .catch(function() {
        showMessage('error', 'Something went wrong');
      })
      .finally(function() { setVerifyingDomain(false); });
  }

  function copyDomainCode() {
    navigator.clipboard.writeText(verificationCode);
    setDomainCopied(true);
    setTimeout(function() { setDomainCopied(false); }, 2000);
  }

  // ============================================================
  // STYLES
  // ============================================================
  var containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: isDesktop ? '32px' : '16px',
    fontFamily: PLZ.font
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
    color: PLZ.ink,
    margin: 0
  };

  var backButtonStyle = {
    padding: isDesktop ? '10px 20px' : '8px 16px',
    backgroundColor: PLZ.surface,
    color: PLZ.body,
    border: 'none',
    borderRadius: PLZ.radiusSm,
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
    borderRadius: isDesktop ? PLZ.radiusXl : PLZ.radiusLg,
    border: `1px solid ${PLZ.line}`,
    overflow: 'hidden',
    marginBottom: '24px',
    boxShadow: PLZ.shadowSm
  };

  var cardHeaderStyle = {
    padding: isDesktop ? '20px 24px' : '16px 20px',
    borderBottom: `1px solid ${PLZ.line}`,
    backgroundColor: PLZ.surface,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  var cardTitleStyle = {
    fontSize: isDesktop ? '18px' : '16px',
    fontWeight: '700',
    color: PLZ.ink,
    margin: 0
  };

  var cardBodyStyle = {
    padding: isDesktop ? '24px' : '20px'
  };

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  var hourRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isDesktop ? '12px 16px' : '12px 0',
    borderBottom: `1px solid ${PLZ.line}`
  };

  var hoursContainerStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
    gap: isDesktop ? '16px' : '12px'
  };

  // WHY: small input/select style reused across cards — token-sourced.
  var fieldStyle = {
    padding: isDesktop ? '8px 12px' : '6px 10px',
    border: `1px solid ${PLZ.line}`,
    borderRadius: PLZ.radiusSm,
    fontSize: isDesktop ? '13px' : '12px',
    backgroundColor: 'white',
    color: PLZ.ink,
    outline: 'none'
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
      borderRadius: PLZ.radiusMd,
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: message.type === 'success' ? PLZ.successTint : message.type === 'warning' ? PLZ.warningTint : PLZ.dangerTint,
      color: message.type === 'success' ? PLZ.success : message.type === 'warning' ? PLZ.warning : PLZ.danger,
      border: `1px solid ${message.type === 'success' ? PLZ.success : message.type === 'warning' ? PLZ.warning : PLZ.danger}`
    } },
      message.type === 'success' ? React.createElement(CheckCircle, { size: 18 }) : React.createElement(AlertCircle, { size: 18 }),
      message.text
    ),

    React.createElement('div', { style: gridStyle },
      // Operating Hours Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement(Clock, { size: isDesktop ? 20 : 18, color: PLZ.blue }),
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
                      backgroundColor: hour.is_open ? PLZ.blue : PLZ.line,
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
                  React.createElement('span', { style: { fontWeight: '600', minWidth: '90px', fontSize: isDesktop ? '14px' : '13px', color: PLZ.ink } }, hour.day_name)
                ),
                hour.is_open ?
                  React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                    React.createElement('select', {
                      value: hour.open_time,
                      onChange: function(e) { updateHour(idx, 'open_time', e.target.value); },
                      style: fieldStyle
                    }, timeSlots.map(function(t) { return React.createElement('option', { key: t, value: t }, t); })),
                    React.createElement('span', { style: { fontSize: '12px', color: PLZ.muted } }, 'to'),
                    React.createElement('select', {
                      value: hour.close_time,
                      onChange: function(e) { updateHour(idx, 'close_time', e.target.value); },
                      style: fieldStyle
                    }, timeSlots.map(function(t) { return React.createElement('option', { key: t, value: t }, t); }))
                  ) :
                  React.createElement('span', { style: { fontSize: '13px', color: PLZ.muted } }, 'Closed')
              );
            })
          ),
          React.createElement('div', { style: { marginTop: '24px', textAlign: 'right' } },
            React.createElement('button', {
              onClick: saveOperatingHours,
              disabled: saving,
              style: {
                padding: isDesktop ? '10px 24px' : '10px 20px',
                backgroundColor: PLZ.blue,
                color: 'white',
                border: 'none',
                borderRadius: PLZ.radiusSm,
                fontSize: isDesktop ? '14px' : '13px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: saving ? 0.7 : 1
              }
            }, React.createElement(Save, { size: isDesktop ? 16 : 14 }), saving ? 'Saving...' : 'Save Hours')
          )
        )
      ),

      // Custom Domain Settings Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement(Globe, { size: isDesktop ? 20 : 18, color: PLZ.blue }),
          React.createElement('h3', { style: cardTitleStyle }, 'Custom Domain')
        ),
        React.createElement('div', { style: cardBodyStyle },
          React.createElement('p', { style: { fontSize: '13px', color: PLZ.muted, marginBottom: '16px' } },
            'Connect your own domain (e.g., book.yourbusiness.com). Once verified, your booking page will be available at your custom domain.'
          ),
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: PLZ.body } }, 'Custom Domain'),
            React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
              React.createElement('input', {
                type: 'text',
                value: customDomain,
                onChange: function(e) { setCustomDomain(e.target.value); },
                placeholder: 'book.yourbusiness.com',
                style: {
                  flex: 1,
                  padding: '12px 14px',
                  border: `1.5px solid ${PLZ.line}`,
                  borderRadius: PLZ.radiusSm,
                  fontSize: '14px',
                  minWidth: '200px',
                  color: PLZ.ink,
                  outline: 'none'
                }
              }),
              React.createElement('button', {
                onClick: verifyDomain,
                disabled: !customDomain || verifyingDomain || !verificationCode,
                style: {
                  padding: '12px 24px',
                  backgroundColor: (!customDomain || verifyingDomain || !verificationCode) ? PLZ.muted : PLZ.blue,
                  color: 'white',
                  border: 'none',
                  borderRadius: PLZ.radiusSm,
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: (!customDomain || verifyingDomain || !verificationCode) ? 'not-allowed' : 'pointer'
                }
              }, verifyingDomain ? 'Verifying...' : 'Verify Domain')
            )
          ),
          business.custom_domain && business.is_domain_verified && React.createElement('div', { style: {
            backgroundColor: PLZ.successTint,
            padding: '12px',
            borderRadius: PLZ.radiusMd,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: PLZ.success
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
              backgroundColor: PLZ.surface,
              color: PLZ.body,
              border: 'none',
              borderRadius: PLZ.radiusSm,
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }
          }, verifyingDomain ? 'Generating...' : 'Generate DNS Verification Code'),
          verificationCode && React.createElement('div', { style: {
            marginTop: '16px',
            padding: '14px',
            backgroundColor: PLZ.surface,
            borderRadius: PLZ.radiusMd,
            border: `1px solid ${PLZ.line}`
          } },
            React.createElement('div', { style: { fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: PLZ.body } }, 'Add this TXT record to your DNS:'),
            React.createElement('div', { style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            } },
              React.createElement('code', { style: {
                background: PLZ.line,
                padding: '8px 12px',
                borderRadius: PLZ.radiusSm,
                fontSize: '12px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                flex: 1,
                color: PLZ.ink
              } }, verificationCode),
              React.createElement('button', {
                onClick: copyDomainCode,
                style: {
                  padding: '8px 16px',
                  backgroundColor: PLZ.blue,
                  color: 'white',
                  border: 'none',
                  borderRadius: PLZ.radiusSm,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              }, domainCopied ? React.createElement(Check, { size: 14 }) : React.createElement(Copy, { size: 14 }), domainCopied ? 'Copied!' : 'Copy')
            ),
            expiresAt && React.createElement('div', { style: {
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: PLZ.warningTint,
              borderRadius: PLZ.radiusSm,
              fontSize: '12px',
              color: PLZ.warning,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            } },
              React.createElement(TimerIcon, { size: 14 }),
              'This code expires in ' + Math.round((new Date(expiresAt) - new Date()) / (1000 * 60 * 60)) + ' hours'
            )
          )
        )
      ),

      // Blocked Dates Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement(Calendar, { size: isDesktop ? 20 : 18, color: PLZ.danger }),
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
                border: `1.5px solid ${PLZ.line}`,
                borderRadius: PLZ.radiusSm,
                fontSize: '14px',
                color: PLZ.ink,
                outline: 'none'
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
                border: `1.5px solid ${PLZ.line}`,
                borderRadius: PLZ.radiusSm,
                fontSize: '14px',
                color: PLZ.ink,
                outline: 'none'
              }
            }),
            React.createElement('button', {
              onClick: addBlockedDate,
              disabled: saving,
              style: {
                padding: '12px 20px',
                backgroundColor: PLZ.danger,
                color: 'white',
                border: 'none',
                borderRadius: PLZ.radiusSm,
                fontSize: '13px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: saving ? 0.7 : 1
              }
            }, React.createElement(Plus, { size: 14 }), 'Block')
          ),
          blockedDates.length === 0 ?
            React.createElement('p', { style: { textAlign: 'center', color: PLZ.muted, padding: '40px' } }, 'No blocked dates') :
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
              blockedDates.map(function(date, idx) {
                return React.createElement('div', { key: idx, style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: PLZ.dangerTint,
                  borderRadius: PLZ.radiusMd
                } },
                  React.createElement('div', null,
                    React.createElement('div', { style: { fontWeight: '600', fontSize: '14px', color: PLZ.ink } }, new Date(date.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })),
                    date.reason && React.createElement('div', { style: { fontSize: '12px', color: PLZ.danger } }, date.reason)
                  ),
                  React.createElement('button', {
                    onClick: function() { removeBlockedDate(date.date); },
                    style: { background: 'none', border: 'none', cursor: 'pointer', color: PLZ.muted }
                  }, React.createElement(Trash2, { size: 18 }))
                );
              })
            )
        )
      ),

      // Contact Phone Numbers (read-only block, kept as-is)
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement(Phone, { size: isDesktop ? 20 : 18, color: PLZ.blue }),
          React.createElement('h3', { style: cardTitleStyle }, 'Contact Phone Numbers')
        ),
        React.createElement('div', { style: cardBodyStyle },
          React.createElement('p', { style: { fontSize: '13px', color: PLZ.muted, marginBottom: '16px' } },
            'Add phone numbers that customers can use to contact your business.'
          ),
          business.phone && React.createElement('div', { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: PLZ.surface,
            borderRadius: PLZ.radiusMd,
            marginBottom: '8px'
          } },
            React.createElement('span', { style: { fontSize: '14px', fontWeight: '500', color: PLZ.ink } }, business.phone),
            React.createElement('span', { style: { fontSize: '12px', color: PLZ.muted } }, 'Primary')
          ),
          React.createElement('p', { style: { textAlign: 'center', color: PLZ.muted, padding: '20px', fontSize: '13px' } },
            'Phone numbers are managed in your Business Profile settings.'
          )
        )
      )
    )
  );
}

export default BusinessSettings;