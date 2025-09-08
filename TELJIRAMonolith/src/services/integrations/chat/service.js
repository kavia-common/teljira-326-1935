"use strict";

const logger = require("../../../utils/logger");
const { auditLog } = require("../../../middleware/audit");

/**
 * Chat/Webhook Integrations Service
 * Focused on external chat/webhook commands or direct posts (distinct from internal notifications).
 */
class ChatService {
  // PUBLIC_INTERFACE
  /**
   * Handle inbound webhook payloads from chat providers (stub).
   * @param {import('express').Request} req
   * @param {{ provider: 'teams'|'slack'|'custom', payload: any }} args
   * @returns {Promise<{ok:boolean, response:any}>}
   */
  async handleInboundWebhook(req, { provider, payload }) {
    if (!provider) {
      const e = new Error("provider required");
      e.status = 400;
      e.code = "bad_request";
      throw e;
    }
    await this.safeAudit(req, "integrations.chat.inbound", "webhook", provider, { size: JSON.stringify(payload || {}).length });
    // Placeholder: parse command, route to handlers.
    logger.info("Inbound chat webhook (stub)", { provider });
    return { ok: true, response: { message: "received", provider } };
  }

  // PUBLIC_INTERFACE
  /**
   * Post a message to chat provider via webhook (stub).
   * @param {import('express').Request} req
   * @param {{ provider: 'teams'|'slack'|'custom', target: { webhook_url?: string }, message: string, options?: any }} args
   * @returns {Promise<{ok:boolean, sentTo?:string, provider:string}>}
   */
  async postMessage(req, { provider, target, message, options }) {
    if (!provider || !message) {
      const e = new Error("provider and message are required");
      e.status = 400;
      e.code = "bad_request";
      throw e;
    }
    await this.safeAudit(req, "integrations.chat.post", "chat", provider, { hasWebhook: !!target?.webhook_url, options });
    // Placeholder: send to provider URL; for now log only.
    logger.info("Posting chat message (stub)", { provider, len: message.length });
    return { ok: true, sentTo: target?.webhook_url, provider };
  }

  async safeAudit(req, action, resourceType, resourceId, metadata) {
    try {
      await auditLog(req, action, resourceType, resourceId, metadata);
    } catch (_) {
      // swallow
    }
  }
}

module.exports = new ChatService();
