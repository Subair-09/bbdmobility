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
const DATA_VERSION = 'v5_zero_mock_data';

// Purge any legacy mock data from browser localStorage once
try {
  if (typeof window !== 'undefined' && localStorage.getItem('bbd_data_version') !== DATA_VERSION) {
    localStorage.removeItem(STORAGE_PREFIX + 'bookings');
    localStorage.removeItem(STORAGE_PREFIX + 'riders');
    localStorage.removeItem(STORAGE_PREFIX + 'customers');
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'payments');
    localStorage.removeItem(STORAGE_PREFIX + 'notifications');
    localStorage.setItem('bbd_data_version', DATA_VERSION);
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
