// FILE: client/src/components/forms/GuestBookingForm.jsx
// ENHANCED: Added Paystack payment support for Sports and Event bookings
// No breaking changes - "Pay at Venue" still works exactly as before

import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Users, Wallet, CreditCard, MapPin, Loader2, Check } from 'lucide-react';
import { showSuccess, showError } from '../../toast';
import API_BASE from '../../config';

function GuestBookingForm({
  businessId,
  serviceType,
  serviceDetails,
  totalAmount,
  onBack,
  onSuccess
}) {
  // ============================================================
  // STATE
  // ============================================================
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('pay_at_venue');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // ============================================================
  // HELPERS
  // ============================================================
  const token = localStorage.getItem('auth_token');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  // ============================================================
  // VALIDATION
  // ============================================================
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s+()-]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================
  // PAYSTACK PAYMENT HANDLING
  // ============================================================

  /**
   * verifyPayment - Checks Paystack payment status after popup closes
   * @param {string} reference - Paystack transaction reference
   * @param {string} bookingReference - Our booking reference
   * @param {object} bookingData - The booking data to pass to onSuccess
   */
  const verifyPayment = async (reference, bookingReference, bookingData) => {
    try {
      const response = await fetch(`${API_BASE}/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reference: reference,
          bookingReference: bookingReference
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Payment successful! Your booking is confirmed.');
        // Pass the booking data with updated payment status
        const updatedBooking = {
          ...bookingData,
          payment_status: 'paid',
          payment_reference: reference
        };
        onSuccess && onSuccess(updatedBooking, formData.email);
      } else {
        showError('Payment verification failed. Please contact support with your booking reference: ' + bookingReference);
        // Still pass the booking but with payment status as pending
        onSuccess && onSuccess(bookingData, formData.email);
      }
    } catch (err) {
      console.error('[Paystack] Verification error:', err);
      showError('Could not verify payment. Your booking is confirmed but payment status is pending. Please contact support.');
      onSuccess && onSuccess(bookingData, formData.email);
    }
    setIsProcessingPayment(false);
  };

  /**
   * handlePaystackPayment - Initializes Paystack and opens the payment popup
   * @param {string} bookingReference - Our booking reference
   * @param {number} amount - Total amount in kobo
   * @param {string} customerEmail - Customer's email
   * @param {object} bookingData - Complete booking data
   */
  const handlePaystackPayment = async (bookingReference, amount, customerEmail, bookingData) => {
    setIsProcessingPayment(true);

    try {
      // Step 1: Create payment session with Paystack
      const response = await fetch(`${API_BASE}/api/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingReference: bookingReference,
          email: customerEmail,
          amount: Math.round(amount) // Ensure it's an integer (in kobo)
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Step 2: Open Paystack popup
      const popup = window.open(data.authorization_url, '_blank', 'width=500,height=600,scrollbars=yes');

      if (!popup) {
        // Popup was blocked
        showError('Popup blocked. Please allow popups for this site and try again.');
        setIsProcessingPayment(false);
        // Still create booking but with pending payment
        onSuccess && onSuccess(bookingData, formData.email);
        return;
      }

      // Step 3: Monitor popup for completion
      let popupClosed = false;
      const checkPopup = setInterval(() => {
        if (popup.closed && !popupClosed) {
          popupClosed = true;
          clearInterval(checkPopup);
          // Verify payment after popup closes
          verifyPayment(data.reference, bookingReference, bookingData);
        }
      }, 500);

      // Step 4: Timeout after 5 minutes (safety net)
      setTimeout(() => {
        if (!popupClosed) {
          clearInterval(checkPopup);
          if (!popup.closed) {
            popup.close();
          }
          popupClosed = true;
          showError('Payment timed out. Your booking is confirmed but payment is pending. Please contact support.');
          onSuccess && onSuccess(bookingData, formData.email);
          setIsProcessingPayment(false);
        }
      }, 300000); // 5 minutes

    } catch (err) {
      console.error('[Paystack] Initialization error:', err);
      showError(err.message || 'Something went wrong. Please try again.');
      // Still create booking but with pending payment
      onSuccess && onSuccess(bookingData, formData.email);
      setIsProcessingPayment(false);
    }
  };

  // ============================================================
  // FORM SUBMISSION
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!businessId) {
      showError('Business ID is missing. Please go back and try again.');
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      showError('Invalid total amount. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build booking data
      let bookingPayload = {
        businessId: businessId,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        totalAmount: totalAmount,
        specialRequests: formData.specialRequests || '',
        paymentMethod: paymentMethod,
        bookingDetails: {
          ...serviceDetails,
          serviceType: serviceType
        }
      };

      // Add service-specific fields
      if (serviceType === 'hotel') {
        bookingPayload.roomId = serviceDetails.roomId || null;
        bookingPayload.checkIn = serviceDetails.checkIn || '';
        bookingPayload.checkOut = serviceDetails.checkOut || '';
        bookingPayload.guests = serviceDetails.guests || 1;
      } else if (serviceType === 'sports') {
        bookingPayload.checkIn = serviceDetails.date || '';
        bookingPayload.guests = 1;
        bookingPayload.bookingDetails = {
          court: serviceDetails.court || '',
          date: serviceDetails.date || '',
          timeSlot: serviceDetails.timeSlot || ''
        };
      } else if (serviceType === 'event') {
        bookingPayload.checkIn = serviceDetails.date || '';
        bookingPayload.guests = serviceDetails.attendees || 1;
        bookingPayload.bookingDetails = {
          eventType: serviceDetails.eventType || '',
          date: serviceDetails.date || '',
          attendees: serviceDetails.attendees || 1
        };
      }

      // Create booking
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? 'Bearer ' + token : ''
        },
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      if (!data.success) {
        throw new Error(data.error || 'Booking creation failed');
      }

      const booking = data.booking;

      // Prepare booking data for callbacks
      const bookingData = {
        ...booking,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        total_amount: totalAmount,
        serviceDetails: serviceDetails,
        serviceType: serviceType
      };

      // Handle payment method
      if (paymentMethod === 'paystack') {
        // Pay with Card - initiate Paystack
        await handlePaystackPayment(
          booking.booking_reference,
          totalAmount,
          formData.email,
          bookingData
        );
        // handlePaystackPayment will call onSuccess when complete
      } else {
        // Pay at Venue - show confirmation immediately
        showSuccess('Booking confirmed! Check your email for details.');
        onSuccess && onSuccess(bookingData, formData.email);
      }

    } catch (err) {
      console.error('[GuestBookingForm] Submission error:', err);
      showError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // INPUT HANDLERS
  // ============================================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="app-container" style={{ padding: '20px', maxWidth: '560px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#475569',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#0f172a',
          margin: 0
        }}>
          Complete Your Booking
        </h2>
      </div>

      {/* Summary Card */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '6px 0',
          fontSize: '13px'
        }}>
          <span style={{ color: '#64748b' }}>Service</span>
          <span style={{ fontWeight: '600', color: '#0f172a' }}>
            {serviceType === 'hotel' ? 'Hotel Stay' :
             serviceType === 'sports' ? 'Sports Booking' :
             serviceType === 'event' ? 'Event Booking' : 'Booking'}
          </span>
        </div>

        {/* Service-specific details */}
        {serviceType === 'sports' && serviceDetails && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              fontSize: '13px'
            }}>
              <span style={{ color: '#64748b' }}>Court</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{serviceDetails.court || 'Standard Court'}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              fontSize: '13px'
            }}>
              <span style={{ color: '#64748b' }}>Date & Time</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>
                {serviceDetails.date || 'TBD'} {serviceDetails.timeSlot ? '· ' + serviceDetails.timeSlot : ''}
              </span>
            </div>
          </>
        )}

        {serviceType === 'event' && serviceDetails && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              fontSize: '13px'
            }}>
              <span style={{ color: '#64748b' }}>Event Type</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{serviceDetails.eventType || 'Event'}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              fontSize: '13px'
            }}>
              <span style={{ color: '#64748b' }}>Attendees</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{serviceDetails.attendees || 1}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              fontSize: '13px'
            }}>
              <span style={{ color: '#64748b' }}>Date</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{serviceDetails.date || 'TBD'}</span>
            </div>
          </>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 0 0',
          marginTop: '8px',
          borderTop: '2px solid #4f46e5'
        }}>
          <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>Total</span>
          <span style={{ fontWeight: '800', color: '#4f46e5', fontSize: '20px' }}>
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '4px'
          }}>
            <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: formErrors.fullName ? '2px solid #ef4444' : '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => { if (!formErrors.fullName) e.target.style.borderColor = '#4f46e5'; }}
            onBlur={(e) => { e.target.style.borderColor = formErrors.fullName ? '#ef4444' : '#e2e8f0'; }}
          />
          {formErrors.fullName && (
            <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              {formErrors.fullName}
            </span>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '4px'
          }}>
            <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: formErrors.email ? '2px solid #ef4444' : '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => { if (!formErrors.email) e.target.style.borderColor = '#4f46e5'; }}
            onBlur={(e) => { e.target.style.borderColor = formErrors.email ? '#ef4444' : '#e2e8f0'; }}
          />
          {formErrors.email && (
            <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              {formErrors.email}
            </span>
          )}
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '4px'
          }}>
            <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="080 1234 5678"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: formErrors.phone ? '2px solid #ef4444' : '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => { if (!formErrors.phone) e.target.style.borderColor = '#4f46e5'; }}
            onBlur={(e) => { e.target.style.borderColor = formErrors.phone ? '#ef4444' : '#e2e8f0'; }}
          />
          {formErrors.phone && (
            <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              {formErrors.phone}
            </span>
          )}
        </div>

        {/* Special Requests */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '4px'
          }}>
            Special Requests
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            placeholder="Any special requests..."
            rows="3"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '60px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
          />
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '8px'
          }}>
            <Wallet size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Payment Method
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {/* Pay at Venue */}
            <div
              onClick={() => setPaymentMethod('pay_at_venue')}
              style={{
                padding: '14px 12px',
                border: paymentMethod === 'pay_at_venue' ? '2px solid #4f46e5' : '2px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                background: paymentMethod === 'pay_at_venue' ? '#eef2ff' : 'white',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (paymentMethod !== 'pay_at_venue') {
                  e.currentTarget.style.borderColor = '#94a3b8';
                }
              }}
              onMouseLeave={(e) => {
                if (paymentMethod !== 'pay_at_venue') {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              <MapPin
                size={20}
                color={paymentMethod === 'pay_at_venue' ? '#4f46e5' : '#64748b'}
                style={{ display: 'block', margin: '0 auto 6px' }}
              />
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: paymentMethod === 'pay_at_venue' ? '#4f46e5' : '#0f172a',
                display: 'block'
              }}>
                Pay at Venue
              </span>
              <span style={{
                fontSize: '10px',
                color: '#94a3b8',
                display: 'block',
                marginTop: '2px'
              }}>
                Pay when you arrive
              </span>
              {paymentMethod === 'pay_at_venue' && (
                <div style={{
                  marginTop: '6px',
                  padding: '2px 12px',
                  background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                  borderRadius: '20px',
                  display: 'inline-block',
                  fontSize: '9px',
                  fontWeight: '700',
                  color: '#4f46e5',
                  letterSpacing: '0.3px'
                }}>
                  RECOMMENDED
                </div>
              )}
            </div>

            {/* Pay with Card */}
            <div
              onClick={() => setPaymentMethod('paystack')}
              style={{
                padding: '14px 12px',
                border: paymentMethod === 'paystack' ? '2px solid #4f46e5' : '2px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                background: paymentMethod === 'paystack' ? '#eef2ff' : 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (paymentMethod !== 'paystack') {
                  e.currentTarget.style.borderColor = '#94a3b8';
                }
              }}
              onMouseLeave={(e) => {
                if (paymentMethod !== 'paystack') {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              <CreditCard
                size={20}
                color={paymentMethod === 'paystack' ? '#4f46e5' : '#64748b'}
                style={{ display: 'block', margin: '0 auto 6px' }}
              />
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: paymentMethod === 'paystack' ? '#4f46e5' : '#0f172a',
                display: 'block'
              }}>
                Pay with Card
              </span>
              <span style={{
                fontSize: '10px',
                color: '#94a3b8',
                display: 'block',
                marginTop: '2px'
              }}>
                Secure online payment
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isProcessingPayment}
          style={{
            width: '100%',
            padding: '16px',
            background: (isSubmitting || isProcessingPayment) ? '#94a3b8' :
              'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: (isSubmitting || isProcessingPayment) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: (isSubmitting || isProcessingPayment) ? 'none' : '0 4px 20px rgba(79, 70, 229, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting && !isProcessingPayment) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(79, 70, 229, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting && !isProcessingPayment) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.2)';
            }
          }}
        >
          {(isSubmitting || isProcessingPayment) ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              {isProcessingPayment ? 'Processing Payment...' : 'Creating Booking...'}
            </>
          ) : (
            <>
              <Check size={18} />
              {paymentMethod === 'paystack' ? 'Pay with Card' : 'Confirm Booking'}
            </>
          )}
        </button>

        {/* Safety Note */}
        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#94a3b8',
          marginTop: '12px'
        }}>
          {paymentMethod === 'paystack' ? (
            'You will be redirected to Paystack for secure payment'
          ) : (
            'Pay when you arrive at the venue'
          )}
        </p>
      </form>

      {/* Loading overlay for payment processing */}
      {isProcessingPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #4f46e5',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            textShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            Processing your payment...
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px'
          }}>
            Please complete the payment in the popup window
          </p>
          <button
            onClick={() => {
              // Allow user to cancel if popup is stuck
              if (window.confirm('Cancel payment and go back?')) {
                setIsProcessingPayment(false);
              }
            }}
            style={{
              padding: '8px 20px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Cancel Payment
          </button>
        </div>
      )}
    </div>
  );
}

export default GuestBookingForm;