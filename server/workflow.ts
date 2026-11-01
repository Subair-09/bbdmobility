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

export interface PricingConfig {
  baseFare: number;
  pricePerKm: number;
  minimumFare: number;
  waitingFee: number;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  baseFare: 500,
  pricePerKm: 250,
  minimumFare: 1500,
  waitingFee: 200,
};

/**
 * Calculates delivery fare based on Mapbox driving distance and admin pricing settings:
 * - Base fare: e.g. ₦500
 * - Price per km: e.g. ₦250
 * - Minimum fare: e.g. ₦1,500
 * - Optional Waiting fee: e.g. ₦200
 * 
 * Example: 8 km trip
 * Base fare: ₦500 + (8 × ₦250 = ₦2,000) = ₦2,500 (>= ₦1,500) -> ₦2,500
 */
export function calculateDistanceFare(
  distanceKm: number,
  config?: Partial<PricingConfig>,
  includeWaitingFee: boolean = false
): {
  baseFare: number;
  pricePerKm: number;
  distanceKm: number;
  distanceCost: number;
  waitingFee: number;
  subtotal: number;
  minimumFare: number;
  finalFare: number;
} {
  const baseFare = Number(config?.baseFare ?? DEFAULT_PRICING_CONFIG.baseFare);
  const pricePerKm = Number(config?.pricePerKm ?? DEFAULT_PRICING_CONFIG.pricePerKm);
  const minimumFare = Number(config?.minimumFare ?? DEFAULT_PRICING_CONFIG.minimumFare);
  const waitingFee = includeWaitingFee ? Number(config?.waitingFee ?? DEFAULT_PRICING_CONFIG.waitingFee) : 0;

  const validDistance = Math.max(0, Number(distanceKm) || 0);
  const distanceCost = Math.round(validDistance * pricePerKm);
  const subtotal = baseFare + distanceCost + waitingFee;
  const finalFare = Math.max(subtotal, minimumFare);

  return {
    baseFare,
    pricePerKm,
    distanceKm: validDistance,
    distanceCost,
    waitingFee,
    subtotal,
    minimumFare,
    finalFare,
  };
}

// Server-side Pricing Calculator (Do not trust client-submitted amounts)
export function calculateDeliveryFee(
  serviceType: string,
  weightKg: number = 1.0,
  distanceKm?: number,
  config?: Partial<PricingConfig>,
  includeWaitingFee: boolean = false
): number {
  if (typeof distanceKm === 'number' && distanceKm > 0) {
    const calc = calculateDistanceFare(distanceKm, config, includeWaitingFee);
    return calc.finalFare;
  }

  let baseFee = 3500;
  const s = serviceType.toLowerCase();

  if (s.includes('express') || s.includes('same-day')) {
    baseFee = 5000;
  } else if (s.includes('scheduled')) {
    baseFee = 4000;
  } else if (s.includes('food') || s.includes('groceries')) {
    baseFee = 4500;
  } else if (s.includes('document')) {
    baseFee = 4000;
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
