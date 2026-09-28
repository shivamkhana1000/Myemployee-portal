import pool from '../db/pool';
import { calcDeadline } from '../lib/business-rules';
import type {
  CreateTicketInput,
  UpdateTicketInput,
  ListTicketsFilters,
  TicketRow,
  TicketSummary,
  TicketDetail,
  CommentRow,
} from '../types/ticket.types';

// calcDeadline is now imported from ../lib/business-rules (shared with tests)

// ── Shared SQL fragment ───────────────────────────────────────────────────────

/**
 * isOverdue is a derived boolean, never stored.
 * Rule: the ticket is overdue when it is still open/in-progress AND the
 *       deadline has passed.  resolved and closed tickets are never overdue.
 */
const IS_OVERDUE_EXPR = `
  (t.status NOT IN ('resolved', 'closed')
    AND t.deadline IS NOT NULL
    AND t.deadline < NOW()
  ) AS "isOverdue"
`.trim();

const TICKET_SELECT = `
  SELECT
    t.*,
    u.name  AS employee_name,
    m.name  AS manager_name,
    ${IS_OVERDUE_EXPR}
  FROM tickets t
  JOIN  users u ON t.employee_id         = u.id
  LEFT JOIN users m ON t.assigned_manager_id = m.id
`.trim();

// ── createTicket ──────────────────────────────────────────────────────────────

/**
 * Inserts a new ticket and, if an attachment path is supplied, inserts into
 * the attachments table atomically inside a single transaction.
 */
export async function createTicket(
  employeeId: number,
  input: CreateTicketInput
): Promise<TicketRow> {
  const { department, category, priority, description, attachmentPath } = input;
  const deadline = calcDeadline(priority);

  // Use a transaction only when we also need to insert an attachment row,
  // so the two inserts succeed or fail together.
  if (attachmentPath) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const ticketResult = await client.query<TicketRow>(
        `INSERT INTO tickets (employee_id, department, category, priority, description, deadline)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [employeeId, department, category, priority, description, deadline]
      );

      const ticket = ticketResult.rows[0];

      await client.query(
        `INSERT INTO attachments (ticket_id, file_path) VALUES ($1, $2)`,
        [ticket.id, attachmentPath]
      );

      await client.query('COMMIT');
      return ticket;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release(); // always return client to pool
    }
  }

  // No attachment — single INSERT, no transaction needed
  const result = await pool.query<TicketRow>(
    `INSERT INTO tickets (employee_id, department, category, priority, description, deadline)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [employeeId, department, category, priority, description, deadline]
  );

  return result.rows[0];
}

// ── listTickets ───────────────────────────────────────────────────────────────

/**
 * Employees see only their own tickets; managers see all.
 * Optional filters: status, department, priority.
 * isOverdue is computed by Postgres — no post-processing needed.
 */
export async function listTickets(
  userId: number,
  role: 'employee' | 'manager',
  filters: ListTicketsFilters
): Promise<TicketSummary[]> {
  const { status, department, priority } = filters;

  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  // Role-based data visibility
  if (role === 'employee') {
    conditions.push(`t.employee_id = $${idx++}`);
    values.push(userId);
  }

  // Optional filters — use NULL-safe comparison so passing undefined skips the filter
  if (status) {
    conditions.push(`t.status = $${idx++}`);
    values.push(status);
  }
  if (department) {
    conditions.push(`t.department ILIKE $${idx++}`); // case-insensitive match
    values.push(department);
  }
  if (priority) {
    conditions.push(`t.priority = $${idx++}`);
    values.push(priority);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `${TICKET_SELECT} ${whereClause} ORDER BY t.created_at DESC`;
  const result = await pool.query<TicketSummary>(sql, values);
  return result.rows;
}

// ── getTicketById ─────────────────────────────────────────────────────────────

/**
 * Returns a full ticket detail including comments.
 * Returns null if the ticket doesn't exist or the employee doesn't own it.
 */
export async function getTicketById(
  ticketId: number,
  userId: number,
  role: 'employee' | 'manager'
): Promise<TicketDetail | null> {
  // Fetch ticket row
  const conditions =
    role === 'employee'
      ? 'WHERE t.id = $1 AND t.employee_id = $2'
      : 'WHERE t.id = $1';

  const params = role === 'employee' ? [ticketId, userId] : [ticketId];

  const ticketResult = await pool.query<TicketSummary>(
    `${TICKET_SELECT} ${conditions}`,
    params
  );

  if (ticketResult.rowCount === 0) return null;

  const ticket = ticketResult.rows[0];

  // Fetch comments for this ticket
  const commentResult = await pool.query<CommentRow>(
    `SELECT
       tc.id, tc.ticket_id, tc.author_id, tc.comment, tc.created_at,
       u.name AS author_name
     FROM ticket_comments tc
     JOIN users u ON tc.author_id = u.id
     WHERE tc.ticket_id = $1
     ORDER BY tc.created_at ASC`,
    [ticketId]
  );

  return { ...ticket, comments: commentResult.rows };
}

// ── updateTicket ──────────────────────────────────────────────────────────────

/**
 * Partially updates a ticket (manager-only at route level).
 * Builds the SET clause dynamically so only supplied fields are touched.
 * updated_at is handled automatically by the Postgres trigger.
 */
export async function updateTicket(
  ticketId: number,
  input: UpdateTicketInput
): Promise<TicketRow | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (input.status !== undefined) {
    setClauses.push(`status = $${idx++}`);
    values.push(input.status);
  }
  if (input.assigned_manager_id !== undefined) {
    setClauses.push(`assigned_manager_id = $${idx++}`);
    values.push(input.assigned_manager_id);
  }
  if (input.resolution !== undefined) {
    setClauses.push(`resolution = $${idx++}`);
    values.push(input.resolution);
  }

  if (setClauses.length === 0) {
    throw new Error('No updatable fields provided');
  }

  values.push(ticketId); // for the WHERE clause

  const result = await pool.query<TicketRow>(
    `UPDATE tickets
     SET ${setClauses.join(', ')}
     WHERE id = $${idx}
     RETURNING *`,
    values
  );

  return result.rows[0] ?? null;
}

// ── addComment ────────────────────────────────────────────────────────────────

/**
 * Adds a comment to a ticket.
 * Access check is done at the controller level by calling getTicketById first.
 */
export async function addComment(
  ticketId: number,
  authorId: number,
  comment: string
): Promise<CommentRow> {
  const result = await pool.query<Omit<CommentRow, 'author_name'>>(
    `INSERT INTO ticket_comments (ticket_id, author_id, comment)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [ticketId, authorId, comment]
  );

  // Re-fetch with author name for the response
  const row = result.rows[0];
  const withName = await pool.query<CommentRow>(
    `SELECT tc.*, u.name AS author_name
     FROM ticket_comments tc
     JOIN users u ON tc.author_id = u.id
     WHERE tc.id = $1`,
    [row.id]
  );

  return withName.rows[0];
}
