import React, { useState, useEffect } from 'react';
import { 
  Hotel, Calendar, Users, Bed, Check, ArrowLeft, CreditCard, 
  MapPin, Clock, Loader2, Wifi, Tv, Coffee, Dumbbell, 
  Car, Snowflake, Sparkles, X, Mail, Phone, User, Wallet,
  CheckCircle2, Star
} from 'lucide-react';
import API_BASE from './config';
import { showError, showSuccess } from './toast';
import BookingConfirmation from './BookingConfirmation';

/**
 * HotelBooking - Premium Customer-facing booking component
 * Ultra-luxury design with premium gradients, animations, and typography
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
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi;
    if (amenityLower.includes('tv') || amenityLower.includes('television')) return Tv;
    if (amenityLower.includes('coffee') || amenityLower.includes('tea')) return Coffee;
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return Dumbbell;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return Car;
    if (amenityLower.includes('ac') || amenityLower.includes('air')) return Snowflake;
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
        minHeight: '500px',
        flexDirection: 'column',
        gap: '20px'
      }
    },
      React.createElement(Loader2, { 
        size: 40, 
        style: { 
          animation: 'spin 1s linear infinite',
          color: '#4f46e5'
        } 
      }),
      React.createElement('p', { 
        style: { 
          color: '#64748b', 
          fontSize: '15px',
          fontWeight: '500'
        } 
      }, 'Loading available rooms...')
    );
  }

  // ========== ULTRA PREMIUM STYLES ==========
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 20px',
      background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 50%, #faf8ff 100%)',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px',
      borderBottom: '2px solid #f1f5f9',
      paddingBottom: '24px'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      letterSpacing: '-0.5px'
    },
    titleAccent: {
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    subtitle: {
      fontSize: '15px',
      color: '#94a3b8',
      marginTop: '4px',
      fontWeight: '400',
      letterSpacing: '0.2px'
    },
    backButton: {
      padding: '12px 22px',
      backgroundColor: 'white',
      color: '#475569',
      border: '1.5px solid #e2e8f0',
      borderRadius: '40px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
    },
    bookingSummary: {
      background: 'linear-gradient(135deg, #f1f4f9 0%, #e8edf5 50%, #f0edf8 100%)',
      borderRadius: '20px',
      padding: '28px 36px',
      marginBottom: '36px',
      border: '1px solid #e2e8f0',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '24px',
      boxShadow: '0 8px 30px rgba(79,70,229,0.04)'
    },
    summaryItem: {
      fontSize: '11px',
      color: '#94a3b8',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.8px'
    },
    summaryValue: {
      fontWeight: '800',
      color: '#0f172a',
      display: 'block',
      marginTop: '6px',
      fontSize: '18px',
      letterSpacing: '-0.2px'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      letterSpacing: '-0.3px'
    },
    roomsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '28px',
      marginBottom: '28px'
    },
    roomCard: {
      background: 'white',
      borderRadius: '24px',
      border: '1px solid #e8edf5',
      padding: '32px 28px 28px',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
      overflow: 'hidden'
    },
    roomCardSelected: {
      background: 'white',
      borderRadius: '24px',
      border: '2px solid #4F46E5',
      padding: '32px 28px 28px',
      cursor: 'pointer',
      boxShadow: '0 0 0 4px rgba(79,70,229,0.06), 0 12px 48px rgba(79,70,229,0.12)',
      position: 'relative',
      overflow: 'hidden'
    },
    roomCardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #4F46E5, #7c3aed, #6d28d9)'
    },
    selectedBadge: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      padding: '5px 16px',
      borderRadius: '40px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    roomHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '10px',
      gap: '12px'
    },
    roomName: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    roomType: {
      fontSize: '11px',
      color: '#64748b',
      backgroundColor: '#f1f5f9',
      padding: '4px 16px',
      borderRadius: '40px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      letterSpacing: '0.3px'
    },
    roomPrice: {
      fontSize: '30px',
      fontWeight: '800',
      color: '#4F46E5',
      marginBottom: '14px',
      letterSpacing: '-0.5px'
    },
    pricePer: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#94a3b8'
    },
    roomDetails: {
      display: 'flex',
      gap: '20px',
      marginBottom: '16px',
      flexWrap: 'wrap',
      borderTop: '1px solid #f1f5f9',
      paddingTop: '16px'
    },
    detailBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      color: '#64748b',
      fontWeight: '500'
    },
    roomDescription: {
      fontSize: '14px',
      color: '#64748b',
      lineHeight: '1.7',
      marginBottom: '18px'
    },
    amenitiesList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    amenityTag: {
      backgroundColor: '#f8fafc',
      padding: '6px 16px',
      borderRadius: '40px',
      fontSize: '12px',
      fontWeight: '500',
      color: '#475569',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      border: '1px solid #f1f5f9'
    },
    bookButton: {
      width: '100%',
      padding: '20px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: '18px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginTop: '8px',
      boxShadow: '0 8px 40px rgba(79,70,229,0.25)',
      letterSpacing: '0.3px'
    },
    bookButtonDisabled: {
      width: '100%',
      padding: '20px',
      backgroundColor: '#e2e8f0',
      color: '#94a3b8',
      border: 'none',
      borderRadius: '16px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'not-allowed',
      marginTop: '8px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 24px',
      backgroundColor: 'white',
      borderRadius: '24px',
      border: '2px dashed #e2e8f0'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
      animation: 'fadeIn 0.3s ease'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '32px',
      maxWidth: '560px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 40px 120px rgba(0,0,0,0.2)',
      animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    modalHeader: {
      padding: '28px 32px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%)',
      borderRadius: '32px 32px 0 0'
    },
    modalTitle: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    modalClose: {
      background: '#f1f5f9',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      padding: '10px',
      borderRadius: '14px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalBody: {
      padding: '32px'
    },
    modalSummary: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f4f9 100%)',
      borderRadius: '16px',
      padding: '20px 24px',
      marginBottom: '24px',
      border: '1px solid #e2e8f0'
    },
    modalSummaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      fontSize: '14px'
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
      marginBottom: '20px'
    },
    formLabel: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '6px',
      letterSpacing: '0.2px'
    },
    formInput: {
      width: '100%',
      padding: '14px 18px',
      border: '2px solid #e2e8f0',
      borderRadius: '14px',
      fontSize: '15px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      background: 'white'
    },
    formInputError: {
      width: '100%',
      padding: '14px 18px',
      border: '2px solid #ef4444',
      borderRadius: '14px',
      fontSize: '15px',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      background: 'white'
    },
    formError: {
      color: '#ef4444',
      fontSize: '12px',
      marginTop: '4px',
      display: 'block'
    },
    paymentOptions: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px',
      marginTop: '8px'
    },
    paymentOption: {
      padding: '18px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '14px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      background: 'white'
    },
    paymentOptionSelected: {
      padding: '18px 16px',
      border: '2px solid #4F46E5',
      borderRadius: '14px',
      cursor: 'pointer',
      textAlign: 'center',
      background: '#EEF2FF',
      boxShadow: '0 0 0 4px rgba(79,70,229,0.06)'
    },
    paymentOptionPrimary: {
      padding: '22px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      background: 'white',
      position: 'relative'
    },
    paymentOptionPrimarySelected: {
      padding: '22px 16px',
      border: '2px solid #4F46E5',
      borderRadius: '16px',
      cursor: 'pointer',
      textAlign: 'center',
      background: '#EEF2FF',
      boxShadow: '0 0 0 4px rgba(79,70,229,0.06), 0 8px 32px rgba(79,70,229,0.08)',
      position: 'relative'
    },
    submitButton: {
      width: '100%',
      padding: '20px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: '17px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
      boxShadow: '0 8px 40px rgba(79,70,229,0.25)'
    },
    submitButtonDisabled: {
      width: '100%',
      padding: '20px',
      backgroundColor: '#94a3b8',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: '17px',
      fontWeight: '600',
      cursor: 'not-allowed',
      marginTop: '8px'
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
            e.currentTarget.style.borderColor = '#4F46E5';
            e.currentTarget.style.color = '#4F46E5';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.08)';
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.color = '#475569';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
          }
        },
          React.createElement(ArrowLeft, { size: 16 }),
          ' Back to Search'
        ),
        React.createElement('div', null,
          React.createElement('div', { style: styles.title },
            React.createElement(Hotel, { size: 28, color: '#4F46E5' }),
            React.createElement('span', null, business?.name || 'Hotel')
          ),
          React.createElement('div', { style: styles.subtitle }, 'Select your preferred room')
        )
      )
    ),

    // Booking Summary - Premium
    React.createElement('div', { style: styles.bookingSummary },
      React.createElement('div', { style: styles.summaryItem },
        'Check-in',
        React.createElement('span', { style: styles.summaryValue }, 
          checkIn ? new Date(checkIn).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'
        )
      ),
      React.createElement('div', { style: styles.summaryItem },
        'Check-out',
        React.createElement('span', { style: styles.summaryValue }, 
          checkOut ? new Date(checkOut).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'
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
        React.createElement(Hotel, { size: 56, color: '#cbd5e1' }),
        React.createElement('h3', { style: { fontSize: '22px', fontWeight: '700', color: '#0f172a', marginTop: '16px' } }, 'No Rooms Available'),
        React.createElement('p', { style: { color: '#94a3b8', fontSize: '15px', maxWidth: '400px', margin: '8px auto 0' } }, 
          'This hotel has no rooms available for your selected dates. Please try different dates or contact the hotel directly.'
        )
      ) :
      React.createElement('div', null,
        React.createElement('div', { style: styles.sectionTitle },
          React.createElement(Bed, { size: 22, color: '#4F46E5' }),
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
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.06)';
                }
              },
              onMouseLeave: (e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e8edf5';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.02)';
                }
              }
            },
              // Gradient accent bar
              React.createElement('div', { style: styles.roomCardGradient }),
              
              // Selected badge
              isSelected && React.createElement('div', { style: styles.selectedBadge },
                React.createElement(Check, { size: 12 }),
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
                  React.createElement(Users, { size: 14 }),
                  `Max ${room.capacity || 2} guests`
                ),
                React.createElement('span', { style: styles.detailBadge },
                  React.createElement(Star, { size: 14, fill: '#f59e0b', color: '#f59e0b' }),
                  '4.9'
                )
              ),
              
              // Description
              room.description && React.createElement('p', { style: styles.roomDescription }, room.description),
              
              // Amenities
              room.amenities && room.amenities.length > 0 &&
                React.createElement('div', { style: styles.amenitiesList },
                  room.amenities.slice(0, 5).map(amenity => {
                    const Icon = getAmenityIcon(amenity);
                    return React.createElement('span', { key: amenity, style: styles.amenityTag },
                      React.createElement(Icon, { size: 12, color: '#64748b' }),
                      amenity
                    );
                  }),
                  room.amenities.length > 5 && 
                    React.createElement('span', { key: 'more', style: { ...styles.amenityTag, background: '#EEF2FF', color: '#4F46E5', fontWeight: '600', borderColor: '#C7D2FE' } }, 
                      `+${room.amenities.length - 5} more`
                    )
                )
            );
          })
        )
      ),

    // Book Button - Premium Gradient
    selectedRoom ? 
      React.createElement('button', {
        onClick: handleOpenBookingModal,
        style: styles.bookButton,
        onMouseEnter: (e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
          e.currentTarget.style.boxShadow = '0 16px 50px rgba(79,70,229,0.35)';
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 40px rgba(79,70,229,0.25)';
        }
      },
        React.createElement(CreditCard, { size: 20 }),
        `Book Now - ${formatPrice(amount)}`
      ) :
      React.createElement('div', { style: styles.bookButtonDisabled },
        'Select a room to continue'
      ),

    // Booking Modal - Premium
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
            onMouseEnter: (e) => e.currentTarget.style.background = '#e2e8f0',
            onMouseLeave: (e) => e.currentTarget.style.background = '#f1f5f9'
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
              React.createElement('span', { style: styles.modalSummaryLabel }, 'Hotel'),
              React.createElement('span', { style: styles.modalSummaryValue }, business?.name)
            ),
            React.createElement('div', { style: styles.modalSummaryRow },
              React.createElement('span', { style: styles.modalSummaryLabel }, 'Total'),
              React.createElement('span', { style: { ...styles.modalSummaryValue, color: '#4F46E5', fontSize: '20px', fontWeight: '800' } }, 
                formatPrice(selectedRoom ? selectedRoom.price_per_night * calculateNights() : 0)
              )
            )
          ),
          
          // Form
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.formLabel },
              React.createElement(User, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
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
              React.createElement(Mail, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
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
              React.createElement(Phone, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
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
            React.createElement('label', { style: styles.formLabel }, 'Special Requests (Optional)'),
            React.createElement('textarea', {
              name: 'specialRequests',
              value: formData.specialRequests,
              onChange: handleInputChange,
              placeholder: 'Any special requests or notes...',
              style: { 
                ...styles.formInput, 
                minHeight: '60px', 
                resize: 'vertical',
                fontFamily: 'inherit'
              },
              onFocus: (e) => e.target.style.borderColor = '#4F46E5',
              onBlur: (e) => e.target.style.borderColor = '#e2e8f0'
            })
          ),
          
          // Payment Method - Premium
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.formLabel },
              React.createElement(Wallet, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
              'Payment Method'
            ),
            React.createElement('div', { style: { ...styles.paymentOptions, gridTemplateColumns: '1fr 1fr', gap: '14px' } },
              // Pay at Venue - Primary
              React.createElement('div', {
                style: paymentMethod === 'pay_at_venue' ? styles.paymentOptionPrimarySelected : styles.paymentOptionPrimary,
                onClick: () => setPaymentMethod('pay_at_venue'),
                onMouseEnter: (e) => {
                  if (paymentMethod !== 'pay_at_venue') {
                    e.currentTarget.style.borderColor = '#4F46E5';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,70,229,0.08)';
                  }
                },
                onMouseLeave: (e) => {
                  if (paymentMethod !== 'pay_at_venue') {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }
              },
                React.createElement(MapPin, { 
                  size: 24, 
                  color: paymentMethod === 'pay_at_venue' ? '#4F46E5' : '#64748b', 
                  style: { display: 'block', margin: '0 auto 8px' } 
                }),
                React.createElement('span', { 
                  style: { 
                    fontSize: '15px', 
                    fontWeight: '700', 
                    color: paymentMethod === 'pay_at_venue' ? '#4F46E5' : '#0f172a',
                    display: 'block'
                  } 
                }, 'Pay at Venue'),
                React.createElement('span', { 
                  style: { 
                    fontSize: '12px', 
                    color: '#64748b', 
                    display: 'block',
                    marginTop: '4px'
                  } 
                }, 'Pay when you arrive'),
                paymentMethod === 'pay_at_venue' && React.createElement('div', {
                  style: {
                    marginTop: '10px',
                    padding: '4px 14px',
                    background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                    borderRadius: '20px',
                    display: 'inline-block',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#4F46E5',
                    letterSpacing: '0.5px'
                  }
                }, 'RECOMMENDED')
              ),
              // Pay with Card - Secondary
              React.createElement('div', {
                style: paymentMethod === 'paystack' ? styles.paymentOptionSelected : styles.paymentOption,
                onClick: () => setPaymentMethod('paystack'),
                onMouseEnter: (e) => {
                  if (paymentMethod !== 'paystack') {
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                },
                onMouseLeave: (e) => {
                  if (paymentMethod !== 'paystack') {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }
              },
                React.createElement(CreditCard, { 
                  size: 24, 
                  color: paymentMethod === 'paystack' ? '#4F46E5' : '#64748b', 
                  style: { display: 'block', margin: '0 auto 8px' } 
                }),
                React.createElement('span', { 
                  style: { 
                    fontSize: '15px', 
                    fontWeight: '600', 
                    color: paymentMethod === 'paystack' ? '#4F46E5' : '#0f172a',
                    display: 'block'
                  } 
                }, 'Pay with Card'),
                React.createElement('span', { 
                  style: { 
                    fontSize: '12px', 
                    color: '#64748b', 
                    display: 'block',
                    marginTop: '4px'
                  } 
                }, 'Secure online payment')
              )
            )
          ),
          
          // Submit Button - Premium
          React.createElement('button', {
            onClick: handleSubmitBooking,
            disabled: isBooking,
            style: isBooking ? styles.submitButtonDisabled : styles.submitButton,
            onMouseEnter: (e) => {
              if (!isBooking) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(79,70,229,0.35)';
              }
            },
            onMouseLeave: (e) => {
              if (!isBooking) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 40px rgba(79,70,229,0.25)';
              }
            }
          },
            isBooking ? 
              React.createElement(Loader2, { size: 20, style: { animation: 'spin 1s linear infinite', display: 'inline', marginRight: '10px' } }) :
              React.createElement(Check, { size: 20, style: { display: 'inline', marginRight: '10px' } }),
            isBooking ? 'Processing...' : paymentMethod === 'pay_at_venue' ? 'Confirm & Pay at Venue' : 'Pay with Card'
          )
        )
      )
    )
  );
}

export default HotelBooking;