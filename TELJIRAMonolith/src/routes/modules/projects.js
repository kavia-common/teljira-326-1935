const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { requirePermissions } = require('../../middleware/rbac');
const { getDb } = require('../../db');
const { auditLog } = require('../../middleware/audit');
const { getIo } = require('../../socket');

const router = express.Router();

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a project
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspace_id, name, key]
 *             properties:
 *               workspace_id: { type: string }
 *               name: { type: string }
 *               key: { type: string }
 *               type: { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post('/', authenticate, requirePermissions('project.write'), async (req, res) => {
  const { workspace_id, name, key, type } = req.body;
  const { rows } = await getDb().query(
    'INSERT INTO projects(workspace_id, name, key, type, lead_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [workspace_id, name, key, type || 'software', req.context.user.id]
  );
  await auditLog(req, 'project.create', 'project', rows[0].id, { key });
  getIo().to('global').emit('project:created', rows[0]);
  return res.status(201).json(rows[0]);
});

router.get('/', authenticate, requirePermissions('project.read'), async (req, res) => {
  const { rows } = await getDb().query('SELECT * FROM projects ORDER BY created_at DESC');
  return res.json(rows);
});

module.exports = router;
