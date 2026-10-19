// FILE: client/src/UnifiedBookingPage.jsx
// BUSINESS-TYPE-AWARE BOOKING PAGE — SESSION 1 RESTYLE (19 Oct 2026, evening)
// RESTYLE ONLY: colours, radii, shadows, typography unified with Plazzaa
// marketing design. No logic, labels, flows, API URLs, or html2canvas
// behaviour changed. Every colour now flows through the PLZ token block
// so a future theme swap only touches one place in this file.
//
// Preserved from prior versions:
//  - Business-type-aware BOOKING_LABELS (unchanged)
//  - Receipt downloads as PNG via html2canvas (unchanged filename format)
//  - Receipt subtitle forced pure white on the header gradient (previous fix)
//  - Parent clips header corners, no white sliver (previous fix)
//  - Book Now uses selected venue, not rooms[0] (unchanged)

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

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
  Download,
  CheckCircle,
  ReceiptText,
  Banknote,
  CalendarCheck
} from 'lucide-react';

// ============================================================
// DESIGN TOKENS — matches Plazzaa marketing design
// WHY: single source of truth per file. A future global theme swap
// (Seam 7) only touches this block, not 45 scattered literals.
// ============================================================
const PLZ = {
  blue: '#2D60EA',           // primary action / active state
  blueDeep: '#1F47B4',       // hover / gradient start
  blueTint: '#E8F4FF',       // selected backgrounds, chip fills
  ink: '#18181B',            // headings
  body: '#52525B',           // body text
  muted: '#A1A1AA',          // helper text
  line: '#E4E4E7',           // borders
  surface: '#F4F4F5',        // card-on-card surface
  success: '#1B7F43',        // confirmed text
  successTint: '#E7F4EC',    // confirmed background
  warning: '#B0840F',        // pay-at-venue notice
  warningTint: '#FBF3DD',    // pay-at-venue background
  danger: '#C0395A',         // error icons
  radiusSm: '10px',
  radiusMd: '14px',
  radiusLg: '16px',
  radiusXl: '20px',
  font: "'Manrope', 'Inter', system-ui, -apple-system, sans-serif",
  shadowSm: '0 1px 3px rgba(15, 23, 42, 0.04)',
  shadowMd: '0 8px 24px rgba(15, 23, 42, 0.06)',
  shadowLg: '0 24px 64px rgba(15, 23, 42, 0.08)',
  backdrop: 'rgba(15, 23, 42, 0.6)'
};

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
// BUSINESS-TYPE-AWARE BOOKING LABELS
// UNCHANGED — single source of truth for all adaptive strings
// ============================================================
const BOOKING_LABELS = {
  // ============ STAYS ============
  hotel: {
    businessNoun: 'Hotel',
    itemNoun: 'Room',
    priceSuffix: 'per night',
    dateLabel: 'Check-in Date',
    dateHelper: 'When would you like to check in?',
    priceFieldLabel: 'Room Fee',
    ctaButton: 'Book Now',
    ctaShort: 'Book',
    receiptTitle: 'Booking Confirmed!',
    receiptSubtitle: 'Your booking has been confirmed successfully',
    totalLabel: 'Total',
    itemSummaryLabel: 'Room',
    dateSummaryLabel: 'Check-in'
  },
  apartment: {
    businessNoun: 'Apartment',
    itemNoun: 'Apartment',
    priceSuffix: 'per night',
    dateLabel: 'Check-in Date',
    dateHelper: 'When would you like to check in?',
    priceFieldLabel: 'Apartment Fee',
    ctaButton: 'Book Now',
    ctaShort: 'Book',
    receiptTitle: 'Booking Confirmed!',
    receiptSubtitle: 'Your booking has been confirmed successfully',
    totalLabel: 'Total',
    itemSummaryLabel: 'Apartment',
    dateSummaryLabel: 'Check-in'
  },
  event_hall: {
    businessNoun: 'Event Hall',
    itemNoun: 'Event Hall',
    priceSuffix: 'per event',
    dateLabel: 'Event Date',
    dateHelper: 'Select the date for your event',
    priceFieldLabel: 'Venue Fee',
    ctaButton: 'Book Now',
    ctaShort: 'Book',
    receiptTitle: 'Booking Confirmed!',
    receiptSubtitle: 'Your booking has been confirmed successfully',
    totalLabel: 'Total',
    itemSummaryLabel: 'Event Hall',
    dateSummaryLabel: 'Event Date'
  },
  // Legacy alias
  event: {
    businessNoun: 'Event Venue',
    itemNoun: 'Event Hall',
    priceSuffix: 'per event',
    dateLabel: 'Event Date',
    dateHelper: 'Select the date for your event',
    priceFieldLabel: 'Venue Fee',
    ctaButton: 'Book Now',
    ctaShort: 'Book',
    receiptTitle: 'Booking Confirmed!',
    receiptSubtitle: 'Your booking has been confirmed successfully',
    totalLabel: 'Total',
    itemSummaryLabel: 'Event Hall',
    dateSummaryLabel: 'Event Date'
  },

  // ============ FOOD ============
  restaurant: {
    businessNoun: 'Restaurant',
    itemNoun: 'Item',
    priceSuffix: '',
    dateLabel: 'Pickup / Delivery Date',
    dateHelper: 'When would you like your order?',
    priceFieldLabel: 'Item Total',
    ctaButton: 'Place Order',
    ctaShort: 'Order',
    receiptTitle: 'Order Confirmed!',
    receiptSubtitle: 'Your order has been placed successfully',
    totalLabel: 'Order Total',
    itemSummaryLabel: 'Item',
    dateSummaryLabel: 'Order Date'
  },
  diner: {
    businessNoun: 'Diner',
    itemNoun: 'Item',
    priceSuffix: '',
    dateLabel: 'Pickup / Delivery Date',
    dateHelper: 'When would you like your order?',
    priceFieldLabel: 'Item Total',
    ctaButton: 'Place Order',
    ctaShort: 'Order',
    receiptTitle: 'Order Confirmed!',
    receiptSubtitle: 'Your order has been placed successfully',
    totalLabel: 'Order Total',
    itemSummaryLabel: 'Item',
    dateSummaryLabel: 'Order Date'
  },
  cafe: {
    businessNoun: 'Cafe',
    itemNoun: 'Item',
    priceSuffix: '',
    dateLabel: 'Pickup Date',
    dateHelper: 'When would you like to pick up your order?',
    priceFieldLabel: 'Item Total',
    ctaButton: 'Place Order',
    ctaShort: 'Order',
    receiptTitle: 'Order Confirmed!',
    receiptSubtitle: 'Your order has been placed successfully',
    totalLabel: 'Order Total',
    itemSummaryLabel: 'Item',
    dateSummaryLabel: 'Order Date'
  },
  other_food: {
    businessNoun: 'Food Business',
    itemNoun: 'Item',
    priceSuffix: '',
    dateLabel: 'Pickup / Delivery Date',
    dateHelper: 'When would you like your order?',
    priceFieldLabel: 'Item Total',
    ctaButton: 'Place Order',
    ctaShort: 'Order',
    receiptTitle: 'Order Confirmed!',
    receiptSubtitle: 'Your order has been placed successfully',
    totalLabel: 'Order Total',
    itemSummaryLabel: 'Item',
    dateSummaryLabel: 'Order Date'
  },

  // ============ OTHERS ============
  sports: {
    businessNoun: 'Sports Facility',
    itemNoun: 'Court',
    priceSuffix: 'per hour',
    dateLabel: 'Booking Date',
    dateHelper: 'When would you like to book this court?',
    priceFieldLabel: 'Court Fee',
    ctaButton: 'Book Court',
    ctaShort: 'Book',
    receiptTitle: 'Booking Confirmed!',
    receiptSubtitle: 'Your court booking has been confirmed',
    totalLabel: 'Total',
    itemSummaryLabel: 'Court',
    dateSummaryLabel: 'Booking Date'
  },
  spa: {
    businessNoun: 'Spa',
    itemNoun: 'Service',
    priceSuffix: '',
    dateLabel: 'Appointment Date',
    dateHelper: 'When would you like your appointment?',
    priceFieldLabel: 'Service Fee',
    ctaButton: 'Book Appointment',
    ctaShort: 'Book',
    receiptTitle: 'Appointment Confirmed!',
    receiptSubtitle: 'Your appointment has been confirmed',
    totalLabel: 'Total',
    itemSummaryLabel: 'Service',
    dateSummaryLabel: 'Appointment Date'
  },
  beauty_salon: {
    businessNoun: 'Beauty Salon',
    itemNoun: 'Service',
    priceSuffix: '',
    dateLabel: 'Appointment Date',
    dateHelper: 'When would you like your appointment?',
    priceFieldLabel: 'Service Fee',
    ctaButton: 'Book Appointment',
    ctaShort: 'Book',
    receiptTitle: 'Appointment Confirmed!',
    receiptSubtitle: 'Your appointment has been confirmed',
    totalLabel: 'Total',
    itemSummaryLabel: 'Service',
    dateSummaryLabel: 'Appointment Date'
  },
  activity_place: {
    businessNoun: 'Activity Place',
    itemNoun: 'Activity',
    priceSuffix: '',
    dateLabel: 'Booking Date',
    dateHelper: 'When would you like to book this activity?',
    priceFieldLabel: 'Activity Fee',
    ctaButton: 'Book Now',
    ctaShort: 'Book',
    receiptTitle: 'Booking Confirmed!',
    receiptSubtitle: 'Your booking has been confirmed successfully',
    totalLabel: 'Total',
    itemSummaryLabel: 'Activity',
    dateSummaryLabel: 'Booking Date'
  }
};

