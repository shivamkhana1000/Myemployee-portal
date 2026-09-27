// ── Enums ─────────────────────────────────────────────────────────────────────

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus   = 'open' | 'in_progress' | 'resolved' | 'closed';

// ── Input shapes ──────────────────────────────────────────────────────────────

export interface CreateTicketInput {
  department:     string;
  category:       string;
  priority:       TicketPriority;
  description:    string;
  attachmentPath?: string; // optional file path stored in the attachments table
}

export interface UpdateTicketInput {
  status?:              TicketStatus;
  assigned_manager_id?: number | null;
  resolution?:          string;
}

export interface ListTicketsFilters {
  status?:     string;
  department?: string;
  priority?:   string;
}

// ── DB row shapes ─────────────────────────────────────────────────────────────

export interface TicketRow {
  id:                  number;
  employee_id:         number;
  department:          string;
  category:            string;
  priority:            TicketPriority;
  description:         string;
  status:              TicketStatus;
  deadline:            Date | null;
  resolution:          string | null;
  assigned_manager_id: number | null;
  created_at:          Date;
  updated_at:          Date;
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface TicketSummary extends TicketRow {
  employee_name: string;
  manager_name:  string | null;
  isOverdue:     boolean;
}

export interface CommentRow {
  id:          number;
  ticket_id:   number;
  author_id:   number;
  author_name: string;
  comment:     string;
  created_at:  Date;
}

export interface TicketDetail extends TicketSummary {
  comments: CommentRow[];
}
