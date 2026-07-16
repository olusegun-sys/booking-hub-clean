// client/src/components/UpgradeModal.jsx
// =============================================
// UPGRADE MODAL
// Handles plan selection and bank transfer payment
// =============================================

import React, { useState } from 'react';
import { X, Check, Zap, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const UpgradeModal = ({ isOpen, onClose, onUpgrade, currentPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [step, setStep] = useState('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // Don't render if modal is closed
  if (!isOpen) return null;

  // Pricing configuration
  const pricing = {
    starter: {
      name: 'Starter',
      price: 30000,
      bookings: 100,
      features: ['100 bookings/month', 'Priority support', 'Advanced dashboard'],
      badge: 'Popular'
    },
    pro: {
      name: 'Pro',
      price: 50000,
      bookings: 'Unlimited',
      features: ['Unlimited bookings ♾️', 'Priority support', 'Advanced analytics', 'Custom branding', 'Dedicated manager'],
      badge: 'Best Value'
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = () => {
    const plan = pricing[selectedPlan];
    const reference = `BIZ-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    setPaymentData({
      plan: selectedPlan,
      amount: plan.price,
      reference: reference,
      bankName: 'GTBank',
      accountNumber: '0123456789',
      accountName: 'Booking Hub Limited'
    });
    
    setStep('payment');
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentDetails: {
            reference: paymentData.reference,
            notes: `Upgrade to ${selectedPlan} plan requested`
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create upgrade request');
      }

      const data = await response.json();
      
      setStep('success');
      
      if (onUpgrade) {
        onUpgrade(selectedPlan);
      }
      
      toast.success('Upgrade request submitted! We\'ll verify your payment within 24 hours.');
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        onClose();
        setStep('select');
        setSelectedPlan('starter');
        setPaymentData(null);
      }, 5000);
      
    } catch (error) {
      toast.error(error.message || 'Failed to submit upgrade request');
      console.error('Upgrade error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // STEP 1: PLAN SELECTION
  // ==========================================
  const renderSelectStep = () => (
    <>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">📈 Upgrade Your Plan</h3>
        <p className="text-sm text-gray-600 mt-1">
          Choose the plan that fits your business needs
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Current plan: <span className="font-semibold capitalize">{currentPlan || 'Free'}</span>
        </p>
      </div>

      <div className="space-y-4">
        {/* Starter Plan */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedPlan === 'starter' 
              ? 'border-indigo-600 bg-indigo-50' 
              : 'border-gray-200 hover:border-indigo-300'
          }`}
          onClick={() => handleSelectPlan('starter')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                Starter Plan
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Popular
                </span>
              </h4>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                ₦30,000 <span className="text-sm font-normal text-gray-500">/month</span>
              </p>
              <ul className="mt-2 space-y-1">
                {pricing.starter.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            {selectedPlan === 'starter' && (
              <div className="bg-indigo-600 text-white rounded-full p-1 flex-shrink-0 ml-2">
                <Check className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {/* Pro Plan */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedPlan === 'pro' 
              ? 'border-indigo-600 bg-indigo-50' 
              : 'border-gray-200 hover:border-indigo-300'
          }`}
          onClick={() => handleSelectPlan('pro')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                Pro Plan
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  Best Value
                </span>
              </h4>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                ₦50,000 <span className="text-sm font-normal text-gray-500">/month</span>
              </p>
              <ul className="mt-2 space-y-1">
                {pricing.pro.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            {selectedPlan === 'pro' && (
              <div className="bg-indigo-600 text-white rounded-full p-1 flex-shrink-0 ml-2">
                <Check className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleProceedToPayment}
        className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
      >
        <Zap className="w-5 h-5" />
        Proceed to Payment
      </button>
    </>
  );

  // ==========================================
  // STEP 2: PAYMENT INSTRUCTIONS
  // ==========================================
  const renderPaymentStep = () => (
    <>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">💰 Complete Your Payment</h3>
        <p className="text-sm text-gray-600 mt-1">
          Transfer the exact amount to our bank account
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-700 font-semibold mb-2">Payment Details:</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-gray-800">₦{paymentData?.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-semibold text-gray-800 capitalize">{paymentData?.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bank:</span>
            <span className="font-semibold text-gray-800">{paymentData?.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Number:</span>
            <span className="font-semibold text-gray-800">{paymentData?.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Name:</span>
            <span className="font-semibold text-gray-800">{paymentData?.accountName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reference:</span>
            <span className="font-semibold text-gray-800 text-xs break-all">{paymentData?.reference}</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p className="text-xs text-yellow-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Important:</strong> Use the reference as narration when making the transfer. 
            This helps us identify your payment quickly.
          </span>
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : '✅ I\'ve Made the Transfer'}
        </button>
        
        <button
          onClick={() => setStep('select')}
          className="w-full text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>
      </div>
    </>
  );

  // ==========================================
  // STEP 3: SUCCESS
  // ==========================================
  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-800">✅ Upgrade Request Submitted!</h3>
      <p className="text-gray-600 mt-2">
        We've received your upgrade request to the <strong className="capitalize">{selectedPlan}</strong> plan.
      </p>
      <div className="bg-blue-50 rounded-lg p-4 mt-4 text-left">
        <p className="text-sm text-blue-700 font-semibold">Next Steps:</p>
        <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
          <li>Transfer exactly <strong>₦{paymentData?.amount.toLocaleString()}</strong> to our account</li>
          <li>Use reference: <strong className="break-all">{paymentData?.reference}</strong></li>
          <li>We'll verify and activate within <strong>24 hours</strong></li>
          <li>You'll receive a confirmation email</li>
        </ol>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        This window will close automatically in a few seconds...
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          {step === 'select' && renderSelectStep()}
          {step === 'payment' && renderPaymentStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;