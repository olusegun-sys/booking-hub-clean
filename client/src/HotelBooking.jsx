import React, { useState, useEffect, useRef } from 'react';
import { 
  Hotel, Calendar, Users, Bed, Check, ArrowLeft, CreditCard, 
  MapPin, Clock, Loader2, Wifi, Tv, Coffee, Dumbbell, 
  Car, Snowflake, Sparkles, X, Mail, Phone, User, Wallet,
  CheckCircle2, Star, Camera, Award, Crown, Shield, Heart,
  Search, ChevronDown, ChevronUp, HeartHandshake, Utensils,
  Dumbbell as GymIcon, Map, Navigation, Building2, TrendingUp,
  AlertCircle, Info, ExternalLink, Headphones
} from 'lucide-react';
import API_BASE from './config';
import { showError, showSuccess } from './toast';
import BookingConfirmation from './BookingConfirmation';

function HotelBooking({ business, checkIn, checkOut, guests, onBack }) {
  // State management
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const selectedRoomRef = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [bookingReference, setBookingReference] = useState('');
  const [amount, setAmount] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const [localCheckIn, setLocalCheckIn] = useState(checkIn || '');
  const [localCheckOut, setLocalCheckOut] = useState(checkOut || '');
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('pay_at_venue');
  const [formErrors, setFormErrors] = useState({});

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (checkIn) setLocalCheckIn(checkIn);
    if (checkOut) setLocalCheckOut(checkOut);
  }, [checkIn, checkOut]);

  const calculateNights = () => {
    if (!localCheckIn || !localCheckOut) return 1;
    const start = new Date(localCheckIn);
    const end = new Date(localCheckOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

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
          const roomImages = [
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop'
          ];
          
          const roomsWithData = (data.rooms || []).map((room, index) => {
            const basePrice = room.price_per_night || 35000;
            const wasPrice = Math.round(basePrice * (1 + (0.1 + Math.random() * 0.2)));
            const priceStatus = Math.random() > 0.5 ? 'typical' : 'lower';
            
            return {
              ...room,
              image: roomImages[index % roomImages.length],
              rating: (4.5 + Math.random() * 0.5).toFixed(1),
              reviewCount: Math.floor(50 + Math.random() * 200),
              wasPrice: wasPrice,
              priceStatus: priceStatus,
              bedType: ['Double Bed', 'King Bed', 'Queen Bed', '2 Single Beds', 'King Bed and Sofa Bed'][index % 5],
              availability: Math.random() > 0.3 ? 'available' : 'limited'
            };
          });
          setRooms(roomsWithData);
          if (roomsWithData.length > 0) {
            console.log('Room IDs from API:', roomsWithData.map(r => ({ id: r.id, name: r.name })));
          }
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

  // ============================================================
  // handleSelectRoom - Toggles selection (for "Reserve")
  // Used when user clicks the room card
  // Behavior: TOGGLE - selects if unselected, deselects if selected
  // ============================================================
  const handleSelectRoom = (room) => {
    console.log('🖱️ handleSelectRoom called with room:', room);
    console.log('📌 selectedRoomRef.current before:', selectedRoomRef.current);
    
    if (!room || !room.id) {
      console.error('❌ Invalid room:', room);
      return;
    }
    
    const isDeselecting = selectedRoomRef.current && selectedRoomRef.current.id === room.id;
    
    if (isDeselecting) {
      console.log('🔴 Deselecting room:', room.id);
      selectedRoomRef.current = null;
      setAmount(0);
      setSelectedRoom(null);
    } else {
      console.log('🟢 Selecting room:', room.id);
      selectedRoomRef.current = room;
      const nights = calculateNights();
      const total = room.price_per_night * nights;
      setAmount(total);
      setSelectedRoom(room);
    }
    
    console.log('📌 selectedRoomRef.current after:', selectedRoomRef.current);
  };

  // ============================================================
  // handleBookNow - Forces selection (for "Book Now")
  // Used when user clicks the "Book Now" button
  // Behavior: FORCE SELECT - always selects the room, never toggles
  // ============================================================
  const handleBookNow = (room) => {
    console.log('📋 handleBookNow called for room:', room.id, room.name);
    
    if (!room || !room.id) {
      console.error('❌ Invalid room:', room);
      showError('Invalid room data. Please refresh the page.');
      return;
    }
    
    // Force select the room - no toggle!
    selectedRoomRef.current = room;
    setSelectedRoom(room);
    const nights = calculateNights();
    const total = room.price_per_night * nights;
    setAmount(total);
    
    console.log('📌 selectedRoomRef.current after force select:', selectedRoomRef.current);
    
    handleOpenBookingModal();
  };

  const handleOpenBookingModal = () => {
    console.log('📋 handleOpenBookingModal called, selectedRoomRef.current:', selectedRoomRef.current);
    if (!selectedRoomRef.current) {
      showError('Please select a room first');
      return;
    }
    setShowBookingModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setFormErrors({});
    document.body.style.overflow = 'auto';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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

  const handleSubmitBooking = async () => {
    if (!validateForm()) return;
    if (!selectedRoomRef.current) {
      showError('Please select a room first');
      return;
    }

    setIsBooking(true);
    
    try {
      const nights = calculateNights();
      const totalAmount = selectedRoomRef.current.price_per_night * nights;

      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          businessId: business.id,
          roomId: selectedRoomRef.current.id,
          checkIn: localCheckIn,
          checkOut: localCheckOut,
          guests: guests,
          totalAmount: totalAmount,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          specialRequests: formData.specialRequests,
          paymentMethod: paymentMethod,
          bookingDetails: {
            roomName: selectedRoomRef.current.name,
            hotelName: business.name,
            checkIn: localCheckIn,
            checkOut: localCheckOut,
            guests: guests,
            nights: nights,
            pricePerNight: selectedRoomRef.current.price_per_night,
            total: totalAmount,
            roomType: selectedRoomRef.current.type || 'Standard'
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
          roomName: selectedRoomRef.current.name,
          hotelName: business.name,
          checkIn: localCheckIn,
          checkOut: localCheckOut,
          guests: guests,
          nights: nights,
          pricePerNight: selectedRoomRef.current.price_per_night,
          total: totalAmount,
          roomType: selectedRoomRef.current.type || 'Standard',
          amenities: selectedRoomRef.current.amenities || [],
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          paymentMethod: paymentMethod === 'pay_at_venue' ? 'Pay at Venue' : 'Paystack'
        });
        
        setShowConfirmation(true);
        setShowBookingModal(false);
        document.body.style.overflow = 'auto';
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN', 
      minimumFractionDigits: 0 
    }).format(price || 0);
  };

  const getBadgeColor = (type) => {
    const colors = {
      'Suite': '#8B5CF6',
      'Deluxe': '#F59E0B',
      'Executive': '#10B981',
      'Presidential': '#EC4899',
      'Family': '#3B82F6',
      'Standard': '#6B7280',
      'Premium': '#EC4899'
    };
    return colors[type] || '#6B7280';
  };

  const getPriceStatus = (status) => {
    const statuses = {
      typical: { label: 'Price is typical', color: '#6B7280', icon: Info },
      lower: { label: 'Price is lower than usual', color: '#10B981', icon: TrendingUp }
    };
    return statuses[status] || statuses.typical;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(React.createElement(Star, { key: `full-${i}`, size: 12, fill: '#F59E0B', color: '#F59E0B' }));
    }
    if (halfStar) {
      stars.push(React.createElement(Star, { key: 'half', size: 12, fill: '#F59E0B', color: '#F59E0B', style: { opacity: 0.5 } }));
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(React.createElement(Star, { key: `empty-${i}`, size: 12, color: '#E2E8F0' }));
    }
    return React.createElement('span', { style: { display: 'flex', gap: '1px' } }, ...stars);
  };

  // ========== COMPLETE STYLES ==========
  const styles = {
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: '0',
      background: '#f5f7fa',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    heroSection: {
      position: 'relative',
      width: '100%',
      height: isMobile ? '350px' : '450px',
      background: '#1a1a2e',
      overflow: 'hidden'
    },
    heroImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'
    },
    heroContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: isMobile ? '20px 16px 24px' : '32px 40px 40px',
      color: 'white'
    },
    heroTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '8px'
    },
    heroName: {
      fontSize: isMobile ? '26px' : '36px',
      fontWeight: '800',
      margin: '0 0 2px',
      letterSpacing: '-0.5px',
      textShadow: '0 2px 20px rgba(0,0,0,0.3)',
      color: 'white'
    },
    heroLocation: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: isMobile ? '13px' : '15px',
      opacity: 0.9,
      textShadow: '0 1px 10px rgba(0,0,0,0.2)',
      color: 'white'
    },
    heroBadges: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    heroBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 12px',
      borderRadius: '40px',
      fontSize: '11px',
      fontWeight: '600',
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'white'
    },
    heroDescription: {
      fontSize: isMobile ? '13px' : '15px',
      opacity: 0.9,
      maxWidth: '80%',
      lineHeight: '1.5',
      marginBottom: '12px',
      textShadow: '0 1px 10px rgba(0,0,0,0.2)',
      color: 'white'
    },
    bookingWidget: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '12px 14px' : '16px 20px',
      marginTop: '12px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      alignItems: 'center',
      boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      maxWidth: '100%'
    },
    widgetField: {
      flex: 1,
      minWidth: '80px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    widgetLabel: {
      fontSize: '9px',
      fontWeight: '600',
      textTransform: 'uppercase',
      color: '#94a3b8',
      letterSpacing: '0.5px',
      display: 'block'
    },
    widgetDateInput: {
      width: '100%',
      padding: '6px 0',
      border: 'none',
      background: 'transparent',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '600',
      color: '#0f172a',
      cursor: 'pointer',
      outline: 'none',
      fontFamily: 'inherit',
      borderBottom: '2px solid #4F46E5',
      transition: 'border-color 0.2s ease'
    },
    widgetValue: {
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '600',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    widgetDivider: {
      width: '1px',
      height: '28px',
      background: '#e2e8f0'
    },
    widgetButton: {
      padding: isMobile ? '10px 16px' : '12px 28px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(79,70,229,0.25)',
      flexShrink: 0,
      width: isMobile ? '100%' : 'auto'
    },
    highlightsSection: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '16px 18px' : '20px 24px',
      margin: '20px 16px 16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    },
    highlightsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: '12px'
    },
    highlightItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      background: '#f8fafc',
      borderRadius: '12px',
      transition: 'all 0.2s ease'
    },
    highlightIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    highlightText: {
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: '500',
      color: '#0f172a',
      lineHeight: '1.3'
    },
    contentArea: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0 0 80px' : '0 20px 80px'
    },
    aboutSection: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '18px 16px' : '24px 28px',
      marginBottom: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    },
    aboutHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    aboutTitle: {
      fontSize: isMobile ? '17px' : '19px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    aboutText: {
      fontSize: isMobile ? '13px' : '14px',
      color: '#475569',
      lineHeight: '1.8',
      margin: '0 0 12px'
    },
    aboutAmenities: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      paddingTop: '12px',
      borderTop: '1px solid #f1f5f9'
    },
    aboutAmenityTag: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      background: '#f8fafc',
      borderRadius: '40px',
      fontSize: '12px',
      fontWeight: '500',
      color: '#475569',
      border: '1px solid #f1f5f9'
    },
    gallerySection: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '18px 16px' : '24px 28px',
      marginBottom: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    },
    galleryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: '6px',
      marginTop: '10px'
    },
    galleryImage: {
      width: '100%',
      aspectRatio: '1/1',
      objectFit: 'cover',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'transform 0.3s ease'
    },
    locationSection: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '18px 16px' : '24px 28px',
      marginBottom: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    },
    locationMap: {
      width: '100%',
      height: isMobile ? '200px' : '250px',
      borderRadius: '12px',
      background: '#e2e8f0',
      marginTop: '10px',
      overflow: 'hidden',
      position: 'relative'
    },
    locationMapIframe: {
      width: '100%',
      height: '100%',
      border: 'none'
    },
    locationPlaces: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '10px'
    },
    locationPlace: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      background: '#f8fafc',
      borderRadius: '40px',
      fontSize: '12px',
      color: '#475569',
      border: '1px solid #f1f5f9'
    },
    reviewsSection: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '18px 16px' : '24px 28px',
      marginBottom: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    },
    reviewsHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    reviewsScore: {
      fontSize: isMobile ? '28px' : '32px',
      fontWeight: '800',
      color: '#0f172a',
      lineHeight: '1'
    },
    reviewsScoreLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#0f172a'
    },
    reviewsScoreSub: {
      fontSize: '12px',
      color: '#94a3b8'
    },
    reviewsBreakdown: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: '8px',
      marginTop: '12px'
    },
    reviewCategory: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid #f1f5f9'
    },
    reviewCategoryName: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '500'
    },
    reviewCategoryScore: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#0f172a'
    },
    reviewBar: {
      width: '100%',
      height: '4px',
      background: '#f1f5f9',
      borderRadius: '4px',
      marginTop: '2px',
      overflow: 'hidden'
    },
    reviewBarFill: {
      height: '100%',
      borderRadius: '4px',
      background: '#4F46E5'
    },
    roomsSection: {
      marginTop: '16px'
    },
    roomsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '0 16px'
    },
    roomsTitle: {
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: '700',
      color: '#0f172a',
      letterSpacing: '-0.3px',
      margin: 0
    },
    roomsCount: {
      fontSize: '13px',
      color: '#94a3b8',
      fontWeight: '500'
    },
    roomsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '16px',
      padding: '0 16px'
    },
    roomCard: {
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '2px solid transparent',
      position: 'relative'
    },
    roomCardSelected: {
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 40px rgba(79,70,229,0.12)',
      border: '2px solid #4F46E5',
      position: 'relative'
    },
    roomCardContent: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: isMobile ? 'auto' : '100%'
    },
    roomImageWrapper: {
      position: 'relative',
      width: isMobile ? '100%' : '160px',
      minHeight: isMobile ? '160px' : '100%',
      overflow: 'hidden',
      background: '#f1f5f9',
      flexShrink: 0
    },
    roomImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.6s ease',
      minHeight: isMobile ? '160px' : '100%'
    },
    roomBadge: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      padding: '2px 10px',
      borderRadius: '40px',
      fontSize: '9px',
      fontWeight: '700',
      color: 'white',
      letterSpacing: '0.3px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    },
    roomSelectedBadge: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      padding: '2px 10px',
      borderRadius: '40px',
      fontSize: '9px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      boxShadow: '0 2px 12px rgba(79,70,229,0.3)'
    },
    roomInfo: {
      flex: 1,
      padding: isMobile ? '12px 14px' : '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    roomHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '4px',
      gap: '8px'
    },
    roomName: {
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    roomTypeTag: {
      fontSize: '9px',
      color: '#64748b',
      backgroundColor: '#f1f5f9',
      padding: '2px 8px',
      borderRadius: '40px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    },
    roomMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      fontSize: '11px',
      color: '#64748b',
      marginBottom: '4px'
    },
    roomMetaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    roomRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '4px'
    },
    roomRatingStars: {
      display: 'flex',
      alignItems: 'center',
      gap: '1px'
    },
    roomRatingText: {
      fontSize: '11px',
      fontWeight: '600',
      color: '#0f172a'
    },
    roomReviewCount: {
      fontSize: '11px',
      color: '#94a3b8'
    },
    roomPriceSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto',
      paddingTop: '10px',
      borderTop: '1px solid #f1f5f9',
      gap: '12px',
      flexWrap: 'wrap'
    },
    roomPriceLeft: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1
    },
    roomPriceStatus: {
      fontSize: '10px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '2px'
    },
    roomPriceWas: {
      fontSize: '12px',
      color: '#94a3b8',
      textDecoration: 'line-through'
    },
    roomPriceNow: {
      fontSize: '18px',
      fontWeight: '800',
      color: '#4F46E5',
      letterSpacing: '-0.5px',
      whiteSpace: 'nowrap'
    },
    roomPricePer: {
      fontSize: '10px',
      fontWeight: '400',
      color: '#94a3b8'
    },
    roomReserveButton: {
      padding: '6px 14px',
      background: '#4F46E5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(79,70,229,0.2)',
      whiteSpace: 'nowrap',
      flexShrink: 0
    },
    roomReserveButtonSelected: {
      padding: '6px 14px',
      background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 12px rgba(79,70,229,0.3)',
      whiteSpace: 'nowrap',
      flexShrink: 0
    },
    similarSection: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '18px 16px' : '24px 28px',
      marginTop: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9'
    },
    similarGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '12px',
      marginTop: '12px'
    },
    similarCard: {
      border: '1px solid #f1f5f9',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    similarImage: {
      width: '100%',
      height: '120px',
      objectFit: 'cover'
    },
    similarContent: {
      padding: '10px 12px'
    },
    similarName: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#0f172a',
      margin: 0
    },
    similarLocation: {
      fontSize: '11px',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    similarPrice: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#4F46E5',
      marginTop: '4px'
    },
    lightboxOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    },
    lightboxImage: {
      maxWidth: '90%',
      maxHeight: '90%',
      objectFit: 'contain'
    },
    lightboxNav: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.15)',
      border: 'none',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '24px',
      transition: 'background 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    lightboxClose: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '32px',
      cursor: 'pointer',
      padding: '8px',
      transition: 'transform 0.3s ease'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '0',
      animation: 'fadeIn 0.3s ease'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '28px 28px 0 0',
      maxWidth: '560px',
      width: '100%',
      maxHeight: '92vh',
      overflowY: 'auto',
      boxShadow: '0 -20px 80px rgba(0,0,0,0.15)',
      animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    },
    modalHandle: {
      width: '36px',
      height: '4px',
      borderRadius: '4px',
      background: '#e2e8f0',
      margin: '12px auto 8px'
    },
    modalHeader: {
      padding: '16px 24px 16px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'white'
    },
    modalTitle: {
      fontSize: '18px',
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
      padding: '8px',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px'
    },
    modalBody: {
      padding: '24px'
    },
    modalSummary: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f4f9 100%)',
      borderRadius: '16px',
      padding: '16px 20px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0'
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
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
      boxShadow: '0 4px 20px rgba(79,70,229,0.2)',
      letterSpacing: '0.2px'
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
      marginTop: '6px',
      padding: '2px 12px',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
      borderRadius: '20px',
      display: 'inline-block',
      fontSize: '9px',
      fontWeight: '700',
      color: '#4F46E5',
      letterSpacing: '0.3px'
    }
  };

  // ========== DATA ==========
  const heroImage = business?.cover_image || business?.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=600&fit=crop';
  
  const galleryImages = [
    heroImage,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=600&fit=crop'
  ];

  const highlights = [
    { icon: HeartHandshake, color: '#EC4899', bgColor: '#FCE4EC', label: 'Loved by couples' },
    { icon: Utensils, color: '#F59E0B', bgColor: '#FEF3C7', label: 'Top rated breakfast' },
    { icon: GymIcon, color: '#10B981', bgColor: '#D1FAE5', label: 'Fitness center' },
    { icon: Map, color: '#3B82F6', bgColor: '#DBEAFE', label: 'Central location' }
  ];

  const nearbyPlaces = [
    { name: 'City Center', distance: '5 min walk' },
    { name: 'Shopping Mall', distance: '10 min walk' },
    { name: 'Business District', distance: '15 min drive' },
    { name: 'Airport', distance: '30 min drive' }
  ];

  const similarProperties = [
    {
      id: '1',
      name: 'Grand Oak Hotel',
      location: 'Victoria Island, Lagos',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop',
      price: 85000,
      rating: 4.7
    },
    {
      id: '2',
      name: 'The Palace Suites',
      location: 'Lekki, Lagos',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
      price: 65000,
      rating: 4.8
    },
    {
      id: '3',
      name: 'Harbour View Hotel',
      location: 'Apapa, Lagos',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=250&fit=crop',
      price: 75000,
      rating: 4.6
    }
  ];

  const amenityIcons = {
    'Free Wi-Fi': { icon: Wifi, color: '#3B82F6' },
    'Air Conditioning': { icon: Snowflake, color: '#06B6D4' },
    '24/7 Support': { icon: Headphones, color: '#8B5CF6' },
    'Secure Booking': { icon: Shield, color: '#10B981' },
    'Restaurant': { icon: Utensils, color: '#F59E0B' },
    'Room Service': { icon: Coffee, color: '#EC4899' },
    'Parking': { icon: Car, color: '#6B7280' },
    'Laundry': { icon: Sparkles, color: '#3B82F6' }
  };

  // ========== CONDITIONAL RETURNS ==========
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
        selectedRoomRef.current = null;
      }
    });
  }

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
      }, 'Loading property details...')
    );
  }

  // ========== RENDER SECTION ==========
  return React.createElement('div', { style: styles.container },
    // Back Button
    React.createElement('button', {
      onClick: onBack,
      style: {
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 100,
        background: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.16)';
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
      }
    },
      React.createElement(ArrowLeft, { size: 20, color: '#1a1a1a' })
    ),

    // Lightbox Modal
    lightboxImage && React.createElement('div', {
      style: styles.lightboxOverlay,
      onClick: () => setLightboxImage(null)
    },
      React.createElement('button', {
        style: { ...styles.lightboxNav, left: '20px' },
        onClick: (e) => {
          e.stopPropagation();
          const newIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
          setLightboxIndex(newIndex);
          setLightboxImage(galleryImages[newIndex]);
        },
        onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)',
        onMouseLeave: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
      }, '‹'),
      React.createElement('img', {
        src: lightboxImage,
        alt: 'Gallery',
        style: styles.lightboxImage
      }),
      React.createElement('button', {
        style: { ...styles.lightboxNav, right: '20px' },
        onClick: (e) => {
          e.stopPropagation();
          const newIndex = (lightboxIndex + 1) % galleryImages.length;
          setLightboxIndex(newIndex);
          setLightboxImage(galleryImages[newIndex]);
        },
        onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)',
        onMouseLeave: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
      }, '›'),
      React.createElement('button', {
        style: styles.lightboxClose,
        onClick: (e) => {
          e.stopPropagation();
          setLightboxImage(null);
        },
        onMouseEnter: (e) => e.currentTarget.style.transform = 'scale(1.1)',
        onMouseLeave: (e) => e.currentTarget.style.transform = 'scale(1)'
      }, '×')
    ),

    // Hero Section
    React.createElement('div', { style: styles.heroSection },
      React.createElement('img', {
        src: heroImage,
        alt: business?.name || 'Hotel',
        style: styles.heroImage,
        onError: (e) => { 
          e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=600&fit=crop'; 
        }
      }),
      React.createElement('div', { style: styles.heroOverlay }),
      React.createElement('div', { style: styles.heroContent },
        React.createElement('div', { style: styles.heroTop },
          React.createElement('div', null,
            React.createElement('h1', { style: styles.heroName }, business?.name || 'Hotel'),
            React.createElement('div', { style: styles.heroLocation },
              React.createElement(MapPin, { size: 14 }),
              business?.city || 'Lagos', ', ', business?.state || 'Lagos'
            )
          ),
          React.createElement('div', { style: styles.heroBadges },
            React.createElement('div', { style: styles.heroBadge },
              React.createElement(Star, { size: 12, fill: '#F59E0B', color: '#F59E0B' }),
              '4.9'
            ),
            React.createElement('div', { style: { ...styles.heroBadge, background: 'rgba(79,70,229,0.3)', border: '1px solid rgba(79,70,229,0.3)' } },
              React.createElement(Crown, { size: 12 }),
              'Premium Host'
            ),
            React.createElement('div', { style: { ...styles.heroBadge, background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.3)' } },
              React.createElement(Shield, { size: 12 }),
              'Verified'
            )
          )
        ),
        business?.description && React.createElement('p', { style: styles.heroDescription }, business.description),
        React.createElement('div', { style: styles.bookingWidget },
          React.createElement('div', { style: styles.widgetField },
            React.createElement('span', { style: styles.widgetLabel }, 'Check-in'),
            React.createElement('input', {
              type: 'date',
              value: localCheckIn || '',
              onChange: (e) => {
                const newDate = e.target.value;
                setLocalCheckIn(newDate);
                if (newDate && !localCheckOut) {
                  const nextDay = new Date(newDate);
                  nextDay.setDate(nextDay.getDate() + 1);
                  setLocalCheckOut(nextDay.toISOString().split('T')[0]);
                }
              },
              style: {
                ...styles.widgetDateInput,
                borderBottom: '2px solid #4F46E5'
              },
              min: new Date().toISOString().split('T')[0]
            })
          ),
          React.createElement('div', { style: styles.widgetDivider }),
          React.createElement('div', { style: styles.widgetField },
            React.createElement('span', { style: styles.widgetLabel }, 'Check-out'),
            React.createElement('input', {
              type: 'date',
              value: localCheckOut || '',
              onChange: (e) => {
                setLocalCheckOut(e.target.value);
              },
              style: {
                ...styles.widgetDateInput,
                borderBottom: '2px solid #4F46E5'
              },
              min: localCheckIn || new Date().toISOString().split('T')[0]
            })
          ),
          React.createElement('div', { style: styles.widgetDivider }),
          React.createElement('div', { style: styles.widgetField },
            React.createElement('span', { style: styles.widgetLabel }, 'Guests'),
            React.createElement('span', { style: styles.widgetValue },
              React.createElement(Users, { size: 14, color: '#4F46E5' }),
              `${guests} guest${guests > 1 ? 's' : ''}`
            )
          ),
          React.createElement('button', {
            style: styles.widgetButton,
            onMouseEnter: (e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,70,229,0.35)';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.25)';
            },
            onClick: () => {
              const roomsElement = document.getElementById('rooms-section');
              if (roomsElement) roomsElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 'Check availability')
        )
      )
    ),

    // Highlights Section
    React.createElement('div', { style: styles.highlightsSection },
      React.createElement('div', { style: styles.highlightsGrid },
        highlights.map((highlight, idx) => {
          const IconComponent = highlight.icon;
          return React.createElement('div', { key: idx, style: styles.highlightItem },
            React.createElement('div', { style: { ...styles.highlightIcon, background: highlight.bgColor } },
              React.createElement(IconComponent, { size: 16, color: highlight.color })
            ),
            React.createElement('span', { style: styles.highlightText }, highlight.label)
          );
        })
      )
    ),

    // Content Area
    React.createElement('div', { style: styles.contentArea },
      // About Section
      React.createElement('div', { style: styles.aboutSection },
        React.createElement('div', { style: styles.aboutHeader },
          React.createElement('h2', { style: styles.aboutTitle }, 'About this property'),
          React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' } }, 
            `${business?.city || 'Lagos'}, Nigeria`
          )
        ),
        React.createElement('p', { style: styles.aboutText },
          business?.about_text || business?.description || 'Welcome to this premier hospitality destination. Experience world-class comfort and exceptional service in the heart of Nigeria.'
        ),
        React.createElement('div', { style: styles.aboutAmenities },
          ['Free Wi-Fi', 'Air Conditioning', '24/7 Support', 'Secure Booking', 'Restaurant', 'Room Service', 'Parking', 'Laundry'].map((amenity, idx) => {
            const amenityData = amenityIcons[amenity];
            const IconComponent = amenityData?.icon || Check;
            const iconColor = amenityData?.color || '#10B981';
            return React.createElement('span', { key: idx, style: styles.aboutAmenityTag },
              React.createElement(IconComponent, { size: 14, color: iconColor }),
              amenity
            );
          })
        )
      ),

      // Gallery Section
      React.createElement('div', { style: styles.gallerySection },
        React.createElement('div', { style: styles.aboutHeader },
          React.createElement('h2', { style: styles.aboutTitle }, 'Photo Gallery'),
          React.createElement('span', { style: { fontSize: '12px', color: '#94a3b8', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' } },
            React.createElement(Camera, { size: 14 }),
            `${galleryImages.length} photos`
          )
        ),
        React.createElement('div', { style: styles.galleryGrid },
          galleryImages.map((img, idx) =>
            React.createElement('img', {
              key: idx,
              src: img,
              alt: `Gallery ${idx + 1}`,
              style: styles.galleryImage,
              onError: (e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=600&fit=crop'; },
              onClick: () => {
                setLightboxIndex(idx);
                setLightboxImage(img);
              }
            })
          )
        )
      ),

      // Location Section
      React.createElement('div', { style: styles.locationSection },
        React.createElement('div', { style: styles.aboutHeader },
          React.createElement('h2', { style: styles.aboutTitle }, 'Explore the area'),
          React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' } }, 
            `${business?.city || 'Lagos'}, Nigeria`
          )
        ),
        React.createElement('div', { style: styles.locationMap },
          React.createElement('iframe', {
            src: `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(business?.city + ', ' + business?.state || 'Lagos, Nigeria')}`,
            style: styles.locationMapIframe,
            allowFullScreen: true,
            loading: 'lazy',
            referrerPolicy: 'no-referrer-when-downgrade',
            title: 'Location map'
          })
        ),
        React.createElement('div', { style: styles.locationPlaces },
          nearbyPlaces.map((place, idx) =>
            React.createElement('span', { key: idx, style: styles.locationPlace },
              React.createElement(MapPin, { size: 10, color: '#64748b' }),
              place.name,
              React.createElement('span', { style: { color: '#94a3b8', fontSize: '10px' } }, `· ${place.distance}`)
            )
          )
        )
      ),

      // Reviews Section
      React.createElement('div', { style: styles.reviewsSection },
        React.createElement('div', { style: styles.reviewsHeader },
          React.createElement('span', { style: styles.reviewsScore }, '4.9'),
          React.createElement('div', null,
            React.createElement('div', { style: styles.reviewsScoreLabel }, 'Wonderful'),
            React.createElement('span', { style: styles.reviewsScoreSub }, 'See all 5,356 reviews >')
          )
        ),
        React.createElement('div', { style: styles.reviewsBreakdown },
          [
            { name: 'Cleanliness', score: 9.4 },
            { name: 'Amenities', score: 8.8 },
            { name: 'Service', score: 9.2 },
            { name: 'Location', score: 9.6 },
            { name: 'Value', score: 8.5 },
            { name: 'Comfort', score: 9.0 }
          ].map((cat, idx) =>
            React.createElement('div', { key: idx },
              React.createElement('div', { style: styles.reviewCategory },
                React.createElement('span', { style: styles.reviewCategoryName }, cat.name),
                React.createElement('span', { style: styles.reviewCategoryScore }, cat.score.toFixed(1))
              ),
              React.createElement('div', { style: styles.reviewBar },
                React.createElement('div', { style: { ...styles.reviewBarFill, width: `${(cat.score / 10) * 100}%` } })
              )
            )
          )
        )
      ),

      // Rooms Section
      React.createElement('div', { id: 'rooms-section', style: styles.roomsSection },
        React.createElement('div', { style: styles.roomsHeader },
          React.createElement('h2', { style: styles.roomsTitle }, 'Choose your room'),
          React.createElement('span', { style: styles.roomsCount }, `Showing ${rooms.length} of ${rooms.length} rooms`)
        ),
        rooms.length === 0 ?
          React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', margin: '0 16px' } },
            React.createElement(Hotel, { size: 48, color: '#cbd5e1' }),
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '12px' } }, 'No Rooms Available'),
            React.createElement('p', { style: { color: '#94a3b8', fontSize: '14px', marginTop: '4px' } }, 'No rooms available for your selected dates')
          ) :
          React.createElement('div', { style: styles.roomsGrid },
            rooms.map((room) => {
              const isSelected = selectedRoomRef.current && selectedRoomRef.current.id === room.id;
              const badgeColor = getBadgeColor(room.type);
              const priceStatus = getPriceStatus(room.priceStatus || 'typical');
              const StatusIcon = priceStatus.icon;
              
              return React.createElement('div', {
                key: room.id,
                style: isSelected ? styles.roomCardSelected : styles.roomCard,
                // "Reserve" - Clicking the room card toggles selection
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
                React.createElement('div', { style: styles.roomCardContent },
                  React.createElement('div', { style: styles.roomImageWrapper },
                    React.createElement('img', {
                      src: room.image || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop',
                      alt: room.name,
                      style: styles.roomImage,
                      onError: (e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop'; }
                    }),
                    React.createElement('div', { style: { ...styles.roomBadge, background: badgeColor } }, 
                      room.type || 'Standard'
                    ),
                    isSelected && React.createElement('div', { style: styles.roomSelectedBadge },
                      React.createElement(Check, { size: 10 }),
                      'Selected'
                    ),
                    room.availability === 'limited' && 
                      React.createElement('div', { 
                        style: { 
                          position: 'absolute', 
                          bottom: '8px', 
                          left: '8px',
                          background: '#EF4444',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '40px',
                          fontSize: '8px',
                          fontWeight: '600'
                        } 
                      }, 'Limited availability')
                  ),
                  React.createElement('div', { style: styles.roomInfo },
                    React.createElement('div', null,
                      React.createElement('div', { style: styles.roomHeader },
                        React.createElement('h4', { style: styles.roomName }, room.name),
                        React.createElement('span', { style: styles.roomTypeTag }, room.type || 'Standard')
                      ),
                      React.createElement('div', { style: styles.roomMeta },
                        React.createElement('span', { style: styles.roomMetaItem },
                          React.createElement(Users, { size: 11 }),
                          `Sleeps ${room.capacity || 2}`
                        ),
                        React.createElement('span', { style: styles.roomMetaItem },
                          React.createElement(Bed, { size: 11 }),
                          room.bedType || 'Standard'
                        ),
                        React.createElement('span', { style: styles.roomMetaItem },
                          React.createElement(Check, { size: 11, color: '#10B981' }),
                          'Free Wi-Fi'
                        )
                      ),
                      React.createElement('div', { style: styles.roomRating },
                        React.createElement('span', { style: styles.roomRatingStars },
                          renderStars(room.rating || 4.9)
                        ),
                        React.createElement('span', { style: styles.roomRatingText }, room.rating || '4.9'),
                        React.createElement('span', { style: styles.roomReviewCount }, `(${room.reviewCount || 100} reviews)`)
                      ),
                      room.description && React.createElement('p', { 
                        style: { 
                          fontSize: '12px', 
                          color: '#64748b', 
                          lineHeight: '1.4', 
                          margin: '4px 0', 
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden' 
                        } 
                      }, room.description)
                    ),
                    React.createElement('div', { style: styles.roomPriceSection },
                      React.createElement('div', { style: styles.roomPriceLeft },
                        React.createElement('span', { style: { ...styles.roomPriceStatus, color: priceStatus.color } },
                          React.createElement(StatusIcon, { size: 10 }),
                          priceStatus.label
                        ),
                        React.createElement('div', { 
                          style: { display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' } 
                        },
                          room.wasPrice && room.wasPrice > room.price_per_night &&
                            React.createElement('span', { style: styles.roomPriceWas }, formatPrice(room.wasPrice)),
                          React.createElement('span', { style: styles.roomPriceNow },
                            formatPrice(room.price_per_night),
                            React.createElement('span', { style: styles.roomPricePer }, ' / night')
                          )
                        ),
                        React.createElement('span', { style: { fontSize: '9px', color: '#94a3b8', marginTop: '2px' } }, 
                          'Reserve now, pay later'
                        )
                      ),
                      // "Book Now" - Force selects the room and opens modal
                      React.createElement('button', {
                        onClick: (e) => {
                          e.stopPropagation();
                          console.log('📋 Book Now clicked for room:', room.id, room.name);
                          // Use handleBookNow which FORCES selection
                          handleBookNow(room);
                        },
                        style: isSelected ? styles.roomReserveButtonSelected : styles.roomReserveButton,
                        onMouseEnter: (e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#4338CA';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          } else {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.3)';
                          }
                        },
                        onMouseLeave: (e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#4F46E5';
                            e.currentTarget.style.transform = 'scale(1)';
                          } else {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.2)';
                          }
                        }
                      }, isSelected ? 'Book Now' : 'Reserve')
                    )
                  )
                )
              );
            })
          )
      ),

      // Similar Properties
      React.createElement('div', { style: styles.similarSection },
        React.createElement('div', { style: styles.aboutHeader },
          React.createElement('h2', { style: styles.aboutTitle }, 'You may also like'),
          React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' } }, 'Similar properties')
        ),
        React.createElement('div', { style: styles.similarGrid },
          similarProperties.map((prop) =>
            React.createElement('div', { 
              key: prop.id, 
              style: styles.similarCard,
              onMouseEnter: (e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              },
              onClick: () => {
                showSuccess(`Viewing ${prop.name}`);
              }
            },
              React.createElement('img', {
                src: prop.image,
                alt: prop.name,
                style: styles.similarImage,
                onError: (e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop'; }
              }),
              React.createElement('div', { style: styles.similarContent },
                React.createElement('h4', { style: styles.similarName }, prop.name),
                React.createElement('div', { style: styles.similarLocation },
                  React.createElement(MapPin, { size: 10 }),
                  prop.location
                ),
                React.createElement('div', { style: styles.similarPrice }, formatPrice(prop.price))
              )
            )
          )
        )
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
        React.createElement('div', { style: styles.modalHandle }),
        React.createElement('div', { style: styles.modalHeader },
          React.createElement('h3', { style: styles.modalTitle }, 'Complete Your Booking'),
          React.createElement('button', { 
            onClick: handleCloseBookingModal,
            style: styles.modalClose,
            onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#e2e8f0',
            onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#f1f5f9'
          }, React.createElement(X, { size: 18 }))
        ),
        React.createElement('div', { style: styles.modalBody },
          React.createElement('div', { style: styles.modalSummary },
            selectedRoomRef.current ? (
              React.createElement('div', { style: styles.modalSummaryRow },
                React.createElement('span', { style: styles.modalSummaryLabel }, 'Room'),
                React.createElement('span', { style: styles.modalSummaryValue }, selectedRoomRef.current.name)
              )
            ) : null,
            selectedRoomRef.current ? (
              React.createElement('div', { style: styles.modalSummaryRow },
                React.createElement('span', { style: styles.modalSummaryLabel }, 'Total'),
                React.createElement('span', { style: { ...styles.modalSummaryValue, color: '#4F46E5', fontWeight: '700' } }, 
                  formatPrice(selectedRoomRef.current.price_per_night * calculateNights())
                )
              )
            ) : null
          ),
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
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.formLabel },
              React.createElement(Wallet, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
              'Payment Method'
            ),
            React.createElement('div', { style: styles.paymentOptions },
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