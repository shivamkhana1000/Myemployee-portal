import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/jwt.types';

// ── Token verification ────────────────────────────────────────────────────────

/**
 * verifyToken — protects any route it is applied to.
 *
 * Expects:  Authorization: Bearer <token>
 * On success: attaches decoded payload to req.user and calls next().
 * On failure: responds 401 immediately without calling next().
 *
 * Usage:
 *   router.get('/protected', verifyToken, myController);
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    const message =
      err instanceof jwt.TokenExpiredError ? 'Token has expired' : 'Invalid token';
    res.status(401).json({ success: false, message });
  }
}

// ── Role guard ────────────────────────────────────────────────────────────────

/**
 * requireRole — restricts a route to one or more roles.
 * Must be used AFTER verifyToken (relies on req.user being set).
 *
 * Usage:
 *   router.delete('/tickets/:id', verifyToken, requireRole('manager'), handler);
 */
export function requireRole(...roles: Array<'employee' | 'manager'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      // Defensive: verifyToken should always run first
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
      return;
    }

    next();
  };
}
