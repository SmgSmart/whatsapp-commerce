import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

export const env = {
  port: Number(process.env.PORT || 8787),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  neonAuthUrl: process.env.VITE_NEON_AUTH_URL,
  neonAuthBaseUrl: process.env.NEON_AUTH_BASE_URL,
  neonAuthCookieSecret: process.env.NEON_AUTH_COOKIE_SECRET,
  devAdminUserId: process.env.DEV_ADMIN_USER_ID,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPlanCode: process.env.PAYSTACK_PLAN_CODE,
  paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
  paystackPublicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY,
  paystackPaymentUrl: process.env.PAYSTACK_PAYMENT_URL || 'https://paystack.shop/pay/p2din070oj',
};

export function requireEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value);
}
