/**
 * Stripe Product & Price Initializer — GovCon Velocity (Asset #4)
 * Run from within thalux-site project so stripe SDK resolves.
 * Usage: node scripts/stripe_initializer.mjs
 * Requires: STRIPE_SECRET_KEY in environment
 */
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('FATAL: STRIPE_SECRET_KEY not set');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });

const PRODUCTS = [
  {
    name: 'GovCon Velocity - Single NAICS',
    description: 'Weekly NAICS-segmented CSV drop-feed of federal contract awards — one NAICS code tracked.',
    metadata: { product_slug: 'govcon-intel', tier: 'single', asset_id: 'ASSET-004' },
    price: 19900,
  },
  {
    name: 'GovCon Velocity - Multi NAICS',
    description: 'Weekly CSV drop-feed for up to 5 NAICS codes with full modification tracking and competitive intelligence.',
    metadata: { product_slug: 'govcon-intel', tier: 'multi', asset_id: 'ASSET-004' },
    price: 34900,
  },
  {
    name: 'GovCon Velocity - Enterprise',
    description: 'Unlimited NAICS codes, daily API access token, change-log tracking, and priority email support.',
    metadata: { product_slug: 'govcon-intel', tier: 'enterprise', asset_id: 'ASSET-004' },
    price: 49900,
  },
];

async function main() {
  console.log('=== Stripe Product & Price Initializer (LIVE) ===');
  console.log('');

  const results = [];

  for (const prod of PRODUCTS) {
    console.log(`Creating product: "${prod.name}"...`);

    const product = await stripe.products.create({
      name: prod.name,
      description: prod.description,
      metadata: prod.metadata,
      active: true,
    });
    console.log(`  → Product ID: ${product.id}`);

    console.log(`  Creating monthly price: $${(prod.price / 100).toFixed(2)}/mo...`);
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: prod.price,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: prod.metadata.tier, product_slug: prod.metadata.product_slug },
    });
    console.log(`  → Price ID: ${price.id}`);
    console.log('');

    results.push({
      product_name: prod.name,
      product_id: product.id,
      price_id: price.id,
      tier: prod.metadata.tier,
      slug: prod.metadata.product_slug,
      amount: prod.price,
    });
  }

  console.log('=== RESULTS (copy into create-checkout.mjs PRODUCT_MAP) ===');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
