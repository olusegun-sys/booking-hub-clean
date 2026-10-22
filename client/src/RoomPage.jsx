// FILE: client/src/RoomPage.jsx
// BUSINESS-CATEGORY-AWARE FORM EDITOR — SESSION 2 RESTYLE (19 Oct 2026, evening)
// RESTYLE ONLY: colours, radii, shadows, typography unified with Plazzaa
// marketing design. No config-driven tabs, field logic, upload flow,
// delete flow, token handling, or payload shape changed.
//
// Preserved from prior versions:
//  - BUSINESS_CONFIG for 15+ business types (unchanged)
//  - Config-driven tabs (each type shows only relevant tabs)
//  - Image upload via business_token (7 Oct 401 fix) — every handler still
//    reads getBusinessToken() fresh, never captured at mount
//  - Drag-drop upload, reorder arrows, primary badge, 16-image cap
//  - Professional delete confirmation modal
//  - Event-hall special payload handling (base_price, included_guests, ...)

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Trash2, Edit3, Save, X,
  Hotel, Trophy, Sparkles, Users, Bed, DollarSign,
  AlertCircle, CheckCircle, Loader2, Info, MapPin, Image, FileText,
  Upload, Camera, Star, Car, Bath, Calendar, Sofa, Tag,
  Building, ChevronDown, ChevronRight, Home, Wifi, Zap,
  Shield, Droplets, Thermometer, Lock, Award, Heart,
  ShoppingBag, GraduationCap, Landmark, Plane, Umbrella,
  Music, Utensils, Tent, Eye, Maximize, Layers, Grid3x3,
  Phone, Mail, Clock, Globe, Copy, Check,
  GripVertical, AlertTriangle, Coffee, Scissors, Palette,
  Activity, Dumbbell, Store, BedDouble, Timer
} from 'lucide-react';
import API_BASE from './config';
import { showError, showSuccess } from './toast';

