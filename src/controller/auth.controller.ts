import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import { validateSignup } from '../utils/validation';
import {
  sendCreated,
  sendBadRequest,
  sendConflict,
  sendInternalError,
} from '../utils/response';
import { SignupBody } from '../types/index';

// POST /api/auth/signup

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const { valid, errors } = validateSignup(body);

    if (!valid) {
      sendBadRequest(res, 'Validation failed', errors);
      return;
    }

    const signupBody = body as unknown as SignupBody;

    // Check for duplicate email
    const existing = await AuthService.findUserByEmail(
      signupBody.email.toLowerCase().trim(),
    );
    if (existing) {
      sendConflict(res, 'This email is already exist');
      return;
    }

    const user = await AuthService.createUser(signupBody);
    sendCreated(res, user, 'User registered successfully');
  } catch (error) {
    console.error('Signup error:', error);
    sendInternalError(res, 'Registration failed due to a server error');
  }
}
