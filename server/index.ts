import express from 'express';
import path from 'node:path';
import cors from 'cors';
import crypto from 'node:crypto';
import { createUploadSignature } from './cloudinary.js';
import { login, getSession, requireUser, rewriteRequestCookieHeader, rewriteResponseCookie, type AuthedRequest } from './auth.js';
import { env } from './env.js';
import { query } from './db.js';

// Ensure paystack_transaction_reference column exists in the database
query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS paystack_transaction_reference text')
  .then(() => console.log('[DB Schema Check] paystack_transaction_reference column verified'))
  .catch(err => console.error('[DB Schema Check] failed to verify/create column:', err));

const app = express();
app.set('trust proxy', true);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.0.100:5173',
  env.clientOrigin
].filter(Boolean);

// 1. Auth Proxy — fetch-based so it works in both serverless (Vercel) and persistent (Render/local) runtimes.
// http-proxy-middleware relies on stream piping which breaks in serverless contexts.
app.use('/api/auth', async (req: express.Request, res: express.Response) => {
  const neonBase = env.neonAuthUrl?.split('/neondb')[0];
  if (!neonBase) {
    res.status(500).json({ error: 'VITE_NEON_AUTH_URL is not configured on the server.' });
    return;
  }

  // Build the target URL: /neondb/auth/<rest of path>
  const cleanPath = req.path === '/' ? '' : req.path.replace(/\/$/, '');
  const queryString = req.url.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '';
  const targetUrl = `${neonBase}/neondb/auth${cleanPath}${queryString}`;
  console.log(`[AUTH PROXY] ${req.method} ${req.path} -> ${targetUrl}`);

  // Build forwarded headers — strip hop-by-hop and confusing proxy headers
  const skipRequestHeaders = new Set(['host', 'connection', 'x-forwarded-host', 'x-forwarded-port', 'x-forwarded-proto', 'transfer-encoding']);
  const forwardHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string' && !skipRequestHeaders.has(key.toLowerCase())) {
      if (key.toLowerCase() === 'cookie') {
        forwardHeaders[key] = rewriteRequestCookieHeader(value) || '';
      } else {
        forwardHeaders[key] = value;
      }
    }
  }
  // Rewrite Origin to the Neon target so Better Auth CSRF check passes
  forwardHeaders['origin'] = neonBase;

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // express.json() hasn't run yet at this mount point, so we read the raw body
    body = await new Promise<string>((resolve, reject) => {
      let data = '';
      req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    if (body) {
      forwardHeaders['content-type'] = forwardHeaders['content-type'] || 'application/json';
      forwardHeaders['content-length'] = Buffer.byteLength(body).toString();
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body || undefined,
    });

    // Forward response status
    res.status(upstream.status);

    // Forward safe response headers
    const skipResponseHeaders = new Set(['transfer-encoding', 'connection', 'content-encoding', 'set-cookie']);
    upstream.headers.forEach((value: string, key: string) => {
      if (!skipResponseHeaders.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Rewrite Set-Cookie headers: strip Domain, ensure Secure is conditional on HTTPS, set SameSite=Lax
    const rawCookies: string[] = (upstream.headers as any).getSetCookie?.() ?? [];
    const host = req.headers.host || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.startsWith('192.168.') || host.startsWith('10.');
    const isSecure = !isLocalhost;
    
    console.log(`[AUTH PROXY] Incoming cookies: ${req.headers.cookie || 'None'}`);
    console.log(`[AUTH PROXY] Protocol detection - host: ${host}, isLocalhost: ${isLocalhost}, isSecure: ${isSecure}`);
    
    const rewrittenCookies: string[] = [];
    rawCookies.forEach((cookie: string) => {
      const rewritten = rewriteResponseCookie(cookie, isSecure);
      console.log(`[AUTH PROXY] Rewriting cookie: "${cookie}" -> "${rewritten}"`);
      rewrittenCookies.push(rewritten);
    });
    
    if (rewrittenCookies.length > 0) {
      res.setHeader('Set-Cookie', rewrittenCookies);
    }

    const responseBody = await upstream.text();
    res.send(responseBody);
  } catch (err) {
    console.error('[AUTH PROXY ERROR]', err);
    res.status(502).json({ error: 'Auth service unreachable. Check VITE_NEON_AUTH_URL.' });
  }
});

// 2. Other middleware
app.use(cors((req, callback) => {
  const origin = req.header('Origin');
  const host = req.get('host');
  
  // Determine if it is a same-origin request
  const isSameOrigin = origin && (
    origin === `http://${host}` ||
    origin === `https://${host}`
  );

  const allowed = !origin || 
    allowedOrigins.includes(origin) ||
    isSameOrigin ||
    origin.endsWith('.ngrok-free.app') ||
    origin.endsWith('.onrender.com') ||
    origin.endsWith('.vercel.app');

  callback(null, {
    origin: allowed,
  });
}));

app.post('/api/webhooks/paystack', express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response) => {
  const signature = req.headers['x-paystack-signature'] as string;
  const secret = env.paystackSecretKey || '';

  if (!signature) {
    res.status(400).send('Missing signature');
    return;
  }

  // Verify signature using crypto
  const hash = crypto
    .createHmac('sha512', secret)
    .update(req.body)
    .digest('hex');

  if (hash !== signature) {
    console.error('[PAYSTACK WEBHOOK] Signature verification failed');
    res.status(400).send('Invalid signature');
    return;
  }

  let payload: any;
  try {
    payload = JSON.parse(req.body.toString());
  } catch (err) {
    console.error('[PAYSTACK WEBHOOK] Failed to parse payload:', err);
    res.status(400).send('Invalid JSON');
    return;
  }

  const event = payload.event;
  const data = payload.data;
  console.log(`[PAYSTACK WEBHOOK] Received event: ${event}`);

  let storeId = data?.metadata?.store_id;

  try {
    if (!storeId) {
      const customerEmail = data?.customer?.email || data?.email;
      if (customerEmail) {
        const userRows = await query<{ id: string }>(
          'SELECT id FROM neon_auth.user WHERE email = $1',
          [customerEmail]
        );
        if (userRows.length > 0) {
          const userId = userRows[0].id;
          const storeRows = await query<{ id: string }>(
            `SELECT s.id
             FROM stores s
             JOIN store_admins sa ON sa.store_id = s.id
             WHERE sa.user_id = $1
             LIMIT 1`,
            [userId]
          );
          if (storeRows.length > 0) {
            storeId = storeRows[0].id;
            console.log(`[PAYSTACK WEBHOOK] Resolved storeId ${storeId} from customer email ${customerEmail}`);
          }
        }
      }
    }

    if (event === 'subscription.create' || event === 'subscription.enable') {
      const subCode = data.subscription_code;
      const custCode = data.customer?.customer_code;
      
      if (storeId) {
        console.log(`[PAYSTACK WEBHOOK] Activating subscription for store ${storeId}: subscription_code=${subCode}`);
        await query(
          `UPDATE stores 
           SET subscription_status = 'active',
               paystack_subscription_code = $1,
               paystack_customer_code = $2,
               trial_ends_at = NULL
           WHERE id = $3`,
          [subCode, custCode, storeId]
        );
      } else {
        console.warn('[PAYSTACK WEBHOOK] No store_id found in metadata or email lookup for subscription.create');
      }
    } 
    else if (event === 'charge.success') {
      const reference = data?.reference || null;
      if (storeId) {
        console.log(`[PAYSTACK WEBHOOK] Successful charge on store ${storeId}, reference: ${reference}`);
        await query(
          `UPDATE stores 
           SET subscription_status = 'active',
               paystack_transaction_reference = $1,
               trial_ends_at = NULL
           WHERE id = $2`,
          [reference, storeId]
        );
      } else {
        console.warn('[PAYSTACK WEBHOOK] No store_id found in metadata or email lookup for charge.success');
      }
    }
    else if (event === 'subscription.disable') {
      const subCode = data.subscription_code;
      console.log(`[PAYSTACK WEBHOOK] Disabling subscription: ${subCode}`);
      await query(
        `UPDATE stores 
         SET subscription_status = 'canceled'
         WHERE paystack_subscription_code = $1`,
        [subCode]
      );
    }
    else if (event === 'invoice.payment_failed') {
      const subCode = data.subscription?.subscription_code;
      console.log(`[PAYSTACK WEBHOOK] Subscription invoice payment failed: ${subCode}`);
      if (subCode) {
        await query(
          `UPDATE stores 
           SET subscription_status = 'past_due'
           WHERE paystack_subscription_code = $1`,
          [subCode]
        );
      }
    }
  } catch (err) {
    console.error('[PAYSTACK WEBHOOK ERROR]', err);
    res.status(500).send('Database update error');
    return;
  }

  res.status(200).send('Webhook handled successfully');
});

