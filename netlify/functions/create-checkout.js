// Netlify Function: FDIC BankIntel Stripe Checkout Session
// Creates a Stripe Checkout session for $49 one-time or $99/mo subscription

const STRIPE_API = 'https://api.stripe.com/v1';
const SITE_URL = process.env.URL || 'https://thaluxai.netlify.app';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { statusCode: 500, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }

  try {
    const { price_id, customer_email } = JSON.parse(event.body);
    if (!price_id) return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing price_id' }) };

    const isSubscription = price_id.endsWith('sklMQ');
    const body = new URLSearchParams({
      mode: isSubscription ? 'subscription' : 'payment',
      'line_items[0][price]': price_id,
      'line_items[0][quantity]': '1',
      success_url: SITE_URL + '/data/fdic-bankintel/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: SITE_URL + '/data/fdic-bankintel',
    });
    if (customer_email) body.append('customer_email', customer_email);

    const response = await fetch(STRIPE_API + '/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + stripeKey, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Stripe error:', response.status, errText);
      return { statusCode: 502, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Stripe API error' }) };
    }

    const session = await response.json();
    return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ url: session.url, session_id: session.id }) };
  } catch (err) {
    console.error('Checkout error:', err);
    return { statusCode: 500, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Internal error' }) };
  }
};