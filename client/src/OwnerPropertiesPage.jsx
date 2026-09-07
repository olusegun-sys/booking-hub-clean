 
// FILE: client/src/OwnerPropertiesPage.jsx
// Shows all properties from a single business owner

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// ============================================================
// ICON IMPORTS
// ============================================================
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Building,
  Building2,
  Home,
  Bed,
  Users,
  Calendar,
  Award,
  Eye,
  Tag,
  ChevronRight,
  Loader,
  AlertCircle,
  Image,
  Grid3x3,
  Layers,
  Compass,
  Star,
  Clock,
  DollarSign,
  Filter,
  Search,
  X
} from 'lucide-react';

// ============================================================
// API HELPER
// ============================================================
const API_BASE = import.meta.env.VITE_API_BASE || 'https://booking-backend-clean.onrender.com';

async function fetchAPI(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Something went wrong');
  }
  return response.json();
}

// ============================================================
// HELPERS
// ============================================================
function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffDays < 7) return diffDays + ' days ago';
  if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago';
  if (diffDays < 365) return Math.floor(diffDays / 30) + ' months ago';
  return Math.floor(diffDays / 365) + ' years ago';
}

// ============================================================
// MAIN COMPONENT
// ============================================================
function OwnerPropertiesPage() {
  const params = useParams();
  const navigate = useNavigate();
  const businessId = params.businessId;

  // ============================================================
  // STATE
  // ============================================================
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [areas, setAreas] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    forRent: 0,
    forSale: 0,
    shortLet: 0
  });

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    if (!businessId) {
      toast.error('No business specified');
      setLoading(false);
      return;
    }
    fetchAllData();
  }, [businessId]);

  async function fetchAllData() {
    setLoading(true);
    try {
      // 1. Get business profile
      const businessRes = await fetchAPI(`/api/businesses/${businessId}`);
      if (!businessRes.success || !businessRes.business) {
        toast.error('Business not found');
        setLoading(false);
        return;
      }
      const biz = businessRes.business;
      setBusiness(biz);

      // 2. Get all rooms/properties for this business
      const roomsRes = await fetchAPI(`/api/businesses/${businessId}/rooms`);
      if (roomsRes.success) {
        const rooms = roomsRes.rooms || [];
        setProperties(rooms);
        setFilteredProperties(rooms);

        // Calculate stats
        const forRent = rooms.filter(r => r.listing_status === 'for_rent' || !r.listing_status).length;
        const forSale = rooms.filter(r => r.listing_status === 'for_sale').length;
        const shortLet = rooms.filter(r => r.listing_status === 'short_let').length;

        setStats({
          total: rooms.length,
          forRent: forRent,
          forSale: forSale,
          shortLet: shortLet
        });

        // Get unique areas
        const uniqueAreas = [...new Set(rooms.map(r => r.address || '').filter(Boolean))];
        setAreas(uniqueAreas);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // FILTER HANDLERS
  // ============================================================
  function handleFilter(filter) {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(p => {
        const status = p.listing_status || 'for_rent';
        if (filter === 'for_rent') return status === 'for_rent';
        if (filter === 'for_sale') return status === 'for_sale';
        if (filter === 'short_let') return status === 'short_let';
        return true;
      });
      setFilteredProperties(filtered);
    }
  }

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f8fafc'
        }
      },
      React.createElement(
        'div',
        { className: 'loading-spinner' },
        React.createElement(Loader, { size: 40, className: 'animate-spin', color: '#4F46E5' }),
        React.createElement('p', { style: { marginTop: '16px', color: '#64748B' } }, 'Loading properties...')
      )
    );
  }

  if (!business) {
    return React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          backgroundColor: '#f8fafc'
        }
      },
      React.createElement(AlertCircle, { size: 48, color: '#EF4444' }),
      React.createElement('h2', { style: { marginTop: '16px', color: '#1A1F36' } }, 'Business Not Found'),
      React.createElement('p', { style: { color: '#64748B' } }, 'The business you\'re looking for doesn\'t exist.'),
      React.createElement(
        'button',
        {
          onClick: () => navigate('/'),
          style: {
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }
        },
        'Go Home'
      )
    );
  }

  // ============================================================
  // RENDER: MAIN
  // ============================================================
  const isMobile = window.innerWidth < 640;
  const filterLabels = {
    all: `All (${stats.total})`,
    for_rent: `For rent (${stats.forRent})`,
    for_sale: `For sale (${stats.forSale})`,
    short_let: `Short let (${stats.shortLet})`
  };

  return React.createElement(
    'div',
    {
      style: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }
    },
    // BACK BUTTON
    React.createElement(
      'div',
      {
        style: {
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(226,232,240,0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }
      },
      React.createElement(
        'button',
        {
          onClick: () => navigate(-1),
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            color: '#4F46E5',
            fontSize: '14px',
            fontWeight: '500'
          }
        },
        React.createElement(ArrowLeft, { size: 20 }),
        React.createElement('span', { style: { display: isMobile ? 'none' : 'inline' } }, 'Back')
      ),
      React.createElement(
        'span',
        {
          style: {
            fontSize: '14px',
            color: '#64748B',
            fontWeight: '400',
            flex: 1,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }
        },
        business.name
      )
    ),
    // MAIN CONTENT
    React.createElement(
      'div',
      {
        style: {
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 16px 40px',
          width: '100%'
        }
      },
      // BUSINESS INFO CARD
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(226,232,240,0.6)'
          }
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '16px',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: '16px'
            }
          },
          React.createElement(
            'div',
            {
              style: {
                width: '72px',
                height: '72px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                flexShrink: 0,
                border: '1px solid #e2e8f0'
              }
            },
            business.logo_url
              ? React.createElement('img', {
                  src: business.logo_url,
                  alt: business.name,
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }
                })
              : React.createElement(
                  'div',
                  {
                    style: {
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4F46E5',
                      fontSize: '28px',
                      fontWeight: '700'
                    }
                  },
                  business.name.charAt(0).toUpperCase()
                )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'h1',
              {
                style: {
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: '700',
                  color: '#1A1F36',
                  margin: '0 0 4px 0'
                }
              },
              business.name
            ),
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#64748B',
                  flexWrap: 'wrap'
                }
              },
              React.createElement(MapPin, { size: 16, color: '#94a3b8' }),
              business.address || business.city || 'Address not specified'
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '13px',
                  color: '#94a3b8',
                  marginTop: '4px'
                }
              },
              'Member since ' + formatDate(business.created_at)
            )
          )
        ),
        // Stats row
        React.createElement(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }
          },
          React.createElement(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }
            },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: '700',
                  color: '#1A1F36'
                }
              },
              stats.total
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '12px',
                  color: '#94a3b8'
                }
              },
              'Active'
            )
          ),
          React.createElement(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }
            },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: '700',
                  color: '#10B981'
                }
              },
              stats.forRent
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '12px',
                  color: '#94a3b8'
                }
              },
              'For rent'
            )
          ),
          React.createElement(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }
            },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: '700',
                  color: '#F59E0B'
                }
              },
              stats.forSale
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '12px',
                  color: '#94a3b8'
                }
              },
              'For sale'
            )
          ),
          React.createElement(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }
            },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: '700',
                  color: '#8B5CF6'
                }
              },
              areas.length
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '12px',
                  color: '#94a3b8'
                }
              },
              'Areas'
            )
          )
        )
      ),
      // AREAS COVERED
      areas.length > 0 &&
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid rgba(226,232,240,0.6)'
            }
          },
          React.createElement(
            'h2',
            {
              style: {
                fontSize: '14px',
                fontWeight: '600',
                color: '#1A1F36',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            },
            React.createElement(Compass, { size: 16, color: '#4F46E5' }),
            'Areas covered'
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }
            },
            areas.map((area, idx) =>
              React.createElement(
                'span',
                {
                  key: idx,
                  style: {
                    backgroundColor: '#f1f5f9',
                    padding: '4px 14px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    color: '#475569'
                  }
                },
                area
              )
            )
          )
        ),
      // FILTER TABS
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '16px',
            borderBottom: '1px solid #f1f5f9'
          }
        },
        Object.entries(filterLabels).map(([key, label]) =>
          React.createElement(
            'button',
            {
              key: key,
              onClick: () => handleFilter(key),
              style: {
                padding: '8px 16px',
                backgroundColor: activeFilter === key ? '#4F46E5' : 'transparent',
                color: activeFilter === key ? 'white' : '#64748B',
                border: activeFilter === key ? 'none' : '1px solid #e2e8f0',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: activeFilter === key ? '600' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }
            },
            label
          )
        )
      ),
      // PROPERTY LISTINGS
      filteredProperties.length === 0
        ? React.createElement(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                color: '#94a3b8'
              }
            },
            React.createElement(Home, { size: 48, color: '#cbd5e1' }),
            React.createElement('p', { style: { marginTop: '12px', fontSize: '16px' } }, 'No properties found')
          )
        : React.createElement(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : window.innerWidth < 768 ? '1fr 1fr' : '1fr 1fr 1fr',
                gap: '16px'
              }
            },
            filteredProperties.map((property) =>
              React.createElement(
                Link,
                {
                  key: property.id,
                  to: `/book/${business.slug}`,
                  style: {
                    textDecoration: 'none',
                    color: 'inherit'
                  }
                },
                React.createElement(
                  'div',
                  {
                    style: {
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(226,232,240,0.6)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                    }
                  },
                  // Image
                  React.createElement(
                    'div',
                    {
                      style: {
                        position: 'relative',
                        height: '180px',
                        backgroundColor: '#e2e8f0',
                        overflow: 'hidden'
                      }
                    },
                    property.images && property.images.length > 0
                      ? React.createElement('img', {
                          src: property.images[0],
                          alt: property.name,
                          style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }
                        })
                      : React.createElement(
                          'div',
                          {
                            style: {
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8'
                            }
                          },
                          React.createElement(Image, { size: 40 })
                        ),
                    // Premium badge
                    React.createElement(
                      'span',
                      {
                        style: {
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          backgroundColor: '#4F46E5',
                          color: 'white',
                          padding: '2px 12px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }
                      },
                      'Premium'
                    ),
                    // Listing status badge
                    React.createElement(
                      'span',
                      {
                        style: {
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '2px 12px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }
                      },
                      (property.listing_status || 'For rent').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                    )
                  ),
                  // Content
                  React.createElement(
                    'div',
                    { style: { padding: '14px' } },
                    React.createElement(
                      'h3',
                      {
                        style: {
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1A1F36',
                          margin: '0 0 4px 0'
                        }
                      },
                      property.name
                    ),
                    property.address &&
                      React.createElement(
                        'div',
                        {
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginBottom: '4px'
                          }
                        },
                        React.createElement(MapPin, { size: 12 }),
                        property.address
                      ),
                    React.createElement(
                      'div',
                      {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '12px',
                          color: '#64748B'
                        }
                      },
                      React.createElement(
                        'span',
                        { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                        React.createElement(Users, { size: 12 }),
                        property.capacity || 0 + ' guests'
                      ),
                      React.createElement(
                        'span',
                        { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                        React.createElement(Eye, { size: 12 }),
                        '0 views'
                      )
                    ),
                    React.createElement(
                      'div',
                      {
                        style: {
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }
                      },
                      React.createElement(
                        'span',
                        {
                          style: {
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#4F46E5'
                          }
                        },
                        formatCurrency(property.price_per_night || 0)
                      ),
                      React.createElement(
                        'span',
                        {
                          style: {
                            fontSize: '12px',
                            color: '#94a3b8'
                          }
                        },
                        'per day'
                      )
                    )
                  )
                )
              )
            )
          )
    )
  );
}

export default OwnerPropertiesPage;