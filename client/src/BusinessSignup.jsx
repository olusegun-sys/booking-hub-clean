// FILE: client/src/BusinessSignup.jsx
// PROFESSIONAL REDESIGN - OCTOBER 2026
// Two-step flow: Account Setup → Location
// Removed domain step (moved to BusinessSettings)
// Full address input with Nigerian states dropdown
// Premium UI with glass-morphism, animations, and professional UX
// Fully responsive across all devices
// FIXED: Removed non-existent MapPinHouse icon, replaced with MapPin

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ChevronRight, ChevronLeft, Eye, EyeOff, 
  Loader, CheckCircle, Hotel, Dumbbell, CalendarDays,
  Building2, Sparkles, MapPin, Phone, Mail, Lock,
  User, Briefcase, Globe, Check, AlertCircle, X,
  Search
} from 'lucide-react';
import API_BASE from './config';

// ============================================================
// NIGERIAN STATES - Complete List (37 States + FCT)
// ============================================================
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// ============================================================
// BUSINESS TYPES
// ============================================================
const BUSINESS_TYPES = [
  { 
    id: 'hotel', 
    icon: Hotel, 
    label: 'Hotel', 
    desc: 'Rooms & Suites', 
    color: '#4f46e5', 
    bg: '#eef2ff',
    borderColor: '#4f46e5'
  },
  { 
    id: 'sports', 
    icon: Dumbbell, 
    label: 'Sports', 
    desc: 'Courts & Pitches', 
    color: '#059669', 
    bg: '#d1fae5',
    borderColor: '#059669'
  },
  { 
    id: 'event', 
    icon: CalendarDays, 
    label: 'Event', 
    desc: 'Venues & Halls', 
    color: '#d97706', 
    bg: '#fef3c7',
    borderColor: '#d97706'
  }
];

