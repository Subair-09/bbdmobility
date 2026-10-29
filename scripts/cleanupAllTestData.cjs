// scripts/cleanupAllTestData.cjs
const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- PURGING ALL TEST AND MOCK DATA FROM MONGODB ---');

  // 1. Admin Login
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

  // 2. Fetch all bookings
  const bookingsRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/bookings',
    method: 'GET',
    headers: authHeaders
  });

  const bookings = bookingsRes.body.bookings || [];
  console.log(`Found ${bookings.length} total booking(s) in system.`);

  // 3. Delete any test bookings
  for (const b of bookings) {
    const isTest = 
      (b.senderName && b.senderName.toLowerCase().includes('test')) ||
      (b.senderEmail && (b.senderEmail.toLowerCase().includes('test') || b.senderEmail.toLowerCase().includes('example.com'))) ||
      (b.ref && b.ref.toUpperCase().includes('TEST'));

    if (isTest) {
      console.log(`Deleting test booking: ${b.ref} (${b.senderName} - ${b.senderEmail})...`);
      const delRes = await request({
        hostname: 'localhost',
        port: 3001,
        path: `/api/portal/bookings/${b.ref}`,
        method: 'DELETE',
        headers: authHeaders
      });
      console.log(`  Result: ${delRes.status === 200 ? 'Deleted successfully' : JSON.stringify(delRes.body)}`);
    }
  }

  // 4. Fetch all payments
  const paymentsRes = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/payments',
    method: 'GET',
    headers: authHeaders
  });
  const payments = paymentsRes.body.payments || [];
  console.log(`Found ${payments.length} remaining payment(s).`);

  for (const p of payments) {
    const isTestPayment = 
      (p.customerName && p.customerName.toLowerCase().includes('test')) ||
      (p.notes && p.notes.toLowerCase().includes('test')) ||
      (p.transactionRef && p.transactionRef.includes('INIT'));

    if (isTestPayment) {
      console.log(`Deleting test payment: ${p.id} (${p.amount} NGN)...`);
      await request({
        hostname: 'localhost',
        port: 3001,
        path: `/api/portal/payments/${p.id}`,
        method: 'DELETE',
        headers: authHeaders
      });
    }
  }

  console.log('✓ All test bookings and test payments purged.');
}

run().catch(err => {
  console.error('Purge error:', err);
  process.exit(1);
});
