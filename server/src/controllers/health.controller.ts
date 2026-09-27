import { Request, Response } from 'express';
import { getServerHealth } from '../services/health.service';

/**
 * GET /api/health
 * Returns a JSON payload indicating the server is alive.
 * Controllers should stay thin — all logic lives in services.
 */
export function getHealth(_req: Request, res: Response): void {
  const health = getServerHealth();
  res.status(200).json(health);
}
