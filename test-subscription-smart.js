// test-subscription-smart.js
// Smart test with better error handling
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testHealth() {
  console.log('\n📋 Testing Health Check...');
  try {
    const response = await fetch('http://localhost:5000/health');
    const text = await response.text();
    
    // Check if response is HTML
    if (text.includes('<!DOCTYPE')) {
      console.log('❌ Server returned HTML instead of JSON!');
      console.log('   This means your backend is not running properly.');
      console.log('   Make sure to start: cd server && node server.js');
      return false;
    }
    
    try {
      const data = JSON.parse(text);
      console.log('✅ Health check passed:', data);
      return true;
    } catch (e) {
      console.log('❌ Invalid JSON response:', text.substring(0, 100));
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    console.log('   Make sure server is running on port 5000');
    return false;
  }
}

async function testAdminLogin() {
  console.log('\n📋 Testing Admin Login...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bookinghub.com',
        password: 'admin123'
      })
    });
    
    const text = await response.text();
    if (text.includes('<!DOCTYPE')) {
      console.log('❌ Server returned HTML - check your routes');
      return false;
    }
    
    const data = JSON.parse(text);
    if (data.token) {
      console.log('✅ Admin login successful!');
      console.log(`   Token: ${data.token.substring(0, 30)}...`);
      return data.token;
    } else {
      console.log('❌ Login failed:', data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🚀 SMART SUBSCRIPTION TESTS');
  console.log('='.repeat(60));
  
  // Test 1: Health
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n❌ Server is not responding correctly!');
    console.log('\n💡 FIX THIS:');
    console.log('1. In Terminal 1: cd server');
    console.log('2. Run: node server.js');
    console.log('3. Make sure you see: "✅ Server running on port 5000"');
    console.log('4. Then run this test again');
    return;
  }
  
  // Test 2: Admin Login
  const token = await testAdminLogin();
  if (!token) {
    console.log('\n❌ Admin login failed!');
    console.log('\n💡 FIX THIS:');
    console.log('1. Check if admin account exists');
    console.log('2. Check if auth routes are working');
    console.log('3. Check your .env file');
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All basic tests passed!');
  console.log('='.repeat(60));
}

// Install dependencies
try {
  require.resolve('node-fetch');
} catch (e) {
  console.log('Installing node-fetch...');
  const { execSync } = require('child_process');
  execSync('npm install node-fetch@2', { stdio: 'inherit' });
}

runTests().catch(console.error);
