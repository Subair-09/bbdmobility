// Test Admin Rider Provisioning & Authentication Against Live MongoDB Server
const http = require('http');

const API_BASE = 'http://localhost:3001';

async function post(url, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function get(url, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${url}`, { headers });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function runTests() {
  console.log('========================================================================');
  console.log('    BBD MOBILITY: ADMIN RIDER PROVISIONING & AUTHENTICATION TESTS       ');
  console.log('========================================================================\n');

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testPhone = `0803${randomSuffix}77`;
  const testEmail = `rider_${randomSuffix}@bbdmobility.ng`;
  const customPass = `BBD@Pass${randomSuffix}`;

  // Test 1: Admin provisions rider with custom password & plate number
  console.log('[TEST 1] Admin provisions rider with custom password & plate number...');
  const createRes = await post('/api/portal/riders', {
    name: `Emeka Okonkwo ${randomSuffix}`,
    phone: testPhone,
    email: testEmail,
    vehicleType: 'Motorcycle',
    plateNumber: `KJA-${randomSuffix}-BD`,
    password: customPass
  });

  if (createRes.status !== 201 || !createRes.data.success) {
    throw new Error(`Failed to create rider: ${JSON.stringify(createRes.data)}`);
  }
  const rider = createRes.data.rider;
  const credentials = createRes.data.credentials;
  console.log(`✓ Provisioned Rider ID: ${rider.riderId}`);
  console.log(`✓ Generated Credentials Card:`, {
    riderId: credentials.riderId,
    name: credentials.name,
    phone: credentials.phone,
    email: credentials.email,
    password: credentials.password,
    loginUrl: credentials.loginUrl
  });

  if (!rider.riderId.startsWith('RID-2026-')) {
    throw new Error(`Invalid Rider ID format: ${rider.riderId}`);
  }
  if (credentials.password !== customPass) {
    throw new Error(`Password mismatch: expected ${customPass}, got ${credentials.password}`);
  }

  // Test 2: Admin provisions another rider with auto-generated password (password omitted in request)
  console.log('\n[TEST 2] Admin provisions rider with auto-generated password...');
  const randomSuffix2 = Math.floor(1000 + Math.random() * 9000);
  const createRes2 = await post('/api/portal/riders', {
    name: `Amina Bello ${randomSuffix2}`,
    phone: `0814${randomSuffix2}88`,
    email: `amina_${randomSuffix2}@bbdmobility.ng`,
    vehicleType: 'Scooter'
  });

  if (createRes2.status !== 201 || !createRes2.data.credentials.password) {
    throw new Error(`Failed to auto-generate password: ${JSON.stringify(createRes2.data)}`);
  }
  console.log(`✓ Auto-generated Rider ID: ${createRes2.data.rider.riderId}, Password: ${createRes2.data.credentials.password}`);

  // Test 3: Duplicate phone or email rejection
  console.log('\n[TEST 3] Duplicate phone or email is rejected...');
  const dupRes = await post('/api/portal/riders', {
    name: 'Duplicate Rider',
    phone: testPhone,
    email: 'diff_email@bbdmobility.ng'
  });
  if (dupRes.status !== 400 && dupRes.status !== 409) {
    throw new Error(`Expected 400 or 409 for duplicate phone, got ${dupRes.status}`);
  }
  console.log(`✓ Duplicate registration correctly rejected with 409: "${dupRes.data.error}"`);

  // Test 4: Rider logs in with Rider ID + Password
  console.log('\n[TEST 4] Rider logs in via Rider ID + Password...');
  const loginById = await post('/api/auth/rider-login', {
    identifier: credentials.riderId,
    password: customPass
  });
  if (loginById.status !== 200 || !loginById.data.token) {
    throw new Error(`Rider ID login failed: ${JSON.stringify(loginById.data)}`);
  }
  console.log(`✓ Authenticated with Rider ID (${credentials.riderId}). JWT Token issued.`);
  const riderToken = loginById.data.token;

  // Test 5: Rider logs in with registered Phone Number + Password
  console.log('\n[TEST 5] Rider logs in via Phone Number + Password...');
  const loginByPhone = await post('/api/auth/rider-login', {
    identifier: testPhone,
    password: customPass
  });
  if (loginByPhone.status !== 200 || !loginByPhone.data.token) {
    throw new Error(`Phone login failed: ${JSON.stringify(loginByPhone.data)}`);
  }
  console.log(`✓ Authenticated with Phone Number (${testPhone}).`);

  // Test 6: Rider logs in with registered Email Address + Password
  console.log('\n[TEST 6] Rider logs in via Email Address + Password...');
  const loginByEmail = await post('/api/auth/rider-login', {
    identifier: testEmail,
    password: customPass
  });
  if (loginByEmail.status !== 200 || !loginByEmail.data.token) {
    throw new Error(`Email login failed: ${JSON.stringify(loginByEmail.data)}`);
  }
  console.log(`✓ Authenticated with Email Address (${testEmail}).`);

  // Test 7: Wrong password rejection
  console.log('\n[TEST 7] Incorrect password returns 401 Unauthorized...');
  const wrongPassLogin = await post('/api/auth/rider-login', {
    identifier: credentials.riderId,
    password: 'WrongPassword123!'
  });
  if (wrongPassLogin.status !== 401) {
    throw new Error(`Expected 401 for bad password, got ${wrongPassLogin.status}`);
  }
  console.log(`✓ Rejected invalid password with 401: "${wrongPassLogin.data.error}"`);

  // Test 8: Authenticated rider fetches their assigned deliveries
  console.log('\n[TEST 8] Authenticated rider fetches assigned deliveries with JWT...');
  const deliveriesRes = await get(`/api/portal/rider/me/deliveries?riderId=${credentials.riderId}`, riderToken);
  if (deliveriesRes.status !== 200 || !Array.isArray(deliveriesRes.data.deliveries)) {
    throw new Error(`Failed to fetch deliveries: ${JSON.stringify(deliveriesRes.data)}`);
  }
  console.log(`✓ Rider accessed protected deliveries endpoint. Found ${deliveriesRes.data.deliveries.length} assigned tasks.`);

  // Test 9: Suspended rider cannot log in
  console.log('\n[TEST 9] Suspended rider account login rejection...');
  // Update rider status to Suspended
  const suspendRes = await fetch(`${API_BASE}/api/portal/riders/${credentials.riderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Suspended' })
  });
  const suspendedLogin = await post('/api/auth/rider-login', {
    identifier: credentials.riderId,
    password: customPass
  });
  if (suspendedLogin.status !== 403) {
    throw new Error(`Expected 403 Forbidden for suspended rider, got ${suspendedLogin.status}`);
  }
  console.log(`✓ Suspended rider blocked with 403: "${suspendedLogin.data.error}"`);

  console.log('\n========================================================================');
  console.log('   ALL 9 ADMIN PROVISIONING & AUTHENTICATION TESTS PASSED!              ');
  console.log('========================================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
