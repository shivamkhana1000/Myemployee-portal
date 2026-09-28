import type { ManagerDashboard, EmployeeDashboard } from '../../types/ticket.types'

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function apiManagerDashboard(token: string): Promise<ManagerDashboard> {
  const res  = await fetch('/api/dashboard/manager', { headers: authHeader(token) })
  const data = await res.json() as { success: boolean } & ManagerDashboard & { message?: string }
  if (!res.ok) throw new Error(data.message ?? 'Failed to load manager dashboard')
  return { itKpi: data.itKpi, recentTickets: data.recentTickets, gambaKpi: data.gambaKpi }
}

export async function apiEmployeeDashboard(token: string): Promise<EmployeeDashboard> {
  const res  = await fetch('/api/dashboard/employee', { headers: authHeader(token) })
  const data = await res.json() as { success: boolean } & EmployeeDashboard & { message?: string }
  if (!res.ok) throw new Error(data.message ?? 'Failed to load employee dashboard')
  return { kpi: data.kpi, recentTickets: data.recentTickets }
}
