import { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, XCircle, Building2 } from 'lucide-react';

function PaystackPayment({ bookingReference, amount, email, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);

  // Dynamic API base - works on desktop and mobile
  var API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'http://' + window.location.hostname + ':5000';

  // Load Paystack script dynamically when showPaystack becomes true
  useEffect(() => {
    if (showPaystack) {
      // Check if already loaded
      if (window.PaystackPop) {
        setPaystackLoaded(true);
        return;
      }
      
      // Check if script already exists
      let existingScript = document.querySelector('script[src*="paystack"]');
      if (existingScript) {
        if (window.PaystackPop) {
          setPaystackLoaded(true);
        } else {
          existingScript.onload = () => setPaystackLoaded(true);
        }
        return;
      }
      
      // Load new script
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        setTimeout(() => setPaystackLoaded(true), 100);
      };
      script.onerror = () => {
        setError('Failed to load payment gateway. Please use "Pay at Venue".');
        setShowPaystack(false);
      };
      document.body.appendChild(script);
    }
  }, [showPaystack]);

  const formatPrice = (priceInKobo) => {
    const priceInNaira = priceInKobo / 100;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(priceInNaira);
  };

  const handlePayAtVenue = () => {
    if (onClose) onClose();
  };

  const handlePayNow = async () => {
    if (!window.PaystackPop) {
      setError('Payment gateway not ready. Please use "Pay at Venue".');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const initResponse = await fetch(API_BASE + '/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference,
          email,
          amount: amount
        })
      });

      const initData = await initResponse.json();

      if (!initData.success) {
        if (initData.error && (initData.error.includes('Duplicate') || initData.error.includes('already'))) {
          setError('A payment for this booking has already been initiated. Please use "Pay at Venue".');
        } else {
          setError(initData.error || 'Could not start payment. Please use "Pay at Venue".');
        }
        setLoading(false);
        return;
      }

      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) {
        setError('Payment configuration error. Please use "Pay at Venue".');
        setLoading(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: amount,
        ref: initData.reference,
        currency: 'NGN',
        metadata: {
          custom_fields: [
            {
              display_name: "Booking Reference",
              variable_name: "booking_reference",
              value: bookingReference
            }
          ]
        },
        onClose: function () {
          setLoading(false);
        },
        callback: function (response) {
          verifyPaymentOnBackend(response.reference);
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error('Paystack error:', err);
      setError('Something went wrong. Please use "Pay at Venue".');
      setLoading(false);
    }
  };

  const verifyPaymentOnBackend = async (reference) => {
    try {
      const verifyResponse = await fetch(API_BASE + '/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          bookingReference
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        setPaymentStatus('success');
        setLoading(false);
      } else {
        setPaymentStatus('failed');
        setError(verifyData.message || 'Payment could not be verified.');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (onSuccess) onSuccess();
  };

  // Success state
  if (paymentStatus === 'success') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        borderRadius: '16px',
        padding: '28px',
        textAlign: 'center',
        border: '1px solid #6ee7b7'
      }}>
        <CheckCircle size={48} strokeWidth={2} color="#065f46" style={{ marginBottom: '12px' }} />
        <h3 style={{ color: '#065f46', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
          Payment Successful
        </h3>
        <p style={{ color: '#065f46', fontSize: '15px', marginBottom: '4px' }}>
          {formatPrice(amount)} paid successfully
        </p>
        <p style={{ color: '#047857', fontSize: '13px', marginBottom: '20px' }}>
          Reference: {bookingReference}
        </p>
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          style={{ 
            padding: '12px 32px', 
            fontSize: '15px', 
            fontWeight: '600',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '40px',
            cursor: 'pointer'
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Failed state
  if (paymentStatus === 'failed') {
    return (
      <div style={{
        background: '#fef2f2',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        border: '1px solid #fecaca'
      }}>
        <XCircle size={40} strokeWidth={2} color="#991b1b" style={{ marginBottom: '12px' }} />
        <h3 style={{ color: '#991b1b', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
          Payment Failed
        </h3>
        <p style={{ color: '#7f1d1d', fontSize: '14px', marginBottom: '16px' }}>
          {error || 'Your payment could not be processed.'}
        </p>
        <button
          onClick={() => {
            setPaymentStatus('idle');
            setShowPaystack(false);
            setError('');
          }}
          style={{ 
            padding: '12px 24px', 
            fontSize: '14px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '40px',
            cursor: 'pointer'
          }}
        >
          Try Pay at Venue
        </button>
      </div>
    );
  }

  // Default view - Pay at Venue as primary
  if (!showPaystack) {
    return (
      <div style={{ textAlign: 'center' }}>
        {error && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            background: '#fef2f2', 
            color: '#991b1b', 
            borderRadius: '12px', 
            fontSize: '14px' 
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={handlePayAtVenue} 
            style={{ 
              padding: '18px 32px', 
              fontSize: '16px', 
              width: '100%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '40px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.01)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(16,185,129,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Building2 size={20} />
            Pay at Venue
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>or pay online</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          </div>
          
          <button 
            onClick={() => setShowPaystack(true)}
            style={{ 
              padding: '14px 32px', 
              fontSize: '15px', 
              width: '100%',
              background: 'white',
              border: '1.5px solid #e2e8f0',
              borderRadius: '40px',
              color: '#475569',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <CreditCard size={18} />
            Pay with Card
          </button>
          
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
            No payment required now — pay when you arrive
          </p>
        </div>

        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '16px' }}>
          Secured by Paystack — Test mode — no real charges
        </p>
      </div>
    );
  }

  // Paystack View - Secondary Option
  return (
    <div>
      <button 
        onClick={() => {
          setShowPaystack(false);
          setError('');
        }}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#4f46e5', 
          cursor: 'pointer', 
          fontSize: '13px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        ← Back to Pay at Venue
      </button>
      
      {!paystackLoaded ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>Loading payment gateway...</p>
        </div>
      ) : (
        <button 
          onClick={handlePayNow} 
          disabled={loading} 
          style={{ 
            padding: '16px 32px', 
            fontSize: '16px', 
            width: '100%',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            border: 'none',
            borderRadius: '40px',
            color: 'white',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'scale(1.01)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <CreditCard size={18} />
          {loading ? 'Processing...' : `Pay ${formatPrice(amount)} Now`}
        </button>
      )}
      
      {error && (
        <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '12px' }}>{error}</p>
      )}

      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '16px' }}>
        Secured by Paystack — Test mode — no real charges
      </p>
    </div>
  );
}

export default PaystackPayment;