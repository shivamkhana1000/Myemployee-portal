import type { AuthUser } from '../../types/auth.types'

const BASE = '/api/auth'

// ── login ─────────────────────────────────────────────────────────────────────

export async function apiLogin(
  employeeId: string,
  password: string
): Promise<string> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, password }),
  })

  const data = (await res.json()) as { success: boolean; token?: string; message?: string }

  if (!res.ok || !data.success) {
    throw new Error(data.message ?? 'Login failed')
  }

  return data.token!
}

// ── me ────────────────────────────────────────────────────────────────────────

export async function apiGetMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = (await res.json()) as { success: boolean; user?: AuthUser; message?: string }

  if (!res.ok || !data.success) {
    throw new Error(data.message ?? 'Failed to fetch user')
  }

  return data.user!
}
