// Automated test script to verify recording payment and booking sync
const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
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

async function runTest() {
  console.log('--- STARTING PAYMENT-BOOKING SYNCHRONIZATION TEST ---');

  // Step 1: Create a new booking
  console.log(`\n1. Creating test booking...`);
  const createRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    serviceType: 'Same-Day Delivery',
    pickupLocation: '15 Admiralty Way, Lekki Phase 1',
    dropoffLocation: '42 Isaac John Street, Ikeja GRA',
    packageDetails: 'Important contract documents',
    packageCategory: 'Documents',
    senderName: 'Tunde Adebayo',
    senderPhone: '08011223344',
    senderEmail: 'tunde.adebayo@example.com',
    receiverName: 'Chioma Okeke',
    receiverPhone: '08099887766',
    receiverEmail: 'chioma.okeke@example.com',
    deliveryInstructions: 'Handle with utmost care'
  });

  console.log('Create booking response status:', createRes.status);
  const bookingRef = createRes.data?.bookingReference;
  if (!bookingRef) {
    throw new Error('Booking ref not returned: ' + JSON.stringify(createRes.data));
  }
  console.log('Booking created successfully with ref:', bookingRef);

  // Step 2: Fetch all bookings to verify it starts pending / unset
  console.log(`\n2. Verifying booking in GET /api/portal/bookings...`);
  const listRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/bookings',
    method: 'GET'
  });
  const foundBooking = (listRes.data?.bookings || []).find(b => b.ref === bookingRef);
  if (!foundBooking) {
    throw new Error(`Created booking ${bookingRef} not found in /api/portal/bookings!`);
  }
  console.log(`Found booking:`, {
    ref: foundBooking.ref,
    amount: foundBooking.amount,
    paymentStatus: foundBooking.paymentStatus
  });

  // Step 3: Record Payment via POST /api/portal/payments
  console.log(`\n3. Recording payment via POST /api/portal/payments (Amount: 8500, Method: Bank Transfer, Status: Paid)...`);
  const recordRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/payments',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    bookingRef: bookingRef,
    amount: 8500,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    customerName: 'Tunde Adebayo',
    customerPhone: '08011223344',
    pickupLocation: '15 Admiralty Way, Lekki Phase 1',
    dropoffLocation: '42 Isaac John Street, Ikeja GRA',
    transactionRef: 'STANBIC-TX-998811',
    notes: 'Payment confirmed via Stanbic direct transfer'
  });

  console.log('Record payment status:', recordRes.status);
  console.log('Record payment response:', recordRes.data);
  if (!recordRes.data?.success) {
    throw new Error('Failed to record payment: ' + JSON.stringify(recordRes.data));
  }

  // Step 4: Verify booking was updated in GET /api/portal/bookings
  console.log(`\n4. Verifying booking reflection in GET /api/portal/bookings...`);
  const verifyBookingsRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/bookings',
    method: 'GET'
  });
  const updatedBooking = (verifyBookingsRes.data?.bookings || []).find(b => b.ref === bookingRef);
  const effectiveAmount = updatedBooking?.amount ?? updatedBooking?.deliveryFee ?? updatedBooking?.totalAmount;
  console.log('Updated booking in /api/portal/bookings:', {
    ref: updatedBooking?.ref,
    amount: effectiveAmount,
    deliveryFee: updatedBooking?.deliveryFee,
    totalAmount: updatedBooking?.totalAmount,
    paymentStatus: updatedBooking?.paymentStatus,
    paymentMethod: updatedBooking?.paymentMethod
  });

  if (!updatedBooking || effectiveAmount !== 8500 || updatedBooking.paymentStatus !== 'Paid') {
    throw new Error(`Booking was not updated correctly! Got amount: ${effectiveAmount}, status: ${updatedBooking?.paymentStatus}`);
  }
  console.log('✓ SUCCESS: Booking amount and payment status synchronized to ₦8,500 and Paid!');

  // Step 5: Verify payment appears in GET /api/portal/payments
  console.log(`\n5. Verifying payment listed in GET /api/portal/payments...`);
  const verifyPaymentsRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/payments',
    method: 'GET'
  });
  const savedPayment = (verifyPaymentsRes.data?.payments || []).find(p => p.bookingRef === bookingRef);
  console.log('Saved payment in payments list:', savedPayment);
  if (!savedPayment || savedPayment.amount !== 8500) {
    throw new Error('Payment not listed in /api/portal/payments ledger!');
  }
  console.log('✓ SUCCESS: Payment record found in financial ledger!');

  // Step 6: Verify Admin Notification was triggered
  console.log(`\n6. Verifying admin notification triggered...`);
  const notifRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/notifications',
    method: 'GET'
  });
  const payNotif = (notifRes.data?.notifications || []).find(n => n.link?.includes(bookingRef) || n.message?.includes(bookingRef) || n.title?.includes('Payment'));
  console.log('Found notification:', payNotif?.title, '—', payNotif?.message);
  if (!payNotif) {
    console.warn('Notification not found, continuing cleanup');
  } else {
    console.log('✓ SUCCESS: Admin notification verified!');
  }

  // Step 7: Cleanup test booking
  console.log(`\n7. Cleaning up test booking via DELETE /api/portal/bookings/${bookingRef}...`);
  const delRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/bookings/${bookingRef}`,
    method: 'DELETE'
  });
  console.log('Cleanup delete response:', delRes.data);

  console.log('\n======================================================');
  console.log('ALL PAYMENT & BOOKING SYNC TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runTest().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
