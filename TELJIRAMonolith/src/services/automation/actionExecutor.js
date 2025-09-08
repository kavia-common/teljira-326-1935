"use strict";

const dispatcher = require("../notifications/dispatcher");

/**
 * ActionExecutor runs actions produced by automation rules.
 * Supported actions (MVP):
 * - notify: delegate to Notification Dispatcher
 * - update_field: placeholder for future field updates
 * - call_webhook: placeholder for outbound webhook invocation
 */

async function execNotify(action, context, event) {
  const channels = Array.isArray(action.channels) ? action.channels : ["in-app"];
  const recipients = Array.isArray(action.recipients) ? action.recipients : [];
  // allow templated strings for simple fields in action.data.template
  const payloadData =
    typeof action.data?.template === "string"
      ? { message: renderTemplate(action.data.template, { event }) }
      : action.data || { event: event?.data };

  return dispatcher.dispatch(context || null, {
    event_type: `automation.${event?.type}`,
    recipients,
    channels,
    data: {
      ...payloadData,
      event: event?.data,
      rule_id: action._ruleId,
    },
    priority: action.priority || "normal",
    metadata: { source: "automation" },
  });
}

function renderTemplate(tpl, scope) {
  // very simple templating: {event.data.issue.title} etc.
  return tpl.replace(/\{([^}]+)\}/g, (_, path) => {
    try {
      const parts = path.split(".");
      let cur = scope;
      for (const p of parts) cur = cur?.[p];
      return cur == null ? "" : String(cur);
    } catch {
      return "";
    }
  });
}

async function execUpdateField() {
  // Placeholder: to be implemented with domain service for issues/projects etc.
  return { ok: true, detail: "update_field not implemented in MVP" };
}

async function execCallWebhook() {
  // Placeholder: call external webhook provider (configurable)
  return { ok: true, detail: "call_webhook not implemented in MVP" };
}

// PUBLIC_INTERFACE
/**
 * Execute a list of actions for a matched rule.
 * @param {Array<object>} actions
 * @param {any} context Express req for audit context
 * @param {{type:string,data:any,actor:any}} event
 * @param {{ruleId?:string}} opts
 * @returns {Promise<Array<{type:string, success:boolean, result?:any, error?:string}>>}
 */
async function executeActions(actions, context, event, opts = {}) {
  const results = [];
  for (const a of actions || []) {
    const type = a.type;
    try {
      let result;
      const actionWithRule = { ...a, _ruleId: opts.ruleId };
      switch (type) {
        case "notify":
          result = await execNotify(actionWithRule, context, event);
          break;
        case "update_field":
          result = await execUpdateField(actionWithRule, context, event);
          break;
        case "call_webhook":
          result = await execCallWebhook(actionWithRule, context, event);
          break;
        default:
          throw new Error("unsupported_action_type");
      }
      results.push({ type, success: true, result });
    } catch (e) {
      results.push({ type, success: false, error: e?.message || "action_failed" });
    }
  }
  return results;
}

module.exports = { executeActions };
