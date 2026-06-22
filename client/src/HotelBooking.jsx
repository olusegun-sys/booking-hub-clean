import React, { useState, useEffect } from 'react';
import { Hotel, Calendar, Users, Bed, Check, ArrowLeft, CreditCard, MapPin, Clock, Loader2, Star, Wifi, Tv, Coffee, Dumbbell, Car, Snowflake, Sparkles } from 'lucide-react';
import API_BASE from './config';
import { showError, showSuccess } from './toast';
import BookingConfirmation from './BookingConfirmation';

/**
 * HotelBooking - Customer-facing booking component
 * Allows customers to view rooms, select one, and complete booking
 * Professional, modern UI with smooth animations
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
        // Public endpoint - no auth required for customers
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
    setSelectedRoom(room);
    const nights = calculateNights();
    const total = room.price_per_night * nights;
    setAmount(total);
  };

  // Handle booking submission
  const handleBookRoom = async () => {
    if (!selectedRoom) {
      showError('Please select a room first');
      return;
    }

    // Get or prompt for email
    let userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      userEmail = prompt('Please enter your email address for booking confirmation:');
      if (!userEmail) {
        showError('Email is required to complete booking');
        return;
      }
      // Basic email validation
      if (!userEmail.includes('@') || !userEmail.includes('.')) {
        showError('Please enter a valid email address');
        return;
      }
      localStorage.setItem('userEmail', userEmail);
    }

    setIsBooking(true);
    
    try {
      const nights = calculateNights();
      const totalAmount = selectedRoom.price_per_night * nights;

      // Create booking with pay_at_venue as default
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          business_id: business.id,
          room_id: selectedRoom.id,
          check_in: checkIn,
          check_out: checkOut,
          guests: guests,
          total_amount: totalAmount,
          customer_email: userEmail,
          payment_method: 'pay_at_venue'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setBookingReference(data.booking?.reference || `BK-${Date.now()}`);
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
          amenities: selectedRoom.amenities || []
        });
        setShowConfirmation(true);
        showSuccess('Booking confirmed! Check your email for details.');
      } else {
        showError(data.error || 'Failed to create booking. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      showError('Something went wrong. Please try again.');
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
      { label: 'Price per night', value: formatPrice(bookingData.pricePerNight) }
    ];

    return React.createElement(BookingConfirmation, {
      bookingReference: bookingReference,
      amount: bookingData.total,
      email: localStorage.getItem('userEmail') || '',
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

  // ========== STYLES ==========
  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '24px 20px',
      background: '#ffffff',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      flexWrap: 'wrap',
      gap: '16px',
      borderBottom: '1px solid #f1f5f9',
      paddingBottom: '20px'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
    },
    title: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      marginTop: '4px'
    },
    backButton: {
      padding: '10px 18px',
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    bookingSummary: {
      backgroundColor: '#f8fafc',
      borderRadius: '14px',
      padding: '20px 24px',
      marginBottom: '28px',
      border: '1px solid #e2e8f0',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '16px'
    },
    summaryItem: {
      fontSize: '13px',
      color: '#64748b',
      fontWeight: '500'
    },
    summaryValue: {
      fontWeight: '600',
      color: '#0f172a',
      display: 'block',
      marginTop: '4px',
      fontSize: '15px'
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
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    },
    roomCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '2px solid #e2e8f0',
      padding: '22px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    roomCardSelected: {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '2px solid #4f46e5',
      padding: '22px',
      cursor: 'pointer',
      boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.08), 0 8px 20px rgba(79, 70, 229, 0.1)',
      position: 'relative'
    },
    selectedBadge: {
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      backgroundColor: '#4f46e5',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.5px'
    },
    roomHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8px'
    },
    roomName: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    roomType: {
      fontSize: '12px',
      color: '#64748b',
      backgroundColor: '#f1f5f9',
      padding: '2px 10px',
      borderRadius: '20px',
      fontWeight: '500'
    },
    roomPrice: {
      fontSize: '22px',
      fontWeight: '800',
      color: '#4f46e5',
      marginBottom: '10px'
    },
    pricePer: {
      fontSize: '13px',
      fontWeight: '400',
      color: '#64748b'
    },
    roomDetails: {
      display: 'flex',
      gap: '16px',
      marginBottom: '14px',
      flexWrap: 'wrap',
      borderTop: '1px solid #f1f5f9',
      paddingTop: '14px'
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
      fontSize: '13px',
      color: '#64748b',
      lineHeight: '1.6',
      marginBottom: '14px'
    },
    amenitiesList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    amenityTag: {
      backgroundColor: '#f1f5f9',
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      color: '#475569',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    bookButton: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '4px'
    },
    bookButtonDisabled: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#e2e8f0',
      color: '#94a3b8',
      border: 'none',
      borderRadius: '14px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'not-allowed',
      marginTop: '4px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 24px',
      backgroundColor: '#fafafa',
      borderRadius: '16px',
      border: '2px dashed #e2e8f0'
    },
    emptyIcon: {
      marginBottom: '16px',
      opacity: 0.5
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
            e.currentTarget.style.backgroundColor = '#e2e8f0';
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }
        },
          React.createElement(ArrowLeft, { size: 18 }),
          ' Back to Search'
        ),
        React.createElement('div', null,
          React.createElement('div', { style: styles.title },
            React.createElement(Hotel, { size: 26, color: '#4f46e5' }),
            React.createElement('span', null, business?.name || 'Hotel')
          ),
          React.createElement('div', { style: styles.subtitle }, 'Select your preferred room')
        )
      )
    ),

    // Booking Summary
    React.createElement('div', { style: styles.bookingSummary },
      React.createElement('div', { style: styles.summaryItem },
        '?? Check-in',
        React.createElement('span', { style: styles.summaryValue }, 
          checkIn ? new Date(checkIn).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'
        )
      ),
      React.createElement('div', { style: styles.summaryItem },
        '?? Check-out',
        React.createElement('span', { style: styles.summaryValue }, 
          checkOut ? new Date(checkOut).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'
        )
      ),
      React.createElement('div', { style: styles.summaryItem },
        '?? Guests',
        React.createElement('span', { style: styles.summaryValue }, `${guests} guest${guests > 1 ? 's' : ''}`)
      ),
      React.createElement('div', { style: styles.summaryItem },
        '?? Nights',
        React.createElement('span', { style: styles.summaryValue }, getNightsText())
      )
    ),

    // Room Selection
    rooms.length === 0 ?
      React.createElement('div', { style: styles.emptyState },
        React.createElement(Hotel, { size: 64, color: '#cbd5e1', style: styles.emptyIcon }),
        React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' } }, 'No Rooms Available'),
        React.createElement('p', { style: { color: '#64748b', fontSize: '15px', maxWidth: '400px', margin: '0 auto' } }, 
          'This hotel has no rooms available for your selected dates. Please try different dates or contact the hotel directly.'
        )
      ) :
      React.createElement('div', null,
        React.createElement('div', { style: styles.sectionTitle },
          React.createElement(Bed, { size: 20, color: '#4f46e5' }),
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
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.05)';
                }
              },
              onMouseLeave: (e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }
            },
              // Selected badge
              isSelected && React.createElement('div', { style: styles.selectedBadge },
                React.createElement(Check, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
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
                  React.createElement(Bed, { size: 14 }),
                  `${room.type || 'Standard'}`
                )
              ),
              
              // Description
              room.description && React.createElement('p', { style: styles.roomDescription }, room.description),
              
              // Amenities
              room.amenities && room.amenities.length > 0 &&
                React.createElement('div', { style: styles.amenitiesList },
                  room.amenities.slice(0, 6).map(amenity => {
                    const Icon = getAmenityIcon(amenity);
                    return React.createElement('span', { key: amenity, style: styles.amenityTag },
                      React.createElement(Icon, { size: 12 }),
                      amenity
                    );
                  }),
                  room.amenities.length > 6 && 
                    React.createElement('span', { key: 'more', style: styles.amenityTag }, `+${room.amenities.length - 6} more`)
                )
            );
          })
        )
      ),

    // Book Button
    selectedRoom ? 
      React.createElement('button', {
        onClick: handleBookRoom,
        disabled: isBooking,
        style: styles.bookButton,
        onMouseEnter: (e) => {
          if (!isBooking) {
            e.currentTarget.style.backgroundColor = '#4338ca';
            e.currentTarget.style.transform = 'scale(1.02)';
          }
        },
        onMouseLeave: (e) => {
          if (!isBooking) {
            e.currentTarget.style.backgroundColor = '#4f46e5';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }
      },
        isBooking ? 
          React.createElement(Loader2, { size: 20, style: { animation: 'spin 1s linear infinite' } }) :
          React.createElement(CreditCard, { size: 18 }),
        isBooking ? 'Processing...' : `Book Now - ${formatPrice(amount)}`
      ) :
      React.createElement('div', { style: styles.bookButtonDisabled },
        'Select a room to continue'
      )
  );
}

export default HotelBooking;
