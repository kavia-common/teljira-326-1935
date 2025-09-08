"use strict";

const logger = require("../../../utils/logger");

/**
 * TeamsAdapter posts simple card messages to MS Teams/Slack-compatible webhooks.
 * For MVP, this is a stub that logs the outgoing payload.
 */
class TeamsAdapter {
  /**
   * Build a webhook payload for Teams/Slack.
   * @param {{event_type:string, recipients:any[], data:any, priority?:string, metadata?:any}} input
   * @returns {Promise<{payload:any, webhookUrls:string[]}>}
   */
  async format({ event_type, recipients, data, priority }) {
    const text = `SprintFlow ${event_type} (priority: ${priority || "normal"})`;
    const payload = {
      text,
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            type: "AdaptiveCard",
            version: "1.4",
            body: [
              { type: "TextBlock", text, weight: "Bolder" },
              { type: "TextBlock", text: "Details", wrap: true },
              {
                type: "TextBlock",
                text: "```json\n" + JSON.stringify(data, null, 2) + "\n```",
                wrap: true,
              },
            ],
          },
        },
      ],
    };

    const webhookUrls = recipients
      .map((r) => r.teams_webhook_url)
      .filter(Boolean);

    return { payload, webhookUrls };
  }

  /**
   * Send message to Teams/Slack via webhook.
   * Stub: Logs dispatch and returns success.
   * @param {{payload:any, webhookUrls:string[]}} formatted
   * @returns {Promise<{provider:"stub-teams", sentTo:string[]}>}
   */
  async send(formatted) {
    if (!formatted.webhookUrls || formatted.webhookUrls.length === 0) {
      throw new Error("no_webhooks_for_teams");
    }
    logger.info("TeamsAdapter send (stub)", { urls: formatted.webhookUrls });
    return { provider: "stub-teams", sentTo: formatted.webhookUrls };
  }
}

module.exports = TeamsAdapter;
