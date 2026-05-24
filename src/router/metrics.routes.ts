import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import pool from '../config/database';
import { sendSuccess, sendInternalError } from '../utils/response';

const router = Router();

// GET 
router.get(
  '/',
  authenticate,
  requireRole('maintainer'),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const [issueStats, userStats] = await Promise.all([
        pool.query<{ status: string; count: string }>(
          `SELECT status, COUNT(*) as count FROM issues GROUP BY status`,
        ),
        pool.query<{ role: string; count: string }>(
          `SELECT role, COUNT(*) as count FROM users GROUP BY role`,
        ),
      ]);

      const issuesByStatus: Record<string, number> = {};
      for (const row of issueStats.rows) {
        issuesByStatus[row.status] = parseInt(row.count, 10);
      }

      const usersByRole: Record<string, number> = {};
      for (const row of userStats.rows) {
        usersByRole[row.role] = parseInt(row.count, 10);
      }

      const totalIssues = Object.values(issuesByStatus).reduce((a, b) => a + b, 0);
      const totalUsers = Object.values(usersByRole).reduce((a, b) => a + b, 0);

      sendSuccess(res, {
        issues: {
          total: totalIssues,
          by_status: issuesByStatus,
        },
        users: {
          total: totalUsers,
          by_role: usersByRole,
        },
      });
    } catch (error) {
      console.error('Metrics error:', error);
      sendInternalError(res, 'Failed to retrieve metrics');
    }
  },
);

export default router;
