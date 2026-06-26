// Netlify Function: Admin Invoices Dashboard
// Password-protected view of all Stripe invoices
// Access: /admin/invoices?token=your-admin-token

const STRIPE_API = 'https://api.stripe.com/v1';
const SITE_URL = process.env.URL || 'https://thalux.ai';

const HTML_HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thalux AI — Admin: Invoices</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #F5F4F0; color: #2D2D2D; }
    .container { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
    header { background: white; border-bottom: 1px solid #DED8D0; padding: 1rem 0; }
    header .container { display: flex; align-items: center; justify-content: space-between; padding-top: 0; padding-bottom: 0; }
    .logo { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 1.25rem; }
    .logo span { color: #E5B73C; }
    .nav-links { display: flex; gap: 1.5rem; font-size: 0.875rem; }
    .nav-links a { color: #2D2D2D; text-decoration: none; }
    .nav-links a:hover { color: #E5B73C; }
    h1 { font-family: 'Manrope', sans-serif; font-size: 1.5rem; margin: 2rem 0 1rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: white; border-radius: 8px; padding: 1.25rem; border: 1px solid #DED8D0; }
    .stat-card .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
    .stat-card .value { font-family: 'Manrope', sans-serif; font-size: 1.75rem; font-weight: 800; margin-top: 0.25rem; }
    .stat-card .value.gold { color: #E5B73C; }
    table { width: 100%; background: white; border-radius: 8px; border: 1px solid #DED8D0; border-collapse: collapse; overflow: hidden; }
    th { background: #2D2D2D; color: white; padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    td { padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid #F0EDE8; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #FAF9F7; }
    .badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .badge.open { background: #E8F5E9; color: #2E7D32; }
    .badge.paid { background: #E3F2FD; color: #1565C0; }
    .badge.draft { background: #FFF3E0; color: #E65100; }
    .badge.void { background: #FBE9E7; color: #BF360C; }
    .badge.uncollectible { background: #F3E5F5; color: #7B1FA2; }
    a { color: #E5B73C; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .empty { text-align: center; padding: 3rem; color: #999; }
    .login-form { max-width: 400px; margin: 4rem auto; background: white; padding: 2.5rem; border-radius: 12px; border: 1px solid #DED8D0; text-align: center; }
    .login-form h2 { font-family: 'Manrope', sans-serif; font-size: 1.25rem; margin-bottom: 0.5rem; }
    .login-form p { color: #666; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .login-form input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #DED8D0; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
    .login-form button { width: 100%; padding: 0.75rem; background: #E5B73C; color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 0.875rem; cursor: pointer; }
    .login-form button:hover { background: #CDA333; }
    .error { background: #FBE9E7; color: #BF360C; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
  </style>
</head>
<body>`;

const HTML_FOOT = `<footer style="border-top:1px solid #DED8D0;margin-top:3rem;padding:1.5rem 0;text-align:center;font-size:0.75rem;color:#999;">
  Thalux AI — Admin Dashboard &middot; Data from Stripe
</footer></body></html>`;

exports.handler = async (event, context) => {
  const adminToken = process.env.ADMIN_TOKEN;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!adminToken || !stripeKey) {
    return { statusCode: 500, body: 'Server misconfigured — missing ADMIN_TOKEN or STRIPE_SECRET_KEY' };
  }

  // Parse query params
  const params = event.queryStringParameters || {};
  const token = params.token || '';
  const error = params.error || '';

  // If no valid token, show login
  if (token !== adminToken) {
    const errMsg = error === '1' ? 'Invalid token. Please try again.' : '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `${HTML_HEAD}
<div class="container">
  <div class="login-form">
    <div class="logo" style="margin-bottom:1.5rem">Thalux<span> AI</span></div>
    <h2>Admin Access</h2>
    <p>Enter your admin token to view invoices.</p>
    ${errMsg ? `<div class="error">${errMsg}</div>` : ''}
    <form method="GET" action="/admin/invoices">
      <input type="password" name="token" placeholder="Admin Token" required>
      <button type="submit">Access Dashboard</button>
    </form>
  </div>
</div>
${HTML_FOOT}`,
    };
  }

  // Valid token — fetch invoices from Stripe
  try {
    const response = await fetch(`${STRIPE_API}/invoices?limit=50`, {
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.status}`);
    }

    const data = await response.json();
    const invoices = data.data || [];

    // Also get customers for reference
    const custResp = await fetch(`${STRIPE_API}/customers?limit=100`, {
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    });
    const custData = await custResp.json();
    const customers = custData.data || [];

    // Compute stats
    const totalOutstanding = invoices
      .filter(i => i.status === 'open')
      .reduce((sum, i) => sum + i.total, 0);

    const totalPaid = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);

    const openCount = invoices.filter(i => i.status === 'open').length;
    const paidCount = invoices.filter(i => i.status === 'paid').length;

    // Build customer lookup from the customers fetch
    const custMap = {};
    customers.forEach(c => { custMap[c.id] = c; });

    function formatDate(ts) {
      if (!ts) return '—';
      return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatMoney(cents) {
      return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    function statusBadge(status) {
      return `<span class="badge ${status}">${status}</span>`;
    }

    const rows = invoices.map(inv => {
      // customer comes as a string ID unless expanded; look up from custMap
      const customerId = typeof inv.customer === 'string' ? inv.customer : (inv.customer?.id || null);
      const customer = customerId ? (custMap[customerId] || null) : null;
      const custName = customer ? customer.name || customer.email || '—' : '—';
      const link = inv.hosted_invoice_url ? `<a href="${inv.hosted_invoice_url}" target="_blank">View</a>` : '—';
      const pdf = inv.invoice_pdf ? `<a href="${inv.invoice_pdf}" target="_blank">PDF</a>` : '';
      return `<tr>
        <td><strong>${inv.number || '—'}</strong></td>
        <td>${formatDate(inv.created)}</td>
        <td>${custName}</td>
        <td>${formatMoney(inv.total)}</td>
        <td>${statusBadge(inv.status)}</td>
        <td>${formatDate(inv.due_date)}</td>
        <td>${link} ${pdf}</td>
      </tr>`;
    }).join('\n');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `${HTML_HEAD}
<header>
  <div class="container">
    <div class="logo">Thalux<span> AI</span></div>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/portal">Client Portal</a>
      <a href="/admin/invoices?token=${adminToken}" style="font-weight:600">Invoices</a>
    </div>
  </div>
</header>
<div class="container">
  <h1>Invoices</h1>
  <div class="stats">
    <div class="stat-card">
      <div class="label">Outstanding</div>
      <div class="value gold">${formatMoney(totalOutstanding)}</div>
    </div>
    <div class="stat-card">
      <div class="label">Collected</div>
      <div class="value">${formatMoney(totalPaid)}</div>
    </div>
    <div class="stat-card">
      <div class="label">Open</div>
      <div class="value">${openCount}</div>
    </div>
    <div class="stat-card">
      <div class="label">Paid</div>
      <div class="value">${paidCount}</div>
    </div>
    <div class="stat-card">
      <div class="label">Clients</div>
      <div class="value">${customers.length}</div>
    </div>
  </div>
  ${invoices.length === 0 ? '<div class="empty">No invoices found.</div>' : `
  <table>
    <thead>
      <tr>
        <th>Invoice</th>
        <th>Date</th>
        <th>Client</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Due</th>
        <th>Links</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  `}
</div>
${HTML_FOOT}`,
    };
  } catch (err) {
    console.error('Admin invoices error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `${HTML_HEAD}<div class="container"><h1>Error</h1><p>${err.message}</p></div>${HTML_FOOT}`,
    };
  }
};