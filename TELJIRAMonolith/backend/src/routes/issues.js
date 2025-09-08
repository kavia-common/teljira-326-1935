const express = require('express');
const Joi = require('joi');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const issueService = require('../services/issueService');

const router = express.Router();

/**
 * @openapi
 * /api/issues/backlog:
 *   get:
 *     tags: [Issues]
 *     summary: Backlog list
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema: { type: integer }
 */
router.get('/backlog', authMiddleware, async (req, res, next) => {
  try {
    const { projectId } = await Joi.object({ projectId: Joi.number().integer().required() }).validateAsync(req.query);
    const list = await issueService.backlog(Number(projectId));
    res.json(list);
  } catch (e) { next(e); }
});

router.post('/', authMiddleware, requirePermission('issue:*'), async (req, res, next) => {
  try {
    const body = await Joi.object({
      projectId: Joi.number().integer().required(),
      title: Joi.string().required(),
      type: Joi.string().valid('task','bug','story','epic').optional(),
      description: Joi.string().allow(''),
      reporter_id: Joi.number().integer().allow(null),
      assignee_id: Joi.number().integer().allow(null),
      story_points: Joi.number().integer().allow(null),
      priority: Joi.number().integer().min(1).max(5).optional(),
      custom_fields: Joi.object().optional()
    }).validateAsync(req.body);
    const issue = await issueService.create(body.projectId, body);
    res.json(issue);
  } catch (e) { next(e); }
});

router.patch('/:id', authMiddleware, requirePermission('issue:update'), async (req, res, next) => {
  try {
    const patch = await Joi.object({
      title: Joi.string(),
      description: Joi.string().allow(''),
      status: Joi.string(),
      assignee_id: Joi.number().integer().allow(null),
      story_points: Joi.number().integer().allow(null),
      priority: Joi.number().integer().min(1).max(5),
      sprint_id: Joi.number().integer().allow(null)
    }).validateAsync(req.body);
    const updated = await issueService.update(Number(req.params.id), patch);
    res.json(updated);
  } catch (e) { next(e); }
});

router.post('/:id/transition', authMiddleware, requirePermission('issue:update'), async (req, res, next) => {
  try {
    const { status } = await Joi.object({ status: Joi.string().required() }).validateAsync(req.body);
    const updated = await issueService.transition(Number(req.params.id), status);
    res.json(updated);
  } catch (e) { next(e); }
});

module.exports = router;
