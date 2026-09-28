import type { Ticket, TicketDetail, TicketComment } from '../../types/ticket.types'

const BASE = '/api/tickets'

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

// ── List tickets ──────────────────────────────────────────────────────────────

export async function apiListTickets(
  token: string,
  filters?: { status?: string; department?: string; priority?: string }
): Promise<{ tickets: Ticket[]; total: number }> {
  const params = new URLSearchParams()
  if (filters?.status)     params.set('status', filters.status)
  if (filters?.department) params.set('department', filters.department)
  if (filters?.priority)   params.set('priority', filters.priority)
  const qs = params.toString() ? `?${params.toString()}` : ''

  const res  = await fetch(`${BASE}${qs}`, { headers: authHeader(token) })
  const data = await res.json() as { success: boolean; tickets: Ticket[]; total: number; message?: string }
  if (!res.ok) throw new Error(data.message ?? 'Failed to fetch tickets')
  return { tickets: data.tickets, total: data.total }
}

// ── Get ticket detail ─────────────────────────────────────────────────────────

export async function apiGetTicket(token: string, id: number): Promise<TicketDetail> {
  const res  = await fetch(`${BASE}/${id}`, { headers: authHeader(token) })
  const data = await res.json() as { success: boolean; ticket: TicketDetail; message?: string }
  if (!res.ok) throw new Error(data.message ?? 'Failed to fetch ticket')
  return data.ticket
}

// ── Create ticket ─────────────────────────────────────────────────────────────

export async function apiCreateTicket(
  token: string,
  body: { department: string; category: string; priority: string; description: string }
): Promise<Ticket> {
  const res  = await fetch(BASE, { method: 'POST', headers: authHeader(token), body: JSON.stringify(body) })
  const data = await res.json() as { success: boolean; ticket: Ticket; message?: string }
  if (!res.ok) throw new Error(data.message ?? 'Failed to create ticket')
  return data.ticket
}

// ── Update ticket (manager) ───────────────────────────────────────────────────

export async function apiUpdateTicket(
  token: string,
  id: number,
  body: { status?: string; assigned_manager_id?: number | null; resolution?: string }
): Promise<Ticket> {
  const res  = await fetch(`${BASE}/${id}`, { method: 'PATCH', headers: authHeader(token), body: JSON.stringify(body) })
  const data = await res.json() as { success: boolean; ticket: Ticket; message?: string }
  if (!res.ok) throw new Error(data.message ?? 'Failed to update ticket')
  return data.ticket
}

// ── Add comment ───────────────────────────────────────────────────────────────

export async function apiAddComment(token: string, ticketId: number, comment: string): Promise<TicketComment> {
  const res  = await fetch(`${BASE}/${ticketId}/comments`, {
    method: 'POST', headers: authHeader(token), body: JSON.stringify({ comment })
  })
  const data = await res.json() as { success: boolean; comment: TicketComment; message?: string }
  if (!res.ok) throw new Error(data.message ?? 'Failed to add comment')
  return data.comment
}
