// Netlify Function: Stripe Customer Portal Session Creator
// Creates a Stripe billing portal session and redirects the client to it
// Uses native fetch (Node 18+) — no Stripe npm package needed

const STRIPE_API = 'https://api.stripe.com/v1';
const SITE_URL = process.env.URL || 'https://thalux.ai';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

/**
 * POST /api/portal
 * Body: { customer_id: "cus_xxx" }
 * Response: 302 redirect to Stripe Customer Portal
 * 
 * GET /api/portal?customer_id=cus_xxx
 * Same result via query param
 */
exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Stripe not configured' }),
    };
  }

  try {
    // Extract customer_id from POST body or GET query params
    let customerId;
    if (event.httpMethod === 'POST' && event.body) {
      const body = JSON.parse(event.body);
      customerId = body.customer_id;
    } else if (event.httpMethod === 'GET') {
      customerId = event.queryStringParameters?.customer_id;
    }

    if (!customerId) {
      // No customer_id provided — render a page with a form
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'text/html' },
        body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Thalux AI — Client Portal</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: Inter, system-ui, sans-serif; background: #F5F4F0; color: #2D2D2D; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
  .card { background: white; border-radius: 12px; padding: 40px; max-width: 420px; width: 90%; box-shadow: 0 2px 12px rgba(0,0,0,0.06); text-align: center; }
  h1 { font-family: Manrope, sans-serif; font-size: 1.5rem; margin-bottom: 0.5rem; }
  p { color: #666; font-size: 0.875rem; line-height: 1.6; }
  .logo { font-family: Manrope, sans-serif; font-weight: 800; font-size: 1.25rem; margin-bottom: 1.5rem; }
  .logo span { color: #E5B73C; }
  .btn { display: inline-block; background: #E5B73C; color: white; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 0.875rem; text-decoration: none; margin-top: 1rem; }
  .btn:hover { background: #CDA333; }
  .contact { margin-top: 2rem; font-size: 0.75rem; color: #999; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">Thalux<span> AI</span></div>
  <h1>Client Billing Portal</h1>
  <p>Access your invoices, payment history, and account details. Enter the customer ID provided in your welcome email.</p>
  <form method="GET" action="/api/portal" style="margin-top:1.5rem">
    <input type="text" name="customer_id" placeholder="Your Customer ID" 
      style="width:100%;padding:10px 14px;border:1px solid #DED8D0;border-radius:6px;font-size:0.875rem;margin-bottom:1rem;box-sizing:border-box"
      required>
    <button type="submit" class="btn" style="border:none;cursor:pointer">Access Portal</button>
  </form>
  <div class="contact">
    Need help? Call (717) 537-0566 or email support@thalux.ai
  </div>
</div>
</body>
</html>`,
      };
    }

    // Create a Stripe billing portal session via REST API
    const body = new URLSearchParams({
      customer: customerId,
      return_url: `${SITE_URL}/portal`,
    });

    const response = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe API error:', response.status, error);
      return {
        statusCode: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Stripe API request failed',
          status: response.status,
        }),
      };
    }

    const session = await response.json();

    // Redirect to the Stripe-hosted portal
    return {
      statusCode: 302,
      headers: {
        Location: session.url,
        'Cache-Control': 'no-cache',
      },
      body: '',
    };
  } catch (err) {
    console.error('Portal function error:', err);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal error', detail: err.message }),
    };
  }
};