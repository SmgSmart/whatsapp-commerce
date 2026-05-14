import express from 'express';
import path from 'node:path';
import cors from 'cors';
import { createUploadSignature } from './cloudinary';
import { login, getSession, requireUser, type AuthedRequest } from './auth';
import { env } from './env';
import { query } from './db';

const app = express();
app.set('trust proxy', true);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.0.100:5173',
  env.clientOrigin
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow any ngrok origin or listed origins
    if (allowedOrigins.includes(origin) || origin.endsWith('.ngrok-free.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(express.json({ limit: '1mb' }));

// Production: Serve static frontend files
if (process.env.NODE_ENV === 'production') {
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
  const rows = slug
    ? await query<any>(
        `SELECT * FROM stores WHERE slug = $1 AND active = true LIMIT 1`,
        [slug]
      )
    : await query<any>(
        `SELECT * FROM stores WHERE active = true ORDER BY created_at ASC LIMIT 1`
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

async function requireAdminStore(req: AuthedRequest, res: express.Response) {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }

  const storeId = req.headers['x-store-id'] as string;
  
  if (storeId) {
    const rows = await query<any>(
      `SELECT s.* FROM stores s
       JOIN store_admins sa ON sa.store_id = s.id
       WHERE s.id = $1 AND sa.user_id = $2`,
      [storeId, req.userId]
    );
    if (rows[0]) return rows[0];
  }

  const store = await getAdminStore(req.userId);
  if (!store) {
    res.status(404).json({ error: 'No store found for this admin user' });
    return null;
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
    res.json(await requireAdminStore(req, res));
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

app.listen(env.port, '0.0.0.0', () => {
  console.log(`API server listening on http://0.0.0.0:${env.port}`);
});
