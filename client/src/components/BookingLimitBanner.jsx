// client/src/components/BookingLimitBanner.jsx
import React from 'react';
import { AlertCircle, TrendingUp, Zap, Lock, Unlock, ChevronRight } from 'lucide-react';

const BookingLimitBanner = ({ subscription, onUpgrade, isMobile = false }) => {
  if (!subscription) return null;

  // Pro plan - unlimited
  if (subscription.plan === 'pro') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
            <Unlock className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-green-800 text-sm sm:text-base">
              💪 Pro Plan - Unlimited Bookings
            </h4>
            <p className="text-sm text-green-700 mt-1">
              You've had <strong>{subscription.used}</strong> bookings this month. No limits!
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-green-600">
              <span>✓ Priority support</span>
              <span>•</span>
              <span>✓ Advanced analytics</span>
              <span>•</span>
              <span>✓ Unlimited capacity</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Critical: 90%+ usage
  if (subscription.percentage >= 90) {
    const remaining = subscription.limit - subscription.used;
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 rounded-lg p-4 mb-4 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-red-700 text-base sm:text-lg">
              🚨 CRITICAL: Booking Limit Reached!
            </h4>
            <p className="text-sm text-red-700 mt-1">
              You've used <strong>{subscription.used} of {subscription.limit}</strong> bookings this month.
            </p>
            <div className="mt-2 bg-red-200 rounded-full h-2 w-full max-w-md">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${subscription.percentage}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-red-700 mt-2">
              ⚠️ You {remaining > 0 ? `only have ${remaining} booking${remaining > 1 ? 's' : ''} left` : 'can no longer accept new bookings'}!
            </p>
            <button
              onClick={onUpgrade}
              className="mt-3 bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isMobile ? 'Upgrade Now' : 'Upgrade Now to Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Warning: 70-89% usage
  if (subscription.percentage >= 70) {
    const remaining = subscription.limit - subscription.used;
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-400 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-yellow-800 text-sm sm:text-base">
              ⚠️ Booking Limit Warning
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              You've used <strong>{subscription.used} of {subscription.limit}</strong> bookings this month.
            </p>
            <div className="mt-2 bg-yellow-200 rounded-full h-2 w-full max-w-md">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${subscription.percentage}%` }}
              />
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              🔔 Only <strong>{remaining}</strong> booking{remaining > 1 ? 's' : ''} remaining this month!
            </p>
            <button
              onClick={onUpgrade}
              className="mt-3 bg-yellow-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold text-sm flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isMobile ? 'Upgrade' : 'Upgrade to Avoid Interruption'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal state - show usage
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0">
          <Lock className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-indigo-800 text-sm sm:text-base">
            📊 {subscription.plan === 'free' ? 'Free' : 'Starter'} Plan - {subscription.used} of {subscription.limit} Bookings Used
          </h4>
          <div className="mt-2 bg-indigo-200 rounded-full h-2 w-full max-w-md">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${subscription.percentage}%` }}
            />
          </div>
          <p className="text-sm text-indigo-700 mt-2">
            {subscription.remaining} bookings remaining this month
          </p>
          <button
            onClick={onUpgrade}
            className="mt-3 bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {isMobile ? 'Upgrade' : 'Upgrade for More Bookings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingLimitBanner;