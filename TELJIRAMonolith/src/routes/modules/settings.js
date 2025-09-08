const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { requirePermissions } = require('../../middleware/rbac');

const router = express.Router();

/**
 * @openapi
 * /api/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Fetch settings (placeholder)
 *     responses:
 *       200: { description: Settings object }
 */
router.get('/', authenticate, requirePermissions('settings.admin'), async (req, res) => {
  return res.json({ accessibility: { wcag: '2.2 AA' }, security: { mfa: true, sso: false } });
});

module.exports = router;
