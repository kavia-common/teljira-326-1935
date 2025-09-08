const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { requirePermissions } = require('../../middleware/rbac');
const { getDb } = require('../../db');
const { auditLog } = require('../../middleware/audit');

const router = express.Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', authenticate, requirePermissions('user.read'), async (req, res) => {
  const { rows } = await getDb().query('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC');
  return res.json(rows);
});

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200: { description: User }
 */
router.get('/:id', authenticate, requirePermissions('user.read'), async (req, res) => {
  const { rows } = await getDb().query('SELECT id, email, name, created_at FROM users WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'NotFound', message: 'User not found' });
  return res.json(rows[0]);
});

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     responses:
 *       204: { description: Deleted }
 */
router.delete('/:id', authenticate, requirePermissions('user.write'), async (req, res) => {
  await getDb().query('DELETE FROM users WHERE id=$1', [req.params.id]);
  await auditLog(req, 'user.delete', 'user', req.params.id, {});
  return res.status(204).end();
});

module.exports = router;
