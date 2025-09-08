const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { requirePermissions } = require('../../middleware/rbac');
const { getDb } = require('../../db');
const { auditLog } = require('../../middleware/audit');
const { getIo } = require('../../socket');

const router = express.Router();

/**
 * @openapi
 * /api/issues:
 *   post:
 *     tags: [Issues]
 *     summary: Create issue
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post('/', authenticate, requirePermissions('issue.write'), async (req, res) => {
  const { project_id, sprint_id, type_id, title, description, priority } = req.body;
  // Generate simple incremental key per project
  const db = getDb();
  const count = await db.query('SELECT COUNT(*)::int as c FROM issues WHERE project_id=$1', [project_id]);
  const seq = (count.rows[0].c || 0) + 1;
  const key = seq.toString();

  const { rows } = await db.query(
    `INSERT INTO issues(project_id, sprint_id, type_id, key, title, description, priority, reporter_id) 
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [project_id, sprint_id || null, type_id, key, title, description || null, priority || 'medium', req.context.user.id]
  );
  await auditLog(req, 'issue.create', 'issue', rows[0].id, { key });
  getIo().to(`project:${project_id}`).emit('issue:created', rows[0]);
  return res.status(201).json(rows[0]);
});

router.get('/', authenticate, requirePermissions('issue.read'), async (req, res) => {
  const { project_id, sprint_id } = req.query;
  let q = 'SELECT * FROM issues';
  const args = [];
  const conds = [];
  if (project_id) {
    conds.push(`project_id=$${args.length + 1}`); args.push(project_id);
  }
  if (sprint_id) {
    conds.push(`sprint_id=$${args.length + 1}`); args.push(sprint_id);
  }
  if (conds.length) q += ' WHERE ' + conds.join(' AND ');
  q += ' ORDER BY created_at DESC';
  const { rows } = await getDb().query(q, args);
  return res.json(rows);
});

router.patch('/:id', authenticate, requirePermissions('issue.write'), async (req, res) => {
  const { status, assignee_id, points, title, description, priority } = req.body;
  const fields = [];
  const args = [];
  let i = 1;
  for (const [k, v] of Object.entries({ status, assignee_id, points, title, description, priority })) {
    if (v !== undefined) {
      fields.push(`${k}=$${i++}`);
      args.push(v);
    }
  }
  if (!fields.length) return res.status(400).json({ error: 'BadRequest', message: 'No updates' });
  args.push(req.params.id);
  const { rows } = await getDb().query(`UPDATE issues SET ${fields.join(', ')}, updated_at=now() WHERE id=$${i} RETURNING *`, args);
  if (!rows[0]) return res.status(404).json({ error: 'NotFound' });
  await auditLog(req, 'issue.update', 'issue', rows[0].id, {});
  getIo().to(`project:${rows[0].project_id}`).emit('issue:updated', rows[0]);
  return res.json(rows[0]);
});

module.exports = router;
