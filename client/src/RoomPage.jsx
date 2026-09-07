// FILE: client/src/RoomPage.jsx
// COMPLETE VENUE MANAGEMENT WITH FULL SETTINGS + IMAGES TAB
// Features, Amenities, Area Guide, Property Details per venue
// Updated: September 2026 - Added Images tab with drag-drop upload

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
  GripVertical
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
// HELPERS
// ============================================================
function getLabels(businessType) {
  const type = businessType || 'venue';
  if (type === 'hotel') {
    return { 
      singular: 'Room', 
      plural: 'Rooms', 
      icon: Hotel,
      typeLabel: 'Room Type',
      capacityLabel: 'Sleeps',
      priceLabel: 'Price per night',
      priceUnit: '/ night',
      typeOptions: ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential', 'Family']
    };
  } else if (type === 'sports') {
    return { 
      singular: 'Court', 
      plural: 'Courts', 
      icon: Trophy,
      typeLabel: 'Court Type',
      capacityLabel: 'Players',
      priceLabel: 'Price per hour',
      priceUnit: '/ hour',
      typeOptions: ['Hard Court', 'Clay Court', 'Grass Court', 'Basketball', 'Football', 'Tennis']
    };
  } else if (type === 'event') {
    return { 
      singular: 'Venue', 
      plural: 'Venues', 
      icon: Sparkles,
      typeLabel: 'Venue Type',
      capacityLabel: 'Included Guests',
      priceLabel: 'Base Price',
      priceUnit: '/ event',
      typeOptions: ['Banquet Hall', 'Conference Room', 'Outdoor Space', 'Ballroom', 'Theater', 'Boardroom']
    };
  }
  return { 
    singular: 'Item', 
    plural: 'Items', 
    icon: Hotel,
    typeLabel: 'Type',
    capacityLabel: 'Capacity',
    priceLabel: 'Price',
    priceUnit: '',
    typeOptions: ['Standard']
  };
}

// ============================================================
// FEATURE CATEGORIES
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

