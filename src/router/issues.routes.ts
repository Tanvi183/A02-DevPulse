import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
} from '../controller/issues.controller';

const router = Router();

// Public routes
router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);

// Authenticated routes (contributor + maintainer)
router.post('/', authenticate, createIssue);

// Authenticated routes with logic handled in controller
router.patch('/:id', authenticate, updateIssue);

// Maintainer-only routes
router.patch('/:id/status', authenticate, requireRole('maintainer'), updateIssueStatus);
router.delete('/:id', authenticate, requireRole('maintainer'), deleteIssue);

export default router;
