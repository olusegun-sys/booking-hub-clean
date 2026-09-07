// FILE: client/src/BusinessProfile.jsx
// CLEANED: Removed Cover Image and Gallery sections
// KEPT: Logo upload and all business details

import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Save, Camera, X, CheckCircle, AlertCircle, Edit3, ExternalLink, ArrowLeft, Layers, Image, Sparkles } from 'lucide-react';
import ImageUpload from './components/forms/ImageUpload';
import API_BASE from './config';

function BusinessProfile({ business, onBack, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: business?.name || '',
    email: business?.email || '',
    phone: business?.phone || '',
    address: business?.address || '',
    city: business?.city || '',
    state: business?.state || '',
    description: business?.description || '',
    about_text: business?.about_text || '',
    website: business?.website || '',
    logo_url: business?.logo_url || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize
  useEffect(function() {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return function() { window.removeEventListener('resize', handleResize); };
  }, []);

  // Sync formData when business prop changes
  useEffect(function() {
    if (business) {
      setFormData({
        name: business.name || '',
        email: business.email || '',
        phone: business.phone || '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        description: business.description || '',
        about_text: business.about_text || '',
        website: business.website || '',
        logo_url: business.logo_url || ''
      });
    }
  }, [business]);

  function showMessage(type, text) {
    setMessage({ type: type, text: text });
    setTimeout(function() { setMessage({ type: '', text: '' }); }, 5000);
  }

  function handleChange(field, value) {
    setFormData(function(prev) {
      var updated = {};
      for (var key in prev) updated[key] = prev[key];
      updated[field] = value;
      return updated;
    });
  }

  function handleSave() {
    if (!business || !business.id) {
      showMessage('error', 'Business data not available');
      return;
    }
    
    setSaving(true);
    var token = localStorage.getItem('auth_token');
    
    if (!token) {
      showMessage('error', 'Authentication required. Please log in again.');
      setSaving(false);
      return;
    }
    
    var updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      description: formData.description,
      about_text: formData.about_text,
      website: formData.website,
      logo_url: formData.logo_url
    };
    
    console.log('[BusinessProfile] Saving:', updateData);
    
    fetch(API_BASE + '/api/businesses/' + business.id, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(updateData)
    })
      .then(function(r) { 
        if (!r.ok) {
          return r.json().then(function(errData) {
            throw new Error(errData.error || 'Failed to update profile');
          });
        }
        return r.json(); 
      })
      .then(function(data) {
        if (data.success) {
          showMessage('success', 'Profile updated successfully');
          setIsEditing(false);
          
          // Update localStorage
          var currentBusiness = localStorage.getItem('currentBusiness');
          if (currentBusiness) {
            try {
              var parsed = JSON.parse(currentBusiness);
              parsed = { ...parsed, ...updateData };
              localStorage.setItem('currentBusiness', JSON.stringify(parsed));
            } catch(e) {
              console.error('Failed to update localStorage:', e);
            }
          }
          
          if (onUpdate) {
            onUpdate(data.business);
          }
        } else {
          showMessage('error', data.error || 'Failed to update profile');
        }
      })
      .catch(function(err) { 
        console.error('Save error:', err);
        showMessage('error', err.message || 'Something went wrong. Please try again.'); 
      })
      .finally(function() { setSaving(false); });
  }

  function handleLogoUpload(url) {
    if (url) {
      handleChange('logo_url', url);
      refreshBusinessData();
    }
  }

  function refreshBusinessData() {
    var token = localStorage.getItem('auth_token');
    if (!token || !business || !business.id) return;
    
    fetch(API_BASE + '/api/businesses/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success && data.business) {
          setFormData(function(prev) {
            return {
              ...prev,
              logo_url: data.business.logo_url || ''
            };
          });
          localStorage.setItem('currentBusiness', JSON.stringify(data.business));
          if (onUpdate) onUpdate(data.business);
        }
      })
      .catch(function(err) { console.error('Refresh error:', err); });
  }

  // Loading state
  if (!business || !business.id) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '50px' } },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('p', { style: { marginTop: '16px', color: '#64748b' } }, 'Loading business profile...')
    );
  }

  // ========== RESPONSIVE STYLES ==========
  var containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '12px' : '32px',
    background: '#f8fafc',
    minHeight: '100vh'
  };

  var headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isMobile ? '20px' : '32px',
    flexWrap: 'wrap',
    gap: '12px'
  };

  var titleStyle = {
    fontSize: isMobile ? '22px' : '28px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  };

  var subtitleStyle = {
    fontSize: isMobile ? '13px' : '14px',
    color: '#64748b',
    marginTop: '2px'
  };

  var backButtonStyle = {
    padding: isMobile ? '8px 14px' : '10px 20px',
    backgroundColor: 'white',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  var editButtonStyle = {
    padding: isMobile ? '8px 14px' : '10px 20px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  var saveButtonStyle = {
    padding: isMobile ? '8px 14px' : '10px 20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: '500',
    cursor: saving ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    opacity: saving ? 0.6 : 1
  };

  var cancelButtonStyle = {
    padding: isMobile ? '8px 14px' : '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '40px',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  var gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
    gap: isMobile ? '16px' : '24px'
  };

  var cardStyle = {
    backgroundColor: 'white',
    borderRadius: isMobile ? '16px' : '20px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  };

  var cardHeaderStyle = {
    padding: isMobile ? '16px 18px' : '20px 24px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafbff',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  var cardHeaderIconStyle = {
    width: isMobile ? '36px' : '40px',
    height: isMobile ? '36px' : '40px',
    background: '#eef2ff',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  var cardTitleStyle = {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0
  };

  var cardBodyStyle = {
    padding: isMobile ? '16px' : '24px'
  };

  var infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: isMobile ? '10px 0' : '12px 0',
    borderBottom: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '6px'
  };

  var labelStyle = {
    fontSize: isMobile ? '11px' : '12px',
    fontWeight: '600',
    color: '#64748b',
    minWidth: isMobile ? '80px' : '100px'
  };

  var valueStyle = {
    fontSize: isMobile ? '13px' : '14px',
    color: '#1e293b',
    flex: 1,
    wordBreak: 'break-word'
  };

  var inputStyle = {
    width: '100%',
    padding: isMobile ? '10px 12px' : '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: isMobile ? '14px' : '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  var textareaStyle = {
    width: '100%',
    padding: isMobile ? '10px 12px' : '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: isMobile ? '14px' : '14px',
    minHeight: isMobile ? '80px' : '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  // ========== RENDER ==========
  return React.createElement('div', { style: containerStyle },
    // Header
    React.createElement('div', { style: headerStyle },
      React.createElement('div', null,
        React.createElement('h1', { style: titleStyle }, 'Business Profile'),
        React.createElement('p', { style: subtitleStyle }, 'Manage your brand identity and business information')
      ),
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        React.createElement('button', { onClick: onBack, style: backButtonStyle },
          React.createElement(ArrowLeft, { size: isMobile ? 12 : 14 }), 'Dashboard'
        ),
        !isEditing && React.createElement('button', { onClick: function() { setIsEditing(true); }, style: editButtonStyle },
          React.createElement(Edit3, { size: isMobile ? 12 : 14 }), isMobile ? 'Edit' : 'Edit Profile'
        ),
        isEditing && React.createElement('button', { onClick: handleSave, disabled: saving, style: saveButtonStyle },
          React.createElement(Save, { size: isMobile ? 12 : 14 }), saving ? 'Saving...' : 'Save'
        ),
        isEditing && React.createElement('button', { onClick: function() { setIsEditing(false); }, style: cancelButtonStyle }, 'Cancel')
      )
    ),

    // Message Toast
    message.text && React.createElement('div', { style: {
      padding: '10px 14px',
      borderRadius: '10px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
      color: message.type === 'success' ? '#065f46' : '#991b1b',
      fontSize: isMobile ? '13px' : '14px'
    } },
      message.type === 'success' ? React.createElement(CheckCircle, { size: isMobile ? 16 : 18 }) : React.createElement(AlertCircle, { size: isMobile ? 16 : 18 }),
      message.text
    ),

    // Basic Information Card - ALL FIELDS EDITABLE
    React.createElement('div', { style: cardStyle },
      React.createElement('div', { style: cardHeaderStyle },
        React.createElement('div', { style: cardHeaderIconStyle },
          React.createElement(Building2, { size: isMobile ? 16 : 20, color: '#4f46e5' })
        ),
        React.createElement('h3', { style: cardTitleStyle }, 'Basic Information')
      ),
      React.createElement('div', { style: cardBodyStyle },
        // Business Name
        React.createElement('div', { style: infoRowStyle },
          React.createElement('span', { style: labelStyle }, 'Business Name'),
          isEditing ?
            React.createElement('input', {
              type: 'text',
              value: formData.name,
              onChange: function(e) { handleChange('name', e.target.value); },
              style: inputStyle
            }) :
            React.createElement('span', { style: valueStyle }, formData.name)
        ),
        // Email
        React.createElement('div', { style: infoRowStyle },
          React.createElement('span', { style: labelStyle }, 'Email'),
          isEditing ?
            React.createElement('input', {
              type: 'email',
              value: formData.email,
              onChange: function(e) { handleChange('email', e.target.value); },
              style: inputStyle
            }) :
            React.createElement('span', { style: { ...valueStyle, display: 'flex', alignItems: 'center', gap: '4px' } },
              React.createElement(Mail, { size: isMobile ? 12 : 14, color: '#64748b' }), formData.email
            )
        ),
        // Phone
        React.createElement('div', { style: infoRowStyle },
          React.createElement('span', { style: labelStyle }, 'Phone'),
          isEditing ?
            React.createElement('input', {
              type: 'tel',
              value: formData.phone,
              onChange: function(e) { handleChange('phone', e.target.value); },
              style: inputStyle
            }) :
            React.createElement('span', { style: { ...valueStyle, display: 'flex', alignItems: 'center', gap: '4px' } },
              React.createElement(Phone, { size: isMobile ? 12 : 14, color: '#64748b' }), formData.phone || 'Not set'
            )
        ),
        // Address
        React.createElement('div', { style: infoRowStyle },
          React.createElement('span', { style: labelStyle }, 'Address'),
          isEditing ?
            React.createElement('input', {
              type: 'text',
              value: formData.address,
              onChange: function(e) { handleChange('address', e.target.value); },
              style: inputStyle
            }) :
            React.createElement('span', { style: { ...valueStyle, display: 'flex', alignItems: 'center', gap: '4px' } },
              React.createElement(MapPin, { size: isMobile ? 12 : 14, color: '#64748b' }), formData.address || 'Not set'
            )
        ),
        // City
        React.createElement('div', { style: infoRowStyle },
          React.createElement('span', { style: labelStyle }, 'City'),
          isEditing ?
            React.createElement('input', {
              type: 'text',
              value: formData.city,
              onChange: function(e) { handleChange('city', e.target.value); },
              style: inputStyle
            }) :
            React.createElement('span', { style: valueStyle }, formData.city || 'Not set')
        ),
        // State
        React.createElement('div', { style: infoRowStyle },
          React.createElement('span', { style: labelStyle }, 'State'),
          isEditing ?
            React.createElement('input', {
              type: 'text',
              value: formData.state,
              onChange: function(e) { handleChange('state', e.target.value); },
              style: inputStyle
            }) :
            React.createElement('span', { style: valueStyle }, formData.state || 'Not set')
        ),
        // Website
        React.createElement('div', { style: { ...infoRowStyle, borderBottom: 'none' } },
          React.createElement('span', { style: labelStyle }, 'Website'),
          isEditing ?
            React.createElement('input', {
              type: 'url',
              value: formData.website,
              onChange: function(e) { handleChange('website', e.target.value); },
              placeholder: 'https://yourwebsite.com',
              style: inputStyle
            }) :
            formData.website ?
              React.createElement('a', { href: formData.website, target: '_blank', style: { ...valueStyle, color: '#4f46e5', textDecoration: 'none' } }, formData.website) :
              React.createElement('span', { style: valueStyle }, 'Not provided')
        )
      )
    ),

    // About Section Card
    React.createElement('div', { style: { ...cardStyle, marginTop: '16px' } },
      React.createElement('div', { style: cardHeaderStyle },
        React.createElement('div', { style: cardHeaderIconStyle },
          React.createElement(Globe, { size: isMobile ? 16 : 20, color: '#4f46e5' })
        ),
        React.createElement('h3', { style: cardTitleStyle }, 'About Your Business')
      ),
      React.createElement('div', { style: cardBodyStyle },
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { fontSize: isMobile ? '11px' : '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' } }, 'Short Description'),
          isEditing ?
            React.createElement('textarea', {
              value: formData.description,
              onChange: function(e) { handleChange('description', e.target.value); },
              rows: 3,
              placeholder: 'Brief description of your business...',
              style: textareaStyle
            }) :
            React.createElement('p', { style: { fontSize: isMobile ? '13px' : '14px', color: '#1e293b', lineHeight: '1.5' } }, formData.description || 'No description provided')
        ),
        React.createElement('div', null,
          React.createElement('label', { style: { fontSize: isMobile ? '11px' : '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' } }, 'Full Story'),
          isEditing ?
            React.createElement('textarea', {
              value: formData.about_text,
              onChange: function(e) { handleChange('about_text', e.target.value); },
              rows: 5,
              placeholder: 'Share your story, amenities, what makes you special...',
              style: { ...textareaStyle, minHeight: isMobile ? '120px' : '150px' }
            }) :
            React.createElement('p', { style: { fontSize: isMobile ? '13px' : '14px', color: '#1e293b', lineHeight: '1.5' } }, formData.about_text || 'No story provided')
        )
      )
    ),

    // Logo Upload Section (ONLY - Cover and Gallery removed)
    React.createElement('div', { style: { ...cardStyle, marginTop: '16px', marginBottom: '24px' } },
      React.createElement('div', { style: cardHeaderStyle },
        React.createElement('div', { style: cardHeaderIconStyle },
          React.createElement(Camera, { size: isMobile ? 16 : 20, color: '#4f46e5' })
        ),
        React.createElement('h3', { style: cardTitleStyle }, 'Business Logo')
      ),
      React.createElement('div', { style: cardBodyStyle },
        React.createElement('div', { style: { maxWidth: isMobile ? '100%' : '400px', margin: '0 auto' } },
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '16px' } },
            'Upload your business logo. Square format (1:1 ratio) recommended.'
          ),
          React.createElement(ImageUpload, {
            businessId: business.id,
            currentImage: formData.logo_url,
            type: 'logo',
            onUpload: handleLogoUpload,
            onRefresh: refreshBusinessData
          })
        )
      )
    )
  );
}

export default BusinessProfile;