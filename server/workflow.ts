import { DeliveryStatus, AuditLogModel } from './models';

// Delivery State Machine Permitted Transitions
export const VALID_STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  'New Booking': ['Awaiting Assignment', 'Assigned', 'Cancelled'],
  'Awaiting Assignment': ['Assigned', 'Cancelled'],
  'Assigned': ['Arriving for Pickup', 'Assigned', 'Pickup Failed', 'Cancelled'],
  'Arriving for Pickup': ['Picked Up', 'Pickup Failed', 'Cancelled'],
  'Picked Up': ['In Transit', 'On Hold', 'Cancelled'],
  'In Transit': ['Delivered', 'Delivery Attempt Failed', 'On Hold', 'Returned to Sender'],
  'Delivered': [], // Final state: Delivered cannot be reverted to in-transit or other states
  'Pickup Failed': ['Awaiting Assignment', 'Assigned', 'Cancelled'],
  'Delivery Attempt Failed': ['In Transit', 'On Hold', 'Returned to Sender'],
  'On Hold': ['In Transit', 'Delivered', 'Cancelled', 'Returned to Sender'],
  'Cancelled': [], // Terminal
  'Returned to Sender': [] // Terminal
};

export function canTransitionStatus(from: DeliveryStatus, to: DeliveryStatus, role: string): boolean {
  // If identical, allow
  if (from === to) return true;

  // Super Admin exception override (must be audited)
  if (role === 'Admin' && to === 'Cancelled') return true;

  const allowed = VALID_STATUS_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// Server-side Pricing Calculator (Do not trust client-submitted amounts)
export function calculateDeliveryFee(serviceType: string, weightKg: number = 1.0): number {
  let baseFee = 3500;
  const s = serviceType.toLowerCase();

  if (s.includes('express') || s.includes('same-day')) {
    baseFee = 5000;
  } else if (s.includes('scheduled')) {
    baseFee = 4000;
  } else if (s.includes('food') || s.includes('groceries')) {
    baseFee = 4500;
  } else if (s.includes('document')) {
    baseFee = 3500;
  }

  // Weight adjustments: +₦500 per kg above 3kg
  if (weightKg > 3) {
    const extraKg = Math.ceil(weightKg - 3);
    baseFee += extraKg * 500;
  }

  return baseFee;
}

// Audit Logger Helper
export async function recordAuditLog(params: {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  affectedEntity: string;
  entityRef: string;
  metadata?: any;
  ipAddress?: string;
}) {
  try {
    // Sanitize metadata: never store plaintext OTPs or passwords in audit logs
    const sanitizedMeta = { ...params.metadata };
    if (sanitizedMeta.otp) sanitizedMeta.otp = '******';
    if (sanitizedMeta.password) sanitizedMeta.password = '******';

    await AuditLogModel.create({
      ...params,
      metadata: sanitizedMeta,
      timestamp: new Date()
    });
  } catch (err) {
    console.warn('[Audit Log Warning]:', (err as Error).message);
  }
}
