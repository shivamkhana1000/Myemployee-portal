import { Pool } from 'pg';

/**
 * Singleton pg.Pool — shared across the entire server process.
 *
 * Why a Pool and not a Client?
 *   pg.Pool manages a fixed set of persistent connections and hands them
 *   out to concurrent requests, returning them when done.  Creating a new
 *   Client per request would exhaust file descriptors under any real load.
 *
 * Config is intentionally read from process.env here (not imported from a
 * config file) so this module works identically in dev, CI, and production
 * without any code changes — only the .env differs.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Hard upper limit — Postgres default max_connections is 100;
  // leave headroom for other tools (psql, pgAdmin, migrations).
  max: 10,
  // Release idle connections after 30 s to avoid holding server resources.
  idleTimeoutMillis: 30_000,
  // Fail fast if the pool is exhausted rather than hanging indefinitely.
  connectionTimeoutMillis: 5_000,
});

// Surface unexpected pool errors without crashing the process.
// Individual query errors are still thrown to the caller normally.
pool.on('error', (err: Error) => {
  console.error('[db] Unexpected pool client error:', err.message);
});

export default pool;
