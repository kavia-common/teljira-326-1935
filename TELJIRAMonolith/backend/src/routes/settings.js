const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/settings/integrations:
 *   get:
 *     tags: [Settings]
 *     summary: List integrations
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/integrations', authMiddleware, requireRole('org_admin'), async (_req, res, next) => {
  try {
    res.json([{ key: 'sso', status: 'configured' }, { key: 'webhooks', status: 'available' }]);
  } catch (e) { next(e); }
});

module.exports = router;
