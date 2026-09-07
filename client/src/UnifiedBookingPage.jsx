// FILE: client/src/UnifiedBookingPage.jsx
// COMPLETE FIX - OCTOBER 2026
// UPDATED: Uses ONLY venue.images for gallery display
// Professional placeholder when no images exist
// FIXED: Book Now button uses selected venue instead of rooms[0]
// REMOVED: "View all properties from this owner" link from Marketed by card
// STANDARDIZED: Loading spinner matches BusinessDashboard

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// ============================================================
// ICON IMPORTS
// ============================================================
import {
  ArrowLeft,
  Users,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Bed,
  Building,
  Check,
  Loader,
  CreditCard,
  Award,
  Info,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Compass,
  Building2,
  Image,
  Star,
  User,
  Calendar,
  Clock,
  Eye,
  Tag,
  Home,
  Car,
  Sofa,
  Wifi,
  Zap,
  Shield,
  Droplets,
  Thermometer,
  Lock,
  Camera,
  Bell,
  TreePine,
  ParkingSquare,
  Utensils,
  Coffee,
  Dumbbell,
  CalendarDays,
  Share2,
  Heart,
  Globe,
  Briefcase,
  Layers,
  Grid3x3,
  GalleryHorizontal,
  GalleryVertical,
  Printer,
  Download,
  CheckCircle,
  ReceiptText,
  Banknote,
  CalendarCheck
} from 'lucide-react';

// ============================================================
// API HELPER
// ============================================================
const API_BASE = import.meta.env.VITE_API_BASE || 'https://booking-backend-clean.onrender.com';

async function fetchAPI(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Something went wrong');
  }
  return response.json();
}

