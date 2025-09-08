const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { requirePermissions } = require('../../middleware/rbac');
const { getDb } = require('../../db');

const router = express.Router();

/**
 * @openapi
 * /api/reports/summary:
 *   get:
 *     tags: [Reports]
 *     summary: Project summary (placeholder)
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema: { type: string }
 *     responses:
 *       200: { description: Summary report }
 */
router.get('/summary', authenticate, requirePermissions('project.read'), async (req, res) => {
  const { project_id } = req.query;
  if (!project_id) return res.status(400).json({ error: 'BadRequest', message: 'project_id required' });

  const db = getDb();
  const { rows } = await db.query('SELECT COUNT(*)::int as count FROM issues WHERE project_id=$1', [project_id]);
  const count = rows && rows[0] ? rows[0].count : 0;

  return res.json({ project_id, issues: count });
});

module.exports = router;
