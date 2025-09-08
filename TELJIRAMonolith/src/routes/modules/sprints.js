const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const sprintService = require("../../services/sprints/service");

const router = express.Router();

/**
 * @openapi
 * /api/sprints:
 *   post:
 *     tags: [Sprints]
 *     summary: Create sprint
 *     description: Create a sprint within a project. Returns the created sprint.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project_id, name]
 *             properties:
 *               project_id: { type: string, description: "Project ID" }
 *               name: { type: string, description: "Sprint name" }
 *               goal: { type: string, nullable: true }
 *               start_date: { type: string, format: date, nullable: true }
 *               end_date: { type: string, format: date, nullable: true }
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  "/",
  authenticate,
  requirePermissions("sprint.write"),
  async (req, res, next) => {
    try {
      const created = await sprintService.createSprint(req, req.body || {});
      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/sprints/{id}/state:
 *   patch:
 *     tags: [Sprints]
 *     summary: Update sprint state
 *     description: Update the state of a sprint (planned, started, completed, etc.).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [state]
 *             properties:
 *               state: { type: string }
 *     responses:
 *       200: { description: Updated sprint }
 *       404: { description: Sprint not found }
 */
router.patch(
  "/:id/state",
  authenticate,
  requirePermissions("sprint.write"),
  async (req, res, next) => {
    try {
      const updated = await sprintService.updateSprintState(req, {
        sprint_id: req.params.id,
        state: req.body?.state,
      });
      return res.json(updated);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/sprints/{id}/complete:
 *   post:
 *     tags: [Sprints]
 *     summary: Complete a sprint
 *     description: >
 *       Marks a sprint as completed. Optionally moves incomplete issues back to backlog or (placeholder) to the next sprint.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               move_incomplete:
 *                 type: string
 *                 enum: [backlog, next]
 *                 description: Where to move incomplete issues. Default is backlog.
 *     responses:
 *       200:
 *         description: Completion summary
 */
router.post(
  "/:id/complete",
  authenticate,
  requirePermissions("sprint.write"),
  async (req, res, next) => {
    try {
      const result = await sprintService.completeSprint(req, {
        sprint_id: req.params.id,
        move_incomplete: req.body?.move_incomplete || "backlog",
      });
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  },
);

module.exports = router;