// ============================================================
// DESIGN TOKENS — matches Plazzaa marketing design
// WHY: single source of truth per file. Seam 7 global theme swap
// only touches this block, not ~80 scattered literals.
// ============================================================
const PLZ = {
  blue: '#2D60EA',
  blueDeep: '#1F47B4',
  blueTint: '#E8F4FF',
  ink: '#18181B',
  body: '#52525B',
  muted: '#A1A1AA',
  line: '#E4E4E7',
  surface: '#F4F4F5',
  success: '#1B7F43',
  successTint: '#E7F4EC',
  warning: '#B0840F',
  warningTint: '#FBF3DD',
  danger: '#C0395A',
  dangerTint: '#FCECEF',
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
// ICON MAP - For Area Guide
// ============================================================
const iconMap = {
  Home: Home,
  Building: Building,
  ShoppingBag: ShoppingBag,
  GraduationCap: GraduationCap,
  Landmark: Landmark,
  Plane: Plane,
  Umbrella: Umbrella,
  Music: Music,
  Utensils: Utensils,
  Tent: Tent,
  Wifi: Wifi,
  Zap: Zap,
  Droplets: Droplets,
  Thermometer: Thermometer,
  Shield: Shield,
  Lock: Lock,
  Award: Award,
  Star: Star,
  Heart: Heart
};

// ============================================================
// BUSINESS TYPE CONFIGURATION — UNCHANGED
// ============================================================
const BUSINESS_CONFIG = {
  // ============ STAYS ============
  hotel: {
    icon: Hotel,
    headerIcon: Hotel,
    headerLabel: 'Hotel',
    singular: 'Room',
    plural: 'Menu & Services',
    actionLabel: 'Add Room',
    tabs: ['basic', 'details', 'images', 'features', 'amenities', 'areaGuide'],
    basic: {
      nameLabel: 'Room Name',
      namePlaceholder: 'e.g., Deluxe Room 1',
      showType: true,
      typeLabel: 'Room Type',
      typeOptions: ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential', 'Family'],
      showCapacity: true,
      capacityLabel: 'Sleeps (Guests)',
      capacityPlaceholder: 'e.g., 2',
      showPrice: true,
      priceLabel: 'Price per night',
      priceUnit: '/ night',
      priceField: 'price_per_night',
      showAddress: true,
      showDescription: true,
      descriptionLabel: 'Room Description',
      descriptionPlaceholder: 'Describe this room for guests'
    },
    details: {
      showPropertyType: true,
      propertyTypeLabel: 'Property Type',
      propertyTypeOptions: ['Single Room', 'Double Room', 'Suite', 'Deluxe', 'Executive'],
      showListingStatus: true,
      showFurnishing: true,
      showYearBuilt: true,
      showBathrooms: true,
      showParking: true
    },
    showFeatures: true,
    showAmenities: true,
    showAreaGuide: true
  },
  apartment: {
    icon: Home,
    headerIcon: Home,
    headerLabel: 'Apartment',
    singular: 'Apartment',
    plural: 'Menu & Services',
    actionLabel: 'Add Apartment',
    tabs: ['basic', 'details', 'images', 'features', 'amenities', 'areaGuide'],
    basic: {
      nameLabel: 'Apartment Name',
      namePlaceholder: 'e.g., 2-Bedroom Apartment',
      showType: true,
      typeLabel: 'Apartment Type',
      typeOptions: ['Studio', '1-Bedroom', '2-Bedroom', '3-Bedroom', 'Penthouse'],
      showCapacity: true,
      capacityLabel: 'Sleeps (Guests)',
      capacityPlaceholder: 'e.g., 4',
      showPrice: true,
      priceLabel: 'Price per night',
      priceUnit: '/ night',
      priceField: 'price_per_night',
      showAddress: true,
      showDescription: true,
      descriptionLabel: 'Apartment Description',
      descriptionPlaceholder: 'Describe this apartment for guests'
    },
    details: {
      showPropertyType: true,
      propertyTypeLabel: 'Property Type',
      propertyTypeOptions: ['Studio', '1-Bedroom', '2-Bedroom', '3-Bedroom', 'Penthouse'],
      showListingStatus: true,
      showFurnishing: true,
      showYearBuilt: true,
      showBathrooms: true,
      showParking: true
    },
    showFeatures: true,
    showAmenities: true,
    showAreaGuide: true
  },
  event_hall: {
    icon: Sparkles,
    headerIcon: Sparkles,
    headerLabel: 'Event Hall',
    singular: 'Event Hall',
    plural: 'Menu & Services',
    actionLabel: 'Add Event Hall',
    tabs: ['basic', 'details', 'images', 'features', 'amenities', 'areaGuide'],
    basic: {
      nameLabel: 'Event Hall Name',
      namePlaceholder: 'e.g., Grand Ballroom',
      showType: true,
      typeLabel: 'Hall Type',
      typeOptions: ['Banquet Hall', 'Conference Room', 'Ballroom', 'Theater', 'Boardroom'],
      showCapacity: true,
      capacityLabel: 'Capacity (Included Guests)',
      capacityPlaceholder: 'e.g., 100',
      showPrice: true,
      priceLabel: 'Base Price',
      priceUnit: '/ event',
      priceField: 'base_price',
      showAddress: true,
      showDescription: true,
      descriptionLabel: 'Event Hall Description',
      descriptionPlaceholder: 'Describe this event hall for guests'
    },
    details: {
      showPropertyType: true,
      propertyTypeLabel: 'Property Type',
      propertyTypeOptions: ['Banquet Hall', 'Conference Room', 'Ballroom', 'Theater', 'Boardroom'],
      showListingStatus: true,
      showFurnishing: false,
      showYearBuilt: true,
      showBathrooms: true,
      showParking: true
    },
    showFeatures: true,
    showAmenities: true,
    showAreaGuide: true
  },
  event: {
    // Legacy alias for event_hall
    icon: Sparkles,
    headerIcon: Sparkles,
    headerLabel: 'Event Venue',
    singular: 'Event Hall',
    plural: 'Menu & Services',
    actionLabel: 'Add Event Hall',
    tabs: ['basic', 'details', 'images', 'features', 'amenities', 'areaGuide'],
    basic: {
      nameLabel: 'Event Hall Name',
      namePlaceholder: 'e.g., Grand Ballroom',
      showType: true,
      typeLabel: 'Hall Type',
      typeOptions: ['Banquet Hall', 'Conference Room', 'Ballroom', 'Theater', 'Boardroom'],
      showCapacity: true,
      capacityLabel: 'Capacity (Included Guests)',
      capacityPlaceholder: 'e.g., 100',
      showPrice: true,
      priceLabel: 'Base Price',
      priceUnit: '/ event',
      priceField: 'base_price',
      showAddress: true,
      showDescription: true,
      descriptionLabel: 'Event Hall Description',
      descriptionPlaceholder: 'Describe this event hall for guests'
    },
    details: {
      showPropertyType: true,
      propertyTypeLabel: 'Property Type',
      propertyTypeOptions: ['Banquet Hall', 'Conference Room', 'Ballroom', 'Theater', 'Boardroom'],
      showListingStatus: true,
      showFurnishing: false,
      showYearBuilt: true,
      showBathrooms: true,
      showParking: true
    },
    showFeatures: true,
    showAmenities: true,
    showAreaGuide: true
  },

  // ============ FOOD ============
  restaurant: {
    icon: Utensils,
    headerIcon: Utensils,
    headerLabel: 'Restaurant',
    singular: 'Menu Item',
    plural: 'Menu & Services',
    actionLabel: 'Add Menu Item',
    tabs: ['basic', 'images'],
    basic: {
      nameLabel: 'Item Name',
      namePlaceholder: 'e.g., Jollof Rice',
      showType: true,
      typeLabel: 'Item Category',
      typeOptions: ['Starter', 'Main Course', 'Dessert', 'Drink', 'Side', 'Combo'],
      showCapacity: false,
      showPrice: true,
      priceLabel: 'Price',
      priceUnit: '',
      priceField: 'price_per_night', // Reuse existing field
      showAddress: false,
      showDescription: true,
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Brief description of this item'
    },
    details: null,
    showFeatures: false,
    showAmenities: false,
    showAreaGuide: false
  },
  diner: {
    icon: Store,
    headerIcon: Store,
    headerLabel: 'Diner',
    singular: 'Menu Item',
    plural: 'Menu & Services',
    actionLabel: 'Add Menu Item',
    tabs: ['basic', 'images'],
    basic: {
      nameLabel: 'Item Name',
      namePlaceholder: 'e.g., Classic Burger',
      showType: true,
      typeLabel: 'Item Category',
      typeOptions: ['Starter', 'Main Course', 'Dessert', 'Drink', 'Side', 'Combo'],
      showCapacity: false,
      showPrice: true,
      priceLabel: 'Price',
      priceUnit: '',
      priceField: 'price_per_night',
      showAddress: false,
      showDescription: true,
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Brief description of this item'
    },
    details: null,
    showFeatures: false,
    showAmenities: false,
    showAreaGuide: false
  },
  cafe: {
    icon: Coffee,
    headerIcon: Coffee,
    headerLabel: 'Cafe',
    singular: 'Menu Item',
    plural: 'Menu & Services',
    actionLabel: 'Add Menu Item',
    tabs: ['basic', 'images'],
    basic: {
      nameLabel: 'Item Name',
      namePlaceholder: 'e.g., Cappuccino',
      showType: true,
      typeLabel: 'Item Category',
      typeOptions: ['Coffee', 'Tea', 'Pastry', 'Sandwich', 'Dessert', 'Drink'],
      showCapacity: false,
      showPrice: true,
      priceLabel: 'Price',
      priceUnit: '',
      priceField: 'price_per_night',
      showAddress: false,
      showDescription: true,
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Brief description of this item'
    },
    details: null,
    showFeatures: false,
    showAmenities: false,
    showAreaGuide: false
  },
  other_food: {
    icon: Utensils,
    headerIcon: Utensils,
    headerLabel: 'Food Business',
    singular: 'Menu Item',
    plural: 'Menu & Services',
    actionLabel: 'Add Menu Item',
    tabs: ['basic', 'images'],
    basic: {
      nameLabel: 'Item Name',
      namePlaceholder: 'e.g., Item name',
      showType: true,
      typeLabel: 'Item Category',
      typeOptions: ['Starter', 'Main Course', 'Dessert', 'Drink', 'Side', 'Combo'],
      showCapacity: false,
      showPrice: true,
      priceLabel: 'Price',
      priceUnit: '',
      priceField: 'price_per_night',
      showAddress: false,
      showDescription: true,
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Brief description of this item'
    },
    details: null,
    showFeatures: false,
    showAmenities: false,
    showAreaGuide: false
  },

  // ============ OTHERS ============
  sports: {
    icon: Dumbbell,
    headerIcon: Dumbbell,
    headerLabel: 'Sports Facility',
    singular: 'Court',
    plural: 'Menu & Services',
    actionLabel: 'Add Court',
    tabs: ['basic', 'details', 'images', 'features', 'amenities'],
    basic: {
      nameLabel: 'Court Name',
      namePlaceholder: 'e.g., Court A',
      showType: true,
      typeLabel: 'Court Type',
      typeOptions: ['Tennis Court', 'Basketball Court', 'Football Pitch', 'Badminton', 'Squash'],
      showCapacity: true,
      capacityLabel: 'Players',
      capacityPlaceholder: 'e.g., 10',
      showPrice: true,
      priceLabel: 'Price per hour',
      priceUnit: '/ hour',
      priceField: 'price_per_night',
      showAddress: true,
      showDescription: true,
      descriptionLabel: 'Court Description',
      descriptionPlaceholder: 'Describe this court for players'
    },
    details: {
      showPropertyType: false,
      showListingStatus: false,
      showFurnishing: false,
      showYearBuilt: true,
      showBathrooms: false,
      showParking: true
    },
    showFeatures: true,
    showAmenities: true,
    showAreaGuide: false
  },
  spa: {
    icon: Heart,
    headerIcon: Heart,
    headerLabel: 'Spa',
    singular: 'Service',
    plural: 'Menu & Services',
    actionLabel: 'Add Service',
    tabs: ['basic', 'images'],
    basic: {
      nameLabel: 'Service Name',
      namePlaceholder: 'e.g., Deep Tissue Massage',
      showType: true,
      typeLabel: 'Service Type',
      typeOptions: ['Massage', 'Facial', 'Body Treatment', 'Couples Package'],
      showCapacity: false,
      showPrice: true,
      priceLabel: 'Price',
      priceUnit: '',
      priceField: 'price_per_night',
      showAddress: false,
      showDescription: true,
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Brief description of this service'
    },
    details: null,
    showFeatures: false,
    showAmenities: false,
    showAreaGuide: false
  },
  beauty_salon: {
    icon: Scissors,
    headerIcon: Scissors,
    headerLabel: 'Beauty Salon',
    singular: 'Service',
    plural: 'Menu & Services',
    actionLabel: 'Add Service',
    tabs: ['basic', 'images'],
    basic: {
      nameLabel: 'Service Name',
      namePlaceholder: 'e.g., Haircut & Blow Dry',
      showType: true,
      typeLabel: 'Service Type',
      typeOptions: ['Hair', 'Nails', 'Makeup', 'Waxing', 'Barbering'],
      showCapacity: false,
      showPrice: true,
      priceLabel: 'Price',
      priceUnit: '',
      priceField: 'price_per_night',
      showAddress: false,
      showDescription: true,
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Brief description of this service'
    },
    details: null,
    showFeatures: false,
    showAmenities: false,
    showAreaGuide: false
  },
  activity_place: {
    icon: Activity,
    headerIcon: Activity,
    headerLabel: 'Activity Place',
    singular: 'Activity',
    plural: 'Menu & Services',
    actionLabel: 'Add Activity',
    tabs: ['basic', 'details', 'images', 'features', 'amenities'],
    basic: {
      nameLabel: 'Activity Name',
      namePlaceholder: 'e.g., Escape Room - Mystery',
      showType: true,
      typeLabel: 'Activity Type',
      typeOptions: ['Escape Room', 'Bowling', 'Arcade', 'Trampoline', 'Karting'],
      showCapacity: true,
      capacityLabel: 'Capacity',
      capacityPlaceholder: 'e.g., 6',
      showPrice: true,
      priceLabel: 'Price',
      priceUnit: '',
      priceField: 'price_per_night',
      showAddress: true,
      showDescription: true,
      descriptionLabel: 'Activity Description',
      descriptionPlaceholder: 'Describe this activity for guests'
    },
    details: {
      showPropertyType: false,
      showListingStatus: false,
      showFurnishing: false,
      showYearBuilt: true,
      showBathrooms: false,
      showParking: true
    },
    showFeatures: true,
    showAmenities: true,
    showAreaGuide: false
  }
};

// Fallback config for unknown types
const DEFAULT_CONFIG = {
  icon: Building,
  headerIcon: Building,
  headerLabel: 'Business',
  singular: 'Item',
  plural: 'Menu & Services',
  actionLabel: 'Add Item',
  tabs: ['basic', 'images'],
  basic: {
    nameLabel: 'Item Name',
    namePlaceholder: 'e.g., Item name',
    showType: true,
    typeLabel: 'Type',
    typeOptions: ['Standard'],
    showCapacity: false,
    showPrice: true,
    priceLabel: 'Price',
    priceUnit: '',
    priceField: 'price_per_night',
    showAddress: false,
    showDescription: true,
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Brief description of this item'
  },
  details: null,
  showFeatures: false,
  showAmenities: false,
  showAreaGuide: false
};

function getBusinessConfig(businessType) {
  return BUSINESS_CONFIG[businessType] || DEFAULT_CONFIG;
}

// ============================================================
// FEATURE / AMENITY CATEGORIES (only shown when relevant)
// ============================================================
const featureCategories = [
  { id: 'interior', label: '🏠 Interior Features' },
  { id: 'exterior', label: '🏡 Exterior Features' },
  { id: 'safety', label: '🛡️ Safety & Security' },
  { id: 'utilities', label: '⚡ Power & Utilities' },
  { id: 'outdoor', label: '🌳 Outdoor & Communal' }
];

const amenityCategories = [
  { id: 'interior', label: '🏠 Interior & Finishing' },
  { id: 'safety', label: '🛡️ Security & Safety' },
  { id: 'outdoor', label: '🌳 Outdoor & Communal' },
  { id: 'utilities', label: '⚡ Power & Utilities' }
];

const furnishingOptions = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi_furnished', label: 'Semi-Furnished' }
];

