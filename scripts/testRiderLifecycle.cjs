// Comprehensive Verification of Rider & User Lifecycle: Suspend, Change Password, Delete
const API_BASE = 'http://localhost:3001';

async function post(url, data) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function patch(url, data) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function del(url) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function run() {
  console.log('========================================================================');
  console.log('    BBD MOBILITY — RIDER & USER LIFECYCLE (SUSPEND, PWD, DELETE)        ');
  console.log('========================================================================\n');

  const rand = Math.floor(1000 + Math.random() * 9000);
  const initialPassword = `BBD@Initial${rand}`;
  const updatedPassword = `BBD@Updated${rand}!`;

  // 1. Create test rider
  console.log('[STEP 1] Admin creates test rider...');
  const createRiderRes = await post('/api/portal/riders', {
    name: `Test Rider ${rand}`,
    phone: `0802${rand}99`,
    email: `test_rider_${rand}@bbdmobility.ng`,
    vehicleType: 'Motorcycle',
    password: initialPassword
  });
  if (createRiderRes.status !== 201) {
    throw new Error(`Failed to create rider: ${JSON.stringify(createRiderRes.data)}`);
  }
  const riderId = createRiderRes.data.rider.riderId;
  console.log(`✓ Created Rider: ${riderId}`);

  // 2. Rider logs in with initial password
  console.log('\n[STEP 2] Verify login with initial password...');
  const login1 = await post('/api/auth/rider-login', {
    identifier: riderId,
    password: initialPassword
  });
  if (login1.status !== 200) {
    throw new Error(`Initial login failed: ${JSON.stringify(login1.data)}`);
  }
  console.log('✓ Successfully authenticated with initial password.');

  // 3. Admin changes rider password
  console.log('\n[STEP 3] Admin changes rider password...');
  const changePwdRes = await post(`/api/portal/riders/${riderId}/change-password`, {
    password: updatedPassword
  });
  if (changePwdRes.status !== 200 || !changePwdRes.data.success) {
    throw new Error(`Change password failed: ${JSON.stringify(changePwdRes.data)}`);
  }
  console.log(`✓ Password updated in MongoDB to: ${updatedPassword}`);

  // 4. Old password fails
  console.log('\n[STEP 4] Verify old password is now rejected...');
  const loginOld = await post('/api/auth/rider-login', {
    identifier: riderId,
    password: initialPassword
  });
  if (loginOld.status !== 401) {
    throw new Error(`Old password should have been rejected with 401, got ${loginOld.status}`);
  }
  console.log('✓ Old password rejected with 401 Unauthorized.');

  // 5. New password succeeds
  console.log('\n[STEP 5] Verify login with new password...');
  const loginNew = await post('/api/auth/rider-login', {
    identifier: riderId,
    password: updatedPassword
  });
  if (loginNew.status !== 200) {
    throw new Error(`New password login failed: ${JSON.stringify(loginNew.data)}`);
  }
  console.log('✓ Successfully authenticated with updated password.');

  // 6. Admin suspends rider
  console.log('\n[STEP 6] Admin suspends rider...');
  const suspendRes = await patch(`/api/portal/riders/${riderId}`, {
    status: 'Suspended'
  });
  if (suspendRes.status !== 200) {
    throw new Error(`Failed to suspend rider: ${JSON.stringify(suspendRes.data)}`);
  }
  console.log('✓ Rider status updated to "Suspended" in MongoDB.');

  // 7. Suspended rider login blocked
  console.log('\n[STEP 7] Verify suspended rider cannot login...');
  const loginSuspended = await post('/api/auth/rider-login', {
    identifier: riderId,
    password: updatedPassword
  });
  if (loginSuspended.status !== 403) {
    throw new Error(`Expected 403 for suspended rider, got ${loginSuspended.status}`);
  }
  console.log(`✓ Suspended rider login blocked with 403: "${loginSuspended.data.error}"`);

  // 8. Admin reactivates rider
  console.log('\n[STEP 8] Admin reactivates rider...');
  const reactivateRes = await patch(`/api/portal/riders/${riderId}`, {
    status: 'Active'
  });
  if (reactivateRes.status !== 200) {
    throw new Error(`Failed to reactivate rider: ${JSON.stringify(reactivateRes.data)}`);
  }
  const loginReactivated = await post('/api/auth/rider-login', {
    identifier: riderId,
    password: updatedPassword
  });
  if (loginReactivated.status !== 200) {
    throw new Error(`Reactivated login failed: ${JSON.stringify(loginReactivated.data)}`);
  }
  console.log('✓ Reactivated rider login restored successfully.');

  // 9. Admin deletes rider
  console.log('\n[STEP 9] Admin deletes rider...');
  const delRiderRes = await del(`/api/portal/riders/${riderId}`);
  if (delRiderRes.status !== 200 || !delRiderRes.data.success) {
    throw new Error(`Delete rider failed: ${JSON.stringify(delRiderRes.data)}`);
  }
  console.log(`✓ Rider ${riderId} deleted permanently from MongoDB.`);

  // 10. Deleted rider cannot login
  console.log('\n[STEP 10] Verify deleted rider no longer exists...');
  const loginDeleted = await post('/api/auth/rider-login', {
    identifier: riderId,
    password: updatedPassword
  });
  if (loginDeleted.status !== 401) {
    throw new Error(`Expected 401 for deleted rider, got ${loginDeleted.status}`);
  }
  console.log('✓ Deleted rider account no longer exists in system.');

  // 11. Test Staff User Lifecycle
  console.log('\n[STEP 11] Test Staff User Lifecycle (Create, Change Password, Delete)...');
  const userEmail = `staff_${rand}@bbdmobility.ng`;
  const createUserRes = await post('/api/portal/users', {
    name: `Staff Member ${rand}`,
    email: userEmail,
    role: 'Support'
  });
  if (createUserRes.status !== 201) {
    throw new Error(`Failed to create user: ${JSON.stringify(createUserRes.data)}`);
  }
  const userId = createUserRes.data.user.userId;
  console.log(`✓ Created Staff User: ${userId}`);

  // Change staff password
  const changeUserPwdRes = await post(`/api/portal/users/${userId}/change-password`, {
    password: 'NewStaffPassword@2026'
  });
  if (changeUserPwdRes.status !== 200 || !changeUserPwdRes.data.success) {
    throw new Error(`Failed to change staff user password: ${JSON.stringify(changeUserPwdRes.data)}`);
  }
  console.log('✓ Changed staff user password.');

  // Delete staff user
  const delUserRes = await del(`/api/portal/users/${userId}`);
  if (delUserRes.status !== 200 || !delUserRes.data.success) {
    throw new Error(`Failed to delete staff user: ${JSON.stringify(delUserRes.data)}`);
  }
  console.log(`✓ Deleted staff user ${userId} permanently.`);

  console.log('\n========================================================================');
  console.log('   ALL 11 RIDER & USER LIFECYCLE TESTS PASSED PERFECTLY!                ');
  console.log('========================================================================');
}

run().catch(err => {
  console.error('\n❌ LIFECYCLE TEST FAILED:', err.message);
  process.exit(1);
});
