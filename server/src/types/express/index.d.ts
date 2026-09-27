/**
 * Augments Express's Request interface to include the decoded JWT payload.
 * After verifyToken middleware runs, req.user is guaranteed to be set.
 *
 * The `export {}` at the bottom is required — it makes this file a module
 * so TypeScript allows the import statement above the `declare global` block.
 */
import { JwtPayload } from '../jwt.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
