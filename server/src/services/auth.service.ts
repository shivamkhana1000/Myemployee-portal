import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import pool from '../db/pool';
import { JwtPayload } from '../types/jwt.types';

// ── Internal DB row shapes ────────────────────────────────────────────────────

interface DbUser {
  id: number;
  employee_id: string;
  password_hash: string;
  name: string;
  role: 'employee' | 'manager';
}

// Shape returned to the client (no password hash)
export interface PublicUser {
  id: number;
  employeeId: string;
  name: string;
  role: 'employee' | 'manager';
  department: string | null;
}

// ── loginUser ─────────────────────────────────────────────────────────────────

/**
 * Verifies employee_id + password, signs a JWT, and returns it.
 * Throws a generic error for both "not found" and "wrong password" cases —
 * this prevents an attacker from enumerating valid employee IDs via error messages.
 */
export async function loginUser(employeeId: string, password: string): Promise<string> {
  const result = await pool.query<DbUser>(
    `SELECT id, employee_id, password_hash, name, role
     FROM users
     WHERE employee_id = $1`,
    [employeeId.trim().toUpperCase()]
  );

  // Use a constant-time message regardless of whether the user was found
  const invalidMsg = 'Invalid employee ID or password';

  if (result.rowCount === 0) {
    throw new Error(invalidMsg);
  }

  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    throw new Error(invalidMsg);
  }

  const payload: JwtPayload = {
    userId: user.id,
    employeeId: user.employee_id,
    role: user.role,
    name: user.name,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured on the server');

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

// ── getUserById ───────────────────────────────────────────────────────────────

/**
 * Returns public user data (no password_hash) for the /me endpoint.
 * Joins with departments to include the department name.
 */
export async function getUserById(id: number): Promise<PublicUser | null> {
  const result = await pool.query<{
    id: number;
    employee_id: string;
    name: string;
    role: 'employee' | 'manager';
    department: string | null;
  }>(
    `SELECT u.id, u.employee_id, u.name, u.role, d.name AS department
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.id = $1`,
    [id]
  );

  if (result.rowCount === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    employeeId: row.employee_id,
    name: row.name,
    role: row.role,
    department: row.department,
  };
}
