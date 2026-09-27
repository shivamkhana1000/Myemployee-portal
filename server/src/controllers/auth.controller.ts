import { Request, Response } from 'express';
import { loginUser, getUserById } from '../services/auth.service';

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
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
    // loginUser throws a generic message for both "not found" and "wrong password"
    res.status(401).json({ success: false, message: (err as Error).message });
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

export async function me(req: Request, res: Response): Promise<void> {
  // req.user is guaranteed by verifyToken middleware on this route
  const userId = req.user!.userId;

  try {
    const user = await getUserById(userId);

    if (!user) {
      // Rare: token is valid but the user was deleted from the DB
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
