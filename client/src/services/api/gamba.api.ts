import type { GambaProject, CreateGambaInput, UpdateGambaInput } from '../../types/gamba.types'

const BASE = '/api/gamba'

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export async function apiCreateGamba(token: string, body: CreateGambaInput): Promise<GambaProject> {
  const res  = await fetch(BASE, { method: 'POST', headers: authHeader(token), body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Failed to create gamba project')
  return data.project
}

export async function apiListGamba(
  token: string,
  filters?: { status?: string; department?: string }
): Promise<{ projects: GambaProject[] }> {
  const params = new URLSearchParams()
  if (filters?.status)     params.set('status', filters.status)
  if (filters?.department) params.set('department', filters.department)
  const qs = params.toString() ? `?${params.toString()}` : ''

  const res  = await fetch(`${BASE}${qs}`, { headers: authHeader(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Failed to fetch gamba projects')
  return { projects: data.projects }
}

export async function apiGetGamba(token: string, id: number): Promise<GambaProject> {
  const res  = await fetch(`${BASE}/${id}`, { headers: authHeader(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Failed to fetch gamba project')
  return data.project
}

export async function apiUpdateGamba(
  token: string,
  id: number,
  body: UpdateGambaInput
): Promise<GambaProject> {
  const res  = await fetch(`${BASE}/${id}`, { method: 'PATCH', headers: authHeader(token), body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Failed to update gamba project')
  return data.project
}
