// FILE: client/src/components/forms/BusinessGallery.jsx
// COMPLETE FIX - Better error handling

import React, { useState, useEffect } from 'react';
import { Trash2, Image as ImageIcon, Loader2, AlertCircle, Plus } from 'lucide-react';
import API_BASE from '../../config';
import ImageUpload from './ImageUpload';

function BusinessGallery({ businessId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('auth_token');

  useEffect(function() {
    if (businessId) {
      fetchGallery();
    }
  }, [businessId]);

  function fetchGallery() {
    setLoading(true);
    setError('');
    fetch(API_BASE + '/api/businesses/' + businessId + '/gallery', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { 
        if (!res.ok) {
          throw new Error('Failed to fetch gallery: ' + res.status);
        }
        return res.json(); 
      })
      .then(function(data) {
        if (data.success && data.images) {
          setImages(data.images);
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(function(err) {
        console.error('Gallery fetch error:', err);
        setError(err.message || 'Failed to load gallery');
        setLoading(false);
      });
  }

  function handleGalleryUpload(imageData) {
    console.log('[BusinessGallery] Upload callback received:', imageData);
    if (imageData) {
      // Refresh gallery
      fetchGallery();
    } else {
      setError('Upload failed - no image data received');
    }
  }

  function handleDelete(imageId) {
    if (!confirm('Remove this image from your gallery?')) return;
    
    fetch(API_BASE + '/api/businesses/' + businessId + '/gallery/' + imageId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { 
        if (!res.ok) {
          throw new Error('Failed to delete image');
        }
        return res.json(); 
      })
      .then(function(data) {
        if (data.success) {
          setImages(prev => prev.filter(img => img.id !== imageId));
        } else {
          setError(data.error || 'Failed to delete image');
        }
      })
      .catch(function(err) { 
        console.error('Delete error:', err);
        setError(err.message || 'Failed to delete image');
      });
  }

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '40px' } },
      React.createElement(Loader2, { size: 32, style: { animation: 'spin 0.8s linear infinite', color: '#4f46e5' } }),
      React.createElement('p', { style: { marginTop: '12px', color: '#64748b' } }, 'Loading gallery...')
    );
  }

  var containerStyle = {
    width: '100%'
  };

  var emptyStateStyle = {
    textAlign: 'center',
    padding: '60px',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '2px dashed #e2e8f0'
  };

  var gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  };

  var imageCardStyle = {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    aspectRatio: '1',
    background: '#f1f5f9'
  };

  var imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  var deleteButtonStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    background: 'rgba(0,0,0,0.6)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  var errorStyle = {
    color: '#ef4444',
    fontSize: '13px',
    padding: '8px 12px',
    background: '#fee2e2',
    borderRadius: '8px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return React.createElement('div', { style: containerStyle },
    error && React.createElement('div', { style: errorStyle },
      React.createElement(AlertCircle, { size: 14 }),
      error,
      React.createElement('button', {
        onClick: function() { setError(''); fetchGallery(); },
        style: { marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '500' }
      }, 'Retry')
    ),
    
    React.createElement('div', { style: { marginBottom: '24px' } },
      React.createElement(ImageUpload, {
        businessId: businessId,
        type: 'gallery',
        onUpload: handleGalleryUpload,
        label: React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          React.createElement(Plus, { size: 14 }),
          'Add Photo to Gallery'
        ),
        description: 'Click or drag to upload (max 5 images)'
      })
    ),
    
    images.length === 0 ?
      React.createElement('div', { style: emptyStateStyle },
        React.createElement(ImageIcon, { size: 48, color: '#94a3b8' }),
        React.createElement('p', { style: { marginTop: '12px', color: '#64748b', fontSize: '14px' } }, 'No photos yet'),
        React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8' } }, 'Upload photos to showcase your business')
      ) :
      React.createElement('div', { style: gridStyle },
        images.map(function(img) {
          return React.createElement('div', { key: img.id, style: imageCardStyle },
            React.createElement('img', { 
              src: img.image_url, 
              style: imageStyle,
              onError: function(e) {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop';
              }
            }),
            React.createElement('button', {
              onClick: function() { handleDelete(img.id); },
              style: deleteButtonStyle,
              onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(239,68,68,0.9)'; },
              onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }
            }, React.createElement(Trash2, { size: 14 }))
          );
        })
      )
  );
}

export default BusinessGallery;