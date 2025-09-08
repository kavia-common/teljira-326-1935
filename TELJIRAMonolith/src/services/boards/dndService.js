"use strict";

const { getDb } = require("../../db");
const { auditLog } = require("../../middleware/audit");
const { emitBoardEvent, getBoardRoom } = require("./realtimeService");

/**
 * DnDService handles drag-and-drop operations for board issues.
 * MVP behavior:
 * - Positions are managed in boards.config.issuePositions[columnId] as ordered array of issue ids.
 * - When moving across columns, also update the issue status to the destination column name (basic Kanban mapping).
 */
class DnDService {
  // PUBLIC_INTERFACE
  /**
   * Move an issue from one column to another (or within the same) at a position.
   * @param {import('express').Request|null} req
   * @param {{board_id:string, issue_id:string, from_column_id:string, to_column_id:string, position?:number}} input
   * @returns {Promise<{ok:boolean, board_id:string, issue_id:string, from_column_id:string, to_column_id:string, position:number}>}
   */
  async moveIssue(req, { board_id, issue_id, from_column_id, to_column_id, position = 0 }) {
    if (!board_id || !issue_id || !to_column_id) {
      const e = new Error("board_id, issue_id and to_column_id required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    const board = await this.getBoard(board_id);
    const cfg = board.config || { columns: [], issuePositions: {} };
    const pos = { ...(cfg.issuePositions || {}) };
    const fromList = Array.isArray(pos[from_column_id]) ? [...pos[from_column_id]] : [];
    const toList = Array.isArray(pos[to_column_id]) ? [...pos[to_column_id]] : [];

    // Remove from source if source provided
    if (from_column_id) {
      const idx = fromList.indexOf(issue_id);
      if (idx !== -1) fromList.splice(idx, 1);
      pos[from_column_id] = fromList;
    } else {
      // Ensure it's not present anywhere else
      for (const key of Object.keys(pos)) {
        const i = pos[key].indexOf(issue_id);
        if (i !== -1) pos[key].splice(i, 1);
      }
    }

    // Insert into target at given position
    const insertAt = Math.max(0, Math.min(position, toList.length));
    toList.splice(insertAt, 0, issue_id);
    pos[to_column_id] = toList;

    const nextConfig = { ...cfg, issuePositions: pos };
    const { rows } = await db.query("UPDATE boards SET config=$1 WHERE id=$2 RETURNING *", [
      nextConfig,
      board_id,
    ]);

    // Also update issue.status to match destination column name (MVP Kanban mapping)
    const column = (cfg.columns || []).find(c => c.id === to_column_id);
    if (column && column.name) {
      await db.query("UPDATE issues SET status=$1, updated_at=now() WHERE id=$2", [column.name.toString().toLowerCase().replace(/\s+/g, "_"), issue_id]);
    }

    await this.safeAudit(req, "board.dnd.move", "board", board_id, {
      issue_id,
      from_column_id,
      to_column_id,
      position: insertAt,
    });

    const updatedBoard = rows[0];
    this.safeEmit(() => emitBoardEvent(getBoardRoom(board_id, updatedBoard.project_id), "board:issue_moved", {
      board_id,
      issue_id,
      from_column_id,
      to_column_id,
      position: insertAt,
    }));

    return { ok: true, board_id, issue_id, from_column_id, to_column_id, position: insertAt };
  }

  // PUBLIC_INTERFACE
  /**
   * Reorder an issue within a single column to a position.
   * @param {import('express').Request|null} req
   * @param {{board_id:string, column_id:string, issue_id:string, position:number}} input
   * @returns {Promise<{ok:boolean}>}
   */
  async reorderIssue(req, { board_id, column_id, issue_id, position }) {
    if (!board_id || !column_id || !issue_id || typeof position !== "number") {
      const e = new Error("board_id, column_id, issue_id and numeric position required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    const board = await this.getBoard(board_id);
    const cfg = board.config || { columns: [], issuePositions: {} };
    const pos = { ...(cfg.issuePositions || {}) };
    const list = Array.isArray(pos[column_id]) ? [...pos[column_id]] : [];

    // Remove if exists
    const idx = list.indexOf(issue_id);
    if (idx !== -1) list.splice(idx, 1);
    // Insert at new position
    const insertAt = Math.max(0, Math.min(position, list.length));
    list.splice(insertAt, 0, issue_id);
    pos[column_id] = list;

    const nextConfig = { ...cfg, issuePositions: pos };
    const { rows } = await db.query("UPDATE boards SET config=$1 WHERE id=$2 RETURNING *", [
      nextConfig,
      board_id,
    ]);

    await this.safeAudit(req, "board.dnd.reorder", "board", board_id, {
      issue_id,
      column_id,
      position: insertAt,
    });

    const updatedBoard = rows[0];
    this.safeEmit(() => emitBoardEvent(getBoardRoom(board_id, updatedBoard.project_id), "board:issue_reordered", {
      board_id,
      column_id,
      issue_id,
      position: insertAt,
    }));

    return { ok: true };
  }

  async getBoard(board_id) {
    const { rows } = await getDb().query("SELECT * FROM boards WHERE id=$1", [board_id]);
    if (!rows[0]) {
      const e = new Error("Board not found");
      e.status = 404;
      e.code = "NotFound";
      throw e;
    }
    rows[0].config = rows[0].config || { columns: [], issuePositions: {} };
    return rows[0];
  }

  async safeAudit(req, action, resourceType, resourceId, metadata) {
    try {
      await auditLog(req, action, resourceType, resourceId, metadata);
    } catch (_) {}
  }

  safeEmit(fn) {
    try { fn(); } catch (_) {}
  }
}

module.exports = new DnDService();
