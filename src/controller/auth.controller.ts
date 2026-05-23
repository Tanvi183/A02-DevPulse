import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as AuthService from '../services/auth.service';
import { signToken } from '../utils/jwt';
import { validateSignup, validateLogin } from '../utils/validation';
import {
  sendCreated,
  sendSuccess,
  sendBadRequest,
  sendUnauthorized,
  sendConflict,
  sendInternalError,
} from '../utils/response';
import { SignupBody, LoginBody } from '../types/index';



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


// POST /api/auth/login

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const { valid, errors } = validateLogin(body);

    if (!valid) {
      sendBadRequest(res, 'Validation failed', errors);
      return;
    }

    const { email, password } = body as unknown as LoginBody;

    const user = await AuthService.findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    const passwordMatch = await AuthService.verifyPassword(password, user.password);
    if (!passwordMatch) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    // Sign JWT with id, name, role in payload
    const token = signToken({ id: user.id, name: user.name, role: user.role });

    // Never expose password in response
    const { password: _pw, ...safeUser } = user;

    sendSuccess(
      res,
      { token, user: safeUser },
      'Login successful',
      StatusCodes.OK,
    );
  } catch (error) {
    console.error('Login error:', error);
    sendInternalError(res, 'Login failed due to a server error');
  }
}
