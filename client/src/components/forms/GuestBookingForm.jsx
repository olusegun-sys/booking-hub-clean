// FILE: client/src/components/forms/GuestBookingForm.jsx
// COMPLETE FIX - With proper API_BASE and error handling

import React, { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, ArrowLeft, User, Mail, Phone, Edit3 } from 'lucide-react';
import API_BASE from '../../config';
import { showError, showSuccess } from '../../toast';

function GuestBookingForm({ 
  businessId, 
  serviceType, 
  serviceDetails, 
  totalAmount, 
  onBack, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  function validate() {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[\d\s+()-]{10,15}$/.test(formData.phone)) newErrors.phone = 'Valid phone required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      console.log('[GuestBookingForm] Submitting booking...');
      console.log('[GuestBookingForm] API_BASE:', API_BASE);
      console.log('[GuestBookingForm] businessId:', businessId);
      console.log('[GuestBookingForm] serviceDetails:', serviceDetails);
      console.log('[GuestBookingForm] totalAmount:', totalAmount);
      
      // Build the booking data
      const bookingData = {
        businessId: businessId,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        specialRequests: formData.specialRequests,
        totalAmount: totalAmount,
        paymentMethod: 'pay_at_venue',
        bookingDetails: {
          ...serviceDetails,
          serviceType: serviceType
        },
        // For compatibility with the backend
        checkIn: serviceDetails?.date || serviceDetails?.checkIn || new Date().toISOString().split('T')[0],
        checkOut: serviceDetails?.date || serviceDetails?.checkOut || new Date().toISOString().split('T')[0],
        guests: serviceDetails?.attendees || serviceDetails?.guests || 1
      };
      
      console.log('[GuestBookingForm] Booking data:', bookingData);
      
      const response = await fetch(API_BASE + '/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      console.log('[GuestBookingForm] Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[GuestBookingForm] Parse error:', parseError);
        throw new Error('Server returned an invalid response');
      }
      
      console.log('[GuestBookingForm] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      if (data.success) {
        showSuccess('Booking confirmed! Check your email.');
        if (onSuccess) onSuccess(data.booking, formData.email);
      } else {
        showError(data.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('[GuestBookingForm] Error:', err);
      showError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN',
      minimumFractionDigits: 0 
    }).format(price || 0);
  };

  // ========== STYLES ==========
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  const modalStyle = {
    background: 'white',
    borderRadius: '24px',
    maxWidth: '480px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  };

  const titleStyle = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  };

  const closeButtonStyle = {
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  };

  const summaryStyle = {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '16px 20px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0'
  };

  const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '14px'
  };

  const summaryLabelStyle = {
    color: '#64748b',
    fontWeight: '500'
  };

  const summaryValueStyle = {
    fontWeight: '600',
    color: '#0f172a'
  };

  const totalStyle = {
    borderTop: '1px solid #e2e8f0',
    marginTop: '8px',
    paddingTop: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: '700',
    color: '#4f46e5'
  };

  const formGroupStyle = {
    marginBottom: '16px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '4px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  const inputErrorStyle = {
    ...inputStyle,
    borderColor: '#ef4444'
  };

  const errorTextStyle = {
    color: '#ef4444',
    fontSize: '11px',
    marginTop: '4px'
  };

  const buttonRowStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  };

  const backButtonStyle = {
    flex: 1,
    padding: '12px',
    background: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const submitButtonStyle = {
    flex: 2,
    padding: '12px',
    background: submitting ? '#94a3b8' : '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: submitting ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  return React.createElement('div', { style: overlayStyle, onClick: (e) => { if (e.target === e.currentTarget) onBack(); } },
    React.createElement('div', { style: modalStyle },
      // Header
      React.createElement('div', { style: headerStyle },
        React.createElement('h2', { style: titleStyle }, 'Complete Booking'),
        React.createElement('button', { 
          onClick: onBack, 
          style: closeButtonStyle,
          onMouseEnter: (e) => e.currentTarget.style.background = '#e2e8f0',
          onMouseLeave: (e) => e.currentTarget.style.background = '#f1f5f9'
        }, React.createElement(X, { size: 18, color: '#64748b' }))
      ),

      // Summary
      React.createElement('div', { style: summaryStyle },
        Object.keys(serviceDetails || {}).map(key => {
          if (key === 'price') return null;
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          return React.createElement('div', { key: key, style: summaryRowStyle },
            React.createElement('span', { style: summaryLabelStyle }, label),
            React.createElement('span', { style: summaryValueStyle }, serviceDetails[key])
          );
        }),
        React.createElement('div', { style: totalStyle },
          React.createElement('span', null, 'Total'),
          React.createElement('span', null, formatPrice(totalAmount))
        )
      ),

      // Form
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { style: formGroupStyle },
          React.createElement('label', { style: labelStyle },
            React.createElement(User, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
            'Full Name *'
          ),
          React.createElement('input', {
            type: 'text',
            value: formData.fullName,
            onChange: (e) => handleChange('fullName', e.target.value),
            placeholder: 'Enter your full name',
            style: errors.fullName ? inputErrorStyle : inputStyle,
            onFocus: (e) => { if (!errors.fullName) e.target.style.borderColor = '#4f46e5'; },
            onBlur: (e) => { e.target.style.borderColor = '#e2e8f0'; }
          }),
          errors.fullName && React.createElement('span', { style: errorTextStyle }, errors.fullName)
        ),

        React.createElement('div', { style: formGroupStyle },
          React.createElement('label', { style: labelStyle },
            React.createElement(Mail, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
            'Email Address *'
          ),
          React.createElement('input', {
            type: 'email',
            value: formData.email,
            onChange: (e) => handleChange('email', e.target.value),
            placeholder: 'you@email.com',
            style: errors.email ? inputErrorStyle : inputStyle,
            onFocus: (e) => { if (!errors.email) e.target.style.borderColor = '#4f46e5'; },
            onBlur: (e) => { e.target.style.borderColor = '#e2e8f0'; }
          }),
          errors.email && React.createElement('span', { style: errorTextStyle }, errors.email)
        ),

        React.createElement('div', { style: formGroupStyle },
          React.createElement('label', { style: labelStyle },
            React.createElement(Phone, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
            'Phone Number *'
          ),
          React.createElement('input', {
            type: 'tel',
            value: formData.phone,
            onChange: (e) => handleChange('phone', e.target.value),
            placeholder: '080 1234 5678',
            style: errors.phone ? inputErrorStyle : inputStyle,
            onFocus: (e) => { if (!errors.phone) e.target.style.borderColor = '#4f46e5'; },
            onBlur: (e) => { e.target.style.borderColor = '#e2e8f0'; }
          }),
          errors.phone && React.createElement('span', { style: errorTextStyle }, errors.phone)
        ),

        React.createElement('div', { style: formGroupStyle },
          React.createElement('label', { style: labelStyle },
            React.createElement(Edit3, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
            'Special Requests'
          ),
          React.createElement('textarea', {
            value: formData.specialRequests,
            onChange: (e) => handleChange('specialRequests', e.target.value),
            placeholder: 'Any special requests...',
            rows: 2,
            style: { ...inputStyle, resize: 'vertical', minHeight: '50px' },
            onFocus: (e) => e.target.style.borderColor = '#4f46e5',
            onBlur: (e) => e.target.style.borderColor = '#e2e8f0'
          })
        ),

        React.createElement('div', { style: buttonRowStyle },
          React.createElement('button', {
            type: 'button',
            onClick: onBack,
            style: backButtonStyle,
            onMouseEnter: (e) => e.currentTarget.style.background = '#f1f5f9',
            onMouseLeave: (e) => e.currentTarget.style.background = 'white'
          }, React.createElement(ArrowLeft, { size: 16 }), 'Back'),
          React.createElement('button', {
            type: 'submit',
            disabled: submitting,
            style: submitButtonStyle,
            onMouseEnter: (e) => { if (!submitting) e.currentTarget.style.background = '#4338CA'; },
            onMouseLeave: (e) => { e.currentTarget.style.background = submitting ? '#94a3b8' : '#4f46e5'; }
          },
            submitting ? React.createElement(Loader2, { size: 18, style: { animation: 'spin 1s linear infinite' } }) : null,
            submitting ? 'Processing...' : 'Confirm Booking'
          )
        )
      )
    )
  );
}

export default GuestBookingForm;