# Issue Lifecycle Refactor (Service Layer)

Purpose
- Clarify and modularize issue lifecycle logic by introducing a dedicated IssueService with explicit public interfaces.

Location
- src/services/issues/service.js  (primary implementation)
- src/services/issues/README.md   (module-level details)

Public Interfaces
- createIssue(req, { project_id, sprint_id?, type_id?, title, description?, priority? })
- listIssues(req, { project_id?, sprint_id? })
- updateIssue(req, { issue_id, fields })
- transitionIssue(req, { issue_id, to_status })
- linkIssues(req, { source_id, target_id, type })        [MVP stub]
- deleteIssue(req, { issue_id })

Routing
- src/routes/modules/issues.js delegates to IssueService for:
  - POST /api/issues
  - GET /api/issues
  - PATCH /api/issues/{id}
  - POST /api/issues/{id}/transition
  - POST /api/issues/link
  - DELETE /api/issues/{id}

Notes
- Sequence key generation per project uses COUNT+1 (MVP). Consider a dedicated sequence table for concurrency in future.
- Transition logic is free-form; future integration with Workflow Engine should validate allowed transitions and run validators/post-functions.
- Linking is stubbed; implement issue_links table and business rules later.

Security & Compliance
- RBAC enforced in routes via requirePermissions.
- Audit logs are written for create/update/transition/link/delete via a non-throwing helper.
- Socket.IO events emitted to project rooms on create/update/delete for real-time UI updates.

Backwards Compatibility
- Existing endpoints and response shapes are preserved.
- Additional endpoints (transition/link/delete) are additive.

Usage (Internal)
```js
const issueService = require("./issues/service");
await issueService.createIssue(req, { project_id, title });
await issueService.updateIssue(req, { issue_id, fields: { status: "done" } });
```
