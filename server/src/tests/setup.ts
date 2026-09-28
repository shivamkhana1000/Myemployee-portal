/**
 * src/tests/setup.ts
 * Jest globalSetup - runs once before the entire test suite in a separate
 * process. Loads environment variables from server/.env so DATABASE_URL and
 * JWT_SECRET are available in every test worker.
 *
 * Path from compiled location: src/tests/setup.ts -> ../../.env = server/.env
 */
import dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
  // __dirname is src/tests, so ../.. resolves to server/
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}
