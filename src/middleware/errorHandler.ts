import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';


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
