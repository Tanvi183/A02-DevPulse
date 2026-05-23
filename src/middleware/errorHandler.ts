import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

// Centralized error handler – must have 4 params so Express recognises it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('Unhandled error:', err.message);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'An unexpected server error occurred',
    errors: process.env.NODE_ENV !== 'production' ? err.message : undefined,
  });
}
