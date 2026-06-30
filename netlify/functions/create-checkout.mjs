/**
 * create-checkout — Data Product Checkout Handler
 * ================================================
 * Netlify Function: /.netlify/functions/create-checkout
 *
 * Accepts:
 *   GET  /api/create-checkout?product={slug}&tier={tier}  (legacy CTA links)
 *   POST /api/create-checkout  { product: "slug_tier" }   (JS checkout())
 *
 * Behaviors:
 *   1. Logs the incoming checkout intent (structured JSON)
 *   2. For products with active Stripe price IDs: creates real Checkout Session → redirect
 *   3. For smoke-test products (no price_ids yet): returns tracking confirmation JSON
 */

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const SITE_URL = (process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888').replace(/\/$/, '');

// ─── Product-to-Price Mapping ──────────────────────────────────────────────
// Products with active Stripe price IDs redirect through live Checkout Sessions.
// Products without price IDs return a tracking confirmation (smoke-test mode).
const PRODUCT_MAP = {
  'fdic_bankintel_one_time': { slug: 'fdic-bankintel', price: 'price_1TmdjLAEAgb5SjCbCIWATvDD', tier: 'one-time' },
  'fdic_bankintel_monthly':  { slug: 'fdic-bankintel', price: 'price_1TmdjLAEAgb5SjCblWGsklMQ', tier: 'monthly' },
  'foreclosure_intel_one_time':  { slug: 'foreclosure-intel', price: 'price_1To80QAEAgb5SjCbDvxVSner', tier: 'one-time' },
  'foreclosure_intel_monthly':   { slug: 'foreclosure-intel', price: 'price_1To80QAEAgb5SjCbSYuJMOBu', tier: 'monthly' },
  'osha_compliance_one_time':    { slug: 'osha-compliance',  price: 'price_1To80RAEAgb5SjCbH8yTFtek', tier: 'one-time' },
  'osha_compliance_monthly':     { slug: 'osha-compliance',  price: 'price_1To80RAEAgb5SjCb5kdYyl3v', tier: 'monthly' },
  'commercial_permits_one_time': { slug: 'commercial-permits', price: 'price_1To80RAEAgb5SjCbAK5nsUe9', tier: 'one-time' },
  'commercial_permits_monthly':  { slug: 'commercial-permits', price: 'price_1To80SAEAgb5SjCbd5uhBVjY', tier: 'monthly' },
};

// ─── Handler ───────────────────────────────────────────────────────────────

export const handler = async (event) => {
  const startTime = Date.now();

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  // ── Parse product key from request ────────────────────────────────────
  let productKey = '';

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      productKey = (body.product || '').trim();
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON body' });
    }
  } else if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    const product = (params.product || '').trim().toLowerCase();
    const tier = (params.tier || '').trim().toLowerCase();
    productKey = `${product.replace(/-/g, '_')}_${tier}`;
  } else {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const productInfo = PRODUCT_MAP[productKey];
  if (!productInfo) {
    return jsonResponse(400, {
      error: `Unknown product key: "${productKey}"`,
      valid_keys: Object.keys(PRODUCT_MAP),
    });
  }

  // ── Log the intent ────────────────────────────────────────────────────
  const intent = {
    event: 'checkout_intent',
    timestamp: new Date().toISOString(),
    product_key: productKey,
    product_slug: productInfo.slug,
    tier: productInfo.tier,
    price_display: productInfo.tier === 'one-time' ? '$49 one-time' : '$99/mo',
    mode: productInfo.price ? 'live' : 'smoke-test',
    user_agent: event.headers['user-agent'] || 'unknown',
    referer: event.headers['referer'] || 'direct',
    elapsed_ms: 0,
  };

  console.log('[CHECKOUT]', JSON.stringify(intent));

  // ── Route ─────────────────────────────────────────────────────────────
  // Scenario A: Live Stripe Checkout Session
  if (productInfo.price && STRIPE_KEY) {
    try {
      const stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': productInfo.tier === 'monthly' ? 'subscription' : 'payment',
          'line_items[0][price]': productInfo.price,
          'line_items[0][quantity]': '1',
          'success_url': `${SITE_URL}/data/${productInfo.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
          'cancel_url': `${SITE_URL}/data/${productInfo.slug}`,
          'metadata[product]': productInfo.slug,
          'metadata[tier]': productInfo.tier,
        }).toString(),
      });

      const session = await stripeResp.json();

      if (!stripeResp.ok || !session.url) {
        console.error('[CHECKOUT][STRIPE_ERROR]', JSON.stringify({ productKey, status: stripeResp.status, error: session }));
        return smokeResponse(intent, startTime, productInfo);
      }

      intent.elapsed_ms = Date.now() - startTime;
      console.log('[CHECKOUT][REDIRECT]', JSON.stringify({ ...intent, session_id: session.id }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        body: JSON.stringify({ url: session.url, session_id: session.id }),
      };
    } catch (err) {
      console.error('[CHECKOUT][ERROR]', JSON.stringify({ productKey, error: err.message }));
      return smokeResponse(intent, startTime, productInfo);
    }
  }

  // Scenario B: Smoke test — return tracking confirmation
  return smokeResponse(intent, startTime, productInfo);
};

// ── Helpers ────────────────────────────────────────────────────────────────

function smokeResponse(intent, startTime, info) {
  intent.elapsed_ms = Date.now() - startTime;
  console.log('[CHECKOUT][SMOKE]', JSON.stringify(intent));

  return jsonResponse(200, {
    status: 'tracked',
    message: `Checkout intent recorded for "${info.slug}" — ${info.tier === 'one-time' ? '$49' : '$99/mo'}`,
    intent: {
      product_slug: info.slug,
      tier: info.tier,
      timestamp: intent.timestamp,
      price_display: intent.price_display,
      mode: 'smoke-test',
    },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(status, data) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(data, null, 2),
  };
}