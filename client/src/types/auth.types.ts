// Matches the PublicUser shape returned by GET /api/auth/me
export interface AuthUser {
  id: number;
  employeeId: string;
  name: string;
  role: 'employee' | 'manager';
  department: string | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean; // true while the initial token → /me validation runs
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
}
