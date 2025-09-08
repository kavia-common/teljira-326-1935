"use strict";

const logger = require("../../../utils/logger");

/**
 * EmailAdapter formats and dispatches email notifications.
 * For MVP, this is a stub that logs the outgoing message.
 * Real implementation would use SMTP transport and templates.
 */
class EmailAdapter {
  /**
   * Build a channel-specific message model from generic event data.
   * @param {{event_type:string, recipients:any[], data:any, priority?:string, metadata?:any}} input
   * @returns {Promise<{subject:string, html:string, text:string, to:string[]}>}
   */
  async format({ event_type, recipients, data, priority }) {
    const subject = `[SprintFlow] ${event_type}`;
    const text = `Event: ${event_type}\nPriority: ${priority || "normal"}\n\n${JSON.stringify(data, null, 2)}`;
    const html =
      `<p><strong>Event:</strong> ${event_type}</p>` +
      `<p><strong>Priority:</strong> ${priority || "normal"}</p>` +
      `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
    const to = recipients
      .map((r) => r.email)
      .filter(Boolean);

    return { subject, html, text, to };
  }

  /**
   * Send formatted email. This stub just logs and returns success.
   * Replace with nodemailer/SMTP provider as needed.
   * @param {{subject:string, html:string, text:string, to:string[]}} formatted
   * @returns {Promise<{provider:"stub-email", sentTo:string[]}>}
   */
  async send(formatted) {
    if (!formatted.to || formatted.to.length === 0) {
      throw new Error("no_recipients_for_email");
    }
    logger.info("EmailAdapter send (stub)", {
      to: formatted.to,
      subject: formatted.subject,
    });
    return { provider: "stub-email", sentTo: formatted.to };
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = EmailAdapter;
