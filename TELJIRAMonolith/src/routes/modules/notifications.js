"use strict";

const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const dispatcher = require("../../services/notifications/dispatcher");

const router = express.Router();

/**
 * @openapi
 * /api/notifications/dispatch:
 *   post:
 *     tags: [Notifications]
 *     summary: Dispatch a notification event to one or more channels
 *     description: >
 *       Accepts a generic notification payload and routes to configured channels (email, teams, in-app).
 *       Requires the notifications.send permission. This is a synchronous dispatch; for high volume
 *       workloads consider queue-backed async processing.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [event_type, recipients, channels, data]
 *             properties:
 *               event_type:
 *                 type: string
 *                 description: Event identifier (e.g., issue.created)
 *               recipients:
 *                 type: array
 *                 description: Recipient descriptors (email, teams webhook url, or socket room)
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string, description: User ID }
 *                     email: { type: string, format: email }
 *                     teams_webhook_url: { type: string }
 *                     user_socket_room: { type: string, example: "user:{id}" }
 *                     project_socket_room: { type: string, example: "project:{id}" }
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [email, teams, in-app]
 *               data:
 *                 type: object
 *                 description: Arbitrary event data to merge into templates
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high]
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Per-channel dispatch results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       channel: { type: string }
 *                       success: { type: boolean }
 *                       details: { type: object, nullable: true }
 *                       error: { type: string, nullable: true }
 *       400:
 *         description: Validation error
 */
router.post(
  "/dispatch",
  authenticate,
  requirePermissions("notifications.send"),
  async (req, res, next) => {
    try {
      const result = await dispatcher.dispatch(req, req.body);
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  },
);

module.exports = router;
