// FILE: client/src/components/forms/ImageUpload.jsx
// COMPLETE FIX - Add detailed logging and error handling

import React from 'react';
import { Upload, X, Image, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import API_BASE from '../../config';

var uniqueIdCounter = 0;

function ImageUpload(props) {
  var currentImage = props.currentImage;
  var onUpload = props.onUpload || props.onImageUploaded;
  var onRefresh = props.onRefresh;
  var type = props.type || 'general';
  var businessId = props.businessId;
  var label = props.label;
  var description = props.description;
  var isMobile = window.innerWidth < 768;
  
  if (!label) {
    if (type === 'logo') label = 'Business Logo';
    else if (type === 'cover') label = 'Cover Photo';
    else label = 'Upload Image';
  }
  
  if (!description) {
    if (type === 'logo') description = 'Upload your business logo';
    else if (type === 'cover') description = 'Upload your cover photo';
    else description = 'Click or drag to upload';
  }
  
  var _useState = React.useState(false);
  var uploading = _useState[0];
  var setUploading = _useState[1];
  
  var _useState2 = React.useState(currentImage || null);
  var preview = _useState2[0];
  var setPreview = _useState2[1];
  
  var _useState3 = React.useState('');
  var error = _useState3[0];
  var setError = _useState3[1];
  
  var _useState4 = React.useState('');
  var successMsg = _useState4[0];
  var setSuccessMsg = _useState4[1];

  var inputId = React.useRef('file-input-' + type + '-' + (++uniqueIdCounter)).current;

  React.useEffect(function() {
    if (currentImage && currentImage !== preview) {
      setPreview(currentImage);
      setError('');
    }
  }, [currentImage]);

  function handleFileSelect(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { 
      setError('Image must be less than 5MB.'); 
      setSuccessMsg('');
      return; 
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) { 
      setError('Only JPG, PNG, and WEBP are supported.'); 
      setSuccessMsg('');
      return; 
    }
    
    setError('');
    setSuccessMsg('');
    setUploading(true);

    var reader = new FileReader();
    reader.onloadend = function() {
      var base64String = reader.result;
      
      var token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setUploading(false);
        return;
      }
      
      // LOG: Check businessId
      console.log('[ImageUpload] Uploading:', { 
        type, 
        businessId: businessId, 
        fileName: file.name,
        hasToken: !!token
      });
      
      // Step 1: Upload to backend
      fetch(API_BASE + '/api/upload-gallery-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          businessId: businessId,
          fileName: file.name,
          fileType: file.type,
          fileData: base64String
        })
      })
        .then(function(response) { 
          if (!response.ok) {
            return response.json().then(function(data) {
              throw new Error(data.error || 'Upload failed with status ' + response.status);
            });
          }
          return response.json(); 
        })
        .then(function(data) {
          console.log('[ImageUpload] Upload response:', data);
          if (data.success && data.imageUrl) {
            setPreview(data.imageUrl);
            setSuccessMsg('Image uploaded successfully!');
            
            // Step 2: For logo/cover, save to business profile via PUT
            if (type === 'logo' || type === 'cover') {
              var updateField = type === 'logo' ? 'logo_url' : 'cover_image';
              var updateData = {};
              updateData[updateField] = data.imageUrl;
              
              console.log('[ImageUpload] Saving to business profile:', {
                businessId: businessId,
                updateField: updateField,
                updateData: updateData
              });
              
              // CRITICAL FIX: Check if businessId is valid
              if (!businessId) {
                console.error('[ImageUpload] Invalid businessId:', businessId);
                setError('Business ID is missing. Please refresh the page and try again.');
                setUploading(false);
                return;
              }
              
              fetch(API_BASE + '/api/businesses/' + businessId, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(updateData)
              })
                .then(function(res) { 
                  console.log('[ImageUpload] PUT response status:', res.status);
                  if (!res.ok) {
                    return res.json().then(function(errData) {
                      throw new Error(errData.error || 'Failed to save to profile (status ' + res.status + ')');
                    });
                  }
                  return res.json(); 
                })
                .then(function(saveData) {
                  console.log('[ImageUpload] Profile save response:', saveData);
                  if (saveData.success) {
                    console.log('[ImageUpload] Saved to business profile successfully');
                    if (onUpload) onUpload(data.imageUrl);
                    // CRITICAL FIX: Refresh parent data after successful save
                    if (onRefresh) {
                      console.log('[ImageUpload] Refreshing parent data');
                      onRefresh();
                    }
                    setUploading(false);
                  } else {
                    setError(saveData.error || 'Failed to save to profile');
                    setUploading(false);
                  }
                })
                .catch(function(err) {
                  console.error('[ImageUpload] Save to profile error:', err);
                  setError('Image uploaded but failed to save to profile: ' + err.message);
                  setUploading(false);
                });
            } else {
              // For gallery
              fetch(API_BASE + '/api/businesses/' + businessId + '/gallery', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                  imageUrl: data.imageUrl,
                  fileName: file.name
                })
              })
                .then(function(res) { 
                  if (!res.ok) {
                    return res.json().then(function(errData) {
                      throw new Error(errData.error || 'Failed to save to gallery');
                    });
                  }
                  return res.json(); 
                })
                .then(function(galleryData) {
                  console.log('[ImageUpload] Gallery save response:', galleryData);
                  if (galleryData.success) {
                    if (onUpload) onUpload(galleryData.image || data.imageUrl);
                    if (onRefresh) onRefresh();
                    setUploading(false);
                  } else {
                    setError(galleryData.error || 'Failed to save to gallery');
                    setUploading(false);
                  }
                })
                .catch(function(err) {
                  console.error('[ImageUpload] Gallery save error:', err);
                  setError('Image uploaded but failed to save to gallery: ' + err.message);
                  setUploading(false);
                });
            }
          } else {
            setError(data.error || 'Upload failed');
            setUploading(false);
          }
        })
        .catch(function(err) {
          console.error('[ImageUpload] Upload error:', err);
          setError(err.message || 'Upload failed. Please try again.');
          setUploading(false);
        });
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setPreview(null);
    setError('');
    setSuccessMsg('');
    if (onUpload) onUpload('');
  }

  // ========== RESPONSIVE STYLES ==========
  var containerStyle = {
    width: '100%'
  };

  var labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#475569',
    fontSize: isMobile ? '13px' : '14px'
  };

  var previewContainerStyle = {
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    marginBottom: '8px',
    background: '#f8fafc'
  };

  var previewImageStyle = {
    width: '100%',
    maxHeight: isMobile ? '150px' : '200px',
    objectFit: 'contain',
    display: 'block',
    background: '#f8fafc'
  };

  var removeButtonStyle = {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: isMobile ? '36px' : '32px',
    height: isMobile ? '36px' : '32px',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.6)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  var uploadAreaStyle = {
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    padding: isMobile ? '24px 16px' : '40px 24px',
    textAlign: 'center',
    background: '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: isMobile ? '80px' : 'auto'
  };

  var errorStyle = {
    color: '#ef4444',
    fontSize: isMobile ? '12px' : '13px',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  var successStyle = {
    color: '#10b981',
    fontSize: isMobile ? '12px' : '13px',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  return React.createElement('div', { style: containerStyle },
    label && React.createElement('label', { style: labelStyle },
      React.createElement(Image, { size: isMobile ? 12 : 14, color: '#4f46e5' }),
      label
    ),
    
    preview
      ? React.createElement('div', { style: previewContainerStyle },
          React.createElement('img', { 
            src: preview, 
            alt: label, 
            style: previewImageStyle,
            onError: function(e) {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
            }
          }),
          React.createElement('button', {
            onClick: handleRemove,
            style: removeButtonStyle,
            onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(239,68,68,0.9)'; },
            onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }
          }, React.createElement(X, { size: isMobile ? 18 : 16 }))
        )
      : React.createElement('div', {
          style: uploadAreaStyle,
          onClick: function () { document.getElementById(inputId).click(); },
          onDragOver: function (e) { 
            e.preventDefault(); 
            e.currentTarget.style.borderColor = '#4f46e5'; 
            e.currentTarget.style.background = '#eef2ff'; 
          },
          onDragLeave: function (e) { 
            e.preventDefault(); 
            e.currentTarget.style.borderColor = '#cbd5e1'; 
            e.currentTarget.style.background = '#f8fafc'; 
          },
          onDrop: function (e) { 
            e.preventDefault(); 
            e.currentTarget.style.borderColor = '#cbd5e1'; 
            e.currentTarget.style.background = '#f8fafc'; 
            if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); 
          }
        },
          uploading
            ? React.createElement('div', null,
                React.createElement(Loader2, { size: isMobile ? 24 : 32, style: { animation: 'spin 0.8s linear infinite', margin: '0 auto 6px', color: '#4f46e5' } }),
                React.createElement('p', { style: { color: '#64748b', fontSize: isMobile ? '13px' : '14px', margin: 0 } }, 'Uploading...')
              )
            : React.createElement('div', null,
                React.createElement(Upload, { size: isMobile ? 24 : 32, style: { margin: '0 auto 6px', color: '#94a3b8' } }),
                React.createElement('p', { style: { color: '#64748b', fontSize: isMobile ? '13px' : '14px', margin: 0, fontWeight: '500' } }, description),
                React.createElement('p', { style: { color: '#94a3b8', fontSize: isMobile ? '11px' : '12px', marginTop: '2px' } }, 'JPG, PNG, or WEBP — max 5MB')
              )
        ),
    
    React.createElement('input', { 
      id: inputId, 
      type: 'file', 
      accept: 'image/*', 
      style: { display: 'none' }, 
      onChange: function (e) { 
        if (e.target.files[0]) handleFileSelect(e.target.files[0]); 
        e.target.value = '';
      } 
    }),
    
    error && React.createElement('p', { style: errorStyle },
      React.createElement(AlertCircle, { size: isMobile ? 14 : 14 }),
      error
    ),
    
    successMsg && !error && React.createElement('p', { style: successStyle },
      React.createElement(CheckCircle, { size: isMobile ? 14 : 14 }),
      successMsg
    )
  );
}

export default ImageUpload;