const listingStatusOptions = [
  { value: 'for_rent', label: 'For Rent' },
  { value: 'for_sale', label: 'For Sale' },
  { value: 'short_let', label: 'Short Let' }
];

const iconOptions = [
  { value: 'Home', label: '🏠 Home' },
  { value: 'Building', label: '🏢 Building' },
  { value: 'ShoppingBag', label: '🛍️ Shopping' },
  { value: 'GraduationCap', label: '🎓 School' },
  { value: 'Landmark', label: '🏛️ Landmark' },
  { value: 'Plane', label: '✈️ Airport' },
  { value: 'Umbrella', label: '🏖️ Beach' },
  { value: 'Music', label: '🎵 Music' },
  { value: 'Utensils', label: '🍽️ Dining' },
  { value: 'Tent', label: '🎪 Events' },
  { value: 'Heart', label: '❤️ Heart' },
  { value: 'Star', label: '⭐ Star' }
];

// ============================================================
// DELETE CONFIRMATION MODAL — restyled only
// ============================================================
function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, itemType }) {
  const isMobile = window.innerWidth < 640;
  if (!isOpen) return null;

  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: PLZ.backdrop,
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease'
      }
    },
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: 'white',
          borderRadius: isMobile ? PLZ.radiusXl : '24px',
          maxWidth: '480px',
          width: '100%',
          padding: isMobile ? '28px 24px' : '40px 32px',
          boxShadow: PLZ.shadowLg,
          animation: 'slideUp 0.3s ease'
        }
      },
      React.createElement(
        'div',
        {
          style: {
            width: isMobile ? '64px' : '72px',
            height: isMobile ? '64px' : '72px',
            borderRadius: '50%',
            backgroundColor: PLZ.dangerTint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }
        },
        React.createElement(AlertTriangle, { size: isMobile ? 28 : 32, color: PLZ.danger })
      ),
      React.createElement(
        'h3',
        {
          style: {
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: PLZ.ink,
            textAlign: 'center',
            margin: '0 0 8px 0'
          }
        },
        'Delete ' + itemType + '?'
      ),
      React.createElement(
        'p',
        {
          style: {
            fontSize: isMobile ? '14px' : '16px',
            color: PLZ.body,
            textAlign: 'center',
            lineHeight: '1.6',
            margin: '0 0 24px 0'
          }
        },
        'You are about to delete ',
        React.createElement('strong', { style: { color: PLZ.ink } }, '"' + itemName + '"'),
        '. This action cannot be undone.'
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '12px', flexDirection: isMobile ? 'column-reverse' : 'row' } },
        React.createElement(
          'button',
          {
            onClick: onClose,
            style: {
              flex: 1,
              padding: isMobile ? '14px' : '16px',
              backgroundColor: 'white',
              color: PLZ.body,
              border: `1.5px solid ${PLZ.line}`,
              borderRadius: PLZ.radiusMd,
              fontSize: isMobile ? '14px' : '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }
          },
          'Cancel'
        ),
        React.createElement(
          'button',
          {
            onClick: onConfirm,
            style: {
              flex: 1,
              padding: isMobile ? '14px' : '16px',
              backgroundColor: PLZ.danger,
              color: 'white',
              border: 'none',
              borderRadius: PLZ.radiusMd,
              fontSize: isMobile ? '14px' : '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }
          },
          React.createElement(Trash2, { size: isMobile ? 16 : 18 }),
          'Delete ' + itemType
        )
      )
    )
  );
}

