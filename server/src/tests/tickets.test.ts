/**
 * tests/api/tickets.test.ts
 *
 * Supertest integration tests for ticket creation and deadline enforcement.
 *
 * DATA ISOLATION STRATEGY:
 *   Every test that creates a ticket tags its description with a unique run ID
 *   (generated once per test-run). The afterAll hook deletes only those rows
 *   by matching on the tag, leaving all pre-existing Neon data untouched.
 *
 *   The tag format is:  [TEST:<runId>] original description
 *   Cleanup query:      DELETE FROM tickets WHERE description LIKE '%[TEST:<runId>]%'
 *   Attachments and comments cascade automatically due to FK ON DELETE CASCADE.
 */

import request from 'supertest';
import { randomUUID } from 'crypto';
import app from '../app';
import pool from '../db/pool';
import { DEADLINE_HOURS } from '../lib/business-rules';

// Unique tag for this test run - ensures cleanup is run-scoped
const RUN_TAG = `[TEST:${randomUUID()}]`;

// Tokens obtained in beforeAll
let employeeToken: string;
let managerToken: string;

// ─────────────────────────────────────────────────────────────────────────────
// Setup / teardown
// ─────────────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const [empRes, mgrRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ employeeId: 'EMP001', password: 'Employee@123' }),
    request(app).post('/api/auth/login').send({ employeeId: 'MGR001', password: 'Manager@123' }),
  ]);
  employeeToken = empRes.body.token;
  managerToken  = mgrRes.body.token;
});

afterAll(async () => {
  // Delete only the test-tagged rows; real data is untouched
  await pool.query(
    `DELETE FROM tickets WHERE description LIKE $1`,
    [`%${RUN_TAG}%`]
  );
  await pool.end();
});

// Helper: create a ticket with the run-tag embedded in the description
async function createTaggedTicket(priority: string, extraDesc = '') {
  return request(app)
    .post('/api/tickets')
    .set('Authorization', `Bearer ${employeeToken}`)
    .send({
      department:  'IT',
      category:    'Test',
      priority,
      description: `${RUN_TAG} ${priority} ticket ${extraDesc}`.trim(),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Ticket creation — basic validation
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/tickets - validation', () => {
  test('returns 400 when description is missing', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ department: 'IT', category: 'Network', priority: 'low' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 for an invalid priority value', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ department: 'IT', category: 'Net', priority: 'urgent', description: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/priority must be one of/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Ticket creation — deadline accuracy per priority
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/tickets - deadline calculation via API', () => {
  // For each priority, record the time just before creation, create the ticket,
  // then assert the returned deadline is within the expected SLA window.
  // A 10-second tolerance handles network + DB latency.
  const TOLERANCE_MS = 10_000;

  test.each([
    ['low',      DEADLINE_HOURS.low],
    ['medium',   DEADLINE_HOURS.medium],
    ['high',     DEADLINE_HOURS.high],
    ['critical', DEADLINE_HOURS.critical],
  ])('%s priority → deadline ≈ now + %d hours', async (priority, expectedHours) => {
    const beforeMs = Date.now();
    const res = await createTaggedTicket(priority);
    const afterMs  = Date.now();

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const deadline = new Date(res.body.ticket.deadline).getTime();
    const expectedMin = beforeMs + expectedHours * 3_600_000 - TOLERANCE_MS;
    const expectedMax = afterMs  + expectedHours * 3_600_000 + TOLERANCE_MS;

    expect(deadline).toBeGreaterThanOrEqual(expectedMin);
    expect(deadline).toBeLessThanOrEqual(expectedMax);
  });

  test('ticket is created with status "open"', async () => {
    const res = await createTaggedTicket('medium', 'status-check');
    expect(res.status).toBe(201);
    expect(res.body.ticket.status).toBe('open');
  });

  test('ticket response includes the correct priority echoed back', async () => {
    const res = await createTaggedTicket('critical', 'priority-echo');
    expect(res.status).toBe(201);
    expect(res.body.ticket.priority).toBe('critical');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Manager-only: PATCH /api/tickets/:id
// ─────────────────────────────────────────────────────────────────────────────

describe('PATCH /api/tickets/:id - manager-only', () => {
  let ticketId: number;

  beforeAll(async () => {
    // Create a ticket as employee, then update it as manager
    const res = await createTaggedTicket('high', 'for-patch-test');
    ticketId = res.body.ticket.id;
  });

  test('manager can update ticket status to in_progress', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.ticket.status).toBe('in_progress');
  });

  test('manager can resolve a ticket with a resolution message', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'resolved', resolution: 'Fixed by restarting the service.' });

    expect(res.status).toBe(200);
    expect(res.body.ticket.status).toBe('resolved');
    expect(res.body.ticket.resolution).toBe('Fixed by restarting the service.');
  });

  test('employee gets 403 when attempting PATCH', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ status: 'resolved' });

    expect(res.status).toBe(403);
  });

  test('PATCH with no updatable fields returns 400', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no updatable fields/i);
  });
});
