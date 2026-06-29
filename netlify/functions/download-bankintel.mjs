/**
 * BankIntel — Gated Download Endpoint
 * =====================================
 * Netlify Function: /.netlify/functions/download-bankintel
 * or via redirect: /api/download/bankintel
 *
 * Validates HMAC-signed one-time token, streams CSV from Netlify Blobs.
 * Returns 403 on expired/invalid tokens, 404 on unknown products.
 */

import { verifyToken } from './lib/hmac-token.mjs';
import { getProductBySlug } from './lib/product-registry.mjs';

// Netlify Blob store — use Netlify Blobs for non-public storage
// Docs: https://docs.netlify.com/blobs/overview/
let blobStore;

async function getBlobStore() {
  if (blobStore) return blobStore;
  try {
    const { getStore } = await import('@netlify/blobs');
    blobStore = getStore('thalux-data-products');
    return blobStore;
  } catch {
    // Fallback: read from local filesystem (dev mode)
    return null;
  }
}

/**
 * Stream a CSV file from Netlify Blobs.
 */
async function streamCsvFromBlobs(slug, response) {
  const store = await getBlobStore();

  if (store) {
    // Netlify Blobs — production
    const blob = await store.get(slug, { type: 'stream' });
    if (!blob) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Product file not found' }) };
    }
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="${slug}.csv"`);
    response.setHeader('Cache-Control', 'no-store');
    // Pipe blob stream to response
    await blob.pipe(response);
    // Signal to caller that we handled it
    return { streamed: true };
  }

  // Fallback: local filesystem (development)
  const fs = await import('node:fs');
  const path = await import('node:path');
  const csvPath = path.join(
    process.env.HOME || '/Users/robert',
    '.hermes', 'data', 'exports', `fdic_premium_b2b_sales.csv`
  );

  try {
    const stat = fs.statSync(csvPath);
    const readStream = fs.createReadStream(csvPath);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="${slug}.csv"`);
    response.setHeader('Content-Length', stat.size);
    response.setHeader('Cache-Control', 'no-store');
    readStream.pipe(response);
    return { streamed: true };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Data file not available' }) };
  }
}

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Extract product slug from path: /api/download/{slug}
  const pathParts = event.path.split('/').filter(Boolean);
  // Path could be: api/download/bankintel or .netlify/functions/download-bankintel
  // Try slug from query param first
  let slug = event.queryStringParameters?.product;
  if (!slug) {
    // Try from path: .../download/bankintel?token=...
    const idx = pathParts.indexOf('download');
    if (idx >= 0 && idx + 1 < pathParts.length) {
      slug = pathParts[idx + 1];
    }
  }

  // Also check if the function name gives us the slug
  if (!slug && pathParts.length > 0) {
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart.startsWith('download-')) {
      slug = lastPart.replace('download-', '');
    }
  }

  if (!slug) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing product slug. Use /api/download/{product}?token=...' }),
    };
  }

  // Validate product exists
  const product = getProductBySlug(slug);
  if (!product) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Unknown product: ${slug}` }),
    };
  }

  // Get and verify token
  const token = event.queryStringParameters?.token;
  const result = verifyToken(token);

  if (!result.valid) {
    const statusCode = result.reason === 'Token expired' ? 403 : 403;
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: 'Access denied',
        reason: result.reason || 'Invalid token',
      }),
    };
  }

  // Verify slug matches token
  if (result.productSlug !== slug) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Token/Product mismatch' }),
    };
  }

  // Stream the CSV
  // Netlify Functions v2 supports streaming response
  const response = {
    headers: {
      ...headers,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  };

  // For streaming, we need to use the Netlify v2 API with streaming
  // Since we're in a standard function, return a response that tells the client
  // We'll use a different approach — read the blob and return as base64 + content-type

  const store = await getBlobStore();

  if (store) {
    try {
      const blobData = await store.get(slug);
      if (!blobData) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'File not found in blob store' }) };
      }
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${slug}.csv"`,
          'Content-Language': 'en-US',
        },
        body: blobData,
        isBase64Encoded: false,
      };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error reading blob store' }) };
    }
  }

  // Fallback: local filesystem
  const fs = await import('node:fs');
  const path = await import('node:path');
  const csvPath = path.join(
    process.env.HOME || '/Users/robert',
    '.hermes', 'data', 'exports', `fdic_premium_b2b_sales.csv`
  );

  try {
    const data = fs.readFileSync(csvPath, 'utf-8');
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slug}.csv"`,
      },
      body: data,
    };
  } catch {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Data file not available' }) };
  }
};