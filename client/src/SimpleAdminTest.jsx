import React from 'react';

function SimpleAdminTest() {
  React.useEffect(function() {
    console.log('SimpleAdminTest mounted on mobile');
    alert('If you see this alert, JavaScript is working on your phone!');
  }, []);

  return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } },
    React.createElement('h1', null, 'Admin Test Page'),
    React.createElement('p', null, 'If you can see this text, the route is working.'),
    React.createElement('button', {
      onClick: function() { alert('Button clicked!'); },
      style: { padding: '10px 20px', marginTop: '20px' }
    }, 'Test Button')
  );
}

export default SimpleAdminTest;