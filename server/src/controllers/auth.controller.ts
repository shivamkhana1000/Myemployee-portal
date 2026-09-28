import { Request, Response, NextFunction } from 'express';
import { loginUser, getUserById } from '../services/auth.service';

// The single generic message used for both "not found" and "wrong password".
// Defined here so tests can import it for exact-match assertions.
export const INVALID_CREDENTIALS_MSG = 'Invalid employee ID or password';

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { employeeId, password } = req.body as {
    employeeId?: string;
    password?: string;
  };

  if (!employeeId || !password) {
    res.status(400).json({
      success: false,
      message: 'employeeId and password are required',
    });
    return;
  }

  try {
    const token = await loginUser(employeeId, password);
    res.status(200).json({ success: true, token });
  } catch (err) {
    const message = (err as Error).message;

    // loginUser throws INVALID_CREDENTIALS_MSG for both "not found" and
    // "wrong password" — these are expected, safe-to-expose auth errors.
    // Any OTHER message (e.g. a pg database error) is an infrastructure
    // failure and must NOT be shown to the user.
    if (message === INVALID_CREDENTIALS_MSG) {
      res.status(401).json({ success: false, message });
    } else {
      // Forward to the global error handler which will log and return 500
      next(err);
    }
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user!.userId;

  try {
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err); // global error handler → generic 500
  }
}
