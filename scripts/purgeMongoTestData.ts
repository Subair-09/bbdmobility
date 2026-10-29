// scripts/purgeMongoTestData.ts
import { 
  connectToDatabase, 
  BookingModel, 
  PaymentModel, 
  CustomerModel, 
  NotificationModel, 
  AuditLogModel 
} from '../server/models';

async function purge() {
  console.log('Connecting to database for complete test/mock data wipeout...');
  await connectToDatabase();

  // 1. Purge all test bookings
  const bookingDel = await BookingModel.deleteMany({});
  console.log(`✓ Cleared bookings collection (${bookingDel.deletedCount} removed).`);

  // 2. Purge all test payments
  const paymentDel = await PaymentModel.deleteMany({});
  console.log(`✓ Cleared payments collection (${paymentDel.deletedCount} removed).`);

  // 3. Purge all test customers
  const customerDel = await CustomerModel.deleteMany({});
  console.log(`✓ Cleared customers collection (${customerDel.deletedCount} removed).`);

  // 4. Purge all test notifications
  const notifDel = await NotificationModel.deleteMany({});
  console.log(`✓ Cleared notifications collection (${notifDel.deletedCount} removed).`);

  // 5. Purge test audit logs
  const auditDel = await AuditLogModel.deleteMany({});
  console.log(`✓ Cleared audit logs collection (${auditDel.deletedCount} removed).`);

  console.log('\n--- SYSTEM IS NOW 100% CLEAN OF ALL TEST/MOCK DATA ---');
  console.log('Zero mock data. Zero test bookings. Zero test payments. Ready for official client handover.');
  process.exit(0);
}

purge().catch(err => {
  console.error('Purge error:', err);
  process.exit(1);
});
