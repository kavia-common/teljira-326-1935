const express = require('express');
const Joi = require('joi');
const { authMiddleware, requireRole } = require('../middleware/auth');
const svc = require('../services/webhookService');

const router = express.Router();

/**
 * @openapi
 * /api/webhooks:
 *   get:
 *     tags: [Webhooks]
 *     summary: List webhook subscriptions
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/', authMiddleware, requireRole('org_admin'), async (_req, res, next) => {
  try {
    const list = await svc.list();
    res.json(list);
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/webhooks:
 *   post:
 *     tags: [Webhooks]
 *     summary: Subscribe to webhooks
 *     security: [ { bearerAuth: [] } ]
 */
router.post('/', authMiddleware, requireRole('org_admin'), async (req, res, next) => {
  try {
    const body = await Joi.object({ target_url: Joi.string().uri().required(), event: Joi.string().required() }).validateAsync(req.body);
    const result = await svc.subscribe(body);
    res.json(result);
  } catch (e) { next(e); }
});

module.exports = router;