// ============================================================
// MAIN COMPONENT
// ============================================================
function BusinessSignup() {
  const navigate = useNavigate();
  
  // ============================================================
  // STATE
  // ============================================================
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [touchedFields, setTouchedFields] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  const stateInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // ============================================================
  // RESPONSIVE HANDLER
  // ============================================================
  useEffect(function() {
    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }
    window.addEventListener('resize', handleResize);
    return function() {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ============================================================
  // CLICK OUTSIDE HANDLER
  // ============================================================
  useEffect(function() {
    function handleClickOutside(e) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) &&
        stateInputRef.current &&
        !stateInputRef.current.contains(e.target)
      ) {
        setShowStateDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return function() {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ============================================================
  // FORM DATA
  // ============================================================
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'hotel',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  // ============================================================
  // FILTERED STATES
  // ============================================================
  const filteredStates = NIGERIAN_STATES.filter(function(s) {
    return s.toLowerCase().includes(stateSearch.toLowerCase());
  });

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  function updateField(field, value) {
    setFormData(function(prev) {
      var updated = {};
      for (var key in prev) { updated[key] = prev[key]; }
      updated[field] = value;
      return updated;
    });
  }

  function handleBlur(field) {
    setTouchedFields(function(prev) {
      var updated = {};
      for (var key in prev) { updated[key] = prev[key]; }
      updated[field] = true;
      return updated;
    });
  }

  function selectState(stateName) {
    updateField('state', stateName);
    setStateSearch(stateName);
    setShowStateDropdown(false);
    handleBlur('state');
  }

  // ============================================================
  // VALIDATION
  // ============================================================
  function validateStep1() {
    const errors = [];
    
    if (!formData.businessName || formData.businessName.trim().length < 2) {
      errors.push('Business name is required');
    }
    if (!formData.email || !formData.email.includes('@')) {
      errors.push('Valid email address is required');
    }
    if (!formData.password || formData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (!formData.phone || formData.phone.length < 10) {
      errors.push('Valid phone number is required');
    }
    
    if (errors.length > 0) {
      setError(errors[0]);
      return false;
    }
    return true;
  }

  function validateStep2() {
    const errors = [];
    
    if (!formData.address || formData.address.trim().length < 5) {
      errors.push('Full address is required');
    }
    if (!formData.city || formData.city.trim().length < 2) {
      errors.push('City is required');
    }
    if (!formData.state || formData.state.trim().length < 2) {
      errors.push('Please select your state');
    }
    
    if (errors.length > 0) {
      setError(errors[0]);
      return false;
    }
    return true;
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  function handleNext() {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  }
  
  function handleBack() {
    setError('');
    if (step > 1) setStep(step - 1);
  }

  // ============================================================
  // SUBMIT
  // ============================================================
  function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep2()) return;
    
    setLoading(true);
    setError('');
    
    // Remove customDomain from payload (step removed)
    const payload = {
      businessName: formData.businessName,
      businessType: formData.businessType,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state
    };
    
    fetch(API_BASE + '/api/businesses/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          setSuccessMsg('Account created successfully! Redirecting to login...');
          if (data.business) {
            localStorage.setItem('businessEmail', formData.email);
            localStorage.setItem('pendingBusiness', JSON.stringify(data.business));
          }
          setTimeout(function() {
            navigate('/login');
          }, 2500);
        } else {
          setError(data.error || 'Failed to create account');
        }
        setLoading(false);
      })
      .catch(function() {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      });
  }

  // ============================================================
  // GET STEP TITLE
  // ============================================================
  function getStepTitle() {
    if (step === 1) return 'Account Setup';
    return 'Business Location';
  }

  function getStepSubtitle() {
    if (step === 1) {
      return 'Set up in 3 minutes. First 50 bookings free.';
    }
    return 'Help guests find your business easily.';
  }

  function getStepIcon() {
    if (step === 1) return React.createElement(User, { size: 20, color: '#4f46e5' });
    // FIXED: Using MapPin instead of non-existent MapPinHouse
    return React.createElement(MapPin, { size: 20, color: '#4f46e5' });
  }

  // ============================================================
  // STYLES
  // ============================================================
  var inputBaseStyle = {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.75rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    background: 'white',
    color: '#0f172a',
    boxSizing: 'border-box'
  };

  var labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '0.375rem'
  };

  // ============================================================
  // RENDER
  // ============================================================
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      display: 'flex',
      flexDirection: 'column'
    }
  },
    // ============================================================
    // TOP NAVIGATION
    // ============================================================
    React.createElement('div', {
      style: {
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: isMobile ? '0 0.75rem' : '0 1.5rem'
      }
    },
      React.createElement('div', {
        style: {
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0.625rem 0' : '0.875rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      },
        // Logo
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0.5rem' : '0.75rem',
            cursor: 'pointer'
          },
          onClick: function() { navigate('/'); }
        },
          React.createElement('div', {
            style: {
              width: isMobile ? '32px' : '36px',
              height: isMobile ? '32px' : '36px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          },
            React.createElement(Building2, { size: isMobile ? 16 : 20, color: 'white' })
          ),
          React.createElement('span', {
            style: {
              fontSize: isMobile ? '0.875rem' : '1.125rem',
              fontWeight: '700',
              color: '#1e293b',
              letterSpacing: '-0.5px'
            }
          }, isMobile ? '' : 'Booking Hub')
        ),
        // Back Button
        React.createElement('button', {
          onClick: function() { navigate('/become-host'); },
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            padding: isMobile ? '0.375rem 0.5rem' : '0.5rem 0.75rem',
            borderRadius: '8px',
            transition: 'all 0.2s'
          },
          onMouseEnter: function(e) {
            e.currentTarget.style.background = '#f1f5f9';
            e.currentTarget.style.color = '#4f46e5';
          },
          onMouseLeave: function(e) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }
        },
          React.createElement(ArrowLeft, { size: isMobile ? 14 : 16 }),
          isMobile ? '' : 'Back'
        )
      )
    ),

    // ============================================================
    // MAIN CONTENT
    // ============================================================
    React.createElement('div', {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '1rem 0.75rem' : '2rem 1.5rem'
      }
    },
      React.createElement('div', {
        style: {
          width: '100%',
          maxWidth: '560px',
          animation: 'fadeInUp 0.5s ease',
          margin: isMobile ? '0' : '0 auto'
        }
      },
        // ============================================================
        // HEADER
        // ============================================================
        React.createElement('div', {
          style: {
            textAlign: 'center',
            marginBottom: isMobile ? '1.25rem' : '2rem'
          }
        },
          // Badge
          React.createElement('div', {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#eef2ff',
              padding: isMobile ? '0.25rem 0.75rem' : '0.375rem 0.875rem',
              borderRadius: '100px',
              marginBottom: isMobile ? '0.75rem' : '1rem'
            }
          },
            React.createElement(Sparkles, { size: isMobile ? 12 : 14, color: '#4f46e5' }),
            React.createElement('span', {
              style: {
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                fontWeight: '600',
                color: '#4f46e5',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }
            }, 'First 50 bookings free')
          ),
          // Title
          React.createElement('h1', {
            style: {
              fontSize: isMobile ? '1.25rem' : '1.75rem',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '0.25rem',
              letterSpacing: '-0.5px'
            }
          }, isMobile ? 'Join 200+ businesses' : 'Join 200+ Nigerian businesses'),
          React.createElement('p', {
            style: {
              color: '#64748b',
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }
          }, isMobile ? 'Grow your revenue with Booking Hub' : 'Already using Booking Hub to grow their revenue')
        ),

        // ============================================================
        // FORM CARD
        // ============================================================
        React.createElement('form', {
          onSubmit: function(e) {
            if (step === 2) {
              handleSubmit(e);
            } else {
              e.preventDefault();
              handleNext();
            }
          },
          style: {
            background: 'white',
            borderRadius: isMobile ? '16px' : '24px',
            padding: isMobile ? '1.25rem 1rem' : '2rem 2rem 1.75rem',
            boxShadow: '0 20px 60px -12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.05)'
          }
        },
          // ============================================================
          // STEP PROGRESS
          // ============================================================
          React.createElement('div', {
            style: {
              marginBottom: isMobile ? '1.25rem' : '1.75rem'
            }
          },
            // Step label
            React.createElement('div', {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }
            },
              React.createElement('div', {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  flexWrap: 'wrap'
                }
              },
                React.createElement('span', {
                  style: {
                    fontSize: isMobile ? '0.6rem' : '0.7rem',
                    fontWeight: '600',
                    color: '#4f46e5',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }
                }, 'Step ' + step + ' of 2'),
                React.createElement('span', {
                  style: {
                    fontSize: isMobile ? '0.5rem' : '0.6rem',
                    color: '#cbd5e1'
                  }
                }, '•'),
                React.createElement('span', {
                  style: {
                    fontSize: isMobile ? '0.6rem' : '0.7rem',
                    fontWeight: '500',
                    color: '#94a3b8'
                  }
                }, getStepTitle())
              ),
              React.createElement('span', {
                style: {
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  color: '#94a3b8'
                }
              }, step + '/2')
            ),
            // Progress bar
            React.createElement('div', {
              style: {
                height: '4px',
                background: '#e2e8f0',
                borderRadius: '2px',
                overflow: 'hidden'
              }
            },
              React.createElement('div', {
                style: {
                  width: (step / 2) * 100 + '%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
                  borderRadius: '2px',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }
              })
            )
          ),

          // ============================================================
          // STEP HEADER
          // ============================================================
          React.createElement('div', {
            style: {
              marginBottom: isMobile ? '1.25rem' : '1.75rem'
            }
          },
            React.createElement('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                marginBottom: '0.25rem'
              }
            },
              React.createElement('div', {
                style: {
                  width: isMobile ? '32px' : '36px',
                  height: isMobile ? '32px' : '36px',
                  background: '#eef2ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }
              }, getStepIcon()),
              React.createElement('h2', {
                style: {
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: 0
                }
              }, getStepTitle())
            ),
            React.createElement('p', {
              style: {
                color: '#64748b',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                margin: '0.25rem 0 0 2.75rem'
              }
            }, getStepSubtitle())
          ),

          // ============================================================
          // ERROR MESSAGE
          // ============================================================
          error && React.createElement('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: isMobile ? '0.625rem 0.875rem' : '0.75rem 1rem',
              marginBottom: isMobile ? '1rem' : '1.25rem',
              color: '#dc2626',
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }
          },
            React.createElement(AlertCircle, { size: isMobile ? 14 : 16 }),
            error
          ),

          // ============================================================
          // SUCCESS MESSAGE
          // ============================================================
          successMsg && React.createElement('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#d1fae5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              padding: isMobile ? '0.625rem 0.875rem' : '0.75rem 1rem',
              marginBottom: isMobile ? '1rem' : '1.25rem',
              color: '#065f46',
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }
          },
            React.createElement(CheckCircle, { size: isMobile ? 14 : 16 }),
            successMsg
          ),

          // ============================================================
          // STEP 1: ACCOUNT SETUP
          // ============================================================
          step === 1 && React.createElement('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.25rem'
            }
          },
            // Business Name
            React.createElement('div', null,
              React.createElement('label', { style: labelStyle },
                'Business Name',
                React.createElement('span', { style: { color: '#ef4444', marginLeft: '2px' } }, '*')
              ),
              React.createElement('div', {
                style: {
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }
              },
                React.createElement(Building2, {
                  size: isMobile ? 16 : 18,
                  color: focusedField === 'businessName' ? '#4f46e5' : '#94a3b8',
                  style: {
                    position: 'absolute',
                    left: '0.75rem',
                    transition: 'color 0.2s'
                  }
                }),
                React.createElement('input', {
                  type: 'text',
                  style: {
                    ...inputBaseStyle,
                    padding: isMobile ? '0.625rem 0.875rem 0.625rem 2.5rem' : '0.75rem 1rem 0.75rem 2.75rem',
                    border: '1.5px solid ' + (touchedFields.businessName && !formData.businessName ? '#ef4444' : focusedField === 'businessName' ? '#4f46e5' : '#e2e8f0'),
                    boxShadow: focusedField === 'businessName' ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem'
                  },
                  placeholder: 'e.g., Redhorn Events',
                  value: formData.businessName,
                  onFocus: function() { setFocusedField('businessName'); },
                  onBlur: function() { handleBlur('businessName'); setFocusedField(null); },
                  onChange: function(e) { updateField('businessName', e.target.value); }
                })
              ),
              touchedFields.businessName && !formData.businessName && React.createElement('span', {
                style: {
                  fontSize: '0.6rem',
                  color: '#ef4444',
                  marginTop: '0.25rem',
                  display: 'block'
                }
              }, 'Business name is required')
            ),

            // Business Type
            React.createElement('div', null,
              React.createElement('label', { style: labelStyle },
                'Business Type',
                React.createElement('span', { style: { color: '#ef4444', marginLeft: '2px' } }, '*')
              ),
              React.createElement('div', {
                style: {
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
                  gap: isMobile ? '0.5rem' : '0.625rem'
                }
              },
                BUSINESS_TYPES.map(function(bt) {
                  var Icon = bt.icon;
                  var isSelected = formData.businessType === bt.id;
                  return React.createElement('div', {
                    key: bt.id,
                    onClick: function() { updateField('businessType', bt.id); },
                    style: {
                      padding: isMobile ? '0.625rem 0.25rem' : '0.75rem 0.5rem',
                      background: isSelected ? bt.bg : 'white',
                      border: '2px solid ' + (isSelected ? bt.color : '#e2e8f0'),
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isSelected ? '0 4px 12px ' + bt.color + '25' : 'none'
                    },
                    onMouseEnter: function(e) {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.background = '#f8fafc';
                      }
                    },
                    onMouseLeave: function(e) {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = 'white';
                      }
                    }
                  },
                    React.createElement(Icon, {
                      size: isMobile ? 20 : 24,
                      color: bt.color,
                      style: { marginBottom: isMobile ? '0.25rem' : '0.375rem' }
                    }),
                    React.createElement('div', {
                      style: {
                        fontSize: isMobile ? '0.625rem' : '0.75rem',
                        fontWeight: isSelected ? '700' : '600',
                        color: isSelected ? bt.color : '#1e293b'
                      }
                    }, bt.label),
                    React.createElement('div', {
                      style: {
                        fontSize: isMobile ? '0.5rem' : '0.6rem',
                        color: '#94a3b8',
                        marginTop: '1px'
                      }
                    }, bt.desc)
                  );
                })
              )
            ),

            // Email
            React.createElement('div', null,
              React.createElement('label', { style: labelStyle },
                'Email Address',
                React.createElement('span', { style: { color: '#ef4444', marginLeft: '2px' } }, '*')
              ),
              React.createElement('div', {
                style: {
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }
              },
                React.createElement(Mail, {
                  size: isMobile ? 16 : 18,
                  color: focusedField === 'email' ? '#4f46e5' : '#94a3b8',
                  style: {
                    position: 'absolute',
                    left: '0.75rem',
                    transition: 'color 0.2s'
                  }
                }),
                React.createElement('input', {
                  type: 'email',
                  style: {
                    ...inputBaseStyle,
                    padding: isMobile ? '0.625rem 0.875rem 0.625rem 2.5rem' : '0.75rem 1rem 0.75rem 2.75rem',
                    border: '1.5px solid ' + (touchedFields.email && !formData.email ? '#ef4444' : focusedField === 'email' ? '#4f46e5' : '#e2e8f0'),
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem'
                  },
                  placeholder: 'you@yourbusiness.com',
                  value: formData.email,
                  onFocus: function() { setFocusedField('email'); },
                  onBlur: function() { handleBlur('email'); setFocusedField(null); },
                  onChange: function(e) { updateField('email', e.target.value); }
                })
              ),
              touchedFields.email && !formData.email && React.createElement('span', {
                style: {
                  fontSize: '0.6rem',
                  color: '#ef4444',
                  marginTop: '0.25rem',
                  display: 'block'
                }
              }, 'Valid email address is required')
            ),

            // Phone
            React.createElement('div', null,
              React.createElement('label', { style: labelStyle },
                'Phone Number',
                React.createElement('span', { style: { color: '#ef4444', marginLeft: '2px' } }, '*')
              ),
              React.createElement('div', {
                style: {
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }
              },
                React.createElement(Phone, {
                  size: isMobile ? 16 : 18,
                  color: focusedField === 'phone' ? '#4f46e5' : '#94a3b8',
                  style: {
                    position: 'absolute',
                    left: '0.75rem',
                    transition: 'color 0.2s'
                  }
                }),
                React.createElement('input', {
                  type: 'tel',
                  style: {
                    ...inputBaseStyle,
                    padding: isMobile ? '0.625rem 0.875rem 0.625rem 2.5rem' : '0.75rem 1rem 0.75rem 2.75rem',
                    border: '1.5px solid ' + (touchedFields.phone && !formData.phone ? '#ef4444' : focusedField === 'phone' ? '#4f46e5' : '#e2e8f0'),
                    boxShadow: focusedField === 'phone' ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem'
                  },
                  placeholder: '08012345678',
                  value: formData.phone,
                  onFocus: function() { setFocusedField('phone'); },
                  onBlur: function() { handleBlur('phone'); setFocusedField(null); },
                  onChange: function(e) { updateField('phone', e.target.value); }
                })
              ),
              touchedFields.phone && !formData.phone && React.createElement('span', {
                style: {
                  fontSize: '0.6rem',
                  color: '#ef4444',
                  marginTop: '0.25rem',
                  display: 'block'
                }
              }, 'Valid phone number is required')
            ),

            // Password
            React.createElement('div', null,
              React.createElement('label', { style: labelStyle },
                'Password',
                React.createElement('span', { style: { color: '#ef4444', marginLeft: '2px' } }, '*')
              ),
              React.createElement('div', {
                style: {
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }
              },
                React.createElement(Lock, {
                  size: isMobile ? 16 : 18,
                  color: focusedField === 'password' ? '#4f46e5' : '#94a3b8',
                  style: {
                    position: 'absolute',
                    left: '0.75rem',
                    transition: 'color 0.2s'
                  }
                }),
                React.createElement('input', {
                  type: showPassword ? 'text' : 'password',
                  style: {
                    ...inputBaseStyle,
                    padding: isMobile ? '0.625rem 2.75rem 0.625rem 2.5rem' : '0.75rem 3rem 0.75rem 2.75rem',
                    border: '1.5px solid ' + (touchedFields.password && formData.password.length > 0 && formData.password.length < 6 ? '#ef4444' : focusedField === 'password' ? '#4f46e5' : '#e2e8f0'),
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem'
                  },
                  placeholder: 'Minimum 6 characters',
                  value: formData.password,
                  onFocus: function() { setFocusedField('password'); },
                  onBlur: function() { handleBlur('password'); setFocusedField(null); },
                  onChange: function(e) { updateField('password', e.target.value); }
                }),
                React.createElement('button', {
                  type: 'button',
                  onClick: function() { setShowPassword(!showPassword); },
                  style: {
                    position: 'absolute',
                    right: '0.625rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    transition: 'background 0.2s'
                  },
                  onMouseEnter: function(e) {
                    e.currentTarget.style.background = '#f1f5f9';
                  },
                  onMouseLeave: function(e) {
                    e.currentTarget.style.background = 'transparent';
                  }
                },
                  showPassword ? React.createElement(EyeOff, { size: isMobile ? 16 : 18 }) : React.createElement(Eye, { size: isMobile ? 16 : 18 })
                )
              ),
              formData.password.length > 0 && formData.password.length < 6 && React.createElement('span', {
                style: {
                  fontSize: '0.6rem',
                  color: '#ef4444',
                  marginTop: '0.25rem',
                  display: 'block'
                }
              }, 'Password must be at least 6 characters'),
              formData.password.length >= 6 && React.createElement('span', {
                style: {
                  fontSize: '0.6rem',
                  color: '#10b981',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }
              },
                React.createElement(Check, { size: 12 }),
                'Password is valid'
              )
            )
          ),

          // ============================================================
          // STEP 2: LOCATION
          // ============================================================
          step === 2 && React.createElement('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.25rem'
            }
          },
            // Full Address
            React.createElement('div', null,
              React.createElement('label', { style: labelStyle },
                'Full Address',
                React.createElement('span', { style: { color: '#ef4444', marginLeft: '2px' } }, '*')
              ),
              React.createElement('div', {
                style: {
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }
              },
                React.createElement(MapPin, {
                  size: isMobile ? 16 : 18,
                  color: focusedField === 'address' ? '#4f46e5' : '#94a3b8',
                  style: {
                    position: 'absolute',
                    left: '0.75rem',
                    transition: 'color 0.2s'
                  }
                }),
                React.createElement('input', {
                  type: 'text',
                  style: {
                    ...inputBaseStyle,
                    padding: isMobile ? '0.625rem 0.875rem 0.625rem 2.5rem' : '0.75rem 1rem 0.75rem 2.75rem',
                    border: '1.5px solid ' + (touchedFields.address && !formData.address ? '#ef4444' : focusedField === 'address' ? '#4f46e5' : '#e2e8f0'),
                    boxShadow: focusedField === 'address' ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem'
                  },
                  placeholder: 'e.g., 7 Obasa Road, Ikeja',
                  value: formData.address,
                  onFocus: function() { setFocusedField('address'); },
                  onBlur: function() { handleBlur('address'); setFocusedField(null); },
                  onChange: function(e) { updateField('address', e.target.value); }
                })
              ),
              touchedFields.address && !formData.address && React.createElement('span', {
                style: {
                  fontSize: '0.6rem',
                  color: '#ef4444',
                  marginTop: '0.25rem',
                  display: 'block'
                }
              }, 'Full address is required')
            ),

            // City
            React.createElement('div', null,
              React.createElement('label', { style: labelStyle },
                'City',
                React.createElement('span', { style: { color: '#ef4444', marginLeft: '2px' } }, '*')
              ),
              React.createElement('div', {
                style: {
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }
              },
                React.createElement(Globe, {
                  size: isMobile ? 16 : 18,
                  color: focusedField === 'city' ? '#4f46e5' : '#94a3b8',
                  style: {
                    position: 'absolute',
                    left: '0.75rem',
                    transition: 'color 0.2s'
                  }
                }),
                React.createElement('input', {
                  type: 'text',
                  style: {
                    ...inputBaseStyle,
                    padding: isMobile ? '0.625rem 0.875rem 0.625rem 2.5rem' : '0.75rem 1rem 0.75rem 2.75rem',
                    border: '1.5px solid ' + (touchedFields.city && !formData.city ? '#ef4444' : focusedField === 'city' ? '#4f46e5' : '#e2e8f0'),
                    boxShadow: focusedField === 'city' ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem'
                  },
                  placeholder: 'e.g., Surulere',
                  value: formData.city,
                  onFocus: function() { setFocusedField('city'); },
                  onBlur: function() { handleBlur('city'); setFocusedField(null); },
                  onChange: function(e) { updateField('city', e.target.value); }
                })
              ),
              touchedFields.city && !formData.city && React.createElement('span', {
                style: {
                  fontSize: '0.6rem',
                  color: '#ef4444',
                  marginTop: '0.25rem',
                  display: 'block'
                }
              }, 'City is required')
            ),

            // State - Searchable Dropdown
            React.createElement('div', {
              style: {
                position: 'relative'
              }
            },
              React.createElement('label', { style: labelStyle },
                'State',
                React.createElement('span', { style: { color: '#ef4444', marginLeft: '2px' } }, '*')
              ),
              React.createElement('div', {
                ref: stateInputRef,
                style: {
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }
              },
                React.createElement(MapPin, {
                  size: isMobile ? 16 : 18,
                  color: focusedField === 'state' ? '#4f46e5' : '#94a3b8',
                  style: {
                    position: 'absolute',
                    left: '0.75rem',
                    transition: 'color 0.2s'
                  }
                }),
                React.createElement('input', {
                  type: 'text',
                  style: {
                    ...inputBaseStyle,
                    padding: isMobile ? '0.625rem 2.5rem 0.625rem 2.5rem' : '0.75rem 2.75rem 0.75rem 2.75rem',
                    border: '1.5px solid ' + (touchedFields.state && !formData.state ? '#ef4444' : focusedField === 'state' ? '#4f46e5' : '#e2e8f0'),
                    boxShadow: focusedField === 'state' ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    cursor: 'pointer'
                  },
                  placeholder: 'Search or select state...',
                  value: stateSearch || formData.state,
                  onFocus: function() {
                    setFocusedField('state');
                    setShowStateDropdown(true);
                  },
                  onBlur: function() {
                    handleBlur('state');
                    setFocusedField(null);
                  },
                  onChange: function(e) {
                    setStateSearch(e.target.value);
                    updateField('state', '');
                    setShowStateDropdown(true);
                  }
                }),
                React.createElement(Search, {
                  size: isMobile ? 14 : 16,
                  color: '#94a3b8',
                  style: {
                    position: 'absolute',
                    right: '0.75rem',
                    pointerEvents: 'none'
                  }
                })
              ),
              // Dropdown
              showStateDropdown && React.createElement('div', {
                ref: dropdownRef,
                style: {
                  position: 'absolute',
                  zIndex: 20,
                  marginTop: '4px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  maxHeight: isMobile ? '160px' : '220px',
                  overflowY: 'auto',
                  width: '100%',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  animation: 'fadeIn 0.2s ease'
                }
              },
                filteredStates.length > 0
                  ? filteredStates.map(function(s) {
                      var isSelected = formData.state === s;
                      return React.createElement('div', {
                        key: s,
                        onClick: function() { selectState(s); },
                        style: {
                          padding: isMobile ? '0.5rem 0.875rem' : '0.625rem 1rem',
                          cursor: 'pointer',
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          background: isSelected ? '#eef2ff' : 'transparent',
                          color: isSelected ? '#4f46e5' : '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.15s'
                        },
                        onMouseEnter: function(e) {
                          if (!isSelected) {
                            e.currentTarget.style.background = '#f8fafc';
                          }
                        },
                        onMouseLeave: function(e) {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }
                      },
                        s,
                        isSelected && React.createElement(Check, { size: isMobile ? 12 : 14, color: '#4f46e5' })
                      );
                    })
                  : React.createElement('div', {
                      style: {
                        padding: isMobile ? '0.75rem' : '1rem',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }
                    }, 'No state found')
              ),
              touchedFields.state && !formData.state && React.createElement('span', {
                style: {
                  fontSize: '0.6rem',
                  color: '#ef4444',
                  marginTop: '0.25rem',
                  display: 'block'
                }
              }, 'Please select your state')
            )
          ),

          // ============================================================
          // NAVIGATION BUTTONS
          // ============================================================
          React.createElement('div', {
            style: {
              display: 'flex',
              justifyContent: step > 1 ? 'space-between' : 'flex-end',
              marginTop: isMobile ? '1.5rem' : '2rem',
              paddingTop: isMobile ? '1rem' : '1.5rem',
              borderTop: '1px solid #e2e8f0',
              gap: step > 1 ? '0.5rem' : '0',
              flexDirection: isMobile && step > 1 ? 'column-reverse' : 'row'
            }
          },
            step > 1 && React.createElement('button', {
              type: 'button',
              onClick: handleBack,
              style: {
                padding: isMobile ? '0.5rem 1rem' : '0.625rem 1.5rem',
                background: 'white',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                transition: 'all 0.2s',
                flex: isMobile ? '1' : 'auto'
              },
              onMouseEnter: function(e) {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.color = '#4f46e5';
              },
              onMouseLeave: function(e) {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }
            },
              React.createElement(ChevronLeft, { size: isMobile ? 14 : 16 }),
              'Back'
            ),
            step === 1
              ? React.createElement('button', {
                  type: 'button',
                  onClick: handleNext,
                  style: {
                    padding: isMobile ? '0.5rem 1.25rem' : '0.625rem 1.5rem',
                    background: '#4f46e5',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                    flex: isMobile ? '1' : 'auto'
                  },
                  onMouseEnter: function(e) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.35)';
                  },
                  onMouseLeave: function(e) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.3)';
                  }
                },
                  'Continue',
                  React.createElement(ChevronRight, { size: isMobile ? 14 : 16 })
                )
              : React.createElement('button', {
                  type: 'submit',
                  disabled: loading,
                  style: {
                    padding: isMobile ? '0.5rem 1.25rem' : '0.625rem 1.5rem',
                    background: loading ? '#94a3b8' : '#10b981',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.2s',
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(16,185,129,0.3)',
                    opacity: loading ? 0.7 : 1,
                    flex: isMobile ? '1' : 'auto'
                  },
                  onMouseEnter: function(e) {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.35)';
                    }
                  },
                  onMouseLeave: function(e) {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)';
                    }
                  }
                },
                  loading
                    ? React.createElement(React.Fragment, null,
                        React.createElement(Loader, { size: isMobile ? 14 : 16, style: { animation: 'spin 1s linear infinite' } }),
                        isMobile ? 'Creating...' : 'Creating Account...'
                      )
                    : React.createElement(React.Fragment, null,
                        React.createElement(Check, { size: isMobile ? 14 : 16 }),
                        isMobile ? 'Complete' : 'Complete Registration'
                      )
                )
          )
        )
      )
    )
  );
}

export default BusinessSignup;