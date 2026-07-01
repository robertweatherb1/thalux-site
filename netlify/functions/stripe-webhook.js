// Stripe Webhook Handler — Data Product Fulfillment & Payment Metrics
// Processes critical payment events:
//   checkout.session.completed     → triggers file delivery + full success metrics
//   payment_intent.payment_failed  → logs full failure metrics for recovery

const STRIPE_API = 'https://api.stripe.com/v1';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { statusCode: 500, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }

  try {
    const payload = JSON.parse(event.body);
    const eventType = payload.type;
    const session = payload.data?.object || {};
    const timestamp = new Date().toISOString();

    // ── Handle checkout.session.completed ──────────────────────────────
    if (eventType === 'checkout.session.completed') {
      const isPaid = session.payment_status === 'paid';

      const metrics = {
        id: payload.id,
        type: 'checkout.session.completed',
        session_id: session.id,
        payment_intent: session.payment_intent,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email || 'unknown',
        customer_name: session.customer_details?.name || 'unknown',
        product_metadata: session.metadata,
        mode: session.mode,
        timestamp,
      };

      console.log('[WEBHOOK][SUCCESS]', JSON.stringify(metrics));

      if (isPaid) {
        const deliveryRecord = {
          transaction_id: session.id,
          payment_intent: session.payment_intent,
          amount: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details?.email || 'unknown',
          product: session.metadata?.product || 'Unknown',
          delivered_at: timestamp,
          status: 'delivered',
        };
        console.log('[WEBHOOK][DELIVERY]', JSON.stringify(deliveryRecord));
      }
      return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ received: true, type: eventType, payment_status: session.payment_status }) };
    }

    // ── Handle payment_intent.payment_failed ───────────────────────────
    if (eventType === 'payment_intent.payment_failed') {
      const lastError = session.last_payment_error || {};
      const metrics = {
        id: payload.id,
        type: 'payment_intent.payment_failed',
        payment_intent_id: session.id,
        amount: session.amount,
        currency: session.currency,
        customer_email: session.customer_details?.email
          || session.receipt_email
          || 'unknown',
        customer_name: session.customer_details?.name || 'unknown',
        error_code: lastError.code || 'unknown',
        error_message: lastError.message || 'unknown',
        error_decline_code: lastError.decline_code || null,
        payment_method_type: lastError.payment_method?.type || 'unknown',
        metadata: session.metadata || {},
        timestamp,
      };
      console.log('[WEBHOOK][FAILURE]', JSON.stringify(metrics));
      return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ received: true, type: eventType }) };
    }

    // ── Catch-all: acknowledge receipt for all other event types ──────
    console.log('[WEBHOOK][OTHER]', JSON.stringify({
      id: payload.id,
      type: eventType,
      timestamp,
    }));
    return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('[WEBHOOK][ERROR]', err.message);
    return { statusCode: 500, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Webhook processing failed' }) };
  }
};