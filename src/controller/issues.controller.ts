import { Request, Response } from 'express';
import * as IssuesService from '../services/issues.service';
import { validateCreateIssue, validateUpdateIssue, isValidIssueType, isValidIssueStatus } from '../utils/validation';
import {
  sendSuccess,
  sendCreated,
  sendDeleted,
  sendBadRequest,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendInternalError,
} from '../utils/response';
import {
  CreateIssueBody,
  UpdateIssueBody,
  IssueQueryParams,
  IssueStatus,
} from '../types/index';


//  POST

export async function createIssue(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const { valid, errors } = validateCreateIssue(body);

    if (!valid) {
      sendBadRequest(res, 'Validation failed', errors);
      return;
    }

    // reporter_id comes from the decoded JWT – never from the request body
    const reporterId = req.user!.id;
    const issue = await IssuesService.createIssue(body as unknown as CreateIssueBody, reporterId);
    sendCreated(res, issue, 'Issue created successfully');
  } catch (error) {
    console.error('Create issue error:', error);
    sendInternalError(res, 'Failed to create issue');
  }
}

//  GET

export async function getAllIssues(req: Request, res: Response): Promise<void> {
  try {
    const { sort, type, status } = req.query as Record<string, string>;

    // Validate optional query params
    if (sort && sort !== 'newest' && sort !== 'oldest') {
      sendBadRequest(res, "sort must be 'newest' or 'oldest'");
      return;
    }

    if (type && !isValidIssueType(type)) {
      sendBadRequest(res, "type must be 'bug' or 'feature_request'");
      return;
    }

    if (status && !isValidIssueStatus(status)) {
      sendBadRequest(res, "status must be 'open', 'in_progress', or 'resolved'");
      return;
    }

    const params: IssueQueryParams = {
      sort: sort as IssueQueryParams['sort'],
      type: type as IssueQueryParams['type'],
      status: status as IssueQueryParams['status'],
    };

    const issues = await IssuesService.getAllIssues(params);
    sendSuccess(res, issues);
  } catch (error) {
    console.error('Get all issues error:', error);
    sendInternalError(res, 'Failed to retrieve issues');
  }
}

// GET 

export async function getSingleIssue(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendBadRequest(res, 'Invalid issue ID');
      return;
    }

    const issue = await IssuesService.getIssueById(id);
    if (!issue) {
      sendNotFound(res, 'Issue not found');
      return;
    }

    sendSuccess(res, issue);
  } catch (error) {
    console.error('Get single issue error:', error);
    sendInternalError(res, 'Failed to retrieve issue');
  }
}

// PATCH 

export async function updateIssue(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendBadRequest(res, 'Invalid issue ID');
      return;
    }

    const body = req.body as Record<string, unknown>;
    const { valid, errors } = validateUpdateIssue(body);

    if (!valid) {
      sendBadRequest(res, 'Validation failed', errors);
      return;
    }

    const existing = await IssuesService.getRawIssueById(id);
    if (!existing) {
      sendNotFound(res, 'Issue not found');
      return;
    }

    const { id: userId, role } = req.user!;

    if (role === 'contributor') {
      // Contributors can only edit their own open issues
      if (existing.reporter_id !== userId) {
        sendForbidden(res, 'You can only edit your own issues');
        return;
      }
      if (existing.status !== 'open') {
        sendConflict(res, 'Contributors can only edit issues with status "open"');
        return;
      }
    }
    // maintainers can update any issue

    const updated = await IssuesService.updateIssue(id, body as unknown as UpdateIssueBody);
    sendSuccess(res, updated, 'Issue updated successfully');
  } catch (error) {
    console.error('Update issue error:', error);
    sendInternalError(res, 'Failed to update issue');
  }
}

// PATCH 

export async function updateIssueStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendBadRequest(res, 'Invalid issue ID');
      return;
    }

    const { status } = req.body as { status?: string };
    if (!status || !isValidIssueStatus(status)) {
      sendBadRequest(res, "status must be 'open', 'in_progress', or 'resolved'");
      return;
    }

    const existing = await IssuesService.getRawIssueById(id);
    if (!existing) {
      sendNotFound(res, 'Issue not found');
      return;
    }

    const updated = await IssuesService.updateIssueStatus(id, status as IssueStatus);
    sendSuccess(res, updated, 'Issue status updated successfully');
  } catch (error) {
    console.error('Update issue status error:', error);
    sendInternalError(res, 'Failed to update issue status');
  }
}

// DELETE

export async function deleteIssue(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendBadRequest(res, 'Invalid issue ID');
      return;
    }

    const existing = await IssuesService.getRawIssueById(id);
    if (!existing) {
      sendNotFound(res, 'Issue not found');
      return;
    }

    await IssuesService.deleteIssue(id);
    sendDeleted(res, 'Issue deleted successfully');
  } catch (error) {
    console.error('Delete issue error:', error);
    sendInternalError(res, 'Failed to delete issue');
  }
}
