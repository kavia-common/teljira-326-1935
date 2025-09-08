"use strict";

const { evaluateConditions } = require("./conditionParser");

/**
 * RuleEvaluator filters rules by trigger type and evaluates conditions.
 */

// PUBLIC_INTERFACE
/**
 * Return rules matching the event type and whose conditions evaluate to true.
 * @param {{type:string,data?:any,actor?:any}} event
 * @param {Array<{id:string,name:string,enabled:boolean,trigger:{type:string},conditions?:object[]}>} rules
 * @param {any} context Optional context (e.g., Express req)
 * @returns {Array<object>} Matching rules
 */
function matchRules(event, rules, context) {
  if (!event || !event.type) return [];
  const applicable = [];
  for (const r of rules || []) {
    if (!r?.enabled) continue;
    if (!r?.trigger || r.trigger.type !== event.type) continue;
    const ok = evaluateConditions(r.conditions || [], context, event);
    if (ok) applicable.push(r);
  }
  return applicable;
}

module.exports = { matchRules };
