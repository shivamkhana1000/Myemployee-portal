/**
 * src/lib/business-rules.ts
 *
 * Pure, side-effect-free functions extracted from the service layer so they
 * can be unit-tested in isolation (no DB, no network).
 *
 * Both ticket.service.ts and gamba.service.ts import from here instead of
 * defining private functions internally.
 */

import type { TicketPriority, TicketStatus } from '../types/ticket.types';
import type { GambaStatus } from '../types/gamba.types';

// ── Ticket: deadline calculation ─────────────────────────────────────────────

/**
 * Maps each priority to its SLA window in hours.
 *
 *   critical → 4 h   (P1 - same-day)
 *   high     → 24 h  (P2 - next day)
 *   medium   → 48 h  (P3 - 2 days)
 *   low      → 72 h  (P4 - 3 days)
 */
export const DEADLINE_HOURS: Record<TicketPriority, number> = {
  critical: 4,
  high:     24,
  medium:   48,
  low:      72,
};

/**
 * Returns the SLA deadline for a ticket.
 * @param priority - The ticket priority.
 * @param from     - Base time; defaults to now. Pass a fixed date in tests.
 */
export function calcDeadline(priority: TicketPriority, from: Date = new Date()): Date {
  const deadline = new Date(from);
  deadline.setHours(deadline.getHours() + DEADLINE_HOURS[priority]);
  return deadline;
}

// ── Ticket: overdue detection ────────────────────────────────────────────────

/**
 * Pure JS mirror of the SQL IS_OVERDUE_EXPR used in ticket queries.
 *
 * A ticket is overdue when:
 *   - status is open or in_progress (NOT resolved / closed), AND
 *   - deadline exists and has already passed.
 *
 * @param status   - Current ticket status.
 * @param deadline - The ticket deadline (null means no deadline set).
 * @param now      - Reference time; defaults to real clock. Fix it in tests.
 */
export function isOverdue(
  status: TicketStatus,
  deadline: Date | null,
  now: Date = new Date()
): boolean {
  if (status === 'resolved' || status === 'closed') return false;
  if (deadline === null) return false;
  return deadline < now;
}

// ── Gamba: status transitions ────────────────────────────────────────────────

export const GAMBA_EMPLOYEE_TRANSITIONS: Partial<Record<GambaStatus, GambaStatus[]>> = {
  draft:             ['submitted'],
  changes_requested: ['submitted'],
};

export const GAMBA_MANAGER_TRANSITIONS: Partial<Record<GambaStatus, GambaStatus[]>> = {
  submitted:    ['under_review'],
  under_review: ['approved', 'changes_requested'],
  approved:     ['implemented', 'changes_requested'],
  implemented:  ['completed'],
};

/**
 * Throws if the requested transition is not allowed for the given role.
 * No-op when current === next (idempotent update).
 */
export function validateGambaTransition(
  role: 'employee' | 'manager',
  current: GambaStatus,
  next: GambaStatus
): void {
  if (current === next) return;

  const map = role === 'employee' ? GAMBA_EMPLOYEE_TRANSITIONS : GAMBA_MANAGER_TRANSITIONS;
  const allowed = map[current] ?? [];

  if (!allowed.includes(next)) {
    throw new Error(
      `Invalid status transition from '${current}' to '${next}' for role '${role}'`
    );
  }
}
