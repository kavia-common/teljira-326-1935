const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { requirePermissions } = require('../../middleware/rbac');
const { getDb } = require('../../db');

const router = express.Router();

/**
 * @openapi
 * /api/rbac/roles:
 *   get:
 *     tags: [RBAC]
 *     summary: List roles
 *     responses:
 *       200: { description: ok }
 */
router.get('/roles', authenticate, requirePermissions('rbac.manage'), async (req, res) => {
  const { rows } = await getDb().query('SELECT * FROM roles ORDER BY name');
  return res.json(rows);
});

/**
 * @openapi
 * /api/rbac/permissions:
 *   get:
 *     tags: [RBAC]
 *     summary: List permissions
 *     responses:
 *       200: { description: ok }
 */
router.get('/permissions', authenticate, requirePermissions('rbac.manage'), async (req, res) => {
  const { rows } = await getDb().query('SELECT * FROM permissions ORDER BY name');
  return res.json(rows);
});

module.exports = router;
