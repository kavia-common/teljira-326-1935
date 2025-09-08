const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const { getDb } = require("../../db");

const router = express.Router();

/**
 * @openapi
 * /api/backlog:
 *   get:
 *     tags: [Backlog]
 *     summary: Get backlog issues for a project
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema: { type: string }
 *     responses:
 *       200: { description: List backlog items }
 */
router.get(
  "/",
  authenticate,
  requirePermissions("issue.read"),
  async (req, res) => {
    const { project_id } = req.query;
    if (!project_id)
      return res
        .status(400)
        .json({ error: "BadRequest", message: "project_id required" });
    const { rows } = await getDb().query(
      "SELECT * FROM issues WHERE project_id=$1 AND sprint_id IS NULL ORDER BY created_at DESC",
      [project_id],
    );
    return res.json(rows);
  },
);

module.exports = router;
