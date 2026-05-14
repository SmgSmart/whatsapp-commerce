import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

const file = process.argv[2];
if (!file) {
  throw new Error('Usage: tsx scripts/run-sql-file.ts <path-to-sql-file>');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const sql = neon(process.env.DATABASE_URL);
const sqlFile = path.resolve(process.cwd(), file);
function splitSqlStatements(source: string) {
  const statements: string[] = [];
  let current = '';
  let dollarQuote: string | null = null;
  let singleQuoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (!singleQuoted && char === '$') {
      const match = source.slice(index).match(/^\$[A-Za-z0-9_]*\$/);
      if (match) {
        const tag = match[0];
        if (!dollarQuote) {
          dollarQuote = tag;
          current += tag;
          index += tag.length - 1;
          continue;
        }
        if (dollarQuote === tag) {
          dollarQuote = null;
          current += tag;
          index += tag.length - 1;
          continue;
        }
      }
    }

    if (!dollarQuote && char === "'" && next !== "'") {
      singleQuoted = !singleQuoted;
    }

    if (!dollarQuote && !singleQuoted && char === ';') {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = '';
      continue;
    }

    current += char;
  }

  const finalStatement = current.trim();
  if (finalStatement) statements.push(finalStatement);
  return statements;
}

const statements = splitSqlStatements(fs.readFileSync(sqlFile, 'utf8'));

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Applied ${statements.length} SQL statements from ${file}`);
