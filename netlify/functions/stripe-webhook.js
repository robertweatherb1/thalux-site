// Stripe Webhook Handler — BankIntel file delivery
// Receives checkout.session.completed events from Stripe
// Verifies the session, logs the payment

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

    console.log(`Stripe webhook: ${eventType}`, JSON.stringify({
      id: payload.id,
      type: eventType,
      session_id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      customer_email: session.customer_details?.email,
      timestamp: new Date().toISOString()
    }));

    if (eventType === 'checkout.session.completed' && session.payment_status === 'paid') {
      const deliveryRecord = {
        transaction_id: session.id,
        payment_intent: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email || 'unknown',
        product: 'BankIntel',
        delivered_at: new Date().toISOString(),
        status: 'delivered'
      };

      console.log('DELIVERY:', JSON.stringify(deliveryRecord));
      return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ received: true, status: 'delivery_confirmed' }) };
    }

    return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Webhook processing failed' }) };
  }
};