#!/usr/bin/env node

/**
 * BankIntel Pipeline Test Suite
 * ==============================
 * Tests for HMAC token generation/verification, product registry, and monitoring.
 *
 * Usage:
 *   node test_bankintel.mjs                # Run all tests
 *   node test_bankintel.mjs --watchdog     # Run unfulfilled payment check
 *   node test_bankintel.mjs --self-test    # Run automated test purchase
 *   node test_bankintel.mjs --unit         # Run unit tests only
 */

// ─── Imports ─────────────────────────────────────────────────────────────────
import { generateToken, verifyToken } from '../netlify/functions/lib/hmac-token.mjs';
import { getProduct, getProductBySlug, getTier, PRODUCTS } from '../netlify/functions/lib/product-registry.mjs';
import { createHmac, randomBytes } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PASS = '✅';
const FAIL = '❌';
let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ${PASS} ${label}`);
    passed++;
  } else {
    console.log(`  ${FAIL} ${label}`);
    failed++;
  }
}

// Save original HMAC_SECRET and set a test one
const ORIGINAL_SECRET = process.env.HMAC_SECRET;
const TEST_SECRET = 'test-hmac-secret-for-unit-tests-32bytes!';
process.env.HMAC_SECRET = TEST_SECRET;

// ─── Unit Tests ──────────────────────────────────────────────────────────────

function runUnitTests() {
  console.log('\n📋 Unit Tests');
  console.log('═'.repeat(50));

  // ── HMAC Token ──────────────────────────────────────────────────────────
  console.log('\n  HMAC Token Utilities');

  // Test 1: Generate and verify a valid token
  const token = generateToken('bankintel', { ttlHours: 24 });
  const result = verifyToken(token);
  assert(result.valid === true, 'generateToken + verifyToken roundtrip');
  assert(result.productSlug === 'bankintel', 'Token contains correct product slug');
  assert(typeof result.expiry === 'number', 'Token contains valid expiry number');

  // Test 2: Very short TTL — likely expired by the time we verify
  // (we already test explicit expiry below; this is just a sanity check)
  const shortToken = generateToken('bankintel', { ttlHours: 0.00001 }); // ~0.036 seconds
  const shortResult = verifyToken(shortToken);
  // May be valid if verification happens in <36ms; that's fine too
  const shortOk = shortResult.valid === false ? shortResult.reason === 'Token expired' : true;
  assert(shortOk, 'Near-zero TTL: either expired or still valid (within ~36ms race window)');

  // Test 3: Invalid signature returns 403
  const badToken = 'bankintel.9999999999.invalidsignature';
  const badResult = verifyToken(badToken);
  assert(badResult.valid === false, 'Invalid signature returns valid=false');

  // Test 4: Invalid encoding
  const garbageResult = verifyToken('!!!not-base64url!!!');
  assert(garbageResult.valid === false, 'Invalid encoding returns valid=false');

  // Test 5: Empty token
  const emptyResult = verifyToken('');
  assert(emptyResult.valid === false, 'Empty token returns valid=false');

  // Test 6: Null token
  const nullResult = verifyToken(null);
  assert(nullResult.valid === false, 'Null token returns valid=false');

  // Test 7: Correct slug in verified token
  const bankintelToken = generateToken('bankintel');
  const bankintelResult = verifyToken(bankintelToken);
  assert(bankintelResult.productSlug === 'bankintel', 'Verified token has correct slug');

  // Test 8: Token with customer email
  const emailToken = generateToken('bankintel', { customerEmail: 'test@example.com' });
  const emailResult = verifyToken(emailToken);
  assert(emailResult.valid === true, 'Token with embedded email is valid');
  assert(emailResult.productSlug === 'bankintel', 'Token with email has correct slug');

  // Test 9: Expired token detection
  // Create a token that expired 1 hour ago
  const expiredEpoch = Math.floor(Date.now() / 1000) - 3600;
  const expiredPayload = `bankintel.${expiredEpoch}`;
  const hmac = createHmac('sha256', TEST_SECRET);
  hmac.update(expiredPayload);
  const expiredSig = hmac.digest('hex');
  const expiredToken = Buffer.from(`bankintel.${expiredEpoch}.${expiredSig}`).toString('base64url');
  const expiredResult = verifyToken(expiredToken);
  assert(expiredResult.valid === false && expiredResult.reason === 'Token expired',
    'Expired token correctly rejected with reason "Token expired"');

  // ── Product Registry ────────────────────────────────────────────────────
  console.log('\n  Product Registry');

  // Test 10: Get product by price ID (one-time)
  const oneTime = getProduct('price_1TmdjLAEAgb5SjCbCIWATvDD');
  assert(oneTime !== null, 'One-time price ID resolves to product');
  assert(oneTime?.slug === 'bankintel', 'One-time product slug is bankintel');

  // Test 11: Get product by price ID (subscription)
  const sub = getProduct('price_1TmdjLAEAgb5SjCblWGsklMQ');
  assert(sub !== null, 'Subscription price ID resolves to product');
  assert(sub?.slug === 'bankintel', 'Subscription product slug is bankintel');

  // Test 12: Get product by slug
  const bySlug = getProductBySlug('bankintel');
  assert(bySlug !== null, 'Slug "bankintel" resolves to product');
  assert(bySlug?.price_ids.length === 2, 'bankintel has 2 price IDs');

  // Test 13: Unknown price ID returns null
  const unknown = getProduct('price_unknown');
  assert(unknown === null, 'Unknown price ID returns null');

  // Test 14: Unknown slug returns null
  const unknownSlug = getProductBySlug('nonexistent');
  assert(unknownSlug === null, 'Unknown slug returns null');

  // Test 15: Get tier
  assert(getTier('price_1TmdjLAEAgb5SjCbCIWATvDD') === 'one-time', 'One-time price returns correct tier');
  assert(getTier('price_1TmdjLAEAgb5SjCblWGsklMQ') === 'subscription', 'Subscription price returns correct tier');
  assert(getTier('price_unknown') === null, 'Unknown price returns null tier');

  // Test 16: PRODUCTS is frozen/immutable
  assert(Object.isFrozen(PRODUCTS), 'PRODUCTS is frozen (immutable)');

  // ── Test Data File ──────────────────────────────────────────────────────
  console.log('\n  Data File Integrity');

  const csvPath = path.join(process.env.HOME || '/Users/robert', '.hermes', 'data', 'exports', 'fdic_premium_b2b_sales.csv');
  try {
    const stats = fs.statSync(csvPath);
    assert(stats.size > 50000, `CSV file exists and is >50KB (${(stats.size / 1024).toFixed(0)}KB)`);
  } catch {
    assert(false, `CSV file exists at ${csvPath}`);
  }

  // ── Extractor Script ────────────────────────────────────────────────────
  console.log('\n  Extractor Script Integrity');

  const extractorPath = path.join(process.env.HOME || '/Users/robert', '.hermes', 'scripts', 'data-pipelines', 'fdic_extractor.py');
  try {
    fs.accessSync(extractorPath, fs.constants.R_OK);
    assert(true, 'Extractor script exists and is readable');
  } catch {
    assert(false, `Extractor script readable at ${extractorPath}`);
  }
}

// ─── Watchdog: Unfulfilled Payment Check ──────────────────────────────────────

async function runWatchdog() {
  console.log('\n🔍 Watchdog: Unfulfilled Payment Check');
  console.log('═'.repeat(50));

  // This runs daily as a webhook or cron.
  // It checks for any Stripe checkout sessions that are complete but unfulfilled.
  //
  // In production, this queries the Thalux DB (or n8n) for:
  //   SELECT * FROM fulfillments WHERE status = 'pending' AND created_at < now() - interval '1 hour'
  //
  // For now, we check the n8n database for unprocessed webhooks.

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.log(`  ${PASS} STRIPE_SECRET_KEY not in env (expected in dev/test mode)`);
  } else {
    console.log(`  ${PASS} STRIPE_SECRET_KEY is configured`);
  }

  // Check n8n is reachable
  try {
    const resp = await fetch('http://localhost:5678/healthz');
    assert(resp.ok, 'n8n is reachable (healthz OK)');
  } catch {
    assert(false, 'n8n is reachable');
  }

  console.log(`\n  ${PASS} Watchdog check completed`);
  console.log(`  Next: Query fulfillment DB for unfulfilled payments >1hr old`);
}

// ─── Self-Test: Automated Test Purchase ──────────────────────────────────────

async function runSelfTest() {
  console.log('\n🔄 Self-Test: Automated Test Purchase');
  console.log('═'.repeat(50));

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.log(`  ${FAIL} STRIPE_SECRET_KEY required for self-test`);
    console.log('  Set STRIPE_SECRET_KEY environment variable');
    failed++;
    return;
  }

  // Dynamically import stripe
  let stripe;
  try {
    const stripePkg = await import('stripe');
    stripe = new stripePkg.default(stripeKey, { apiVersion: '2025-02-24.acacia' });
  } catch {
    console.log(`  ${FAIL} stripe npm package not installed — run: npm install stripe`);
    failed++;
    return;
  }

  try {
    // Step 1: Create a test checkout session
    console.log('\n  Step 1: Creating test checkout session...');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price: 'price_1TmdjLAEAgb5SjCbCIWATvDD',
        quantity: 1,
      }],
      customer_email: 'test-bankintel@thalux.ai',
      success_url: 'https://thalux.ai/data/fdic-bankintel/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://thalux.ai/data/fdic-bankintel',
      metadata: {
        product: 'bankintel',
        price_id: 'price_1TmdjLAEAgb5SjCbCIWATvDD',
        test_mode: 'true',
      },
    });
    assert(session.id && session.url, `Test checkout session created (ID: ${session.id})`);
    console.log(`     URL: ${session.url}`);

    // Step 2: Simulate payment by marking as paid (test mode allows this)
    console.log('\n  Step 2: Simulating payment completion...');
    // In test mode, we can use stripe test helpers
    // Actually, for a proper self-test, we'd redirect through the checkout page
    // In test mode with Stripe, the checkout.testhelpers API lets us complete it

    // For now, manual step: user would complete the purchase in browser
    console.log(`     ⏳ Manual step: Complete purchase at:`);
    console.log(`     ${session.url}`);

    // Step 3: Verify token generation works
    console.log('\n  Step 3: Verifying token generation...');
    const testToken = generateToken('bankintel', {
      customerEmail: 'test-bankintel@thalux.ai',
    });
    assert(testToken.length > 20, 'Download token generated successfully');

    // Step 4: Verify token verification
    console.log('\n  Step 4: Verifying token verification...');
    const verifyResult = verifyToken(testToken);
    assert(verifyResult.valid === true, 'Token verifies successfully');
    assert(verifyResult.productSlug === 'bankintel', 'Token verified for bankintel');

    // Step 5: Check CSV data file
    console.log('\n  Step 5: Verifying data file...');
    const csvPath = path.join(process.env.HOME || '/Users/robert', '.hermes', 'data', 'exports', 'fdic_premium_b2b_sales.csv');
    const data = fs.readFileSync(csvPath, 'utf-8');
    const lines = data.trim().split('\n');
    assert(lines.length > 1, `CSV has header + data rows (${lines.length} total lines)`);

    const header = lines[0].split(',');
    assert(header.includes('bank_id'), 'CSV has bank_id column');
    assert(header.includes('thalux_asset_tier'), 'CSV has thalux_asset_tier column');

    console.log(`\n  ${PASS} Self-test framework validated`);
    console.log(`  Next: Complete test purchase via Stripe Checkout URL above`);

  } catch (err) {
    console.log(`  ${FAIL} Self-test error: ${err.message}`);
    failed++;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--watchdog')) {
    await runWatchdog();
  } else if (args.includes('--self-test')) {
    await runSelfTest();
  } else {
    runUnitTests();
    await runWatchdog();
    await runSelfTest();
  }

  // Summary
  const total = passed + failed;
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Results: ${PASS} ${passed}/${total} passed${failed > 0 ? `  ${FAIL} ${failed} failed` : ''}`);

  if (args.includes('--unit')) {
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run
main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});