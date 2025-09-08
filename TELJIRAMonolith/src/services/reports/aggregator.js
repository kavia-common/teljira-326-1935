"use strict";

/**
 * Aggregates reporting data from the database.
 * Keep this module focused on DB reads and metric calculations.
 */

/**
 * Fetch a summary for a project.
 * Current metrics:
 * - issues_total
 * - issues_by_status: { todo, in_progress, done } (status buckets are derived; unknowns grouped under "other")
 * - last_updated_at: last updated_at of any issue in the project (nullable)
 * - created_at: latest created_at (nullable)
 *
 * @param {import('pg').Pool} db
 * @param {{project_id:string}} params
 * @returns {Promise<{
 *   project_id:string,
 *   issues_total:number,
 *   issues_by_status:Record<string, number>,
 *   last_updated_at:string|null,
 *   latest_created_at:string|null
 * }>}
 */
async function getProjectSummary(db, { project_id }) {
  // Total issues
  const totalQ = db.query(
    "SELECT COUNT(*)::int AS count FROM issues WHERE project_id=$1",
    [project_id],
  );

  // By status
  const byStatusQ = db.query(
    "SELECT COALESCE(status,'unknown') AS status, COUNT(*)::int AS count FROM issues WHERE project_id=$1 GROUP BY status",
    [project_id],
  );

  // Last updated and latest created
  const lastTimesQ = db.query(
    "SELECT MAX(updated_at) AS last_updated_at, MAX(created_at) AS latest_created_at FROM issues WHERE project_id=$1",
    [project_id],
  );

  const [totalR, byStatusR, lastTimesR] = await Promise.all([
    totalQ,
    byStatusQ,
    lastTimesQ,
  ]);

  const total = totalR.rows[0]?.count || 0;
  const statusBuckets = {};
  for (const row of byStatusR.rows) {
    const key = normalizeStatus(row.status);
    statusBuckets[key] = (statusBuckets[key] || 0) + Number(row.count || 0);
  }

  return {
    project_id,
    issues_total: total,
    issues_by_status: statusBuckets,
    last_updated_at: lastTimesR.rows[0]?.last_updated_at || null,
    latest_created_at: lastTimesR.rows[0]?.latest_created_at || null,
  };
}

function normalizeStatus(s) {
  const v = String(s || "").toLowerCase();
  if (v === "todo") return "todo";
  if (v === "in_progress" || v === "in-progress" || v === "in progress") return "in_progress";
  if (v === "done" || v === "completed") return "done";
  return "other";
}

// PUBLIC_INTERFACE
/**
 * Get Project Summary metrics.
 */
async function getProjectSummaryPublic(db, params) {
  return getProjectSummary(db, params);
}

// Placeholder stubs for future reports

// PUBLIC_INTERFACE
/**
 * Placeholder: Get Sprint Burndown metrics.
 * @param {import('pg').Pool} _db
 * @param {{sprint_id:string}} _params
 * @returns {Promise<{message:string}>}
 */
async function getSprintBurndown(_db, _params) {
  return { message: "burndown report not implemented in MVP" };
}

module.exports = {
  getProjectSummary: getProjectSummaryPublic,
  getSprintBurndown,
};
