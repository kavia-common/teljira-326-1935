const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const roleService = require("../../services/rbac/roleService");

const router = express.Router();

/**
 * @openapi
 * /api/rbac/roles:
 *   get:
 *     tags: [RBAC]
 *     summary: List roles
 *     description: Returns all roles configured in the system.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: ok }
 */
router.get(
  "/roles",
  authenticate,
  requirePermissions("rbac.manage"),
  async (req, res, next) => {
    try {
      const rows = await roleService.listRoles();
      return res.json(rows);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/rbac/permissions:
 *   get:
 *     tags: [RBAC]
 *     summary: List permissions
 *     description: Returns all permissions configured in the system.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: ok }
 */
router.get(
  "/permissions",
  authenticate,
  requirePermissions("rbac.manage"),
  async (req, res, next) => {
    try {
      const rows = await roleService.listPermissions();
      return res.json(rows);
    } catch (e) {
      return next(e);
    }
  },
);

module.exports = router;
