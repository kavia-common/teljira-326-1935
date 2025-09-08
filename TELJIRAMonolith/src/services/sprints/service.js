"use strict";

const { getDb } = require("../../db");
const { auditLog } = require("../../middleware/audit");
const { getIo } = require("../../socket");

/**
 * SprintService encapsulates sprint lifecycle logic: create, update, board interaction, complete.
 * Public methods are documented and marked with PUBLIC_INTERFACE.
 */
class SprintService {
  // PUBLIC_INTERFACE
  /**
   * Create a new sprint for a project.
   * @param {import('express').Request|null} req Request for audit context (nullable for internal callers)
   * @param {{project_id:string,name:string,goal?:string|null,start_date?:string|null,end_date?:string|null}} input
   * @returns {Promise<any>} Created sprint row
   */
  async createSprint(req, { project_id, name, goal = null, start_date = null, end_date = null }) {
    if (!project_id || !name) {
      const e = new Error("project_id and name required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    const { rows } = await db.query(
      "INSERT INTO sprints(project_id, name, goal, start_date, end_date, state) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [project_id, name, goal, start_date, end_date, "planned"],
    );
    const created = rows[0];

    await this.safeAudit(req, "sprint.create", "sprint", created.id, { project_id });
    try {
      getIo().to(`project:${project_id}`).emit("sprint:created", created);
    } catch (_) {
      // ignore socket errors (e.g., not initialized)
    }
    return created;
  }

  // PUBLIC_INTERFACE
  /**
   * Update sprint state (planned/started/completed/etc.).
   * @param {import('express').Request|null} req
   * @param {{sprint_id:string,state:string}} input
   * @returns {Promise<any>} Updated sprint row
   */
  async updateSprintState(req, { sprint_id, state }) {
    if (!sprint_id || !state) {
      const e = new Error("sprint_id and state required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    const { rows } = await db.query("UPDATE sprints SET state=$1 WHERE id=$2 RETURNING *", [
      state,
      sprint_id,
    ]);
    if (!rows[0]) {
      const e = new Error("Sprint not found");
      e.status = 404;
      e.code = "NotFound";
      throw e;
    }
    await this.safeAudit(req, "sprint.state.update", "sprint", rows[0].id, { state });
    return rows[0];
  }

  // PUBLIC_INTERFACE
  /**
   * Complete a sprint and optionally move incomplete issues.
   * MVP behavior:
   * - Set sprint.state = 'completed'
   * - If move_incomplete === 'backlog': set sprint_id = null on issues not done
   * - If move_incomplete === 'next': placeholder (no-op) to be implemented
   * @param {import('express').Request|null} req
   * @param {{sprint_id:string, move_incomplete?: "backlog"|"next"}} input
   * @returns {Promise<{sprint:any, moved:number}>}
   */
  async completeSprint(req, { sprint_id, move_incomplete = "backlog" }) {
    const db = getDb();
    await db.query("BEGIN");
    try {
      const s = await db.query("UPDATE sprints SET state='completed' WHERE id=$1 RETURNING *", [
        sprint_id,
      ]);
      const sprint = s.rows[0];
      if (!sprint) {
        const e = new Error("Sprint not found");
        e.status = 404;
        e.code = "NotFound";
        throw e;
      }

      let moved = 0;
      if (move_incomplete === "backlog") {
        const r = await db.query(
          "UPDATE issues SET sprint_id=NULL, updated_at=now() WHERE sprint_id=$1 AND (status IS NULL OR status NOT IN ('done','completed')) RETURNING id",
          [sprint_id],
        );
        moved = r.rowCount || 0;
      } else if (move_incomplete === "next") {
        // Placeholder: identify next sprint for same project and move issues there.
        // For MVP, do nothing and return moved=0.
        moved = 0;
      }

      await db.query("COMMIT");

      await this.safeAudit(req, "sprint.complete", "sprint", sprint_id, {
        move_incomplete,
        moved,
      });

      try {
        getIo().to(`project:${sprint.project_id}`).emit("sprint:completed", {
          sprint_id,
          move_incomplete,
          moved,
        });
      } catch (_) {
        // ignore socket issues
      }

      return { sprint, moved };
    } catch (e) {
      await getDb().query("ROLLBACK");
      throw e;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Helper to associate a sprint to a board (placeholder).
   * In MVP the boards table has a JSONB config; we could store an array of sprint_ids there if desired.
   * @param {import('express').Request|null} req
   * @param {{board_id:string,sprint_id:string}} input
   * @returns {Promise<{ok:boolean}>}
   */
  async attachSprintToBoard(req, { board_id, sprint_id }) {
    // Placeholder: update boards.config to include sprint_id; ensure board/project alignment if needed.
    await this.safeAudit(req, "board.attach_sprint", "board", board_id, { sprint_id });
    return { ok: true };
  }

  // PUBLIC_INTERFACE
  /**
   * Get sprints for a project. Useful for listing in future endpoints.
   * @param {import('express').Request|null} _req
   * @param {{project_id:string}} input
   * @returns {Promise<any[]>}
   */
  async getSprintsForProject(_req, { project_id }) {
    const { rows } = await getDb().query(
      "SELECT * FROM sprints WHERE project_id=$1 ORDER BY created_at DESC",
      [project_id],
    );
    return rows;
  }

  /**
   * Audit helper that won't throw.
   */
  async safeAudit(req, action, resourceType, resourceId, metadata) {
    try {
      await auditLog(req, action, resourceType, resourceId, metadata);
    } catch (_) {
      // ignore audit failures
    }
  }
}

module.exports = new SprintService();
