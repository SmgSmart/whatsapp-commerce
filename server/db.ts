import { neon } from '@neondatabase/serverless';
import { requireEnv } from './env';

export const sql = neon(requireEnv('databaseUrl'));

export async function query<T>(text: string, params: unknown[] = []) {
  return sql.query(text, params) as Promise<T[]>;
}