const propertyTypeOptions = [
  'Event Hall', 'Conference Room', 'Boardroom', 'Training Hall',
  'Warehouse', 'Office Space', 'Studio', 'Apartment', 'Hotel Room',
  'Condo', 'Other'
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

  const labels = getLabels(business?.business_type);
  const IconComponent = labels.icon;
  const isEvent = business?.business_type === 'event';
  const token = localStorage.getItem('auth_token');

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
  function openAddModal() {
    setEditingRoom(null);
    setActiveTab('basic');
    setFormData({
      name: '',
      type: labels.typeOptions[0] || '',
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
      property_type: propertyTypeOptions[0] || '',
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
    setShowModal(true);
  }

  function openEditModal(room) {
    setEditingRoom(room);
    setActiveTab('basic');
    setFormData({
      name: room.name || '',
      type: room.type || labels.typeOptions[0] || '',
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
      property_type: room.property_type || propertyTypeOptions[0] || '',
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
  // FORM HANDLERS
  // ============================================================
  function handleChange(field, value) {
    setFormData(function(prev) {
      return { ...prev, [field]: value };
    });
  }

  // ============================================================
  // IMAGE UPLOAD HANDLERS
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
      showError('Please save the venue first before uploading images');
      return;
    }

    // Check limit (max 16 images)
    const currentImages = formData.images || [];
    if (currentImages.length >= 16) {
      showError('Maximum 16 images allowed per venue');
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
      .catch(function() { showError('Something went wrong. Please try again.'); });
  }

  function moveImageUp(index) {
    if (index === 0) return;
    const updated = [...(formData.images || [])];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setFormData(function(prev) {
      return { ...prev, images: updated };
    });
  }

  function moveImageDown(index) {
    if (index === (formData.images || []).length - 1) return;
    const updated = [...(formData.images || [])];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setFormData(function(prev) {
      return { ...prev, images: updated };
    });
  }

  // Drag and drop handlers
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
  // FEATURES
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
    setFormData(function(prev) {
      return { ...prev, features: updated };
    });
  }

  // ============================================================
  // AMENITIES
  // ============================================================
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
    setFormData(function(prev) {
      return { ...prev, amenities: updated };
    });
  }

  // ============================================================
  // AREA GUIDE
  // ============================================================
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
    setFormData(function(prev) {
      return { ...prev, areaGuide: updated };
    });
  }

  // ============================================================
  // SAVE VENUE
  // ============================================================
  function handleSave() {
    if (!formData.name.trim()) {
      showError(labels.singular + ' name is required');
      return;
    }
    
    let priceValue;
    if (isEvent) {
      priceValue = parseFloat(formData.base_price);
    } else {
      priceValue = parseFloat(formData.price_per_night);
    }
    
    if (!priceValue || priceValue <= 0) {
      showError('Valid ' + labels.priceLabel.toLowerCase() + ' is required');
      return;
    }

    let capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      capacity = isEvent ? 50 : 2;
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
      price_per_night: isEvent ? 0 : parseFloat(formData.price_per_night) || 0,
      description: formData.description || '',
      venue_description: formData.venue_description || formData.description || '',
      address: formData.address || '',
      images: formData.images || [],
      property_type: formData.property_type || propertyTypeOptions[0],
      bathrooms: parseInt(formData.bathrooms) || 0,
      parking_spaces: parseInt(formData.parking_spaces) || 0,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      furnishing_status: formData.furnishing_status || 'unfurnished',
      listing_status: formData.listing_status || 'for_rent',
      features: formData.features || [],
      amenities: formData.amenities || [],
      area_guide: formData.areaGuide || []
    };

    if (isEvent) {
      payload.base_price = parseFloat(formData.base_price) || 0;
      payload.included_guests = parseInt(formData.included_guests) || 50;
      payload.max_capacity = parseInt(formData.max_capacity) || 300;
      payload.extra_guest_price = parseFloat(formData.extra_guest_price) || 2000;
      payload.price_per_night = parseFloat(formData.base_price) || 0;
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
          showSuccess(editingRoom ? labels.singular + ' updated!' : labels.singular + ' added!');
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
  // DELETE VENUE
  // ============================================================
  function handleDelete(roomId) {
    if (!confirm('Delete this ' + labels.singular.toLowerCase() + '?')) return;
    fetch(API_BASE + '/api/businesses/' + business.id + '/rooms/' + roomId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          showSuccess(labels.singular + ' deleted');
          fetchRooms();
        } else {
          showError('Failed to delete');
        }
      })
      .catch(function() { showError('Something went wrong. Please try again.'); });
  }

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' } },
      React.createElement(Loader2, { size: 32, style: { animation: 'spin 1s linear infinite', color: '#4f46e5' } })
    );
  }

  const isMobile = window.innerWidth < 640;

  return React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '16px' } },
    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        React.createElement('button', { 
          onClick: onBack, 
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }
        }, React.createElement(ArrowLeft, { size: 20, color: '#475569' })),
        React.createElement('div', null,
          React.createElement('h2', { style: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 } }, labels.plural),
          React.createElement('p', { style: { fontSize: '14px', color: '#64748b', margin: '2px 0 0' } }, 
            'Manage your ' + labels.plural.toLowerCase() + ' with full settings'
          )
        )
      ),
      React.createElement('button', { 
        onClick: openAddModal, 
        style: { padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
      }, React.createElement(Plus, { size: 16 }), 'Add ' + labels.singular)
    ),

    // Room List
    rooms.length === 0 ?
      React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' } },
        React.createElement(IconComponent, { size: 48, color: '#cbd5e1' }),
        React.createElement('h3', { style: { fontSize: '18px', fontWeight: '600', color: '#0f172a', marginTop: '12px' } }, 'No ' + labels.plural.toLowerCase() + ' yet'),
        React.createElement('p', { style: { color: '#94a3b8', fontSize: '14px', marginTop: '4px' } }, 'Add your first ' + labels.singular.toLowerCase()),
        React.createElement('button', { 
          onClick: openAddModal, 
          style: { marginTop: '16px', padding: '10px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer' }
        }, 'Add ' + labels.singular)
      ) :
      React.createElement('div', { style: { display: 'grid', gap: '12px' } },
        rooms.map(function(room) {
          const displayPrice = isEvent ? (room.base_price || room.price_per_night || 0) : (room.price_per_night || 0);
          const imageCount = (room.images || []).length;
          const featureCount = (room.features || []).length;
          
          return React.createElement('div', { key: room.id, style: { background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
            React.createElement('div', null,
              React.createElement('h4', { style: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 } }, room.name),
              React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' } },
                React.createElement('span', { style: { fontSize: '12px', color: '#64748b' } }, room.type || labels.typeOptions[0]),
                React.createElement('span', { style: { fontSize: '12px', color: '#64748b' } }, 
                  React.createElement(Users, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
                  labels.capacityLabel + ': ' + (isEvent ? (room.included_guests || room.capacity || 50) : (room.capacity || 2))
                ),
                React.createElement('span', { style: { fontSize: '12px', fontWeight: '600', color: '#4f46e5' } },
                  '₦' + (displayPrice).toLocaleString() + labels.priceUnit
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
                onClick: function() { handleDelete(room.id); }, 
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
            editingRoom ? 'Edit ' + labels.singular : 'Add ' + labels.singular
          ),
          React.createElement('button', { 
            onClick: closeModal, 
            style: { background: 'none', border: 'none', cursor: 'pointer' }
          }, React.createElement(X, { size: 20, color: '#64748b' }))
        ),

        // TABS - Updated to include Images tab
        React.createElement('div', { style: { display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' } },
          ['basic', 'details', 'images', 'features', 'amenities', 'areaGuide'].map(function(tab) {
            const tabLabels = {
              basic: '📋 Basic',
              details: '🏷️ Details',
              images: '📸 Images',
              features: '⭐ Features',
              amenities: '🛋️ Amenities',
              areaGuide: '🗺️ Area Guide'
            };
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
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, labels.singular + ' Name *'),
            React.createElement('input', {
              type: 'text',
              value: formData.name,
              onChange: function(e) { handleChange('name', e.target.value); },
              placeholder: 'e.g., ' + labels.singular + ' 1',
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, labels.typeLabel),
            React.createElement('select', {
              value: formData.type,
              onChange: function(e) { handleChange('type', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: 'white' }
            }, labels.typeOptions.map(function(opt) { 
              return React.createElement('option', { key: opt, value: opt }, opt);
            }))
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
              React.createElement(MapPin, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Venue Address'
            ),
            React.createElement('input', {
              type: 'text',
              value: formData.address,
              onChange: function(e) { handleChange('address', e.target.value); },
              placeholder: 'e.g., 7 Obasa Road, Ikeja, Lagos',
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
              React.createElement(FileText, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Venue Description'
            ),
            React.createElement('textarea', {
              value: formData.venue_description || formData.description,
              onChange: function(e) { handleChange('venue_description', e.target.value); },
              placeholder: 'Describe this venue for customers',
              rows: 3,
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', resize: 'vertical' }
            })
          ),
          isEvent ? (
            React.createElement(React.Fragment, null,
              React.createElement('div', null,
                React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, 
                  labels.priceLabel + ' (₦) *'
                ),
                React.createElement('div', { style: { position: 'relative' } },
                  React.createElement('span', { style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' } }, '₦'),
                  React.createElement('input', {
                    type: 'number',
                    value: formData.base_price,
                    onChange: function(e) { handleChange('base_price', e.target.value); },
                    placeholder: 'e.g., 800000',
                    style: { width: '100%', padding: '10px 14px 10px 32px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
                  })
                )
              ),
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
                React.createElement('div', null,
                  React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, 'Included Guests *'),
                  React.createElement('input', {
                    type: 'number',
                    value: formData.included_guests,
                    onChange: function(e) { handleChange('included_guests', e.target.value); },
                    placeholder: 'e.g., 100',
                    style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
                  })
                ),
                React.createElement('div', null,
                  React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, 'Max Capacity *'),
                  React.createElement('input', {
                    type: 'number',
                    value: formData.max_capacity,
                    onChange: function(e) { handleChange('max_capacity', e.target.value); },
                    placeholder: 'e.g., 300',
                    style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
                  })
                )
              )
            )
          ) : (
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
              React.createElement('div', null,
                React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, labels.capacityLabel),
                React.createElement('input', {
                  type: 'number',
                  value: formData.capacity,
                  onChange: function(e) { handleChange('capacity', e.target.value); },
                  placeholder: 'e.g., 2',
                  style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
                })
              ),
              React.createElement('div', null,
                React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, 
                  labels.priceLabel + ' (₦) *'
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
                )
              )
            )
          )
        ),

        // ============================================================
        // TAB: PROPERTY DETAILS
        // ============================================================
        activeTab === 'details' && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '8px' } },
            'Property details specific to this venue'
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } },
              React.createElement(Building, { size: 14, style: { display: 'inline', marginRight: '4px' } }),
              'Property Type'
            ),
            React.createElement('select', {
              value: formData.property_type,
              onChange: function(e) { handleChange('property_type', e.target.value); },
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: 'white' }
            }, propertyTypeOptions.map(function(opt) {
              return React.createElement('option', { key: opt, value: opt }, opt);
            }))
          ),
          React.createElement('div', null,
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
          React.createElement('div', null,
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
          React.createElement('div', null,
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
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            React.createElement('div', null,
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
            React.createElement('div', null,
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
        // TAB: IMAGES (NEW - Complete with drag-drop + button)
        // ============================================================
        activeTab === 'images' && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } },
            'Upload images to showcase this venue. Maximum 16 images allowed. The first image will be the primary display image.'
          ),
          
          // Image count indicator
          React.createElement('div', { style: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
          } },
            React.createElement('span', { style: { fontSize: '13px', color: '#475569' } },
              React.createElement(Image, { size: 16, style: { display: 'inline', marginRight: '6px' } }),
              (formData.images || []).length + ' / 16 images'
            ),
            (formData.images || []).length >= 16 &&
              React.createElement('span', { style: { fontSize: '12px', color: '#ef4444' } }, 'Limit reached')
          ),
          
          // Upload area (drag & drop + button)
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
              backgroundColor: (uploading || (formData.images || []).length >= 16) ? '#94a3b8' : '#4F46E5',
              color: 'white',
              borderRadius: '8px',
              cursor: (uploading || (formData.images || []).length >= 16) ? 'not-allowed' : 'pointer',
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
              marginTop: '12px', 
              height: '4px', 
              background: '#e2e8f0', 
              borderRadius: '4px', 
              overflow: 'hidden' 
            } },
              React.createElement('div', { style: { 
                width: uploadProgress + '%', 
                height: '100%', 
                background: '#4F46E5', 
                transition: 'width 0.3s ease' 
              } })
            ),
            React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' } },
              'JPEG, PNG, WEBP up to 5MB each'
            ),
            !editingRoom && React.createElement('p', { style: { fontSize: '12px', color: '#f59e0b', marginTop: '4px' } },
              '⚠️ Save the venue first, then upload images'
            )
          ),
          
          // Image grid
          (formData.images || []).length === 0 ?
            React.createElement('div', { style: {
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            } },
              React.createElement(Camera, { size: 40, color: '#94a3b8' }),
              React.createElement('p', { style: { marginTop: '12px', color: '#64748b', fontSize: '14px' } },
                'No images uploaded yet'
              ),
              React.createElement('p', { style: { color: '#94a3b8', fontSize: '12px' } },
                'Upload images to showcase this venue'
              )
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
                    alt: 'Venue image ' + (idx + 1),
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }
                  }),
                  // Primary badge
                  idx === 0 &&
                    React.createElement('span', {
                      style: {
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        backgroundColor: '#4F46E5',
                        color: 'white',
                        fontSize: '9px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        textTransform: 'uppercase'
                      }
                    }, 'Primary'),
                  // Image number badge (if not primary)
                  idx > 0 &&
                    React.createElement('span', {
                      style: {
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '999px'
                      }
                    }, idx + 1),
                  // Reorder controls
                  React.createElement('div', {
                    style: {
                      position: 'absolute',
                      bottom: '6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '4px'
                    }
                  },
                    idx > 0 &&
                      React.createElement('button', {
                        onClick: function() { moveImageUp(idx); },
                        style: {
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px'
                        }
                      }, '↑'),
                    idx < (formData.images || []).length - 1 &&
                      React.createElement('button', {
                        onClick: function() { moveImageDown(idx); },
                        style: {
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px'
                        }
                      }, '↓')
                  ),
                  // Delete button
                  React.createElement('button', {
                    onClick: function() { removeVenueImage(idx); },
                    style: {
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      backgroundColor: 'rgba(239,68,68,0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }
                  }, '×')
                );
              })
            ),
          
          // Reorder hint
          (formData.images || []).length > 1 &&
            React.createElement('p', { style: {
              fontSize: '12px',
              color: '#94a3b8',
              textAlign: 'center',
              marginTop: '12px'
            } },
              '⬆⬇ Use the arrows to reorder images. The first image is the primary display image.'
            )
        ),

        // ============================================================
        // TAB: FEATURES
        // ============================================================
        activeTab === 'features' && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } },
            'Features specific to this venue'
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' } },
            React.createElement('input', {
              type: 'text',
              value: formData.newFeature,
              onChange: function(e) { handleChange('newFeature', e.target.value); },
              placeholder: 'Enter a feature (e.g., Air Conditioning)',
              style: {
                flex: 2,
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                minWidth: '150px'
              }
            }),
            React.createElement('select', {
              value: formData.newFeatureCategory,
              onChange: function(e) { handleChange('newFeatureCategory', e.target.value); },
              style: {
                flex: 1,
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '13px',
                backgroundColor: 'white',
                minWidth: '120px'
              }
            }, featureCategories.map(function(cat) {
              return React.createElement('option', { key: cat.id, value: cat.id }, cat.label);
            })),
            React.createElement('button', {
              onClick: addFeature,
              style: {
                padding: '10px 20px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '20px',
                    fontSize: '13px'
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
            'No features added yet. Add your first feature above.'
          )
        ),

        // ============================================================
        // TAB: AMENITIES
        // ============================================================
        activeTab === 'amenities' && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } },
            'Amenities specific to this venue'
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' } },
            React.createElement('input', {
              type: 'text',
              value: formData.newAmenity,
              onChange: function(e) { handleChange('newAmenity', e.target.value); },
              placeholder: 'Enter an amenity (e.g., WiFi)',
              style: {
                flex: 2,
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                minWidth: '150px'
              }
            }),
            React.createElement('select', {
              value: formData.newAmenityCategory,
              onChange: function(e) { handleChange('newAmenityCategory', e.target.value); },
              style: {
                flex: 1,
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '13px',
                backgroundColor: 'white',
                minWidth: '120px'
              }
            }, amenityCategories.map(function(cat) {
              return React.createElement('option', { key: cat.id, value: cat.id }, cat.label);
            })),
            React.createElement('button', {
              onClick: addAmenity,
              style: {
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#d1fae5',
                    borderRadius: '20px',
                    fontSize: '13px'
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
            'No amenities added yet. Add your first amenity above.'
          )
        ),

        // ============================================================
        // TAB: AREA GUIDE
        // ============================================================
        activeTab === 'areaGuide' && React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } },
            'Area guide specific to this venue'
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
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
              placeholder: 'Section Title (e.g., Interesting Facts)',
              style: {
                flex: 2,
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                minWidth: '150px'
              }
            }),
            React.createElement('textarea', {
              value: formData.newAreaContent,
              onChange: function(e) { handleChange('newAreaContent', e.target.value); },
              placeholder: 'Section Content (e.g., Known for technology...)',
              style: {
                flex: 3,
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                minWidth: '200px',
                resize: 'vertical'
              },
              rows: '2'
            }),
            React.createElement('button', {
              onClick: addAreaSection,
              style: {
                padding: '10px 20px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }
            }, 'Add')
          ),
          (formData.areaGuide || []).map(function(section) {
            var IconComponent2 = iconMap[section.icon] || Home;
            return React.createElement('div', { key: section.id, style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#fef3c7',
              borderRadius: '10px',
              marginBottom: '8px'
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
            style: {
              padding: '10px 24px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }
          }, 'Cancel'),
          React.createElement('button', {
            onClick: handleSave,
            disabled: saving,
            style: {
              padding: '10px 24px',
              backgroundColor: saving ? '#94a3b8' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, saving ? React.createElement(Loader2, { size: 18, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Save, { size: 18 }), saving ? 'Saving...' : 'Save Venue')
        )
      )
    )
  );
}

export default RoomPage;