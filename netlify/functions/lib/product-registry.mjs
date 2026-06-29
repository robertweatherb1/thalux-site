/**
 * BankIntel — Product Registry
 * =============================
 * Maps Stripe price IDs → product config.
 * Add a new product by appending to PRODUCTS and (if needed) its email template.
 *
 * Usage:
 *   import { getProduct, getProductBySlug, PRODUCTS } from './lib/product-registry.mjs';
 */

// ─── Product Config ───────────────────────────────────────────────────────────
// Each product maps one or more price_ids to a delivery config.
// price_id is the Stripe Price ID (found in Stripe Dashboard > Products > [Product] > Pricing).
// tier: 'one-time' (Tier A) or 'subscription' (Tier B)

const PRODUCTS = Object.freeze([
  {
    slug: 'bankintel',
    display_name: 'FDIC Premium B2B Sales Dataset',
    description: '4,185-row enriched FDIC institution database with asset tier classifications.',
    price_ids: [
      'price_1TmdjLAEAgb5SjCbCIWATvDD',  // $49 one-time
      'price_1TmdjLAEAgb5SjCblWGsklMQ',  // $99/mo subscription
    ],
    csv_path: 'exports/fdic_premium_b2b_sales.csv',
    extractor_script: 'scripts/data-pipelines/fdic_extractor.py',
    email_template: 'email_bankintel_download',
    tier_map: {
      'price_1TmdjLAEAgb5SjCbCIWATvDD': 'one-time',
      'price_1TmdjLAEAgb5SjCblWGsklMQ': 'subscription',
    },
  },
]);

// ─── Lookup Functions ─────────────────────────────────────────────────────────

/**
 * Look up a product config by Stripe Price ID.
 * Returns the product object or null.
 */
function getProduct(priceId) {
  if (!priceId) return null;
  return PRODUCTS.find(p => p.price_ids.includes(priceId)) || null;
}

/**
 * Look up a product config by slug (e.g. 'bankintel').
 * Returns the product object or null.
 */
function getProductBySlug(slug) {
  if (!slug) return null;
  return PRODUCTS.find(p => p.slug === slug) || null;
}

/**
 * Get the tier for a given price_id.
 * Returns 'one-time', 'subscription', or null.
 */
function getTier(priceId) {
  if (!priceId) return null;
  for (const p of PRODUCTS) {
    if (p.tier_map[priceId]) return p.tier_map[priceId];
  }
  return null;
}

/**
 * Get all subscription price IDs across all products.
 * Useful for identifying recurring billing events.
 */
function getSubscriptionPriceIds() {
  const ids = [];
  for (const p of PRODUCTS) {
    for (const [priceId, tier] of Object.entries(p.tier_map)) {
      if (tier === 'subscription') ids.push(priceId);
    }
  }
  return ids;
}

export {
  PRODUCTS,
  getProduct,
  getProductBySlug,
  getTier,
  getSubscriptionPriceIds,
};