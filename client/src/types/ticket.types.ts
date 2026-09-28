export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'
export type TicketStatus   = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface Ticket {
  id:                  number
  employee_id:         number
  department:          string
  category:            string
  priority:            TicketPriority
  description:         string
  status:              TicketStatus
  deadline:            string | null
  resolution:          string | null
  assigned_manager_id: number | null
  created_at:          string
  updated_at:          string
  // joined from users table
  employee_name:       string
  manager_name:        string | null
  isOverdue:           boolean
}

export interface TicketComment {
  id:          number
  ticket_id:   number
  author_id:   number
  author_name: string
  comment:     string
  created_at:  string
}

export interface TicketDetail extends Ticket {
  comments: TicketComment[]
}

export interface ManagerDashboard {
  itKpi: {
    total:    number
    open:     number
    resolved: number
    overdue:  number
  }
  recentTickets: Ticket[]
  gambaKpi: {
    total:       number
    underReview: number
    implemented: number
  }
}

export interface EmployeeDashboard {
  kpi: {
    open:        number
    inProgress:  number
    resolved:    number
    activeGamba: number
  }
  recentTickets: Ticket[]
}
