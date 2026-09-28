/**
 * src/middleware/error.middleware.ts
 *
 * Global Express error-handling middleware.
 *
 * Express identifies error handlers by their 4-argument signature (err, req, res, next).
 * This must be registered AFTER all routes in app.ts.
 *
 * Contract:
 *  - Expected client errors (4xx) from our own code travel via res.status().json()
 *    inside controllers and never reach this handler.
 *  - Unexpected errors (DB failures, thrown exceptions that bubble past a controller)
 *    are caught here, logged server-side with full detail, and answered with a
 *    generic 500 body that contains NO internal information.
 */

import { Request, Response, NextFunction } from 'express';

// Postgres error codes that indicate infra/config problems (not user input errors)
const DB_ERROR_CODES = new Set([
  '28P01', // invalid_password
  '3D000', // invalid_catalog_name (wrong DB name)
  '42501', // insufficient_privilege
  '53300', // too_many_connections
  '57P03', // cannot_connect_now
  '08006', // connection_failure
  '08001', // sqlclient_unable_to_establish_sqlconnection
]);

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean; // set to true for expected, safe-to-expose errors
  code?: string;           // Optional pg SQLSTATE code (e.g. '28P01')
}

/**
 * Generic 500 body returned for all unexpected errors.
 * Deliberately contains no internal detail.
 */
const GENERIC_500 = {
  success: false,
  error: 'Something went wrong. Please try again.',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Always log the real error server-side (stack, pg code, message)
  const pgCode = err.code ?? 'n/a';
  console.error(
    `[error] ${req.method} ${req.path} → ${err.message} (pg code: ${pgCode})`
  );
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // If a controller already sent a response, do nothing
  if (res.headersSent) return;

  // DB / infra errors — always generic 500
  if (DB_ERROR_CODES.has(pgCode)) {
    res.status(500).json(GENERIC_500);
    return;
  }

  // Operational errors our own code raised intentionally
  if (err.isOperational && err.statusCode) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Everything else — generic 500
  res.status(500).json(GENERIC_500);
}
