"use strict";

const logger = require("../../../utils/logger");
const { auditLog } = require("../../../middleware/audit");

/**
 * Service handling third-party reporting API proxies.
 * This is distinct from internal reports module.
 */
class ReportingApiService {
  // PUBLIC_INTERFACE
  /**
   * Fetch a report from an external reporting API (stub).
   * @param {import('express').Request} req
   * @param {{ report_type: string, params?: any, format?: 'json'|'csv' }} args
   * @returns {Promise<any>}
   */
  async fetchExternalReport(req, { report_type, params, format = "json" }) {
    if (!report_type) {
      const e = new Error("report_type is required");
      e.status = 400;
      e.code = "bad_request";
      throw e;
    }
    await this.safeAudit(req, "integrations.reporting.fetch", "report", report_type, { params, format });

    // Placeholder: call external API with fetch/axios, normalize errors.
    logger.info("fetchExternalReport (stub)", { report_type, format });

    if (format === "csv") {
      return `key,value\nreport_type,${report_type}\nstatus,ok\n`;
    }
    return { report_type, status: "ok", params: params || {} };
  }

  async safeAudit(req, action, resourceType, resourceId, metadata) {
    try {
      await auditLog(req, action, resourceType, resourceId, metadata);
    } catch (_) {
      // swallow
    }
  }
}

module.exports = new ReportingApiService();
