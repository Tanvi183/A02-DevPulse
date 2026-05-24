import pool from '../config/database';
import {
  Issue,
  IssueWithReporter,
  CreateIssueBody,
  UpdateIssueBody,
  IssueQueryParams,
  ReporterInfo,
  IssueStatus,
} from '../types/index';

// ─── Fetch reporter info by id ────────────────────────────────────────────────

async function getReporter(id: number): Promise<ReporterInfo | null> {
  const result = await pool.query<ReporterInfo>(
    'SELECT id, name, role FROM users WHERE id = $1 LIMIT 1',
    [id],
  );
  return result.rows[0] ?? null;
}

// ─── Batch-fetch reporters to avoid N+1 ──────────────────────────────────────

async function getReporterMap(
  ids: number[],
): Promise<Map<number, ReporterInfo>> {
  if (ids.length === 0) return new Map();

  // Build placeholders: $1, $2, ...
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  const result = await pool.query<ReporterInfo>(
    `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
    ids,
  );

  const map = new Map<number, ReporterInfo>();
  for (const row of result.rows) {
    map.set(row.id, row);
  }
  return map;
}

// ─── Get All Issues ───────────────────────────────────────────────────────────

export async function getAllIssues(
  params: IssueQueryParams,
): Promise<IssueWithReporter[]> {
  const { sort = 'newest', type, status } = params;

  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (type) {
    conditions.push(`type = $${idx++}`);
    values.push(type);
  }

  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause =
    sort === 'oldest' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';

  const result = await pool.query<Issue>(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    values,
  );

  const issues = result.rows;
  if (issues.length === 0) return [];

  // Batch-fetch reporters – avoids N+1 queries
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const reporterMap = await getReporterMap(reporterIds);

  return issues.map(({ reporter_id, ...rest }) => ({
    ...rest,
    reporter: reporterMap.get(reporter_id) ?? {
      id: reporter_id,
      name: 'Unknown',
      role: 'contributor',
    },
  }));
}

// ─── Get Single Issue ─────────────────────────────────────────────────────────

export async function getIssueById(id: number): Promise<IssueWithReporter | null> {
  const result = await pool.query<Issue>(
    'SELECT * FROM issues WHERE id = $1 LIMIT 1',
    [id],
  );

  const issue = result.rows[0];
  if (!issue) return null;

  const reporter = await getReporter(issue.reporter_id);

  const { reporter_id, ...rest } = issue;
  return {
    ...rest,
    reporter: reporter ?? { id: reporter_id, name: 'Unknown', role: 'contributor' },
  };
}

// ─── Get Raw Issue (for permission checks) ───────────────────────────────────

export async function getRawIssueById(id: number): Promise<Issue | null> {
  const result = await pool.query<Issue>(
    'SELECT * FROM issues WHERE id = $1 LIMIT 1',
    [id],
  );
  return result.rows[0] ?? null;
}

// ─── Create Issue ─────────────────────────────────────────────────────────────

export async function createIssue(
  body: CreateIssueBody,
  reporterId: number,
): Promise<Issue> {
  const result = await pool.query<Issue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [body.title.trim(), body.description.trim(), body.type, reporterId],
  );
  return result.rows[0];
}

// ─── Update Issue ─────────────────────────────────────────────────────────────

export async function updateIssue(
  id: number,
  body: UpdateIssueBody,
): Promise<Issue | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (body.title !== undefined) {
    setClauses.push(`title = $${idx++}`);
    values.push(body.title.trim());
  }

  if (body.description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    values.push(body.description.trim());
  }

  if (body.type !== undefined) {
    setClauses.push(`type = $${idx++}`);
    values.push(body.type);
  }

  if (setClauses.length === 0) return getRawIssueById(id);

  // Always refresh updated_at
  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query<Issue>(
    `UPDATE issues SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;
}

// ─── Update Issue Status ──────────────────────────────────────────────────────

export async function updateIssueStatus(
  id: number,
  status: IssueStatus,
): Promise<Issue | null> {
  const result = await pool.query<Issue>(
    `UPDATE issues SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id],
  );
  return result.rows[0] ?? null;
}

// ─── Delete Issue ─────────────────────────────────────────────────────────────

export async function deleteIssue(id: number): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM issues WHERE id = $1',
    [id],
  );
  return (result.rowCount ?? 0) > 0;
}
