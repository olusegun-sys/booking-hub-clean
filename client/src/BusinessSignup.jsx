import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ChevronRight, ChevronLeft, Eye, EyeOff, 
  Loader, CheckCircle, Hotel, Dumbbell, CalendarDays,
  Building2, Sparkles
} from 'lucide-react';
import API_BASE from './config';

var nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

function BusinessSignup() {
  var navigate = useNavigate();
  var _useState = React.useState(1);
  var step = _useState[0];
  var setStep = _useState[1];
  var _useState2 = React.useState(false);
  var loading = _useState2[0];
  var setLoading = _useState2[1];
  var _useState3 = React.useState('');
  var error = _useState3[0];
  var setError = _useState3[1];
  var _useState4 = React.useState('');
  var successMsg = _useState4[0];
  var setSuccessMsg = _useState4[1];
  var _useState5 = React.useState(false);
  var showPassword = _useState5[0];
  var setShowPassword = _useState5[1];
  var _useState6 = React.useState('');
  var stateSearch = _useState6[0];
  var setStateSearch = _useState6[1];
  var _useState7 = React.useState(false);
  var showStateDropdown = _useState7[0];
  var setShowStateDropdown = _useState7[1];

  var _useState8 = React.useState({
    businessName: '',
    businessType: 'hotel',
    email: '',
    password: '',
    phone: '',
    city: '',
    state: '',
    customDomain: ''
  });
  var formData = _useState8[0];
  var setFormData = _useState8[1];

  var filteredStates = nigerianStates.filter(function (s) {
    return s.toLowerCase().includes(stateSearch.toLowerCase());
  });

  function updateField(field, value) {
    setFormData(function (prev) {
      var updated = {};
      for (var key in prev) { updated[key] = prev[key]; }
      updated[field] = value;
      return updated;
    });
  }

  function selectState(stateName) {
    updateField('state', stateName);
    setStateSearch(stateName);
    setShowStateDropdown(false);
  }

  function validateStep1() {
    if (!formData.businessName || formData.businessName.trim().length < 2) { setError('Business name is required'); return false; }
    if (!formData.email || !formData.email.includes('@')) { setError('Please enter a valid email address'); return false; }
    if (!formData.password || formData.password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (!formData.phone || formData.phone.length < 10) { setError('Please enter a valid phone number'); return false; }
    return true;
  }

  function validateStep2() {
    if (!formData.city || formData.city.trim().length < 2) { setError('City is required'); return false; }
    if (!formData.state || formData.state.trim().length < 2) { setError('Please select your state'); return false; }
    return true;
  }

  function handleNext() { 
    setError(''); 
    if (step === 1 && validateStep1()) setStep(2); 
    else if (step === 2 && validateStep2()) setStep(3); 
  }
  
  function handleBack() { 
    setError(''); 
    if (step > 1) setStep(step - 1); 
  }

  function handleSubmit() {
    setLoading(true); 
    setError('');
    
    fetch(API_BASE + '/api/businesses/register', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(formData)
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (data.success) {
        setSuccessMsg('Account created! Redirecting to login...');
        if (data.business) {
          localStorage.setItem('businessEmail', formData.email);
          localStorage.setItem('pendingBusiness', JSON.stringify(data.business));
        }
        setTimeout(function () {
          navigate('/login');
        }, 2500);
      } else {
        setError(data.error || 'Failed to create account');
      }
      setLoading(false);
    }).catch(function () { 
      setError('Something went wrong. Please try again.'); 
      setLoading(false); 
    });
  }

  var businessTypes = [
    { id: 'hotel', icon: Hotel, label: 'Hotel', desc: 'Rooms & suites', color: '#4f46e5', bg: '#eef2ff' },
    { id: 'sports', icon: Dumbbell, label: 'Sports', desc: 'Courts & pitches', color: '#059669', bg: '#d1fae5' },
    { id: 'event', icon: CalendarDays, label: 'Event', desc: 'Venues & halls', color: '#d97706', bg: '#fef3c7' }
  ];

  return React.createElement('div', { style: { minHeight: '100vh', background: '#f1f5f9' } },
    
    // Top Navigation
    React.createElement('div', { style: { background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' } },
          React.createElement(Building2, { size: 24, color: '#4f46e5' }),
          React.createElement('span', { style: { fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' } }, 'Booking Hub')
        ),
        React.createElement('button', { 
          onClick: function() { navigate('/become-host'); }, 
          style: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' } 
        }, React.createElement(ArrowLeft, { size: 16 }), 'Back')
      )
    ),

    // Main Content - Centered Card
    React.createElement('div', { style: { maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' } },
      
      // Header
      React.createElement('div', { style: { textAlign: 'center', marginBottom: '2rem' } },
        React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#eef2ff', padding: '0.375rem 0.75rem', borderRadius: '100px', marginBottom: '1rem' } },
          React.createElement(Sparkles, { size: 12, color: '#4f46e5' }),
          React.createElement('span', { style: { fontSize: '0.7rem', fontWeight: '500', color: '#4f46e5' } }, 'First 50 bookings free')
        ),
        React.createElement('h1', { style: { fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' } }, 'Join 200+ Nigerian businesses'),
        React.createElement('p', { style: { color: '#64748b', fontSize: '0.875rem' } }, 'Already using Booking Hub to grow their revenue')
      ),

      // Form Card
      React.createElement('div', { 
        style: { 
          background: 'white', 
          borderRadius: '24px', 
          padding: '2rem',
          boxShadow: '0 20px 35px -10px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)'
        }
      },
        
        // Step Progress
        React.createElement('div', { style: { marginBottom: '2rem' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' } },
            React.createElement('span', { style: { fontSize: '0.75rem', fontWeight: '600', color: '#4f46e5' } }, 'Step ' + step + ' of 3'),
            React.createElement('span', { style: { fontSize: '0.75rem', color: '#94a3b8' } }, 
              step === 1 ? 'Account Setup' : step === 2 ? 'Location' : 'Domain'
            )
          ),
          React.createElement('div', { style: { height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' } },
            React.createElement('div', { style: { width: (step / 3) * 100 + '%', height: '100%', background: '#4f46e5', borderRadius: '2px', transition: 'width 0.3s' } })
          )
        ),

        // Title
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' } },
          step === 1 ? 'Create your account' : step === 2 ? 'Where are you located?' : 'Your booking URL'
        ),
        React.createElement('p', { style: { color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' } },
          step === 1 ? 'Set up in 3 minutes. First 50 bookings free.' : 
          step === 2 ? 'Help guests find you easily.' : 
          'Choose your custom web address.'
        ),

        // Messages
        error && React.createElement('div', { style: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem' } }, error),
        successMsg && React.createElement('div', { style: { background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontSize: '0.875rem' } },
          React.createElement(CheckCircle, { size: 16 }), successMsg
        ),

        // Step 1
        step === 1 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.25rem' } },
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'Business Name', React.createElement('span', { style: { color: '#ef4444' } }, '*')),
            React.createElement('input', { 
              type: 'text', 
              style: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.875rem', outline: 'none' },
              placeholder: 'e.g., Rangers Club', 
              value: formData.businessName, 
              onChange: function (e) { updateField('businessName', e.target.value); } 
            })
          ),
          
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' } }, 'Business Type', React.createElement('span', { style: { color: '#ef4444' } }, '*')),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' } },
              businessTypes.map(function (bt) {
                var Icon = bt.icon;
                var isSelected = formData.businessType === bt.id;
                return React.createElement('div', {
                  key: bt.id,
                  onClick: function () { updateField('businessType', bt.id); },
                  style: { 
                    padding: '0.75rem', 
                    background: isSelected ? bt.bg : 'white', 
                    border: '1.5px solid ' + (isSelected ? bt.color : '#e2e8f0'),
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    textAlign: 'center'
                  }
                },
                  React.createElement(Icon, { size: 20, color: bt.color, style: { marginBottom: '0.5rem' } }),
                  React.createElement('div', { style: { fontSize: '0.75rem', fontWeight: '600', color: '#1e293b' } }, bt.label),
                  React.createElement('div', { style: { fontSize: '0.6rem', color: '#64748b' } }, bt.desc)
                );
              })
            )
          ),
          
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'Email Address', React.createElement('span', { style: { color: '#ef4444' } }, '*')),
            React.createElement('input', { 
              type: 'email', 
              style: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.875rem' },
              placeholder: 'you@yourbusiness.com', 
              value: formData.email, 
              onChange: function (e) { updateField('email', e.target.value); } 
            })
          ),
          
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'Phone Number', React.createElement('span', { style: { color: '#ef4444' } }, '*')),
            React.createElement('input', { 
              type: 'tel', 
              style: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.875rem' },
              placeholder: '08012345678', 
              value: formData.phone, 
              onChange: function (e) { updateField('phone', e.target.value); } 
            })
          ),
          
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'Password', React.createElement('span', { style: { color: '#ef4444' } }, '*')),
            React.createElement('div', { style: { position: 'relative' } },
              React.createElement('input', { 
                type: showPassword ? 'text' : 'password', 
                style: { width: '100%', padding: '0.75rem 1rem', paddingRight: '2.5rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.875rem' },
                placeholder: 'Minimum 6 characters', 
                value: formData.password, 
                onChange: function (e) { updateField('password', e.target.value); } 
              }),
              React.createElement('button', { 
                type: 'button', 
                onClick: function () { setShowPassword(!showPassword); }, 
                style: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' } 
              }, showPassword ? React.createElement(EyeOff, { size: 16 }) : React.createElement(Eye, { size: 16 }))
            )
          )
        ),

        // Step 2
        step === 2 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.25rem' } },
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'City', React.createElement('span', { style: { color: '#ef4444' } }, '*')),
            React.createElement('input', { 
              type: 'text', 
              style: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.875rem' },
              placeholder: 'e.g., Lagos', 
              value: formData.city, 
              onChange: function (e) { updateField('city', e.target.value); } 
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'State', React.createElement('span', { style: { color: '#ef4444' } }, '*')),
            React.createElement('div', { style: { position: 'relative' } },
              React.createElement('input', {
                type: 'text',
                style: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.875rem' },
                placeholder: 'Search or select state...',
                value: stateSearch,
                onFocus: function () { setShowStateDropdown(true); },
                onChange: function (e) {
                  setStateSearch(e.target.value);
                  updateField('state', '');
                  setShowStateDropdown(true);
                }
              }),
              React.createElement(ChevronRight, { size: 16, style: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%) rotate(' + (showStateDropdown ? '90deg' : '0deg') + ')', color: '#94a3b8', transition: 'transform 0.2s', pointerEvents: 'none' } })
            ),
            showStateDropdown && React.createElement('div', { style: { position: 'absolute', zIndex: 20, marginTop: '0.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', maxHeight: '200px', overflowY: 'auto', width: 'calc(100% - 2rem)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } },
              filteredStates.length > 0
                ? filteredStates.map(function (s) {
                    return React.createElement('div', {
                      key: s,
                      onClick: function () { selectState(s); },
                      style: { padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem', background: formData.state === s ? '#f1f5f9' : 'transparent', color: formData.state === s ? '#4f46e5' : '#334155' }
                    }, s);
                  })
                : React.createElement('div', { style: { padding: '0.5rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' } }, 'No state found')
            )
          )
        ),

        // Step 3
        step === 3 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.25rem' } },
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' } }, 'Custom Domain', React.createElement('span', { style: { background: '#f1f5f9', padding: '0.125rem 0.5rem', borderRadius: '20px', fontSize: '0.6rem', marginLeft: '0.5rem', fontWeight: '400' } }, 'Optional')),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' } },
              React.createElement('input', { 
                type: 'text', 
                style: { flex: 1, padding: '0.75rem 1rem', border: 'none', fontSize: '0.875rem', outline: 'none' },
                placeholder: 'book.yourbusiness.com', 
                value: formData.customDomain, 
                onChange: function (e) { updateField('customDomain', e.target.value); } 
              }),
              React.createElement('span', { style: { padding: '0 0.75rem', fontSize: '0.75rem', color: '#94a3b8', background: '#f8fafc', height: '100%', display: 'flex', alignItems: 'center' } }, '.bookgh.com')
            )
          ),
          React.createElement('div', { style: { background: '#f8fafc', borderRadius: '12px', padding: '0.75rem' } },
            React.createElement('p', { style: { fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' } }, 'Your free subdomain:'),
            React.createElement('code', { style: { fontSize: '0.8rem', fontWeight: '500', color: '#4f46e5' } }, 
              (formData.businessName ? formData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'your-business') + '.bookgh.com'
            )
          )
        ),

        // Navigation Buttons
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' } },
          step > 1 && React.createElement('button', { 
            onClick: handleBack, 
            style: { padding: '0.625rem 1.25rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' } 
          }, React.createElement(ChevronLeft, { size: 16 }), 'Back'),
          step < 3
            ? React.createElement('button', { 
                onClick: handleNext, 
                style: { padding: '0.625rem 1.25rem', background: '#4f46e5', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' } 
              }, 'Continue', React.createElement(ChevronRight, { size: 16 }))
            : React.createElement('button', { 
                onClick: handleSubmit, 
                disabled: loading, 
                style: { padding: '0.625rem 1.25rem', background: loading ? '#94a3b8' : '#10b981', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '0.875rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' } 
              }, loading ? React.createElement(Loader, { size: 16 }) : React.createElement(CheckCircle, { size: 16 }), loading ? 'Creating...' : 'Complete Registration')
        )
      )
    )
  );
}

export default BusinessSignup;