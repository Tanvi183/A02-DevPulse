import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { UserRole } from '../types';


// JWT

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


// Role 

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(res, 'You do not have permission to perform this action');
      return;
    }

    next();
  };
}