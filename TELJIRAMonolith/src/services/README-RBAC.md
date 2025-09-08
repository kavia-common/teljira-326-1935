# RBAC Services Overview

Purpose
- Provide a maintainable, modular authorization layer:
  - Permission resolution and checks
  - Role and permission management helpers
  - Policy evaluation for higher-level, resource-scoped rules

Files
- src/services/rbac/permissionService.js
  - PUBLIC_INTERFACE checkPermissions(user, requiredPermissions)
  - PUBLIC_INTERFACE resolveUserPermissions(user)
- src/services/rbac/roleService.js
  - PUBLIC_INTERFACE listRoles()
  - PUBLIC_INTERFACE listPermissions()
- src/services/rbac/policyService.js
  - PUBLIC_INTERFACE evaluatePolicy(user, policy, context?)

Integration Points
- Middleware: src/middleware/rbac.js exposes requirePermissions(...perms)
- Routes: src/routes/modules/rbac.js uses roleService to list roles and permissions
- Other routes: continue to call requirePermissions(...) as before

OpenAPI
- RBAC tag documents endpoints under /api/rbac (roles, permissions).
- No API surface change in this refactor; internal structure improved.

Next Steps (optional)
- Add admin endpoints to manage role-permission assignments
- Add resource-scoped policy evaluation for project/workspace
- Cache resolved permissions per request to reduce DB lookups
