import React, { useState, useEffect } from 'react';
import { Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import API_BASE from '../../config';
import ImageUpload from './ImageUpload';

function BusinessGallery({ businessId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('auth_token');

  useEffect(function() {
    if (businessId) {
      fetchGallery();
    }
  }, [businessId]);

  function fetchGallery() {
    setLoading(true);
    fetch(API_BASE + '/api/businesses/' + businessId + '/gallery', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success && data.images) {
          setImages(data.images);
        }
        setLoading(false);
      })
      .catch(function(err) {
        console.error('Gallery fetch error:', err);
        setLoading(false);
      });
  }

  function handleGalleryUpload(imageData) {
    if (!imageData) return;
    fetchGallery();
  }

  function handleDelete(imageId) {
    if (!confirm('Remove this image from your gallery?')) return;
    
    fetch(API_BASE + '/api/businesses/' + businessId + '/gallery/' + imageId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          setImages(prev => prev.filter(img => img.id !== imageId));
        }
      })
      .catch(function(err) { console.error('Delete error:', err); });
  }

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '40px' } },
      React.createElement(Loader2, { size: 32, style: { animation: 'spin 0.8s linear infinite', color: '#4f46e5' } }),
      React.createElement('p', { style: { marginTop: '12px', color: '#64748b' } }, 'Loading gallery...')
    );
  }

  return React.createElement('div', null,
    React.createElement('div', { style: { marginBottom: '24px' } },
      React.createElement(ImageUpload, {
        businessId: businessId,
        type: 'gallery',
        onUpload: handleGalleryUpload,
        label: 'Add Photo to Gallery',
        description: 'Click or drag to upload'
      })
    ),
    
    images.length === 0 ?
      React.createElement('div', { style: { textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' } },
        React.createElement(ImageIcon, { size: 48, color: '#94a3b8' }),
        React.createElement('p', { style: { marginTop: '12px', color: '#64748b', fontSize: '14px' } }, 'No photos yet'),
        React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8' } }, 'Upload photos to showcase your business')
      ) :
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' } },
        images.map(function(img) {
          return React.createElement('div', { key: img.id, style: { position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1', background: '#f1f5f9' } },
            React.createElement('img', { src: img.image_url, style: { width: '100%', height: '100%', objectFit: 'cover' } }),
            React.createElement('button', {
              onClick: function() { handleDelete(img.id); },
              style: {
                position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px',
                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', cursor: 'pointer',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
              },
              onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(239,68,68,0.9)'; },
              onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }
            }, React.createElement(Trash2, { size: 14 }))
          );
        })
      )
  );
}

export default BusinessGallery;