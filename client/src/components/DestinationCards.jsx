// FILE: client/src/components/DestinationCards.jsx
// LOCATION: Entire file (FIXED - IMAGES FILL CONTAINER USING BACKGROUND)

import React from 'react';
import { Waves, Building2, MapPin } from 'lucide-react';

const brandIndigo = '#4F46E5';

function DestinationCards({ onSelectLocation }) {
  const destinations = [
    {
      id: 1,
      name: 'Victoria Island',
      description: 'Premium waterfront hotels',
      location: 'Lagos',
      image: 'https://images.trvl-media.com/place/6354406/13c35c69-561b-4b4d-ba95-30ca9cc3c660.jpg',
      icon: Waves,
      count: '12 hotels'
    },
    {
      id: 2,
      name: 'Lekki',
      description: 'Beachfront luxury stays',
      location: 'Lagos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Lekki_link_bridge.jpg/250px-Lekki_link_bridge.jpg',
      icon: Building2,
      count: '8 hotels'
    },
    {
      id: 3,
      name: 'Abuja City Center',
      description: 'Government & business hub',
      location: 'Abuja',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_K0jmrazArImRLbLdsyYStWcGE9LZEATg5Q&s',
      icon: MapPin,
      count: '6 hotels'
    },
    {
      id: 4,
      name: 'Wuse District',
      description: 'Upscale residential & commercial',
      location: 'Abuja',
      image: 'https://bashirademolayusuf.com/wp-content/uploads/2025/03/105491460_2738464876389431_248825997529255967_n-e1742199312172.jpg',
      icon: MapPin,
      count: '10 hotels'
    }
  ];

  // ========== STYLES ==========
  
  const containerStyle = {
    marginBottom: '48px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  };

  const titleStyle = {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a1a1a'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#888',
    marginTop: '4px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px'
  };

  // CARD STYLE - Fixed height container
  const cardStyle = {
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    height: '200px', // Fixed height
    background: '#f5f5f5'
  };

  // CRITICAL FIX: Image as background - this ALWAYS fills the container
  const imageBackgroundStyle = (imageUrl) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover', // ← FILLS THE CONTAINER
    backgroundPosition: 'center', // ← CENTERS THE IMAGE
    backgroundRepeat: 'no-repeat',
    zIndex: 0,
    transition: 'transform 0.3s ease'
  });

  // Dark overlay for text readability
  const imageOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    padding: '20px 16px 16px',
    zIndex: 2,
    color: 'white'
  };

  const nameStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '2px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  };

  const descriptionStyle = {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: '6px',
    textShadow: '0 1px 3px rgba(0,0,0,0.3)'
  };

  const countStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    background: 'rgba(255,255,255,0.2)',
    padding: '3px 10px',
    borderRadius: '100px',
    backdropFilter: 'blur(4px)'
  };

  const iconWrapperStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  };

  const viewAllStyle = {
    fontSize: '14px',
    color: brandIndigo,
    fontWeight: '500',
    cursor: 'pointer'
  };

  // ========== RENDER ==========
  return React.createElement('div', { style: containerStyle },
    // Header
    React.createElement('div', { style: headerStyle },
      React.createElement('div', null,
        React.createElement('h2', { style: titleStyle }, 'Explore Lagos & Abuja'),
        React.createElement('p', { style: subtitleStyle }, 'Discover the finest stays in Nigeria\'s premier cities')
      ),
      React.createElement('span', { 
        style: viewAllStyle,
        onMouseEnter: (e) => { e.currentTarget.style.color = '#4338CA'; },
        onMouseLeave: (e) => { e.currentTarget.style.color = brandIndigo; }
      }, 'View all →')
    ),

    // Grid
    React.createElement('div', { style: gridStyle },
      destinations.map((dest) => {
        const IconComponent = dest.icon;
        return React.createElement('div',
          {
            key: dest.id,
            style: cardStyle,
            onClick: () => onSelectLocation && onSelectLocation(dest.location),
            onMouseEnter: (e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${brandIndigo}25`;
              // Scale the image on hover
              const img = e.currentTarget.querySelector('.card-image');
              if (img) img.style.transform = 'scale(1.05)';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              const img = e.currentTarget.querySelector('.card-image');
              if (img) img.style.transform = 'scale(1)';
            }
          },
          // Image as background - FILLS THE CARD COMPLETELY
          React.createElement('div', { 
            className: 'card-image',
            style: imageBackgroundStyle(dest.image) 
          }),
          // Fallback image if background fails
          React.createElement('img', {
            src: dest.image,
            alt: dest.name,
            style: { display: 'none' },
            onError: (e) => {
              // If image fails, show fallback
              const parent = e.currentTarget.parentElement;
              const bgDiv = parent.querySelector('.card-image');
              if (bgDiv) {
                bgDiv.style.backgroundImage = 'url(https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop)';
              }
            }
          }),
          // Dark overlay for readability
          React.createElement('div', { style: imageOverlayStyle }),
          // Content - All text is white
          React.createElement('div', { style: contentStyle },
            React.createElement('h3', { style: nameStyle }, dest.name),
            React.createElement('p', { style: descriptionStyle },
              React.createElement('span', { style: iconWrapperStyle },
                React.createElement(IconComponent, { 
                  size: 12, 
                  style: { color: 'rgba(255,255,255,0.8)' } 
                }),
                ` ${dest.description}`
              )
            ),
            React.createElement('span', { style: countStyle },
              dest.count
            )
          )
        );
      })
    )
  );
}

export default DestinationCards;