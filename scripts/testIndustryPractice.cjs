// Comprehensive Automated Verification of Industry Standard Practices for Bookings & Customers
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
  console.log('    BBD MOBILITY — INDUSTRY PRACTICE COMPLIANCE VERIFICATION            ');
  console.log('========================================================================\n');

  const rand = Math.floor(1000 + Math.random() * 9000);

  // 1. Create a test booking to cancel
  console.log('[TEST 1] Create booking and verify Cancellation workflow...');
  const createBooking1 = await post('/api/bookings', {
    serviceType: 'Express Delivery',
    pickupLocation: 'Ikeja City Mall, Alausa',
    dropoffLocation: 'Admiralty Way, Lekki Phase 1',
    packageDetails: 'Legal Documents',
    senderName: `Chidi Eze ${rand}`,
    senderPhone: `0803${rand}11`,
    senderEmail: `chidi_${rand}@example.com`,
    receiverName: 'Adaobi Okoli',
    receiverPhone: '08091234567',
    receiverEmail: 'adaobi@example.com'
  });
  if (createBooking1.status !== 201) throw new Error(`Create booking failed: ${JSON.stringify(createBooking1.data)}`);
  const ref1 = createBooking1.data.bookingReference || createBooking1.data.booking?.ref;
  console.log(`✓ Created Booking: ${ref1}`);

  // Cancel booking with reason
  const cancelRes = await post(`/api/portal/bookings/${ref1}/cancel`, {
    reason: 'Customer requested cancellation due to schedule change'
  });
  if (cancelRes.status !== 200 || cancelRes.data.booking.status !== 'Cancelled') {
    throw new Error(`Cancellation failed: ${JSON.stringify(cancelRes.data)}`);
  }
  console.log(`✓ Booking ${ref1} successfully cancelled with audit reason: "${cancelRes.data.booking.cancellationReason}"`);

  // 2. Safeguarded Delete: Verify Delivered bookings CANNOT be deleted
  console.log('\n[TEST 2] Safeguarded Delete: Delivered bookings are protected from deletion...');
  const createBooking2 = await post('/api/bookings', {
    serviceType: 'Standard Delivery',
    pickupLocation: 'Yaba Tech, Yaba',
    dropoffLocation: 'Victoria Island, Lagos',
    packageDetails: 'Clothing & Apparel',
    senderName: `Bisi Alabi ${rand}`,
    senderPhone: `0805${rand}22`,
    senderEmail: `bisi_${rand}@example.com`,
    receiverName: 'Kehinde Alabi',
    receiverPhone: '08087654321',
    receiverEmail: 'kehinde@example.com'
  });
  if (createBooking2.status !== 201) throw new Error(`Create booking 2 failed: ${JSON.stringify(createBooking2.data)}`);
  const ref2 = createBooking2.data.bookingReference || createBooking2.data.booking?.ref;

  // Mark as Delivered via admin override
  await post(`/api/portal/bookings/${ref2}/admin-override-otp`, {
    adminName: 'Senior Auditor',
    reason: 'Verified package handover directly with recipient on site.'
  });

  // Attempt to delete delivered booking
  const deleteDeliveredRes = await del(`/api/portal/bookings/${ref2}`);
  if (deleteDeliveredRes.status !== 400) {
    throw new Error(`Delivered booking deletion should have been blocked with 400, got ${deleteDeliveredRes.status}`);
  }
  console.log(`✓ Delivered booking deletion blocked by Industry Compliance Guard: "${deleteDeliveredRes.data.error}"`);

  // 3. Delete Cancelled Booking succeeds
  console.log('\n[TEST 3] Deleting Cancelled / Test Booking succeeds...');
  const deleteCancelledRes = await del(`/api/portal/bookings/${ref1}`);
  if (deleteCancelledRes.status !== 200 || !deleteCancelledRes.data.success) {
    throw new Error(`Delete cancelled booking failed: ${JSON.stringify(deleteCancelledRes.data)}`);
  }
  console.log(`✓ Cancelled booking ${ref1} was safely deleted from MongoDB.`);

  // 4. Customer Blacklist / Deactivation
  console.log('\n[TEST 4] Customer Blacklisting / Status Management...');
  const custRes = await fetch(`${API_BASE}/api/portal/customers`);
  const custData = await custRes.json();
  const targetCust = custData.customers?.find(c => c.phone.includes(String(rand))) || custData.customers?.[0];
  if (!targetCust) throw new Error('No customer found for blacklist test');

  // Blacklist customer
  const blacklistRes = await patch(`/api/portal/customers/${targetCust.customerId || targetCust.id}`, {
    status: 'Blacklisted',
    notes: 'Repeated non-payment for deliveries'
  });
  if (blacklistRes.status !== 200 || blacklistRes.data.customer.status !== 'Blacklisted') {
    throw new Error(`Blacklist failed: ${JSON.stringify(blacklistRes.data)}`);
  }
  console.log(`✓ Customer ${targetCust.name} (${targetCust.customerId}) marked as "Blacklisted".`);

  // Reactivate customer
  const reactivateCustRes = await patch(`/api/portal/customers/${targetCust.customerId || targetCust.id}`, {
    status: 'Active'
  });
  if (reactivateCustRes.status !== 200 || reactivateCustRes.data.customer.status !== 'Active') {
    throw new Error(`Reactivation failed: ${JSON.stringify(reactivateCustRes.data)}`);
  }
  console.log(`✓ Customer status restored to "Active".`);

  // 5. Customer Safeguarded Deletion / NDPR Right-to-Erasure
  console.log('\n[TEST 5] Customer Deletion & NDPR Right-to-Erasure Compliance...');
  // Customer has delivered booking (ref2), so delete should anonymize PII
  const deleteCustRes = await del(`/api/portal/customers/${targetCust.customerId || targetCust.id}`);
  if (deleteCustRes.status !== 200) {
    throw new Error(`Delete customer failed: ${JSON.stringify(deleteCustRes.data)}`);
  }

  if (targetCust.totalBookings > 0) {
    if (!deleteCustRes.data.anonymized) {
      throw new Error(`Customer with completed bookings should have been anonymized, got: ${JSON.stringify(deleteCustRes.data)}`);
    }
    console.log(`✓ Customer with history was anonymized under NDPR Right-to-Erasure: "${deleteCustRes.data.message}"`);
  } else {
    console.log(`✓ Test customer with 0 history permanently deleted: "${deleteCustRes.data.message}"`);
  }

  console.log('\n========================================================================');
  console.log('   ALL INDUSTRY PRACTICE COMPLIANCE TESTS PASSED SUCCESSFULLY!          ');
  console.log('========================================================================');
}

run().catch(err => {
  console.error('\n❌ INDUSTRY PRACTICE TEST FAILED:', err.message);
  process.exit(1);
});
