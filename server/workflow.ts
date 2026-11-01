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
  pricePerMinute: number;
  minimumFare: number;
  waitingChargePerMinute: number;
  waitingFee?: number;
  vatPercentage: number;
  vatEnabled: boolean;
  timePricingEnabled: boolean;
  distancePricingEnabled: boolean;
  fareRoundingIncrement: number;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  baseFare: 300,
  pricePerKm: 250,
  pricePerMinute: 30,
  minimumFare: 1000,
  waitingChargePerMinute: 50,
  waitingFee: 50,
  vatPercentage: 7.5,
  vatEnabled: true,
  timePricingEnabled: true,
  distancePricingEnabled: true,
  fareRoundingIncrement: 50,
};

export interface FareCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  baseFare: number;
  pricePerKm: number;
  distanceCharge: number;
  pricePerMinute: number;
  timeCharge: number;
  waitingCharge: number;
  subtotal: number;
  isMinimumFareApplied: boolean;
  subtotalBeforeVat: number;
  vatPercentage: number;
  vatAmount: number;
  totalBeforeRounding: number;
  fareRoundingIncrement: number;
  finalFare: number;
  configSnapshot: PricingConfig;
}

/**
 * Calculates delivery fare based on Mapbox driving distance, estimated duration,
 * and admin pricing configuration.
 * 
 * Formula:
 * - Distance Charge = Distance in KM × Price per KM (if distance pricing enabled)
 * - Time Charge = Estimated Duration in Minutes × Price per Minute (if time pricing enabled)
 * - Subtotal = Base Fee + Distance Charge + Time Charge + Waiting Charge
 * - SubtotalBeforeVat = Math.max(Subtotal, Minimum Fare)
 * - VAT = SubtotalBeforeVat × VAT% (if VAT enabled)
 * - Total = SubtotalBeforeVat + VAT
 * - Final Fare = Round Total to nearest fareRoundingIncrement (e.g. ₦50)
 */
export function calculateAutomaticFare(params: {
  distanceKm: number;
  durationMinutes?: number;
  waitingMinutes?: number;
  includeWaitingFee?: boolean;
  config?: Partial<PricingConfig>;
}): FareCalculationResult {
  const cfg: PricingConfig = {
    baseFare: Number(params.config?.baseFare ?? DEFAULT_PRICING_CONFIG.baseFare),
    pricePerKm: Number(params.config?.pricePerKm ?? DEFAULT_PRICING_CONFIG.pricePerKm),
    pricePerMinute: Number(params.config?.pricePerMinute ?? DEFAULT_PRICING_CONFIG.pricePerMinute),
    minimumFare: Number(params.config?.minimumFare ?? DEFAULT_PRICING_CONFIG.minimumFare),
    waitingChargePerMinute: Number(params.config?.waitingChargePerMinute ?? params.config?.waitingFee ?? DEFAULT_PRICING_CONFIG.waitingChargePerMinute),
    waitingFee: Number(params.config?.waitingFee ?? params.config?.waitingChargePerMinute ?? DEFAULT_PRICING_CONFIG.waitingFee),
    vatPercentage: Number(params.config?.vatPercentage ?? DEFAULT_PRICING_CONFIG.vatPercentage),
    vatEnabled: params.config?.vatEnabled !== undefined ? Boolean(params.config.vatEnabled) : DEFAULT_PRICING_CONFIG.vatEnabled,
    timePricingEnabled: params.config?.timePricingEnabled !== undefined ? Boolean(params.config.timePricingEnabled) : DEFAULT_PRICING_CONFIG.timePricingEnabled,
    distancePricingEnabled: params.config?.distancePricingEnabled !== undefined ? Boolean(params.config.distancePricingEnabled) : DEFAULT_PRICING_CONFIG.distancePricingEnabled,
    fareRoundingIncrement: Math.max(1, Number(params.config?.fareRoundingIncrement ?? DEFAULT_PRICING_CONFIG.fareRoundingIncrement)),
  };

  const validDistance = Math.max(0, Number(params.distanceKm) || 0);
  const validDuration = Math.max(0, Number(params.durationMinutes) || 0);

  let waitingMins = Math.max(0, Number(params.waitingMinutes) || 0);
  if (params.includeWaitingFee && waitingMins === 0) {
    waitingMins = 1;
  }

  const distanceCharge = cfg.distancePricingEnabled ? Math.round(validDistance * cfg.pricePerKm) : 0;
  const timeCharge = cfg.timePricingEnabled ? Math.round(validDuration * cfg.pricePerMinute) : 0;
  const waitingCharge = waitingMins > 0 ? Math.round(waitingMins * cfg.waitingChargePerMinute) : 0;

  const subtotal = cfg.baseFare + distanceCharge + timeCharge + waitingCharge;
  const isMinimumFareApplied = subtotal < cfg.minimumFare;
  const subtotalBeforeVat = Math.max(subtotal, cfg.minimumFare);

  const vatAmount = cfg.vatEnabled ? Number(((subtotalBeforeVat * cfg.vatPercentage) / 100).toFixed(2)) : 0;
  const totalBeforeRounding = subtotalBeforeVat + vatAmount;

  const finalFare = Math.max(
    cfg.minimumFare,
    Math.round(totalBeforeRounding / cfg.fareRoundingIncrement) * cfg.fareRoundingIncrement
  );

  return {
    distanceKm: validDistance,
    durationMinutes: validDuration,
    baseFare: cfg.baseFare,
    pricePerKm: cfg.pricePerKm,
    distanceCharge,
    pricePerMinute: cfg.pricePerMinute,
    timeCharge,
    waitingCharge,
    subtotal,
    isMinimumFareApplied,
    subtotalBeforeVat,
    vatPercentage: cfg.vatEnabled ? cfg.vatPercentage : 0,
    vatAmount,
    totalBeforeRounding,
    fareRoundingIncrement: cfg.fareRoundingIncrement,
    finalFare,
    configSnapshot: cfg,
  };
}

