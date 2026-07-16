// test-subscription.js
// Complete test suite for subscription system
// Run with: node test-subscription.js

const fetch = require('node-fetch');

// Configuration
const API_BASE = 'http://localhost:5000/api';
let testBusinessId = null;
let testSubscriptionId = null;
let adminToken = null;
let businessToken = null;

// Test Data
const TEST_EMAIL = `test${Date.now()}@business.com`;
const TEST_PASSWORD = 'Password123!';
const TEST_BUSINESS_NAME = `Test Hotel ${Date.now()}`;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

// Helper function to log test results
function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${icon} ${name}${colors.reset}`);
  if (details) console.log(`   ${details}`);
}

// Helper for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await response.json();
  return { response, data };
}

// ============================================
// TEST 1: Admin Login
// ============================================
async function testAdminLogin() {
  console.log('\n' + colors.yellow + '📋 TEST 1: Admin Login' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@bookinghub.com',
        password: 'admin123'
      })
    });

    if (response.ok && data.token) {
      adminToken = data.token;
      logTest('Admin Login', true, 'Token received');
      return true;
    } else {
      logTest('Admin Login', false, data.message || 'Login failed');
      return false;
    }
  } catch (error) {
    logTest('Admin Login', false, error.message);
    return false;
  }
}

// ============================================
// TEST 2: Register Test Business
// ============================================
async function testRegisterBusiness() {
  console.log('\n' + colors.yellow + '📋 TEST 2: Register Test Business' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        full_name: 'Test Owner',
        business_name: TEST_BUSINESS_NAME,
        business_type: 'hotel',
        state: 'Lagos',
        city: 'Lagos',
        phone: '08012345678'
      })
    });

    if (response.ok && data.data) {
      testBusinessId = data.data.id;
      businessToken = data.token;
      logTest('Business Registration', true, `ID: ${testBusinessId}`);
      return true;
    } else {
      logTest('Business Registration', false, data.message || 'Registration failed');
      return false;
    }
  } catch (error) {
    logTest('Business Registration', false, error.message);
    return false;
  }
}

// ============================================
// TEST 3: Business Login
// ============================================
async function testBusinessLogin() {
  console.log('\n' + colors.yellow + '📋 TEST 3: Business Login' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    if (response.ok && data.token) {
      businessToken = data.token;
      logTest('Business Login', true, 'Token received');
      return true;
    } else {
      logTest('Business Login', false, data.message || 'Login failed');
      return false;
    }
  } catch (error) {
    logTest('Business Login', false, error.message);
    return false;
  }
}

// ============================================
// TEST 4: Get Subscription Status
// ============================================
async function testGetSubscriptionStatus() {
  console.log('\n' + colors.yellow + '📋 TEST 4: Get Subscription Status' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/subscriptions/status', {
      headers: { 'Authorization': `Bearer ${businessToken}` }
    });

    if (response.ok && data.data) {
      const status = data.data;
      logTest('Get Subscription Status', true, 
        `Plan: ${status.plan}, Used: ${status.used}/${status.limit}, ${status.percentage}%`);
      return true;
    } else {
      logTest('Get Subscription Status', false, data.message || 'Failed');
      return false;
    }
  } catch (error) {
    logTest('Get Subscription Status', false, error.message);
    return false;
  }
}

// ============================================
// TEST 5: Check Can Book
// ============================================
async function testCanBook() {
  console.log('\n' + colors.yellow + '📋 TEST 5: Check Can Accept Bookings' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/subscriptions/can-book', {
      headers: { 'Authorization': `Bearer ${businessToken}` }
    });

    if (response.ok && data.data) {
      logTest('Can Accept Bookings', true, 
        `Can book: ${data.data.canBook}, ${data.data.message}`);
      return true;
    } else {
      logTest('Can Accept Bookings', false, data.message || 'Failed');
      return false;
    }
  } catch (error) {
    logTest('Can Accept Bookings', false, error.message);
    return false;
  }
}

// ============================================
// TEST 6: Create Upgrade Request
// ============================================
async function testCreateUpgrade() {
  console.log('\n' + colors.yellow + '📋 TEST 6: Create Upgrade Request' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/subscriptions/upgrade', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${businessToken}` },
      body: JSON.stringify({
        plan: 'starter',
        paymentDetails: {
          notes: 'Test upgrade from local environment'
        }
      })
    });

    if (response.ok && data.data) {
      testSubscriptionId = data.data.subscriptionId;
      logTest('Create Upgrade Request', true, 
        `ID: ${testSubscriptionId}, Plan: ${data.data.plan}, Ref: ${data.data.reference}`);
      return true;
    } else {
      logTest('Create Upgrade Request', false, data.message || 'Failed');
      return false;
    }
  } catch (error) {
    logTest('Create Upgrade Request', false, error.message);
    return false;
  }
}

