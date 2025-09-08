"use strict";

/**
 * ConditionParser evaluates rule conditions against a given context and event payload.
 * Supported condition types (MVP):
 * - field_equals: compares an event/context field to a literal value
 *   { type: "field_equals", field: "issue.priority", value: "high" }
 * - user_in_roles: true if actor has at least one role in the provided list
 *   { type: "user_in_roles", roles: ["org_admin","project_admin"] }
 * - anyOf: OR across nested conditions
 *   { type: "anyOf", conditions: [ { ... }, { ... } ] }
 * - allOf: AND across nested conditions (equivalent to top-level array semantics)
 *   { type: "allOf", conditions: [ { ... }, { ... } ] }
 */

// PUBLIC_INTERFACE
/**
 * Parse a single condition object. For MVP it returns the same object; placeholder for future parsing.
 * @param {object} condition
 * @returns {object}
 */
function parseCondition(condition) {
  return condition || {};
}

function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function evalFieldEquals(cond, { event, context }) {
  const { field, value } = cond;
  if (!field) return false;
  const v =
    getByPath(event?.data || {}, field) ??
    getByPath(event || {}, field) ??
    getByPath(context || {}, field);
  return v === value;
}

function evalUserInRoles(cond, { event }) {
  const roles = Array.isArray(cond.roles) ? cond.roles : [];
  const actorRoles = Array.isArray(event?.actor?.roles) ? event.actor.roles : [];
  return roles.some((r) => actorRoles.includes(r));
}

function evalAnyOf(cond, env) {
  const items = Array.isArray(cond.conditions) ? cond.conditions : [];
  for (const c of items) {
    if (evaluateCondition(c, env)) return true;
  }
  return items.length === 0 ? false : false;
}

function evalAllOf(cond, env) {
  const items = Array.isArray(cond.conditions) ? cond.conditions : [];
  for (const c of items) {
    if (!evaluateCondition(c, env)) return false;
  }
  return true;
}

function evaluateCondition(cond, env) {
  if (!cond || typeof cond !== "object") return false;
  switch (cond.type) {
    case "field_equals":
      return evalFieldEquals(cond, env);
    case "user_in_roles":
      return evalUserInRoles(cond, env);
    case "anyOf":
      return evalAnyOf(cond, env);
    case "allOf":
      return evalAllOf(cond, env);
    default:
      return false;
  }
}

// PUBLIC_INTERFACE
/**
 * Evaluate an array of conditions (AND semantics).
 * @param {object[]} conditions
 * @param {object} context Express req or derived context (for future use)
 * @param {object} event Event payload { type, data, actor }
 * @returns {boolean}
 */
function evaluateConditions(conditions, context, event) {
  const env = { context, event };
  const list = Array.isArray(conditions) ? conditions.map(parseCondition) : [];
  for (const c of list) {
    if (!evaluateCondition(c, env)) return false;
  }
  return true;
}

module.exports = {
  parseCondition,
  evaluateConditions,
};
