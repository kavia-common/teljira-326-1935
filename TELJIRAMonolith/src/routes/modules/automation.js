const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { requirePermissions } = require('../../middleware/rbac');

const router = express.Router();

/**
 * @openapi
 * /api/automation/rules:
 *   get:
 *     tags: [Automation]
 *     summary: List automation rules (placeholder)
 *     responses:
 *       200: { description: Returns empty list for now }
 */
router.get('/rules', authenticate, requirePermissions('settings.admin'), async (req, res) => {
  return res.json([]);
});

module.exports = router;
