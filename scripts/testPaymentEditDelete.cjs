// scripts/testPaymentEditDelete.cjs
const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- Testing Payment Edit and Delete Endpoints ---');

  // 1. Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'info@bbdautosng.com', password: 'ijeomawadigwe1' });

  if (loginRes.status !== 200 || !loginRes.body.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }
  const token = loginRes.body.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log('✓ Admin login successful');

  // 2. Create a test booking
  const testBookingPayload = {
    serviceType: 'standard',
    pickupLocation: '12 Marina Road, Lagos Island',
    dropoffLocation: '45 Allen Avenue, Ikeja',
    packageDetails: 'Test Document Package - Medium',
    senderName: 'Test Sender',
    senderPhone: '08012345678',
    senderEmail: 'testsender@example.com',
    receiverName: 'Test Recipient',
    receiverPhone: '08087654321',
    receiverEmail: 'testrecipient@example.com',
    estimatedCost: 5000,
    paymentMethod: 'Bank Transfer'
  };

  const bookingRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, testBookingPayload);

  if (bookingRes.status !== 201) {
    throw new Error('Failed to create test booking: ' + JSON.stringify(bookingRes.body));
  }
  const bookingRef = bookingRes.body.bookingReference;
  const totalAmount = bookingRes.body.calculatedFee || 5000;
  console.log(`✓ Created test booking ${bookingRef} with total amount ₦${totalAmount}`);

  // 3. Record a payment of 4,000
  const recordRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/payments',
    method: 'POST',
    headers: authHeaders
  }, {
    bookingRef: bookingRef,
    amount: 4000,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Valid',
    transactionRef: 'TXN-INIT-001',
    notes: 'Initial test payment'
  });

  console.log('recordRes status:', recordRes.status, 'body:', recordRes.body);

  if (recordRes.status !== 201 && recordRes.status !== 200) {
    throw new Error('Failed to record payment: ' + JSON.stringify(recordRes.body));
  }
  const payment = recordRes.body.payment;
  const paymentId = payment.id || payment.paymentId;
  console.log(`✓ Recorded payment ${paymentId} for ₦4,000 (status: Valid)`);

  // Verify booking balance
  const bCheck1 = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/bookings/${bookingRef}`,
    method: 'GET',
    headers: authHeaders
  });
  const b1 = bCheck1.body.booking;
  console.log(`  Booking status after record: totalPaid=${b1.totalPaid}, balance=${b1.outstandingBalance}, status=${b1.paymentStatus}`);
  if (b1.totalPaid !== 4000) {
    throw new Error(`Expected totalPaid=4000, got ${b1.totalPaid}`);
  }

  // 4. Edit payment: increase amount to 5,000 (full payment)
  const editRes1 = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/payments/${paymentId}`,
    method: 'PATCH',
    headers: authHeaders
  }, {
    amount: 5000,
    paymentMethod: 'POS',
    notes: 'Updated to POS full payment'
  });

  if (editRes1.status !== 200) {
    throw new Error('Failed to edit payment: ' + JSON.stringify(editRes1.body));
  }
  console.log(`✓ Edited payment amount to ₦5,000 and method to POS`);
  
  const bCheck2 = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/bookings/${bookingRef}`,
    method: 'GET',
    headers: authHeaders
  });
  const b2 = bCheck2.body.booking;
  console.log(`  Booking status after edit: totalPaid=${b2.totalPaid}, balance=${b2.outstandingBalance}, status=${b2.paymentStatus}`);
  if (b2.totalPaid !== 5000 || b2.paymentStatus !== 'Paid') {
    throw new Error(`Expected totalPaid=5000 and status=Paid, got totalPaid=${b2.totalPaid}, status=${b2.paymentStatus}`);
  }

  // 5. Edit payment status to 'Pending' (should invalidate totalPaid)
  const editRes2 = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/payments/${paymentId}`,
    method: 'PATCH',
    headers: authHeaders
  }, {
    paymentStatus: 'Pending'
  });

  if (editRes2.status !== 200) {
    throw new Error('Failed to update payment status to Pending: ' + JSON.stringify(editRes2.body));
  }
  const bCheck3 = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/bookings/${bookingRef}`,
    method: 'GET',
    headers: authHeaders
  });
  const b3 = bCheck3.body.booking;
  console.log(`  Booking status after setting payment to Pending: totalPaid=${b3.totalPaid}, balance=${b3.outstandingBalance}, status=${b3.paymentStatus}`);
  if (b3.totalPaid !== 0 || b3.paymentStatus !== 'Unpaid') {
    throw new Error(`Expected totalPaid=0 and status=Unpaid, got totalPaid=${b3.totalPaid}, status=${b3.paymentStatus}`);
  }

  // 6. Delete payment
  const deleteRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/payments/${paymentId}`,
    method: 'DELETE',
    headers: authHeaders
  });

  if (deleteRes.status !== 200) {
    throw new Error('Failed to delete payment: ' + JSON.stringify(deleteRes.body));
  }
  console.log(`✓ Deleted payment ${paymentId}`);

  // Verify payment is gone from list
  const paymentsRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/payments',
    method: 'GET',
    headers: authHeaders
  });
  const paymentList = paymentsRes.body.payments || paymentsRes.body || [];
  const found = paymentList.find(p => p.id === paymentId || p.paymentId === paymentId);
  if (found) {
    throw new Error(`Payment ${paymentId} should have been deleted, but was found in portal payments`);
  }
  console.log('✓ Verified payment is no longer returned in /api/portal/payments');

  // Verify booking ledger after deletion
  const bCheck4 = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/bookings/${bookingRef}`,
    method: 'GET',
    headers: authHeaders
  });
  const b4 = bCheck4.body.booking;
  console.log(`  Booking status after delete: totalPaid=${b4.totalPaid}, balance=${b4.outstandingBalance}, status=${b4.paymentStatus}`);
  if (b4.totalPaid !== 0) {
    throw new Error(`Expected totalPaid=0 after deletion, got ${b4.totalPaid}`);
  }

  // Cleanup test booking
  await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/bookings/${bookingRef}`,
    method: 'DELETE',
    headers: authHeaders
  });
  console.log(`✓ Cleaned up test booking ${bookingRef}`);

  console.log('\n ALL TESTS PASSED SUCCESSFULLY! Edit and Delete payment functionality is 100% verified.');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
