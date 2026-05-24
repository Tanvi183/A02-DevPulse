import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';


export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = StatusCodes.OK,
): Response {
  const body: Record<string, unknown> = { success: true };
  if (message) body.message = message;
  body.data = data;
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message: string,
): Response {
  return sendSuccess(res, data, message, StatusCodes.CREATED);
}

export function sendDeleted(res: Response, message: string): Response {
  return res.status(StatusCodes.OK).json({ success: true, message });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown,
): Response {
  const body: Record<string, unknown> = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return res.status(statusCode).json(body);
}

export function sendBadRequest(
  res: Response,
  message: string,
  errors?: unknown,
): Response {
  return sendError(res, StatusCodes.BAD_REQUEST, message, errors);
}

export function sendUnauthorized(res: Response, message: string): Response {
  return sendError(res, StatusCodes.UNAUTHORIZED, message);
}

export function sendForbidden(res: Response, message: string): Response {
  return sendError(res, StatusCodes.FORBIDDEN, message);
}

export function sendNotFound(res: Response, message: string): Response {
  return sendError(res, StatusCodes.NOT_FOUND, message);
}

export function sendConflict(res: Response, message: string): Response {
  return sendError(res, StatusCodes.CONFLICT, message);
}

export function sendInternalError(res: Response, message: string): Response {
  return sendError(res, StatusCodes.INTERNAL_SERVER_ERROR, message);
}
