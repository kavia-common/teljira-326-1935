# Boards Module Refactor

Overview
- This module encapsulates board-related logic separated into focused services:
  - boardService (creation and retrieval)
  - columnsService (column CRUD and configuration)
  - dndService (drag-and-drop operations for issue movement across columns)
  - realtimeService (Socket.IO orchestration for board events)

Goals
- Improve clarity and maintainability by keeping routes thin and moving all business logic to services.
- Provide well-documented, PUBLIC_INTERFACE functions for use by routes and other internal modules (e.g., sprints/automation).

Structure
- src/services/boards/service.js
  - PUBLIC_INTERFACE createBoard(req, { project_id, name, type?, config? })
  - PUBLIC_INTERFACE listBoards(req, { project_id? })
  - PUBLIC_INTERFACE getBoardById(req, { board_id })
- src/services/boards/columnsService.js
  - PUBLIC_INTERFACE listColumns(req, { board_id })
  - PUBLIC_INTERFACE createColumn(req, { board_id, name, order? })
  - PUBLIC_INTERFACE updateColumnOrder(req, { board_id, columns: Array<{id, order}> })
  - PUBLIC_INTERFACE deleteColumn(req, { board_id, column_id })
- src/services/boards/dndService.js
  - PUBLIC_INTERFACE moveIssue(req, { board_id, issue_id, from_column_id, to_column_id, position? })
  - PUBLIC_INTERFACE reorderIssue(req, { board_id, column_id, issue_id, position })
- src/services/boards/realtimeService.js
  - PUBLIC_INTERFACE emitBoardEvent(roomKey, eventName, payload)
  - PUBLIC_INTERFACE getBoardRoom(board_id, project_id?)

Design Notes
- Columns and issue positions:
  - MVP stores columns and ordering inside boards.config JSON, to avoid new tables.
  - boards.config will include:
    {
      "columns": [{ "id": "uuid", "name": "To Do", "order": 1 }, ...],
      "issuePositions": { "<columnId>": [ "<issueId1>", "<issueId2>", ... ] }
    }
  - Future: normalize into separate tables for scalability and advanced features (WIP limits, swimlanes).
- DnD operations:
  - moveIssue updates issues.status or sprint_id as needed (MVP: update issue.status = column.name if using status columns; configurable later).
  - issuePositions updated atomically in boards.config for ordering.
- Real-time:
  - Socket.IO room naming: board:{boardId}; also emit to project:{projectId} when relevant.
- Audit:
  - All mutating operations write to audit_logs (non-throwing helpers in services).
- Validation and Errors:
  - Throw HTTP-friendly errors with status and code fields.

Backwards Compatibility
- Existing POST /api/boards and GET /api/boards preserved.
- New endpoints added for columns and DnD under /api/boards/:id scope.

Usage (Internal)
```js
const boardService = require("./service");
const columnsService = require("./columnsService");
const dndService = require("./dndService");
const realtime = require("./realtimeService");

await boardService.createBoard(req, { project_id, name, type: "scrum", config: {} });
await columnsService.createColumn(req, { board_id, name: "In Progress" });
await dndService.moveIssue(req, { board_id, issue_id, from_column_id, to_column_id, position: 0 });
realtime.emitBoardEvent(`board:${board_id}`, "board:updated", { board_id });
```
