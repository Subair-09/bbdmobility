import { 
  Booking, 
  Rider, 
  Customer, 
  PlatformUser, 
  PaymentRecord, 
  AdminNotification,
  GeneralSettings 
} from './types';

// ZERO mock records — all dashboards fetch and render purely authentic MongoDB records
export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_RIDERS: Rider[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_USERS: PlatformUser[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const INITIAL_NOTIFICATIONS: AdminNotification[] = [];

export const INITIAL_SETTINGS: GeneralSettings = {
  businessName: 'BBD Mobility',
  phone: '+234 708 753 1148',
  email: 'info@bbdmobility.com.ng',
  operatingCities: 'Lagos, Nigeria',
  address: 'Lagos, Nigeria',
  description: 'Fast and reliable delivery services across Lagos and beyond.',
  defaultPickupLocation: 'Lagos, Nigeria',
  serviceArea: 'Lagos (All Areas)',
  deliveryRadiusKm: 50,
  maxDeliveryTimeMinutes: 180,
  defaultServiceType: 'Standard Delivery',
  riderCommissionPercent: 25,
  notifications: {
    newBookings: true,
    payments: true,
    riderUpdates: true,
    systemAlerts: true
  },
  twoFactorAuth: false,
  sessionTimeout: '8 hours'
};

// Storage helper functions for live reactivity
const STORAGE_PREFIX = 'bbd_portal_';
const DATA_VERSION = 'v7_clean_zero_mock_handover';

// Purge any legacy mock or test data from browser localStorage
try {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('bbd_data_version') !== DATA_VERSION) {
      localStorage.removeItem(STORAGE_PREFIX + 'bookings');
      localStorage.removeItem(STORAGE_PREFIX + 'riders');
      localStorage.removeItem(STORAGE_PREFIX + 'customers');
      localStorage.removeItem(STORAGE_PREFIX + 'users');
      localStorage.removeItem(STORAGE_PREFIX + 'payments');
      localStorage.removeItem(STORAGE_PREFIX + 'notifications');
      localStorage.setItem('bbd_data_version', DATA_VERSION);
    }
    // Safeguard: immediately purge any stuck test/mock payment records
    const rawPayments = localStorage.getItem(STORAGE_PREFIX + 'payments');
    if (rawPayments && (rawPayments.includes('Test Sender') || rawPayments.includes('YZ96') || rawPayments.includes('test'))) {
      localStorage.removeItem(STORAGE_PREFIX + 'payments');
    }
    const rawBookings = localStorage.getItem(STORAGE_PREFIX + 'bookings');
    if (rawBookings && (rawBookings.includes('Test Sender') || rawBookings.includes('YZ96') || rawBookings.includes('test'))) {
      localStorage.removeItem(STORAGE_PREFIX + 'bookings');
    }
  }
} catch {}

export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}
