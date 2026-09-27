/**
 * migrate.ts
 * Reads server/src/db/schema.sql and executes it against the configured
 * PostgreSQL database.  Uses a single client (not the shared pool) so the
 * entire migration runs inside one connection that is released when done.
 *
 * Usage:  npm run db:migrate
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function migrate(): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('[migrate] Connected to PostgreSQL');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    await client.query(sql);
    console.log('[migrate] ✅ Schema applied successfully');
  } catch (err) {
    console.error('[migrate] ❌ Migration failed:', (err as Error).message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