// Fallback for unknown types
const DEFAULT_LABELS = {
  businessNoun: 'Business',
  itemNoun: 'Item',
  priceSuffix: '',
  dateLabel: 'Date',
  dateHelper: 'Select a date',
  priceFieldLabel: 'Total',
  ctaButton: 'Book Now',
  ctaShort: 'Book',
  receiptTitle: 'Booking Confirmed!',
  receiptSubtitle: 'Your booking has been confirmed successfully',
  totalLabel: 'Total',
  itemSummaryLabel: 'Item',
  dateSummaryLabel: 'Date'
};

function getBookingLabels(businessType) {
  return BOOKING_LABELS[businessType] || DEFAULT_LABELS;
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
// RECEIPT COMPONENT (Business-type-aware) — restyled only
// ============================================================
function BookingReceipt({ booking, business, venue, labels, onClose, onDownload, downloading }) {
  const isMobile = window.innerWidth < 640;
  const receiptRef = useRef(null);

  // WHY: outer card owns the border-radius and clips its children.
  // The header no longer sets its own corner radii — that's what caused
  // the 1-pixel white sliver at the top edge (sub-pixel rounding between
  // two elements with slightly different radii). PRESERVED.
  const receiptStyle = {
    backgroundColor: 'white',
    borderRadius: isMobile ? PLZ.radiusLg : PLZ.radiusXl,
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: PLZ.shadowLg,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  };

  // WHY: inner scroll wrapper so the header stays attached visually to the
  // card (no gap), and the body scrolls without affecting the clipped edge.
  const scrollWrapperStyle = {
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    // WHY: gradient now runs blueDeep → blue so the customer-facing receipt
    // reads Plazzaa to the recipient (was indigo → indigo-light before).
    background: `linear-gradient(135deg, ${PLZ.blueDeep} 0%, ${PLZ.blue} 100%)`,
    padding: isMobile ? '24px 20px 20px' : '32px 32px 24px',
    // WHY: no per-corner radius here. Parent's overflow:hidden + borderRadius clip this cleanly.
    textAlign: 'center',
    color: '#FFFFFF',
    flexShrink: 0
  };

  const bodyStyle = { padding: isMobile ? '20px' : '24px' };
  const sectionStyle = { marginBottom: '20px' };

  const sectionTitleStyle = {
    fontSize: isMobile ? '12px' : '13px',
    fontWeight: '600',
    color: PLZ.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px'
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: isMobile ? '8px 0' : '10px 0',
    borderBottom: `1px solid ${PLZ.line}`,
    gap: '12px'
  };

  const labelStyle = { fontSize: isMobile ? '13px' : '14px', color: PLZ.muted };
  const valueStyle = { fontSize: isMobile ? '13px' : '14px', fontWeight: '500', color: PLZ.ink, textAlign: 'right' };

  const totalStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: isMobile ? '12px 0' : '16px 0',
    borderTop: `2px solid ${PLZ.line}`,
    marginTop: '8px'
  };

  const totalLabelStyle = { fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: PLZ.ink };
  const totalValueStyle = { fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: PLZ.blue };

  const statusBadgeStyle = {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '999px',
    backgroundColor: PLZ.successTint,
    color: PLZ.success,
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.2px'
  };

  const isFoodOrService = labels.priceSuffix === '' && labels.businessNoun !== 'Event Hall';

  return React.createElement(
    'div',
    { style: receiptStyle },
    React.createElement(
      'div',
      { style: scrollWrapperStyle, ref: receiptRef },
      // Header
      React.createElement(
        'div',
        { style: headerStyle },
        React.createElement(
          'div',
          { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' } },
          React.createElement(CheckCircle, { size: isMobile ? 32 : 40, color: '#FFFFFF' }),
          React.createElement(
            'h2',
            { style: { fontSize: isMobile ? '20px' : '24px', fontWeight: '700', margin: 0, color: '#FFFFFF' } },
            labels.receiptTitle
          )
        ),
        // WHY: subtitle is forced to #FFFFFF with opacity 1 so it reads crisp
        // white against the blue, not a washed-out grey. PRESERVED.
        React.createElement(
          'p',
          { style: { fontSize: isMobile ? '13px' : '15px', opacity: 1, margin: 0, color: '#FFFFFF' } },
          labels.receiptSubtitle
        )
      ),
      // Body
      React.createElement(
        'div',
        { style: bodyStyle },
        // Status + Reference
        React.createElement(
          'div',
          { style: { ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } },
          React.createElement('span', { style: statusBadgeStyle }, 'Confirmed'),
          React.createElement(
            'span',
            { style: { fontSize: '13px', color: PLZ.muted, fontWeight: '500' } },
            'Ref: ' + (booking?.booking_reference || generateOrderId())
          )
        ),
        // Item / Venue Details
        React.createElement(
          'div',
          { style: sectionStyle },
          React.createElement(
            'h4',
            { style: sectionTitleStyle },
            React.createElement(Building2, { size: 14, style: { display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' } }),
            labels.businessNoun + ' Details'
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '4px', fontSize: isMobile ? '16px' : '18px', fontWeight: '600', color: PLZ.ink } },
            venue?.name || business?.name
          ),
          (venue?.address || business?.address || business?.city) &&
            React.createElement(
              'div',
              { style: { fontSize: '13px', color: PLZ.muted } },
              venue?.address || business?.address || business?.city
            )
        ),
        // Customer Details
        React.createElement(
          'div',
          { style: sectionStyle },
          React.createElement(
            'h4',
            { style: sectionTitleStyle },
            React.createElement(User, { size: 14, style: { display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' } }),
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
        // Booking Details
        React.createElement(
          'div',
          { style: sectionStyle },
          React.createElement(
            'h4',
            { style: sectionTitleStyle },
            React.createElement(CalendarCheck, { size: 14, style: { display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' } }),
            labels.itemNoun + ' Details'
          ),
          React.createElement(
            'div',
            { style: rowStyle },
            React.createElement('span', { style: labelStyle }, labels.dateSummaryLabel),
            React.createElement('span', { style: valueStyle }, formatDate(booking?.check_in_date || ''))
          ),
          React.createElement(
            'div',
            { style: rowStyle },
            React.createElement('span', { style: labelStyle }, labels.itemSummaryLabel),
            React.createElement('span', { style: valueStyle }, venue?.name || '')
          ),
          React.createElement(
            'div',
            { style: { ...rowStyle, borderBottom: 'none' } },
            React.createElement('span', { style: labelStyle }, 'Payment Method'),
            React.createElement('span', { style: valueStyle },
              booking?.payment_method === 'paystack' ? 'Pay Online' : (isFoodOrService ? 'Pay on Pickup' : 'Pay at Venue')
            )
          )
        ),
        // Payment Summary
        React.createElement(
          'div',
          { style: sectionStyle },
          React.createElement(
            'h4',
            { style: sectionTitleStyle },
            React.createElement(Banknote, { size: 14, style: { display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' } }),
            'Payment Summary'
          ),
          React.createElement(
            'div',
            { style: rowStyle },
            React.createElement('span', { style: labelStyle }, labels.priceFieldLabel),
            React.createElement('span', { style: valueStyle }, formatCurrency(booking?.total_amount || 0))
          ),
          React.createElement(
            'div',
            { style: totalStyle },
            React.createElement('span', { style: totalLabelStyle }, labels.totalLabel),
            React.createElement('span', { style: totalValueStyle }, formatCurrency(booking?.total_amount || 0))
          ),
          booking?.payment_method === 'paystack' ?
            React.createElement(
              'div',
              { style: { marginTop: '12px', padding: '12px', backgroundColor: PLZ.successTint, borderRadius: PLZ.radiusSm, textAlign: 'center', fontSize: '13px', color: PLZ.success } },
              React.createElement(CheckCircle, { size: 16, style: { display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' } }),
              'Payment processed successfully'
            ) :
            React.createElement(
              'div',
              { style: { marginTop: '12px', padding: '12px', backgroundColor: PLZ.warningTint, borderRadius: PLZ.radiusSm, textAlign: 'center', fontSize: '13px', color: PLZ.warning } },
              isFoodOrService ? 'Pay on pickup or delivery' : 'Pay at venue on the day of your event'
            )
        ),
        // Actions
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '12px', marginTop: '20px', flexDirection: isMobile ? 'column' : 'row' } },
          React.createElement(
            'button',
            {
              onClick: () => onDownload(receiptRef.current, booking?.booking_reference),
              disabled: downloading,
              style: {
                flex: 1,
                padding: isMobile ? '13px' : '14px',
                backgroundColor: PLZ.surface,
                color: downloading ? PLZ.muted : PLZ.body,
                border: `1px solid ${PLZ.line}`,
                borderRadius: PLZ.radiusMd,
                fontSize: '14px',
                fontWeight: '600',
                cursor: downloading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }
            },
            downloading
              ? React.createElement(Loader, { size: 18, style: { animation: 'spin 1s linear infinite' } })
              : React.createElement(Download, { size: 18 }),
            downloading ? 'Preparing...' : 'Download Receipt'
          ),
          React.createElement(
            'button',
            {
              onClick: onClose,
              disabled: downloading,
              style: {
                flex: 1,
                padding: isMobile ? '13px' : '14px',
                backgroundColor: PLZ.blue,
                color: 'white',
                border: 'none',
                borderRadius: PLZ.radiusMd,
                fontSize: '14px',
                fontWeight: '600',
                cursor: downloading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(45, 96, 234, 0.25)',
                transition: 'all 0.2s ease'
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
              textAlign: 'center', fontSize: '12px', color: PLZ.muted,
              marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${PLZ.line}`
            }
          },
          'A confirmation email has been sent to your inbox'
        )
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
  // STATE — UNCHANGED
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

  // Receipt
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  // Call modal
  const [callModalOpen, setCallModalOpen] = useState(false);

  // ============================================================
  // FETCH DATA — UNCHANGED
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
  // BUSINESS-TYPE-AWARE LABELS — UNCHANGED
  // ============================================================
  const labels = getBookingLabels(business?.business_type);

  // ============================================================
  // GALLERY — UNCHANGED
  // ============================================================
  const displayImages = (selectedRoom?.images || []).filter(Boolean);
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
  // VENUE SELECTION — UNCHANGED
  // ============================================================
  function selectVenue(index) {
    if (rooms[index]) {
      setSelectedRoom(rooms[index]);
      setSelectedRoomIndex(index);
      setGalleryMainIndex(0);
    }
  }

  // ============================================================
  // BOOKING HANDLERS — UNCHANGED
  // ============================================================
  function openBookingModal(room) {
    if (!bookingLimit.canBook) {
      toast.error('This business has reached its booking limit. Please contact them directly.');
      return;
    }
    const roomToBook = room || selectedRoom || (rooms.length > 0 ? rooms[0] : null);
    if (!roomToBook) {
      toast.error('No ' + labels.itemNoun.toLowerCase() + ' selected');
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
      toast.error('Please select an ' + labels.itemNoun.toLowerCase());
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
      toast.error('Please select a ' + labels.dateLabel.toLowerCase());
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(eventDate);
    if (selectedDate < today) {
      toast.error(labels.dateLabel + ' cannot be in the past');
      return;
    }

    setBookingSubmitting(true);

    const totalAmount = selectedRoom.price_per_night || selectedRoom.base_price || 0;

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
  // RECEIPT / CALL — UNCHANGED
  // ============================================================
  function closeReceipt() {
    setShowReceipt(false);
    setReceiptData(null);
  }

  // WHY: html2canvas captures the receipt node as a PNG. PRESERVED exactly —
  // same options, same filename format. Restyle only touched the receipt's
  // internal colours, not the capture behaviour.
  async function downloadReceipt(node, bookingReference) {
    if (!node) {
      toast.error('Receipt not ready. Please try again.');
      return;
    }
    setDownloadingReceipt(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight
      });

      const dataUrl = canvas.toDataURL('image/png');
      const filename = `Plazzaa-Receipt-${(bookingReference || 'booking').replace(/[^A-Za-z0-9-]/g, '')}.png`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Receipt downloaded');
    } catch (error) {
      console.error('Download receipt error:', error);
      toast.error('Could not download receipt. Please try again.');
    } finally {
      setDownloadingReceipt(false);
    }
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

  const isMobile = window.innerWidth < 640;

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return React.createElement('div', {
      style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: PLZ.surface }
    },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  if (!business) {
    return React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', backgroundColor: PLZ.surface } },
      React.createElement(AlertCircle, { size: 48, color: PLZ.danger }),
      React.createElement('h2', { style: { marginTop: '16px', color: PLZ.ink } }, 'Business Not Found'),
      React.createElement('p', { style: { color: PLZ.muted } }, 'The business you\'re looking for doesn\'t exist.'),
      React.createElement('button', {
        onClick: () => navigate('/'),
        style: { marginTop: '20px', padding: '12px 24px', backgroundColor: PLZ.blue, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, cursor: 'pointer', fontSize: '16px' }
      }, 'Go Home')
    );
  }

  if (rooms.length === 0) {
    return React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', backgroundColor: PLZ.surface, padding: '20px' } },
      React.createElement(Building2, { size: 48, color: PLZ.muted }),
      React.createElement('h2', { style: { marginTop: '16px', color: PLZ.ink } }, 'Nothing Available Yet'),
      React.createElement('p', { style: { color: PLZ.muted, textAlign: 'center' } },
        'This ' + labels.businessNoun.toLowerCase() + ' hasn\'t listed anything yet. Check back later!'
      ),
      React.createElement('button', {
        onClick: () => navigate('/'),
        style: { marginTop: '20px', padding: '12px 24px', backgroundColor: PLZ.blue, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, cursor: 'pointer', fontSize: '16px' }
      }, 'Go Home')
    );
  }

  // ============================================================
  // COMPUTED DATA — UNCHANGED
  // ============================================================
  const venue = selectedRoom || rooms[0];
  const venueName = venue?.name || business.name;
  const venueAddress = venue?.address || business.address || business.city || '';
  const venuePrice = venue?.price_per_night || venue?.base_price || 0;
  const venueDescription = venue?.description || venue?.venue_description || '';

  const venueFeatures = venue?.features || [];
  const venueAmenities = venue?.amenities || [];
  const venueAreaGuide = venue?.area_guide || [];

  const venuePropertyDetails = {
    ref_id: venue?.ref_id || '',
    property_type: venue?.property_type || '',
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

  const hasPropertyDetails = venuePropertyDetails.ref_id ||
    venuePropertyDetails.property_type ||
    venuePropertyDetails.bedrooms > 0 ||
    venuePropertyDetails.bathrooms > 0 ||
    venuePropertyDetails.parking_spaces > 0 ||
    venuePropertyDetails.year_built ||
    venuePropertyDetails.property_size;

  const hasFeaturesOrAmenities = venueFeatures.length > 0 || venueAmenities.length > 0;
  const hasAreaGuide = venueAreaGuide.length > 0;

  // ============================================================
  // RENDER: MAIN
  // ============================================================
  return React.createElement(
    'div',
    {
      className: 'unified-booking-page',
      style: {
        minHeight: '100vh',
        backgroundColor: PLZ.surface,
        // WHY: Manrope first, Inter fallback — matches marketing pages.
        fontFamily: PLZ.font
      }
    },
    // HEADER
    React.createElement(
      'div',
      {
        style: {
          position: 'sticky', top: 0, zIndex: 100,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderBottom: `1px solid ${PLZ.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
        }
      },
      React.createElement('span', {
        style: {
          fontSize: '14px', color: PLZ.muted, fontWeight: '400',
          flex: 1, textAlign: 'center',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }
      }, venueName),
      React.createElement('button', {
        onClick: () => {
          if (navigator.share) {
            navigator.share({ title: venueName, url: window.location.href });
          }
        },
        style: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: PLZ.muted }
      }, React.createElement(Share2, { size: 20 }))
    ),

    // ITEM SELECTOR
    rooms.length > 1 &&
      React.createElement(
        'div',
        {
          style: {
            display: 'flex', gap: '8px', overflowX: 'auto',
            padding: '12px 16px', backgroundColor: 'white',
            borderBottom: `1px solid ${PLZ.line}`
          }
        },
        rooms.map((room, idx) =>
          React.createElement('button', {
            key: room.id,
            onClick: () => selectVenue(idx),
            style: {
              padding: '6px 16px', borderRadius: '999px',
              border: selectedRoomIndex === idx ? `2px solid ${PLZ.blue}` : `1px solid ${PLZ.line}`,
              backgroundColor: selectedRoomIndex === idx ? PLZ.blueTint : 'white',
              color: selectedRoomIndex === idx ? PLZ.blue : PLZ.muted,
              fontSize: '13px',
              fontWeight: selectedRoomIndex === idx ? '600' : '400',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
            }
          }, room.name)
        )
      ),

    // MAIN CONTENT
    React.createElement(
      'div',
      {
        style: {
          maxWidth: '1200px', margin: '0 auto',
          padding: '16px 16px 100px', width: '100%'
        }
      },
      // ITEM INFO HEADER
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white', borderRadius: PLZ.radiusLg, padding: '20px',
            marginBottom: '16px',
            boxShadow: PLZ.shadowSm,
            border: `1px solid ${PLZ.line}`
          }
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px'
            }
          },
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' } },
              React.createElement('span', {
                style: {
                  backgroundColor: PLZ.blue, color: 'white',
                  padding: '2px 12px', borderRadius: '999px',
                  fontSize: '10px', fontWeight: '600', textTransform: 'uppercase'
                }
              }, labels.businessNoun)
            ),
            React.createElement('h1', {
              style: {
                fontSize: isMobile ? '22px' : '28px',
                fontWeight: '700', color: PLZ.ink, margin: '4px 0 4px 0'
              }
            }, venueName),
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex', alignItems: 'center', gap: '12px',
                  flexWrap: 'wrap', fontSize: '13px', color: PLZ.muted
                }
              },
              venueAddress && React.createElement(
                'span',
                { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                React.createElement(MapPin, { size: 14 }),
                venueAddress
              ),
              venuePropertyDetails.ref_id && React.createElement(
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
                textAlign: 'right', minWidth: '100px',
                backgroundColor: PLZ.blueTint, padding: '8px 16px', borderRadius: PLZ.radiusMd
              }
            },
            React.createElement('div', {
              style: { fontSize: isMobile ? '20px' : '28px', fontWeight: '700', color: PLZ.blue }
            }, formatCurrency(venuePrice)),
            labels.priceSuffix && React.createElement('div', {
              style: { fontSize: '12px', color: PLZ.muted }
            }, labels.priceSuffix)
          )
        ),
        business.phone &&
          React.createElement(
            'div',
            {
              style: {
                marginTop: '12px', paddingTop: '12px',
                borderTop: `1px solid ${PLZ.line}`,
                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
              }
            },
            React.createElement('button', {
              onClick: () => setCallModalOpen(true),
              style: {
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', backgroundColor: PLZ.blue, color: 'white',
                border: 'none', borderRadius: PLZ.radiusSm, fontSize: '14px', fontWeight: '500', cursor: 'pointer'
              }
            },
              React.createElement(Phone, { size: 16 }),
              'Call ' + labels.businessNoun
            ),
            React.createElement('span', { style: { fontSize: '13px', color: PLZ.muted } }, business.phone)
          )
      ),

      // GALLERY — structure preserved exactly; only borders/backgrounds retinted
      React.createElement(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gridTemplateRows: isMobile ? 'auto' : 'auto auto',
            gap: '4px', borderRadius: PLZ.radiusMd, overflow: 'hidden',
            backgroundColor: PLZ.line, marginBottom: '16px'
          }
        },
        // Main image
        React.createElement(
          'div',
          {
            style: {
              position: 'relative',
              gridRow: isMobile ? '1' : '1 / 3',
              gridColumn: isMobile ? '1' : '1',
              aspectRatio: isMobile ? '4/3' : '3/2',
              cursor: displayImages.length > 0 ? 'pointer' : 'default',
              overflow: 'hidden', backgroundColor: PLZ.surface
            },
            onClick: () => {
              if (displayImages.length > 0) openLightbox(galleryMainIndex);
            }
          },
          displayImages.length > 0 && displayImages[galleryMainIndex]
            ? React.createElement('img', {
                src: displayImages[galleryMainIndex],
                alt: venueName,
                style: { width: '100%', height: '100%', objectFit: 'cover' }
              })
            : React.createElement(
                'div',
                {
                  style: {
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    color: PLZ.muted, backgroundColor: PLZ.surface, padding: '20px'
                  }
                },
                React.createElement(Camera, { size: 48, color: PLZ.muted }),
                React.createElement('h3', {
                  style: { marginTop: '16px', fontSize: '18px', fontWeight: '600', color: PLZ.body }
                }, 'No Images Yet'),
                React.createElement('p', {
                  style: { fontSize: '14px', color: PLZ.muted, textAlign: 'center', maxWidth: '300px' }
                }, 'This ' + labels.itemNoun.toLowerCase() + ' has no images yet.')
              ),
          displayImages.length > 1 &&
            React.createElement('button', {
              onClick: (e) => { e.stopPropagation(); goToPrevMain(); },
              style: {
                position: 'absolute', left: '8px', top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)', color: 'white',
                border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }
            }, React.createElement(ChevronLeft, { size: 18 })),
          displayImages.length > 1 &&
            React.createElement('button', {
              onClick: (e) => { e.stopPropagation(); goToNextMain(); },
              style: {
                position: 'absolute', right: '8px', top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)', color: 'white',
                border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }
            }, React.createElement(ChevronRight, { size: 18 })),
          displayImages.length > 1 &&
            React.createElement('div', {
              style: {
                position: 'absolute', bottom: '8px', left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                padding: '2px 10px', borderRadius: '999px', fontSize: '11px'
              }
            }, `${galleryMainIndex + 1} / ${displayImages.length}`)
        ),
        // Desktop thumbnails
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
                  cursor: 'pointer', overflow: 'hidden', backgroundColor: PLZ.line
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
                src: img, alt: `Thumbnail ${idx + 1}`,
                style: { width: '100%', height: '100%', objectFit: 'cover' }
              }),
              isLastThumb && React.createElement('div', {
                style: {
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '20px', fontWeight: '700'
                }
              }, `+${remainingImages}`)
            );
          }),
        // Mobile thumbnails
        isMobile && displayImages.length > 1 &&
          React.createElement(
            'div',
            {
              style: {
                display: 'flex', gap: '4px', padding: '4px',
                overflowX: 'auto', backgroundColor: 'white', gridRow: '2'
              }
            },
            displayImages.map((img, idx) =>
              React.createElement('div', {
                key: idx,
                style: {
                  flexShrink: 0, width: '60px', height: '60px',
                  borderRadius: '4px', overflow: 'hidden', cursor: 'pointer',
                  border: galleryMainIndex === idx ? `2px solid ${PLZ.blue}` : '2px solid transparent'
                },
                onClick: () => setGalleryMainIndex(idx)
              },
                React.createElement('img', {
                  src: img, alt: `Thumbnail ${idx + 1}`,
                  style: { width: '100%', height: '100%', objectFit: 'cover' }
                })
              )
            )
          )
      ),

      // TYPE ICON CARD
      (venuePropertyDetails.property_type || venuePropertyDetails.parking_spaces > 0) &&
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white', borderRadius: PLZ.radiusMd, padding: '12px 16px',
              marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
              boxShadow: PLZ.shadowSm,
              border: `1px solid ${PLZ.line}`
            }
          },
          venuePropertyDetails.property_type && React.createElement(
            'span',
            { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: PLZ.body } },
            React.createElement(Building, { size: 18, color: PLZ.blue }),
            venuePropertyDetails.property_type
          ),
          venuePropertyDetails.parking_spaces > 0 && React.createElement(
            'span',
            { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: PLZ.body } },
            React.createElement(Car, { size: 18, color: PLZ.blue }),
            venuePropertyDetails.parking_spaces + ' Parking Spaces'
          ),
          venuePropertyDetails.furnishing_status && venuePropertyDetails.furnishing_status !== 'unfurnished' && React.createElement(
            'span',
            { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: PLZ.body } },
            React.createElement(Sofa, { size: 18, color: PLZ.blue }),
            furnishingDisplay
          )
        ),

      // DESCRIPTION
      venueDescription && React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white', borderRadius: PLZ.radiusMd, padding: '16px',
            marginBottom: '12px', boxShadow: PLZ.shadowSm,
            border: `1px solid ${PLZ.line}`
          }
        },
        React.createElement('h2', {
          style: { fontSize: '16px', fontWeight: '600', color: PLZ.ink, margin: '0 0 8px 0' }
        }, 'About This ' + labels.itemNoun),
        React.createElement('p', {
          style: {
            fontSize: '14px', color: PLZ.body, lineHeight: '1.7', margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: showFullDescription ? 'none' : 4,
            WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }
        }, venueDescription),
        venueDescription.length > 200 && React.createElement('button', {
          onClick: () => setShowFullDescription(!showFullDescription),
          style: {
            background: 'none', border: 'none', color: PLZ.blue,
            cursor: 'pointer', fontSize: '13px', fontWeight: '500',
            padding: '4px 0', marginTop: '4px'
          }
        }, showFullDescription ? 'Show less' : 'Show full description')
      ),

      // FEATURES & AMENITIES
      hasFeaturesOrAmenities && React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white', borderRadius: PLZ.radiusMd, padding: '16px',
            marginBottom: '12px', boxShadow: PLZ.shadowSm,
            border: `1px solid ${PLZ.line}`
          }
        },
        React.createElement('h2', {
          style: { fontSize: '16px', fontWeight: '600', color: PLZ.ink, margin: '0 0 12px 0' }
        }, 'Features & Amenities'),
        // Features
        venueFeatures.length > 0 && React.createElement('div', { style: { marginBottom: '16px' } },
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
            return React.createElement('div', { key: cat, style: { marginBottom: '8px' } },
              React.createElement('h3', {
                style: { fontSize: '13px', fontWeight: '600', color: PLZ.body, margin: '0 0 6px 0' }
              }, catLabels[cat] || cat),
              React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
                catFeatures.map((f, idx) =>
                  React.createElement('span', {
                    key: idx,
                    style: {
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', backgroundColor: PLZ.blueTint,
                      borderRadius: '16px', fontSize: '12px', color: PLZ.blue
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
        // Amenities
        venueAmenities.length > 0 && React.createElement('div', null,
          ['interior', 'safety', 'outdoor', 'utilities'].map(cat => {
            const catAmenities = venueAmenities.filter(a => a.category === cat);
            if (catAmenities.length === 0) return null;
            const catLabels = {
              interior: '🏠 Interior & Finishing',
              safety: '🛡️ Security & Safety',
              outdoor: '🌳 Outdoor & Communal',
              utilities: '⚡ Power & Utilities'
            };
            return React.createElement('div', { key: cat, style: { marginBottom: '8px' } },
              React.createElement('h3', {
                style: { fontSize: '13px', fontWeight: '600', color: PLZ.body, margin: '0 0 6px 0' }
              }, catLabels[cat] || cat),
              React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
                catAmenities.map((a, idx) =>
                  React.createElement('span', {
                    key: idx,
                    style: {
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', backgroundColor: PLZ.surface,
                      borderRadius: '16px', fontSize: '12px', color: PLZ.body
                    }
                  },
                    React.createElement(Check, { size: 12, color: PLZ.blue }),
                    a.name
                  )
                )
              )
            );
          })
        )
      ),

      // PROPERTY DETAILS
      hasPropertyDetails && React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white', borderRadius: PLZ.radiusMd, padding: '16px',
            marginBottom: '12px', boxShadow: PLZ.shadowSm,
            border: `1px solid ${PLZ.line}`
          }
        },
        React.createElement('h2', {
          style: { fontSize: '16px', fontWeight: '600', color: PLZ.ink, margin: '0 0 12px 0' }
        }, 'Details'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '6px 16px'
          }
        },
          venuePropertyDetails.ref_id && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${PLZ.line}` } },
            React.createElement('span', { style: { color: PLZ.muted, fontSize: '13px' } }, 'Reference ID'),
            React.createElement('span', { style: { color: PLZ.ink, fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.ref_id)
          ),
          venuePropertyDetails.property_type && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${PLZ.line}` } },
            React.createElement('span', { style: { color: PLZ.muted, fontSize: '13px' } }, 'Property Type'),
            React.createElement('span', { style: { color: PLZ.ink, fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.property_type)
          ),
          venuePropertyDetails.bedrooms > 0 && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${PLZ.line}` } },
            React.createElement('span', { style: { color: PLZ.muted, fontSize: '13px' } }, 'Bedrooms'),
            React.createElement('span', { style: { color: PLZ.ink, fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.bedrooms)
          ),
          venuePropertyDetails.bathrooms > 0 && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${PLZ.line}` } },
            React.createElement('span', { style: { color: PLZ.muted, fontSize: '13px' } }, 'Bathrooms'),
            React.createElement('span', { style: { color: PLZ.ink, fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.bathrooms)
          ),
          venuePropertyDetails.parking_spaces > 0 && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${PLZ.line}` } },
            React.createElement('span', { style: { color: PLZ.muted, fontSize: '13px' } }, 'Parking Spaces'),
            React.createElement('span', { style: { color: PLZ.ink, fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.parking_spaces)
          ),
          venuePropertyDetails.property_size && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${PLZ.line}` } },
            React.createElement('span', { style: { color: PLZ.muted, fontSize: '13px' } }, 'Property Size'),
            React.createElement('span', { style: { color: PLZ.ink, fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.property_size)
          ),
          venuePropertyDetails.year_built && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${PLZ.line}` } },
            React.createElement('span', { style: { color: PLZ.muted, fontSize: '13px' } }, 'Year Built'),
            React.createElement('span', { style: { color: PLZ.ink, fontSize: '13px', fontWeight: '500' } }, venuePropertyDetails.year_built)
          ),
          statusDisplay && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${PLZ.line}` } },
            React.createElement('span', { style: { color: PLZ.muted, fontSize: '13px' } }, 'Listing Status'),
            React.createElement('span', { style: { color: PLZ.ink, fontSize: '13px', fontWeight: '500' } }, statusDisplay)
          )
        )
      ),

      // AREA GUIDE
      hasAreaGuide && React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white', borderRadius: PLZ.radiusMd, padding: '16px',
            marginBottom: '12px', boxShadow: PLZ.shadowSm,
            border: `1px solid ${PLZ.line}`
          }
        },
        React.createElement('h2', {
          style: { fontSize: '16px', fontWeight: '600', color: PLZ.ink, margin: '0 0 12px 0' }
        }, 'Area Guide'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '12px'
          }
        },
          venueAreaGuide.map((section, idx) =>
            React.createElement('div', {
              key: idx,
              style: {
                backgroundColor: PLZ.surface, borderRadius: PLZ.radiusSm,
                padding: '14px', border: `1px solid ${PLZ.line}`
              }
            },
              React.createElement('h3', {
                style: { fontSize: '14px', fontWeight: '600', color: PLZ.ink, margin: '0 0 4px 0' }
              }, section.title || 'Section'),
              React.createElement('p', {
                style: { fontSize: '13px', color: PLZ.body, lineHeight: '1.6', margin: 0 }
              }, section.content || '')
            )
          )
        )
      ),

      // MARKETED BY CARD
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white', borderRadius: PLZ.radiusMd, padding: '16px',
            marginBottom: '12px', boxShadow: PLZ.shadowSm,
            border: `1px solid ${PLZ.line}`
          }
        },
        React.createElement('h2', {
          style: {
            fontSize: '14px', fontWeight: '600', color: PLZ.ink,
            margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px'
          }
        },
          React.createElement(Award, { size: 18, color: PLZ.blue }),
          'Marketed by'
        ),
        React.createElement('div', {
          style: { display: 'flex', gap: '16px', alignItems: 'flex-start' }
        },
          React.createElement('div', {
            style: {
              width: '56px', height: '56px', borderRadius: PLZ.radiusSm,
              overflow: 'hidden', backgroundColor: PLZ.surface,
              flexShrink: 0, border: `1px solid ${PLZ.line}`
            }
          },
            business.logo_url
              ? React.createElement('img', {
                  src: business.logo_url, alt: business.name,
                  style: { width: '100%', height: '100%', objectFit: 'cover' }
                })
              : React.createElement('div', {
                  style: {
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: PLZ.blue, fontSize: '20px', fontWeight: '700'
                  }
                }, business.name.charAt(0).toUpperCase())
          ),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', {
              style: { fontSize: '16px', fontWeight: '600', color: PLZ.ink }
            }, business.name),
            (business.address || business.city) && React.createElement('div', {
              style: { fontSize: '13px', color: PLZ.muted, marginTop: '2px' }
            }, business.address || business.city),
            React.createElement('div', {
              style: { fontSize: '12px', color: PLZ.muted, marginTop: '2px' }
            }, 'Member since ' + formatDate(business.created_at))
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
            display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 50
          }
        },
        business.phone && React.createElement('button', {
          onClick: () => setCallModalOpen(true),
          style: {
            backgroundColor: PLZ.blue, color: 'white',
            border: 'none', borderRadius: '50%',
            width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(45, 96, 234, 0.35)',
            transition: 'transform 0.2s'
          },
          onMouseEnter: (e) => { e.currentTarget.style.transform = 'scale(1.05)'; },
          onMouseLeave: (e) => { e.currentTarget.style.transform = 'scale(1)'; }
        }, React.createElement(Phone, { size: 24 })),
        bookingLimit.canBook && React.createElement('button', {
          onClick: () => {
            const roomToBook = selectedRoom || (rooms.length > 0 ? rooms[0] : null);
            if (roomToBook) {
              openBookingModal(roomToBook);
            } else {
              toast.error('Nothing available for booking');
            }
          },
          style: {
            backgroundColor: PLZ.blue, color: 'white',
            border: 'none', borderRadius: '50%',
            width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(45, 96, 234, 0.35)',
            transition: 'transform 0.2s'
          },
          onMouseEnter: (e) => { e.currentTarget.style.transform = 'scale(1.05)'; },
          onMouseLeave: (e) => { e.currentTarget.style.transform = 'scale(1)'; }
        }, React.createElement(CalendarDays, { size: 24 }))
      ),

      // CALL MODAL
      callModalOpen && React.createElement(
        'div',
        {
          style: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: PLZ.backdrop,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, backdropFilter: 'blur(4px)', padding: '16px'
          },
          onClick: (e) => { if (e.target === e.currentTarget) setCallModalOpen(false); }
        },
        React.createElement('div', {
          style: {
            backgroundColor: 'white', borderRadius: PLZ.radiusXl, padding: '24px',
            maxWidth: '400px', width: '100%',
            boxShadow: PLZ.shadowMd
          }
        },
          React.createElement('div', {
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '16px'
            }
          },
            React.createElement('h3', {
              style: { fontSize: '18px', fontWeight: '600', color: PLZ.ink, margin: 0 }
            }, 'Contact'),
            React.createElement('button', {
              onClick: () => setCallModalOpen(false),
              style: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: PLZ.muted }
            }, React.createElement(X, { size: 24 }))
          ),
          business.phone && React.createElement('div', {
            style: {
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', backgroundColor: PLZ.surface,
              borderRadius: PLZ.radiusMd, border: `1px solid ${PLZ.line}`
            }
          },
            React.createElement(Phone, { size: 20, color: PLZ.blue }),
            React.createElement('span', {
              style: { flex: 1, fontSize: '16px', color: PLZ.ink, fontWeight: '500' }
            }, business.phone),
            React.createElement('button', {
              onClick: () => copyPhone(business.phone),
              style: {
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 8px', color: PLZ.blue, fontSize: '13px', fontWeight: '500'
              }
            }, 'Copy'),
            React.createElement('button', {
              onClick: () => { window.location.href = `tel:${business.phone}`; },
              style: {
                backgroundColor: PLZ.blue, color: 'white',
                border: 'none', borderRadius: PLZ.radiusSm,
                padding: '6px 16px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '500'
              }
            }, 'Call')
          )
        )
      ),

      // BOOKING MODAL
      bookingModalOpen && React.createElement(
        'div',
        {
          style: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: PLZ.backdrop,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, backdropFilter: 'blur(4px)',
            padding: '16px', overflowY: 'auto'
          },
          onClick: (e) => {
            if (e.target === e.currentTarget && !bookingSubmitting) closeBookingModal();
          }
        },
        React.createElement('div', {
          style: {
            backgroundColor: 'white', borderRadius: PLZ.radiusXl, padding: '24px',
            maxWidth: '520px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: PLZ.shadowMd,
            position: 'relative'
          }
        },
          React.createElement('button', {
            onClick: closeBookingModal,
            disabled: bookingSubmitting,
            style: {
              position: 'sticky', top: 0, float: 'right',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px', color: PLZ.muted, zIndex: 10
            }
          }, React.createElement(X, { size: 24 })),
          React.createElement('h2', {
            style: { fontSize: '22px', fontWeight: '700', color: PLZ.ink, margin: '0 0 4px 0' }
          }, labels.ctaButton),
          selectedRoom && React.createElement('p', {
            style: { fontSize: '16px', color: PLZ.muted, margin: '0 0 20px 0' }
          },
            React.createElement('span', { style: { fontWeight: '600', color: PLZ.ink } }, selectedRoom.name),
            ' — ' + formatCurrency(selectedRoom.price_per_night || selectedRoom.base_price || 0),
            labels.priceSuffix ? ' ' + labels.priceSuffix : ''
          ),
          React.createElement('form', { onSubmit: handleBookingSubmit },
            // Full Name
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', {
                style: { display: 'block', fontSize: '14px', fontWeight: '500', color: PLZ.body, marginBottom: '4px' }
              }, 'Full Name *'),
              React.createElement('input', {
                type: 'text', value: customerName,
                onChange: (e) => setCustomerName(e.target.value),
                placeholder: 'Enter your full name',
                required: true,
                style: {
                  width: '100%', padding: '10px 14px',
                  border: `1px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm,
                  fontSize: '15px', outline: 'none'
                },
                onFocus: (e) => { e.currentTarget.style.borderColor = PLZ.blue; },
                onBlur: (e) => { e.currentTarget.style.borderColor = PLZ.line; }
              })
            ),
            // Email
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', {
                style: { display: 'block', fontSize: '14px', fontWeight: '500', color: PLZ.body, marginBottom: '4px' }
              }, 'Email Address *'),
              React.createElement('input', {
                type: 'email', value: customerEmail,
                onChange: (e) => setCustomerEmail(e.target.value),
                placeholder: 'you@example.com',
                required: true,
                style: {
                  width: '100%', padding: '10px 14px',
                  border: `1px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm,
                  fontSize: '15px', outline: 'none'
                },
                onFocus: (e) => { e.currentTarget.style.borderColor = PLZ.blue; },
                onBlur: (e) => { e.currentTarget.style.borderColor = PLZ.line; }
              })
            ),
            // Phone
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', {
                style: { display: 'block', fontSize: '14px', fontWeight: '500', color: PLZ.body, marginBottom: '4px' }
              }, 'Phone Number *'),
              React.createElement('input', {
                type: 'tel', value: customerPhone,
                onChange: (e) => setCustomerPhone(e.target.value),
                placeholder: '08012345678',
                required: true,
                style: {
                  width: '100%', padding: '10px 14px',
                  border: `1px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm,
                  fontSize: '15px', outline: 'none'
                },
                onFocus: (e) => { e.currentTarget.style.borderColor = PLZ.blue; },
                onBlur: (e) => { e.currentTarget.style.borderColor = PLZ.line; }
              })
            ),
            // Date
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', {
                style: { display: 'block', fontSize: '14px', fontWeight: '500', color: PLZ.body, marginBottom: '4px' }
              },
                React.createElement(Calendar, { size: 14, style: { display: 'inline', marginRight: '6px' } }),
                labels.dateLabel + ' *'
              ),
              React.createElement('input', {
                type: 'date', value: eventDate,
                onChange: (e) => setEventDate(e.target.value),
                required: true,
                min: new Date().toISOString().split('T')[0],
                style: {
                  width: '100%', padding: '10px 14px',
                  border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm,
                  fontSize: '15px', outline: 'none'
                },
                onFocus: (e) => { e.currentTarget.style.borderColor = PLZ.blue; },
                onBlur: (e) => { e.currentTarget.style.borderColor = PLZ.line; }
              }),
              React.createElement('p', {
                style: { fontSize: '12px', color: PLZ.muted, marginTop: '4px' }
              }, labels.dateHelper)
            ),
            // Payment Method
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', {
                style: { display: 'block', fontSize: '14px', fontWeight: '500', color: PLZ.body, marginBottom: '4px' }
              }, 'Payment Method'),
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
                React.createElement('button', {
                  type: 'button',
                  onClick: () => setPaymentMethod('pay_at_venue'),
                  style: {
                    padding: '10px', borderRadius: PLZ.radiusSm,
                    border: paymentMethod === 'pay_at_venue' ? `2px solid ${PLZ.blue}` : `1px solid ${PLZ.line}`,
                    backgroundColor: paymentMethod === 'pay_at_venue' ? PLZ.blueTint : 'white',
                    cursor: 'pointer', fontSize: '14px',
                    fontWeight: paymentMethod === 'pay_at_venue' ? '600' : '400',
                    color: paymentMethod === 'pay_at_venue' ? PLZ.blue : PLZ.body
                  }
                }, 'Pay at Venue'),
                React.createElement('button', {
                  type: 'button',
                  onClick: () => setPaymentMethod('paystack'),
                  style: {
                    padding: '10px', borderRadius: PLZ.radiusSm,
                    border: paymentMethod === 'paystack' ? `2px solid ${PLZ.blue}` : `1px solid ${PLZ.line}`,
                    backgroundColor: paymentMethod === 'paystack' ? PLZ.blueTint : 'white',
                    cursor: 'pointer', fontSize: '14px',
                    fontWeight: paymentMethod === 'paystack' ? '600' : '400',
                    color: paymentMethod === 'paystack' ? PLZ.blue : PLZ.body
                  }
                },
                  React.createElement(CreditCard, { size: 16, style: { display: 'inline', marginRight: '6px' } }),
                  'Pay Online'
                )
              )
            ),
            // Special Requests
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', {
                style: { display: 'block', fontSize: '14px', fontWeight: '500', color: PLZ.body, marginBottom: '4px' }
              }, 'Special Requests'),
              React.createElement('textarea', {
                value: specialRequests,
                onChange: (e) => setSpecialRequests(e.target.value),
                placeholder: 'Any special requests or notes...',
                rows: 2,
                style: {
                  width: '100%', padding: '10px 14px',
                  border: `1px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm,
                  fontSize: '15px', resize: 'vertical',
                  fontFamily: 'inherit', outline: 'none'
                },
                onFocus: (e) => { e.currentTarget.style.borderColor = PLZ.blue; },
                onBlur: (e) => { e.currentTarget.style.borderColor = PLZ.line; }
              })
            ),
            // Summary
            selectedRoom && eventDate && React.createElement('div', {
              style: {
                backgroundColor: PLZ.surface, borderRadius: PLZ.radiusMd,
                padding: '16px', marginBottom: '16px'
              }
            },
              React.createElement('div', {
                style: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: PLZ.muted }
              },
                React.createElement('span', null, labels.dateLabel),
                React.createElement('span', null, formatDate(eventDate))
              ),
              React.createElement('div', {
                style: {
                  display: 'flex', justifyContent: 'space-between',
                  marginTop: '8px', paddingTop: '8px',
                  borderTop: `1px solid ${PLZ.line}`,
                  fontSize: '18px', fontWeight: '700', color: PLZ.ink
                }
              },
                React.createElement('span', null, labels.totalLabel),
                React.createElement('span', null, formatCurrency(selectedRoom.price_per_night || selectedRoom.base_price || 0))
              )
            ),
            // Submit
            React.createElement('button', {
              type: 'submit',
              disabled: bookingSubmitting,
              style: {
                width: '100%', padding: '14px 0',
                backgroundColor: bookingSubmitting ? PLZ.muted : PLZ.blue,
                color: 'white', border: 'none', borderRadius: PLZ.radiusMd,
                fontSize: '16px', fontWeight: '600',
                cursor: bookingSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }
            },
              bookingSubmitting
                ? React.createElement(React.Fragment, null,
                    React.createElement(Loader, { size: 20, className: 'animate-spin' }),
                    'Processing...'
                  )
                : 'Confirm ' + labels.ctaShort
            )
          )
        )
      ),

      // RECEIPT MODAL
      showReceipt && receiptData && React.createElement(
        'div',
        {
          style: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: PLZ.backdrop,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, backdropFilter: 'blur(10px)',
            padding: isMobile ? '12px' : '20px', overflowY: 'auto'
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
          labels: labels,
          onClose: closeReceipt,
          onDownload: downloadReceipt,
          downloading: downloadingReceipt
        })
      ),

      // LIGHTBOX — stays near-black by convention; only active-thumb border retinted
      lightboxOpen && displayImages.length > 0 && React.createElement(
        'div',
        {
          style: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', padding: '20px'
          },
          onClick: (e) => { if (e.target === e.currentTarget) closeLightbox(); }
        },
        React.createElement('button', {
          onClick: closeLightbox,
          style: {
            position: 'absolute', top: '20px', right: '20px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'white', padding: '8px', zIndex: 10
          }
        }, React.createElement(X, { size: 32 })),
        React.createElement('div', {
          style: {
            position: 'relative', maxWidth: '900px', width: '100%',
            maxHeight: '70vh', overflow: 'hidden', borderRadius: PLZ.radiusMd
          }
        },
          React.createElement('img', {
            src: displayImages[lightboxIndex] || displayImages[0],
            alt: 'Gallery image',
            style: { width: '100%', height: '100%', maxHeight: '70vh', objectFit: 'contain' }
          }),
          displayImages.length > 1 && React.createElement(React.Fragment, null,
            React.createElement('button', {
              onClick: goToPrevLightbox,
              style: {
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
                border: 'none', borderRadius: '50%',
                width: '48px', height: '48px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }
            }, React.createElement(ChevronLeft, { size: 28 })),
            React.createElement('button', {
              onClick: goToNextLightbox,
              style: {
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
                border: 'none', borderRadius: '50%',
                width: '48px', height: '48px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }
            }, React.createElement(ChevronRight, { size: 28 }))
          )
        ),
        displayImages.length > 1 && React.createElement('div', {
          style: {
            display: 'flex', gap: '8px', marginTop: '16px',
            overflowX: 'auto', maxWidth: '100%', padding: '4px'
          }
        },
          displayImages.map((img, idx) =>
            React.createElement('div', {
              key: idx,
              onClick: () => setLightboxIndex(idx),
              style: {
                width: '60px', height: '60px', borderRadius: '8px',
                overflow: 'hidden', cursor: 'pointer',
                border: lightboxIndex === idx ? `2px solid ${PLZ.blue}` : '2px solid transparent',
                opacity: lightboxIndex === idx ? 1 : 0.5, flexShrink: 0
              }
            },
              React.createElement('img', {
                src: img, alt: `Thumbnail ${idx + 1}`,
                style: { width: '100%', height: '100%', objectFit: 'cover' }
              })
            )
          )
        )
      )
    )
  );
}

export default UnifiedBookingPage;