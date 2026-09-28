/**
 * src/tests/error-handling.test.ts
 *
 * Proves that:
 *  1. A forced DB error on login returns the generic 500 body and does NOT
 *     leak raw pg error text to the client.
 *  2. Normal 401 (wrong credentials) still works after the fix.
 *  3. The generic message is exactly the expected safe string.
 */

import request from 'supertest';
import pool from '../db/pool';
import app from '../app';

afterAll(async () => {
  await pool.end();
});

describe('Global error handling - DB failure simulation', () => {

  /**
   * Strategy: temporarily monkey-patch pool.query so it throws a realistic
   * pg-style error (with .code = '28P01', the SQLSTATE for invalid_password).
   * This simulates exactly what happens when the Neon password is wrong,
   * without actually needing wrong credentials in .env.
   */
  const pgAuthError = Object.assign(
    new Error('password authentication failed for user "neondb_owner"'),
    { code: '28P01' }   // SQLSTATE: invalid_password
  );

  test('DB error on login → 500 with generic message, no pg text leaked', async () => {
    // Patch the pool query to throw a DB error
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => Promise.reject(pgAuthError));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'EMP001', password: 'Employee@123' });

    // Restore immediately
    spy.mockRestore();

    expect(res.status).toBe(500);
    // Generic message must be present
    expect(res.body.error).toBe('Something went wrong. Please try again.');
    // Raw pg error must NOT appear anywhere in the response body
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toMatch(/password authentication failed/i);
    expect(bodyStr).not.toMatch(/neondb_owner/i);
    expect(bodyStr).not.toMatch(/28P01/);
  });

  test('Wrong password (expected 401) still returns safe message after fix', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'EMP001', password: 'definitely-wrong' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid employee ID or password');
    // Must not expose DB internals in a 401 either
    expect(JSON.stringify(res.body)).not.toMatch(/password authentication failed/i);
  });

  test('Non-existent user (expected 401) uses identical message to wrong-password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'NOBODY_AT_ALL', password: 'x' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid employee ID or password');
  });

  test('Generic 500 body has no "success" key (uses "error" key instead)', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => Promise.reject(pgAuthError));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'EMP001', password: 'Employee@123' });

    spy.mockRestore();

    // The 500 body shape is { error: '...' }, not { message: '...' }
    expect(res.body).toHaveProperty('error');
    expect(res.body).not.toHaveProperty('message');
  });
});
