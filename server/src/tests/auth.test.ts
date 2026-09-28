/**
 * tests/api/auth.test.ts
 *
 * Supertest integration tests for the auth and RBAC layer.
 * Uses the REAL Neon DB (seeded users EMP001 / MGR001).
 * Only reads; does not insert any rows.
 */

import request from 'supertest';
import app from '../app';
import pool from '../db/pool';

afterAll(async () => {
  await pool.end();
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('returns 200 + JWT token for valid employee credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'EMP001', password: 'Employee@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(10);
  });

  test('returns 200 + JWT token for valid manager credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'MGR001', password: 'Manager@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
  });

  test('returns 401 for a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'EMP001', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('returns 401 for a non-existent employee ID', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'NOBODY999', password: 'any' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when employeeId is missing from body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Employee@123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when password is missing from body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'EMP001' });

    expect(res.status).toBe(400);
  });

  test('login does NOT expose different error messages for bad ID vs bad password', async () => {
    const badUser = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'NONEXISTENT', password: 'x' });

    const badPass = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'EMP001', password: 'wrong' });

    // Both must return the same generic message to prevent user enumeration
    expect(badUser.body.message).toBe(badPass.body.message);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Protected route: 401 without token
// ─────────────────────────────────────────────────────────────────────────────

describe('Protected routes without a token', () => {
  test('GET /api/tickets returns 401 with no Authorization header', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no token/i);
  });

  test('POST /api/tickets returns 401 with no Authorization header', async () => {
    const res = await request(app).post('/api/tickets').send({});
    expect(res.status).toBe(401);
  });

  test('PATCH /api/tickets/1 returns 401 with no Authorization header', async () => {
    const res = await request(app).patch('/api/tickets/1').send({});
    expect(res.status).toBe(401);
  });

  test('GET /api/solutions/search returns 401 with no Authorization header', async () => {
    const res = await request(app).get('/api/solutions/search?q=printer');
    expect(res.status).toBe(401);
  });

  test('Authorization header with wrong format (no Bearer) returns 401', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', 'Token abc123');
    expect(res.status).toBe(401);
  });

  test('Authorization header with an invalid token value returns 401', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', 'Bearer this.is.not.a.real.jwt');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RBAC: employee gets 403 on manager-only routes
// ─────────────────────────────────────────────────────────────────────────────

describe('RBAC - employee forbidden from manager-only actions', () => {
  let employeeToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ employeeId: 'EMP001', password: 'Employee@123' });
    employeeToken = res.body.token;
  });

  test('PATCH /api/tickets/:id returns 403 for employee role', async () => {
    // Use ticket ID 1 - may not exist but the role check fires before the DB lookup
    const res = await request(app)
      .patch('/api/tickets/1')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ status: 'resolved' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/access denied/i);
  });
});
