import pool from '../db/pool';
import type { TicketSummary } from '../types/ticket.types';

// ── Shared fragment ───────────────────────────────────────────────────────────

const RECENT_TICKETS_SQL = `
  SELECT
    t.*,
    u.name  AS employee_name,
    m.name  AS manager_name,
    (t.status NOT IN ('resolved', 'closed')
      AND t.deadline IS NOT NULL
      AND t.deadline < NOW()
    ) AS "isOverdue"
  FROM tickets t
  JOIN  users u ON t.employee_id         = u.id
  LEFT JOIN users m ON t.assigned_manager_id = m.id
`.trim();

// ── Manager dashboard ─────────────────────────────────────────────────────────

export interface ManagerDashboardData {
  itKpi: {
    total:    number;
    open:     number;
    resolved: number;
    overdue:  number;
  };
  recentTickets: TicketSummary[];
  gambaKpi: {
    total:       number;
    underReview: number;
    implemented: number;
  };
}

export async function getManagerDashboard(): Promise<ManagerDashboardData> {
  // Single-pass KPI query using conditional aggregation — cheaper than 4 separate SELECTs
  const kpiResult = await pool.query<{
    total: string;
    open_count: string;
    resolved_count: string;
    overdue_count: string;
  }>(`
    SELECT
      COUNT(*)                                                            AS total,
      COUNT(*) FILTER (WHERE status = 'open')                            AS open_count,
      COUNT(*) FILTER (WHERE status = 'resolved')                        AS resolved_count,
      COUNT(*) FILTER (
        WHERE status NOT IN ('resolved', 'closed')
          AND deadline IS NOT NULL
          AND deadline < NOW()
      )                                                                   AS overdue_count
    FROM tickets
  `);

  const kpi = kpiResult.rows[0];

  const recentResult = await pool.query<TicketSummary>(
    `${RECENT_TICKETS_SQL} ORDER BY t.created_at DESC LIMIT 8`
  );

  const gambaKpiResult = await pool.query<{
    total: string;
    under_review_count: string;
    completed_count: string;
  }>(`
    SELECT
      COUNT(*)                                                     AS total,
      COUNT(*) FILTER (WHERE status = 'under_review')             AS under_review_count,
      COUNT(*) FILTER (WHERE status IN ('implemented', 'completed')) AS completed_count
    FROM gamba_projects
  `);
  const gKpi = gambaKpiResult.rows[0];

  return {
    itKpi: {
      total:    parseInt(kpi.total,          10),
      open:     parseInt(kpi.open_count,     10),
      resolved: parseInt(kpi.resolved_count, 10),
      overdue:  parseInt(kpi.overdue_count,  10),
    },
    recentTickets: recentResult.rows,
    gambaKpi: {
      total:       parseInt(gKpi.total, 10),
      underReview: parseInt(gKpi.under_review_count, 10),
      implemented: parseInt(gKpi.completed_count, 10),
    },
  };
}

// ── Employee dashboard ────────────────────────────────────────────────────────

export interface EmployeeDashboardData {
  kpi: {
    open:       number;
    inProgress: number;
    resolved:   number;
    activeGamba: number;
  };
  recentTickets: TicketSummary[];
}

export async function getEmployeeDashboard(userId: number): Promise<EmployeeDashboardData> {
  const kpiResult = await pool.query<{
    open_count:        string;
    in_progress_count: string;
    resolved_count:    string;
  }>(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'open')        AS open_count,
      COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
      COUNT(*) FILTER (WHERE status = 'resolved')    AS resolved_count
    FROM tickets
    WHERE employee_id = $1
  `, [userId]);

  const kpi = kpiResult.rows[0];

  const recentResult = await pool.query<TicketSummary>(
    `${RECENT_TICKETS_SQL} WHERE t.employee_id = $1 ORDER BY t.created_at DESC LIMIT 5`,
    [userId]
  );

  const gambaKpiResult = await pool.query<{
    active_count: string;
  }>(`
    SELECT COUNT(*) AS active_count
    FROM gamba_projects
    WHERE employee_id = $1 AND status NOT IN ('completed')
  `, [userId]);
  const gKpi = gambaKpiResult.rows[0];

  return {
    kpi: {
      open:        parseInt(kpi.open_count,        10),
      inProgress:  parseInt(kpi.in_progress_count, 10),
      resolved:    parseInt(kpi.resolved_count,    10),
      activeGamba: parseInt(gKpi.active_count, 10),
    },
    recentTickets: recentResult.rows,
  };
}
