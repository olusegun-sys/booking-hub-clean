import { useState } from 'react';

const TEST_HOTEL_ABUJA_ID = 'f46a5855-ed71-4b4a-a895-e03f3a45a73f';

function StaffLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (email === 'manager@testhotel.com' && password === 'manager123') {
      const businessResponse = await fetch(`http://localhost:5000/api/businesses/${TEST_HOTEL_ABUJA_ID}`);
      const businessData = await businessResponse.json();
      
      if (businessData.success) {
        onLogin({ 
          ...businessData.business, 
          staffUser: {
            id: 'staff-456',
            email: 'manager@testhotel.com',
            full_name: 'John Manager',
            role: 'manager'
          }
        });
      }
    } else if (email === 'receptionist@testhotel.com' && password === 'staff123') {
      const businessResponse = await fetch(`http://localhost:5000/api/businesses/${TEST_HOTEL_ABUJA_ID}`);
      const businessData = await businessResponse.json();
      
      if (businessData.success) {
        onLogin({ 
          ...businessData.business, 
          staffUser: {
            id: 'staff-123',
            email: 'receptionist@testhotel.com',
            full_name: 'Jane Receptionist',
            role: 'staff'
          }
        });
      }
    } else {
      setError('Invalid credentials. Use manager@testhotel.com / manager123');
    }
    
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Staff Login</h2>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="manager@testhotel.com"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="form-control"
          />
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            Demo: manager@testhotel.com / manager123
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {loading ? 'Logging in...' : 'Login as Staff'}
        </button>
      </form>
    </div>
  );
}

export default StaffLogin;