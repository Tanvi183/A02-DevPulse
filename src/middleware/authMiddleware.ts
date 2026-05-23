import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendUnauthorized } from '../utils/response';

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.headers['authorization'];

  if (!token) {
    sendUnauthorized(res, 'Authorization token is required');
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    sendUnauthorized(res, 'Token is invalid or has expired');
  }
}
