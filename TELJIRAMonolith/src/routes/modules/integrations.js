const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const { gitService, reportingApiService, chatService } = require("../../services/integrations");

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Integrations
 *     description: External integrations (Git, third-party reporting APIs, chat/webhooks)
 */

/**
 * @openapi
 * /api/integrations/git/link-pr:
 *   post:
 *     tags: [Integrations]
 *     summary: Link a Pull Request to an Issue
 *     description: Associates a PR URL with an internal issue key for traceability.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [issue_key, pr_url]
 *             properties:
 *               issue_key: { type: string, description: "Issue key, e.g., PROJ-123" }
 *               pr_url: { type: string, description: "Pull Request URL" }
 *               provider: { type: string, enum: [github, gitlab, bitbucket, azure], description: "Optional provider name" }
 *               metadata: { type: object, additionalProperties: true }
 *     responses:
 *       200: { description: PR linked (placeholder) }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post(
  "/git/link-pr",
  authenticate,
  requirePermissions("integrations.git.write", "issue.write"),
  async (req, res, next) => {
    try {
      const result = await gitService.linkPullRequest(req, req.body || {});
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * @openapi
 * /api/integrations/git/commits:
 *   get:
 *     tags: [Integrations]
 *     summary: Get commits for an Issue
 *     parameters:
 *       - in: query
 *         name: issue_key
 *         schema: { type: string }
 *         required: true
 *       - in: query
 *         name: provider
 *         schema: { type: string }
 *       - in: query
 *         name: since
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: until
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Commits (placeholder) }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get(
  "/git/commits",
  authenticate,
  requirePermissions("integrations.git.read", "project.read"),
  async (req, res, next) => {
    try {
      const { issue_key, provider, since, until } = req.query;
      const result = await gitService.getCommitsForIssue(req, {
        issue_key,
        provider,
        since,
        until,
      });
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * @openapi
 * /api/integrations/reporting/external:
 *   get:
 *     tags: [Integrations]
 *     summary: Fetch external report (proxy)
 *     parameters:
 *       - in: query
 *         name: report_type
 *         schema: { type: string }
 *         required: true
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, csv] }
 *       - in: query
 *         name: params
 *         schema: { type: string, description: "JSON-encoded params object" }
 *     responses:
 *       200:
 *         description: External report (json/csv)
 */
router.get(
  "/reporting/external",
  authenticate,
  requirePermissions("integrations.reporting.read"),
  async (req, res, next) => {
    try {
      const { report_type, format, params } = req.query;
      let parsedParams = undefined;
      if (typeof params === "string") {
        try {
          parsedParams = JSON.parse(params);
        } catch {
          parsedParams = undefined;
        }
      }
      const f = (format || "json").toString().toLowerCase() === "csv" ? "csv" : "json";
      const result = await reportingApiService.fetchExternalReport(req, {
        report_type,
        params: parsedParams,
        format: f,
      });
      if (f === "csv") {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        return res.send(result);
      }
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * @openapi
 * /api/integrations/chat/inbound:
 *   post:
 *     tags: [Integrations]
 *     summary: Handle inbound chat/webhook payload
 *     description: Validates and processes inbound chat/webhook events. Signature verification should be configured per provider via environment variables.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider: { type: string, enum: [teams, slack, custom] }
 *               payload: { type: object, additionalProperties: true }
 *     responses:
 *       200: { description: ok }
 */
router.post(
  "/chat/inbound",
  // Allow unauthenticated inbound webhook if signature configured; otherwise require auth
  async (req, res, next) => {
    try {
      if (!process.env.INTEGRATIONS_INBOUND_ALLOW_ANON) {
        // default: require auth
        return requirePermissions("integrations.chat.read")(req, res, () => authenticate(req, res, next));
      }
      return next();
    } catch (e) {
      return next(e);
    }
  },
  async (req, res, next) => {
    try {
      const { provider, payload } = req.body || {};
      const result = await chatService.handleInboundWebhook(req, { provider, payload });
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * @openapi
 * /api/integrations/chat/post:
 *   post:
 *     tags: [Integrations]
 *     summary: Post a message to chat provider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider, message]
 *             properties:
 *               provider: { type: string, enum: [teams, slack, custom] }
 *               target:
 *                 type: object
 *                 properties:
 *                   webhook_url: { type: string }
 *               message: { type: string }
 *               options: { type: object, additionalProperties: true }
 *     responses:
 *       200: { description: ok }
 */
router.post(
  "/chat/post",
  authenticate,
  requirePermissions("integrations.chat.write"),
  async (req, res, next) => {
    try {
      const result = await chatService.postMessage(req, req.body || {});
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  }
);

module.exports = router;
