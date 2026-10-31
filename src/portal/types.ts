export type PortalTab = 
  | 'dashboard' 
  | 'bookings' 
  | 'riders' 
  | 'customers' 
  | 'users' 
  | 'payments' 
  | 'reports' 
  | 'settings';

export type BookingStatus = 'Delivered' | 'In Transit' | 'Picked Up' | 'Assigned' | 'Accepted' | 'Awaiting Assignment' | 'Pending' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Pending';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'POS' | 'Card';
export type RiderStatus = 'Active' | 'On Leave' | 'Suspended';
export type UserStatus = 'Active' | 'Suspended' | 'Inactive';
export type UserRole = 'Admin' | 'Support' | 'Finance' | 'Customer' | 'Rider';

export interface Booking {
  id: string;
  ref: string; // e.g. BBD-20261028-001
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  amount: number;
  deliveryFee?: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderEmail?: string;
  riderVehicle?: string;
  riderAccepted?: boolean;
  riderAcceptedAt?: string;
  pickupPhoto?: string;
  pickupPhotoUploadedAt?: string;
  deliveryPhoto?: string;
  deliveryPhotoUploadedAt?: string;
  packageDescription: string;
  packageWeight: string;
  verificationOtp: string;
  date: string;
  time: string;
  timeline?: {
    booked?: string;
    accepted?: string;
    pickedUp?: string;
    delivered?: string;
  };
}

export interface Rider {
  id: string;
  riderId: string; // e.g. RID-2026-001
  name: string;
  phone: string;
  email: string;
  status: RiderStatus;
  assignedDeliveries: number;
  totalEarnings: number;
  joinedDate: string;
  vehicleType: string;
  plateNumber?: string;
  avatar?: string;
  rating?: number;
  currentLocation?: string;
  mustChangePin?: boolean;
  pin?: string;
}

export interface Customer {
  id: string;
  customerId: string; // e.g. CUST-001
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  status: 'Active' | 'Inactive' | 'Blacklisted';
  joinedDate: string;
  location: string;
  lastBookingRef?: string;
  lastBookingDate?: string;
  avatar?: string;
}

export interface PlatformUser {
  id: string;
  userId: string; // e.g. USR-001
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  totalBookings: number;
  joinedDate: string;
  device?: string;
  location?: string;
  registrationMethod?: string;
}

export interface PaymentRecord {
  id: string;
  paymentId?: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending';
  paidAt: string;
  transactionRef?: string;
  notes?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'booking' | 'payment' | 'rider' | 'system';
}

export interface GeneralSettings {
  businessName: string;
  phone: string;
  email: string;
  operatingCities: string;
  address: string;
  description: string;
  defaultPickupLocation: string;
  serviceArea: string;
  deliveryRadiusKm: number;
  maxDeliveryTimeMinutes: number;
  defaultServiceType: string;
  notifications: {
    newBookings: boolean;
    payments: boolean;
    riderUpdates: boolean;
    systemAlerts: boolean;
  };
  twoFactorAuth: boolean;
  sessionTimeout: string;
}
