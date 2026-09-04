import React from 'react';
import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { showError, showSuccess } from './toast';
import API_BASE from './config';

function AddRoomForm({ businessId, businessType, onBack, onRoomAdded }) {
  console.log('AddRoomForm rendering with props:', { businessId, businessType });
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    type: 'Standard', 
    capacity: 2, 
    price: '', 
    description: '', 
    amenities: '' 
  });

  const token = localStorage.getItem('auth_token');
  
  const labels = {
    hotel: { item: 'Room', priceLabel: 'Price Per Night (₦)', placeholder: 'e.g., 25000' },
    sports: { item: 'Court', priceLabel: 'Price Per Hour (₦)', placeholder: 'e.g., 5000' },
    event: { item: 'Space', priceLabel: 'Price Per Event (₦)', placeholder: 'e.g., 150000' }
  }[businessType] || { item: 'Room', priceLabel: 'Price Per Night (₦)', placeholder: 'e.g., 25000' };

  const roomTypes = businessType === 'sports' 
    ? ['Hard Court', 'Clay Court', 'Grass Court', 'Football Pitch', 'Basketball Court']
    : businessType === 'event' 
      ? ['Conference Hall', 'Banquet Hall', 'Outdoor Space', 'Meeting Room', 'Ballroom']
      : ['Standard', 'Deluxe', 'Premium', 'Suite', 'Executive'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.name.trim().length < 2) {
      showError(`Please enter a ${labels.item.toLowerCase()} name.`);
      return;
    }
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      showError('Please enter a valid price.');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/businesses/${businessId}/rooms/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ 
          name: formData.name.trim(), 
          type: formData.type, 
          capacity: parseInt(formData.capacity), 
          price_per_night: parseFloat(formData.price), 
          description: formData.description, 
          amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) : [] 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(`${labels.item} added successfully!`);
        if (onRoomAdded) onRoomAdded(data.room);
        setFormData({ name: '', type: 'Standard', capacity: 2, price: '', description: '', amenities: '' });
      } else {
        showError(data.error || `Failed to add ${labels.item.toLowerCase()}.`);
      }
    } catch (err) {
      console.error('Add room error:', err);
      showError('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  // Safety check - if no businessId, show error
  if (!businessId) {
    return React.createElement('div', { style: { padding: '40px', textAlign: 'center' } },
      React.createElement('p', { style: { color: '#ef4444' } }, 'Error: No business ID found. Please log in again.'),
      React.createElement('button', { onClick: onBack, style: { marginTop: '16px', padding: '8px 16px', cursor: 'pointer' } }, 'Go Back')
    );
  }

  return React.createElement('div', { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
    React.createElement('button', { 
      onClick: onBack, 
      style: { marginBottom: '24px', padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
    },
      React.createElement(ArrowLeft, { size: 16 }), ' Back to Dashboard'
    ),
    React.createElement('div', { style: { background: 'white', borderRadius: '20px', padding: '32px', border: '1px solid #e2e8f0' } },
      React.createElement('h2', { style: { fontSize: '24px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' } },
        React.createElement(Plus, { size: 22, color: '#4f46e5' }), ' Add New ', labels.item
      ),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, labels.item, ' Name *'),
          React.createElement('input', {
            type: 'text',
            required: true,
            value: formData.name,
            onChange: (e) => setFormData({...formData, name: e.target.value}),
            style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }
          })
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' } },
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, labels.item, ' Type'),
            React.createElement('select', {
              value: formData.type,
              onChange: (e) => setFormData({...formData, type: e.target.value}),
              style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: 'white' }
            }, roomTypes.map(type => React.createElement('option', { key: type, value: type }, type)))
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, 'Capacity'),
            React.createElement('select', {
              value: formData.capacity,
              onChange: (e) => setFormData({...formData, capacity: parseInt(e.target.value)}),
              style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: 'white' }
            }, [1,2,3,4,5,6,8,10,12,15,20,25,30,40,50].map(num => React.createElement('option', { key: num, value: num }, num)))
          )
        ),
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, labels.priceLabel, ' *'),
          React.createElement('input', {
            type: 'number',
            required: true,
            value: formData.price,
            onChange: (e) => setFormData({...formData, price: e.target.value}),
            style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' },
            placeholder: labels.placeholder,
            min: "0"
          })
        ),
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, 'Description'),
          React.createElement('textarea', {
            value: formData.description,
            onChange: (e) => setFormData({...formData, description: e.target.value}),
            style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' },
            rows: "3"
          })
        ),
        React.createElement('div', { style: { marginBottom: '24px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, 'Amenities (comma-separated)'),
          React.createElement('input', {
            type: 'text',
            value: formData.amenities,
            onChange: (e) => setFormData({...formData, amenities: e.target.value}),
            style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' },
            placeholder: 'WiFi, AC, TV, Mini Bar'
          })
        ),
        React.createElement('button', {
          type: 'submit',
          disabled: loading,
          style: { 
            width: '100%', 
            padding: '14px', 
            background: loading ? '#94a3b8' : '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '40px', 
            fontSize: '14px', 
            fontWeight: '600', 
            cursor: loading ? 'not-allowed' : 'pointer'
          }
        }, loading ? `Adding ${labels.item}...` : `Add ${labels.item}`)
      )
    )
  );
}

export default AddRoomForm;