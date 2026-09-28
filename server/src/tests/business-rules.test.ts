/**
 * tests/unit/business-rules.test.ts
 *
 * Unit tests for pure business-rule functions.
 * Zero network calls, zero DB access - runs instantly.
 */

import {
  calcDeadline,
  DEADLINE_HOURS,
  isOverdue,
  validateGambaTransition,
} from '../lib/business-rules';
import type { TicketPriority } from '../types/ticket.types';
import type { GambaStatus } from '../types/gamba.types';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Deadline calculation
// ─────────────────────────────────────────────────────────────────────────────

describe('calcDeadline', () => {
  // Anchor all tests to a fixed base time so results are deterministic
  const BASE = new Date('2024-01-15T09:00:00.000Z');

  test('low priority → deadline is exactly 72 h (3 days) later', () => {
    const result = calcDeadline('low', BASE);
    const expected = new Date('2024-01-18T09:00:00.000Z');
    expect(result.getTime()).toBe(expected.getTime());
  });

  test('medium priority → deadline is exactly 48 h (2 days) later', () => {
    const result = calcDeadline('medium', BASE);
    const expected = new Date('2024-01-17T09:00:00.000Z');
    expect(result.getTime()).toBe(expected.getTime());
  });

  test('high priority → deadline is exactly 24 h (1 day) later', () => {
    const result = calcDeadline('high', BASE);
    const expected = new Date('2024-01-16T09:00:00.000Z');
    expect(result.getTime()).toBe(expected.getTime());
  });

  test('critical priority → deadline is exactly 4 h later', () => {
    const result = calcDeadline('critical', BASE);
    const expected = new Date('2024-01-15T13:00:00.000Z');
    expect(result.getTime()).toBe(expected.getTime());
  });

  test('deadline hours match the DEADLINE_HOURS constants', () => {
    const priorities: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
    for (const p of priorities) {
      const deadline = calcDeadline(p, BASE);
      const diffMs = deadline.getTime() - BASE.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      expect(diffHours).toBe(DEADLINE_HOURS[p]);
    }
  });

  test('returns a new Date object, does not mutate the from argument', () => {
    const from = new Date('2024-01-15T09:00:00.000Z');
    const original = from.getTime();
    calcDeadline('high', from);
    expect(from.getTime()).toBe(original); // from must be unchanged
  });

  test('without explicit base, deadline is relative to now (within 1 s)', () => {
    const before = Date.now();
    const deadline = calcDeadline('high');
    const after = Date.now();
    const expectedMin = before + DEADLINE_HOURS['high'] * 60 * 60 * 1000;
    const expectedMax = after  + DEADLINE_HOURS['high'] * 60 * 60 * 1000;
    expect(deadline.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(deadline.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Overdue detection
// ─────────────────────────────────────────────────────────────────────────────

describe('isOverdue', () => {
  const NOW  = new Date('2024-06-01T12:00:00.000Z');
  const PAST = new Date('2024-06-01T10:00:00.000Z'); // 2 h ago
  const FUTURE = new Date('2024-06-01T14:00:00.000Z'); // 2 h from now

  // Overdue cases
  test('open ticket with a past deadline IS overdue', () => {
    expect(isOverdue('open', PAST, NOW)).toBe(true);
  });

  test('in_progress ticket with a past deadline IS overdue', () => {
    expect(isOverdue('in_progress', PAST, NOW)).toBe(true);
  });

  // Not overdue: wrong status
  test('resolved ticket is NEVER overdue even with a past deadline', () => {
    expect(isOverdue('resolved', PAST, NOW)).toBe(false);
  });

  test('closed ticket is NEVER overdue even with a past deadline', () => {
    expect(isOverdue('closed', PAST, NOW)).toBe(false);
  });

  // Not overdue: deadline in future
  test('open ticket whose deadline is in the future is NOT overdue', () => {
    expect(isOverdue('open', FUTURE, NOW)).toBe(false);
  });

  test('in_progress ticket whose deadline is in the future is NOT overdue', () => {
    expect(isOverdue('in_progress', FUTURE, NOW)).toBe(false);
  });

  // Edge: null deadline
  test('open ticket with no deadline (null) is NOT overdue', () => {
    expect(isOverdue('open', null, NOW)).toBe(false);
  });

  // Edge: deadline exactly equal to now is NOT overdue (< not <=)
  test('open ticket whose deadline equals now exactly is NOT overdue', () => {
    expect(isOverdue('open', NOW, NOW)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Gamba status transitions
// ─────────────────────────────────────────────────────────────────────────────

describe('validateGambaTransition', () => {

  // ── Valid employee transitions ──────────────────────────────────────────────
  test('employee: draft → submitted is VALID', () => {
    expect(() => validateGambaTransition('employee', 'draft', 'submitted')).not.toThrow();
  });

  test('employee: changes_requested → submitted is VALID', () => {
    expect(() => validateGambaTransition('employee', 'changes_requested', 'submitted')).not.toThrow();
  });

  // ── Valid manager transitions ───────────────────────────────────────────────
  test('manager: submitted → under_review is VALID', () => {
    expect(() => validateGambaTransition('manager', 'submitted', 'under_review')).not.toThrow();
  });

  test('manager: under_review → approved is VALID', () => {
    expect(() => validateGambaTransition('manager', 'under_review', 'approved')).not.toThrow();
  });

  test('manager: under_review → changes_requested is VALID', () => {
    expect(() => validateGambaTransition('manager', 'under_review', 'changes_requested')).not.toThrow();
  });

  test('manager: approved → implemented is VALID', () => {
    expect(() => validateGambaTransition('manager', 'approved', 'implemented')).not.toThrow();
  });

  test('manager: approved → changes_requested is VALID', () => {
    expect(() => validateGambaTransition('manager', 'approved', 'changes_requested')).not.toThrow();
  });

  test('manager: implemented → completed is VALID', () => {
    expect(() => validateGambaTransition('manager', 'implemented', 'completed')).not.toThrow();
  });

  // ── Invalid employee transitions ────────────────────────────────────────────
  test('employee: draft → completed is INVALID (skips steps)', () => {
    expect(() => validateGambaTransition('employee', 'draft', 'completed')).toThrow(
      /Invalid status transition from 'draft' to 'completed'/
    );
  });

  test('employee: draft → approved is INVALID (manager-only)', () => {
    expect(() => validateGambaTransition('employee', 'draft', 'approved')).toThrow(
      /Invalid status transition/
    );
  });

  test('employee: submitted → under_review is INVALID (manager-only step)', () => {
    expect(() => validateGambaTransition('employee', 'submitted', 'under_review')).toThrow(
      /Invalid status transition/
    );
  });

  // ── Invalid manager transitions ─────────────────────────────────────────────
  test('manager: draft → completed is INVALID', () => {
    expect(() => validateGambaTransition('manager', 'draft', 'completed')).toThrow(
      /Invalid status transition/
    );
  });

  test('manager: completed → draft is INVALID (no backwards moves)', () => {
    expect(() => validateGambaTransition('manager', 'completed', 'draft')).toThrow(
      /Invalid status transition/
    );
  });

  test('manager: submitted → approved is INVALID (must go through under_review first)', () => {
    expect(() => validateGambaTransition('manager', 'submitted', 'approved')).toThrow(
      /Invalid status transition/
    );
  });

  // ── Idempotent (same → same) ────────────────────────────────────────────────
  test('same status → same status is always a no-op for employee', () => {
    const statuses: GambaStatus[] = ['draft', 'submitted', 'under_review', 'approved', 'implemented', 'completed'];
    for (const s of statuses) {
      expect(() => validateGambaTransition('employee', s, s)).not.toThrow();
    }
  });

  test('same status → same status is always a no-op for manager', () => {
    const statuses: GambaStatus[] = ['draft', 'submitted', 'under_review', 'approved', 'implemented', 'completed'];
    for (const s of statuses) {
      expect(() => validateGambaTransition('manager', s, s)).not.toThrow();
    }
  });

  // ── Error message includes both states ─────────────────────────────────────
  test('error message clearly names both current and target states', () => {
    let msg = '';
    try { validateGambaTransition('manager', 'draft', 'completed'); } catch (e) { msg = (e as Error).message; }
    expect(msg).toMatch(/draft/);
    expect(msg).toMatch(/completed/);
    expect(msg).toMatch(/manager/);
  });
});
