// FILE: client/src/pages/UpgradePage.jsx
// Complete upgrade page for Nigerian businesses
// Redirect users here when they hit the booking limit

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Check, Zap, AlertCircle, Copy, CheckCircle,
  Crown, Users, Calendar, DollarSign, Smartphone, Shield,
  Phone, Mail, MessageCircle, CreditCard, Building2, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE from '../config';

const UpgradePage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [step, setStep] = useState('select'); // 'select' | 'payment' | 'success'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load business and subscription data
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Get business profile
        const bizRes = await fetch(`${API_BASE}/api/businesses/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const bizData = await bizRes.json();
        if (bizData.success) {
          setBusiness(bizData.business);
        }

        // Get subscription status
        const targetId = businessId || bizData.business?.id;
        if (targetId) {
          const subRes = await fetch(`${API_BASE}/api/businesses/${targetId}/subscription`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const subData = await subRes.json();
          if (subData.success) {
            setSubscription(subData.data);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load your data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId, navigate]);

  // Pricing configuration
  const pricing = {
    starter: {
      id: 'starter',
      name: 'Starter',
      price: 30000,
      bookings: 100,
      features: [
        '100 bookings per month',
        'Priority email support',
        'Advanced dashboard analytics',
        'Staff management (up to 5)',
        'Email notifications'
      ],
      badge: 'Popular',
      icon: Zap,
      color: '#4f46e5'
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 50000,
      bookings: 'Unlimited',
      features: [
        'Unlimited bookings ♾️',
        'Priority support (email + WhatsApp)',
        'Advanced analytics with charts',
        'Custom branding on booking page',
        'Staff management (unlimited)',
        'SMS notifications',
        'Dedicated account manager'
      ],
      badge: 'Best Value',
      icon: Crown,
      color: '#d97706'
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = () => {
    const plan = pricing[selectedPlan];
    const reference = `UPG-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    setPaymentData({
      plan: selectedPlan,
      planName: plan.name,
      amount: plan.price,
      reference: reference,
      bankName: 'GTBank',
      accountNumber: '0123456789',
      accountName: 'Booking Hub Limited'
    });
    
    setStep('payment');
  };

  const handleCopyReference = () => {
    if (paymentData?.reference) {
      navigator.clipboard.writeText(paymentData.reference);
      setCopied(true);
      toast.success('Reference copied!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const targetId = business?.id || businessId;
      
      const response = await fetch(`${API_BASE}/api/businesses/${targetId}/upgrade-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentReference: paymentData.reference,
          notes: `Upgrade to ${selectedPlan} plan - ${new Date().toLocaleDateString('en-NG')}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create upgrade request');
      }

      const data = await response.json();
      
      setStep('success');
      
      toast.success('Upgrade request submitted! We\'ll verify your payment within 24 hours.');
      
      // Auto-navigate after 8 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 8000);
      
    } catch (error) {
      toast.error(error.message || 'Failed to submit upgrade request');
      console.error('Upgrade error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return React.createElement('div', { 
      className: 'min-h-screen flex items-center justify-center bg-gray-50' 
    },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto' }),
        React.createElement('p', { className: 'mt-4 text-gray-600' }, 'Loading your upgrade options...')
      )
    );
  }

  // ==========================================
  // STEP 1: PLAN SELECTION
  // ==========================================
  const renderSelectStep = () => {
    const currentPlan = subscription?.plan || 'free';
    const used = subscription?.used || 0;
    const limit = subscription?.limit || 50;
    const remaining = limit - used;
    
    return React.createElement('div', null,
      // Header
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, '📈 Upgrade Your Plan'),
        React.createElement('p', { className: 'text-gray-600 mt-2' },
          'You\'ve used ', React.createElement('strong', null, used, ' of ', limit), ' free bookings. ',
          'Upgrade to continue accepting bookings.'
        ),
        React.createElement('div', { className: 'mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 inline-block' },
          React.createElement('p', { className: 'text-sm text-amber-700' },
            '⚡ ', remaining, ' bookings remaining on your free plan'
          )
        )
      ),

      // Plan Cards
      React.createElement('div', { className: 'grid md:grid-cols-2 gap-6' },
        // Starter Plan
        React.createElement('div', { 
          className: `border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedPlan === 'starter' 
              ? 'border-indigo-600 bg-indigo-50 shadow-lg' 
              : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
          }`,
          onClick: () => handleSelectPlan('starter')
        },
          React.createElement('div', { className: 'flex items-start justify-between' },
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-bold text-lg text-gray-800 flex items-center gap-2' },
                'Starter',
                React.createElement('span', { className: 'bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full' },
                  pricing.starter.badge
                )
              ),
              React.createElement('p', { className: 'text-3xl font-bold text-indigo-600 mt-1' },
                '₦', pricing.starter.price.toLocaleString(), 
                React.createElement('span', { className: 'text-sm font-normal text-gray-500' }, ' /month')
              )
            ),
            selectedPlan === 'starter' && 
              React.createElement('div', { className: 'bg-indigo-600 text-white rounded-full p-1' },
                React.createElement(Check, { className: 'w-5 h-5' })
              )
          ),
          React.createElement('ul', { className: 'mt-4 space-y-2' },
            pricing.starter.features.map((feature, index) =>
              React.createElement('li', { key: index, className: 'text-sm text-gray-600 flex items-start gap-2' },
                React.createElement(Check, { className: 'w-4 h-4 text-green-600 flex-shrink-0 mt-0.5' }),
                React.createElement('span', null, feature)
              )
            )
          )
        ),

        // Pro Plan
        React.createElement('div', { 
          className: `border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedPlan === 'pro' 
              ? 'border-indigo-600 bg-indigo-50 shadow-lg' 
              : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
          }`,
          onClick: () => handleSelectPlan('pro')
        },
          React.createElement('div', { className: 'flex items-start justify-between' },
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-bold text-lg text-gray-800 flex items-center gap-2' },
                'Pro',
                React.createElement('span', { className: 'bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full' },
                  pricing.pro.badge
                )
              ),
              React.createElement('p', { className: 'text-3xl font-bold text-indigo-600 mt-1' },
                '₦', pricing.pro.price.toLocaleString(),
                React.createElement('span', { className: 'text-sm font-normal text-gray-500' }, ' /month')
              )
            ),
            selectedPlan === 'pro' && 
              React.createElement('div', { className: 'bg-indigo-600 text-white rounded-full p-1' },
                React.createElement(Check, { className: 'w-5 h-5' })
              )
          ),
          React.createElement('ul', { className: 'mt-4 space-y-2' },
            pricing.pro.features.map((feature, index) =>
              React.createElement('li', { key: index, className: 'text-sm text-gray-600 flex items-start gap-2' },
                React.createElement(Check, { className: 'w-4 h-4 text-green-600 flex-shrink-0 mt-0.5' }),
                React.createElement('span', null, feature)
              )
            )
          )
        )
      ),

      // Need Help Section
      React.createElement('div', { className: 'mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center' },
        React.createElement('p', { className: 'text-sm text-blue-700' },
          '💬 Need help choosing a plan? ',
          React.createElement('a', { 
            href: 'mailto:support@bookinghub.com', 
            className: 'font-semibold text-blue-600 hover:underline ml-1'
          }, 'support@bookinghub.com')
        )
      ),

      React.createElement('button', {
        onClick: handleProceedToPayment,
        className: 'w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2'
      },
        React.createElement(Zap, { className: 'w-5 h-5' }),
        'Proceed to Payment'
      )
    );
  };

  // ==========================================
  // STEP 2: PAYMENT INSTRUCTIONS
  // ==========================================
  const renderPaymentStep = () => (
    React.createElement('div', null,
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, '💰 Complete Your Payment'),
        React.createElement('p', { className: 'text-gray-600 mt-2' },
          'Transfer the exact amount to our bank account'
        )
      ),

      // Bank Details - Prominent Display
      React.createElement('div', { className: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mb-6' },
        React.createElement('p', { className: 'text-sm font-semibold text-indigo-700 mb-4 flex items-center gap-2' },
          React.createElement(Building2, { className: 'w-4 h-4' }),
          'Payment Details'
        ),
        React.createElement('div', { className: 'space-y-3 text-sm' },
          React.createElement('div', { className: 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-lg p-3' },
            React.createElement('span', { className: 'text-gray-600 font-medium' }, 'Amount:'),
            React.createElement('span', { className: 'font-bold text-gray-800 text-lg' },
              '₦', paymentData?.amount.toLocaleString()
            )
          ),
          React.createElement('div', { className: 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-lg p-3' },
            React.createElement('span', { className: 'text-gray-600 font-medium' }, 'Plan:'),
            React.createElement('span', { className: 'font-semibold text-gray-800 capitalize' }, paymentData?.planName)
          ),
          React.createElement('div', { className: 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-lg p-3' },
            React.createElement('span', { className: 'text-gray-600 font-medium' }, 'Bank:'),
            React.createElement('span', { className: 'font-semibold text-gray-800' }, paymentData?.bankName)
          ),
          React.createElement('div', { className: 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-lg p-3 border-2 border-yellow-200' },
            React.createElement('span', { className: 'text-gray-600 font-medium' }, 'Account Number:'),
            React.createElement('span', { className: 'font-bold text-gray-800 text-lg font-mono' }, paymentData?.accountNumber)
          ),
          React.createElement('div', { className: 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-lg p-3' },
            React.createElement('span', { className: 'text-gray-600 font-medium' }, 'Account Name:'),
            React.createElement('span', { className: 'font-semibold text-gray-800' }, paymentData?.accountName)
          ),
          React.createElement('div', { className: 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-yellow-50 rounded-lg p-3 border-2 border-yellow-300' },
            React.createElement('span', { className: 'text-gray-600 font-medium' }, 'Reference:'),
            React.createElement('span', { className: 'font-mono text-xs bg-white px-2 py-1 rounded flex items-center gap-2 flex-wrap' },
              React.createElement('span', { className: 'font-bold text-gray-800' }, paymentData?.reference),
              React.createElement('button', {
                onClick: handleCopyReference,
                className: 'text-indigo-600 hover:text-indigo-800 p-1'
              },
                copied 
                  ? React.createElement(CheckCircle, { className: 'w-4 h-4 text-green-600' })
                  : React.createElement(Copy, { className: 'w-4 h-4' })
              )
            )
          )
        )
      ),

      // Important Instructions
      React.createElement('div', { className: 'bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6' },
        React.createElement('p', { className: 'text-sm text-yellow-800 flex items-start gap-2' },
          React.createElement(AlertCircle, { className: 'w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600' }),
          React.createElement('span', null,
            React.createElement('strong', null, 'Important:'), 
            ' Use the reference as narration when making the transfer. ',
            'This helps us identify your payment quickly.',
            React.createElement('span', { className: 'block mt-1 text-xs text-yellow-700' },
              '⏰ Verification takes up to 24 hours. You\'ll receive a confirmation email.'
            )
          )
        )
      ),

      // Support Options
      React.createElement('div', { className: 'grid grid-cols-2 gap-3 mb-6' },
        React.createElement('a', {
          href: 'https://wa.me/2348000000000',
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'bg-green-50 border border-green-200 rounded-lg p-3 text-center hover:bg-green-100 transition-colors'
        },
          React.createElement(MessageCircle, { className: 'w-6 h-6 text-green-600 mx-auto' }),
          React.createElement('span', { className: 'text-xs font-medium text-green-700 mt-1 block' }, 'WhatsApp Support')
        ),
        React.createElement('a', {
          href: 'mailto:support@bookinghub.com',
          className: 'bg-blue-50 border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors'
        },
          React.createElement(Mail, { className: 'w-6 h-6 text-blue-600 mx-auto' }),
          React.createElement('span', { className: 'text-xs font-medium text-blue-700 mt-1 block' }, 'Email Support')
        )
      ),

      React.createElement('div', { className: 'space-y-3' },
        React.createElement('button', {
          onClick: handleConfirmPayment,
          disabled: isProcessing,
          className: 'w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50'
        },
          isProcessing ? (
            React.createElement(React.Fragment, null,
              React.createElement('div', { className: 'animate-spin rounded-full h-5 w-5 border-b-2 border-white' }),
              'Processing...'
            )
          ) : (
            React.createElement(React.Fragment, null,
              React.createElement(Check, { className: 'w-5 h-5' }),
              'I\'ve Made the Transfer'
            )
          )
        ),
        React.createElement('button', {
          onClick: () => setStep('select'),
          className: 'w-full text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2'
        },
          React.createElement(ArrowLeft, { className: 'w-4 h-4' }),
          'Back to Plans'
        )
      )
    )
  );

  // ==========================================
  // STEP 3: SUCCESS
  // ==========================================
  const renderSuccessStep = () => (
    React.createElement('div', { className: 'text-center py-8' },
      React.createElement('div', { className: 'w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6' },
        React.createElement(Check, { className: 'w-12 h-12 text-green-600' })
      ),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, '✅ Upgrade Request Submitted!'),
      React.createElement('p', { className: 'text-gray-600 mt-3 max-w-md mx-auto' },
        'We\'ve received your upgrade request to the ',
        React.createElement('strong', { className: 'capitalize' }, selectedPlan),
        ' plan.'
      ),
      
      React.createElement('div', { className: 'bg-blue-50 rounded-xl p-6 mt-6 text-left max-w-md mx-auto' },
        React.createElement('p', { className: 'text-sm text-blue-700 font-semibold' }, '📋 Next Steps:'),
        React.createElement('ol', { className: 'text-sm text-blue-700 mt-3 space-y-2 list-decimal list-inside' },
          React.createElement('li', null,
            'Transfer ', React.createElement('strong', null, '₦', paymentData?.amount.toLocaleString()), ' to our account'
          ),
          React.createElement('li', null,
            'Use reference: ', React.createElement('strong', { className: 'font-mono text-xs break-all' }, paymentData?.reference)
          ),
          React.createElement('li', null,
            'We\'ll verify and activate within ', React.createElement('strong', null, '24 hours')
          ),
          React.createElement('li', null,
            'You\'ll receive a confirmation email'
          )
        )
      ),

      React.createElement('div', { className: 'bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6 max-w-md mx-auto' },
        React.createElement('p', { className: 'text-sm text-amber-700 flex items-center gap-2' },
          React.createElement(Smartphone, { className: 'w-4 h-4' }),
          React.createElement('span', null,
            'Need help? Contact us on WhatsApp: ', React.createElement('strong', null, '+234 800 000 0000')
          )
        )
      ),

      React.createElement('div', { className: 'mt-8 space-y-3 max-w-md mx-auto' },
        React.createElement(Link, {
          to: '/dashboard',
          className: 'block w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold'
        },
          'Go to Dashboard'
        ),
        React.createElement('p', { className: 'text-xs text-gray-400' },
          'This page will redirect automatically in a few seconds...'
        )
      )
    )
  );

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4' },
    React.createElement('div', { className: 'max-w-4xl mx-auto' },
      // Back Button
      React.createElement(Link, {
        to: '/dashboard',
        className: 'inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6'
      },
        React.createElement(ArrowLeft, { className: 'w-4 h-4' }),
        'Back to Dashboard'
      ),

      // Main Card
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6 md:p-8' },
        step === 'select' && renderSelectStep(),
        step === 'payment' && renderPaymentStep(),
        step === 'success' && renderSuccessStep()
      ),

      // Footer
      React.createElement('div', { className: 'text-center mt-8' },
        React.createElement('p', { className: 'text-xs text-gray-400' },
          'Booking Hub Limited • RC 1234567 • Lagos, Nigeria'
        ),
        React.createElement('p', { className: 'text-xs text-gray-400 mt-1' },
          'Need help? Email ',
          React.createElement('a', { 
            href: 'mailto:support@bookinghub.com', 
            className: 'text-indigo-600 hover:underline' 
          }, 'support@bookinghub.com')
        )
      )
    )
  );
};

export default UpgradePage;