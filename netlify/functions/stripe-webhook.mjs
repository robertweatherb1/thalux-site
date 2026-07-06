/**
 * BankIntel — Stripe Webhook Handler
 * ====================================
 * Netlify Function: /.netlify/functions/stripe-webhook
 *
 * Handles:
 *   - checkout.session.completed (one-time purchases + subscription first payment)
 *   - invoice.paid (recurring subscription renewals)
 *
 * Flow:
 *   1. Verify Stripe webhook signature
 *   2. Extract price_id → look up product in registry
 *   3. Generate HMAC-signed download token (24h expiry)
 *   4. Construct email with download link
 *   5. Send email via n8n webhook (or direct SendGrid/Mailgun)
 *   6. Log fulfillment to Thalux DB (or n8n)
 */

import { getProduct, getTier } from './lib/product-registry.mjs';
import { generateToken } from './lib/hmac-token.mjs';

// ─── Config ───────────────────────────────────────────────────────────────────
// Stripe webhook secret from Stripe Dashboard > Webhooks
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
// Base URL for download links (Netlify production or local dev)
const SITE_URL = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888';
// n8n webhook URL for fulfillment email sending
const N8N_FULFILLMENT_WEBHOOK = process.env.N8N_FULFILLMENT_WEBHOOK || 'http://localhost:5678/webhook/bankintel-fulfillment';
// Mission Control base URL (for pipeline advancement)
const MC_BASE_URL = process.env.MC_BASE_URL || 'http://localhost:8001';
// Shared secret for auth between webhook and MC pipeline/advance endpoint
const PIPELINE_WEBHOOK_SECRET = process.env.PIPELINE_WEBHOOK_SECRET || '';

// ─── Stripe Signature Verification ────────────────────────────────────────────

/**
 * Verify Stripe webhook signature.
 * Returns the parsed event payload, or throws on invalid signature.
 */
async function verifyStripeSignature(body, signature) {
  if (!STRIPE_WEBHOOK_SECRET) {
    // Dev mode: skip verification if no secret configured
    return JSON.parse(body);
  }

  const { default: Stripe } = await import('stripe');
  const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });

  try {
    const event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (err) {
    throw new Error(`Stripe signature verification failed: ${err.message}`);
  }
}

// ─── Email Template ───────────────────────────────────────────────────────────

