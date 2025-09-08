"use strict";

/**
 * RoleService
 * Encapsulates role and permission management via DB.
 *
 * Responsibilities:
 * - List roles and permissions
 * - Assign/revoke role permissions (internal helpers for future admin endpoints)
 * - Lookup role permissions
 */

const { getDb } = require("../../db");

// PUBLIC_INTERFACE
async function listRoles() {
  /** Return all roles ordered by name. */
  const { rows } = await getDb().query("SELECT * FROM roles ORDER BY name");
  return rows;
}

// PUBLIC_INTERFACE
async function listPermissions() {
  /** Return all permissions ordered by name. */
  const { rows } = await getDb().query(
    "SELECT * FROM permissions ORDER BY name",
  );
  return rows;
}

async function getPermissionsForRoles(roleNames = []) {
  if (!roleNames.length) return [];
  const { rows } = await getDb().query(
    `
    SELECT DISTINCT p.name AS permission
    FROM roles r
    JOIN role_permissions rp ON rp.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE r.name = ANY($1::text[])
  `,
    [roleNames],
  );
  return rows.map((r) => r.permission);
}

module.exports = {
  listRoles,
  listPermissions,
  getPermissionsForRoles,
};
