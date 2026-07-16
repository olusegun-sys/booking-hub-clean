// client/src/components/Admin/VerifyUpgrade.jsx
import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyUpgrade = () => {
  const [pendingUpgrades, setPendingUpgrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingUpgrades();
  }, []);

  const fetchPendingUpgrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/pending-upgrades', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingUpgrades(data.data || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to load pending upgrades');
      }
    } catch (error) {
      console.error('Error fetching pending upgrades:', error);
      toast.error('Failed to load pending upgrades');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingUpgrades();
  };

  const handleVerify = async (subscriptionId) => {
    if (!confirm('Have you verified this payment in the bank statement? Make sure the amount and reference match!')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscriptions/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscriptionId })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Subscription activated successfully!');
        fetchPendingUpgrades(); // Refresh list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to activate subscription');
      }
    } catch (error) {
      console.error('Error verifying upgrade:', error);
      toast.error('Failed to verify upgrade. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading pending upgrades...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-800">Pending Subscription Upgrades</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>
      
      {pendingUpgrades.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <p className="text-green-700 font-semibold">No pending upgrades to verify</p>
          <p className="text-sm text-green-600 mt-1">All caught up! 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUpgrades.map((upgrade) => (
            <div key={upgrade.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-base">
                    {upgrade.business_name || 'Unknown Business'}
                  </h4>
                  <p className="text-sm text-gray-600">{upgrade.business_email || 'No email'}</p>
                  
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Plan:</span>
                      <span className="ml-2 capitalize font-semibold text-indigo-600">
                        {upgrade.plan}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <span className="ml-2 font-semibold text-gray-800">
                        ₦{upgrade.amount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="col-span-full">
                      <span className="text-gray-500">Reference:</span>
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                        {upgrade.payment_reference || 'N/A'}
                      </span>
                    </div>
                    <div className="col-span-full">
                      <span className="text-gray-500">Requested:</span>
                      <span className="ml-2 text-gray-600">
                        {formatDate(upgrade.created_at)}
                      </span>
                    </div>
                    {upgrade.notes && (
                      <div className="col-span-full">
                        <span className="text-gray-500">Notes:</span>
                        <span className="ml-2 text-gray-600 text-sm">
                          {upgrade.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-shrink-0">
                  <button
                    onClick={() => handleVerify(upgrade.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <Check className="w-4 h-4" />
                    Verify & Activate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerifyUpgrade;