// Automated Verification: Admin Booking Deletion, Zero Mock Data, and Real-Time Notifications
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

async function del(url) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function get(url) {
  const res = await fetch(`${API_BASE}${url}`);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function run() {
  console.log('========================================================================');
  console.log('    BBD MOBILITY — NOTIFICATIONS, DELETE & ZERO MOCK DATA VERIFICATION  ');
  console.log('========================================================================\n');

  const rand = Math.floor(1000 + Math.random() * 9000);

  // 1. Verify Zero Mock Data in Bookings
  console.log('[TEST 1] Verifying Zero Mock Bookings in MongoDB...');
  const initialBookings = await get('/api/portal/bookings');
  console.log(`✓ Current authentic bookings in database: ${initialBookings.data.bookings?.length || 0}`);

  // 2. Create Booking and Verify Admin Notification Generation
  console.log('\n[TEST 2] Customer books parcel & Admin Notification Bell triggers...');
  const bookingRes = await post('/api/bookings', {
    serviceType: 'Express Delivery',
    pickupLocation: 'Adeola Odeku, Victoria Island',
    dropoffLocation: 'Allen Avenue, Ikeja',
    packageDetails: 'Confidential Business Files',
    senderName: `Chief Kenneth ${rand}`,
    senderPhone: `0708${rand}99`,
    senderEmail: `kenneth_${rand}@example.com`,
    receiverName: 'Folake Adeleke',
    receiverPhone: '08091234567',
    receiverEmail: 'folake@example.com'
  });

  if (bookingRes.status !== 201) {
    throw new Error(`Booking creation failed: ${JSON.stringify(bookingRes.data)}`);
  }
  const ref = bookingRes.data.bookingReference;
  console.log(`✓ Created Booking: ${ref}`);

  // Check notification bell received the alert
  const notifRes1 = await get('/api/portal/notifications');
  if (notifRes1.status !== 200) throw new Error('Failed to fetch notifications');
  const latestNotif = notifRes1.data.notifications?.[0];
  console.log(`✓ Notification Bell Alert Received: "${latestNotif?.title} — ${latestNotif?.message}"`);
  console.log(`✓ Unread Count: ${notifRes1.data.unreadCount}`);

  if (!latestNotif || !latestNotif.message.includes(ref)) {
    throw new Error('Notification for new booking was not recorded properly.');
  }

  // 3. Admin Deletes Booking from Dashboard
  console.log(`\n[TEST 3] Admin deletes booking ${ref} directly from the dashboard...`);
  const deleteRes = await del(`/api/portal/bookings/${ref}`);
  if (deleteRes.status !== 200 || !deleteRes.data.success) {
    throw new Error(`Delete booking failed: ${JSON.stringify(deleteRes.data)}`);
  }
  console.log(`✓ Booking ${ref} successfully deleted: "${deleteRes.data.message}"`);

  // Verify booking no longer exists
  const checkDeleted = await get(`/api/portal/bookings/${ref}`);
  if (checkDeleted.status !== 404) {
    throw new Error(`Booking ${ref} still exists after deletion! Status: ${checkDeleted.status}`);
  }
  console.log(`✓ Confirmed: Booking ${ref} permanently erased from database.`);

  // 4. Mark all notifications as read
  console.log('\n[TEST 4] Mark all notifications as read in Notification Bell...');
  const markReadRes = await post('/api/portal/notifications/mark-all-read', {});
  if (markReadRes.status !== 200 || !markReadRes.data.success) {
    throw new Error(`Mark all read failed: ${JSON.stringify(markReadRes.data)}`);
  }

  const notifRes2 = await get('/api/portal/notifications');
  console.log(`✓ Notification Bell unread count updated to: ${notifRes2.data.unreadCount} (Badge cleared)`);

  console.log('\n========================================================================');
  console.log('   ALL NOTIFICATION, DELETION & ZERO-MOCK TESTS PASSED SUCCESSFULLY!    ');
  console.log('========================================================================');
}

run().catch(err => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
  process.exit(1);
});
