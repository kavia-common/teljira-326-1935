const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { requirePermissions } = require('../../middleware/rbac');
const { getDb } = require('../../db');
const { auditLog } = require('../../middleware/audit');
const { getIo } = require('../../socket');

const router = express.Router();

/**
 * @openapi
 * /api/sprints:
 *   post:
 *     tags: [Sprints]
 *     summary: Create sprint
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post('/', authenticate, requirePermissions('sprint.write'), async (req, res) => {
  const { project_id, name, goal, start_date, end_date } = req.body;
  const { rows } = await getDb().query(
    'INSERT INTO sprints(project_id, name, goal, start_date, end_date, state) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [project_id, name, goal || null, start_date || null, end_date || null, 'planned']
  );
  await auditLog(req, 'sprint.create', 'sprint', rows[0].id, {});
  getIo().to(`project:${project_id}`).emit('sprint:created', rows[0]);
  return res.status(201).json(rows[0]);
});

router.patch('/:id/state', authenticate, requirePermissions('sprint.write'), async (req, res) => {
  const { state } = req.body;
  const { rows } = await getDb().query('UPDATE sprints SET state=$1 WHERE id=$2 RETURNING *', [state, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'NotFound' });
  await auditLog(req, 'sprint.state.update', 'sprint', rows[0].id, { state });
  return res.json(rows[0]);
});

module.exports = router;
