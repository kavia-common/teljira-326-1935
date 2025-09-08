# Boards Module Refactor (Service Layer)

Purpose
- Clarify and modularize board logic by introducing dedicated services for creation, columns, drag-and-drop, and real-time orchestration.

Location
- src/services/boards/service.js            (board CRUD: create/list/get)
- src/services/boards/columnsService.js     (columns CRUD and ordering)
- src/services/boards/dndService.js         (drag-and-drop moves and reorder)
- src/services/boards/realtimeService.js    (socket room helpers and emit)

Public Interfaces
- Board
  - createBoard(req, { project_id, name, type?, config? })
  - listBoards(req, { project_id? })
  - getBoardById(req, { board_id })
- Columns
  - listColumns(req, { board_id })
  - createColumn(req, { board_id, name, order? })
  - updateColumnOrder(req, { board_id, columns: Array<{id, order}> })
  - deleteColumn(req, { board_id, column_id })
- DnD
  - moveIssue(req, { board_id, issue_id, from_column_id, to_column_id, position? })
  - reorderIssue(req, { board_id, column_id, issue_id, position })
- Realtime
  - getBoardRoom(board_id, project_id?)
  - emitBoardEvent(roomKey, eventName, payload)

Design Highlights
- Config Model (MVP):
  - columns: [{ id, name, order }]
  - issuePositions: { "<columnId>": [ "<issueId1>", "<issueId2>", ... ] }
- DnD:
  - moveIssue also updates issue.status to the destination column name (lowercased, underscores) as a simple Kanban mapping.
- Real-time:
  - Emits board:created, board:columns_updated, board:issue_moved, board:issue_reordered to room board:{boardId}.
- Audit:
  - All mutating operations log via auditLog (non-throwing helpers).

Routing
- src/routes/modules/boards.js delegates to these services and includes OpenAPI docs:
  - POST /api/boards
  - GET /api/boards
  - GET /api/boards/{id}
  - GET /api/boards/{id}/columns
  - POST /api/boards/{id}/columns
  - PATCH /api/boards/{id}/columns/order
  - DELETE /api/boards/{id}/columns/{column_id}
  - POST /api/boards/{id}/dnd/move
  - POST /api/boards/{id}/dnd/reorder

Backwards Compatibility
- Existing create and list endpoints preserved.
- New endpoints are additive for columns and drag/drop operations.

Notes / Future
- Normalize columns and positions to dedicated tables for performance and concurrency.
- Add WIP limits, swimlanes, and workflow-to-column mapping configuration.
