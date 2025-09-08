const express = require('express');
const Joi = require('joi');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const projectService = require('../services/projectService');

const router = express.Router();

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: List projects by workspace
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         schema: { type: integer }
 *         required: true
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { workspaceId } = await Joi.object({ workspaceId: Joi.number().integer().required() }).validateAsync(req.query);
    const list = await projectService.list(Number(workspaceId));
    res.json(list);
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a project
 *     security: [ { bearerAuth: [] } ]
 */
router.post('/', authMiddleware, requirePermission('project:*'), async (req, res, next) => {
  try {
    const { workspaceId, key, name, description } = await Joi.object({
      workspaceId: Joi.number().integer().required(),
      key: Joi.string().min(2).max(10).required(),
      name: Joi.string().required(),
      description: Joi.string().allow('')
    }).validateAsync(req.body);
    const project = await projectService.create(workspaceId, { key: key.toUpperCase(), name, description });
    res.json(project);
  } catch (e) { next(e); }
});

module.exports = router;
