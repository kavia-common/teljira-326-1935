const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const AutomationEngine = require("../../services/automation/engine");

const router = express.Router();

/**
 * @openapi
 * /api/automation/rules:
 *   get:
 *     tags: [Automation]
 *     summary: List automation rules (in-memory, MVP)
 *     description: Returns the current in-memory rule set used by the Automation Engine (will be DB-backed in future).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of rules
 */
router.get(
  "/rules",
  authenticate,
  requirePermissions("settings.admin"),
  async (req, res) => {
    const rules = AutomationEngine.getRulesForScope({ data: {} });
    return res.json(rules);
  },
);

/**
 * @openapi
 * /api/automation/evaluate:
 *   post:
 *     tags: [Automation]
 *     summary: Evaluate automation rules for an event (dry-run)
 *     description: >
 *       Evaluates the Automation Engine for a provided event and returns which rules would match and what actions
 *       would be executed. In MVP, actions are executed but this endpoint can be used for testing in non-production.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, data]
 *             properties:
 *               type: { type: string, example: "issue.created" }
 *               data: { type: object }
 *     responses:
 *       200:
 *         description: Evaluation summary
 */
router.post(
  "/evaluate",
  authenticate,
  requirePermissions("settings.admin"),
  async (req, res) => {
    const summary = await AutomationEngine.evaluateAndExecute(req, {
      type: req.body?.type,
      data: req.body?.data || {},
      actor: req.context.user,
    });
    return res.json(summary);
  },
);

module.exports = router;
