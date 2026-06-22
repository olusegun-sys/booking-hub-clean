import React, { useState, useEffect } from 'react';
import { Hotel, Plus, Edit2, Trash2, X, Check, Bed, Users, DollarSign, Home, ArrowLeft, Loader2 } from 'lucide-react';
import API_BASE from './config';

function RoomPage({ business, onBack }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBusiness, setLoadingBusiness] = useState(false);
  const [fullBusiness, setFullBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    capacity: 2,
    price_per_night: '',
    description: '',
    amenities: []
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = localStorage.getItem('auth_token');

  // If business is passed with an ID, use it. Otherwise try to fetch by slug or ID.
  useEffect(() => {
    const loadBusiness = async () => {
      // If we already have a valid business with ID, use it
      if (business && business.id) {
        setFullBusiness(business);
        fetchRooms(business.id);
        return;
      }

      // If business has a slug but no ID, fetch it
      if (business && business.slug) {
        setLoadingBusiness(true);
        try {
          const response = await fetch(`${API_BASE}/api/businesses/slug/${business.slug}`);
          const data = await response.json();
          if (data.success && data.business) {
            setFullBusiness(data.business);
            fetchRooms(data.business.id);
          } else {
            setMessage({ type: 'error', text: 'Business not found. Please go back and try again.' });
          }
        } catch (err) {
          console.error('Fetch business error:', err);
          setMessage({ type: 'error', text: 'Error loading business data. Please try again.' });
        } finally {
          setLoadingBusiness(false);
        }
        return;
      }

      // If no business data at all, show error
      if (!business) {
        setMessage({ type: 'error', text: 'Business data not available. Please go back and try again.' });
        setLoading(false);
      }
    };

    loadBusiness();
  }, [business]);

  const fetchRooms = async (businessId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/businesses/${businessId}/rooms`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
      showMessage('error', 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name || '',
        type: room.type || 'Standard',
        capacity: room.capacity || 2,
        price_per_night: room.price_per_night || '',
        description: room.description || '',
        amenities: room.amenities || []
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        type: 'Standard',
        capacity: 2,
        price_per_night: '',
        description: '',
        amenities: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData({
      name: '',
      type: 'Standard',
      capacity: 2,
      price_per_night: '',
      description: '',
      amenities: []
    });
    setAmenityInput('');
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    });
  };

  const handleSaveRoom = async () => {
    if (!formData.name.trim()) {
      showMessage('error', 'Room name is required');
      return;
    }
    if (!formData.price_per_night || parseFloat(formData.price_per_night) <= 0) {
      showMessage('error', 'Valid price is required');
      return;
    }

    if (!fullBusiness || !fullBusiness.id) {
      showMessage('error', 'Business data not available. Please go back and try again.');
      return;
    }

    setSaving(true);
    try {
      const url = editingRoom
        ? `${API_BASE}/api/businesses/${fullBusiness.id}/rooms/${editingRoom.id}`
        : `${API_BASE}/api/businesses/${fullBusiness.id}/rooms/create`;
      
      const method = editingRoom ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: formData.type,
          capacity: parseInt(formData.capacity),
          price_per_night: parseFloat(formData.price_per_night),
          description: formData.description,
          amenities: formData.amenities
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showMessage('success', editingRoom ? 'Room updated successfully' : 'Room created successfully');
        fetchRooms(fullBusiness.id);
        handleCloseModal();
      } else {
        showMessage('error', data.error || 'Failed to save room');
      }
    } catch (err) {
      console.error('Save room error:', err);
      showMessage('error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!confirm(`Delete "${room.name}"? This action cannot be undone.`)) return;
    
    if (!fullBusiness || !fullBusiness.id) {
      showMessage('error', 'Business data not available.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/businesses/${fullBusiness.id}/rooms/${room.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Room deleted successfully');
        fetchRooms(fullBusiness.id);
      } else {
        showMessage('error', data.error || 'Failed to delete room');
      }
    } catch (err) {
      console.error('Delete room error:', err);
      showMessage('error', 'Something went wrong. Please try again.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  // Safety check - if no business data after loading attempts, show error
  if (!business && !fullBusiness && !loadingBusiness) {
    return React.createElement('div', { style: { padding: '40px', textAlign: 'center' } },
      React.createElement('p', { style: { color: '#ef4444', fontSize: '16px', marginBottom: '16px' } }, 
        'Error: Business data not available. Please go back and try again.'
      ),
      React.createElement('button', { 
        onClick: onBack, 
        style: { 
          padding: '10px 24px', 
          backgroundColor: '#4f46e5', 
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }
      }, 'Go Back')
    );
  }

  if (loadingBusiness) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' } },
      React.createElement(Loader2, { size: 32, style: { animation: 'spin 1s linear infinite', color: '#4f46e5' } }),
      React.createElement('p', { style: { color: '#64748b', fontSize: '14px' } }, 'Loading business data...')
    );
  }

  const activeBusiness = fullBusiness || business;

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    addButton: {
      padding: '12px 20px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    backButton: {
      padding: '10px 16px',
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    roomsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '20px'
    },
    roomCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    roomCardBody: {
      padding: '20px'
    },
    roomHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '8px'
    },
    roomName: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    roomPrice: {
      fontSize: '20px',
      fontWeight: '800',
      color: '#4f46e5'
    },
    roomDetails: {
      display: 'flex',
      gap: '16px',
      marginBottom: '12px',
      flexWrap: 'wrap'
    },
    detailBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      color: '#64748b'
    },
    roomDescription: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '12px',
      lineHeight: '1.5'
    },
    amenitiesList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '16px'
    },
    amenityTag: {
      backgroundColor: '#f1f5f9',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '500',
      color: '#475569'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '16px'
    },
    editBtn: {
      flex: 1,
      padding: '8px',
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      fontSize: '13px',
      fontWeight: '500'
    },
    deleteBtn: {
      flex: 1,
      padding: '8px',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      fontSize: '13px',
      fontWeight: '500'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '20px',
      maxWidth: '550px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8'
    },
    modalBody: {
      padding: '24px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '12px 14px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px 14px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    textarea: {
      width: '100%',
      padding: '12px 14px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    amenityInput: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px'
    },
    amenityAddBtn: {
      padding: '12px 16px',
      backgroundColor: '#f1f5f9',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer'
    },
    existingAmenities: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '8px'
    },
    existingAmenityTag: {
      backgroundColor: '#eef2ff',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    removeAmenityBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center'
    },
    modalFooter: {
      padding: '16px 24px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    },
    saveBtn: {
      padding: '10px 24px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    cancelBtn: {
      padding: '10px 24px',
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    message: {
      padding: '12px 16px',
      borderRadius: '10px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 24px',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e2e8f0'
    }
  };

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  return React.createElement('div', { style: styles.container },
    message.text && React.createElement('div', { style: { ...styles.message, backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b' } },
      message.type === 'success' ? React.createElement(Check, { size: 18 }) : React.createElement(X, { size: 18 }),
      message.text
    ),

    React.createElement('div', { style: styles.header },
      React.createElement('div', null,
        React.createElement('button', { onClick: onBack, style: styles.backButton },
          React.createElement(ArrowLeft, { size: 16 }),
          ' Back to Dashboard'
        ),
        React.createElement('h2', { style: { ...styles.title, marginTop: '16px' } },
          React.createElement(Hotel, { size: 28, color: '#4f46e5' }),
          `Manage Rooms - ${activeBusiness?.name || 'Business'}`
        )
      ),
      React.createElement('button', { onClick: () => handleOpenModal(), style: styles.addButton },
        React.createElement(Plus, { size: 18 }),
        ' Add Room'
      )
    ),

    rooms.length === 0 ?
      React.createElement('div', { style: styles.emptyState },
        React.createElement(Hotel, { size: 48, color: '#cbd5e1' }),
        React.createElement('h3', { style: { marginTop: '16px', fontSize: '17px', fontWeight: '700', color: '#0f172a' } }, 'No rooms yet'),
        React.createElement('p', { style: { color: '#64748b', fontSize: '14px' } }, 'Click "Add Room" to create your first room')
      ) :
      React.createElement('div', { style: styles.roomsGrid },
        rooms.map(room => 
          React.createElement('div', { key: room.id, style: styles.roomCard },
            React.createElement('div', { style: styles.roomCardBody },
              React.createElement('div', { style: styles.roomHeader },
                React.createElement('h3', { style: styles.roomName }, room.name),
                React.createElement('span', { style: styles.roomPrice }, formatPrice(room.price_per_night))
              ),
              React.createElement('div', { style: styles.roomDetails },
                React.createElement('span', { style: styles.detailBadge },
                  React.createElement(Bed, { size: 14 }),
                  room.type
                ),
                React.createElement('span', { style: styles.detailBadge },
                  React.createElement(Users, { size: 14 }),
                  `Max ${room.capacity} guests`
                ),
                React.createElement('span', { style: styles.detailBadge },
                  React.createElement(DollarSign, { size: 14 }),
                  'per night'
                )
              ),
              room.description && React.createElement('p', { style: styles.roomDescription }, room.description),
              room.amenities && room.amenities.length > 0 &&
                React.createElement('div', { style: styles.amenitiesList },
                  room.amenities.map(amenity => 
                    React.createElement('span', { key: amenity, style: styles.amenityTag }, amenity)
                  )
                ),
              React.createElement('div', { style: styles.actionButtons },
                React.createElement('button', { onClick: () => handleOpenModal(room), style: styles.editBtn },
                  React.createElement(Edit2, { size: 14 }), ' Edit'
                ),
                React.createElement('button', { onClick: () => handleDeleteRoom(room), style: styles.deleteBtn },
                  React.createElement(Trash2, { size: 14 }), ' Delete'
                )
              )
            )
          )
        )
      ),

    showModal && React.createElement('div', { style: styles.modalOverlay, onClick: handleCloseModal },
      React.createElement('div', { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement('div', { style: styles.modalHeader },
          React.createElement('h3', { style: styles.modalTitle }, editingRoom ? 'Edit Room' : 'Add New Room'),
          React.createElement('button', { onClick: handleCloseModal, style: styles.closeBtn }, React.createElement(X, { size: 20 }))
        ),
        React.createElement('div', { style: styles.modalBody },
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.label }, 'Room Name *'),
            React.createElement('input', {
              type: 'text',
              value: formData.name,
              onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              placeholder: 'e.g., Deluxe Suite, Standard Room',
              style: styles.input
            })
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { style: styles.formGroup },
              React.createElement('label', { style: styles.label }, 'Room Type'),
              React.createElement('select', {
                value: formData.type,
                onChange: (e) => setFormData({ ...formData, type: e.target.value }),
                style: styles.select
              },
                ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'].map(t => 
                  React.createElement('option', { key: t, value: t }, t)
                )
              )
            ),
            React.createElement('div', { style: styles.formGroup },
              React.createElement('label', { style: styles.label }, 'Capacity'),
              React.createElement('select', {
                value: formData.capacity,
                onChange: (e) => setFormData({ ...formData, capacity: e.target.value }),
                style: styles.select
              },
                [1,2,3,4,5,6,8,10].map(c => 
                  React.createElement('option', { key: c, value: c }, `${c} guest${c > 1 ? 's' : ''}`)
                )
              )
            )
          ),
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.label }, 'Price per Night (₦) *'),
            React.createElement('input', {
              type: 'number',
              value: formData.price_per_night,
              onChange: (e) => setFormData({ ...formData, price_per_night: e.target.value }),
              placeholder: 'e.g., 25000',
              style: styles.input,
              min: "0",
              step: "1000"
            })
          ),
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.label }, 'Description'),
            React.createElement('textarea', {
              value: formData.description,
              onChange: (e) => setFormData({ ...formData, description: e.target.value }),
              placeholder: 'Describe the room features...',
              style: styles.textarea
            })
          ),
          React.createElement('div', { style: styles.formGroup },
            React.createElement('label', { style: styles.label }, 'Amenities'),
            React.createElement('div', { style: styles.amenityInput },
              React.createElement('input', {
                type: 'text',
                value: amenityInput,
                onChange: (e) => setAmenityInput(e.target.value),
                placeholder: 'e.g., WiFi, TV, AC',
                style: { ...styles.input, flex: 1 }
              }),
              React.createElement('button', { onClick: handleAddAmenity, style: styles.amenityAddBtn }, React.createElement(Plus, { size: 18 }))
            ),
            React.createElement('div', { style: styles.existingAmenities },
              formData.amenities.map(amenity => 
                React.createElement('span', { key: amenity, style: styles.existingAmenityTag },
                  amenity,
                  React.createElement('button', { onClick: () => handleRemoveAmenity(amenity), style: styles.removeAmenityBtn }, React.createElement(X, { size: 12 }))
                )
              )
            )
          )
        ),
        React.createElement('div', { style: styles.modalFooter },
          React.createElement('button', { onClick: handleCloseModal, style: styles.cancelBtn }, 'Cancel'),
          React.createElement('button', { onClick: handleSaveRoom, disabled: saving, style: styles.saveBtn }, saving ? 'Saving...' : 'Save Room')
        )
      )
    )
  );
}

export default RoomPage;