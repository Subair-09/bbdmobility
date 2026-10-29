import { 
  connectToDatabase, 
  BookingModel, 
  RiderModel, 
  UserModel, 
  PaymentModel, 
  AuditLogModel, 
  SettingsModel 
} from './models';
import { hashPassword } from './auth';
import { hashOtpCode } from './otp';
import { INITIAL_RIDERS, INITIAL_SETTINGS } from '../src/portal/mockData';

let initPromise: Promise<void> | null = null;

export async function initAndSeedDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const connection = await connectToDatabase();
    if (!connection) {
      console.log('[MongoDB] Running in offline memory cache fallback mode.');
      return;
    }

    try {
      // 1. Seed & Guarantee Single Exclusive Admin User (info@bbdautosng.com)
    const adminEmail = 'info@bbdautosng.com';
    const adminPasswordHash = await hashPassword('ijeomawadigwe1');

    // Remove legacy admin accounts or conflicting admin user IDs
    await UserModel.deleteMany({
      $or: [
        { role: 'Admin', email: { $ne: adminEmail } },
        { userId: 'USR-ADMIN-001', email: { $ne: adminEmail } }
      ]
    });

    await UserModel.findOneAndUpdate(
      { email: adminEmail },
      {
        $set: {
          userId: 'USR-ADMIN-001',
          name: 'BBD Mobility Administrator',
          email: adminEmail,
          phone: '+234 708 753 1148',
          passwordHash: adminPasswordHash,
          role: 'Admin',
          status: 'Active'
        }
      },
      { upsert: true, new: true }
    );

    console.log('[MongoDB] Single exclusive administrator (info@bbdautosng.com) provisioned.');

    // 2. Seed Initial Riders
    const riderCount = await RiderModel.countDocuments();
    if (riderCount === 0) {
      console.log('[MongoDB] Seeding initial riders with secure password hashes...');
      const riderPassHash = await hashPassword('rider2026');
      
      const riderDocs = INITIAL_RIDERS.map(r => ({
        ...r,
        passwordHash: riderPassHash,
        completedDeliveries: r.assignedDeliveries > 4 ? r.assignedDeliveries - 3 : 0
      }));
      await RiderModel.insertMany(riderDocs);
    }

    // 3. Bookings: ZERO mock data — system only reflects authentic customer bookings

    // 4. Seed Settings
    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0) {
      console.log('[MongoDB] Seeding default settings...');
      await SettingsModel.create(INITIAL_SETTINGS);
    }

      console.log('[MongoDB] Enterprise delivery management system initialized successfully.');
    } catch (err) {
      console.error('[MongoDB Init Exception]:', err);
    }
  })();

  return initPromise;
}
