/**
 * BankIntel — HMAC Token Utilities
 * ==================================
 * Generate and verify HMAC-signed one-time download tokens.
 *
 * Token format (URL-safe base64):
 *   <product_slug>.<expiry_epoch>.<hmac_signature>
 *
 * Usage:
 *   import { generateToken, verifyToken } from './lib/hmac-token.mjs';
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

// ─── Config ───────────────────────────────────────────────────────────────────
// HMAC_SECRET should be set as Netlify environment variable.
// Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
function getSecret() {
  return process.env.HMAC_SECRET || process.env.THALUX_HMAC_SECRET;
}
const DEFAULT_TTL_HOURS = 24;

// ─── Token Generation ─────────────────────────────────────────────────────────

/**
 * Generate an HMAC-signed download token.
 *
 * @param {string} productSlug - e.g. 'bankintel'
 * @param {object} [options]
 * @param {number} [options.ttlHours=24] - Token time-to-live in hours
 * @param {string} [options.customerEmail] - Optional: embed buyer email for audit
 * @returns {string} URL-safe base64 token
 * @throws {Error} If HMAC_SECRET is not configured
 */
function generateToken(productSlug, options = {}) {
  const secret = getSecret();
  if (!secret) {
    throw new Error('HMAC_SECRET not configured. Set HMAC_SECRET environment variable.');
  }

  const ttlHours = options.ttlHours || DEFAULT_TTL_HOURS;
  const expiry = Math.floor(Date.now() / 1000) + (ttlHours * 3600);
  const payload = options.customerEmail
    ? `${productSlug}.${expiry}.${options.customerEmail}`
    : `${productSlug}.${expiry}`;

  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');

  // Build: product_slug.expiry[.customerEmail].signature
  const raw = options.customerEmail
    ? `${productSlug}.${expiry}.${options.customerEmail}.${signature}`
    : `${productSlug}.${expiry}.${signature}`;
  const token = Buffer.from(raw).toString('base64url');

  return token;
}

// ─── Token Verification ───────────────────────────────────────────────────────

/**
 * Verify an HMAC-signed download token.
 *
 * @param {string} token - URL-safe base64 token
 * @returns {{ valid: boolean, productSlug: string|null, expiry: number|null, reason?: string }}
 */
function verifyToken(token) {
  const secret = getSecret();
  if (!secret) {
    return { valid: false, productSlug: null, expiry: null, reason: 'HMAC_SECRET not configured' };
  }

  if (!token) {
    return { valid: false, productSlug: null, expiry: null, reason: 'No token provided' };
  }

  let decoded;
  try {
    decoded = Buffer.from(token, 'base64url').toString('utf-8');
  } catch {
    return { valid: false, productSlug: null, expiry: null, reason: 'Invalid token encoding' };
  }

  // Parse: product_slug.expiry.signature
  const parts = decoded.split('.');
  if (parts.length < 3) {
    return { valid: false, productSlug: null, expiry: null, reason: 'Malformed token' };
  }

  const productSlug = parts[0];
  const expiryStr = parts[1];
  const signature = parts[parts.length - 1]; // last element is always the HMAC signature
  const expiry = parseInt(expiryStr, 10);

  if (isNaN(expiry)) {
    return { valid: false, productSlug, expiry: null, reason: 'Invalid expiry timestamp' };
  }

  // Recompute HMAC
  // Rebuild the payload from the raw token, excluding the last (signature) part
  const payload = parts.slice(0, -1).join('.');

  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  // Timing-safe comparison
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, productSlug, expiry, reason: 'Invalid signature' };
  }

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (now > expiry) {
    return { valid: false, productSlug, expiry, reason: 'Token expired' };
  }

  return { valid: true, productSlug, expiry };
}

export { generateToken, verifyToken };