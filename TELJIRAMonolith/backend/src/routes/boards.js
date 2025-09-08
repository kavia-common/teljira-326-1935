const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Board } = require('../models/Board');
const router = express.Router();

/**
 * @openapi
 * /api/boards:
 *   get:
 *     tags: [Boards]
 *     summary: List boards by project
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: integer }
 *         required: true
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const projectId = Number(req.query.projectId);
    const boards = await Board.query().where({ project_id: projectId });
    res.json(boards);
  } catch (e) { next(e); }
});

module.exports = router;
