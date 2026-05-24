import { UserRole, IssueType, IssueStatus } from '../types';

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

// Login Validation

export function validateLogin(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!body.email || typeof body.email !== 'string') {
    errors.push('email is required');
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('password is required');
  }

  return { valid: errors.length === 0, errors };
}

//  Create Issue Validation

export function validateCreateIssue(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    errors.push('title is required');
  } else if (body.title.length > 150) {
    errors.push('title must not exceed 150 characters');
  }

  if (!body.description || typeof body.description !== 'string' || body.description.trim() === '') {
    errors.push('description is required');
  } else if (body.description.trim().length < 20) {
    errors.push('description must be at least 20 characters');
  }

  if (!body.type || typeof body.type !== 'string') {
    errors.push('type is required');
  } else if (!isValidIssueType(body.type)) {
    errors.push("type must be either 'bug' or 'feature_request'");
  }

  return { valid: errors.length === 0, errors };
}

// Update Issue Validation 

export function validateUpdateIssue(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push('title must be a non-empty string');
    } else if (body.title.length > 150) {
      errors.push('title must not exceed 150 characters');
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.trim() === '') {
      errors.push('description must be a non-empty string');
    } else if (body.description.trim().length < 20) {
      errors.push('description must be at least 20 characters');
    }
  }

  if (body.type !== undefined) {
    if (typeof body.type !== 'string' || !isValidIssueType(body.type)) {
      errors.push("type must be either 'bug' or 'feature_request'");
    }
  }

  return { valid: errors.length === 0, errors };
}