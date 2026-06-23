import React, { useState, useEffect } from 'react';
import { 
  Hotel, Calendar, Users, Bed, Check, ArrowLeft, CreditCard, 
  MapPin, Clock, Loader2, Wifi, Tv, Coffee, Dumbbell, 
  Car, Snowflake, Sparkles, X, Mail, Phone, User, Wallet,
  CheckCircle2, Star, Award, Shield, Coffee as CoffeeIcon, 
  Utensils, Dumbbell as GymIcon, Wifi as WifiIcon
} from 'lucide-react';
import API_BASE from './config';
import { showError, showSuccess } from './toast';
import BookingConfirmation from './BookingConfirmation';

/**
 * HotelBooking - Premium Mobile-First Booking Component
 * Inspired by top-tier booking app design patterns
 */
function HotelBooking({ business, checkIn, checkOut, guests, onBack }) {
  // State management
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [bookingReference, setBookingReference] = useState('');
  const [amount, setAmount] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  
  // Form state for modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('pay_at_venue');
  const [formErrors, setFormErrors] = useState({});

  // Get auth token from localStorage
  const token = localStorage.getItem('auth_token');

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  // Fetch available rooms for this business
  useEffect(() => {
    const fetchRooms = async () => {
      if (!business || !business.id) {
        showError('Business not found. Please go back and try again.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/businesses/${business.id}/rooms`);
        const data = await response.json();
        
        if (data.success) {
          setRooms(data.rooms || []);
        } else {
          showError('Failed to load rooms. Please try again.');
        }
      } catch (err) {
        console.error('Fetch rooms error:', err);
        showError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [business]);

  // Handle room selection
  const handleSelectRoom = (room) => {
    if (selectedRoom && selectedRoom.id === room.id) {
      setSelectedRoom(null);
      setAmount(0);
    } else {
      setSelectedRoom(room);
      const nights = calculateNights();
      const total = room.price_per_night * nights;
      setAmount(total);
    }
  };

  // Open booking modal
  const handleOpenBookingModal = () => {
    if (!selectedRoom) {
      showError('Please select a room first');
      return;
    }
    setShowBookingModal(true);
  };

  // Close booking modal
  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setFormErrors({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[\d\s+()-]{10,15}$/.test(formData.phone)) errors.phone = 'Please enter a valid phone number';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle booking submission
  const handleSubmitBooking = async () => {
    if (!validateForm()) return;
    if (!selectedRoom) {
      showError('Please select a room first');
      return;
    }

    setIsBooking(true);
    
    try {
      const nights = calculateNights();
      const totalAmount = selectedRoom.price_per_night * nights;

      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          businessId: business.id,
          roomId: selectedRoom.id,
          checkIn: checkIn,
          checkOut: checkOut,
          guests: guests,
          totalAmount: totalAmount,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          specialRequests: formData.specialRequests,
          paymentMethod: paymentMethod,
          bookingDetails: {
            roomName: selectedRoom.name,
            hotelName: business.name,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests,
            nights: nights,
            pricePerNight: selectedRoom.price_per_night,
            total: totalAmount,
            roomType: selectedRoom.type || 'Standard'
          }
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Server returned an invalid response');
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      if (data.success) {
        setBookingReference(data.booking?.booking_reference || `BK-${Date.now()}`);
        setBookingData({
          roomName: selectedRoom.name,
          hotelName: business.name,
          checkIn: checkIn,
          checkOut: checkOut,
          guests: guests,
          nights: nights,
          pricePerNight: selectedRoom.price_per_night,
          total: totalAmount,
          roomType: selectedRoom.type || 'Standard',
          amenities: selectedRoom.amenities || [],
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          paymentMethod: paymentMethod === 'pay_at_venue' ? 'Pay at Venue' : 'Paystack'
        });
        
        setShowConfirmation(true);
        setShowBookingModal(false);
        showSuccess('Booking confirmed! Check your email for details.');
      } else {
        showError(data.error || 'Failed to create booking. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      showError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // Format price in Naira
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN', 
      minimumFractionDigits: 0 
    }).format(price || 0);
  };

  // Get nights text
  const getNightsText = () => {
    const nights = calculateNights();
    return `${nights} night${nights > 1 ? 's' : ''}`;
  };

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return WifiIcon;
    if (amenityLower.includes('tv') || amenityLower.includes('television')) return Tv;
    if (amenityLower.includes('coffee') || amenityLower.includes('tea')) return CoffeeIcon;
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return GymIcon;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return Car;
    if (amenityLower.includes('ac') || amenityLower.includes('air')) return Snowflake;
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return Utensils;
    if (amenityLower.includes('security') || amenityLower.includes('safe')) return Shield;
    return Sparkles;
  };

  // If booking is confirmed, show confirmation
  if (showConfirmation && bookingData) {
    const details = [
      { label: 'Hotel', value: bookingData.hotelName },
      { label: 'Room', value: bookingData.roomName },
      { label: 'Room Type', value: bookingData.roomType },
      { label: 'Check-in', value: new Date(bookingData.checkIn).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
      { label: 'Check-out', value: new Date(bookingData.checkOut).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
      { label: 'Guests', value: `${bookingData.guests} guest${bookingData.guests > 1 ? 's' : ''}` },
      { label: 'Nights', value: bookingData.nights },
      { label: 'Price per night', value: formatPrice(bookingData.pricePerNight) },
      { label: 'Payment Method', value: bookingData.paymentMethod },
      { label: 'Total', value: formatPrice(bookingData.total) }
    ];

    return React.createElement(BookingConfirmation, {
      bookingReference: bookingReference,
      amount: bookingData.total,
      email: bookingData.customerEmail || '',
      details: details,
      onBack: () => {
        setShowConfirmation(false);
        setSelectedRoom(null);
      }
    });
  }

  // Loading state
  if (loading) {
    return React.createElement('div', { 
      style: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '20px'
      }
    },
      React.createElement(Loader2, { 
        size: 40, 
        style: { 
          animation: 'spin 1s linear infinite',
          color: '#4F46E5'
        } 
      }),
      React.createElement('p', { 
        style: { 
          color: '#94a3b8', 
          fontSize: '14px',
          fontWeight: '500'
        } 
      }, 'Finding available rooms...')
    );
  }

  // ========== PREMIUM MOBILE-FIRST STYLES ==========
  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '16px 16px 100px',
      background: '#f5f7fa',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    title: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      letterSpacing: '-0.3px'
    },
    subtitle: {
      fontSize: '13px',
      color: '#94a3b8',
      marginTop: '2px',
      fontWeight: '400'
    },
    backButton: {
      padding: '10px 16px',
      backgroundColor: 'white',
      color: '#475569',
      border: 'none',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    },
    bookingSummary: {
      background: 'white',
      borderRadius: '16px',
      padding: '16px 20px',
      marginBottom: '24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '12px'
    },
    summaryItem: {
      fontSize: '10px',
      color: '#94a3b8',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    summaryValue: {
      fontWeight: '700',
      color: '#0f172a',
      display: 'block',
      marginTop: '4px',
      fontSize: '14px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    roomsGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '24px'
    },
    roomCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      position: 'relative',
      border: '2px solid transparent'
    },
    roomCardSelected: {
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(79,70,229,0.12)',
      position: 'relative',
      border: '2px solid #4F46E5'
    },
    roomCardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #4F46E5, #7c3aed)',
      borderRadius: '16px 16px 0 0'
    },
    selectedBadge: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: '#4F46E5',
      color: 'white',
      padding: '3px 12px',
      borderRadius: '20px',
      fontSize: '10px',
      fontWeight: '600',
      letterSpacing: '0.3px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    roomHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8px',
      gap: '8px'
    },
    roomName: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.2px'
    },
    roomType: {
      fontSize: '10px',
      color: '#64748b',
      backgroundColor: '#f1f5f9',
      padding: '3px 12px',
      borderRadius: '20px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    },
    roomPrice: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#4F46E5',
      marginBottom: '6px',
      letterSpacing: '-0.3px'
    },
    pricePer: {
      fontSize: '12px',
      fontWeight: '400',
      color: '#94a3b8'
    },
    roomDetails: {
      display: 'flex',
      gap: '14px',
      marginBottom: '10px',
      flexWrap: 'wrap'
    },
    detailBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '500'
    },
    roomDescription: {
      fontSize: '13px',
      color: '#64748b',
      lineHeight: '1.5',
      marginBottom: '12px'
    },
    amenitiesList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: '16px'
    },
    amenityTag: {
      backgroundColor: '#f8fafc',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '500',
      color: '#475569',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      border: '1px solid #f1f5f9'
    },
    bookButton: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '4px',
      boxShadow: '0 4px 20px rgba(79,70,229,0.2)'
    },
    bookButtonDisabled: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#e2e8f0',
      color: '#94a3b8',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'not-allowed',
      marginTop: '4px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
    },
    emptyIcon: {
      opacity: 0.4,
      marginBottom: '12px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15,23,42,0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
      animation: 'fadeIn 0.3s ease'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '24px 24px 0 0',
      maxWidth: '560px',
      width: '100%',
      maxHeight: '85vh',
      overflowY: 'auto',
      boxShadow: '0 -20px 60px rgba(0,0,0,0.1)',
      animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'white',
      borderRadius: '24px 24px 0 0'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.2px'
    },
    modalClose: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8',
      padding: '8px',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalBody: {
      padding: '24px'
    },
    modalSummary: {
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px'
    },
    modalSummaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      fontSize: '13px'
    },
    modalSummaryLabel: {
      color: '#94a3b8',
      fontWeight: '500'
    },
    modalSummaryValue: {
      fontWeight: '600',
      color: '#0f172a'
    },
    formGroup: {
      marginBottom: '16px'
    },
    formLabel: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '4px',
      letterSpacing: '0.2px'
    },
    formInput: {
      width: '100%',
      padding: '12px 14px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      background: 'white'
    },
    formInputError: {
      width: '100%',
      padding: '12px 14px',
      border: '2px solid #ef4444',
      borderRadius: '12px',
      fontSize: '14px',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      background: 'white'
    },
    formError: {
      color: '#ef4444',
      fontSize: '11px',
      marginTop: '4px',
      display: 'block'
    },
    paymentOptions: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '8px'
    },
    paymentOption: {
      padding: '14px 12px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      background: 'white'
    },
    paymentOptionSelected: {
      padding: '14px 12px',
      border: '2px solid #4F46E5',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      background: '#EEF2FF'
    },
    paymentOptionPrimary: {
      padding: '16px 12px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      background: 'white',
      position: 'relative'
    },
    paymentOptionPrimarySelected: {
      padding: '16px 12px',
      border: '2px solid #4F46E5',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      background: '#EEF2FF',
      boxShadow: '0 0 0 3px rgba(79,70,229,0.08)',
      position: 'relative'
    },
    paymentOptionIcon: {
      display: 'block',
      margin: '0 auto 6px'
    },
    paymentOptionLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#0f172a',
      display: 'block'
    },
    paymentOptionDesc: {
      fontSize: '10px',
      color: '#94a3b8',
      display: 'block',
      marginTop: '2px'
    },
    submitButton: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
      boxShadow: '0 4px 20px rgba(79,70,229,0.2)'
    },
    submitButtonDisabled: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#94a3b8',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'not-allowed',
      marginTop: '8px'
    },
    recommendedBadge: {
      marginTop: '8px',
      padding: '3px 12px',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
      borderRadius: '20px',
      display: 'inline-block',
      fontSize: '9px',
      fontWeight: '700',
      color: '#4F46E5',
      letterSpacing: '0.3px'
    }
  };

  // ========== RENDER ==========
  return React.createElement('div', { style: styles.container },
    // Header
    React.createElement('div', { style: styles.header },
      React.createElement('div', { style: styles.headerLeft },
        React.createElement('button', { 
          onClick: onBack, 
          style: styles.backButton,
          onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.color = '#4F46E5';
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#475569';
          }
        },
          React.createElement(ArrowLeft, { size: 16 }),
          ' Back'
        ),
        React.createElement('div', null,
          React.createElement('div', { style: styles.title },
            React.createElement(Hotel, { size: 20, color: '#4F46E5' }),
            React.createElement('span', null, business?.name || 'Hotel')
          ),
          React.createElement('div', { style: styles.subtitle }, 'Select your room')
        )
      )
    ),

    // Booking Summary
    React.createElement('div', { style: styles.bookingSummary },
      React.createElement('div', { style: styles.summaryItem },
        'Check-in',
        React.createElement('span', { style: styles.summaryValue }, 
          checkIn ? new Date(checkIn).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : 'Not set'
        )
      ),
      React.createElement('div', { style: styles.summaryItem },
        'Check-out',
        React.createElement('span', { style: styles.summaryValue }, 
          checkOut ? new Date(checkOut).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : 'Not set'
        )
      ),
      React.createElement('div', { style: styles.summaryItem },
        'Guests',
        React.createElement('span', { style: styles.summaryValue }, `${guests} guest${guests > 1 ? 's' : ''}`)
      ),
      React.createElement('div', { style: styles.summaryItem },
        'Nights',
        React.createElement('span', { style: styles.summaryValue }, getNightsText())
      )
    ),

    // Room Selection
    rooms.length === 0 ?
      React.createElement('div', { style: styles.emptyState },
        React.createElement(Hotel, { size: 48, color: '#cbd5e1', style: styles.emptyIcon }),
        React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' } }, 'No Rooms Available'),
        React.createElement('p', { style: { color: '#94a3b8', fontSize: '13px' } }, 
          'No rooms available for your selected dates'
        )
      ) :
      React.createElement('div', null,
        React.createElement('div', { style: styles.sectionTitle },
          React.createElement(Bed, { size: 18, color: '#4F46E5' }),
          'Available Rooms'
        ),
        React.createElement('div', { style: styles.roomsGrid },
          rooms.map(room => {
            const isSelected = selectedRoom && selectedRoom.id === room.id;
            const roomStyle = isSelected ? styles.roomCardSelected : styles.roomCard;
            
            return React.createElement('div', {
              key: room.id,
              style: roomStyle,
              onClick: () => handleSelectRoom(room),
              onMouseEnter: (e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                }
              },
              onMouseLeave: (e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                }
              }
            },
              // Gradient accent bar
              React.createElement('div', { style: styles.roomCardGradient }),
              
              // Selected badge
              isSelected && React.createElement('div', { style: styles.selectedBadge },
                React.createElement(Check, { size: 10 }),
                'Selected'
              ),
              
              // Room header
              React.createElement('div', { style: styles.roomHeader },
                React.createElement('h4', { style: styles.roomName }, room.name),
                React.createElement('span', { style: styles.roomType }, room.type || 'Standard')
              ),
              
              // Price
              React.createElement('div', { style: styles.roomPrice },
                formatPrice(room.price_per_night),
                React.createElement('span', { style: styles.pricePer }, ' / night')
              ),
              
              // Details
              React.createElement('div', { style: styles.roomDetails },
                React.createElement('span', { style: styles.detailBadge },
                  React.createElement(Users, { size: 12 }),
                  `Max ${room.capacity || 2}`
                ),
                React.createElement('span', { style: styles.detailBadge },
                  React.createElement(Star, { size: 12, fill: '#f59e0b', color: '#f59e0b' }),
                  '4.9'
                )
              ),
              
              // Description
              room.description && React.createElement('p', { style: styles.roomDescription }, room.description),
              
              // Amenities
              room.amenities && room.amenities.length > 0 &&
                React.createElement('div', { style: styles.amenitiesList },
                  room.amenities.slice(0, 4).map(amenity => {
                    const Icon = getAmenityIcon(amenity);
                    return React.createElement('span', { key: amenity, style: styles.amenityTag },
                      React.createElement(Icon, { size: 10, color: '#64748b' }),
                      amenity
                    );
                  }),
                  room.amenities.length > 4 && 
                    React.createElement('span', { key: 'more', style: { ...styles.amenityTag, background: '#EEF2FF', color: '#4F46E5', fontWeight: '600' } }, 
                      `+${room.amenities.length - 4}`
                    )
                ),
              
              // Check availability button - Inspired by image
              React.createElement('button', {
                onClick: (e) => {
                  e.stopPropagation();
                  handleSelectRoom(room);
                  setTimeout(() => handleOpenBookingModal(), 200);
                },
                style: {
                  width: '100%',
                  padding: '10px',
                  backgroundColor: isSelected ? '#4F46E5' : '#f1f5f9',
                  color: isSelected ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '4px'
                },
                onMouseEnter: (e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#e2e8f0';
                  }
                },
                onMouseLeave: (e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }
                }
              },
                isSelected ? 'Book Now' : 'Check availability'
              )
            );
          })
        )
      ),

    // Booking Modal
    showBookingModal && React.createElement('div', { 
      style: styles.modalOverlay,
      onClick: handleCloseBookingModal
    },
      React.createElement('div', { 
        style: styles.modalContent,
        onClick: (e) => e.stopPropagation()
      },
        // Modal Header
        React.createElement('div', { style: styles.modalHeader },
          React.createElement('h3', { style: styles.modalTitle }, 'Complete Your Booking'),
          React.createElement('button', { 
            onClick: handleCloseBookingModal,
            style: styles.modalClose,
            onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#f1f5f9',
            onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
          },
            React.createElement(X, { size: 20 })
          )
        ),
        
        // Modal Body
        React.createElement('div', { style: styles.modalBody },
          // Booking Summary
          React.createElement('div', { style: styles.modalSummary },
            React.createElement('div', { style: styles.modalSummaryRow },
              React.createElement('span', { style: styles.modalSummaryLabel }, 'Room'),
              React.createElement('span', { style: styles.modalSummaryValue }, selectedRoom?.name)
            ),
            React.createElement('div', { style: styles.modalSummaryRow },
              React.createElement('span', { style: styles.modalSummaryLabel }, 'Total'),
              React.createElement('span', { style: { ...styles.modalSummaryValue, color: '#4F46E5', fontWeight: '700' } }, 
                formatPrice(selectedRoom ? selectedRoom.price_per_night * calculateNights() : 0)
              )
            )
          ),
          
          // Form
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.formLabel },
              React.createElement(User, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
              'Full Name *'
            ),
            React.createElement('input', {
              type: 'text',
              name: 'fullName',
              value: formData.fullName,
              onChange: handleInputChange,
              placeholder: 'Enter your full name',
              style: formErrors.fullName ? styles.formInputError : styles.formInput,
              onFocus: (e) => {
                if (!formErrors.fullName) e.target.style.borderColor = '#4F46E5';
              },
              onBlur: (e) => e.target.style.borderColor = '#e2e8f0'
            }),
            formErrors.fullName && React.createElement('span', { style: styles.formError }, formErrors.fullName)
          ),
          
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.formLabel },
              React.createElement(Mail, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
              'Email Address *'
            ),
            React.createElement('input', {
              type: 'email',
              name: 'email',
              value: formData.email,
              onChange: handleInputChange,
              placeholder: 'your@email.com',
              style: formErrors.email ? styles.formInputError : styles.formInput,
              onFocus: (e) => {
                if (!formErrors.email) e.target.style.borderColor = '#4F46E5';
              },
              onBlur: (e) => e.target.style.borderColor = '#e2e8f0'
            }),
            formErrors.email && React.createElement('span', { style: styles.formError }, formErrors.email)
          ),
          
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.formLabel },
              React.createElement(Phone, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
              'Phone Number *'
            ),
            React.createElement('input', {
              type: 'tel',
              name: 'phone',
              value: formData.phone,
              onChange: handleInputChange,
              placeholder: '080 1234 5678',
              style: formErrors.phone ? styles.formInputError : styles.formInput,
              onFocus: (e) => {
                if (!formErrors.phone) e.target.style.borderColor = '#4F46E5';
              },
              onBlur: (e) => e.target.style.borderColor = '#e2e8f0'
            }),
            formErrors.phone && React.createElement('span', { style: styles.formError }, formErrors.phone)
          ),
          
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.formLabel }, 'Special Requests'),
            React.createElement('textarea', {
              name: 'specialRequests',
              value: formData.specialRequests,
              onChange: handleInputChange,
              placeholder: 'Any special requests...',
              style: { 
                ...styles.formInput, 
                minHeight: '50px', 
                resize: 'vertical',
                fontFamily: 'inherit'
              },
              onFocus: (e) => e.target.style.borderColor = '#4F46E5',
              onBlur: (e) => e.target.style.borderColor = '#e2e8f0'
            })
          ),
          
          // Payment Method
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.formLabel },
              React.createElement(Wallet, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
              'Payment Method'
            ),
            React.createElement('div', { style: styles.paymentOptions },
              // Pay at Venue - Primary
              React.createElement('div', {
                style: paymentMethod === 'pay_at_venue' ? styles.paymentOptionPrimarySelected : styles.paymentOptionPrimary,
                onClick: () => setPaymentMethod('pay_at_venue'),
                onMouseEnter: (e) => {
                  if (paymentMethod !== 'pay_at_venue') {
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }
                },
                onMouseLeave: (e) => {
                  if (paymentMethod !== 'pay_at_venue') {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }
              },
                React.createElement(MapPin, { 
                  size: 20, 
                  color: paymentMethod === 'pay_at_venue' ? '#4F46E5' : '#64748b', 
                  style: styles.paymentOptionIcon
                }),
                React.createElement('span', { style: styles.paymentOptionLabel }, 'Pay at Venue'),
                React.createElement('span', { style: styles.paymentOptionDesc }, 'Pay when you arrive'),
                paymentMethod === 'pay_at_venue' && React.createElement('div', {
                  style: styles.recommendedBadge
                }, 'RECOMMENDED')
              ),
              // Pay with Card
              React.createElement('div', {
                style: paymentMethod === 'paystack' ? styles.paymentOptionSelected : styles.paymentOption,
                onClick: () => setPaymentMethod('paystack'),
                onMouseEnter: (e) => {
                  if (paymentMethod !== 'paystack') {
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }
                },
                onMouseLeave: (e) => {
                  if (paymentMethod !== 'paystack') {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }
              },
                React.createElement(CreditCard, { 
                  size: 20, 
                  color: paymentMethod === 'paystack' ? '#4F46E5' : '#64748b', 
                  style: styles.paymentOptionIcon
                }),
                React.createElement('span', { style: styles.paymentOptionLabel }, 'Pay with Card'),
                React.createElement('span', { style: styles.paymentOptionDesc }, 'Secure online payment')
              )
            )
          ),
          
          // Submit Button
          React.createElement('button', {
            onClick: handleSubmitBooking,
            disabled: isBooking,
            style: isBooking ? styles.submitButtonDisabled : styles.submitButton,
            onMouseEnter: (e) => {
              if (!isBooking) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 30px rgba(79,70,229,0.3)';
              }
            },
            onMouseLeave: (e) => {
              if (!isBooking) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.2)';
              }
            }
          },
            isBooking ? 
              React.createElement(Loader2, { size: 18, style: { animation: 'spin 1s linear infinite', display: 'inline', marginRight: '8px' } }) :
              React.createElement(Check, { size: 18, style: { display: 'inline', marginRight: '8px' } }),
            isBooking ? 'Processing...' : paymentMethod === 'pay_at_venue' ? 'Confirm & Pay at Venue' : 'Pay with Card'
          )
        )
      )
    )
  );
}

export default HotelBooking;