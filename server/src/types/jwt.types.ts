/**
 * Payload stored inside every JWT issued by this server.
 * Keep it small — only what middleware needs to make access-control decisions
 * without hitting the database on every request.
 */
export interface JwtPayload {
  userId: number;
  employeeId: string; // e.g. "EMP001"
  role: 'employee' | 'manager';
  name: string;
}
