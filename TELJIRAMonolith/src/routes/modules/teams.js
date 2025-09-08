const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const { getDb } = require("../../db");

const router = express.Router();

/**
 * @openapi
 * /api/teams:
 *   get:
 *     tags: [Teams]
 *     summary: List teams (placeholder)
 *     responses:
 *       200: { description: ok }
 */
router.get(
  "/",
  authenticate,
  requirePermissions("project.read"),
  async (req, res) => {
    const { rows } = await getDb().query(
      "SELECT * FROM teams ORDER BY created_at DESC",
    );
    return res.json(rows);
  },
);

module.exports = router;
