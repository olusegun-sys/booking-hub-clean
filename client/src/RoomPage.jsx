// FILE: client/src/RoomPage.jsx
// BUSINESS-CATEGORY-AWARE FORM EDITOR
// Each business type (Hotel, Restaurant, Spa, etc.) sees only relevant fields
// UPDATED: Config-driven tabs and fields based on business_type
// UPDATED: Professional delete confirmation modal
// UPDATED: Images tab with drag-drop upload, reorder, primary badge

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
// BUSINESS TYPE CONFIGURATION
// Each business type has its own form structure
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
// DELETE CONFIRMATION MODAL
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
        backgroundColor: 'rgba(0,0,0,0.6)',
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
          borderRadius: isMobile ? '20px' : '24px',
          maxWidth: '480px',
          width: '100%',
          padding: isMobile ? '28px 24px' : '40px 32px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
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
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }
        },
        React.createElement(AlertTriangle, { size: isMobile ? 28 : 32, color: '#dc2626' })
      ),
      React.createElement(
        'h3',
        {
          style: {
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#0f172a',
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
            color: '#475569',
            textAlign: 'center',
            lineHeight: '1.6',
            margin: '0 0 24px 0'
          }
        },
        'You are about to delete ',
        React.createElement('strong', { style: { color: '#0f172a' } }, '"' + itemName + '"'),
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
              color: '#475569',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
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
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
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

  const token = localStorage.getItem('auth_token');
  const isMobile = window.innerWidth < 640;

  // ============================================================
  // FORM STATE
  // ============================================================
  const [formData, setFormData] = useState({
    // Basic
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
    
    // Property Details
    property_type: '',
    bathrooms: 0,
    parking_spaces: 0,
    year_built: '',
    furnishing_status: 'unfurnished',
    listing_status: 'for_rent',
    
    // Features
    features: [],
    newFeature: '',
    newFeatureCategory: 'interior',
    
    // Amenities
    amenities: [],
    newAmenity: '',
    newAmenityCategory: 'interior',
    
    // Area Guide
    areaGuide: [],
    newAreaTitle: '',
    newAreaContent: '',
    newAreaIcon: 'Home'
  });

  // ============================================================
  // FETCH ROOMS
  // ============================================================
  useEffect(function() {
    fetchRooms();
  }, []);

  function fetchRooms() {
    setLoading(true);
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
  // MODAL CONTROLS
  // ============================================================
  function getDefaultFormData() {
    // Default to the first option from config type options
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
  // DELETE HANDLER
  // ============================================================
  function handleDeleteClick(room) {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  }

  function handleConfirmDelete() {
    if (!roomToDelete) return;
    const roomId = roomToDelete.id;
    
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
  // FORM HANDLERS
  // ============================================================
  function handleChange(field, value) {
    setFormData(function(prev) {
      return { ...prev, [field]: value };
    });
  }

  // ============================================================
  // IMAGE UPLOAD
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
        .then(function(res) { return res.json(); })
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
        .catch(function() {
          showError('Something went wrong. Please try again.');
          setUploading(false);
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
    e.currentTarget.style.borderColor = '#4F46E5';
    e.currentTarget.style.backgroundColor = '#EEF2FF';
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.backgroundColor = 'transparent';
  }

  // ============================================================
  // FEATURES / AMENITIES / AREA GUIDE HANDLERS
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
  // SAVE
  // ============================================================
  function handleSave() {
    if (!formData.name.trim()) {
      showError(config.basic.nameLabel + ' is required');
      return;
    }
    
    // Price validation
    let priceValue = parseFloat(formData.price_per_night) || parseFloat(formData.base_price);
    if (!priceValue || priceValue <= 0) {
      showError('Valid ' + config.basic.priceLabel.toLowerCase() + ' is required');
      return;
    }

    // Capacity validation (only if applicable)
    let capacity = 1;
    if (config.basic.showCapacity) {
      capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity <= 0) {
        capacity = 1;
      }
    }

    setSaving(true);
    const url = editingRoom 
      ? API_BASE + '/api/businesses/' + business.id + '/rooms/' + editingRoom.id
      : API_BASE + '/api/businesses/' + business.id + '/rooms/create';
    const method = editingRoom ? 'PUT' : 'POST';

    // Build payload — only include fields that are relevant
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

    // Only add details fields if the tab was shown
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

    // Only add features/amenities/area guide if shown
    if (config.showFeatures) {
      payload.features = formData.features || [];
    }
    if (config.showAmenities) {
      payload.amenities = formData.amenities || [];
    }
    if (config.showAreaGuide) {
      payload.area_guide = formData.areaGuide || [];
    }

    // Event hall special handling
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
  // TAB LABELS
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
  // RENDER
  // ============================================================
  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' } },
      React.createElement(Loader2, { size: 32, style: { animation: 'spin 1s linear infinite', color: '#4f46e5' } })
    );
  }

  return React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '16px' } },
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
        }, React.createElement(ArrowLeft, { size: 20, color: '#475569' })),
        React.createElement('div', null,
          React.createElement('h2', { style: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 } }, config.plural),
          React.createElement('p', { style: { fontSize: '14px', color: '#64748b', margin: '2px 0 0' } }, 
            'Manage your ' + config.plural.toLowerCase()
          )
        )
      ),
      React.createElement('button', { 
        onClick: openAddModal, 
        style: { padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
      }, React.createElement(Plus, { size: 16 }), config.actionLabel)
    ),

    // Empty State / List
    rooms.length === 0 ?
      React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' } },
        React.createElement(IconComponent, { size: 48, color: '#cbd5e1' }),
        React.createElement('h3', { style: { fontSize: '18px', fontWeight: '600', color: '#0f172a', marginTop: '12px' } }, 'Nothing here yet'),
        React.createElement('p', { style: { color: '#94a3b8', fontSize: '14px', marginTop: '4px' } }, 'Add your first ' + config.singular.toLowerCase()),
        React.createElement('button', { 
          onClick: openAddModal, 
          style: { marginTop: '16px', padding: '10px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer' }
        }, config.actionLabel)
      ) :
      React.createElement('div', { style: { display: 'grid', gap: '12px' } },
        rooms.map(function(room) {
          const displayPrice = room.base_price || room.price_per_night || 0;
          const imageCount = (room.images || []).length;
          const featureCount = (room.features || []).length;
          const capacityValue = room.included_guests || room.capacity || 0;
          
          return React.createElement('div', { key: room.id, style: { background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
            React.createElement('div', null,
              React.createElement('h4', { style: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 } }, room.name),
              React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' } },
                room.type && React.createElement('span', { style: { fontSize: '12px', color: '#64748b' } }, room.type),
                config.basic.showCapacity && capacityValue > 0 && React.createElement('span', { style: { fontSize: '12px', color: '#64748b' } }, 
                  React.createElement(Users, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
                  config.basic.capacityLabel + ': ' + capacityValue
                ),
                React.createElement('span', { style: { fontSize: '12px', fontWeight: '600', color: '#4f46e5' } },
                  '₦' + (displayPrice).toLocaleString() + (config.basic.priceUnit ? ' ' + config.basic.priceUnit : '')
                ),
                imageCount > 0 && React.createElement('span', { style: { fontSize: '11px', color: '#64748b' } },
                  React.createElement(Image, { size: 10, style: { display: 'inline', marginRight: '2px' } }),
                  imageCount + ' images'
                ),
                featureCount > 0 && React.createElement('span', { style: { fontSize: '11px', color: '#64748b' } },
                  React.createElement(Star, { size: 10, style: { display: 'inline', marginRight: '2px' } }),
                  featureCount + ' features'
                )
              )
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
              React.createElement('button', { 
                onClick: function() { openEditModal(room); }, 
                style: { padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569' }
              }, React.createElement(Edit3, { size: 16 })),
              React.createElement('button', { 
                onClick: function() { handleDeleteClick(room); }, 
                style: { padding: '6px 12px', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }
              }, React.createElement(Trash2, { size: 16 }))
            )
          );
        })
      ),

    // ============================================================
    // MODAL
    // ============================================================
    showModal && React.createElement('div', { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' } },
      React.createElement('div', { style: { background: 'white', borderRadius: '20px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' } },
        // Modal Header
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
          React.createElement('h3', { style: { fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 } }, 
            editingRoom ? 'Edit ' + config.singular : config.actionLabel
          ),
          React.createElement('button', { 
            onClick: closeModal, 
            style: { background: 'none', border: 'none', cursor: 'pointer' }
          }, React.createElement(X, { size: 20, color: '#64748b' }))
        ),

        // TABS - conditionally rendered based on config.tabs
        React.createElement('div', { style: { display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' } },
          config.tabs.map(function(tab) {
            return React.createElement('button', {
              key: tab,
              onClick: function() { setActiveTab(tab); },
              style: {
                padding: '8px 16px',
                borderRadius: '20px',
                border: activeTab === tab ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                backgroundColor: activeTab === tab ? '#EEF2FF' : 'white',
                color: activeTab === tab ? '#4f46e5' : '#64748B',
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
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, config.basic.nameLabel + ' *'),
            React.createElement('input', {
              type: 'text',
              value: formData.name,
              onChange: function(e) { handleChange('name', e.target.value); },
              placeholder: config.basic.namePlaceholder,
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
            })
          ),
          config.basic.showType && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, config.basic.typeLabel),
            React.createElement('select', {
              value: formData.type,
              onChange: function(e) { handleChange('type', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: 'white' }
            }, config.basic.typeOptions.map(function(opt) { 
              return React.createElement('option', { key: opt, value: opt }, opt);
            }))
          ),
          config.basic.showAddress && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
              React.createElement(MapPin, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Address'
            ),
            React.createElement('input', {
              type: 'text',
              value: formData.address,
              onChange: function(e) { handleChange('address', e.target.value); },
              placeholder: 'e.g., 7 Obasa Road, Ikeja, Lagos',
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
            })
          ),
          config.basic.showDescription && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
              React.createElement(FileText, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              config.basic.descriptionLabel
            ),
            React.createElement('textarea', {
              value: formData.venue_description || formData.description,
              onChange: function(e) { handleChange('venue_description', e.target.value); },
              placeholder: config.basic.descriptionPlaceholder,
              rows: 3,
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', resize: 'vertical' }
            })
          ),
          // Price + Capacity layout
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: config.basic.showCapacity ? '1fr 1fr' : '1fr', gap: '12px' } },
            config.basic.showCapacity && React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, config.basic.capacityLabel),
              React.createElement('input', {
                type: 'number',
                value: formData.capacity,
                onChange: function(e) { handleChange('capacity', e.target.value); },
                placeholder: config.basic.capacityPlaceholder,
                style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, 
                config.basic.priceLabel + ' (₦) *'
              ),
              React.createElement('div', { style: { position: 'relative' } },
                React.createElement('span', { style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' } }, '₦'),
                React.createElement('input', {
                  type: 'number',
                  value: formData.price_per_night,
                  onChange: function(e) { handleChange('price_per_night', e.target.value); },
                  placeholder: 'e.g., 5000',
                  style: { width: '100%', padding: '10px 14px 10px 32px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
                })
              ),
              config.basic.priceUnit && React.createElement('p', { style: { fontSize: '11px', color: '#94a3b8', marginTop: '4px' } }, 
                'Displayed as ' + config.basic.priceUnit.trim()
              )
            )
          )
        ),

        // ============================================================
        // TAB: PROPERTY DETAILS (only if config.details exists)
        // ============================================================
        activeTab === 'details' && config.details && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '8px' } },
            'Property details specific to this ' + config.singular.toLowerCase()
          ),
          config.details.showPropertyType && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
              React.createElement(Building, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              config.details.propertyTypeLabel || 'Property Type'
            ),
            React.createElement('select', {
              value: formData.property_type,
              onChange: function(e) { handleChange('property_type', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: 'white' }
            }, (config.details.propertyTypeOptions || []).map(function(opt) {
              return React.createElement('option', { key: opt, value: opt }, opt);
            }))
          ),
          config.details.showListingStatus && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
              React.createElement(Tag, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Listing Status'
            ),
            React.createElement('select', {
              value: formData.listing_status,
              onChange: function(e) { handleChange('listing_status', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: 'white' }
            }, listingStatusOptions.map(function(opt) {
              return React.createElement('option', { key: opt.value, value: opt.value }, opt.label);
            }))
          ),
          config.details.showFurnishing && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
              React.createElement(Sofa, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Furnishing Status'
            ),
            React.createElement('select', {
              value: formData.furnishing_status,
              onChange: function(e) { handleChange('furnishing_status', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: 'white' }
            }, furnishingOptions.map(function(opt) {
              return React.createElement('option', { key: opt.value, value: opt.value }, opt.label);
            }))
          ),
          config.details.showYearBuilt && React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
              React.createElement(Calendar, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Year Built'
            ),
            React.createElement('input', {
              type: 'number',
              value: formData.year_built,
              onChange: function(e) { handleChange('year_built', e.target.value); },
              placeholder: 'e.g., 2020',
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
            })
          ),
          (config.details.showBathrooms || config.details.showParking) && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            config.details.showBathrooms && React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
                React.createElement(Bath, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
                'Bathrooms'
              ),
              React.createElement('input', {
                type: 'number',
                value: formData.bathrooms,
                onChange: function(e) { handleChange('bathrooms', parseInt(e.target.value) || 0); },
                placeholder: '0',
                style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
              })
            ),
            config.details.showParking && React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
                React.createElement(Car, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
                'Parking Spaces'
              ),
              React.createElement('input', {
                type: 'number',
                value: formData.parking_spaces,
                onChange: function(e) { handleChange('parking_spaces', parseInt(e.target.value) || 0); },
                placeholder: '0',
                style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
              })
            )
          )
        ),

        // ============================================================
        // TAB: IMAGES
        // ============================================================
        activeTab === 'images' && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } },
            'Upload images to showcase this ' + config.singular.toLowerCase() + '. Maximum 16 images allowed. The first image will be the primary display image.'
          ),
          
          React.createElement('div', { style: { 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '12px', padding: '8px 12px',
            backgroundColor: '#f8fafc', borderRadius: '8px'
          } },
            React.createElement('span', { style: { fontSize: '13px', color: '#475569' } },
              React.createElement(Image, { size: 16, style: { display: 'inline', marginRight: '6px' } }),
              (formData.images || []).length + ' / 16 images'
            ),
            (formData.images || []).length >= 16 &&
              React.createElement('span', { style: { fontSize: '12px', color: '#ef4444' } }, 'Limit reached')
          ),
          
          React.createElement('div', {
            onDrop: handleDragDrop,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            style: {
              border: '2px dashed #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '16px',
              transition: 'all 0.2s',
              backgroundColor: 'transparent'
            }
          },
            React.createElement(Upload, { size: 32, color: '#94a3b8', style: { marginBottom: '8px' } }),
            React.createElement('p', { style: { fontSize: '14px', color: '#64748b', marginBottom: '4px' } },
              'Drag and drop images here, or'
            ),
            React.createElement('label', { style: {
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: (uploading || (formData.images || []).length >= 16 || !editingRoom) ? '#94a3b8' : '#4F46E5',
              color: 'white',
              borderRadius: '8px',
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
              marginTop: '12px', height: '4px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' 
            } },
              React.createElement('div', { style: { 
                width: uploadProgress + '%', height: '100%', background: '#4F46E5', transition: 'width 0.3s ease' 
              } })
            ),
            React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' } },
              'JPEG, PNG, WEBP up to 5MB each'
            ),
            !editingRoom && React.createElement('p', { style: { fontSize: '12px', color: '#f59e0b', marginTop: '4px' } },
              '⚠️ Save this ' + config.singular.toLowerCase() + ' first, then upload images'
            )
          ),
          
          (formData.images || []).length === 0 ?
            React.createElement('div', { style: {
              padding: '40px 20px', textAlign: 'center',
              backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'
            } },
              React.createElement(Camera, { size: 40, color: '#94a3b8' }),
              React.createElement('p', { style: { marginTop: '12px', color: '#64748b', fontSize: '14px' } }, 'No images uploaded yet'),
              React.createElement('p', { style: { color: '#94a3b8', fontSize: '12px' } }, 'Upload images to showcase this ' + config.singular.toLowerCase())
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
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: idx === 0 ? '3px solid #4F46E5' : '1px solid #e2e8f0',
                    backgroundColor: '#f1f5f9'
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
                        backgroundColor: '#4F46E5', color: 'white',
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
                      backgroundColor: 'rgba(239,68,68,0.9)',
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
              fontSize: '12px', color: '#94a3b8',
              textAlign: 'center', marginTop: '12px'
            } },
              '⬆⬇ Use the arrows to reorder. First image is primary.'
            )
        ),

        // ============================================================
        // TAB: FEATURES (only if config.showFeatures)
        // ============================================================
        activeTab === 'features' && config.showFeatures && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } },
            'Features specific to this ' + config.singular.toLowerCase()
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' } },
            React.createElement('input', {
              type: 'text',
              value: formData.newFeature,
              onChange: function(e) { handleChange('newFeature', e.target.value); },
              placeholder: 'Enter a feature',
              style: { flex: 2, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', minWidth: '150px' }
            }),
            React.createElement('select', {
              value: formData.newFeatureCategory,
              onChange: function(e) { handleChange('newFeatureCategory', e.target.value); },
              style: { flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', backgroundColor: 'white', minWidth: '120px' }
            }, featureCategories.map(function(cat) {
              return React.createElement('option', { key: cat.id, value: cat.id }, cat.label);
            })),
            React.createElement('button', {
              onClick: addFeature,
              style: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }
            }, 'Add')
          ),
          featureCategories.map(function(category) {
            var categoryFeatures = (formData.features || []).filter(function(f) { return f.category === category.id; });
            if (categoryFeatures.length === 0) return null;
            return React.createElement('div', { key: category.id, style: { marginBottom: '12px' } },
              React.createElement('h4', { style: { fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' } }, category.label),
              React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                categoryFeatures.map(function(feature) {
                  return React.createElement('div', { key: feature.id, style: {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', backgroundColor: '#f1f5f9',
                    borderRadius: '20px', fontSize: '13px'
                  } },
                    React.createElement('span', null, feature.name),
                    React.createElement('button', {
                      onClick: function() { removeFeature(feature.id); },
                      style: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 4px', fontSize: '16px' }
                    }, '×')
                  );
                })
              )
            );
          }),
          (formData.features || []).length === 0 && React.createElement('p', { style: { textAlign: 'center', color: '#94a3b8', padding: '20px' } },
            'No features added yet.'
          )
        ),

        // ============================================================
        // TAB: AMENITIES (only if config.showAmenities)
        // ============================================================
        activeTab === 'amenities' && config.showAmenities && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } },
            'Amenities specific to this ' + config.singular.toLowerCase()
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' } },
            React.createElement('input', {
              type: 'text',
              value: formData.newAmenity,
              onChange: function(e) { handleChange('newAmenity', e.target.value); },
              placeholder: 'Enter an amenity',
              style: { flex: 2, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', minWidth: '150px' }
            }),
            React.createElement('select', {
              value: formData.newAmenityCategory,
              onChange: function(e) { handleChange('newAmenityCategory', e.target.value); },
              style: { flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', backgroundColor: 'white', minWidth: '120px' }
            }, amenityCategories.map(function(cat) {
              return React.createElement('option', { key: cat.id, value: cat.id }, cat.label);
            })),
            React.createElement('button', {
              onClick: addAmenity,
              style: { padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }
            }, 'Add')
          ),
          amenityCategories.map(function(category) {
            var categoryAmenities = (formData.amenities || []).filter(function(a) { return a.category === category.id; });
            if (categoryAmenities.length === 0) return null;
            return React.createElement('div', { key: category.id, style: { marginBottom: '12px' } },
              React.createElement('h4', { style: { fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' } }, category.label),
              React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                categoryAmenities.map(function(amenity) {
                  return React.createElement('div', { key: amenity.id, style: {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', backgroundColor: '#d1fae5',
                    borderRadius: '20px', fontSize: '13px'
                  } },
                    React.createElement('span', null, amenity.name),
                    React.createElement('button', {
                      onClick: function() { removeAmenity(amenity.id); },
                      style: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 4px', fontSize: '16px' }
                    }, '×')
                  );
                })
              )
            );
          }),
          (formData.amenities || []).length === 0 && React.createElement('p', { style: { textAlign: 'center', color: '#94a3b8', padding: '20px' } },
            'No amenities added yet.'
          )
        ),

        // ============================================================
        // TAB: AREA GUIDE (only if config.showAreaGuide)
        // ============================================================
        activeTab === 'areaGuide' && config.showAreaGuide && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } },
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
                  borderRadius: '8px',
                  border: formData.newAreaIcon === icon.value ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: formData.newAreaIcon === icon.value ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                }
              },
                IconComponent2 ? React.createElement(IconComponent2, { size: 16, color: formData.newAreaIcon === icon.value ? '#4f46e5' : '#64748b' }) : null,
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
              style: { flex: 2, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', minWidth: '150px' }
            }),
            React.createElement('textarea', {
              value: formData.newAreaContent,
              onChange: function(e) { handleChange('newAreaContent', e.target.value); },
              placeholder: 'Section Content',
              style: { flex: 3, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', minWidth: '200px', resize: 'vertical' },
              rows: '2'
            }),
            React.createElement('button', {
              onClick: addAreaSection,
              style: { padding: '10px 20px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }
            }, 'Add')
          ),
          (formData.areaGuide || []).map(function(section) {
            var IconComponent2 = iconMap[section.icon] || Home;
            return React.createElement('div', { key: section.id, style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', backgroundColor: '#fef3c7',
              borderRadius: '10px', marginBottom: '8px'
            } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 } },
                IconComponent2 ? React.createElement(IconComponent2, { size: 20, color: '#d97706' }) : null,
                React.createElement('div', null,
                  React.createElement('div', { style: { fontWeight: '600', fontSize: '14px' } }, section.title),
                  React.createElement('div', { style: { fontSize: '13px', color: '#64748b' } }, section.content)
                )
              ),
              React.createElement('button', {
                onClick: function() { removeAreaSection(section.id); },
                style: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', padding: '0 8px' }
              }, '×')
            );
          }),
          (formData.areaGuide || []).length === 0 && React.createElement('p', { style: { textAlign: 'center', color: '#94a3b8', padding: '20px' } },
            'No area guide sections added yet.'
          )
        ),

        // ============================================================
        // SAVE BUTTON
        // ============================================================
        React.createElement('div', { style: { marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' } },
          React.createElement('button', {
            onClick: closeModal,
            style: { padding: '10px 24px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }
          }, 'Cancel'),
          React.createElement('button', {
            onClick: handleSave,
            disabled: saving,
            style: {
              padding: '10px 24px',
              backgroundColor: saving ? '#94a3b8' : '#4f46e5',
              color: 'white', border: 'none', borderRadius: '10px',
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