"use strict";

/**
 * PermissionService
 * Encapsulates user permission resolution and checks.
 * Sources of truth:
 * - JWT-provided roles (req.context.user.roles)
 * - DB mappings (roles -> permissions)
 *
 * Design:
 * - Resolve permissions for a given user id and roles.
 * - PUBLIC_INTERFACE checkPermissions can be used by middleware and services.
 */

// Dependencies are required lazily to avoid circular deps during app bootstrap.
const { getDb } = require("../../db");

// PUBLIC_INTERFACE
function checkPermissions(user, requiredPermissions = []) {
  /** Check if a user object contains all required permissions.
   * This function expects user.permissions to already be resolved if available.
   * Falls back to using roles and DB if needed via resolveUserPermissions (async) by throwing an Error
   * to hint callers to use the async variant when permissions are not pre-resolved.
   */
  if (!user) {
    return { ok: false, missing: requiredPermissions };
  }
  const current = new Set(user.permissions || []);
  const missing = requiredPermissions.filter((p) => !current.has(p));
  return { ok: missing.length === 0, missing };
}

/**
 * Resolve the complete permission set for a given user.
 * - If user.permissions already present, return it.
 * - Else, pull permissions for all of user's roles from DB.
 */
async function resolveUserPermissions(user) {
  if (!user) return [];
  if (Array.isArray(user.permissions) && user.permissions.length) {
    return user.permissions;
  }
  const roles = user.roles || [];
  if (!roles.length) return [];
  const db = getDb();
  // Map role names -> permissions via DB schema
  const { rows } = await db.query(
    `
    SELECT DISTINCT p.name AS permission
    FROM roles r
    JOIN role_permissions rp ON rp.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE r.name = ANY($1::text[])
  `,
    [roles],
  );
  return rows.map((r) => r.permission);
}

module.exports = {
  checkPermissions,
  resolveUserPermissions,
};
