// FILE: client/src/hooks/useBookingLimit.js
// Hook to check if business has reached booking limit

import { useState, useEffect } from 'react';
import API_BASE from '../config';

export function useBookingLimit(businessId, bookings) {
  const [bookingLimit, setBookingLimit] = useState(50);
  const [currentBookings, setCurrentBookings] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [remainingBookings, setRemainingBookings] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    const fetchBusiness = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/api/businesses/profile`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await response.json();
        
        if (data.success && data.business) {
          const limit = data.business.booking_limit || 50;
          const count = data.business.current_booking_count || bookings?.length || 0;
          
          setBookingLimit(limit);
          setCurrentBookings(count);
          setRemainingBookings(Math.max(0, limit - count));
          setIsLimitReached(count >= limit);
        }
      } catch (err) {
        console.error('Error fetching booking limit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId, bookings]);

  return {
    bookingLimit,
    currentBookings,
    remainingBookings,
    isLimitReached,
    loading
  };
}