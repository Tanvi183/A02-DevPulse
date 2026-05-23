import { UserRole } from '../types';

// Field Validators 
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidRole(role: string): role is UserRole {
  return role === 'contributor' || role === 'maintainer';
}

export function isValidIssueType(type: string): type is IssueType {
  return type === 'bug' || type === 'feature_request';
}

export function isValidIssueStatus(status: string): status is IssueStatus {
  return status === 'open' || status === 'in_progress' || status === 'resolved';
}

// Signup Validation

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSignup(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('name is required');
  }

  if (!body.email || typeof body.email !== 'string') {
    errors.push('email is required');
  } else if (!isValidEmail(body.email)) {
    errors.push('email must be a valid email address');
  }

  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    errors.push('password is required and must be at least 6 characters');
  }

  if (body.role !== undefined) {
    if (typeof body.role !== 'string' || !isValidRole(body.role)) {
      errors.push("role must be either 'contributor' or 'maintainer'");
    }
  }

  return { valid: errors.length === 0, errors };
}
