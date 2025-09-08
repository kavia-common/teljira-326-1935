"use strict";

const logger = require("../../utils/logger");
const { auditLog } = require("../../middleware/audit");
const { getIo } = require("../../socket");
const EmailAdapter = require("./adapters/emailAdapter");
const TeamsAdapter = require("./adapters/teamsAdapter");
const InAppAdapter = require("./adapters/inAppAdapter");

/**
 * Notification Dispatcher orchestrates event validation, channel selection,
 * formatting, delivery via adapters, and audit logging.
 */
class NotificationDispatcher {
  constructor({ adapters } = {}) {
    // Register pluggable channel adapters
    this.adapters = adapters || {
      email: new EmailAdapter(),
      teams: new TeamsAdapter(),
      "in-app": new InAppAdapter(),
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Dispatch a notification event to one or more channels.
   * This is a public function intended for use by routes and internal services.
   * Expected payload:
   * {
   *   event_type: "issue.created" | "issue.updated" | ...,
   *   recipients: [{ id?, email?, teams_webhook_url?, user_socket_room? }, ...],
   *   channels: ["email","teams","in-app"],
   *   data: { ... arbitrary event data ... },
   *   priority?: "low"|"normal"|"high",
   *   metadata?: { ... },
   * }
   * @param {import("express").Request|null} req Express request for audit context (nullable for internal use).
   * @param {object} payload Notification payload as specified above.
   * @returns {Promise<{results: Array<{channel:string, success:boolean, details?:any, error?:string}>}>}
   */
  async dispatch(req, payload) {
    // Basic validation
    const errors = this.validatePayload(payload);
    if (errors.length) {
      const e = new Error("Invalid notification payload: " + errors.join("; "));
      e.status = 400;
      throw e;
    }

    const { event_type, recipients, channels, data, priority, metadata } = payload;

    // Emit a generic internal event via Socket.IO for observability if needed
    try {
      getIo().to("global").emit("notification:received", {
        event_type,
        channels,
        priority: priority || "normal",
      });
    } catch (e) {
      // Socket not initialized in some contexts; ignore
    }

    // Deliver via each selected channel
    const results = [];
    for (const channel of channels) {
      const adapter = this.adapters[channel];
      if (!adapter) {
        results.push({
          channel,
          success: false,
          error: "Unsupported channel",
        });
        continue;
      }
      try {
        // Prepare message contents via adapter format
        const formatted = await adapter.format({ event_type, recipients, data, priority, metadata });
        // Send and capture delivery info
        const delivery = await adapter.send(formatted, { recipients, priority, metadata });

        // Audit per channel delivery attempt
        await this.safeAudit(req, "notification.dispatch", "notification", event_type, {
          channel,
          success: true,
          count: Array.isArray(delivery?.sentTo) ? delivery.sentTo.length : undefined,
        });

        results.push({ channel, success: true, details: delivery });
      } catch (err) {
        logger.error("Notification dispatch failed", { channel, err, event_type });
        await this.safeAudit(req, "notification.dispatch", "notification", event_type, {
          channel,
          success: false,
          error: err?.message || "dispatch_failed",
        });
        results.push({ channel, success: false, error: err?.message || "dispatch_failed" });
      }
    }

    return { results };
  }

  /**
   * Validate incoming notification payload structure.
   * @param {any} payload
   * @returns {string[]} list of error messages
   */
  validatePayload(payload) {
    const errs = [];
    if (!payload || typeof payload !== "object") {
      return ["payload required"];
    }
    if (!payload.event_type || typeof payload.event_type !== "string") {
      errs.push("event_type required");
    }
    if (!Array.isArray(payload.recipients) || payload.recipients.length === 0) {
      errs.push("recipients array required");
    }
    if (!Array.isArray(payload.channels) || payload.channels.length === 0) {
      errs.push("channels array required");
    }
    return errs;
  }

  /**
   * Audit helper that won't throw to caller.
   */
  async safeAudit(req, action, resourceType, resourceId, metadata) {
    try {
      await auditLog(req, action, resourceType, resourceId, metadata);
    } catch (_) {
      // Avoid crashing on audit failure
    }
  }
}

module.exports = new NotificationDispatcher({});