export function calculateDistanceFare(
  distanceKm: number,
  config?: Partial<PricingConfig>,
  includeWaitingFee: boolean = false,
  durationMinutes: number = 0
): {
  baseFare: number;
  pricePerKm: number;
  distanceKm: number;
  distanceCost: number;
  waitingFee: number;
  subtotal: number;
  minimumFare: number;
  finalFare: number;
  result: FareCalculationResult;
} {
  const result = calculateAutomaticFare({
    distanceKm,
    durationMinutes,
    includeWaitingFee,
    config,
  });

  return {
    baseFare: result.baseFare,
    pricePerKm: result.pricePerKm,
    distanceKm: result.distanceKm,
    distanceCost: result.distanceCharge,
    waitingFee: result.waitingCharge,
    subtotal: result.subtotal,
    minimumFare: result.configSnapshot.minimumFare,
    finalFare: result.finalFare,
    result,
  };
}

// In-Memory Server Route Caching (TTL = 1 hour)
interface CachedRoute {
  distanceKm: number;
  durationMinutes: number;
  polyline?: any;
  cachedAt: number;
}
const serverRouteCache = new Map<string, CachedRoute>();
const ROUTE_CACHE_TTL_MS = 1000 * 60 * 60;

export function getCachedServerRoute(pickup: [number, number], dropoff: [number, number]): CachedRoute | null {
  const key = `${pickup[0].toFixed(3)},${pickup[1].toFixed(3)}->${dropoff[0].toFixed(3)},${dropoff[1].toFixed(3)}`;
  const cached = serverRouteCache.get(key);
  if (cached && Date.now() - cached.cachedAt < ROUTE_CACHE_TTL_MS) {
    return cached;
  }
  return null;
}

export function setCachedServerRoute(
  pickup: [number, number],
  dropoff: [number, number],
  route: { distanceKm: number; durationMinutes: number; polyline?: any }
) {
  const key = `${pickup[0].toFixed(3)},${pickup[1].toFixed(3)}->${dropoff[0].toFixed(3)},${dropoff[1].toFixed(3)}`;
  serverRouteCache.set(key, { ...route, cachedAt: Date.now() });
  if (serverRouteCache.size > 1000) {
    const oldestKey = serverRouteCache.keys().next().value;
    if (oldestKey) serverRouteCache.delete(oldestKey);
  }
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
