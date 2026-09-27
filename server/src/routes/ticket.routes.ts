import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import {
  createTicketHandler,
  listTicketsHandler,
  getTicketHandler,
  updateTicketHandler,
  addCommentHandler,
} from '../controllers/ticket.controller';

const router = Router();

// All ticket routes require a valid JWT
router.use(verifyToken);

// ── Ticket CRUD ───────────────────────────────────────────────────────────────

// Any authenticated user can create a ticket
router.post('/', createTicketHandler);

// Employees see own; managers see all (role logic is in the service)
router.get('/', listTicketsHandler);

// Employees see own; managers see any (404 for employees on foreign tickets)
router.get('/:id', getTicketHandler);

// Manager-only: update status, assignment, resolution
router.patch('/:id', requireRole('manager'), updateTicketHandler);

// ── Comments ──────────────────────────────────────────────────────────────────

// Either role can comment IF they have access to the ticket
router.post('/:id/comments', addCommentHandler);

export default router;
