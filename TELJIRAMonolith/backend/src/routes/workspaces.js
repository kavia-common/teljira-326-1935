const express = require('express');
const Joi = require('joi');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { Workspace } = require('../models/Workspace');

const router = express.Router();

/**
 * @openapi
 * /api/workspaces:
 *   get:
 *     tags: [Workspaces]
 *     summary: List workspaces
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/', authMiddleware, async (_req, res, next) => {
  try {
    const list = await Workspace.query().where({ archived: false });
    res.json(list);
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/workspaces:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create workspace
 *     security: [ { bearerAuth: [] } ]
 */
router.post('/', authMiddleware, requireRole('org_admin'), async (req, res, next) => {
  try {
    const body = await Joi.object({ name: Joi.string().required(), description: Joi.string().allow('') }).validateAsync(req.body);
    const ws = await Workspace.query().insertAndFetch(body);
    res.json(ws);
  } catch (e) { next(e); }
});

module.exports = router;