app.use(express.json({ limit: '1mb' }));

// Production: Serve static frontend files
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  // Handle SPA routing: middleware catch-all for non-API requests
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

async function getPublicStore(slug?: string) {
  if (!slug) return null;
  
  const rows = await query<any>(
    `SELECT * FROM stores WHERE slug = $1 AND active = true LIMIT 1`,
    [slug]
  );

  return rows[0] || null;
}

async function getAdminStore(userId: string) {
  const rows = await query<any>(
    `SELECT s.*
     FROM stores s
     JOIN store_admins sa ON sa.store_id = s.id
     WHERE sa.user_id = $1
     ORDER BY s.created_at ASC
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function requireAdminStore(req: AuthedRequest, res: express.Response, bypassSubscriptionCheck = false) {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }

  const storeId = req.headers['x-store-id'] as string;
  let store: any = null;
  
  if (storeId) {
    const rows = await query<any>(
      `SELECT s.* FROM stores s
       JOIN store_admins sa ON sa.store_id = s.id
       WHERE s.id = $1 AND sa.user_id = $2`,
      [storeId, req.userId]
    );
    if (rows[0]) store = rows[0];
  }

  if (!store) {
    store = await getAdminStore(req.userId);
  }

  if (!store) {
    res.status(404).json({ error: 'No store found for this admin user' });
    return null;
  }

  if (!bypassSubscriptionCheck) {
    const isTrialActive = store.trial_ends_at ? new Date(store.trial_ends_at) > new Date() : false;
    const isSubActive = store.subscription_status === 'active';
    if (!isTrialActive && !isSubActive) {
      res.status(402).json({
        error: 'Payment Required',
        code: 'SUBSCRIPTION_EXPIRED',
        message: 'Your trial or subscription has expired. Please subscribe to continue using the platform.'
      });
      return null;
    }
  }

  return store;
}

function normalizeProduct(row: any) {
  return row
    ? {
        ...row,
        price: Number(row.price),
      }
    : row;
}

function normalizeProducts(rows: any[]) {
  return rows.map(normalizeProduct);
}

app.get('/api/stores', async (_req, res, next) => {
  try {
    const rows = await query<any>(
      `SELECT slug, business_name, logo_url, tagline FROM stores WHERE active = true ORDER BY business_name ASC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/store', async (req, res, next) => {
  try {
    res.json(await getPublicStore(String(req.query.store || '') || undefined));
  } catch (error) {
    next(error);
  }
});

