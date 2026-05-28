function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'dashboard') {
    return (
      <div className="app-container">
        <div className="app-header">
          <div>
            <div className="skeleton skeleton-title" style={{ width: '200px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '150px', marginTop: '8px' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ width: '100px', height: '44px', borderRadius: '10px' }}></div>)}
          </div>
        </div>
        <div className="dashboard-tabs">
          <div className="skeleton" style={{ width: '120px', height: '44px', borderRadius: '10px' }}></div>
          <div className="skeleton" style={{ width: '100px', height: '44px', borderRadius: '10px' }}></div>
        </div>
        <div style={{ marginTop: '32px' }}>
          <div className="skeleton skeleton-title" style={{ width: '180px', marginBottom: '24px' }}></div>
          {[...Array(count)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px', marginBottom: '16px', background: 'white', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="skeleton skeleton-text" style={{ width: '150px', height: '20px' }}></div>
                <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '30px' }}></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j}>
                    <div className="skeleton skeleton-text" style={{ width: '60px', height: '10px', marginBottom: '6px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '100px', height: '16px' }}></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '16px', background: 'white', display: 'flex' }}>
            <div className="skeleton" style={{ width: '220px', height: '100%', borderRadius: '12px 0 0 12px' }}></div>
            <div style={{ padding: '20px', flex: 1 }}>
              <div className="skeleton skeleton-title" style={{ width: '180px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '250px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '150px' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '44px', marginTop: '20px', borderRadius: '8px' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'searchResults') {
    return (
      <div className="hotels-grid">
        <div className="skeleton skeleton-title" style={{ width: '300px', marginBottom: '24px' }}></div>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '16px', marginBottom: '16px', background: 'white' }}>
            <div className="skeleton" style={{ height: '140px', borderRadius: '12px 12px 0 0' }}></div>
            <div style={{ padding: '16px' }}>
              <div className="skeleton skeleton-title" style={{ width: '200px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '250px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '150px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '100%', height: '40px', marginTop: '16px', borderRadius: '8px' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="loading-spinner"></div>;
}

export default LoadingSkeleton;