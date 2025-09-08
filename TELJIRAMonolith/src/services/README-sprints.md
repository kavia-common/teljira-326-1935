# Sprint Lifecycle Refactor (Service Layer)

Purpose
- Improve maintainability by moving sprint creation, updates, board interaction, and completion into a dedicated service module.

Location
- src/services/sprints/service.js  (primary implementation)
- src/services/sprints/README.md   (module-level documentation)

Public Interfaces
- createSprint(req, { project_id, name, goal?, start_date?, end_date? })
- updateSprintState(req, { sprint_id, state })
- completeSprint(req, { sprint_id, move_incomplete?: "backlog" | "next" })
- attachSprintToBoard(req, { board_id, sprint_id })
- getSprintsForProject(req, { project_id })

Routing
- src/routes/modules/sprints.js delegates to SprintService.
- New endpoint: POST /api/sprints/{id}/complete for sprint completion.

Notes
- Completion logic in MVP moves incomplete issues back to backlog when requested.
- Future enhancement: implement "next" sprint selection and migration for incomplete issues.
