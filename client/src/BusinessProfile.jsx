import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Save, Camera, X, CheckCircle, AlertCircle, Edit3, ExternalLink, ArrowLeft, Layers, Image, Sparkles } from 'lucide-react';
import ImageUpload from './components/forms/ImageUpload';
import BusinessGallery from './components/forms/BusinessGallery';
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
    cover_image: business?.cover_image || '',
    logo_url: business?.logo_url || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(function() {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return function() { window.removeEventListener('resize', handleResize); };
  }, []);

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
        cover_image: business.cover_image || '',
        logo_url: business.logo_url || ''
      });
    }
  }, [business]);

  function showMessage(type, text) {
    setMessage({ type: type, text: text });
    setTimeout(function() { setMessage({ type: '', text: '' }); }, 3000);
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
    
    var updateData = {
      cover_image: formData.cover_image,
      logo_url: formData.logo_url,
      about_text: formData.about_text,
      description: formData.description,
      website: formData.website,
      name: formData.name
    };
    
    fetch(API_BASE + '/api/businesses/' + business.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          showMessage('success', 'Profile updated successfully');
          setIsEditing(false);
          
          // Update localStorage with new business data
          var currentBusiness = localStorage.getItem('currentBusiness');
          if (currentBusiness) {
            try {
              var parsed = JSON.parse(currentBusiness);
              parsed.logo_url = formData.logo_url;
              parsed.cover_image = formData.cover_image;
              parsed.name = formData.name;
              localStorage.setItem('currentBusiness', JSON.stringify(parsed));
            } catch(e) {}
          }
          
          if (onUpdate) onUpdate(data.business);
        } else {
          showMessage('error', data.error || 'Failed to update profile');
        }
      })
      .catch(function(err) { 
        console.error('Save error:', err);
        showMessage('error', 'Something went wrong. Please try again.'); 
      })
      .finally(function() { setSaving(false); });
  }

  function handleLogoUpload(url) {
    if (url) {
      handleChange('logo_url', url);
      // Auto-save after logo upload
      setTimeout(function() { handleSave(); }, 300);
    }
  }

  function handleCoverUpload(url) {
    if (url) {
      handleChange('cover_image', url);
      // Auto-save after cover upload
      setTimeout(function() { handleSave(); }, 300);
    }
  }

  // Loading state
  if (!business || !business.id) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '50px' } },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('p', { style: { marginTop: '16px', color: '#64748b' } }, 'Loading business profile...')
    );
  }

  // Premium styles
  var containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isDesktop ? '32px' : '16px',
    background: '#f8fafc',
    minHeight: '100vh'
  };

  var headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  var titleStyle = {
    fontSize: isDesktop ? '28px' : '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  };

  var subtitleStyle = {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  };

  var backButtonStyle = {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  var editButtonStyle = {
    padding: '10px 20px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  var saveButtonStyle = {
    padding: '10px 20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  var cancelButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  var gridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
    gap: '24px'
  };

  var cardStyle = {
    backgroundColor: 'white',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  };

  var cardHeaderStyle = {
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafbff',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  var cardHeaderIconStyle = {
    width: '40px',
    height: '40px',
    background: '#eef2ff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  var cardTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0
  };

  var cardBodyStyle = {
    padding: '24px'
  };

  var infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '8px'
  };

  var labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    minWidth: '100px'
  };

  var valueStyle = {
    fontSize: '14px',
    color: '#1e293b',
    flex: 1,
    wordBreak: 'break-word'
  };

  var inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  var textareaStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  var imageRowStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
    gap: '24px'
  };

  var imageCardStyle = {
    background: '#fafbff',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    border: '1px solid #eef2ff'
  };

  var imageTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 4px 0'
  };

  var imageHintStyle = {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '16px'
  };

  return React.createElement('div', { style: containerStyle },
    // Header
    React.createElement('div', { style: headerStyle },
      React.createElement('div', null,
        React.createElement('h1', { style: titleStyle }, 'Business Profile'),
        React.createElement('p', { style: subtitleStyle }, 'Manage your brand identity and business information')
      ),
      React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
        React.createElement('button', { onClick: onBack, style: backButtonStyle },
          React.createElement(ArrowLeft, { size: 14 }), ' Dashboard'
        ),
        !isEditing && React.createElement('button', { onClick: function() { setIsEditing(true); }, style: editButtonStyle },
          React.createElement(Edit3, { size: 14 }), ' Edit Profile'
        ),
        isEditing && React.createElement('button', { onClick: handleSave, disabled: saving, style: saveButtonStyle },
          React.createElement(Save, { size: 14 }), saving ? 'Saving...' : 'Save Changes'
        ),
        isEditing && React.createElement('button', { onClick: function() { setIsEditing(false); }, style: cancelButtonStyle }, 'Cancel')
      )
    ),

    // Message Toast
    message.text && React.createElement('div', { style: {
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
      color: message.type === 'success' ? '#065f46' : '#991b1b'
    } },
      message.type === 'success' ? React.createElement(CheckCircle, { size: 18 }) : React.createElement(AlertCircle, { size: 18 }),
      message.text
    ),

    // Two column layout for Basic Info + About
    React.createElement('div', { style: gridStyle },
      // Basic Information Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement('div', { style: cardHeaderIconStyle },
            React.createElement(Building2, { size: 20, color: '#4f46e5' })
          ),
          React.createElement('h3', { style: cardTitleStyle }, 'Basic Information')
        ),
        React.createElement('div', { style: cardBodyStyle },
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
          React.createElement('div', { style: infoRowStyle },
            React.createElement('span', { style: labelStyle }, 'Email'),
            React.createElement('span', { style: { ...valueStyle, display: 'flex', alignItems: 'center', gap: '6px' } },
              React.createElement(Mail, { size: 14, color: '#64748b' }), formData.email
            )
          ),
          React.createElement('div', { style: infoRowStyle },
            React.createElement('span', { style: labelStyle }, 'Phone'),
            React.createElement('span', { style: { ...valueStyle, display: 'flex', alignItems: 'center', gap: '6px' } },
              React.createElement(Phone, { size: 14, color: '#64748b' }), formData.phone || 'Not set'
            )
          ),
          React.createElement('div', { style: infoRowStyle },
            React.createElement('span', { style: labelStyle }, 'Location'),
            React.createElement('span', { style: { ...valueStyle, display: 'flex', alignItems: 'center', gap: '6px' } },
              React.createElement(MapPin, { size: 14, color: '#64748b' }), formData.city + ', ' + formData.state
            )
          ),
          React.createElement('div', { style: { ...infoRowStyle, borderBottom: 'none' } },
            React.createElement('span', { style: labelStyle }, 'Website'),
            formData.website ?
              React.createElement('a', { href: formData.website, target: '_blank', style: { ...valueStyle, color: '#4f46e5', textDecoration: 'none' } }, formData.website) :
              React.createElement('span', { style: valueStyle }, 'Not provided')
          )
        )
      ),

      // About Section Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement('div', { style: cardHeaderIconStyle },
            React.createElement(Globe, { size: 20, color: '#4f46e5' })
          ),
          React.createElement('h3', { style: cardTitleStyle }, 'About Your Business')
        ),
        React.createElement('div', { style: cardBodyStyle },
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' } }, 'Short Description'),
            isEditing ?
              React.createElement('textarea', {
                value: formData.description,
                onChange: function(e) { handleChange('description', e.target.value); },
                rows: 3,
                placeholder: 'Brief description of your business...',
                style: textareaStyle
              }) :
              React.createElement('p', { style: { fontSize: '14px', color: '#1e293b', lineHeight: '1.5' } }, formData.description || 'No description provided')
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' } }, 'Full Story'),
            isEditing ?
              React.createElement('textarea', {
                value: formData.about_text,
                onChange: function(e) { handleChange('about_text', e.target.value); },
                rows: 6,
                placeholder: 'Share your story, amenities, what makes you special...',
                style: { ...textareaStyle, minHeight: '150px' }
              }) :
              React.createElement('p', { style: { fontSize: '14px', color: '#1e293b', lineHeight: '1.5' } }, formData.about_text || 'No story provided')
          )
        )
      )
    ),

    // Brand Images Section - NO duplicate previews (ImageUpload handles its own preview)
    React.createElement('div', { style: { ...cardStyle, marginTop: '24px' } },
      React.createElement('div', { style: cardHeaderStyle },
        React.createElement('div', { style: cardHeaderIconStyle },
          React.createElement(Camera, { size: 20, color: '#4f46e5' })
        ),
        React.createElement('h3', { style: cardTitleStyle }, 'Brand Images')
      ),
      React.createElement('div', { style: cardBodyStyle },
        React.createElement('div', { style: imageRowStyle },
          // Logo Upload - NO extra preview div (ImageUpload shows its own preview)
          React.createElement('div', { style: imageCardStyle },
            React.createElement('h4', { style: imageTitleStyle }, 'Business Logo'),
            React.createElement('p', { style: imageHintStyle }, 'Square format recommended'),
            React.createElement(ImageUpload, {
              businessId: business.id,
              currentImage: formData.logo_url,
              type: 'logo',
              onUpload: handleLogoUpload
            })
          ),
          // Cover Upload - NO extra preview div (ImageUpload shows its own preview)
          React.createElement('div', { style: imageCardStyle },
            React.createElement('h4', { style: imageTitleStyle }, 'Cover Photo'),
            React.createElement('p', { style: imageHintStyle }, '1200x400px recommended'),
            React.createElement(ImageUpload, {
              businessId: business.id,
              currentImage: formData.cover_image,
              type: 'cover',
              onUpload: handleCoverUpload
            })
          )
        )
      )
    ),

    // Photo Gallery Section
    React.createElement('div', { style: { ...cardStyle, marginTop: '24px' } },
      React.createElement('div', { style: cardHeaderStyle },
        React.createElement('div', { style: cardHeaderIconStyle },
          React.createElement(Image, { size: 20, color: '#4f46e5' })
        ),
        React.createElement('h3', { style: cardTitleStyle }, 'Photo Gallery')
      ),
      React.createElement('div', { style: cardBodyStyle },
        React.createElement(BusinessGallery, { businessId: business.id })
      )
    )
  );
}

export default BusinessProfile;