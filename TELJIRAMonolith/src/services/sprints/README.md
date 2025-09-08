# Sprints Module Refactor

Overview
- This module encapsulates sprint lifecycle logic, separating it from route handlers for maintainability and testability.
- Responsibilities include: creating sprints, updating state, interacting with boards (associations/helpers), and completing sprints.

Structure
- src/services/sprints/service.js
  - PUBLIC_INTERFACE methods:
    - createSprint(req, { project_id, name, goal?, start_date?, end_date? })
    - updateSprintState(req, { sprint_id, state })
    - completeSprint(req, { sprint_id, move_incomplete?: "backlog" | "next" })
    - attachSprintToBoard(req, { board_id, sprint_id })  [placeholder helper]
    - getSprintsForProject(req, { project_id })          [helper for future list endpoint]
- Internals:
  - Uses DB via getDb()
  - Emits real-time events via Socket.IO (project room)
  - Writes audit logs using auditLog helper (non-throwing inside service)

Design Notes
- Routes remain thin, delegating all business logic to the service.
- Errors are thrown with `status` and `code` when appropriate.
- Completion flow (MVP):
  - Marks sprint as "completed"
  - Optionally moves incomplete issues back to backlog or (placeholder) to the next sprint

Environment Variables
- None specific to this module beyond database and socket configuration already documented.

Usage (Internal)
```js
const sprintService = require("../../services/sprints/service");

// Create
const created = await sprintService.createSprint(req, { project_id, name, goal, start_date, end_date });

// Update state
const updated = await sprintService.updateSprintState(req, { sprint_id, state: "started" });

// Complete
const completed = await sprintService.completeSprint(req, { sprint_id, move_incomplete: "backlog" });

// Attach sprint to board (placeholder)
await sprintService.attachSprintToBoard(req, { board_id, sprint_id });
```

Backwards Compatibility
- Existing create and state update endpoints maintain response shapes.
- A new completion endpoint can be added in future to call completeSprint(); current refactor does not change API surface unless route is added.

Testing
- Existing clients are unaffected.
- New logic is centralized; unit tests can target service-level functions.
