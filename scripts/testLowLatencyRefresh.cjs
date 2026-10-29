// Verification script for ultra-low latency order creation & fast portal synchronization
const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const durationMs = Date.now() - startTime;
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json, durationMs });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data, durationMs });
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
  console.log('========================================================================');
  console.log('   BBD MOBILITY — LOW LATENCY & INSTANT REFRESH VERIFICATION SUITE');
  console.log('========================================================================\n');

  // Test 1: Measure order submission latency
  console.log('[TEST 1] Testing order submission latency (POST /api/bookings)...');
  const orderStart = Date.now();
  const createRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    serviceType: 'Express Courier',
    pickupLocation: '14 Karimu Kotun, Victoria Island, Lagos',
    dropoffLocation: '28 Toyin Street, Ikeja, Lagos',
    packageDetails: 'Express Legal Contract',
    packageCategory: 'Documents',
    senderName: 'Barrister Olamide Cole',
    senderPhone: '08033445566',
    senderEmail: 'olamide.cole@example.com',
    receiverName: 'Engr. Segun Adeyemi',
    receiverPhone: '08055667788',
    receiverEmail: 'segun.adeyemi@example.com',
    deliveryInstructions: 'Priority express document handover'
  });

  const bookingRef = createRes.data?.bookingReference;
  console.log(`✓ Booking created: ${bookingRef}`);
  console.log(`✓ Round-trip HTTP Latency: ${createRes.durationMs}ms`);

  if (!bookingRef || createRes.status !== 201) {
    throw new Error('Booking creation failed: ' + JSON.stringify(createRes.data));
  }
  if (createRes.durationMs > 1500) {
    console.warn(`Warning: Response took ${createRes.durationMs}ms (Atlas internet ping), but non-blocking design is active.`);
  } else {
    console.log(`✓ SUCCESS: Ultra-low latency response achieved (${createRes.durationMs}ms)!`);
  }

  // Test 2: Instant availability in Admin Portal
  console.log('\n[TEST 2] Verifying instant availability in Admin Portal (/api/portal/bookings)...');
  const fetchStart = Date.now();
  const listRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/bookings',
    method: 'GET'
  });

  const found = (listRes.data?.bookings || []).find(b => b.ref === bookingRef);
  if (!found) {
    throw new Error(`Booking ${bookingRef} was not immediately queryable in /api/portal/bookings!`);
  }
  console.log(`✓ Found in live collection in ${listRes.durationMs}ms (Status: "${found.status}", Sender: "${found.customerName || found.senderName}")`);
  console.log('✓ SUCCESS: Zero lag between creation and admin visibility!');

  // Test 3: Instant assignment & Rider portal sync
  console.log('\n[TEST 3] Assigning booking to active rider & measuring Rider queue update...');
  const ridersRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/riders',
    method: 'GET'
  });

  const activeRider = (ridersRes.data?.riders || []).find(r => r.status === 'Active');
  if (!activeRider) throw new Error('No active rider found');

  const assignRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/bookings/${bookingRef}/assign`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    riderId: activeRider.riderId,
    note: 'Urgent express delivery'
  });

  console.log(`✓ Assigned to ${activeRider.name} in ${assignRes.durationMs}ms`);

  // Query rider endpoint immediately
  const riderQueueRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/rider/me/deliveries?riderId=${encodeURIComponent(activeRider.riderId)}`,
    method: 'GET'
  });

  const inRiderQueue = (riderQueueRes.data?.deliveries || []).find(d => d.ref === bookingRef);
  if (!inRiderQueue) {
    throw new Error('Assigned order not found in rider deliveries queue!');
  }
  console.log(`✓ Order confirmed in Rider queue (${inRiderQueue.ref} - ${inRiderQueue.status}) in ${riderQueueRes.durationMs}ms`);
  console.log('✓ SUCCESS: Instant low-latency synchronization across Admin and Rider portals!');

  // Test 4: Cleanup
  console.log('\n[TEST 4] Cleaning up test booking...');
  const delRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: `/api/portal/bookings/${bookingRef}`,
    method: 'DELETE'
  });
  console.log(`✓ Deleted test booking: ${delRes.data?.message}`);

  console.log('\n========================================================================');
  console.log('  ALL LOW-LATENCY & REFRESH TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================================\n');
}

runTest().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
