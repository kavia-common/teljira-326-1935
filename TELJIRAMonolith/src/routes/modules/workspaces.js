const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { requirePermissions } = require('../../middleware/rbac');
const { getDb } = require('../../db');
const { auditLog } = require('../../middleware/audit');

const router = express.Router();

/**
 * @openapi
 * /api/workspaces:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create a workspace
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, key]
 *             properties:
 *               name: { type: string }
 *               key: { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post('/', authenticate, requirePermissions('settings.admin'), async (req, res) => {
  const { name, key } = req.body;
  const { rows } = await getDb().query(
    'INSERT INTO workspaces(name, key, created_by) VALUES($1,$2,$3) RETURNING *',
    [name, key, req.context.user.id]
  );
  await auditLog(req, 'workspace.create', 'workspace', rows[0].id, { key });
  return res.status(201).json(rows[0]);
});

router.get('/', authenticate, requirePermissions('project.read'), async (req, res) => {
  const { rows } = await getDb().query('SELECT * FROM workspaces ORDER BY created_at DESC');
  return res.json(rows);
});

module.exports = router;
