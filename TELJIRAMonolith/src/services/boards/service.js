"use strict";

const { getDb } = require("../../db");
const { auditLog } = require("../../middleware/audit");
const { emitBoardEvent, getBoardRoom } = require("./realtimeService");

/**
 * BoardService encapsulates creation and retrieval for boards.
 */
class BoardService {
  // PUBLIC_INTERFACE
  /**
   * Create a new board for a project.
   * @param {import('express').Request|null} req
   * @param {{project_id:string,name:string,type?:string,config?:object}} input
   * @returns {Promise<any>} Created board
   */
  async createBoard(req, { project_id, name, type = "scrum", config = {} }) {
    if (!project_id || !name) {
      const e = new Error("project_id and name required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    // Ensure minimal config structure
    const cfg = {
      columns: Array.isArray(config.columns) ? config.columns : [],
      issuePositions: typeof config.issuePositions === "object" && config.issuePositions !== null ? config.issuePositions : {},
      ...config,
    };

    const { rows } = await db.query(
      "INSERT INTO boards(project_id, name, type, config) VALUES ($1,$2,$3,$4) RETURNING *",
      [project_id, name, type, cfg],
    );
    const created = rows[0];

    await this.safeAudit(req, "board.create", "board", created.id, { project_id, type });
    // Emit basic realtime event
    try {
      emitBoardEvent(getBoardRoom(created.id, created.project_id), "board:created", created);
    } catch (_) {
      // ignore socket init issues
    }
    return created;
  }

  // PUBLIC_INTERFACE
  /**
   * List boards (optionally by project).
   * @param {import('express').Request|null} _req
   * @param {{project_id?:string}} filters
   * @returns {Promise<any[]>}
   */
  async listBoards(_req, { project_id } = {}) {
    if (project_id) {
      const { rows } = await getDb().query(
        "SELECT * FROM boards WHERE project_id=$1 ORDER BY created_at DESC",
        [project_id],
      );
      return rows;
    }
    const { rows } = await getDb().query(
      "SELECT * FROM boards ORDER BY created_at DESC",
    );
    return rows;
  }

  // PUBLIC_INTERFACE
  /**
   * Get a specific board by id.
   * @param {import('express').Request|null} _req
   * @param {{board_id:string}} input
   * @returns {Promise<any>}
   */
  async getBoardById(_req, { board_id }) {
    if (!board_id) {
      const e = new Error("board_id required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const { rows } = await getDb().query("SELECT * FROM boards WHERE id=$1", [board_id]);
    if (!rows[0]) {
      const e = new Error("Board not found");
      e.status = 404;
      e.code = "NotFound";
      throw e;
    }
    return rows[0];
  }

  async safeAudit(req, action, resourceType, resourceId, metadata) {
    try {
      await auditLog(req, action, resourceType, resourceId, metadata);
    } catch (_) {
      // ignore audit failures
    }
  }
}

module.exports = new BoardService();