// ============================================================
// HELPERS
// ============================================================
function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatDateShort(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return diffMins + ' minutes ago';
  if (diffHours < 24) return diffHours + ' hours ago';
  if (diffDays < 7) return diffDays + ' days ago';
  if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago';
  if (diffDays < 365) return Math.floor(diffDays / 30) + ' months ago';
  return Math.floor(diffDays / 365) + ' years ago';
}

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BH-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================
// RECEIPT COMPONENT
// ============================================================
function BookingReceipt({ booking, business, venue, onClose, onPrint }) {
  const isMobile = window.innerWidth < 640;

  const receiptStyle = {
    backgroundColor: 'white',
    borderRadius: isMobile ? '16px' : '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    position: 'relative'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
    padding: isMobile ? '20px 20px 16px' : '28px 28px 20px',
    color: 'white',
    borderTopLeftRadius: isMobile ? '16px' : '20px',
    borderTopRightRadius: isMobile ? '16px' : '20px',
    textAlign: 'center'
  };

  const bodyStyle = {
    padding: isMobile ? '20px' : '24px'
  };

  const sectionStyle = {
    marginBottom: '20px'
  };

  const sectionTitleStyle = {
    fontSize: isMobile ? '12px' : '13px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px'
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: isMobile ? '8px 0' : '10px 0',
    borderBottom: '1px solid #f1f5f9'
  };

  const labelStyle = {
    fontSize: isMobile ? '13px' : '14px',
    color: '#64748b'
  };

  const valueStyle = {
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: '500',
    color: '#1A1F36',
    textAlign: 'right'
  };

  const totalStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: isMobile ? '12px 0' : '16px 0',
    borderTop: '2px solid #e2e8f0',
    marginTop: '8px'
  };

  const totalLabelStyle = {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '700',
    color: '#1A1F36'
  };

  const totalValueStyle = {
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: '700',
    color: '#4F46E5'
  };

  const statusBadgeStyle = {
    display: 'inline-block',
    padding: '4px 16px',
    borderRadius: '999px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: '13px',
    fontWeight: '500'
  };

  return React.createElement(
    'div',
    { style: receiptStyle },
    React.createElement(
      'div',
      { style: headerStyle },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' } },
        React.createElement(CheckCircle, { size: isMobile ? 32 : 40 }),
        React.createElement(
          'h2',
          { style: { fontSize: isMobile ? '20px' : '24px', fontWeight: '700', margin: 0 } },
          'Booking Confirmed!'
        )
      ),
      React.createElement(
        'p',
        { style: { fontSize: isMobile ? '13px' : '15px', opacity: 0.9, margin: 0 } },
        'Your booking has been confirmed successfully'
      )
    ),
    React.createElement(
      'div',
      { style: bodyStyle },
      React.createElement(
        'div',
        { style: { ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } },
        React.createElement(
          'span',
          { style: statusBadgeStyle },
          'Confirmed'
        ),
        React.createElement(
          'span',
          { style: { fontSize: '13px', color: '#94a3b8' } },
          'Ref: ' + (booking?.booking_reference || generateOrderId())
        )
      ),
      React.createElement(
        'div',
        { style: sectionStyle },
        React.createElement(
          'h4',
          { style: sectionTitleStyle },
          React.createElement(Building2, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
          'Venue Details'
        ),
        React.createElement(
          'div',
          { style: { marginBottom: '4px', fontSize: isMobile ? '16px' : '18px', fontWeight: '600', color: '#1A1F36' } },
          venue?.name || business?.name
        ),
        React.createElement(
          'div',
          { style: { fontSize: '13px', color: '#64748b' } },
          venue?.address || business?.address || business?.city || ''
        )
      ),
      React.createElement(
        'div',
        { style: sectionStyle },
        React.createElement(
          'h4',
          { style: sectionTitleStyle },
          React.createElement(User, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
          'Customer Details'
        ),
        React.createElement(
          'div',
          { style: rowStyle },
          React.createElement('span', { style: labelStyle }, 'Full Name'),
          React.createElement('span', { style: valueStyle }, booking?.customer_name || '')
        ),
        React.createElement(
          'div',
          { style: rowStyle },
          React.createElement('span', { style: labelStyle }, 'Email'),
          React.createElement('span', { style: valueStyle }, booking?.customer_email || '')
        ),
        React.createElement(
          'div',
          { style: { ...rowStyle, borderBottom: 'none' } },
          React.createElement('span', { style: labelStyle }, 'Phone'),
          React.createElement('span', { style: valueStyle }, booking?.customer_phone || '')
        )
      ),
      React.createElement(
        'div',
        { style: sectionStyle },
        React.createElement(
          'h4',
          { style: sectionTitleStyle },
          React.createElement(CalendarCheck, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
          'Booking Details'
        ),
        React.createElement(
          'div',
          { style: rowStyle },
          React.createElement('span', { style: labelStyle }, 'Event Date'),
          React.createElement('span', { style: valueStyle }, formatDate(booking?.check_in_date || ''))
        ),
        React.createElement(
          'div',
          { style: rowStyle },
          React.createElement('span', { style: labelStyle }, 'Venue'),
          React.createElement('span', { style: valueStyle }, venue?.name || '')
        ),
        React.createElement(
          'div',
          { style: { ...rowStyle, borderBottom: 'none' } },
          React.createElement('span', { style: labelStyle }, 'Payment Method'),
          React.createElement('span', { style: valueStyle }, 
            booking?.payment_method === 'paystack' ? 'Pay Online' : 'Pay at Venue'
          )
        )
      ),
      React.createElement(
        'div',
        { style: sectionStyle },
        React.createElement(
          'h4',
          { style: sectionTitleStyle },
          React.createElement(Banknote, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
          'Payment Summary'
        ),
        React.createElement(
          'div',
          { style: rowStyle },
          React.createElement('span', { style: labelStyle }, 'Venue Fee'),
          React.createElement('span', { style: valueStyle }, formatCurrency(booking?.total_amount || 0))
        ),
        React.createElement(
          'div',
          { style: totalStyle },
          React.createElement('span', { style: totalLabelStyle }, 'Total'),
          React.createElement('span', { style: totalValueStyle }, formatCurrency(booking?.total_amount || 0))
        ),
        booking?.payment_method === 'paystack' ?
          React.createElement(
            'div',
            { style: { marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center', fontSize: '13px', color: '#065f46' } },
            React.createElement(CheckCircle, { size: 16, style: { display: 'inline', marginRight: '6px' } }),
            'Payment processed successfully'
          ) :
          React.createElement(
            'div',
            { style: { marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', textAlign: 'center', fontSize: '13px', color: '#92400e' } },
            'Pay at venue on the day of your event'
          )
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '10px', marginTop: '16px', flexDirection: isMobile ? 'column' : 'row' } },
        React.createElement(
          'button',
          {
            onClick: onPrint,
            style: {
              flex: 1,
              padding: isMobile ? '12px' : '14px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }
          },
          React.createElement(Printer, { size: 18 }),
          'Print Receipt'
        ),
        React.createElement(
          'button',
          {
            onClick: onClose,
            style: {
              flex: 2,
              padding: isMobile ? '12px' : '14px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }
          },
          React.createElement(Check, { size: 18 }),
          'Done'
        )
      ),
      React.createElement(
        'p',
        {
          style: {
            textAlign: 'center',
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9'
          }
        },
        'A confirmation email has been sent to your inbox'
      )
    )
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
function UnifiedBookingPage() {
  const params = useParams();
  const navigate = useNavigate();
  const businessSlug = params.businessSlug || params.slug;

  // ============================================================
  // STATE
  // ============================================================
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [bookingLimit, setBookingLimit] = useState({ canBook: true, remaining: 50 });
  const [viewCount, setViewCount] = useState(0);

  // Gallery
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryMainIndex, setGalleryMainIndex] = useState(0);

  // Description
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Booking modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pay_at_venue');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Receipt state
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Call modal
  const [callModalOpen, setCallModalOpen] = useState(false);

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    if (!businessSlug) {
      toast.error('No business specified');
      setLoading(false);
      return;
    }
    fetchAllData();
  }, [businessSlug]);

  async function fetchAllData() {
    setLoading(true);
    try {
      const businessRes = await fetchAPI(`/api/businesses/slug/${businessSlug}`);
      if (!businessRes.success || !businessRes.business) {
        toast.error('Business not found');
        setLoading(false);
        return;
      }
      const biz = businessRes.business;
      setBusiness(biz);
      setViewCount(biz.view_count || 0);

      const roomsRes = await fetchAPI(`/api/businesses/${biz.id}/rooms`);
      if (roomsRes.success) {
        const roomData = roomsRes.rooms || [];
        setRooms(roomData);
        if (roomData.length > 0) {
          setSelectedRoom(roomData[0]);
          setSelectedRoomIndex(0);
        }
      }

      const capacityRes = await fetchAPI(`/api/businesses/${biz.id}/booking-capacity`);
      if (capacityRes.success) {
        setBookingLimit({
          canBook: capacityRes.canBook,
          remaining: capacityRes.remaining || 0
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // GALLERY NAVIGATION - UPDATED to use ONLY venue.images
  // ============================================================
  // Get images ONLY from the selected venue
  const displayImages = (selectedRoom?.images || []).filter(Boolean);

  const mainImage = displayImages.length > 0 ? displayImages[galleryMainIndex] : null;
  const thumbnails = displayImages.slice(0, 4);
  const remainingImages = displayImages.length - 4;

  function goToPrevMain() {
    if (displayImages.length === 0) return;
    setGalleryMainIndex(prev => (prev > 0 ? prev - 1 : displayImages.length - 1));
  }

  function goToNextMain() {
    if (displayImages.length === 0) return;
    setGalleryMainIndex(prev => (prev < displayImages.length - 1 ? prev + 1 : 0));
  }

  function openLightbox(index) {
    if (displayImages.length === 0) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  }

  function goToPrevLightbox() {
    if (displayImages.length === 0) return;
    setLightboxIndex(prev => (prev > 0 ? prev - 1 : displayImages.length - 1));
  }

  function goToNextLightbox() {
    if (displayImages.length === 0) return;
    setLightboxIndex(prev => (prev < displayImages.length - 1 ? prev + 1 : 0));
  }

  // ============================================================
  // VENUE SELECTION
  // ============================================================
  function selectVenue(index) {
    if (rooms[index]) {
      setSelectedRoom(rooms[index]);
      setSelectedRoomIndex(index);
      setGalleryMainIndex(0);
    }
  }

  // ============================================================
  // BOOKING HANDLERS
  // ============================================================
  function openBookingModal(room) {
    if (!bookingLimit.canBook) {
      toast.error('This business has reached its booking limit. Please contact them directly.');
      return;
    }
    // Use passed room, or selectedRoom, or rooms[0] as fallback
    const roomToBook = room || selectedRoom || (rooms.length > 0 ? rooms[0] : null);
    if (!roomToBook) {
      toast.error('No venue selected');
      return;
    }
    setSelectedRoom(roomToBook);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEventDate(tomorrow.toISOString().split('T')[0]);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSpecialRequests('');
    setPaymentMethod('pay_at_venue');
    setBookingModalOpen(true);
  }

  function closeBookingModal() {
    setBookingModalOpen(false);
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();
    if (!selectedRoom) {
      toast.error('Please select a venue');
      return;
    }
    if (!customerName || customerName.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!customerPhone || customerPhone.trim().length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (!eventDate) {
      toast.error('Please select an event date');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(eventDate);
    if (selectedDate < today) {
      toast.error('Event date cannot be in the past');
      return;
    }

    setBookingSubmitting(true);

    const totalAmount = selectedRoom.price_per_night;

    const payload = {
      businessId: business.id,
      roomId: selectedRoom.id,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      totalAmount: totalAmount,
      checkIn: eventDate,
      checkOut: eventDate,
      guests: 1,
      specialRequests: specialRequests.trim(),
      paymentMethod: paymentMethod,
      bookingDetails: {
        roomName: selectedRoom.name,
        hotelName: business.name,
        checkIn: eventDate,
        checkOut: eventDate,
        guests: 1,
        nights: 1,
        total: totalAmount,
        paymentMethod: paymentMethod === 'pay_at_venue' ? 'Pay at Venue' : 'Paystack'
      }
    };

    try {
      const result = await fetchAPI('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (result.success) {
        closeBookingModal();
        
        setReceiptData({
          booking: result.booking,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          eventDate: eventDate,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          bookingReference: result.booking?.booking_reference || generateOrderId(),
          venue: selectedRoom,
          business: business
        });
        setShowReceipt(true);
        
        const capacityRes = await fetchAPI(`/api/businesses/${business.id}/booking-capacity`);
        if (capacityRes.success) {
          setBookingLimit({
            canBook: capacityRes.canBook,
            remaining: capacityRes.remaining || 0
          });
        }
      } else {
        toast.error(result.error || 'Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  }

  // ============================================================
  // RECEIPT HANDLERS
  // ============================================================
  function closeReceipt() {
    setShowReceipt(false);
    setReceiptData(null);
  }

  function printReceipt() {
    window.print();
  }

  // ============================================================
  // CALL HANDLER
  // ============================================================
  function getPrimaryPhone() {
    return business?.phone || '';
  }

  function copyPhone(phone) {
    if (!phone) {
      toast.error('No phone number available');
      return;
    }
    navigator.clipboard.writeText(phone).then(() => {
      toast.success('Phone number copied!');
    }).catch(() => {
      toast.error('Could not copy phone number');
    });
  }

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  const isMobile = window.innerWidth < 640;

  // ============================================================
  // RENDER: LOADING - STANDARDIZED (matches BusinessDashboard)
  // ============================================================
  if (loading) {
    return React.createElement('div', { 
      style: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        background: '#f8fafc' 
      } 
    },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  if (!business) {
    return React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          backgroundColor: '#f8fafc'
        }
      },
      React.createElement(AlertCircle, { size: 48, color: '#EF4444' }),
      React.createElement('h2', { style: { marginTop: '16px', color: '#1A1F36' } }, 'Business Not Found'),
      React.createElement('p', { style: { color: '#64748B' } }, 'The business you\'re looking for doesn\'t exist.'),
      React.createElement(
        'button',
        {
          onClick: () => navigate('/'),
          style: {
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }
        },
        'Go Home'
      )
    );
  }

  if (rooms.length === 0) {
    return React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          padding: '20px'
        }
      },
      React.createElement(Building2, { size: 48, color: '#94a3b8' }),
      React.createElement('h2', { style: { marginTop: '16px', color: '#1A1F36' } }, 'No Venues Available'),
      React.createElement('p', { style: { color: '#64748B', textAlign: 'center' } }, 
        'This business has no venues listed yet. Check back later!'
      ),
      React.createElement(
        'button',
        {
          onClick: () => navigate('/'),
          style: {
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }
        },
        'Go Home'
      )
    );
  }

  // ============================================================
  // RENDER: MAIN - USE ONLY VENUE DATA
  // ============================================================
  const venue = selectedRoom || rooms[0];
  const venueName = venue?.name || business.name;
  const venueAddress = venue?.address || business.address || business.city || 'Address not specified';
  const venuePrice = venue?.price_per_night || 0;
  const venueDescription = venue?.description || venue?.venue_description || business.description || '';

  const venueFeatures = venue?.features || [];
  const venueAmenities = venue?.amenities || [];
  const venueAreaGuide = venue?.area_guide || [];
  
  const venuePropertyDetails = {
    ref_id: venue?.ref_id || '',
    property_type: venue?.property_type || business?.business_type || 'Venue',
    property_size: venue?.property_size || '',
    bedrooms: venue?.bedrooms || 0,
    bathrooms: venue?.bathrooms || 0,
    parking_spaces: venue?.parking_spaces || 0,
    year_built: venue?.year_built || '',
    furnishing_status: venue?.furnishing_status || 'unfurnished',
    listing_status: venue?.listing_status || 'for_rent'
  };

  const statusDisplay = venuePropertyDetails.listing_status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const furnishingDisplay = venuePropertyDetails.furnishing_status.charAt(0).toUpperCase() + 
    venuePropertyDetails.furnishing_status.slice(1);

  // ============================================================
  // RENDER
  // ============================================================
  return React.createElement(
    'div',
    {
      className: 'unified-booking-page',
      style: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }
    },
    // BACK BUTTON
    React.createElement(
      'div',
      {
        style: {
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(226,232,240,0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }
      },
      React.createElement(
        'button',
        {
          onClick: () => navigate('/'),
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            color: '#4F46E5',
            fontSize: '14px',
            fontWeight: '500'
          }
        },
        React.createElement(ArrowLeft, { size: 20 }),
        React.createElement('span', { style: { display: isMobile ? 'none' : 'inline' } }, 'Back')
      ),
      React.createElement(
        'span',
        {
          style: {
            fontSize: '14px',
            color: '#64748B',
            fontWeight: '400',
            flex: 1,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }
        },
        venueName
      ),
      React.createElement(
        'button',
        {
          onClick: () => {
            if (navigator.share) {
              navigator.share({
                title: venueName,
                url: window.location.href
              });
            }
          },
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#64748B'
          }
        },
        React.createElement(Share2, { size: 20 })
      )
    ),
    // VENUE SELECTOR
    rooms.length > 1 &&
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '12px 16px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0'
          }
        },
        rooms.map((room, idx) =>
          React.createElement(
            'button',
            {
              key: room.id,
              onClick: () => selectVenue(idx),
              style: {
                padding: '6px 16px',
                borderRadius: '20px',
                border: selectedRoomIndex === idx ? '2px solid #4F46E5' : '1px solid #e2e8f0',
                backgroundColor: selectedRoomIndex === idx ? '#EEF2FF' : 'white',
                color: selectedRoomIndex === idx ? '#4F46E5' : '#64748B',
                fontSize: '13px',
                fontWeight: selectedRoomIndex === idx ? '600' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }
            },
            room.name
          )
        )
      ),
    // MAIN CONTENT
    React.createElement(
      'div',
      {
        style: {
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 16px 100px',
          width: '100%'
        }
      },
      // VENUE INFO HEADER CARD
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(226,232,240,0.6)'
          }
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '8px'
            }
          },
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '4px'
                }
              },
              React.createElement(
                'span',
                {
                  style: {
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    padding: '2px 12px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }
                },
                'Premium'
              ),
              React.createElement(
                'span',
                {
                  style: {
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '2px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }
                },
                statusDisplay
              )
            ),
            React.createElement(
              'h1',
              {
                style: {
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: '700',
                  color: '#1A1F36',
                  margin: '4px 0 4px 0'
                }
              },
              venueName
            ),
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  fontSize: '13px',
                  color: '#64748B'
                }
              },
              React.createElement(
                'span',
                { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                React.createElement(MapPin, { size: 14 }),
                venueAddress
              ),
              venuePropertyDetails.ref_id &&
                React.createElement(
                  'span',
                  { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                  React.createElement(Tag, { size: 14 }),
                  'Ref: ' + venuePropertyDetails.ref_id
                ),
              React.createElement(
                'span',
                { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                React.createElement(Calendar, { size: 14 }),
                'Posted ' + timeAgo(venue?.created_at || business.created_at)
              ),
              React.createElement(
                'span',
                { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                React.createElement(Eye, { size: 14 }),
                (venue?.view_count || viewCount) + ' views'
              )
            )
          ),
          React.createElement(
            'div',
            {
              style: {
                textAlign: 'right',
                minWidth: '100px',
                backgroundColor: '#EEF2FF',
                padding: '8px 16px',
                borderRadius: '12px'
              }
            },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: '700',
                  color: '#4F46E5'
                }
              },
              formatCurrency(venuePrice)
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '12px',
                  color: '#64748B'
                }
              },
              'per day'
            )
          )
        ),
        business.phone &&
          React.createElement(
            'div',
            {
              style: {
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }
            },
            React.createElement(
              'button',
              {
                onClick: () => setCallModalOpen(true),
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }
              },
              React.createElement(Phone, { size: 16 }),
              'Call Business'
            ),
            React.createElement(
              'span',
              {
                style: {
                  fontSize: '13px',
                  color: '#64748B'
                }
              },
              business.phone
            )
          )
      ),
      // GALLERY GRID - UPDATED to use ONLY displayImages (venue.images)
      React.createElement(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gridTemplateRows: isMobile ? 'auto' : 'auto auto',
            gap: '4px',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#e2e8f0',
            marginBottom: '16px'
          }
        },
        // Main image - with professional placeholder when no images
        React.createElement(
          'div',
          {
            style: {
              position: 'relative',
              gridRow: isMobile ? '1' : '1 / 3',
              gridColumn: isMobile ? '1' : '1',
              aspectRatio: isMobile ? '4/3' : '3/2',
              cursor: displayImages.length > 0 ? 'pointer' : 'default',
              overflow: 'hidden',
              backgroundColor: '#f1f5f9'
            },
            onClick: () => {
              if (displayImages.length > 0) openLightbox(galleryMainIndex);
            }
          },
          displayImages.length > 0 && displayImages[galleryMainIndex]
            ? React.createElement('img', {
                src: displayImages[galleryMainIndex],
                alt: venueName,
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }
              })
            : React.createElement(
                'div',
                {
                  style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    backgroundColor: '#f8fafc',
                    padding: '20px'
                  }
                },
                React.createElement(Camera, { size: 48, color: '#cbd5e1' }),
                React.createElement(
                  'h3',
                  { style: { marginTop: '16px', fontSize: '18px', fontWeight: '600', color: '#475569' } },
                  'No Images Yet'
                ),
                React.createElement(
                  'p',
                  { style: { fontSize: '14px', color: '#94a3b8', textAlign: 'center', maxWidth: '300px' } },
                  'This venue has no images uploaded. Check back later!'
                ),
                business?.name &&
                  React.createElement(
                    'p',
                    { style: { fontSize: '12px', color: '#cbd5e1', marginTop: '8px' } },
                    'Contact ' + business.name + ' for more information'
                  )
              ),
          displayImages.length > 1 &&
            React.createElement(
              'button',
              {
                onClick: (e) => { e.stopPropagation(); goToPrevMain(); },
                style: {
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              },
              React.createElement(ChevronLeft, { size: 18 })
            ),
          displayImages.length > 1 &&
            React.createElement(
              'button',
              {
                onClick: (e) => { e.stopPropagation(); goToNextMain(); },
                style: {
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              },
              React.createElement(ChevronRight, { size: 18 })
            ),
          displayImages.length > 1 &&
            React.createElement(
              'div',
              {
                style: {
                  position: 'absolute',
                  bottom: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  fontSize: '11px'
                }
              },
              `${galleryMainIndex + 1} / ${displayImages.length}`
            )
        ),
        // Thumbnails (desktop) - only show if images exist
        !isMobile && displayImages.length > 1 &&
          displayImages.slice(1, 5).map((img, idx) => {
            const actualIndex = idx + 1;
            const isLastThumb = idx === 3 && remainingImages > 0;
            return React.createElement(
              'div',
              {
                key: idx,
                style: {
                  position: 'relative',
                  gridRow: idx < 2 ? '1' : '2',
                  gridColumn: '2',
                  aspectRatio: '3/2',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  backgroundColor: '#e2e8f0'
                },
                onClick: () => {
                  if (actualIndex < displayImages.length) {
                    setGalleryMainIndex(actualIndex);
                    openLightbox(actualIndex);
                  } else {
                    openLightbox(0);
                  }
                }
              },
              React.createElement('img', {
                src: img,
                alt: `Thumbnail ${idx + 1}`,
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }
              }),
              isLastThumb &&
                React.createElement(
                  'div',
                  {
                    style: {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: '700'
                    }
                  },
                  `+${remainingImages}`
                )
            );
          }),
        // Mobile thumbnails - only show if images exist
        isMobile && displayImages.length > 1 &&
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                gap: '4px',
                padding: '4px',
                overflowX: 'auto',
                backgroundColor: 'white',
                gridRow: '2'
              }
            },
            displayImages.map((img, idx) =>
              React.createElement(
                'div',
                {
                  key: idx,
                  style: {
                    flexShrink: 0,
                    width: '60px',
                    height: '60px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: galleryMainIndex === idx ? '2px solid #4F46E5' : '2px solid transparent'
                  },
                  onClick: () => setGalleryMainIndex(idx)
                },
                React.createElement('img', {
                  src: img,
                  alt: `Thumbnail ${idx + 1}`,
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }
                })
              )
            )
          )
      ),
      // TYPE ICON CARD
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(226,232,240,0.6)'
          }
        },
        React.createElement(
          'span',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#475569'
            }
          },
          React.createElement(Building, { size: 18, color: '#4F46E5' }),
          venuePropertyDetails.property_type
        ),
        React.createElement(
          'span',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#475569'
            }
          },
          React.createElement(Car, { size: 18, color: '#4F46E5' }),
          venuePropertyDetails.parking_spaces > 0 ? venuePropertyDetails.parking_spaces + ' Parking Spaces' : 'No Parking'
        ),
        React.createElement(
          'span',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#475569'
            }
          },
          React.createElement(Sofa, { size: 18, color: '#4F46E5' }),
          furnishingDisplay
        )
      ),
      // ABOUT PROPERTY
      venueDescription &&
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid rgba(226,232,240,0.6)'
            }
          },
          React.createElement(
            'h2',
            {
              style: {
                fontSize: '16px',
                fontWeight: '600',
                color: '#1A1F36',
                margin: '0 0 8px 0'
              }
            },
            'About This Property'
          ),
          React.createElement(
            'p',
            {
              style: {
                fontSize: '14px',
                color: '#475569',
                lineHeight: '1.7',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: showFullDescription ? 'none' : 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }
            },
            venueDescription
          ),
          venueDescription.length > 200 &&
            React.createElement(
              'button',
              {
                onClick: () => setShowFullDescription(!showFullDescription),
                style: {
                  background: 'none',
                  border: 'none',
                  color: '#4F46E5',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  padding: '4px 0',
                  marginTop: '4px'
                }
              },
              showFullDescription ? 'Show less' : 'Show full description'
            )
        ),
      // FEATURES & AMENITIES
      (venueFeatures.length > 0 || venueAmenities.length > 0) &&
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid rgba(226,232,240,0.6)'
            }
          },
          React.createElement(
            'h2',
            {
              style: {
                fontSize: '16px',
                fontWeight: '600',
                color: '#1A1F36',
                margin: '0 0 12px 0'
              }
            },
            'Features & Amenities'
          ),
          venueFeatures.length > 0 &&
            React.createElement(
              'div',
              { style: { marginBottom: '16px' } },
              ['interior', 'exterior', 'safety', 'utilities', 'outdoor'].map(cat => {
                const catFeatures = venueFeatures.filter(f => f.category === cat);
                if (catFeatures.length === 0) return null;
                const catLabels = {
                  interior: '🏠 Interior & Finishing',
                  exterior: '🏡 Exterior Features',
                  safety: '🛡️ Safety & Security',
                  utilities: '⚡ Power & Utilities',
                  outdoor: '🌳 Outdoor & Communal'
                };
                return React.createElement(
                  'div',
                  { key: cat, style: { marginBottom: '8px' } },
                  React.createElement(
                    'h3',
                    {
                      style: {
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#475569',
                        margin: '0 0 6px 0'
                      }
                    },
                    catLabels[cat] || cat
                  ),
                  React.createElement(
                    'div',
                    {
                      style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }
                    },
                    catFeatures.map((f, idx) =>
                      React.createElement(
                        'span',
                        {
                          key: idx,
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 12px',
                            backgroundColor: '#EEF2FF',
                            borderRadius: '16px',
                            fontSize: '12px',
                            color: '#4F46E5'
                          }
                        },
                        React.createElement(Check, { size: 12 }),
                        f.name
                      )
                    )
                  )
                );
              })
            ),
          venueAmenities.length > 0 &&
            React.createElement(
              'div',
              null,
              ['interior', 'safety', 'outdoor', 'utilities'].map(cat => {
                const catAmenities = venueAmenities.filter(a => a.category === cat);
                if (catAmenities.length === 0) return null;
                const catLabels = {
                  interior: '🏠 Interior & Finishing',
                  safety: '🛡️ Security & Safety',
                  outdoor: '🌳 Outdoor & Communal',
                  utilities: '⚡ Power & Utilities'
                };
                return React.createElement(
                  'div',
                  { key: cat, style: { marginBottom: '8px' } },
                  React.createElement(
                    'h3',
                    {
                      style: {
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#475569',
                        margin: '0 0 6px 0'
                      }
                    },
                    catLabels[cat] || cat
                  ),
                  React.createElement(
                    'div',
                    {
                      style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }
                    },
                    catAmenities.map((a, idx) =>
                      React.createElement(
                        'span',
                        {
                          key: idx,
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 12px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '16px',
                            fontSize: '12px',
                            color: '#475569'
                          }
                        },
                        React.createElement(Check, { size: 12, color: '#4F46E5' }),
                        a.name
                      )
                    )
                  )
                );
              })
            )
        ),
      // PROPERTY DETAILS
      (venuePropertyDetails.ref_id || venuePropertyDetails.bedrooms > 0 || venuePropertyDetails.bathrooms > 0 ||
       venuePropertyDetails.parking_spaces > 0 || venuePropertyDetails.year_built || venuePropertyDetails.property_size) &&
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid rgba(226,232,240,0.6)'
            }
          },
          React.createElement(
            'h2',
            {
              style: {
                fontSize: '16px',
                fontWeight: '600',
                color: '#1A1F36',
                margin: '0 0 12px 0'
              }
            },
            'Property Details'
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '6px 16px'
              }
            },
            venuePropertyDetails.ref_id &&
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('span', { style: { color: '#94a3b8', fontSize: '13px' } }, 'Reference ID'),
                React.createElement('span', { style: { color: '#1A1F36', fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.ref_id)
              ),
            venuePropertyDetails.property_type &&
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('span', { style: { color: '#94a3b8', fontSize: '13px' } }, 'Property Type'),
                React.createElement('span', { style: { color: '#1A1F36', fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.property_type)
              ),
            venuePropertyDetails.bedrooms > 0 &&
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('span', { style: { color: '#94a3b8', fontSize: '13px' } }, 'Bedrooms'),
                React.createElement('span', { style: { color: '#1A1F36', fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.bedrooms)
              ),
            venuePropertyDetails.bathrooms > 0 &&
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('span', { style: { color: '#94a3b8', fontSize: '13px' } }, 'Bathrooms'),
                React.createElement('span', { style: { color: '#1A1F36', fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.bathrooms)
              ),
            venuePropertyDetails.parking_spaces > 0 &&
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('span', { style: { color: '#94a3b8', fontSize: '13px' } }, 'Parking Spaces'),
                React.createElement('span', { style: { color: '#1A1F36', fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.parking_spaces)
              ),
            venuePropertyDetails.property_size &&
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('span', { style: { color: '#94a3b8', fontSize: '13px' } }, 'Property Size'),
                React.createElement('span', { style: { color: '#1A1F36', fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.property_size)
              ),
            venuePropertyDetails.year_built &&
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('span', { style: { color: '#94a3b8', fontSize: '13px' } }, 'Year Built'),
                React.createElement('span', { style: { color: '#1A1F36', fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.year_built)
              ),
            furnishingDisplay &&
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('span', { style: { color: '#94a3b8', fontSize: '13px' } }, 'Furnishing'),
                React.createElement('span', { style: { color: '#1A1F36', fontSize: '13px', fontWeight: '500' } }, furnishingDisplay)
              ),
            statusDisplay &&
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('span', { style: { color: '#94a3b8', fontSize: '13px' } }, 'Listing Status'),
                React.createElement('span', { style: { color: '#1A1F36', fontSize: '13px', fontWeight: '500' } }, statusDisplay)
              )
          )
        ),
      // AREA GUIDE
      venueAreaGuide.length > 0 &&
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid rgba(226,232,240,0.6)'
            }
          },
          React.createElement(
            'h2',
            {
              style: {
                fontSize: '16px',
                fontWeight: '600',
                color: '#1A1F36',
                margin: '0 0 12px 0'
              }
            },
            'Area Guide'
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '12px'
              }
            },
            venueAreaGuide.map((section, idx) =>
              React.createElement(
                'div',
                {
                  key: idx,
                  style: {
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid #f1f5f9'
                  }
                },
                React.createElement(
                  'h3',
                  {
                    style: {
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1A1F36',
                      margin: '0 0 4px 0'
                    }
                  },
                  section.title || 'Section'
                ),
                React.createElement(
                  'p',
                  {
                    style: {
                      fontSize: '13px',
                      color: '#475569',
                      lineHeight: '1.6',
                      margin: 0
                    }
                  },
                  section.content || ''
                )
              )
            )
          )
        ),
      // MARKETED BY CARD - REMOVED "View all properties from this owner" link
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(226,232,240,0.6)'
          }
        },
        React.createElement(
          'h2',
          {
            style: {
              fontSize: '14px',
              fontWeight: '600',
              color: '#1A1F36',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          },
          React.createElement(Award, { size: 18, color: '#4F46E5' }),
          'Marketed by'
        ),
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }
          },
          React.createElement(
            'div',
            {
              style: {
                width: '56px',
                height: '56px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                flexShrink: 0,
                border: '1px solid #e2e8f0'
              }
            },
            business.logo_url
              ? React.createElement('img', {
                  src: business.logo_url,
                  alt: business.name,
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }
                })
              : React.createElement(
                  'div',
                  {
                    style: {
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4F46E5',
                      fontSize: '20px',
                      fontWeight: '700'
                    }
                  },
                  business.name.charAt(0).toUpperCase()
                )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1A1F36'
                }
              },
              business.name
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '13px',
                  color: '#64748B',
                  marginTop: '2px'
                }
              },
              business.address || business.city || 'Address not specified'
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginTop: '2px'
                }
              },
              'Member since ' + formatDate(business.created_at)
            )
          )
        )
      ),
      // FLOATING ACTION BUTTONS
      React.createElement(
        'div',
        {
          style: {
            position: 'fixed',
            bottom: isMobile ? '80px' : '32px',
            right: isMobile ? '16px' : '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 50
          }
        },
        business.phone &&
          React.createElement(
            'button',
            {
              onClick: () => setCallModalOpen(true),
              style: {
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.35)',
                transition: 'transform 0.2s'
              },
              onMouseEnter: (e) => { e.currentTarget.style.transform = 'scale(1.05)'; },
              onMouseLeave: (e) => { e.currentTarget.style.transform = 'scale(1)'; }
            },
            React.createElement(Phone, { size: 24 })
          ),
        bookingLimit.canBook &&
          React.createElement(
            'button',
            {
              onClick: () => {
                // FIXED: Use selectedRoom instead of always rooms[0]
                const roomToBook = selectedRoom || (rooms.length > 0 ? rooms[0] : null);
                if (roomToBook) {
                  openBookingModal(roomToBook);
                } else {
                  toast.error('No venues available for booking');
                }
              },
              style: {
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.35)',
                transition: 'transform 0.2s'
              },
              onMouseEnter: (e) => { e.currentTarget.style.transform = 'scale(1.05)'; },
              onMouseLeave: (e) => { e.currentTarget.style.transform = 'scale(1)'; }
            },
            React.createElement(CalendarDays, { size: 24 })
          )
      ),
      // CALL MODAL
      callModalOpen &&
        React.createElement(
          'div',
          {
            style: {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              backdropFilter: 'blur(4px)',
              padding: '16px'
            },
            onClick: (e) => {
              if (e.target === e.currentTarget) setCallModalOpen(false);
            }
          },
          React.createElement(
            'div',
            {
              style: {
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
              }
            },
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }
              },
              React.createElement(
                'h3',
                {
                  style: {
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1A1F36',
                    margin: 0
                  }
                },
                'Contact'
              ),
              React.createElement(
                'button',
                {
                  onClick: () => setCallModalOpen(false),
                  style: {
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#94a3b8'
                  }
                },
                React.createElement(X, { size: 24 })
              )
            ),
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }
              },
              business.phone &&
                React.createElement(
                  'div',
                  {
                    key: 'primary',
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }
                  },
                  React.createElement(Phone, { size: 20, color: '#4F46E5' }),
                  React.createElement(
                    'span',
                    {
                      style: {
                        flex: 1,
                        fontSize: '16px',
                        color: '#1A1F36',
                        fontWeight: '500'
                      }
                    },
                    business.phone
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: () => copyPhone(business.phone),
                      style: {
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        color: '#4F46E5',
                        fontSize: '13px',
                        fontWeight: '500'
                      }
                    },
                    'Copy'
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: () => {
                        window.location.href = `tel:${business.phone}`;
                      },
                      style: {
                        backgroundColor: '#4F46E5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }
                    },
                    'Call'
                  )
                )
            )
          )
        ),
      // BOOKING MODAL
      bookingModalOpen &&
        React.createElement(
          'div',
          {
            style: {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              backdropFilter: 'blur(4px)',
              padding: '16px',
              overflowY: 'auto'
            },
            onClick: (e) => {
              if (e.target === e.currentTarget && !bookingSubmitting) closeBookingModal();
            }
          },
          React.createElement(
            'div',
            {
              style: {
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                maxWidth: '520px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                position: 'relative'
              }
            },
            React.createElement(
              'button',
              {
                onClick: closeBookingModal,
                disabled: bookingSubmitting,
                style: {
                  position: 'sticky',
                  top: 0,
                  float: 'right',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#94a3b8',
                  zIndex: 10
                }
              },
              React.createElement(X, { size: 24 })
            ),
            React.createElement(
              'h2',
              {
                style: {
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1A1F36',
                  margin: '0 0 4px 0'
                }
              },
              'Book Now'
            ),
            selectedRoom &&
              React.createElement(
                'p',
                {
                  style: {
                    fontSize: '16px',
                    color: '#64748B',
                    margin: '0 0 20px 0'
                  }
                },
                React.createElement('span', { style: { fontWeight: '600', color: '#1A1F36' } }, selectedRoom.name),
                ` — ${formatCurrency(selectedRoom.price_per_night)} per day`,
                React.createElement(
                  'span',
                  {
                    style: {
                      display: 'block',
                      fontSize: '13px',
                      color: '#94a3b8',
                      marginTop: '4px'
                    }
                  },
                  'Capacity: ' + (selectedRoom.capacity || 'Contact venue for capacity')
                )
              ),
            React.createElement(
              'form',
              { onSubmit: handleBookingSubmit },
              React.createElement(
                'div',
                { style: { marginBottom: '16px' } },
                React.createElement(
                  'label',
                  {
                    style: {
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#475569',
                      marginBottom: '4px'
                    }
                  },
                  'Full Name *'
                ),
                React.createElement('input', {
                  type: 'text',
                  value: customerName,
                  onChange: (e) => setCustomerName(e.target.value),
                  placeholder: 'Enter your full name',
                  required: true,
                  style: {
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '15px',
                    outline: 'none'
                  },
                  onFocus: (e) => { e.currentTarget.style.borderColor = '#4F46E5'; },
                  onBlur: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }
                })
              ),
              React.createElement(
                'div',
                { style: { marginBottom: '16px' } },
                React.createElement(
                  'label',
                  {
                    style: {
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#475569',
                      marginBottom: '4px'
                    }
                  },
                  'Email Address *'
                ),
                React.createElement('input', {
                  type: 'email',
                  value: customerEmail,
                  onChange: (e) => setCustomerEmail(e.target.value),
                  placeholder: 'you@example.com',
                  required: true,
                  style: {
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '15px',
                    outline: 'none'
                  },
                  onFocus: (e) => { e.currentTarget.style.borderColor = '#4F46E5'; },
                  onBlur: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }
                })
              ),
              React.createElement(
                'div',
                { style: { marginBottom: '16px' } },
                React.createElement(
                  'label',
                  {
                    style: {
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#475569',
                      marginBottom: '4px'
                    }
                  },
                  'Phone Number *'
                ),
                React.createElement('input', {
                  type: 'tel',
                  value: customerPhone,
                  onChange: (e) => setCustomerPhone(e.target.value),
                  placeholder: '08012345678',
                  required: true,
                  style: {
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '15px',
                    outline: 'none'
                  },
                  onFocus: (e) => { e.currentTarget.style.borderColor = '#4F46E5'; },
                  onBlur: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }
                })
              ),
              React.createElement(
                'div',
                { style: { marginBottom: '16px' } },
                React.createElement(
                  'label',
                  {
                    style: {
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#475569',
                      marginBottom: '4px'
                    }
                  },
                  React.createElement(Calendar, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
                  'Event Date *'
                ),
                React.createElement('input', {
                  type: 'date',
                  value: eventDate,
                  onChange: (e) => setEventDate(e.target.value),
                  required: true,
                  min: new Date().toISOString().split('T')[0],
                  style: {
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '15px',
                    outline: 'none'
                  },
                  onFocus: (e) => { e.currentTarget.style.borderColor = '#4F46E5'; },
                  onBlur: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }
                }),
                React.createElement(
                  'p',
                  {
                    style: {
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginTop: '4px'
                    }
                  },
                  'Select the date for your event'
                )
              ),
              React.createElement(
                'div',
                { style: { marginBottom: '16px' } },
                React.createElement(
                  'label',
                  {
                    style: {
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#475569',
                      marginBottom: '4px'
                    }
                  },
                  'Payment Method'
                ),
                React.createElement(
                  'div',
                  {
                    style: {
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px'
                    }
                  },
                  React.createElement(
                    'button',
                    {
                      type: 'button',
                      onClick: () => setPaymentMethod('pay_at_venue'),
                      style: {
                        padding: '10px',
                        borderRadius: '10px',
                        border: paymentMethod === 'pay_at_venue' ? '2px solid #4F46E5' : '1px solid #e2e8f0',
                        backgroundColor: paymentMethod === 'pay_at_venue' ? '#EEF2FF' : 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: paymentMethod === 'pay_at_venue' ? '600' : '400',
                        color: paymentMethod === 'pay_at_venue' ? '#4F46E5' : '#475569'
                      }
                    },
                    'Pay at Venue'
                  ),
                  React.createElement(
                    'button',
                    {
                      type: 'button',
                      onClick: () => setPaymentMethod('paystack'),
                      style: {
                        padding: '10px',
                        borderRadius: '10px',
                        border: paymentMethod === 'paystack' ? '2px solid #4F46E5' : '1px solid #e2e8f0',
                        backgroundColor: paymentMethod === 'paystack' ? '#EEF2FF' : 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: paymentMethod === 'paystack' ? '600' : '400',
                        color: paymentMethod === 'paystack' ? '#4F46E5' : '#475569'
                      }
                    },
                    React.createElement(CreditCard, { size: 16, style: { display: 'inline', marginRight: '6px' } }),
                    'Pay Online'
                  )
                )
              ),
              React.createElement(
                'div',
                { style: { marginBottom: '16px' } },
                React.createElement(
                  'label',
                  {
                    style: {
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#475569',
                      marginBottom: '4px'
                    }
                  },
                  'Special Requests'
                ),
                React.createElement('textarea', {
                  value: specialRequests,
                  onChange: (e) => setSpecialRequests(e.target.value),
                  placeholder: 'Any special requests or notes...',
                  rows: 2,
                  style: {
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '15px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none'
                  },
                  onFocus: (e) => { e.currentTarget.style.borderColor = '#4F46E5'; },
                  onBlur: (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }
                })
              ),
              selectedRoom && eventDate &&
                React.createElement(
                  'div',
                  {
                    style: {
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px'
                    }
                  },
                  React.createElement(
                    'div',
                    {
                      style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        color: '#64748B'
                      }
                    },
                    React.createElement('span', null, 'Event Date'),
                    React.createElement('span', null, formatDate(eventDate))
                  ),
                  React.createElement(
                    'div',
                    {
                      style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #e2e8f0',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1A1F36'
                      }
                    },
                    React.createElement('span', null, 'Total'),
                    React.createElement('span', null, formatCurrency(selectedRoom.price_per_night))
                  ),
                  selectedRoom.capacity > 0 &&
                    React.createElement(
                      'div',
                      {
                        style: {
                          fontSize: '12px',
                          color: '#94a3b8',
                          textAlign: 'center',
                          marginTop: '8px'
                        }
                      },
                      'Capacity: ' + selectedRoom.capacity + ' guests'
                    )
                ),
              React.createElement(
                'button',
                {
                  type: 'submit',
                  disabled: bookingSubmitting,
                  style: {
                    width: '100%',
                    padding: '14px 0',
                    backgroundColor: bookingSubmitting ? '#94a3b8' : '#4F46E5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: bookingSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }
                },
                bookingSubmitting
                  ? React.createElement(React.Fragment, null,
                      React.createElement(Loader, { size: 20, className: 'animate-spin' }),
                      'Processing...'
                    )
                  : 'Confirm Booking'
              )
            )
          )
        ),
      // RECEIPT MODAL
      showReceipt && receiptData &&
        React.createElement(
          'div',
          {
            style: {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 300,
              backdropFilter: 'blur(8px)',
              padding: isMobile ? '12px' : '20px',
              overflowY: 'auto'
            },
            onClick: (e) => {
              if (e.target === e.currentTarget) {}
            }
          },
          React.createElement(BookingReceipt, {
            booking: {
              booking_reference: receiptData.bookingReference,
              customer_name: receiptData.customerName,
              customer_email: receiptData.customerEmail,
              customer_phone: receiptData.customerPhone,
              check_in_date: receiptData.eventDate,
              total_amount: receiptData.totalAmount,
              payment_method: receiptData.paymentMethod
            },
            business: receiptData.business,
            venue: receiptData.venue,
            onClose: closeReceipt,
            onPrint: printReceipt
          })
        ),
      // LIGHTBOX - Updated to use displayImages
      lightboxOpen && displayImages.length > 0 &&
        React.createElement(
          'div',
          {
            style: {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.92)',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '20px'
            },
            onClick: (e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }
          },
          React.createElement(
            'button',
            {
              onClick: closeLightbox,
              style: {
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                padding: '8px',
                zIndex: 10
              }
            },
            React.createElement(X, { size: 32 })
          ),
          React.createElement(
            'div',
            {
              style: {
                position: 'relative',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '70vh',
                overflow: 'hidden',
                borderRadius: '12px'
              }
            },
            React.createElement('img', {
              src: displayImages[lightboxIndex] || displayImages[0],
              alt: 'Gallery image',
              style: {
                width: '100%',
                height: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }
            }),
            displayImages.length > 1 &&
              React.createElement(React.Fragment, null,
                React.createElement(
                  'button',
                  {
                    onClick: goToPrevLightbox,
                    style: {
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '48px',
                      height: '48px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  },
                  React.createElement(ChevronLeft, { size: 28 })
                ),
                React.createElement(
                  'button',
                  {
                    onClick: goToNextLightbox,
                    style: {
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '48px',
                      height: '48px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  },
                  React.createElement(ChevronRight, { size: 28 })
                )
              )
          ),
          displayImages.length > 1 &&
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  gap: '8px',
                  marginTop: '16px',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  padding: '4px'
                }
              },
              displayImages.map((img, idx) =>
                React.createElement(
                  'div',
                  {
                    key: idx,
                    onClick: () => setLightboxIndex(idx),
                    style: {
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: lightboxIndex === idx ? '2px solid #4F46E5' : '2px solid transparent',
                      opacity: lightboxIndex === idx ? 1 : 0.5,
                      flexShrink: 0
                    }
                  },
                  React.createElement('img', {
                    src: img,
                    alt: `Thumbnail ${idx + 1}`,
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }
                  })
                )
              )
            )
        )
    )
  );
}

export default UnifiedBookingPage;