const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const boardService = require("../../services/boards/service");
const columnsService = require("../../services/boards/columnsService");
const dndService = require("../../services/boards/dndService");

const router = express.Router();

/**
 * @openapi
 * /api/boards:
 *   post:
 *     tags: [Boards]
 *     summary: Create board
 *     description: Creates a new board for a project. Returns the created board with initial config.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project_id, name]
 *             properties:
 *               project_id: { type: string }
 *               name: { type: string }
 *               type: { type: string, enum: [scrum, kanban], default: scrum }
 *               config: { type: object, description: "Optional initial config (columns, issuePositions)" }
 *     responses:
 *       201: { description: Created }
 */
router.post(
  "/",
  authenticate,
  requirePermissions("board.write"),
  async (req, res, next) => {
    try {
      const created = await boardService.createBoard(req, {
        project_id: req.body?.project_id,
        name: req.body?.name,
        type: req.body?.type || "scrum",
        config: req.body?.config || {},
      });
      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/boards:
 *   get:
 *     tags: [Boards]
 *     summary: List boards
 *     description: List all boards or filter by project_id.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of boards }
 */
router.get(
  "/",
  authenticate,
  requirePermissions("board.read"),
  async (req, res, next) => {
    try {
      const rows = await boardService.listBoards(req, { project_id: req.query?.project_id });
      return res.json(rows);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/boards/{id}:
 *   get:
 *     tags: [Boards]
 *     summary: Get board by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Board }
 *       404: { description: NotFound }
 */
router.get(
  "/:id",
  authenticate,
  requirePermissions("board.read"),
  async (req, res, next) => {
    try {
      const board = await boardService.getBoardById(req, { board_id: req.params.id });
      return res.json(board);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/boards/{id}/columns:
 *   get:
 *     tags: [Boards]
 *     summary: List board columns
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Columns }
 */
router.get(
  "/:id/columns",
  authenticate,
  requirePermissions("board.read"),
  async (req, res, next) => {
    try {
      const cols = await columnsService.listColumns(req, { board_id: req.params.id });
      return res.json(cols);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/boards/{id}/columns:
 *   post:
 *     tags: [Boards]
 *     summary: Create column
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               order: { type: number }
 *     responses:
 *       201: { description: Column created }
 */
router.post(
  "/:id/columns",
  authenticate,
  requirePermissions("board.write"),
  async (req, res, next) => {
    try {
      const col = await columnsService.createColumn(req, { board_id: req.params.id, name: req.body?.name, order: req.body?.order });
      return res.status(201).json(col);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/boards/{id}/columns/order:
 *   patch:
 *     tags: [Boards]
 *     summary: Reorder columns (atomic)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [columns]
 *             properties:
 *               columns:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id, order]
 *                   properties:
 *                     id: { type: string }
 *                     order: { type: number }
 *     responses:
 *       200: { description: Reordered }
 */
router.patch(
  "/:id/columns/order",
  authenticate,
  requirePermissions("board.write"),
  async (req, res, next) => {
    try {
      const result = await columnsService.updateColumnOrder(req, { board_id: req.params.id, columns: req.body?.columns || [] });
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/boards/{id}/columns/{column_id}:
 *   delete:
 *     tags: [Boards]
 *     summary: Delete a column
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: column_id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete(
  "/:id/columns/:column_id",
  authenticate,
  requirePermissions("board.write"),
  async (req, res, next) => {
    try {
      const result = await columnsService.deleteColumn(req, { board_id: req.params.id, column_id: req.params.column_id });
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/boards/{id}/dnd/move:
 *   post:
 *     tags: [Boards]
 *     summary: Move issue across columns (drag-and-drop)
 *     description: Moves issue from one column to another and updates ordering; also maps issue status to destination column name (MVP).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [issue_id, to_column_id]
 *             properties:
 *               issue_id: { type: string }
 *               from_column_id: { type: string, nullable: true }
 *               to_column_id: { type: string }
 *               position: { type: number, default: 0 }
 *     responses:
 *       200: { description: Move result }
 */
router.post(
  "/:id/dnd/move",
  authenticate,
  requirePermissions("board.write"),
  async (req, res, next) => {
    try {
      const result = await dndService.moveIssue(req, {
        board_id: req.params.id,
        issue_id: req.body?.issue_id,
        from_column_id: req.body?.from_column_id || null,
        to_column_id: req.body?.to_column_id,
        position: typeof req.body?.position === "number" ? req.body.position : 0,
      });
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  },
);

/**
 * @openapi
 * /api/boards/{id}/dnd/reorder:
 *   post:
 *     tags: [Boards]
 *     summary: Reorder issue within a column
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [column_id, issue_id, position]
 *             properties:
 *               column_id: { type: string }
 *               issue_id: { type: string }
 *               position: { type: number }
 *     responses:
 *       200: { description: Reorder result }
 */
router.post(
  "/:id/dnd/reorder",
  authenticate,
  requirePermissions("board.write"),
  async (req, res, next) => {
    try {
      const result = await dndService.reorderIssue(req, {
        board_id: req.params.id,
        column_id: req.body?.column_id,
        issue_id: req.body?.issue_id,
        position: req.body?.position,
      });
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  },
);

module.exports = router;
