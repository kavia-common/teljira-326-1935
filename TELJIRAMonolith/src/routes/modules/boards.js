const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const { getDb } = require("../../db");
const { auditLog } = require("../../middleware/audit");

const router = express.Router();

/**
 * @openapi
 * /api/boards:
 *   post:
 *     tags: [Boards]
 *     summary: Create board
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post(
  "/",
  authenticate,
  requirePermissions("board.write"),
  async (req, res) => {
    const { project_id, name, type, config } = req.body;
    const { rows } = await getDb().query(
      "INSERT INTO boards(project_id, name, type, config) VALUES ($1,$2,$3,$4) RETURNING *",
      [project_id, name, type || "scrum", config || {}],
    );
    await auditLog(req, "board.create", "board", rows[0].id, {});
    return res.status(201).json(rows[0]);
  },
);

router.get(
  "/",
  authenticate,
  requirePermissions("board.read"),
  async (req, res) => {
    const { rows } = await getDb().query(
      "SELECT * FROM boards ORDER BY created_at DESC",
    );
    return res.json(rows);
  },
);

module.exports = router;