function buildDownloadEmail(product, tier, downloadUrl, customerEmail) {
  const productName = product.display_name;
  const isSubscription = tier === 'subscription';
  const validityMsg = isSubscription
    ? 'Your subscription includes monthly updates. You will receive a new download link each month when the data refreshes.'
    : 'This link expires in 24 hours.';

  return {
    to: customerEmail,
    subject: `Your ${productName} Download — Thalux AI`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0a; color: #e5e7eb; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #1a1a1a; border-radius: 16px; padding: 40px; border: 1px solid #333; }
          .logo { font-size: 24px; font-weight: 700; color: #f59e0b; margin-bottom: 24px; }
          h1 { font-size: 22px; font-weight: 700; margin-bottom: 16px; color: #fff; }
          p { line-height: 1.6; margin-bottom: 16px; color: #9ca3af; }
          .btn { display: inline-block; padding: 14px 28px; background: #f59e0b; color: #000; text-decoration: none;
                  border-radius: 10px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .btn:hover { background: #d4a833; }
          .meta { font-size: 12px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #333; }
          .expiry { color: #ef4444; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Thalux<span style="color:#fff;">AI</span></div>
          <h1>Your download is ready</h1>
          <p>Thank you for purchasing <strong>${productName}</strong>.</p>
          <p>Click the button below to download your CSV file:</p>
          <a href="${downloadUrl}" class="btn">⬇ Download CSV</a>
          <p class="expiry">⏰ ${validityMsg}</p>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; font-size: 13px; color: #6b7280;">${downloadUrl}</p>
          <div class="meta">
            Thalux AI &middot; Your Tradeshop Runs on You. We Run the Rest.<br>
            Questions? Reply to this email or contact support@thalux.ai
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// ─── Pipeline Advance ────────────────────────────────────────────────────────

/**
 * Call Mission Control's pipeline/advance endpoint when a checkout
 * session has a pipeline_id in its metadata.
 */
async function advancePipeline(session) {
  const pipelineId = session.metadata?.pipeline_id;
  if (!pipelineId) return null; // Not a pipeline-triggered checkout

  // Determine the target stage based on current payment event
  // signed → onboarding for first payment; further advances handled by pipeline_watcher
  const newStage = session.mode === 'subscription' ? 'onboarding' : 'active';

  try {
    const payload = {
      pipeline_id: parseInt(pipelineId, 10),
      new_stage: newStage,
      metadata: {
        stripe_session_id: session.id,
        payment_intent: session.payment_intent,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    };
    if (PIPELINE_WEBHOOK_SECRET) {
      payload.secret = PIPELINE_WEBHOOK_SECRET;
    }

    const resp = await fetch(`${MC_BASE_URL}/api/pipeline/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await resp.json();
    console.log(`[PIPELINE][ADVANCE] pipeline_id=${pipelineId} → ${newStage}: ${result.success ? 'ok' : 'failed'}`,
      result.success ? '' : ` error=${result.error}`);
    return result;
  } catch (err) {
    console.error(`[PIPELINE][ADVANCE] network error for pipeline_id=${pipelineId}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ─── n8n Fulfillment ──────────────────────────────────────────────────────────

/**
 * Send fulfillment details to n8n, which handles:
 *   - Sending the email via Gmail/SMTP
 *   - Logging to Thalux DB
 *   - Tracking fulfillment status
 */
async function triggerN8nFulfillment(payload) {
  try {
    const response = await fetch(N8N_FULFILLMENT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(`n8n fulfillment returned ${response.status}: ${await response.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`n8n fulfillment error: ${err.message}`);
    return false;
  }
}

// ─── Webhook Handler ──────────────────────────────────────────────────────────

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Verify Stripe signature
    const signature = event.headers['stripe-signature'];
    const eventPayload = await verifyStripeSignature(event.body, signature);
    const eventType = eventPayload.type;
    const data = eventPayload.data.object;

    console.log(`Processing Stripe event: ${eventType} (id: ${eventPayload.id})`);

    // ── handle checkout.session.completed ─────────────────────────────────────
    if (eventType === 'checkout.session.completed') {
      const session = data;
      const customerEmail = session.customer_details?.email;
      const lineItems = session.line_items?.data || [];

      // If line_items not expanded, we may need to fetch them
      // For now, check the session's metadata or payment link
      let priceId = null;

      if (session.metadata?.price_id) {
        priceId = session.metadata.price_id;
      } else if (lineItems.length > 0) {
        priceId = lineItems[0].price?.id;
      } else if (session.mode === 'payment' && session.metadata?.product) {
        // Fallback: lookup by product name
        const product = getProduct(session.metadata.product);
        if (product) priceId = product.price_ids[0];
      }

      // For direct payment links (buy.stripe.com), metadata may not be set
      // In that case, we need to fetch the line items from Stripe API
      if (!priceId && session.id) {
        try {
          const stripePkg = await import('stripe');
          const stripeClient = stripePkg.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-02-24.acacia',
          });
          const expandedSession = await stripeClient.checkout.sessions.retrieve(session.id, {
            expand: ['line_items.data.price'],
          });
          const items = expandedSession.line_items?.data || [];
          if (items.length > 0) {
            priceId = items[0].price?.id;
          }
        } catch (err) {
          console.error(`Failed to expand session: ${err.message}`);
        }
      }

      if (!priceId) {
        console.warn(`No price_id found for session ${session.id}`);
        return { statusCode: 200, headers, body: JSON.stringify({ received: true, warning: 'No price_id' }) };
      }

      const product = getProduct(priceId);
      if (!product) {
        console.warn(`Unknown price_id: ${priceId}`);
        return { statusCode: 200, headers, body: JSON.stringify({ received: true, warning: 'Unknown product' }) };
      }

      const tier = getTier(priceId);
      const customerId = session.customer || session.customer_email;

      // Generate download token
      const token = generateToken(product.slug, {
        ttlHours: 24,
        customerEmail: customerEmail,
      });
      const downloadUrl = `${SITE_URL}/api/download/${product.slug}?token=${token}`;

      // Build and send fulfillment
      const payload = {
        event: eventType,
        stripeEventId: eventPayload.id,
        sessionId: session.id,
        customerId,
        customerEmail,
        priceId,
        productSlug: product.slug,
        productName: product.display_name,
        tier,
        downloadUrl,
        token,
        tokenExpiry: Math.floor(Date.now() / 1000) + (24 * 3600),
        timestamp: new Date().toISOString(),
      };

      // Send email via n8n
      const fulfilled = await triggerN8nFulfillment(payload);

      console.log(
        `Fulfillment for ${product.slug} (${tier}): customer=${customerEmail}, ` +
        `token=..., download_url=${downloadUrl.slice(0, 60)}..., fulfilled=${fulfilled}`
      );

      // Advance pipeline if this checkout has a pipeline_id in metadata
      const pipelineResult = await advancePipeline(session);
      if (pipelineResult) {
        console.log(`[PIPELINE] pipeline_id=${session.metadata.pipeline_id} advance result: ${pipelineResult.success}`);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ received: true, product: product.slug, tier, fulfilled }),
      };
    }

    // ── handle invoice.paid (subscription renewals) ──────────────────────────
    if (eventType === 'invoice.paid') {
      const invoice = data;

      // Only process subscription invoices (not one-time)
      if (invoice.billing_reason === 'subscription_create' ||
          invoice.billing_reason === 'subscription_cycle') {

        const customerEmail = invoice.customer_email || invoice.customer_name;
        const lines = invoice.lines?.data || [];
        let priceId = null;

        for (const line of lines) {
          if (line.price?.id && line.type === 'subscription') {
            priceId = line.price.id;
            break;
          }
        }

        if (!priceId) {
          console.warn(`No price_id in invoice.paid: ${invoice.id}`);
          return { statusCode: 200, headers, body: JSON.stringify({ received: true, warning: 'No price_id' }) };
        }

        const product = getProduct(priceId);
        if (!product) {
          console.warn(`Unknown price_id in invoice.paid: ${priceId}`);
          return { statusCode: 200, headers, body: JSON.stringify({ received: true, warning: 'Unknown product' }) };
        }

        const tier = getTier(priceId);
        if (tier !== 'subscription') {
          // One-time products shouldn't hit invoice.paid, but skip just in case
          return { statusCode: 200, headers, body: JSON.stringify({ received: true, info: 'Not a subscription' }) };
        }

        // Generate new download token for this renewal
        const token = generateToken(product.slug, {
          ttlHours: 24,
          customerEmail: customerEmail,
        });
        const downloadUrl = `${SITE_URL}/api/download/${product.slug}?token=${token}`;

        const payload = {
          event: eventType,
          stripeEventId: eventPayload.id,
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          customerId: invoice.customer,
          customerEmail,
          priceId,
          productSlug: product.slug,
          productName: product.display_name,
          tier,
          downloadUrl,
          token,
          tokenExpiry: Math.floor(Date.now() / 1000) + (24 * 3600),
          billingReason: invoice.billing_reason,
          timestamp: new Date().toISOString(),
          isRenewal: true,
        };

        const fulfilled = await triggerN8nFulfillment(payload);
        console.log(`Renewal fulfillment for ${product.slug}: customer=${customerEmail}, fulfilled=${fulfilled}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ received: true, product: product.slug, type: 'renewal', fulfilled }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ received: true, info: 'Non-subscription invoice, skipped' }),
      };
    }

    // ── handle invoice.payment_failed (renewal failures) ──────────────────────
    if (eventType === 'invoice.payment_failed') {
      const invoice = data;
      const customerEmail = invoice.customer_email || invoice.customer_name || 'unknown';
      const amountDue = invoice.amount_due || 0;
      const attemptCount = invoice.attempt_count || 1;
      const nextAttempt = invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000).toISOString()
        : 'none';

      console.log(
        `[PAYMENT FAILED] invoice=${invoice.id}, customer=${customerEmail}, ` +
        `amount_due=${amountDue/100}, attempt=${attemptCount}, next_attempt=${nextAttempt}`
      );

      // Log to Mission Control for pipeline awareness
      try {
        const mcUrl = process.env.MC_BASE_URL || 'http://localhost:8001';
        const secret = process.env.PIPELINE_WEBHOOK_SECRET || '';
        const payload = {
          event: 'invoice.payment_failed',
          invoice_id: invoice.id,
          subscription_id: invoice.subscription,
          customer_id: invoice.customer,
          customer_email: customerEmail,
          amount_due: amountDue,
          attempt_count: attemptCount,
          next_payment_attempt: invoice.next_payment_attempt,
          billing_reason: invoice.billing_reason,
        };
        await fetch(`${mcUrl}/api/pipeline/advance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': secret },
          body: JSON.stringify(payload),
        });
        console.log(`[PAYMENT FAILED] notified Mission Control`);
      } catch (mcErr) {
        console.error(`[PAYMENT FAILED] Failed to notify MC: ${mcErr.message}`);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ received: true, event: 'payment_failed', amount_due: amountDue }),
      };
    }

    // ── Unhandled event type ─────────────────────────────────────────────────
    console.log(`Unhandled event type: ${eventType}`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true, eventType }),
    };

  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return {
      statusCode: 401, // 401 for sig verification failure
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};