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


router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);


router.post('/', authenticate, createIssue);

router.patch('/:id', authenticate, updateIssue);


router.patch('/:id/status', authenticate, requireRole('maintainer'), updateIssueStatus);
router.delete('/:id', authenticate, requireRole('maintainer'), deleteIssue);

export default router;
