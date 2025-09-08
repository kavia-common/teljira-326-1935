const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const issueService = require("../../services/issues/service");
const AutomationEngine = require("../../services/automation/engine");

const router = express.Router();

/**
 * @openapi
 * /api/issues:
 *   post:
 *     tags: [Issues]
 *     summary: Create issue
 *     description: >
 *       Creates a new issue within a project and emits a real-time event. Triggers the Automation Engine
 *       which evaluates rules for the "issue.created" event and may perform follow-up actions (e.g., notifications).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post(
  "/",
  authenticate,
  requirePermissions("issue.write"),
  async (req, res, next) => {
    try {
      const created = await issueService.createIssue(req, {
        project_id: req.body?.project_id,
        sprint_id: req.body?.sprint_id || null,
        type_id: req.body?.type_id || null,
        title: req.body?.title,
        description: req.body?.description || null,
        priority: req.body?.priority || "medium",
      });

      // Fire automation engine asynchronously; ignore errors for response
      AutomationEngine.evaluateAndExecute(req, {
        type: "issue.created",
        data: { issue: created, project_id: created.project_id },
        actor: req.context.user,
      }).catch(() => {});

      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/issues:
 *   get:
 *     tags: [Issues]
 *     summary: List issues
 *     description: List issues filtered by project_id and/or sprint_id.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema: { type: string }
 *       - in: query
 *         name: sprint_id
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of issues }
 */
router.get(
  "/",
  authenticate,
  requirePermissions("issue.read"),
  async (req, res, next) => {
    try {
      const rows = await issueService.listIssues(req, {
        project_id: req.query?.project_id,
        sprint_id: req.query?.sprint_id,
      });
      return res.json(rows);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/issues/{id}:
 *   patch:
 *     tags: [Issues]
 *     summary: Update issue fields
 *     description: Partially update an issue (status, assignee_id, points, title, description, priority).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated issue }
 *       404: { description: Issue not found }
 */
router.patch(
  "/:id",
  authenticate,
  requirePermissions("issue.write"),
  async (req, res, next) => {
    try {
      const updated = await issueService.updateIssue(req, {
        issue_id: req.params.id,
        fields: req.body || {},
      });
      return res.json(updated);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/issues/{id}/transition:
 *   post:
 *     tags: [Issues]
 *     summary: Transition issue status (MVP)
 *     description: Change issue status. Future iterations will validate against a workflow.
 *     security: [{ bearerAuth: [] }]
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
 *             required: [to_status]
 *             properties:
 *               to_status: { type: string }
 *     responses:
 *       200: { description: Updated issue }
 *       400: { description: BadRequest }
 *       404: { description: NotFound }
 */
router.post(
  "/:id/transition",
  authenticate,
  requirePermissions("issue.write"),
  async (req, res, next) => {
    try {
      const updated = await issueService.transitionIssue(req, {
        issue_id: req.params.id,
        to_status: req.body?.to_status,
      });
      return res.json(updated);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/issues/link:
 *   post:
 *     tags: [Issues]
 *     summary: Link two issues (MVP stub)
 *     description: Creates a relationship between two issues. Currently a stub for future implementation.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [source_id, target_id, type]
 *             properties:
 *               source_id: { type: string }
 *               target_id: { type: string }
 *               type: { type: string, example: "relates_to" }
 *     responses:
 *       200: { description: Link operation result }
 *       400: { description: BadRequest }
 */
router.post(
  "/link",
  authenticate,
  requirePermissions("issue.write"),
  async (req, res, next) => {
    try {
      const result = await issueService.linkIssues(req, {
        source_id: req.body?.source_id,
        target_id: req.body?.target_id,
        type: req.body?.type,
      });
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/issues/{id}:
 *   delete:
 *     tags: [Issues]
 *     summary: Delete an issue
 *     description: Permanently deletes an issue.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: NotFound }
 */
router.delete(
  "/:id",
  authenticate,
  requirePermissions("issue.write"),
  async (req, res, next) => {
    try {
      await issueService.deleteIssue(req, { issue_id: req.params.id });
      return res.status(204).end();
    } catch (e) {
      return next(e);
    }
  },
);

module.exports = router;