app.get('/api/categories', async (req, res, next) => {
  try {
    const store = await getPublicStore(String(req.query.store || '') || undefined);
    if (!store) {
      res.json([]);
      return;
    }

    const rows = await query(
      `SELECT * FROM categories
       WHERE store_id = $1 AND active = true
       ORDER BY display_order ASC, created_at ASC`,
      [store.id]
    );
    res.json(normalizeProducts(rows));
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', async (req, res, next) => {
  try {
    const store = await getPublicStore(String(req.query.store || '') || undefined);
    if (!store) {
      res.json([]);
      return;
    }

    const categoryId = String(req.query.category || '');
    const rows = categoryId
      ? await query(
          `SELECT * FROM products
           WHERE store_id = $1 AND category_id = $2 AND in_stock = true
           ORDER BY display_order ASC, created_at ASC`,
          [store.id, categoryId]
        )
      : await query(
          `SELECT * FROM products
           WHERE store_id = $1 AND in_stock = true
           ORDER BY display_order ASC, created_at ASC`,
          [store.id]
        );

    res.json(normalizeProducts(rows));
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/session', getSession);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', (_req, res) => res.status(204).end());

app.use('/api/admin', requireUser);

app.get('/api/admin/stores', async (req: AuthedRequest, res, next) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const rows = await query<any>(
      `SELECT s.*
       FROM stores s
       JOIN store_admins sa ON sa.store_id = s.id
       WHERE sa.user_id = $1
       ORDER BY s.created_at ASC`,
      [req.userId]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/stores', async (req: AuthedRequest, res, next) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { slug, business_name, whatsapp_number } = req.body;

    // 1. Create the store
    const storeRows = await query<any>(
      `INSERT INTO stores (owner_id, slug, business_name, whatsapp_number)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, slug, business_name, whatsapp_number]
    );
    const store = storeRows[0];

    // 2. Make the user an owner of this store
    await query(
      `INSERT INTO store_admins (store_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [store.id, req.userId]
    );

    res.status(201).json(store);
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'This store URL is already taken.' });
    } else {
      next(error);
    }
  }
});