// ============================================
// TEST 7: Admin Get Pending Upgrades
// ============================================
async function testGetPendingUpgrades() {
  console.log('\n' + colors.yellow + '📋 TEST 7: Admin Get Pending Upgrades' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/admin/pending-upgrades', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (response.ok && data.data) {
      const pending = data.data;
      const found = pending.some(u => u.id === testSubscriptionId);
      logTest('Get Pending Upgrades', found, 
        found ? `Found test upgrade: ${testSubscriptionId}` : 'Test upgrade not found in list');
      return found;
    } else {
      logTest('Get Pending Upgrades', false, data.message || 'Failed');
      return false;
    }
  } catch (error) {
    logTest('Get Pending Upgrades', false, error.message);
    return false;
  }
}

// ============================================
// TEST 8: Admin Verify Upgrade
// ============================================
async function testVerifyUpgrade() {
  console.log('\n' + colors.yellow + '📋 TEST 8: Admin Verify Upgrade' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/subscriptions/verify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        subscriptionId: testSubscriptionId
      })
    });

    if (response.ok && data.success) {
      logTest('Verify Upgrade', true, 
        `Plan activated: ${data.data.plan}, Valid until: ${data.data.validUntil}`);
      return true;
    } else {
      logTest('Verify Upgrade', false, data.message || 'Failed');
      return false;
    }
  } catch (error) {
    logTest('Verify Upgrade', false, error.message);
    return false;
  }
}

// ============================================
// TEST 9: Get Subscription Status After Upgrade
// ============================================
async function testStatusAfterUpgrade() {
  console.log('\n' + colors.yellow + '📋 TEST 9: Get Status After Upgrade' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/subscriptions/status', {
      headers: { 'Authorization': `Bearer ${businessToken}` }
    });

    if (response.ok && data.data) {
      const status = data.data;
      const upgraded = status.plan === 'starter';
      logTest('Status After Upgrade', upgraded, 
        `Plan: ${status.plan}, Used: ${status.used}/${status.limit}`);
      return upgraded;
    } else {
      logTest('Status After Upgrade', false, data.message || 'Failed');
      return false;
    }
  } catch (error) {
    logTest('Status After Upgrade', false, error.message);
    return false;
  }
}

// ============================================
// TEST 10: Get Upgrade History
// ============================================
async function testGetHistory() {
  console.log('\n' + colors.yellow + '📋 TEST 10: Get Upgrade History' + colors.reset);
  
  try {
    const { response, data } = await apiCall('/subscriptions/history', {
      headers: { 'Authorization': `Bearer ${businessToken}` }
    });

    if (response.ok && data.data) {
      const history = data.data;
      const hasRecord = history.some(h => h.id === testSubscriptionId);
      logTest('Get Upgrade History', hasRecord, 
        hasRecord ? `Found ${history.length} records` : 'No records found');
      return hasRecord;
    } else {
      logTest('Get Upgrade History', false, data.message || 'Failed');
      return false;
    }
  } catch (error) {
    logTest('Get Upgrade History', false, error.message);
    return false;
  }
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  console.log('\n' + colors.blue + '='.repeat(60));
  console.log('🚀 STARTING SUBSCRIPTION SYSTEM TESTS');
  console.log('='.repeat(60) + colors.reset);

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Register Business', fn: testRegisterBusiness },
    { name: 'Business Login', fn: testBusinessLogin },
    { name: 'Get Subscription Status', fn: testGetSubscriptionStatus },
    { name: 'Check Can Book', fn: testCanBook },
    { name: 'Create Upgrade Request', fn: testCreateUpgrade },
    { name: 'Admin Get Pending', fn: testGetPendingUpgrades },
    { name: 'Admin Verify Upgrade', fn: testVerifyUpgrade },
    { name: 'Status After Upgrade', fn: testStatusAfterUpgrade },
    { name: 'Get Upgrade History', fn: testGetHistory }
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + colors.blue + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + colors.reset);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}📊 Total: ${results.total}${colors.reset}`);

  if (results.failed === 0) {
    console.log('\n' + colors.green + '🎉 ALL TESTS PASSED! System is production-ready!' + colors.reset);
  } else {
    console.log('\n' + colors.red + '⚠️ Some tests failed. Please check the errors above.' + colors.reset);
  }

  console.log('\n' + colors.blue + '='.repeat(60) + colors.reset);
}

// ============================================
// INSTALL DEPENDENCIES AND RUN
// ============================================
console.log('📦 Checking dependencies...');
try {
  require.resolve('node-fetch');
} catch (e) {
  console.log('Installing node-fetch...');
  const { execSync } = require('child_process');
  execSync('npm install node-fetch@2', { stdio: 'inherit' });
}

runAllTests().catch(console.error);
