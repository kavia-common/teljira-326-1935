const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const retrievalService = require("../../services/settings/retrievalService");
const updateService = require("../../services/settings/updateService");

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Settings
 *     description: Manage global application settings.
 */

/**
 * @openapi
 * /api/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Fetch global settings
 *     description: Returns the current global settings, merged with defaults when necessary.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Settings object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessibility:
 *                   type: object
 *                   properties:
 *                     wcag: { type: string, description: "WCAG conformance target" }
 *                 security:
 *                   type: object
 *                   properties:
 *                     mfa: { type: boolean }
 *                     sso: { type: boolean }
 *                 notifications:
 *                   type: object
 *                   properties:
 *                     email_enabled: { type: boolean }
 *                     teams_enabled: { type: boolean }
 */
router.get(
  "/",
  authenticate,
  requirePermissions("settings.admin"),
  async (req, res, next) => {
    try {
      const settings = await retrievalService.getGlobalSettings();
      return res.json(settings);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/settings:
 *   patch:
 *     tags: [Settings]
 *     summary: Update global settings
 *     description: Partially update global settings by providing only the fields to change.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessibility:
 *                 type: object
 *                 properties:
 *                   wcag: { type: string }
 *               security:
 *                 type: object
 *                 properties:
 *                   mfa: { type: boolean }
 *                   sso: { type: boolean }
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email_enabled: { type: boolean }
 *                   teams_enabled: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated settings
 *       400:
 *         description: Validation error
 */
router.patch(
  "/",
  authenticate,
  requirePermissions("settings.admin"),
  async (req, res, next) => {
    try {
      const updated = await updateService.updateGlobalSettings(req, {
        patch: req.body || {},
      });
      return res.json(updated);
    } catch (e) {
      if (e.status === 400) {
        return res.status(400).json({
          error: "BadRequest",
          code: e.code || "ValidationError",
          message: e.message,
          details: e.details,
        });
      }
      return next(e);
    }
  },
);

module.exports = router;