app.get('/api/admin/store', async (req: AuthedRequest, res, next) => {
  try {
    const storeId = req.query.storeId as string;
    if (storeId) {
      const rows = await query<any>(
        `SELECT s.* FROM stores s
         JOIN store_admins sa ON sa.store_id = s.id
         WHERE s.id = $1 AND sa.user_id = $2`,
        [storeId, req.userId]
      );
      if (rows[0]) {
        res.json(rows[0]);
        return;
      }
    }
    res.json(await requireAdminStore(req, res, true));
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/billing/status', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res, true);
    if (!store) return;

    const trialEnds = store.trial_ends_at ? new Date(store.trial_ends_at) : null;
    const isTrialActive = trialEnds ? trialEnds > new Date() : false;
    const isSubActive = store.subscription_status === 'active';
    const isActive = isTrialActive || isSubActive;

    const daysLeft = trialEnds 
      ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

    res.json({
      subscription_status: store.subscription_status,
      trial_ends_at: store.trial_ends_at,
      paystack_subscription_code: store.paystack_subscription_code,
      paystack_customer_code: store.paystack_customer_code,
      is_active: isActive,
      days_left: daysLeft
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/billing/subscribe', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res, true);
    if (!store) return;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userRows = await query<{ email: string }>(
      'SELECT email FROM neon_auth.user WHERE id = $1',
      [req.userId]
    );
    const email = userRows[0]?.email;
    const baseUrl = env.paystackPaymentUrl;
    
    console.log(`[Billing Subscribe] Store ${store.id} requesting subscription link. Base URL: ${baseUrl}, User Email: ${email}`);

    if (!baseUrl) {
      console.error('[Billing Subscribe] env.paystackPaymentUrl is not configured');
      res.status(500).json({ error: 'Paystack payment page URL is not configured on the server.' });
      return;
    }

    const authorization_url = email 
      ? `${baseUrl}?email=${encodeURIComponent(email)}` 
      : baseUrl;

    console.log(`[Billing Subscribe] Returning redirect URL: ${authorization_url}`);

    res.json({
      authorization_url
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/billing/verify', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res, true);
    if (!store) return;

    const { reference } = req.body;
    if (!reference || typeof reference !== 'string') {
      res.status(400).json({ error: 'Transaction reference is required' });
      return;
    }

    // Check if this reference has already been claimed by another store
    const existingReference = await query<any>(
      'SELECT id, business_name FROM stores WHERE paystack_transaction_reference = $1',
      [reference]
    );

    if (existingReference.length > 0) {
      if (existingReference[0].id === store.id) {
        res.json({ success: true, message: 'This payment has already been verified and applied to your store.' });
      } else {
        res.status(400).json({ error: 'This transaction reference has already been claimed by another store.' });
      }
      return;
    }

    // Call Paystack API to verify reference
    const paystackSecret = env.paystackSecretKey;
    if (!paystackSecret || paystackSecret === 'sk_test_placeholder_value') {
      console.error('[Billing Verify] Paystack secret key is missing or set to placeholder value.');
      res.status(500).json({ error: 'Paystack is not configured correctly on the server.' });
      return;
    }

    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    console.log(`[Billing Verify] Calling Paystack to verify reference: ${reference}`);
    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errBody = (await response.json().catch(() => ({}))) as any;
      console.error('[Billing Verify] Paystack returned error status:', response.status, errBody);
      res.status(400).json({ error: errBody.message || 'Failed to verify transaction with Paystack.' });
      return;
    }

    const payload = (await response.json()) as any;
    console.log('[Billing Verify] Paystack response payload status:', payload.status, 'data status:', payload.data?.status);
    if (!payload.status || payload.data?.status !== 'success') {
      res.status(400).json({ error: 'Transaction was not successful or not found on Paystack.' });
      return;
    }

    const data = payload.data;
    const subCode = data.subscription_code || data.subscription?.subscription_code || null;
    const custCode = data.customer?.customer_code || null;

    // Update store status to active and record the transaction reference
    await query(
      `UPDATE stores 
       SET subscription_status = 'active',
           paystack_subscription_code = COALESCE($1, paystack_subscription_code),
           paystack_customer_code = COALESCE($2, paystack_customer_code),
           paystack_transaction_reference = $3,
           trial_ends_at = NULL
       WHERE id = $4`,
      [subCode, custCode, reference, store.id]
    );

    console.log(`[Billing Verify] Manual verification successful for store ${store.id}: reference=${reference}`);

    res.json({
      success: true,
      message: 'Payment verified successfully! Your subscription is now active.'
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/store', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    const payload = req.body;
    const rows = await query<any>(
      `UPDATE stores
       SET business_name = $1,
           whatsapp_number = $2,
           tagline = $3,
           logo_url = $4,
           hero_banner_url = $5,
           location = $6,
           facebook_url = $7,
           instagram_url = $8
       WHERE id = $9
       RETURNING *`,
      [
        payload.business_name,
        payload.whatsapp_number,
        payload.tagline || null,
        payload.logo_url || null,
        payload.hero_banner_url || null,
        payload.location || null,
        payload.facebook_url || null,
        payload.instagram_url || null,
        store.id,
      ]
    );

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/dashboard', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    const [productCounts, categoryCounts] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*)::text AS count FROM products WHERE store_id = $1', [store.id]),
      query<{ count: string }>('SELECT COUNT(*)::text AS count FROM categories WHERE store_id = $1', [store.id]),
    ]);

    res.json({
      products: Number(productCounts[0]?.count || 0),
      categories: Number(categoryCounts[0]?.count || 0),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/categories', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    res.json(
      await query(
        `SELECT * FROM categories
         WHERE store_id = $1
         ORDER BY display_order ASC, created_at ASC`,
        [store.id]
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/categories', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    const rows = await query<any>(
      `INSERT INTO categories (store_id, name, display_order, active)
       VALUES ($1, $2, (
         SELECT COALESCE(MAX(display_order), 0) + 1 FROM categories WHERE store_id = $1
       ), true)
       RETURNING *`,
      [store.id, req.body.name]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/admin/categories/:id', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    const rows = await query<any>(
      `UPDATE categories
       SET name = COALESCE($1, name),
           active = COALESCE($2, active)
       WHERE id = $3 AND store_id = $4
       RETURNING *`,
      [req.body.name ?? null, req.body.active ?? null, req.params.id, store.id]
    );

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/categories/:id', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    await query('DELETE FROM categories WHERE id = $1 AND store_id = $2', [req.params.id, store.id]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/products', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    const rows = await query<any>(
        `SELECT * FROM products
         WHERE store_id = $1
         ORDER BY created_at DESC`,
        [store.id]
    );

    res.json(normalizeProducts(rows));
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/products', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    const rows = await query<any>(
      `INSERT INTO products
       (store_id, name, description, price, image_url, category_id, in_stock, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        store.id,
        req.body.name,
        req.body.description || null,
        req.body.price,
        req.body.image_url || null,
        req.body.category_id || null,
        req.body.in_stock ?? true,
        req.body.display_order || 0,
      ]
    );

    res.status(201).json(normalizeProduct(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.patch('/api/admin/products/:id', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    const rows = await query<any>(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           image_url = COALESCE($4, image_url),
           category_id = COALESCE($5, category_id),
           in_stock = COALESCE($6, in_stock)
       WHERE id = $7 AND store_id = $8
       RETURNING *`,
      [
        req.body.name ?? null,
        req.body.description ?? null,
        req.body.price ?? null,
        req.body.image_url ?? null,
        req.body.category_id ?? null,
        req.body.in_stock ?? null,
        req.params.id,
        store.id,
      ]
    );

    res.json(normalizeProduct(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/products/:id', async (req: AuthedRequest, res, next) => {
  try {
    const store = await requireAdminStore(req, res);
    if (!store) return;

    await query('DELETE FROM products WHERE id = $1 AND store_id = $2', [req.params.id, store.id]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/uploads/signature', (req, res) => {
  res.json(createUploadSignature(req.body.folder));
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected server error' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(env.port, '0.0.0.0', () => {
    console.log(`API server listening on http://0.0.0.0:${env.port}`);
  });
}

export default app;
