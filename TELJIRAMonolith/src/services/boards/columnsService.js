"use strict";

const { getDb } = require("../../db");
const { auditLog } = require("../../middleware/audit");
const { emitBoardEvent, getBoardRoom } = require("./realtimeService");
const { v4: uuidv4 } = require("uuid");

/**
 * ColumnsService manages board columns and their ordering inside boards.config.
 * MVP stores columns in the boards.config JSONB to avoid new tables.
 */
class ColumnsService {
  // PUBLIC_INTERFACE
  /**
   * List columns for a board (from config).
   * @param {import('express').Request|null} _req
   * @param {{board_id:string}} input
   * @returns {Promise<Array<{id:string,name:string,order:number}>>}
   */
  async listColumns(_req, { board_id }) {
    const board = await this.getBoard(board_id);
    const cols = Array.isArray(board.config?.columns) ? board.config.columns : [];
    return cols.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  // PUBLIC_INTERFACE
  /**
   * Create a column on a board.
   * @param {import('express').Request|null} req
   * @param {{board_id:string,name:string,order?:number}} input
   * @returns {Promise<{id:string,name:string,order:number}>}
   */
  async createColumn(req, { board_id, name, order }) {
    if (!board_id || !name) {
      const e = new Error("board_id and name required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    const board = await this.getBoard(board_id);
    const cols = Array.isArray(board.config?.columns) ? [...board.config.columns] : [];
    const id = uuidv4();
    const nextOrder = typeof order === "number" ? order : (cols.length ? Math.max(...cols.map(c => c.order ?? 0)) + 1 : 1);
    cols.push({ id, name, order: nextOrder });

    const nextConfig = {
      ...board.config,
      columns: cols,
      issuePositions: board.config?.issuePositions || {},
    };

    const { rows } = await db.query("UPDATE boards SET config=$1 WHERE id=$2 RETURNING *", [
      nextConfig,
      board_id,
    ]);
    await this.safeAudit(req, "board.column.create", "board", board_id, { column_id: id, name });
    this.safeEmit(() => emitBoardEvent(getBoardRoom(board_id, rows[0].project_id), "board:columns_updated", { board_id, columns: cols }));
    return { id, name, order: nextOrder };
  }

  // PUBLIC_INTERFACE
  /**
   * Update column order with full list (atomic).
   * @param {import('express').Request|null} req
   * @param {{board_id:string, columns:Array<{id:string,order:number}>}} input
   * @returns {Promise<{ok:boolean, columns:any[]}>}
   */
  async updateColumnOrder(req, { board_id, columns }) {
    if (!board_id || !Array.isArray(columns)) {
      const e = new Error("board_id and columns required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    const board = await this.getBoard(board_id);
    const colMap = new Map((board.config?.columns || []).map(c => [c.id, c]));
    for (const item of columns) {
      if (!colMap.has(item.id)) {
        const e = new Error("Unknown column id: " + item.id);
        e.status = 400;
        e.code = "BadRequest";
        throw e;
      }
      colMap.get(item.id).order = Number(item.order ?? 0);
    }
    const cols = Array.from(colMap.values());
    const nextConfig = { ...board.config, columns: cols };
    const { rows } = await db.query("UPDATE boards SET config=$1 WHERE id=$2 RETURNING *", [
      nextConfig,
      board_id,
    ]);
    await this.safeAudit(req, "board.column.reorder", "board", board_id, { count: cols.length });
    this.safeEmit(() => emitBoardEvent(getBoardRoom(board_id, rows[0].project_id), "board:columns_updated", { board_id, columns: cols }));
    return { ok: true, columns: cols };
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a column from a board. Moves any issue positions to a fallback (removes them).
   * @param {import('express').Request|null} req
   * @param {{board_id:string,column_id:string}} input
   * @returns {Promise<{ok:boolean}>}
   */
  async deleteColumn(req, { board_id, column_id }) {
    if (!board_id || !column_id) {
      const e = new Error("board_id and column_id required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    const board = await this.getBoard(board_id);
    const cols = (board.config?.columns || []).filter(c => c.id !== column_id);
    const issuePositions = { ...(board.config?.issuePositions || {}) };
    delete issuePositions[column_id];

    const nextConfig = { ...board.config, columns: cols, issuePositions };
    const { rows } = await db.query("UPDATE boards SET config=$1 WHERE id=$2 RETURNING *", [
      nextConfig,
      board_id,
    ]);
    await this.safeAudit(req, "board.column.delete", "board", board_id, { column_id });
    this.safeEmit(() => emitBoardEvent(getBoardRoom(board_id, rows[0].project_id), "board:columns_updated", { board_id, columns: cols }));
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
    // Ensure config object is present
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

module.exports = new ColumnsService();
