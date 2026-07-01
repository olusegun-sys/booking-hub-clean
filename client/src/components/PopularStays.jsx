import React, { useState, useEffect } from 'react';
import { Star, Users, Bed, MapPin, TrendingUp, Heart, Eye } from 'lucide-react';

/**
 * PopularStays - Showcases featured hotels with ratings
 * Industry-standard design inspired by Expedia and Airbnb
 */
function PopularStays({ onSelectHotel }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Popular stays data - in production, this would come from API
  const popularStays = [
    {
      id: 'eko-hotel',
      name: 'Eko Hotel & Suites',
      location: 'Victoria Island, Lagos',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      rating: 4.8,
      reviews: 2340,
      price: 120000,
      description: 'Luxury beachfront resort with world-class amenities',
      features: ['Beachfront', 'Spa', 'Pool', '5 Restaurants'],
      popular: true
    },
    {
      id: 'transcorp-hilton',
      name: 'Transcorp Hilton Abuja',
      location: 'Maitama, Abuja',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      rating: 4.7,
      reviews: 1860,
      price: 95000,
      description: 'Iconic 5-star hotel in the heart of Abuja',
      features: ['Conference Center', 'Pool', 'Gym', '6 Restaurants'],
      popular: true
    },
    {
      id: 'the-guest-house',
      name: 'The Guest House Lagos',
      location: 'Lekki, Lagos',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      rating: 4.9,
      reviews: 1560,
      price: 35000,
      description: 'Boutique hotel with tropical garden and pool',
      features: ['Pool', 'Garden', 'Bar', 'Breakfast'],
      popular: false
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleClick = (hotel) => {
    if (onSelectHotel) {
      onSelectHotel(hotel);
    }
  };

  const containerStyle = {
    padding: isDesktop ? '40px 0' : '24px 0',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '0 16px',
    flexWrap: 'wrap',
    gap: '12px'
  };

  const titleStyle = {
    fontSize: isDesktop ? '28px' : '22px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const titleAccentStyle = {
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const subtitleStyle = {
    fontSize: isDesktop ? '16px' : '14px',
    color: '#64748b',
    fontWeight: '400'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
    gap: '20px',
    padding: '0 16px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9'
  };

  const imageWrapperStyle = {
    position: 'relative',
    height: isDesktop ? '220px' : '200px',
    overflow: 'hidden',
    background: '#f1f5f9'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const popularBadgeStyle = {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: 'white',
    padding: '4px 14px',
    borderRadius: '40px',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
  };

  const wishlistStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(255,255,255,0.9)',
    padding: '8px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  };

  const contentStyle = {
    padding: '16px 18px 18px'
  };

  const nameStyle = {
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 2px',
    letterSpacing: '-0.3px'
  };

  const locationStyle = {
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '8px'
  };

  const ratingStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  };

  const ratingValueStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a'
  };

  const reviewCountStyle = {
    fontSize: '12px',
    color: '#94a3b8'
  };

  const descriptionStyle = {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '10px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const featuresStyle = {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '12px'
  };

  const featureTagStyle = {
    padding: '2px 10px',
    borderRadius: '40px',
    fontSize: '10px',
    fontWeight: '500',
    background: '#f1f5f9',
    color: '#475569'
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px'
  };

  const priceStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: '-0.3px'
  };

  const priceLabelStyle = {
    fontSize: '11px',
    fontWeight: '400',
    color: '#94a3b8'
  };

  const viewButtonStyle = {
    padding: '6px 16px',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(79,70,229,0.2)'
  };

  return React.createElement('div', { style: containerStyle },
    // Header
    React.createElement('div', { style: headerStyle },
      React.createElement('div', null,
        React.createElement('h2', { style: titleStyle },
          React.createElement(TrendingUp, { size: isDesktop ? 24 : 20, color: '#4F46E5' }),
          React.createElement('span', null,
            'Popular ',
            React.createElement('span', { style: titleAccentStyle }, 'Stays')
          )
        ),
        React.createElement('p', { style: subtitleStyle }, 'Handpicked properties loved by travelers')
      ),
      React.createElement('button', {
        style: {
          padding: '8px 20px',
          background: 'transparent',
          border: '1px solid #e2e8f0',
          borderRadius: '40px',
          fontSize: '13px',
          fontWeight: '500',
          color: '#475569',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = '#4F46E5';
          e.currentTarget.style.color = '#4F46E5';
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.color = '#475569';
        }
      }, 'View All')
    ),

    // Popular Stays Grid
    React.createElement('div', { style: gridStyle },
      popularStays.map((hotel) => {
        return React.createElement('div', {
          key: hotel.id,
          style: cardStyle,
          onClick: () => handleClick(hotel),
          onMouseEnter: (e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)';
            const img = e.currentTarget.querySelector('img');
            if (img) img.style.transform = 'scale(1.05)';
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
            const img = e.currentTarget.querySelector('img');
            if (img) img.style.transform = 'scale(1)';
          }
        },
          // Image
          React.createElement('div', { style: imageWrapperStyle },
            React.createElement('img', {
              src: hotel.image,
              alt: hotel.name,
              style: imageStyle,
              onError: (e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';
              }
            }),
            // Popular Badge
            hotel.popular && React.createElement('div', { style: popularBadgeStyle },
              React.createElement(TrendingUp, { size: 10 }),
              'Popular'
            ),
            // Wishlist
            React.createElement('button', {
              style: wishlistStyle,
              onMouseEnter: (e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'scale(1.05)';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                e.currentTarget.style.transform = 'scale(1)';
              },
              onClick: (e) => {
                e.stopPropagation();
                // Wishlist functionality would go here
                alert('Added to wishlist!');
              }
            },
              React.createElement(Heart, { size: 16, color: '#94a3b8' })
            )
          ),
          // Content
          React.createElement('div', { style: contentStyle },
            React.createElement('h3', { style: nameStyle }, hotel.name),
            React.createElement('div', { style: locationStyle },
              React.createElement(MapPin, { size: 12 }),
              hotel.location
            ),
            React.createElement('div', { style: ratingStyle },
              React.createElement(Star, { size: 14, fill: '#F59E0B', color: '#F59E0B' }),
              React.createElement('span', { style: ratingValueStyle }, hotel.rating),
              React.createElement('span', { style: reviewCountStyle }, `(${hotel.reviews.toLocaleString()} reviews)`)
            ),
            React.createElement('p', { style: descriptionStyle }, hotel.description),
            React.createElement('div', { style: featuresStyle },
              hotel.features.slice(0, 3).map((feature, idx) =>
                React.createElement('span', { key: idx, style: featureTagStyle }, feature)
              )
            ),
            React.createElement('div', { style: footerStyle },
              React.createElement('div', null,
                React.createElement('span', { style: priceStyle }, formatPrice(hotel.price)),
                React.createElement('span', { style: priceLabelStyle }, ' / night')
              ),
              React.createElement('button', {
                style: viewButtonStyle,
                onMouseEnter: (e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.3)';
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.2)';
                }
              }, 'View')
            )
          )
        );
      })
    )
  );
}

export default PopularStays;