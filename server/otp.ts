import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'bbd_mobility_secure_otp_salt_lagos_2026';

export interface GeneratedOtpResult {
  code: string;       // Plaintext 6-digit code (ONLY dispatched to receiver email, never stored in DB)
  hash: string;       // Cryptographic hash stored in MongoDB
  expiresAt: Date;    // 24 hours from creation
}

/**
 * Generate a cryptographically secure 6-digit OTP and its hash
 */
export function generateDeliveryOtp(bookingRef: string): GeneratedOtpResult {
  // Cryptographically secure random integer between 100000 and 999999
  const code = crypto.randomInt(100000, 1000000).toString();
  
  const hash = hashOtpCode(code, bookingRef);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

  return {
    code,
    hash,
    expiresAt
  };
}

/**
 * Compute HMAC-SHA256 hash of the OTP tied to the specific bookingRef and secret salt
 */
export function hashOtpCode(code: string, bookingRef: string): string {
  return crypto
    .createHmac('sha256', OTP_SECRET)
    .update(`${bookingRef}:${code.trim()}`)
    .digest('hex');
}

/**
 * Timing-safe comparison of user-entered OTP against the stored hash
 */
export function verifyOtpHash(enteredCode: string, bookingRef: string, storedHash: string): boolean {
  if (!enteredCode || enteredCode.length !== 6 || !/^\d{6}$/.test(enteredCode)) {
    return false;
  }

  const computedHash = hashOtpCode(enteredCode, bookingRef);
  
  try {
    const computedBuffer = Buffer.from(computedHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, storedBuffer);
  } catch {
    return false;
  }
}
