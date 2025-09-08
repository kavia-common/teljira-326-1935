"use strict";

const { getDb } = require("../../db");
const { getProjectSummary } = require("./aggregator");
const { asJson, asCsv } = require("./formatter");

/**
 * ReportsService orchestrates validation, aggregation and formatting.
 */
class ReportsService {
  // PUBLIC_INTERFACE
  /**
   * Generate the Project Summary report.
   * Parameters:
   * - project_id: string (required)
   * - format?: 'json' | 'csv' (default 'json')
   *
   * Returns:
   * - if json: object with metrics
   * - if csv: string CSV
   *
   * @param {import('express').Request|null} _req For future audit/permissions context
   * @param {{project_id:string, format?:'json'|'csv'}} params
   * @returns {Promise<any>}
   */
  async getProjectSummaryReport(_req, { project_id, format = "json" }) {
    if (!project_id) {
      const e = new Error("project_id required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const db = getDb();
    const result = await getProjectSummary(db, { project_id });
    if (format === "csv") return asCsv(result);
    return asJson(result);
  }

  // PUBLIC_INTERFACE
  /**
   * Placeholder: Sprint Burndown report.
   * @param {import('express').Request|null} _req
   * @param {{sprint_id:string, format?:'json'|'csv'}} params
   * @returns {Promise<any>}
   */
  async getSprintBurndownReport(_req, { sprint_id, format = "json" }) {
    if (!sprint_id) {
      const e = new Error("sprint_id required");
      e.status = 400;
      e.code = "BadRequest";
      throw e;
    }
    const data = { message: "burndown report not implemented in MVP", sprint_id };
    if (format === "csv") return asCsv(data);
    return asJson(data);
  }
}

module.exports = new ReportsService();
