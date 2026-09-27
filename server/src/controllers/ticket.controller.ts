import { Request, Response } from 'express';
import {
  createTicket,
  listTickets,
  getTicketById,
  updateTicket,
  addComment,
} from '../services/ticket.service';
import type {
  TicketPriority,
  TicketStatus,
  CreateTicketInput,
  UpdateTicketInput,
} from '../types/ticket.types';

// Allowed values for runtime validation
const VALID_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES:   TicketStatus[]   = ['open', 'in_progress', 'resolved', 'closed'];

// ── POST /api/tickets ─────────────────────────────────────────────────────────

export async function createTicketHandler(req: Request, res: Response): Promise<void> {
  const { department, category, priority, description, attachmentPath } = req.body as {
    department?:    string;
    category?:      string;
    priority?:      string;
    description?:   string;
    attachmentPath?: string;
  };

  // Required field validation
  if (!department || !category || !priority || !description) {
    res.status(400).json({
      success: false,
      message: 'department, category, priority, and description are required',
    });
    return;
  }

  if (!VALID_PRIORITIES.includes(priority as TicketPriority)) {
    res.status(400).json({
      success: false,
      message: `priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
    });
    return;
  }

  try {
    const input: CreateTicketInput = {
      department,
      category,
      priority:       priority as TicketPriority,
      description,
      attachmentPath,
    };

    const ticket = await createTicket(req.user!.userId, input);

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error('[tickets] createTicket error:', (err as Error).message);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
}

// ── GET /api/tickets ──────────────────────────────────────────────────────────

export async function listTicketsHandler(req: Request, res: Response): Promise<void> {
  const { status, department, priority } = req.query as Record<string, string | undefined>;

  try {
    const tickets = await listTickets(
      req.user!.userId,
      req.user!.role,
      { status, department, priority }
    );

    res.status(200).json({ success: true, tickets, total: tickets.length });
  } catch (err) {
    console.error('[tickets] listTickets error:', (err as Error).message);
    res.status(500).json({ success: false, message: 'Failed to list tickets' });
  }
}

// ── GET /api/tickets/:id ──────────────────────────────────────────────────────

export async function getTicketHandler(req: Request, res: Response): Promise<void> {
  const ticketId = parseInt(req.params.id, 10);

  if (isNaN(ticketId)) {
    res.status(400).json({ success: false, message: 'Invalid ticket ID' });
    return;
  }

  try {
    const ticket = await getTicketById(ticketId, req.user!.userId, req.user!.role);

    if (!ticket) {
      // Return 404 for both "not found" and "not yours" — prevents enumeration
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    console.error('[tickets] getTicket error:', (err as Error).message);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
}

// ── PATCH /api/tickets/:id ────────────────────────────────────────────────────

export async function updateTicketHandler(req: Request, res: Response): Promise<void> {
  const ticketId = parseInt(req.params.id, 10);

  if (isNaN(ticketId)) {
    res.status(400).json({ success: false, message: 'Invalid ticket ID' });
    return;
  }

  const { status, assigned_manager_id, resolution } = req.body as {
    status?:              string;
    assigned_manager_id?: number | null;
    resolution?:          string;
  };

  // Validate status if provided
  if (status && !VALID_STATUSES.includes(status as TicketStatus)) {
    res.status(400).json({
      success: false,
      message: `status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
    return;
  }

  const input: UpdateTicketInput = {};
  if (status          !== undefined) input.status              = status as TicketStatus;
  if (assigned_manager_id !== undefined) input.assigned_manager_id = assigned_manager_id;
  if (resolution      !== undefined) input.resolution          = resolution;

  try {
    const updated = await updateTicket(ticketId, input);

    if (!updated) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    res.status(200).json({ success: true, ticket: updated });
  } catch (err) {
    const msg = (err as Error).message;
    const status = msg === 'No updatable fields provided' ? 400 : 500;
    res.status(status).json({ success: false, message: msg });
  }
}

// ── POST /api/tickets/:id/comments ───────────────────────────────────────────

export async function addCommentHandler(req: Request, res: Response): Promise<void> {
  const ticketId = parseInt(req.params.id, 10);

  if (isNaN(ticketId)) {
    res.status(400).json({ success: false, message: 'Invalid ticket ID' });
    return;
  }

  const { comment } = req.body as { comment?: string };

  if (!comment?.trim()) {
    res.status(400).json({ success: false, message: 'comment is required' });
    return;
  }

  try {
    // Verify the requester has access to this ticket before letting them comment
    const ticket = await getTicketById(ticketId, req.user!.userId, req.user!.role);

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    const newComment = await addComment(ticketId, req.user!.userId, comment.trim());
    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    console.error('[tickets] addComment error:', (err as Error).message);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
}
