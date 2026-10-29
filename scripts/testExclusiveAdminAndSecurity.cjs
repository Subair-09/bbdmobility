const http = require('http');

function postRequest(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'POST',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function deleteRequest(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'DELETE',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function patchRequest(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'PATCH',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   BBD MOBILITY - EXCLUSIVE ADMIN & SECURITY AUDIT  ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(testName, condition, details) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ->`, details);
    }
  }

  // 1. Valid Admin Login with info@bbdautosng.com and ijeomawadigwe1
  const loginRes = await postRequest('/api/auth/login', {
    email: 'info@bbdautosng.com',
    password: 'ijeomawadigwe1'
  });
  assert(
    'Admin Login with info@bbdautosng.com / ijeomawadigwe1 succeeds',
    loginRes.status === 200 && loginRes.data.success === true && loginRes.data.user.email === 'info@bbdautosng.com',
    loginRes
  );
  const adminToken = loginRes.data.token;
  const adminUserId = loginRes.data.user.userId;

  // 2. Reject old admin email admin@bbdmobility.com.ng
  const oldEmailRes = await postRequest('/api/auth/login', {
    email: 'admin@bbdmobility.com.ng',
    password: 'ijeomawadigwe1'
  });
  assert(
    'Old admin email admin@bbdmobility.com.ng is rejected with 401',
    oldEmailRes.status === 401,
    oldEmailRes
  );

  // 3. Reject old password admin2026
  const oldPassRes = await postRequest('/api/auth/login', {
    email: 'info@bbdautosng.com',
    password: 'admin2026'
  });
  assert(
    'Old hardcoded password admin2026 is rejected with 401',
    oldPassRes.status === 401,
    oldPassRes
  );

  // 4. Reject wrong password
  const wrongPassRes = await postRequest('/api/auth/login', {
    email: 'info@bbdautosng.com',
    password: 'wrongPassword123!'
  });
  assert(
    'Random incorrect password is rejected with 401',
    wrongPassRes.status === 401,
    wrongPassRes
  );

  // 5. Test SQL Injection attempt in Login email field
  const sqliRes = await postRequest('/api/auth/login', {
    email: "info@bbdautosng.com' OR 1=1 --",
    password: "password"
  });
  assert(
    'SQL Injection attempt in login email is rejected',
    sqliRes.status === 400 || sqliRes.status === 401,
    sqliRes
  );

  // 6. Test NoSQL Injection attempt with query operators ($ne, $gt)
  const nosqliRes = await postRequest('/api/auth/login', {
    email: { "$ne": null },
    password: { "$gt": "" }
  });
  assert(
    'NoSQL injection payload with $ operators is blocked with 400 Bad Request',
    nosqliRes.status === 400 && nosqliRes.data.error.includes('Security validation error'),
    nosqliRes
  );

  // 7. Test creating another Admin user via /api/portal/users (should be forbidden)
  const createAdminRes = await postRequest('/api/portal/users', {
    name: 'Attacker Admin',
    email: 'attacker@evil.com',
    role: 'Admin',
    password: 'password123'
  }, adminToken);
  assert(
    'Prevent creating secondary Admin accounts',
    createAdminRes.status === 400 && createAdminRes.data.error.includes('Additional Admin accounts cannot be created'),
    createAdminRes
  );

  // 8. Test deleting the primary Admin info@bbdautosng.com (should be forbidden)
  const deleteAdminRes = await deleteRequest(`/api/portal/users/${adminUserId}`, adminToken);
  assert(
    'Prevent deletion of primary Admin info@bbdautosng.com',
    deleteAdminRes.status === 403 && deleteAdminRes.data.error.includes('cannot be deleted'),
    deleteAdminRes
  );

  // 9. Test promoting another user to Admin via PATCH (should be forbidden)
  // First create a Support user
  const createSupportRes = await postRequest('/api/portal/users', {
    name: 'Support Agent Jane',
    email: `jane${Date.now()}@bbdmobility.com.ng`,
    role: 'Support',
    phone: '+234 801 234 5678',
    password: 'supportPassword1'
  }, adminToken);
  const supportUserId = createSupportRes.data.user.userId;

  const promoteRes = await patchRequest(`/api/portal/users/${supportUserId}`, {
    role: 'Admin'
  }, adminToken);
  assert(
    'Prevent promoting secondary accounts to Admin',
    promoteRes.status === 400 && promoteRes.data.error.includes('Cannot promote other accounts to Admin'),
    promoteRes
  );

  // Clean up test user
  await deleteRequest(`/api/portal/users/${supportUserId}`, adminToken);

  // 10. Test demoting the primary Admin info@bbdautosng.com via PATCH (should be forbidden)
  const demoteAdminRes = await patchRequest(`/api/portal/users/${adminUserId}`, {
    role: 'Support'
  }, adminToken);
  assert(
    'Prevent demoting primary Admin info@bbdautosng.com role',
    demoteAdminRes.status === 400 && demoteAdminRes.data.error.includes('cannot be demoted'),
    demoteAdminRes
  );

  // 11. Test rider login bypass removal
  const riderBypassRes = await postRequest('/api/auth/rider-login', {
    identifier: 'RID-2026-001',
    password: 'wrongRiderPassword'
  });
  assert(
    'Rider login correctly rejects incorrect password with 401 (no bypass)',
    riderBypassRes.status === 401,
    riderBypassRes
  );

  console.log(`\n====================================================`);
  console.log(`   AUDIT RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log(`====================================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
