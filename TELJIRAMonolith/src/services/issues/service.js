"use strict";

const { getDb } = require("../../db");
const { auditLog } = require("../../middleware/audit");
const { getIo } = require("../../socket");

/**
 * IssueService encapsulates issue lifecycle logic:
 * - creation with per-project sequential key (simple)
 * - listing by filters
 * - partial update (edit)
 * - transition (status change; future: workflow validation)
 * - linking (MVP stub)
 * - deletion
 *
 * Public methods are documented and marked with PUBLIC_INTERFACE.
 */
class IssueService {
  // PUBLIC_INTERFACE
  /**
   * Create an issue for a project and emit events.
   * Generates a simple sequential key per project (stringified count+1).
   * @param {import('express').Request|null} req
   * @param {{project_id:string,sprint_id?:string|null,type_id?:string|null,title:string,description?:string|null,priority?:string|null}} input
   * @returns {Promise<any>} Created issue row
   */
  async createIssue(req, { project_id, sprint_id = null, type_id = null, title, description = null, priority = "medium" }) {
    if (!project_id || !title) {
      const e = new Error("project_id and title required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();

    // Generate simple incremental key per project (MVP)
    const count = await db.query("SELECT COUNT(*)::int as c FROM issues WHERE project_id=$1", [project_id]);
    const seq = (count.rows[0]?.c || 0) + 1;
    const key = String(seq);

    const { rows } = await db.query(
      `INSERT INTO issues(project_id, sprint_id, type_id, key, title, description, priority, reporter_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        project_id,
        sprint_id,
        type_id,
        key,
        title,
        description,
        priority || "medium",
        req?.context?.user?.id || null,
      ],
    );
    const created = rows[0];

    await this.safeAudit(req, "issue.create", "issue", created.id, { key, project_id });
    this.safeEmit(() => getIo().to(`project:${project_id}`).emit("issue:created", created));

    return created;
  }

  // PUBLIC_INTERFACE
  /**
   * List issues by optional filters.
   * @param {import('express').Request|null} _req
   * @param {{project_id?:string,sprint_id?:string}} filters
   * @returns {Promise<any[]>}
   */
  async listIssues(_req, { project_id, sprint_id }) {
    let q = "SELECT * FROM issues";
    const args = [];
    const conds = [];
    if (project_id) {
      conds.push(`project_id=$${args.length + 1}`);
      args.push(project_id);
    }
    if (sprint_id) {
      conds.push(`sprint_id=$${args.length + 1}`);
      args.push(sprint_id);
    }
    if (conds.length) q += " WHERE " + conds.join(" AND ");
    q += " ORDER BY created_at DESC";
    const { rows } = await getDb().query(q, args);
    return rows;
  }

  // PUBLIC_INTERFACE
  /**
   * Partially update an issue with provided fields (whitelisted).
   * Emits "issue:updated" on project room.
   * @param {import('express').Request|null} req
   * @param {{issue_id:string,fields:Record<string, any>}} input
   * @returns {Promise<any>}
   */
  async updateIssue(req, { issue_id, fields }) {
    if (!issue_id || !fields || typeof fields !== "object") {
      const e = new Error("issue_id and fields required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }

    const allowed = ["status", "assignee_id", "points", "title", "description", "priority", "sprint_id", "type_id"];
    const updates = [];
    const args = [];
    let i = 1;
    for (const [k, v] of Object.entries(fields)) {
      if (!allowed.includes(k)) continue;
      if (v !== undefined) {
        updates.push(`${k}=$${i++}`);
        args.push(v);
      }
    }
    if (!updates.length) {
      const e = new Error("No valid fields to update");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    args.push(issue_id);

    const { rows } = await getDb().query(
      `UPDATE issues SET ${updates.join(", ")}, updated_at=now() WHERE id=$${i} RETURNING *`,
      args,
    );
    const updated = rows[0];
    if (!updated) {
      const e = new Error("Issue not found");
      e.status = 404;
      e.code = "NotFound";
      throw e;
    }

    await this.safeAudit(req, "issue.update", "issue", updated.id, { changed: Object.keys(fields) });
    this.safeEmit(() => getIo().to(`project:${updated.project_id}`).emit("issue:updated", updated));
    return updated;
  }

  // PUBLIC_INTERFACE
  /**
   * Transition issue status (MVP: free-form, no workflow validation).
   * Future: validate against workflow, run validators and post-functions.
   * @param {import('express').Request|null} req
   * @param {{issue_id:string,to_status:string}} input
   * @returns {Promise<any>}
   */
  async transitionIssue(req, { issue_id, to_status }) {
    if (!issue_id || !to_status) {
      const e = new Error("issue_id and to_status required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    return this.updateIssue(req, { issue_id, fields: { status: to_status } });
  }

  // PUBLIC_INTERFACE
  /**
   * Link two issues (MVP stub).
   * Placeholder to be replaced with issue_links table and validations.
   * @param {import('express').Request|null} req
   * @param {{source_id:string,target_id:string,type:string}} input
   * @returns {Promise<{ok:boolean, message:string}>}
   */
  async linkIssues(req, { source_id, target_id, type }) {
    if (!source_id || !target_id || !type) {
      const e = new Error("source_id, target_id and type required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    await this.safeAudit(req, "issue.link", "issue", source_id, { target_id, type });
    return { ok: true, message: "Linking not implemented in MVP (stub)" };
  }

  // PUBLIC_INTERFACE
  /**
   * Delete an issue.
   * @param {import('express').Request|null} req
   * @param {{issue_id:string}} input
   * @returns {Promise<{ok:boolean}>}
   */
  async deleteIssue(req, { issue_id }) {
    if (!issue_id) {
      const e = new Error("issue_id required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    const before = await db.query("SELECT id, project_id FROM issues WHERE id=$1", [issue_id]);
    const found = before.rows[0];
    if (!found) {
      const e = new Error("Issue not found");
      e.status = 404;
      e.code = "NotFound";
      throw e;
    }
    await db.query("DELETE FROM issues WHERE id=$1", [issue_id]);

    await this.safeAudit(req, "issue.delete", "issue", issue_id, {});
    this.safeEmit(() => getIo().to(`project:${found.project_id}`).emit("issue:deleted", { id: issue_id }));

    return { ok: true };
  }

  /**
   * Helper: audit without throwing to caller.
   */
  async safeAudit(req, action, resourceType, resourceId, metadata) {
    try {
      await auditLog(req, action, resourceType, resourceId, metadata);
    } catch (_) {
      // ignore audit failures
    }
  }

  /**
   * Helper: safe socket emit wrapper.
   */
  safeEmit(fn) {
    try {
      fn();
    } catch (_) {
      // ignore socket not initialized in some contexts
    }
  }
}

module.exports = new IssueService();
