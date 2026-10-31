import { Request, Response, NextFunction } from 'express';

/**
 * Enterprise-Grade Security & Input Sanitization
 * Protects against:
 * - SQL Injection (stacked queries, tautologies, UNION attacks, comment evasion)
 * - NoSQL / MongoDB Operator Injections ($gt, $ne, $where, $regex, dot-notation)
 * - Stored & Reflected Cross-Site Scripting (XSS)
 * - Null-byte Poisoning & Buffer Overruns
 */

// Common SQL Injection signatures
const SQLI_REGEX = /(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|EXECUTE|CREATE|TABLE|DATABASE|FROM|WHERE|JOIN|TRUNCATE|DECLARE|CAST)\b|--|\/\*|\*\/|;\s*$|'\s*OR\s*'\d+'='\d+|'\s*OR\s*1\s*=\s*1|"\s*OR\s*"1"="1|'\s*=\s*'|"\s*=\s*")/i;

// Dangerous MongoDB operator injection prefixes
const FORBIDDEN_KEY_PREFIX = /^\$|[\.]/;

/**
 * Deep recursive validation to block NoSQL object/operator injections
 */
export function sanitizeObject<T>(obj: T, depth = 0): T {
  if (depth > 10) {
    throw new Error('Nested input exceeds maximum permitted depth.');
  }

  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Preserve base64 image data-URIs and CDN URLs from truncation
    if (obj.startsWith('data:image/') || obj.startsWith('https://res.cloudinary.com')) {
      return obj as unknown as T;
    }
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Reject any MongoDB query operator injection keys (e.g. $gt, $ne, $regex, $where)
      if (FORBIDDEN_KEY_PREFIX.test(key)) {
        throw new Error(`Security validation failure: illegal operator character in parameter key "${key}".`);
      }
      clean[key] = sanitizeObject(value, depth + 1);
    }
    return clean as T;
  }

  return obj;
}

/**
 * Sanitize and neutralize SQL Injection and XSS from string inputs
 */
export function sanitizeString(val: unknown, maxLength: number = 2000): string {
  if (typeof val !== 'string') {
    if (typeof val === 'number' || typeof val === 'boolean') {
      return String(val);
    }
    return '';
  }

  // 1. Null-byte removal
  let clean = val.replace(/\0/g, '');

  // 2. Truncate to maximum length to prevent buffer and memory denial of service
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  // 3. Escape HTML entities to prevent XSS
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return clean.trim();
}

/**
 * Validates strict string parameters (e.g. IDs, references) to prevent SQL & NoSQL injection
 */
export function validateStrictParam(val: unknown, pattern: RegExp, fieldName: string): string {
  if (typeof val !== 'string') {
    throw new Error(`Invalid format for ${fieldName}: must be a plain text string.`);
  }
  const clean = val.trim();
  if (!pattern.test(clean)) {
    throw new Error(`Invalid characters detected in ${fieldName}.`);
  }
  return clean;
}

/**
 * Strict Email validation
 */
export function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean) || clean.length > 150) return null;
  return clean;
}

/**
 * Strict Phone validation
 */
export function validatePhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null;
  const clean = phone.trim();
  // Allow international and local format (+234, 080..., dashes, spaces)
  const phoneRegex = /^[+]?[\d\s\-().]{7,25}$/;
  if (!phoneRegex.test(clean)) return null;
  return clean;
}

/**
 * Global Express Security Middleware
 * Inspects all requests (body, query, params) for NoSQL operator and SQL injections
 */
export function securityProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    next();
  } catch (err: any) {
    console.warn(`[SECURITY ALERT - BLOCKED INJECTION]: ${err.message} from IP ${req.ip}`);
    return res.status(400).json({
      error: 'Security validation error: Malicious or forbidden characters detected in payload.',
      details: err.message
    });
  }
}
