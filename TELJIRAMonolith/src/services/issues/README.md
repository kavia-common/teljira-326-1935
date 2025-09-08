# Issues Module Refactor

Overview
- The issue lifecycle logic has been refactored into a dedicated service module to improve clarity, maintainability, and testability.
- Responsibilities include: creation, editing (partial update), transition (status change with simple validation), linking (MVP stub), and deletion.
- Routes remain thin and delegate to the service layer.

Structure
- src/services/issues/service.js
  - PUBLIC_INTERFACE methods:
    - createIssue(req, { project_id, sprint_id?, type_id?, title, description?, priority? })
    - listIssues(req, { project_id?, sprint_id? })
    - updateIssue(req, { issue_id, fields })
    - transitionIssue(req, { issue_id, to_status })
    - linkIssues(req, { source_id, target_id, type })
    - deleteIssue(req, { issue_id })
- src/routes/modules/issues.js (updated to use the service)

Design Notes
- Service encapsulates DB access, sequence key generation per project, Socket.IO emissions, and audit logging.
- Transition logic (MVP): allows any status free-form; placeholder for workflow validation in future.
- Link logic (MVP): stubbed; to be replaced by a proper issue_links table and validations.
- Errors are thrown with HTTP-friendly shape (status, code).

Environment Variables
- No new variables; relies on DB, JWT, and Socket already configured elsewhere.

Backwards Compatibility
- Existing endpoints (POST /api/issues, GET /api/issues, PATCH /api/issues/:id) maintain their behavior.
- New endpoints can be added later for transition/link/delete if needed.

Usage (Internal)
```js
const issueService = require("../../services/issues/service");

// Create
const created = await issueService.createIssue(req, { project_id, title, sprint_id, type_id, description, priority });

// List
const list = await issueService.listIssues(req, { project_id, sprint_id });

// Update fields
const updated = await issueService.updateIssue(req, { issue_id, fields: { status, assignee_id, points } });

// Transition (MVP)
await issueService.transitionIssue(req, { issue_id, to_status: "in_progress" });

// Link (MVP stub)
await issueService.linkIssues(req, { source_id, target_id, type: "relates_to" });

// Delete
await issueService.deleteIssue(req, { issue_id });
```
