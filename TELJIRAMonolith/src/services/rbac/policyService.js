"use strict";

/**
 * PolicyService
 * Encapsulates evaluation of higher-level authorization policies.
 * Example policies (future):
 * - "project:admin" for project lead or org_admin
 * - Resource-scoped checks (workspace/project) based on membership tables
 *
 * PUBLIC_INTERFACE evaluatePolicy(user, policy, context)
 * Returns { ok: boolean, reason?: string }
 */

// PUBLIC_INTERFACE
function evaluatePolicy(user, policy, context = {}) {
  /** MVP: provide a basic passthrough where standard permission strings map directly.
   * Extend here to support complex policies (resource-scoped evaluation).
   */
  if (!user) return { ok: false, reason: "unauthenticated" };
  if (policy && policy.startsWith("perm:")) {
    const perm = policy.slice("perm:".length);
    const has = new Set(user.permissions || []);
    return { ok: has.has(perm), reason: has.has(perm) ? undefined : "missing_permission" };
  }
  // Example future: org_admin shortcut
  if (policy === "role:org_admin") {
    const roles = new Set(user.roles || []);
    return { ok: roles.has("org_admin"), reason: roles.has("org_admin") ? undefined : "missing_role" };
  }
  // Default deny for unknown policy
  return { ok: false, reason: "unknown_policy" };
}

module.exports = {
  evaluatePolicy,
};
