import React from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';

var uniqueIdCounter = 0;

function ImageUpload(props) {
  var currentImage = props.currentImage;
  var onUpload = props.onUpload || props.onImageUploaded;
  var type = props.type || 'general';
  var businessId = props.businessId;
  var label = props.label;
  var description = props.description;
  
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

  var inputId = React.useRef('file-input-' + type + '-' + (++uniqueIdCounter)).current;

  React.useEffect(function() {
    if (currentImage && currentImage !== preview) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  function handleFileSelect(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { 
      setError('Image must be less than 5MB.'); 
      return; 
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) { 
      setError('Only JPG, PNG, and WEBP are supported.'); 
      return; 
    }
    
    setError('');
    setUploading(true);

    var reader = new FileReader();
    reader.onloadend = function() {
      var base64String = reader.result;
      
      var API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : 'http://' + window.location.hostname + ':5000';
      
      var token = localStorage.getItem('auth_token');
      
      console.log('Uploading:', { type, businessId, fileName: file.name });
      
      // Step 1: Upload to Supabase storage
      fetch(API_BASE + '/api/upload-gallery-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
              throw new Error(data.error || 'Upload failed');
            });
          }
          return response.json(); 
        })
        .then(function(data) {
          if (data.success && data.imageUrl) {
            setPreview(data.imageUrl);
            
            // Step 2: For logo/cover, save to business profile via PUT
            if (type === 'logo' || type === 'cover') {
              var updateField = type === 'logo' ? 'logo_url' : 'cover_image';
              var updateData = {};
              updateData[updateField] = data.imageUrl;
              
              console.log('Saving to business profile:', updateData);
              
              fetch(API_BASE + '/api/businesses/' + businessId, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
              })
                .then(function(res) { return res.json(); })
                .then(function(saveData) {
                  if (saveData.success) {
                    console.log('Saved to business profile successfully');
                    if (onUpload) onUpload(data.imageUrl);
                    setUploading(false);
                  } else {
                    setError(saveData.error || 'Failed to save to profile');
                    setUploading(false);
                  }
                })
                .catch(function(err) {
                  console.error('Save to profile error:', err);
                  setError('Image uploaded but failed to save to profile');
                  setUploading(false);
                });
            } 
            // For gallery: save to gallery table
            else {
              fetch(API_BASE + '/api/businesses/' + businessId + '/gallery', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  imageUrl: data.imageUrl,
                  fileName: file.name
                })
              })
                .then(function(res) { return res.json(); })
                .then(function(galleryData) {
                  if (galleryData.success) {
                    if (onUpload) onUpload(galleryData.image || data.imageUrl);
                  } else {
                    setError(galleryData.error || 'Failed to save to gallery');
                  }
                  setUploading(false);
                })
                .catch(function(err) {
                  console.error('Gallery save error:', err);
                  setError('Image uploaded but failed to save to gallery');
                  setUploading(false);
                });
            }
          } else {
            setError(data.error || 'Upload failed');
            setUploading(false);
          }
        })
        .catch(function(err) {
          console.error('Upload error:', err);
          setError(err.message || 'Upload failed. Please try again.');
          setUploading(false);
        });
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setPreview(null);
    if (onUpload) onUpload('');
  }

  return React.createElement('div', { style: { width: '100%' } },
    label && React.createElement('label', {
      style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }
    },
      React.createElement(Image, { size: 14, color: '#4f46e5' }),
      label
    ),
    preview
      ? React.createElement('div', {
          style: { position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '8px' }
        },
          React.createElement('img', { src: preview, alt: label, style: { width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' } }),
          React.createElement('button', {
            onClick: handleRemove,
            style: {
              position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px',
              borderRadius: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            },
            onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(239,68,68,0.9)'; },
            onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }
          }, React.createElement(X, { size: 16 }))
        )
      : React.createElement('div', {
          style: {
            border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '40px 24px',
            textAlign: 'center', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s ease'
          },
          onClick: function () { document.getElementById(inputId).click(); },
          onDragOver: function (e) { e.preventDefault(); e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#eef2ff'; },
          onDragLeave: function (e) { e.preventDefault(); e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; },
          onDrop: function (e) { e.preventDefault(); e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }
        },
          uploading
            ? React.createElement('div', null,
                React.createElement(Loader2, { size: 32, style: { animation: 'spin 0.8s linear infinite', margin: '0 auto 8px', color: '#4f46e5' } }),
                React.createElement('p', { style: { color: '#64748b', fontSize: '14px', margin: 0 } }, 'Uploading...')
              )
            : React.createElement('div', null,
                React.createElement(Upload, { size: 32, style: { margin: '0 auto 8px', color: '#94a3b8' } }),
                React.createElement('p', { style: { color: '#64748b', fontSize: '14px', margin: 0, fontWeight: '500' } }, description),
                React.createElement('p', { style: { color: '#94a3b8', fontSize: '12px', marginTop: '4px' } }, 'JPG, PNG, or WEBP — max 5MB')
              )
        ),
    React.createElement('input', { id: inputId, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: function (e) { if (e.target.files[0]) handleFileSelect(e.target.files[0]); } }),
    error && React.createElement('p', { style: { color: '#ef4444', fontSize: '13px', marginTop: '8px' } }, error)
  );
}

export default ImageUpload;