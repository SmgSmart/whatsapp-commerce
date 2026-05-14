# Neon + Cloudinary Migration

This project is moving from a single-store Supabase setup to a multi-store Neon + Cloudinary setup.

## Chosen Stack

- Database: Neon Postgres
- Auth: Neon Auth
- Image hosting: Cloudinary
- Frontend: existing React/Vite app
- Backend/API: small server layer required for database writes and Cloudinary signing

## Why Cloudinary

Cloudinary is the safer first choice for this app because its free plan is clear, mature, and built around ecommerce-style image uploads, resizing, optimization, CDN delivery, and public image URLs. The official pricing page lists a free forever plan with 25 monthly credits and upload/API support.

ImageKit is a good alternative, but Cloudinary has broader examples and easier support for the first migration.

## Required Environment Variables

Frontend:

```bash
VITE_API_BASE_URL=http://localhost:8787
VITE_NEON_AUTH_URL=
```

Backend:

```bash
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_ORIGIN=http://localhost:5173
PORT=8787
```

## Database Shape

Run [neon/schema.sql](../neon/schema.sql) in Neon.

The important change is that every store-owned row has a `store_id`:

```text
stores
store_admins
categories
products
```

This lets one Neon database hold many customer stores.

## New URL Model

Recommended public store URLs:

```text
/store/:slug
```

Examples:

```text
/store/kofi-shoes
/store/ama-beauty
/store/nana-electronics
```

Admin users should be routed to the store they own or manage after login.

## Migration Steps

1. Create a Neon project and enable Neon Auth.
2. Run `neon/schema.sql`.
3. Create a Cloudinary account and copy cloud name, API key, and API secret.
4. Add the environment variables above.
5. Add the API server dependencies:

```bash
npm install express cors @neondatabase/serverless
npm install -D concurrently tsx @types/express @types/cors
```

6. Replace direct Supabase reads/writes in React with API calls.
7. Replace Supabase Storage upload with Cloudinary signed upload.
8. Replace Supabase Auth context with Neon Auth.
9. Migrate existing products/categories/business settings into the new Neon tables.

For local migration work, `DEV_ADMIN_USER_ID` can temporarily identify the first admin user. Before production, replace the server auth bridge in `server/auth.ts` with real Neon Auth session verification.

## API Endpoints To Build

Public:

```text
GET /api/stores/:slug
GET /api/stores/:slug/categories
GET /api/stores/:slug/products
```

Admin:

```text
GET /api/admin/stores
GET /api/admin/stores/:storeId/dashboard
POST /api/admin/stores
PATCH /api/admin/stores/:storeId
POST /api/admin/stores/:storeId/categories
PATCH /api/admin/stores/:storeId/categories/:categoryId
DELETE /api/admin/stores/:storeId/categories/:categoryId
POST /api/admin/stores/:storeId/products
PATCH /api/admin/stores/:storeId/products/:productId
DELETE /api/admin/stores/:storeId/products/:productId
POST /api/admin/cloudinary/signature
```

Every admin endpoint must verify that the logged-in Neon Auth user exists in `store_admins` for that `storeId`.

## Important

Do not put `DATABASE_URL`, `CLOUDINARY_API_SECRET`, or `NEON_AUTH_SECRET_KEY` in Vite frontend code. They must only live in the backend environment.
