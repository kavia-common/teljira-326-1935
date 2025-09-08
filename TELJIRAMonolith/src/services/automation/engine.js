"use strict";

const { auditLog } = require("../../middleware/audit");
const { matchRules } = require("./ruleEvaluator");
const { executeActions } = require("./actionExecutor");

/**
 * AutomationEngine
 * Orchestrates rule retrieval, evaluation and action execution.
 * For MVP, rules are in-memory and scoped by project/workspace.
 */

function inMemoryRules() {
  // Example starter rules. Replace with DB-backed repository in future.
  return [
    {
      id: "rule-issue-created-notify-project",
      name: "Notify project room on issue create",
      enabled: true,
      trigger: { type: "issue.created" },
      conditions: [
        // example: only for high priority or actor has admin role
        {
          type: "anyOf",
          conditions: [
            { type: "field_equals", field: "issue.priority", value: "high" },
            { type: "user_in_roles", roles: ["org_admin", "project_admin"] },
          ],
        },
      ],
      actions: [
        {
          type: "notify",
          channels: ["in-app"],
          recipients: [{ project_socket_room: "project:{project_id}" }],
          data: { template: "New issue: {event.data.issue.title}" },
          priority: "normal",
        },
      ],
    },
  ];
}

function interpolateRecipient(recipient, event) {
  // Replace tokens like {project_id} from event.data
  const json = JSON.stringify(recipient);
  const rendered = json.replace(/\{([^}]+)\}/g, (_, key) => {
    const parts = key.split(".");
    let cur = event?.data;
    for (const p of parts) cur = cur?.[p] ?? event?.[p];
    return cur == null ? "" : String(cur);
  });
  try {
    return JSON.parse(rendered);
  } catch {
    return recipient;
  }
}

function scopeRules(rules, event) {
  // Placeholder: apply workspace/project scoping if set on the rule
  return (rules || []).map((r) => {
    const next = { ...r };
    // Also interpolate recipients once here to avoid repeating within executor
    next.actions = (next.actions || []).map((a) => {
      if (!Array.isArray(a.recipients)) return a;
      return {
        ...a,
        recipients: a.recipients.map((rcp) => interpolateRecipient(rcp, event)),
      };
    });
    return next;
  });
}

// PUBLIC_INTERFACE
/**
 * Evaluate automation rules for an event and execute matching actions.
 * Audits execution summary; non-throwing on per-action failures.
 * @param {import('express').Request|null} context
 * @param {{type:string,data:any,actor?:any}} event
 * @returns {Promise<{matched:number, executed:number, details:Array<{ruleId:string, actions:any[]}>}>}
 */
async function evaluateAndExecute(context, event) {
  if (!event || !event.type) {
    return { matched: 0, executed: 0, details: [] };
  }

  const rules = scopeRules(getRulesForScope(event), event);
  const matched = matchRules(event, rules, context);

  const details = [];
  let executed = 0;

  for (const rule of matched) {
    const results = await executeActions(rule.actions || [], context, event, {
      ruleId: rule.id,
    });
    executed += results.length;
    details.push({
      ruleId: rule.id,
      ruleName: rule.name,
      actions: results,
    });
  }

  try {
    await auditLog(context, "automation.run", "automation", event.type, {
      matched: matched.length,
      executed,
    });
  } catch {
    // ignore audit failures
  }

  return { matched: matched.length, executed, details };
}

/**
 * Retrieve rules by scope (workspace/project) - MVP uses in-memory defaults.
 * Replace with DB-backed repository (e.g., SELECT * FROM automation_rules WHERE ...)
 * @param {{data?:{project_id?:string, workspace_id?:string}}} event
 * @returns {Array<object>}
 */
function getRulesForScope(event) {
  // Future: filter by event.data.project_id/workspace_id
  return inMemoryRules();
}

module.exports = {
  evaluateAndExecute,
  getRulesForScope,
};
