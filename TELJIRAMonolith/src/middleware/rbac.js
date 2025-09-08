const { resolveUserPermissions, checkPermissions } = require("../services/rbac/permissionService");

/**
 * PUBLIC_INTERFACE
 * requirePermissions(...requiredPermissions)
 * Express middleware that ensures the authenticated user has the required permissions.
 * - If user.permissions is not present, it will be resolved from DB using user's roles.
 * - Returns 401 if unauthenticated, 403 if insufficient permissions.
 */
function requirePermissions(...required) {
  return async (req, res, next) => {
    try {
      const user = req.context.user;
      if (!user) {
        return res
          .status(401)
          .json({ error: "Unauthorized", message: "Auth required" });
      }

      // Resolve permission set if not already present on user
      if (!Array.isArray(user.permissions) || user.permissions.length === 0) {
        user.permissions = await resolveUserPermissions(user);
      }

      const result = checkPermissions(user, required);
      if (!result.ok) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Insufficient permissions",
          missing: result.missing,
        });
      }
      return next();
    } catch (e) {
      return next(e);
    }
  };
}

module.exports = { requirePermissions };