// ============================================================
// TOKEN HELPER — UNCHANGED (7 Oct 401 fix)
// ============================================================
// WHY: After the 21 Sept scoped-token refactor, business sessions are
// written to `business_token`, NOT the legacy `auth_token`. Reading the
// legacy key returns null for any new session, which produces
// `Authorization: Bearer null` → 401 on every authenticated request.
function getBusinessToken() {
  return (
    localStorage.getItem('business_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    null
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
function RoomPage({ business, onBack }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('basic');

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Business config — THE core of the new architecture
  const config = getBusinessConfig(business?.business_type);
  const IconComponent = config.icon;

  // WHY: no top-level `const token` anymore. Token is read fresh inside
  // each handler via getBusinessToken() so it reflects the current session.
  const isMobile = window.innerWidth < 640;

  // ============================================================
  // FORM STATE — UNCHANGED
  // ============================================================
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    price_per_night: '',
    base_price: '',
    included_guests: '',
    max_capacity: '',
    extra_guest_price: '',
    description: '',
    venue_description: '',
    address: '',
    images: [],
    property_type: '',
    bathrooms: 0,
    parking_spaces: 0,
    year_built: '',
    furnishing_status: 'unfurnished',
    listing_status: 'for_rent',
    features: [],
    newFeature: '',
    newFeatureCategory: 'interior',
    amenities: [],
    newAmenity: '',
    newAmenityCategory: 'interior',
    areaGuide: [],
    newAreaTitle: '',
    newAreaContent: '',
    newAreaIcon: 'Home'
  });

  // ============================================================
  // FETCH ROOMS — UNCHANGED
  // ============================================================
  useEffect(function() {
    fetchRooms();
  }, []);

  function fetchRooms() {
    setLoading(true);
    const token = getBusinessToken();
    if (!token) {
      showError('Session expired. Please log in again.');
      setLoading(false);
      return;
    }
    fetch(API_BASE + '/api/businesses/' + business.id + '/rooms', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          setRooms(data.rooms || []);
        }
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  // ============================================================
  // MODAL CONTROLS — UNCHANGED
  // ============================================================
  function getDefaultFormData() {
    const defaultType = config.basic.typeOptions[0] || '';
    const defaultPropertyType = config.details && config.details.propertyTypeOptions
      ? config.details.propertyTypeOptions[0]
      : '';

    return {
      name: '',
      type: defaultType,
      capacity: '',
      price_per_night: '',
      base_price: '',
      included_guests: '',
      max_capacity: '',
      extra_guest_price: '',
      description: '',
      venue_description: '',
      address: '',
      images: [],
      property_type: defaultPropertyType,
      bathrooms: 0,
      parking_spaces: 0,
      year_built: '',
      furnishing_status: 'unfurnished',
      listing_status: 'for_rent',
      features: [],
      newFeature: '',
      newFeatureCategory: 'interior',
      amenities: [],
      newAmenity: '',
      newAmenityCategory: 'interior',
      areaGuide: [],
      newAreaTitle: '',
      newAreaContent: '',
      newAreaIcon: 'Home'
    };
  }

  function openAddModal() {
    setEditingRoom(null);
    setActiveTab(config.tabs[0]);
    setFormData(getDefaultFormData());
    setShowModal(true);
  }

  function openEditModal(room) {
    setEditingRoom(room);
    setActiveTab(config.tabs[0]);
    const defaultType = config.basic.typeOptions[0] || '';
    const defaultPropertyType = config.details && config.details.propertyTypeOptions
      ? config.details.propertyTypeOptions[0]
      : '';

    setFormData({
      name: room.name || '',
      type: room.type || defaultType,
      capacity: room.capacity !== undefined ? String(room.capacity) : '',
      price_per_night: room.price_per_night !== undefined ? String(room.price_per_night) : '',
      base_price: room.base_price !== undefined ? String(room.base_price) : '',
      included_guests: room.included_guests !== undefined ? String(room.included_guests) : '',
      max_capacity: room.max_capacity !== undefined ? String(room.max_capacity) : '',
      extra_guest_price: room.extra_guest_price !== undefined ? String(room.extra_guest_price) : '',
      description: room.description || '',
      venue_description: room.venue_description || room.description || '',
      address: room.address || '',
      images: room.images || [],
      property_type: room.property_type || defaultPropertyType,
      bathrooms: room.bathrooms || 0,
      parking_spaces: room.parking_spaces || 0,
      year_built: room.year_built || '',
      furnishing_status: room.furnishing_status || 'unfurnished',
      listing_status: room.listing_status || 'for_rent',
      features: room.features || [],
      newFeature: '',
      newFeatureCategory: 'interior',
      amenities: room.amenities || [],
      newAmenity: '',
      newAmenityCategory: 'interior',
      areaGuide: room.area_guide || [],
      newAreaTitle: '',
      newAreaContent: '',
      newAreaIcon: 'Home'
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingRoom(null);
    setActiveTab('basic');
  }

  // ============================================================
  // DELETE HANDLER — UNCHANGED
  // ============================================================
  function handleDeleteClick(room) {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  }

  function handleConfirmDelete() {
    if (!roomToDelete) return;
    const roomId = roomToDelete.id;

    const token = getBusinessToken();
    if (!token) {
      showError('Session expired. Please log in again.');
      setDeleteModalOpen(false);
      setRoomToDelete(null);
      return;
    }

    fetch(API_BASE + '/api/businesses/' + business.id + '/rooms/' + roomId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          showSuccess(config.singular + ' deleted successfully');
          fetchRooms();
        } else {
          showError('Failed to delete ' + config.singular.toLowerCase());
        }
        setDeleteModalOpen(false);
        setRoomToDelete(null);
      })
      .catch(function() {
        showError('Something went wrong. Please try again.');
        setDeleteModalOpen(false);
        setRoomToDelete(null);
      });
  }

  function handleCancelDelete() {
    setDeleteModalOpen(false);
    setRoomToDelete(null);
  }

  // ============================================================
  // FORM HANDLERS — UNCHANGED
  // ============================================================
  function handleChange(field, value) {
    setFormData(function(prev) {
      return { ...prev, [field]: value };
    });
  }

  // ============================================================
  // IMAGE UPLOAD — UNCHANGED (7 Oct 401 fix preserved)
  // ============================================================
  function handleVenueImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Image must be under 5MB');
      return;
    }

    const roomId = editingRoom ? editingRoom.id : null;

    if (!roomId) {
      showError('Please save this ' + config.singular.toLowerCase() + ' first before uploading images');
      return;
    }

    const currentImages = formData.images || [];
    if (currentImages.length >= 16) {
      showError('Maximum 16 images allowed');
      return;
    }

    const token = getBusinessToken();
    if (!token) {
      showError('Session expired. Please log in again to upload images.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Data = e.target.result;

      fetch(API_BASE + '/api/businesses/' + business.id + '/rooms/' + roomId + '/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileData: base64Data
        })
      })
        .then(function(res) {
          if (res.status === 401) {
            throw new Error('SESSION_EXPIRED');
          }
          return res.json();
        })
        .then(function(data) {
          setUploadProgress(100);
          if (data.success) {
            showSuccess('Image uploaded successfully');
            setFormData(function(prev) {
              return { ...prev, images: [...(prev.images || []), data.imageUrl] };
            });
            fetchRooms();
          } else {
            showError(data.error || 'Failed to upload image');
          }
          setUploading(false);
        })
        .catch(function(err) {
          setUploading(false);
          if (err && err.message === 'SESSION_EXPIRED') {
            showError('Session expired. Please log in again.');
          } else {
            showError('Something went wrong. Please try again.');
          }
        });
    };

    reader.readAsDataURL(file);
  }

  function removeVenueImage(index) {
    const imageUrl = formData.images[index];
    const roomId = editingRoom ? editingRoom.id : null;

    if (!roomId) {
      const updated = formData.images.filter(function(_, i) { return i !== index; });
      setFormData(function(prev) {
        return { ...prev, images: updated };
      });
      return;
    }

    if (!confirm('Remove this image?')) return;

    const token = getBusinessToken();
    if (!token) {
      showError('Session expired. Please log in again.');
      return;
    }

    fetch(API_BASE + '/api/businesses/' + business.id + '/rooms/' + roomId + '/images', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ imageUrl: imageUrl })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          showSuccess('Image removed');
          const updated = formData.images.filter(function(_, i) { return i !== index; });
          setFormData(function(prev) {
            return { ...prev, images: updated };
          });
          fetchRooms();
        } else {
          showError(data.error || 'Failed to remove image');
        }
      })
      .catch(function() { showError('Something went wrong.'); });
  }

  function moveImageUp(index) {
    if (index === 0) return;
    const updated = [...(formData.images || [])];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setFormData(function(prev) { return { ...prev, images: updated }; });
  }

  function moveImageDown(index) {
    if (index === (formData.images || []).length - 1) return;
    const updated = [...(formData.images || [])];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setFormData(function(prev) { return { ...prev, images: updated }; });
  }

  function handleDragDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const input = document.getElementById('venueImageInput');
      if (input) {
        const dt = new DataTransfer();
        for (let i = 0; i < files.length; i++) {
          dt.items.add(files[i]);
        }
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    // WHY: drop target uses blue tint on hover, not indigo.
    e.currentTarget.style.borderColor = PLZ.blue;
    e.currentTarget.style.backgroundColor = PLZ.blueTint;
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = PLZ.line;
    e.currentTarget.style.backgroundColor = 'transparent';
  }

  // ============================================================
  // FEATURES / AMENITIES / AREA GUIDE HANDLERS — UNCHANGED
  // ============================================================
  function addFeature() {
    if (!formData.newFeature.trim()) {
      showError('Please enter a feature name');
      return;
    }
    const updated = (formData.features || []).concat([{
      id: Date.now(),
      name: formData.newFeature.trim(),
      category: formData.newFeatureCategory
    }]);
    setFormData(function(prev) {
      return { ...prev, features: updated, newFeature: '' };
    });
  }

  function removeFeature(id) {
    const updated = (formData.features || []).filter(function(f) { return f.id !== id; });
    setFormData(function(prev) { return { ...prev, features: updated }; });
  }

  function addAmenity() {
    if (!formData.newAmenity.trim()) {
      showError('Please enter an amenity name');
      return;
    }
    const updated = (formData.amenities || []).concat([{
      id: Date.now(),
      name: formData.newAmenity.trim(),
      category: formData.newAmenityCategory
    }]);
    setFormData(function(prev) {
      return { ...prev, amenities: updated, newAmenity: '' };
    });
  }

  function removeAmenity(id) {
    const updated = (formData.amenities || []).filter(function(a) { return a.id !== id; });
    setFormData(function(prev) { return { ...prev, amenities: updated }; });
  }

  function addAreaSection() {
    if (!formData.newAreaTitle.trim() || !formData.newAreaContent.trim()) {
      showError('Please enter both title and content');
      return;
    }
    const updated = (formData.areaGuide || []).concat([{
      id: Date.now(),
      icon: formData.newAreaIcon,
      title: formData.newAreaTitle.trim(),
      content: formData.newAreaContent.trim()
    }]);
    setFormData(function(prev) {
      return { ...prev, areaGuide: updated, newAreaTitle: '', newAreaContent: '', newAreaIcon: 'Home' };
    });
  }

  function removeAreaSection(id) {
    const updated = (formData.areaGuide || []).filter(function(s) { return s.id !== id; });
    setFormData(function(prev) { return { ...prev, areaGuide: updated }; });
  }

  // ============================================================
  // SAVE — UNCHANGED
  // ============================================================
  function handleSave() {
    if (!formData.name.trim()) {
      showError(config.basic.nameLabel + ' is required');
      return;
    }

    let priceValue = parseFloat(formData.price_per_night) || parseFloat(formData.base_price);
    if (!priceValue || priceValue <= 0) {
      showError('Valid ' + config.basic.priceLabel.toLowerCase() + ' is required');
      return;
    }

    let capacity = 1;
    if (config.basic.showCapacity) {
      capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity <= 0) {
        capacity = 1;
      }
    }

    const token = getBusinessToken();
    if (!token) {
      showError('Session expired. Please log in again.');
      return;
    }

    setSaving(true);
    const url = editingRoom
      ? API_BASE + '/api/businesses/' + business.id + '/rooms/' + editingRoom.id
      : API_BASE + '/api/businesses/' + business.id + '/rooms/create';
    const method = editingRoom ? 'PUT' : 'POST';

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      capacity: capacity,
      price_per_night: parseFloat(formData.price_per_night) || parseFloat(formData.base_price) || 0,
      description: formData.description || '',
      venue_description: formData.venue_description || formData.description || '',
      address: formData.address || '',
      images: formData.images || []
    };

    if (config.details) {
      if (config.details.showPropertyType) {
        payload.property_type = formData.property_type || '';
      }
      if (config.details.showListingStatus) {
        payload.listing_status = formData.listing_status || 'for_rent';
      }
      if (config.details.showFurnishing) {
        payload.furnishing_status = formData.furnishing_status || 'unfurnished';
      }
      if (config.details.showYearBuilt) {
        payload.year_built = formData.year_built ? parseInt(formData.year_built) : null;
      }
      if (config.details.showBathrooms) {
        payload.bathrooms = parseInt(formData.bathrooms) || 0;
      }
      if (config.details.showParking) {
        payload.parking_spaces = parseInt(formData.parking_spaces) || 0;
      }
    }

    if (config.showFeatures) {
      payload.features = formData.features || [];
    }
    if (config.showAmenities) {
      payload.amenities = formData.amenities || [];
    }
    if (config.showAreaGuide) {
      payload.area_guide = formData.areaGuide || [];
    }

    if (business?.business_type === 'event_hall' || business?.business_type === 'event') {
      payload.base_price = parseFloat(formData.price_per_night) || 0;
      payload.included_guests = parseInt(formData.capacity) || 50;
      payload.max_capacity = parseInt(formData.capacity) || 300;
      payload.extra_guest_price = 0;
    }

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          showSuccess(editingRoom ? config.singular + ' updated!' : config.singular + ' added!');
          closeModal();
          fetchRooms();
          if (!editingRoom && data.room) {
            setEditingRoom(data.room);
          }
        } else {
          showError(data.error || 'Failed to save');
        }
        setSaving(false);
      })
      .catch(function(err) {
        console.error('Save error:', err);
        showError('Something went wrong. Please try again.');
        setSaving(false);
      });
  }

  // ============================================================
  // TAB LABELS — UNCHANGED
  // ============================================================
  const tabLabels = {
    basic: '📋 Basic',
    details: '🏷️ Details',
    images: '📸 Images',
    features: '⭐ Features',
    amenities: '🛋️ Amenities',
    areaGuide: '🗺️ Area Guide'
  };

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' } },
      React.createElement(Loader2, { size: 32, style: { animation: 'spin 1s linear infinite', color: PLZ.blue } })
    );
  }

  // ============================================================
  // RENDER: MAIN
  // ============================================================
  return React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '16px', fontFamily: PLZ.font } },
    // Delete Confirmation Modal
    React.createElement(DeleteConfirmModal, {
      isOpen: deleteModalOpen,
      onClose: handleCancelDelete,
      onConfirm: handleConfirmDelete,
      itemName: roomToDelete?.name || '',
      itemType: config.singular
    }),

    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        React.createElement('button', {
          onClick: onBack,
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }
        }, React.createElement(ArrowLeft, { size: 20, color: PLZ.body })),
        React.createElement('div', null,
          React.createElement('h2', { style: { fontSize: '24px', fontWeight: '700', color: PLZ.ink, margin: 0 } }, config.plural),
          React.createElement('p', { style: { fontSize: '14px', color: PLZ.muted, margin: '2px 0 0' } },
            'Manage your ' + config.plural.toLowerCase()
          )
        )
      ),
      React.createElement('button', {
        onClick: openAddModal,
        // WHY: soft rectangle (radiusSm) instead of full-pill — matches his button convention.
        style: { padding: '10px 20px', background: PLZ.blue, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
      }, React.createElement(Plus, { size: 16 }), config.actionLabel)
    ),

    // Empty State / List
    rooms.length === 0 ?
      React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: PLZ.radiusLg, border: `1px solid ${PLZ.line}`, boxShadow: PLZ.shadowSm } },
        React.createElement(IconComponent, { size: 48, color: PLZ.muted }),
        React.createElement('h3', { style: { fontSize: '18px', fontWeight: '600', color: PLZ.ink, marginTop: '12px' } }, 'Nothing here yet'),
        React.createElement('p', { style: { color: PLZ.muted, fontSize: '14px', marginTop: '4px' } }, 'Add your first ' + config.singular.toLowerCase()),
        React.createElement('button', {
          onClick: openAddModal,
          style: { marginTop: '16px', padding: '10px 24px', background: PLZ.blue, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, cursor: 'pointer' }
        }, config.actionLabel)
      ) :
      React.createElement('div', { style: { display: 'grid', gap: '12px' } },
        rooms.map(function(room) {
          const displayPrice = room.base_price || room.price_per_night || 0;
          const imageCount = (room.images || []).length;
          const featureCount = (room.features || []).length;
          const capacityValue = room.included_guests || room.capacity || 0;

          return React.createElement('div', { key: room.id, style: { background: 'white', borderRadius: PLZ.radiusMd, padding: '16px 20px', border: `1px solid ${PLZ.line}`, boxShadow: PLZ.shadowSm, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
            React.createElement('div', null,
              React.createElement('h4', { style: { fontSize: '16px', fontWeight: '600', color: PLZ.ink, margin: 0 } }, room.name),
              React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' } },
                room.type && React.createElement('span', { style: { fontSize: '12px', color: PLZ.muted } }, room.type),
                config.basic.showCapacity && capacityValue > 0 && React.createElement('span', { style: { fontSize: '12px', color: PLZ.muted } },
                  React.createElement(Users, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
                  config.basic.capacityLabel + ': ' + capacityValue
                ),
                React.createElement('span', { style: { fontSize: '12px', fontWeight: '600', color: PLZ.blue } },
                  '₦' + (displayPrice).toLocaleString() + (config.basic.priceUnit ? ' ' + config.basic.priceUnit : '')
                ),
                imageCount > 0 && React.createElement('span', { style: { fontSize: '11px', color: PLZ.muted } },
                  React.createElement(Image, { size: 10, style: { display: 'inline', marginRight: '2px' } }),
                  imageCount + ' images'
                ),
                featureCount > 0 && React.createElement('span', { style: { fontSize: '11px', color: PLZ.muted } },
                  React.createElement(Star, { size: 10, style: { display: 'inline', marginRight: '2px' } }),
                  featureCount + ' features'
                )
              )
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
              React.createElement('button', {
                onClick: function() { openEditModal(room); },
                style: { padding: '6px 12px', background: PLZ.surface, border: 'none', borderRadius: PLZ.radiusSm, cursor: 'pointer', color: PLZ.body }
              }, React.createElement(Edit3, { size: 16 })),
              React.createElement('button', {
                onClick: function() { handleDeleteClick(room); },
                style: { padding: '6px 12px', background: PLZ.dangerTint, border: 'none', borderRadius: PLZ.radiusSm, cursor: 'pointer', color: PLZ.danger }
              }, React.createElement(Trash2, { size: 16 }))
            )
          );
        })
      ),

    // ============================================================
    // MODAL — restyled only
    // ============================================================
    showModal && React.createElement('div', { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: PLZ.backdrop, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' } },
      React.createElement('div', { style: { background: 'white', borderRadius: PLZ.radiusXl, maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: PLZ.shadowMd } },
        // Modal Header
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
          React.createElement('h3', { style: { fontSize: '20px', fontWeight: '600', color: PLZ.ink, margin: 0 } },
            editingRoom ? 'Edit ' + config.singular : config.actionLabel
          ),
          React.createElement('button', {
            onClick: closeModal,
            style: { background: 'none', border: 'none', cursor: 'pointer' }
          }, React.createElement(X, { size: 20, color: PLZ.muted }))
        ),

        // TABS
        React.createElement('div', { style: { display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', borderBottom: `1px solid ${PLZ.line}`, paddingBottom: '12px' } },
          config.tabs.map(function(tab) {
            return React.createElement('button', {
              key: tab,
              onClick: function() { setActiveTab(tab); },
              style: {
                padding: '8px 16px',
                borderRadius: '999px',
                border: activeTab === tab ? `2px solid ${PLZ.blue}` : `1px solid ${PLZ.line}`,
                backgroundColor: activeTab === tab ? PLZ.blueTint : 'white',
                color: activeTab === tab ? PLZ.blue : PLZ.muted,
                fontSize: '13px',
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }
            }, tabLabels[tab]);
          })
        ),

        // ============================================================
        // TAB: BASIC
        // ============================================================
        activeTab === 'basic' && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } }, config.basic.nameLabel + ' *'),
            React.createElement('input', {
              type: 'text',
              value: formData.name,
              onChange: function(e) { handleChange('name', e.target.value); },
              placeholder: config.basic.namePlaceholder,
              style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', outline: 'none' }
            })
          ),
          config.basic.showType && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } }, config.basic.typeLabel),
            React.createElement('select', {
              value: formData.type,
              onChange: function(e) { handleChange('type', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', background: 'white', outline: 'none' }
            }, config.basic.typeOptions.map(function(opt) {
              return React.createElement('option', { key: opt, value: opt }, opt);
            }))
          ),
          config.basic.showAddress && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } },
              React.createElement(MapPin, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Address'
            ),
            React.createElement('input', {
              type: 'text',
              value: formData.address,
              onChange: function(e) { handleChange('address', e.target.value); },
              placeholder: 'e.g., 7 Obasa Road, Ikeja, Lagos',
              style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', outline: 'none' }
            })
          ),
          config.basic.showDescription && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } },
              React.createElement(FileText, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              config.basic.descriptionLabel
            ),
            React.createElement('textarea', {
              value: formData.venue_description || formData.description,
              onChange: function(e) { handleChange('venue_description', e.target.value); },
              placeholder: config.basic.descriptionPlaceholder,
              rows: 3,
              style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', resize: 'vertical', outline: 'none' }
            })
          ),
          // Price + Capacity
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: config.basic.showCapacity ? '1fr 1fr' : '1fr', gap: '12px' } },
            config.basic.showCapacity && React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } }, config.basic.capacityLabel),
              React.createElement('input', {
                type: 'number',
                value: formData.capacity,
                onChange: function(e) { handleChange('capacity', e.target.value); },
                placeholder: config.basic.capacityPlaceholder,
                style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', outline: 'none' }
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } },
                config.basic.priceLabel + ' (₦) *'
              ),
              React.createElement('div', { style: { position: 'relative' } },
                React.createElement('span', { style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: PLZ.muted, fontSize: '14px' } }, '₦'),
                React.createElement('input', {
                  type: 'number',
                  value: formData.price_per_night,
                  onChange: function(e) { handleChange('price_per_night', e.target.value); },
                  placeholder: 'e.g., 5000',
                  style: { width: '100%', padding: '10px 14px 10px 32px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', outline: 'none' }
                })
              ),
              config.basic.priceUnit && React.createElement('p', { style: { fontSize: '11px', color: PLZ.muted, marginTop: '4px' } },
                'Displayed as ' + config.basic.priceUnit.trim()
              )
            )
          )
        ),

        // ============================================================
        // TAB: PROPERTY DETAILS
        // ============================================================
        activeTab === 'details' && config.details && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          React.createElement('p', { style: { fontSize: '13px', color: PLZ.muted, marginBottom: '8px' } },
            'Property details specific to this ' + config.singular.toLowerCase()
          ),
          config.details.showPropertyType && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } },
              React.createElement(Building, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              config.details.propertyTypeLabel || 'Property Type'
            ),
            React.createElement('select', {
              value: formData.property_type,
              onChange: function(e) { handleChange('property_type', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', background: 'white', outline: 'none' }
            }, (config.details.propertyTypeOptions || []).map(function(opt) {
              return React.createElement('option', { key: opt, value: opt }, opt);
            }))
          ),
          config.details.showListingStatus && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } },
              React.createElement(Tag, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Listing Status'
            ),
            React.createElement('select', {
              value: formData.listing_status,
              onChange: function(e) { handleChange('listing_status', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', background: 'white', outline: 'none' }
            }, listingStatusOptions.map(function(opt) {
              return React.createElement('option', { key: opt.value, value: opt.value }, opt.label);
            }))
          ),
          config.details.showFurnishing && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } },
              React.createElement(Sofa, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Furnishing Status'
            ),
            React.createElement('select', {
              value: formData.furnishing_status,
              onChange: function(e) { handleChange('furnishing_status', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', background: 'white', outline: 'none' }
            }, furnishingOptions.map(function(opt) {
              return React.createElement('option', { key: opt.value, value: opt.value }, opt.label);
            }))
          ),
          config.details.showYearBuilt && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } },
              React.createElement(Calendar, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Year Built'
            ),
            React.createElement('input', {
              type: 'number',
              value: formData.year_built,
              onChange: function(e) { handleChange('year_built', e.target.value); },
              placeholder: 'e.g., 2020',
              style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', outline: 'none' }
            })
          ),
          (config.details.showBathrooms || config.details.showParking) && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            config.details.showBathrooms && React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } },
                React.createElement(Bath, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
                'Bathrooms'
              ),
              React.createElement('input', {
                type: 'number',
                value: formData.bathrooms,
                onChange: function(e) { handleChange('bathrooms', parseInt(e.target.value) || 0); },
                placeholder: '0',
                style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', outline: 'none' }
              })
            ),
            config.details.showParking && React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: PLZ.body, marginBottom: '4px' } },
                React.createElement(Car, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
                'Parking Spaces'
              ),
              React.createElement('input', {
                type: 'number',
                value: formData.parking_spaces,
                onChange: function(e) { handleChange('parking_spaces', parseInt(e.target.value) || 0); },
                placeholder: '0',
                style: { width: '100%', padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', outline: 'none' }
              })
            )
          )
        ),

        // ============================================================
        // TAB: IMAGES
        // ============================================================
        activeTab === 'images' && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: PLZ.muted, marginBottom: '16px' } },
            'Upload images to showcase this ' + config.singular.toLowerCase() + '. Maximum 16 images allowed. The first image will be the primary display image.'
          ),

          React.createElement('div', { style: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '12px', padding: '8px 12px',
            backgroundColor: PLZ.surface, borderRadius: PLZ.radiusSm
          } },
            React.createElement('span', { style: { fontSize: '13px', color: PLZ.body } },
              React.createElement(Image, { size: 16, style: { display: 'inline', marginRight: '6px' } }),
              (formData.images || []).length + ' / 16 images'
            ),
            (formData.images || []).length >= 16 &&
              React.createElement('span', { style: { fontSize: '12px', color: PLZ.danger } }, 'Limit reached')
          ),

          React.createElement('div', {
            onDrop: handleDragDrop,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            style: {
              border: `2px dashed ${PLZ.line}`,
              borderRadius: PLZ.radiusMd,
              padding: '24px',
              textAlign: 'center',
              marginBottom: '16px',
              transition: 'all 0.2s',
              backgroundColor: 'transparent'
            }
          },
            React.createElement(Upload, { size: 32, color: PLZ.muted, style: { marginBottom: '8px' } }),
            React.createElement('p', { style: { fontSize: '14px', color: PLZ.muted, marginBottom: '4px' } },
              'Drag and drop images here, or'
            ),
            React.createElement('label', { style: {
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: (uploading || (formData.images || []).length >= 16 || !editingRoom) ? PLZ.muted : PLZ.blue,
              color: 'white',
              borderRadius: PLZ.radiusSm,
              cursor: (uploading || (formData.images || []).length >= 16 || !editingRoom) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginTop: '8px'
            } },
              uploading ? 'Uploading...' : 'Choose Images',
              React.createElement('input', {
                id: 'venueImageInput',
                type: 'file',
                accept: 'image/*',
                multiple: false,
                onChange: handleVenueImageUpload,
                disabled: uploading || (formData.images || []).length >= 16 || !editingRoom,
                style: { display: 'none' }
              })
            ),
            uploading && React.createElement('div', { style: {
              marginTop: '12px', height: '4px', background: PLZ.line, borderRadius: '4px', overflow: 'hidden'
            } },
              React.createElement('div', { style: {
                width: uploadProgress + '%', height: '100%', background: PLZ.blue, transition: 'width 0.3s ease'
              } })
            ),
            React.createElement('p', { style: { fontSize: '12px', color: PLZ.muted, marginTop: '8px' } },
              'JPEG, PNG, WEBP up to 5MB each'
            ),
            !editingRoom && React.createElement('p', { style: { fontSize: '12px', color: PLZ.warning, marginTop: '4px' } },
              '⚠️ Save this ' + config.singular.toLowerCase() + ' first, then upload images'
            )
          ),

          (formData.images || []).length === 0 ?
            React.createElement('div', { style: {
              padding: '40px 20px', textAlign: 'center',
              backgroundColor: PLZ.surface, borderRadius: PLZ.radiusMd, border: `1px solid ${PLZ.line}`
            } },
              React.createElement(Camera, { size: 40, color: PLZ.muted }),
              React.createElement('p', { style: { marginTop: '12px', color: PLZ.muted, fontSize: '14px' } }, 'No images uploaded yet'),
              React.createElement('p', { style: { color: PLZ.muted, fontSize: '12px' } }, 'Upload images to showcase this ' + config.singular.toLowerCase())
            ) :
            React.createElement('div', { style: {
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '12px'
            } },
              (formData.images || []).map(function(url, idx) {
                return React.createElement('div', {
                  key: idx,
                  style: {
                    position: 'relative',
                    aspectRatio: '1/1',
                    borderRadius: PLZ.radiusSm,
                    overflow: 'hidden',
                    border: idx === 0 ? `3px solid ${PLZ.blue}` : `1px solid ${PLZ.line}`,
                    backgroundColor: PLZ.surface
                  }
                },
                  React.createElement('img', {
                    src: url,
                    alt: 'Image ' + (idx + 1),
                    style: { width: '100%', height: '100%', objectFit: 'cover' }
                  }),
                  idx === 0 &&
                    React.createElement('span', {
                      style: {
                        position: 'absolute', top: '6px', left: '6px',
                        backgroundColor: PLZ.blue, color: 'white',
                        fontSize: '9px', fontWeight: '700',
                        padding: '2px 8px', borderRadius: '999px',
                        textTransform: 'uppercase'
                      }
                    }, 'Primary'),
                  idx > 0 &&
                    React.createElement('span', {
                      style: {
                        position: 'absolute', top: '6px', left: '6px',
                        backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                        fontSize: '10px', fontWeight: '600',
                        padding: '2px 8px', borderRadius: '999px'
                      }
                    }, idx + 1),
                  React.createElement('div', {
                    style: {
                      position: 'absolute', bottom: '6px',
                      left: '50%', transform: 'translateX(-50%)',
                      display: 'flex', gap: '4px'
                    }
                  },
                    idx > 0 &&
                      React.createElement('button', {
                        onClick: function() { moveImageUp(idx); },
                        style: {
                          background: 'rgba(0,0,0,0.7)', color: 'white',
                          border: 'none', borderRadius: '4px',
                          width: '28px', height: '28px',
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px'
                        }
                      }, '↑'),
                    idx < (formData.images || []).length - 1 &&
                      React.createElement('button', {
                        onClick: function() { moveImageDown(idx); },
                        style: {
                          background: 'rgba(0,0,0,0.7)', color: 'white',
                          border: 'none', borderRadius: '4px',
                          width: '28px', height: '28px',
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px'
                        }
                      }, '↓')
                  ),
                  React.createElement('button', {
                    onClick: function() { removeVenueImage(idx); },
                    style: {
                      position: 'absolute', top: '6px', right: '6px',
                      backgroundColor: PLZ.danger,
                      color: 'white', border: 'none',
                      borderRadius: '50%', width: '28px', height: '28px',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px'
                    }
                  }, '×')
                );
              })
            ),

          (formData.images || []).length > 1 &&
            React.createElement('p', { style: {
              fontSize: '12px', color: PLZ.muted,
              textAlign: 'center', marginTop: '12px'
            } },
              '⬆⬇ Use the arrows to reorder. First image is primary.'
            )
        ),

        // ============================================================
        // TAB: FEATURES
        // ============================================================
        activeTab === 'features' && config.showFeatures && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: PLZ.muted, marginBottom: '16px' } },
            'Features specific to this ' + config.singular.toLowerCase()
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' } },
            React.createElement('input', {
              type: 'text',
              value: formData.newFeature,
              onChange: function(e) { handleChange('newFeature', e.target.value); },
              placeholder: 'Enter a feature',
              style: { flex: 2, padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', minWidth: '150px', outline: 'none' }
            }),
            React.createElement('select', {
              value: formData.newFeatureCategory,
              onChange: function(e) { handleChange('newFeatureCategory', e.target.value); },
              style: { flex: 1, padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '13px', backgroundColor: 'white', minWidth: '120px', outline: 'none' }
            }, featureCategories.map(function(cat) {
              return React.createElement('option', { key: cat.id, value: cat.id }, cat.label);
            })),
            React.createElement('button', {
              onClick: addFeature,
              style: { padding: '10px 20px', backgroundColor: PLZ.blue, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }
            }, 'Add')
          ),
          featureCategories.map(function(category) {
            var categoryFeatures = (formData.features || []).filter(function(f) { return f.category === category.id; });
            if (categoryFeatures.length === 0) return null;
            return React.createElement('div', { key: category.id, style: { marginBottom: '12px' } },
              React.createElement('h4', { style: { fontSize: '13px', fontWeight: '600', color: PLZ.body, marginBottom: '8px' } }, category.label),
              React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                categoryFeatures.map(function(feature) {
                  return React.createElement('div', { key: feature.id, style: {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', backgroundColor: PLZ.blueTint,
                    borderRadius: '20px', fontSize: '13px', color: PLZ.blue
                  } },
                    React.createElement('span', null, feature.name),
                    React.createElement('button', {
                      onClick: function() { removeFeature(feature.id); },
                      style: { background: 'none', border: 'none', cursor: 'pointer', color: PLZ.muted, padding: '0 4px', fontSize: '16px' }
                    }, '×')
                  );
                })
              )
            );
          }),
          (formData.features || []).length === 0 && React.createElement('p', { style: { textAlign: 'center', color: PLZ.muted, padding: '20px' } },
            'No features added yet.'
          )
        ),

        // ============================================================
        // TAB: AMENITIES
        // ============================================================
        activeTab === 'amenities' && config.showAmenities && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: PLZ.muted, marginBottom: '16px' } },
            'Amenities specific to this ' + config.singular.toLowerCase()
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' } },
            React.createElement('input', {
              type: 'text',
              value: formData.newAmenity,
              onChange: function(e) { handleChange('newAmenity', e.target.value); },
              placeholder: 'Enter an amenity',
              style: { flex: 2, padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', minWidth: '150px', outline: 'none' }
            }),
            React.createElement('select', {
              value: formData.newAmenityCategory,
              onChange: function(e) { handleChange('newAmenityCategory', e.target.value); },
              style: { flex: 1, padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '13px', backgroundColor: 'white', minWidth: '120px', outline: 'none' }
            }, amenityCategories.map(function(cat) {
              return React.createElement('option', { key: cat.id, value: cat.id }, cat.label);
            })),
            React.createElement('button', {
              onClick: addAmenity,
              // WHY: keep green on "add amenity" so green = amenity, blue = feature.
              // Now sourced from PLZ.success instead of generic #10b981.
              style: { padding: '10px 20px', backgroundColor: PLZ.success, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }
            }, 'Add')
          ),
          amenityCategories.map(function(category) {
            var categoryAmenities = (formData.amenities || []).filter(function(a) { return a.category === category.id; });
            if (categoryAmenities.length === 0) return null;
            return React.createElement('div', { key: category.id, style: { marginBottom: '12px' } },
              React.createElement('h4', { style: { fontSize: '13px', fontWeight: '600', color: PLZ.body, marginBottom: '8px' } }, category.label),
              React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                categoryAmenities.map(function(amenity) {
                  return React.createElement('div', { key: amenity.id, style: {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', backgroundColor: PLZ.successTint,
                    borderRadius: '20px', fontSize: '13px', color: PLZ.success
                  } },
                    React.createElement('span', null, amenity.name),
                    React.createElement('button', {
                      onClick: function() { removeAmenity(amenity.id); },
                      style: { background: 'none', border: 'none', cursor: 'pointer', color: PLZ.muted, padding: '0 4px', fontSize: '16px' }
                    }, '×')
                  );
                })
              )
            );
          }),
          (formData.amenities || []).length === 0 && React.createElement('p', { style: { textAlign: 'center', color: PLZ.muted, padding: '20px' } },
            'No amenities added yet.'
          )
        ),

        // ============================================================
        // TAB: AREA GUIDE
        // ============================================================
        activeTab === 'areaGuide' && config.showAreaGuide && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: PLZ.muted, marginBottom: '16px' } },
            'Area guide specific to this ' + config.singular.toLowerCase()
          ),
          React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' } },
            iconOptions.map(function(icon) {
              var IconComponent2 = iconMap[icon.value];
              return React.createElement('button', {
                key: icon.value,
                onClick: function() { handleChange('newAreaIcon', icon.value); },
                style: {
                  padding: '6px 10px',
                  borderRadius: PLZ.radiusSm,
                  border: formData.newAreaIcon === icon.value ? `2px solid ${PLZ.blue}` : `1px solid ${PLZ.line}`,
                  background: formData.newAreaIcon === icon.value ? PLZ.blueTint : 'white',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                  color: formData.newAreaIcon === icon.value ? PLZ.blue : PLZ.body
                }
              },
                IconComponent2 ? React.createElement(IconComponent2, { size: 16, color: formData.newAreaIcon === icon.value ? PLZ.blue : PLZ.muted }) : null,
                icon.label
              );
            })
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' } },
            React.createElement('input', {
              type: 'text',
              value: formData.newAreaTitle,
              onChange: function(e) { handleChange('newAreaTitle', e.target.value); },
              placeholder: 'Section Title',
              style: { flex: 2, padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', minWidth: '150px', outline: 'none' }
            }),
            React.createElement('textarea', {
              value: formData.newAreaContent,
              onChange: function(e) { handleChange('newAreaContent', e.target.value); },
              placeholder: 'Section Content',
              style: { flex: 3, padding: '10px 14px', border: `1.5px solid ${PLZ.line}`, borderRadius: PLZ.radiusSm, fontSize: '14px', minWidth: '200px', resize: 'vertical', outline: 'none' },
              rows: '2'
            }),
            React.createElement('button', {
              onClick: addAreaSection,
              // WHY: warm "informational" hue for area-guide add, from PLZ.warning.
              style: { padding: '10px 20px', backgroundColor: PLZ.warning, color: 'white', border: 'none', borderRadius: PLZ.radiusSm, fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }
            }, 'Add')
          ),
          (formData.areaGuide || []).map(function(section) {
            var IconComponent2 = iconMap[section.icon] || Home;
            return React.createElement('div', { key: section.id, style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', backgroundColor: PLZ.warningTint,
              borderRadius: PLZ.radiusSm, marginBottom: '8px'
            } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 } },
                IconComponent2 ? React.createElement(IconComponent2, { size: 20, color: PLZ.warning }) : null,
                React.createElement('div', null,
                  React.createElement('div', { style: { fontWeight: '600', fontSize: '14px', color: PLZ.ink } }, section.title),
                  React.createElement('div', { style: { fontSize: '13px', color: PLZ.body } }, section.content)
                )
              ),
              React.createElement('button', {
                onClick: function() { removeAreaSection(section.id); },
                style: { background: 'none', border: 'none', cursor: 'pointer', color: PLZ.muted, fontSize: '18px', padding: '0 8px' }
              }, '×')
            );
          }),
          (formData.areaGuide || []).length === 0 && React.createElement('p', { style: { textAlign: 'center', color: PLZ.muted, padding: '20px' } },
            'No area guide sections added yet.'
          )
        ),

        // ============================================================
        // SAVE BUTTON
        // ============================================================
        React.createElement('div', { style: { marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' } },
          React.createElement('button', {
            onClick: closeModal,
            style: { padding: '10px 24px', backgroundColor: PLZ.surface, color: PLZ.body, border: 'none', borderRadius: PLZ.radiusSm, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }
          }, 'Cancel'),
          React.createElement('button', {
            onClick: handleSave,
            disabled: saving,
            style: {
              padding: '10px 24px',
              backgroundColor: saving ? PLZ.muted : PLZ.blue,
              color: 'white', border: 'none', borderRadius: PLZ.radiusSm,
              fontSize: '14px', fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }
          }, saving ? React.createElement(Loader2, { size: 18, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Save, { size: 18 }), saving ? 'Saving...' : 'Save')
        )
      )
    )
  );
}

export default RoomPage;