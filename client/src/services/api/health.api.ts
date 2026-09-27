/**
 * health.api.ts
 *
 * Client-side service for the /api/health endpoint.
 * All fetch calls go through this file so the URL is never hardcoded
 * in components — just swap the base URL in one place if needed.
 */

export interface HealthStatus {
  success: boolean
  message: string
  timestamp: string
  uptime: number
  environment: string
}

const BASE_URL = '/api' // Vite proxy handles forwarding to http://localhost:5000

export async function fetchHealth(): Promise<HealthStatus> {
  const response = await fetch(`${BASE_URL}/health`)

  if (!response.ok) {
    throw new Error(`Server responded with ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<HealthStatus>
}
