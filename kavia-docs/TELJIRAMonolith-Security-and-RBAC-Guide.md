# TELJIRAMonolith Security and RBAC Guide

## Introduction

### Background
Security in the TELJIRA Monolith centers on JWT-based authentication, role-based access control (RBAC), and comprehensive audit logging. This guide explains how security is enforced across middleware, how permissions are resolved, what routes require which permissions, and how to extend policies safely.

### Scope
- JWT authentication overview and expectations for clients
- RBAC services and middleware flow
- Permission/role surfaces and example route protections
- Audit logging notes and error handling patterns
- Extensibility guidelines for new policies

## Authentication

### JWT Sessions
- Users authenticate via POST /api/auth/login, receiving a JWT signed with JWT_SECRET.
- Clients send the token in Authorization: Bearer <token> for protected endpoints.
- JWT_EXPIRES_IN controls token TTL.
- Optional PASSWORD_PEPPER is concatenated to passwords before hashing.

### Health and Public Endpoints
- GET / (health) is public and can be used for liveness checks.
- Most /api/* routes require JWT and, where appropriate, additional permissions.

## RBAC Architecture

### Services
- permissionService.js
  - checkPermissions(user, requiredPermissions): returns { ok, missing[] }.
  - resolveUserPermissions(user): loads permissions from DB if not present on user.
- roleService.js
  - listRoles(), listPermissions()
- policyService.js
  - evaluatePolicy(user, policy, context?): maps "perm:<permission>" and basic roles, designed for future scoped checks.

### Middleware Flow
- src/middleware/rbac.js exports requirePermissions(...required)
- Flow:
  1. User is attached to req.context.user by JWT auth middleware earlier in the chain.
  2. If user.permissions is absent/empty, resolveUserPermissions(user) is invoked to populate it from DB.
  3. checkPermissions(user, required) validates access.
  4. On failure: 401 (no user), or 403 with "missing" array for insufficient permissions.
  5. On success: calls next() to execute the route handler/service.

### Example Usage
- In a route file:
  - router.post("/projects", authenticate, requirePermissions("project.write"), handler)
- In a service:
  - const perms = await resolveUserPermissions(req.context.user)
  - const { ok, missing } = checkPermissions(user, ["issue.write"])
  - if (!ok) throw Object.assign(new Error("Forbidden"), { status: 403, code: "forbidden", missing })

## Permissions by Module (MVP)

- Notifications
  - notifications.send for POST /api/notifications/dispatch
- Settings
  - settings.admin for GET/PATCH /api/settings
- Projects/Issues/Boards/Sprints (typical examples)
  - project.read, project.write
  - issue.read, issue.write, issue.transition
  - board.read, board.write
  - sprint.read, sprint.write

Note: Exact mappings depend on seed data and database configuration. Adjust per organization needs.

## Audit Logging

### Pattern
- Services perform best-effort audit logging to avoid failing user workflows on audit write errors.
- Notification Dispatcher audits per-channel attempts.
- Boards/Issues/Sprints services audit mutating operations (create/update/transition/delete).

### Error Handling
- On errors, services throw HTTP-shaped errors with status and code (e.g., { status: 403, code: "forbidden" }).
- Middleware/error handlers translate exceptions into consistent JSON responses.

## Security Configuration

### Environment Variables
- JWT_SECRET: Required; rotate in production with minimal downtime by supporting overlapping keys if needed.
- JWT_EXPIRES_IN: Keep reasonable TTLs (e.g., 1h).
- COOKIE_SECRET, CSRF_COOKIE_NAME: For CSRF cookie when CSRF middleware is enabled.
- PG* variables: DB credentials, consider PGSSLMODE=require in production.
- WEBHOOK_SECRET: HMAC verification for inbound integrations.

### Middleware in src/app.js
- helmet for HTTP headers security
- cors configured with allowed origins
- express-rate-limit to mitigate brute force
- csurf available if required for cookie-based CSRF defenses
- morgan for access logs; winston (logger.js) for structured app logs

## Extending RBAC and Policies

### Adding a New Permission
1. Define and seed the permission in the database.
2. Update route protection to requirePermissions("new.permission").
3. Ensure resolveUserPermissions maps roles -> permissions for the new permission.
4. Add tests to validate enforcement.

### Adding a Resource-Scoped Policy
1. Extend policyService to evaluate context-aware policies (e.g., project membership).
2. Pass necessary context from routes/services into evaluatePolicy.
3. Prefer policy checks in services for complex decisions while retaining route-level coarse-grained requirePermissions.

### Best Practices
- Keep route protections coarse (e.g., feature-level permissions).
- Enforce fine-grained, resource-scoped checks in services via policyService.
- Cache permission resolution per request to reduce DB hits (future enhancement).

## Security Checklist (MVP)

- [ ] JWT secret set and strong
- [ ] HTTPS in production; PGSSLMODE=require for DB
- [ ] Rate limits enabled for auth endpoints
- [ ] RBAC enforced on all mutating routes
- [ ] Audit logging present for sensitive changes
- [ ] .env not committed; secrets managed securely
- [ ] Swagger UI protected as needed in production (IP allowlist or auth)

## Conclusion

### Summary
TELJIRA Monolith applies JWT auth, robust RBAC, and audit logging to protect core workflows. The requirePermissions middleware and RBAC services centralize authorization, while services implement best-effort auditing and throw HTTP-shaped errors. Extend permissions and policies deliberately, and keep environment-specific security settings configured in .env for each deployment stage.
