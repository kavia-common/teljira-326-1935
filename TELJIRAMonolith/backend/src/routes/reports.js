const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Issue } = require('../models/Issue');

const router = express.Router();

/**
 * @openapi
 * /api/reports/velocity:
 *   get:
 *     tags: [Reports]
 *     summary: Velocity report (simple)
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/velocity', authMiddleware, async (_req, res, next) => {
  try {
    const [{ count }] = await Issue.query().where({ status: 'done' }).count();
    res.json({ completedIssues: Number(count) });
  } catch (e) { next(e); }
});

module.exports = router;
