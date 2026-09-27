export interface HealthStatus {
  success: boolean;
  message: string;
  timestamp: string;
  uptime: number; // seconds the Node process has been running
  environment: string;
}

/**
 * Returns runtime health information for the server.
 * Keeping this in a service makes it straightforward to extend later
 * (e.g. add a database connectivity check in Phase 2).
 */
export function getServerHealth(): HealthStatus {
  return {
    success: true,
    message: 'MyEmployee Portal API is healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV ?? 'development',
  };
}
