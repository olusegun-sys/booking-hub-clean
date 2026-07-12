// FILE: client/src/RoomPage.jsx
// COMPLETE FIX - Dynamic price labels for hotel/sports/event

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Edit3, Save, X, 
  Hotel, Trophy, Sparkles, Users, Bed, DollarSign,
  AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import API_BASE from './config';
import { showError, showSuccess } from './toast';

function RoomPage({ business, onBack }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: 2,
    price_per_night: 0,
    description: '',
    amenities: []
  });

  const token = localStorage.getItem('auth_token');

  // DYNAMIC LABELS based on business type
  function getLabels() {
    const type = business?.business_type;
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
        capacityLabel: 'Capacity',
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

  const labels = getLabels();
  const IconComponent = labels.icon;

  useEffect(() => {
    fetchRooms();
  }, []);

  function fetchRooms() {
    setLoading(true);
    fetch(API_BASE + '/api/businesses/' + business.id + '/rooms', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRooms(data.rooms || []);
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }

  function openAddModal() {
    setEditingRoom(null);
    setFormData({
      name: '',
      type: labels.typeOptions[0] || '',
      capacity: 2,
      price_per_night: 0,
      description: '',
      amenities: []
    });
    setShowModal(true);
  }

  function openEditModal(room) {
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      type: room.type || labels.typeOptions[0] || '',
      capacity: room.capacity || 2,
      price_per_night: room.price_per_night || 0,
      description: room.description || '',
      amenities: room.amenities || []
    });
    setShowModal(true);
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (!formData.name.trim()) {
      showError(labels.singular + ' name is required');
      return;
    }
    if (!formData.price_per_night || formData.price_per_night <= 0) {
      showError('Valid price is required');
      return;
    }

    setSaving(true);
    const url = editingRoom 
      ? API_BASE + '/api/businesses/' + business.id + '/rooms/' + editingRoom.id
      : API_BASE + '/api/businesses/' + business.id + '/rooms/create';
    const method = editingRoom ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        type: formData.type,
        capacity: parseInt(formData.capacity) || 2,
        price_per_night: parseFloat(formData.price_per_night),
        description: formData.description,
        amenities: formData.amenities || []
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showSuccess(editingRoom ? labels.singular + ' updated!' : labels.singular + ' added!');
          setShowModal(false);
          fetchRooms();
        } else {
          showError(data.error || 'Failed to save');
        }
        setSaving(false);
      })
      .catch(() => {
        showError('Something went wrong');
        setSaving(false);
      });
  }

  function handleDelete(roomId) {
    if (!confirm('Delete this ' + labels.singular.toLowerCase() + '?')) return;
    fetch(API_BASE + '/api/businesses/' + business.id + '/rooms/' + roomId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showSuccess(labels.singular + ' deleted');
          fetchRooms();
        } else {
          showError('Failed to delete');
        }
      })
      .catch(() => showError('Something went wrong'));
  }

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' } },
      React.createElement(Loader2, { size: 32, style: { animation: 'spin 1s linear infinite', color: '#4f46e5' } })
    );
  }

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
            'Manage your ' + labels.plural.toLowerCase()
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
        rooms.map(room => 
          React.createElement('div', { key: room.id, style: { background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
            React.createElement('div', null,
              React.createElement('h4', { style: { fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 } }, room.name),
              React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' } },
                React.createElement('span', { style: { fontSize: '12px', color: '#64748b' } }, room.type || labels.typeOptions[0]),
                React.createElement('span', { style: { fontSize: '12px', color: '#64748b' } }, 
                  React.createElement(Users, { size: 12, style: { display: 'inline', marginRight: '4px' } }),
                  labels.capacityLabel + ': ' + (room.capacity || 2)
                ),
                React.createElement('span', { style: { fontSize: '12px', fontWeight: '600', color: '#4f46e5' } },
                  '₦' + (room.price_per_night || 0).toLocaleString() + labels.priceUnit
                )
              )
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
              React.createElement('button', { 
                onClick: () => openEditModal(room), 
                style: { padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569' }
              }, React.createElement(Edit3, { size: 16 })),
              React.createElement('button', { 
                onClick: () => handleDelete(room.id), 
                style: { padding: '6px 12px', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }
              }, React.createElement(Trash2, { size: 16 }))
            )
          )
        )
      ),

    // Modal
    showModal && React.createElement('div', { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' } },
      React.createElement('div', { style: { background: 'white', borderRadius: '20px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' } },
        // Modal Header
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('h3', { style: { fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 } }, 
            editingRoom ? 'Edit ' + labels.singular : 'Add ' + labels.singular
          ),
          React.createElement('button', { 
            onClick: () => setShowModal(false), 
            style: { background: 'none', border: 'none', cursor: 'pointer' }
          }, React.createElement(X, { size: 20, color: '#64748b' }))
        ),
        // Form
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          // Name
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, labels.singular + ' Name *'),
            React.createElement('input', {
              type: 'text',
              value: formData.name,
              onChange: (e) => handleChange('name', e.target.value),
              placeholder: 'e.g., ' + labels.singular + ' 1',
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
            })
          ),
          // Type
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, labels.typeLabel),
            React.createElement('select', {
              value: formData.type,
              onChange: (e) => handleChange('type', e.target.value),
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: 'white' }
            }, labels.typeOptions.map(opt => 
              React.createElement('option', { key: opt, value: opt }, opt)
            ))
          ),
          // Capacity
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, labels.capacityLabel),
            React.createElement('input', {
              type: 'number',
              value: formData.capacity,
              onChange: (e) => handleChange('capacity', parseInt(e.target.value) || 2),
              min: 1,
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
            })
          ),
          // PRICE - FIXED: Dynamic label
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, 
              labels.priceLabel + ' (₦) *'
            ),
            React.createElement('input', {
              type: 'number',
              value: formData.price_per_night,
              onChange: (e) => handleChange('price_per_night', parseFloat(e.target.value) || 0),
              min: 0,
              step: 500,
              placeholder: 'e.g., 5000',
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }
            }),
            React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', marginTop: '4px' } },
              'This is the ' + labels.priceLabel.toLowerCase() + ' for this ' + labels.singular.toLowerCase()
            )
          ),
          // Description
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' } }, 'Description'),
            React.createElement('textarea', {
              value: formData.description,
              onChange: (e) => handleChange('description', e.target.value),
              placeholder: 'Describe this ' + labels.singular.toLowerCase(),
              rows: 3,
              style: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', resize: 'vertical' }
            })
          ),
          // Submit
          React.createElement('button', {
            onClick: handleSave,
            disabled: saving,
            style: { padding: '12px', background: saving ? '#94a3b8' : '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
          }, saving ? React.createElement(Loader2, { size: 18, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Save, { size: 18 }), saving ? 'Saving...' : 'Save ' + labels.singular)
        )
      )
    )
  );
}

export default RoomPage;