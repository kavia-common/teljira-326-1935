# RBAC Module (Refactor)

Overview
- The RBAC logic is separated into focused services to improve maintainability, clarity, and testability.
- Responsibilities are split across:
  - permissionService: resolve and check permissions for a user
  - roleService: list roles/permissions and provide role-to-permission lookups
  - policyService: evaluate higher-level authorization policies (extensible)

Structure
- permissionService.js
  - PUBLIC_INTERFACE checkPermissions(user, requiredPermissions)
    - Pure function: verifies user has all required permissions.
  - PUBLIC_INTERFACE resolveUserPermissions(user)
    - Resolves a user's permissions based on role mappings in DB if not present on user.
- roleService.js
  - PUBLIC_INTERFACE listRoles()
  - PUBLIC_INTERFACE listPermissions()
  - getPermissionsForRoles(roleNames) [internal helper]
- policyService.js
  - PUBLIC_INTERFACE evaluatePolicy(user, policy, context?)
  - MVP maps "perm:<permission>" and simple role checks, designed for future scoped policies.

Middleware Integration
- src/middleware/rbac.js
  - PUBLIC_INTERFACE requirePermissions(...required)
  - Uses permissionService.resolveUserPermissions to load the user's permission set from DB if not pre-attached, then checkPermissions to enforce access.
  - Backwards compatible with existing routes using requirePermissions.

Routes
- src/routes/modules/rbac.js uses roleService for listing roles and permissions.
- Other routes remain unchanged; they now benefit from dynamic permission resolution based on roles.

Extending Policies
- Add new policy handlers in policyService.js to support resource-scoped checks (e.g., project admin based on membership).
- Keep policy evaluation pure and fast; limit DB access by preloading context in routes/services when necessary.

Security & Compliance
- No secrets are hard-coded; DB access is via existing pool and .env.
- Middleware returns 401 when unauthenticated, 403 with "missing" list when permissions are insufficient.

Usage (Internal)
```js
const { requirePermissions } = require("../../middleware/rbac");

// Route example
router.post("/projects", authenticate, requirePermissions("project.write"), handler);

// Service-side check
const { resolveUserPermissions, checkPermissions } = require("../../services/rbac/permissionService");
const perms = await resolveUserPermissions(req.context.user);
req.context.user.permissions = perms;
const { ok, missing } = checkPermissions(req.context.user, ["issue.write"]);
if (!ok) throw Object.assign(new Error("Forbidden"), { status: 403, code: "forbidden", missing });
```

Notes
- This MVP focuses on separation and documentation. Future iterations can introduce:
  - Caching for permission resolution per request
  - Admin endpoints to manage role-permission assignments
  - Resource-scoped policy evaluation with membership checks
