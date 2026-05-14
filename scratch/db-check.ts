import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Manual env parsing since we are in scratch
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1]?.trim();

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const sql = neon(dbUrl);

async function check() {
  try {
    const result = await sql`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
    console.log('Tables found:', result.map(r => r.tablename));
  } catch (error) {
    console.error('DB Check Failed:', error);
  }
}

check();
