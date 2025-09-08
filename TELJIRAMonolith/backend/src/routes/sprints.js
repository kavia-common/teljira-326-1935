const express = require('express');
const Joi = require('joi');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const sprintService = require('../services/sprintService');

const router = express.Router();

/**
 * @openapi
 * /api/sprints:
 *   get:
 *     tags: [Sprints]
 *     summary: List sprints
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: integer }
 *         required: true
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { projectId } = await Joi.object({ projectId: Joi.number().integer().required() }).validateAsync(req.query);
    const list = await sprintService.list(Number(projectId));
    res.json(list);
  } catch (e) { next(e); }
});

router.post('/', authMiddleware, requirePermission('sprint:*'), async (req, res, next) => {
  try {
    const body = await Joi.object({
      projectId: Joi.number().integer().required(),
      name: Joi.string().required(),
      start_date: Joi.string().allow(null),
      end_date: Joi.string().allow(null),
      goal_points: Joi.number().integer().allow(null)
    }).validateAsync(req.body);
    const s = await sprintService.create(body.projectId, body);
    res.json(s);
  } catch (e) { next(e); }
});

router.post('/:id/start', authMiddleware, requirePermission('sprint:*'), async (req, res, next) => {
  try {
    const s = await sprintService.start(Number(req.params.id));
    res.json(s);
  } catch (e) { next(e); }
});

router.post('/:id/complete', authMiddleware, requirePermission('sprint:*'), async (req, res, next) => {
  try {
    const s = await sprintService.complete(Number(req.params.id));
    res.json(s);
  } catch (e) { next(e); }
});

module.exports = router;
