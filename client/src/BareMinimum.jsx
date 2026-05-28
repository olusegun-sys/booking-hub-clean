import React from 'react';

function BareMinimum() {
  return React.createElement('div', { style: { 
    backgroundColor: 'red', 
    color: 'white', 
    padding: '20px', 
    textAlign: 'center',
    fontSize: '24px',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } },
    'IF YOU SEE RED BACKGROUND, ROUTE IS WORKING'
  );
}

export default BareMinimum;