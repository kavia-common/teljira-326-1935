const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { requirePermissions } = require("../../middleware/rbac");
const reportsService = require("../../services/reports/service");

const router = express.Router();

/**
 * @openapi
 * /api/reports/summary:
 *   get:
 *     tags: [Reports]
 *     summary: Project summary
 *     description: Returns aggregated project metrics such as total issues and issues by status. Supports JSON (default) or CSV output.
 *     parameters:
 *       - in: query
 *         name: project_id
 *         required: true
 *         schema:
 *           type: string
 *           description: Project ID to summarize
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           description: Output format (default json)
 *     responses:
 *       200:
 *         description: Summary report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project_id: { type: string }
 *                 issues_total: { type: number }
 *                 issues_by_status:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                 last_updated_at: { type: string, nullable: true, format: date-time }
 *                 latest_created_at: { type: string, nullable: true, format: date-time }
 *           text/csv:
 *             schema:
 *               type: string
 *               example: |
 *                 key,value
 *                 project_id,123
 *                 issues_total,42
 *                 issues_by_status.todo,10
 *                 issues_by_status.in_progress,20
 *                 issues_by_status.done,12
 */
router.get(
  "/summary",
  authenticate,
  requirePermissions("project.read"),
  async (req, res, next) => {
    try {
      const { project_id, format } = req.query;
      const f = (format || "json").toString().toLowerCase();
      const result = await reportsService.getProjectSummaryReport(req, {
        project_id,
        format: f === "csv" ? "csv" : "json",
      });
      if (f === "csv") {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="project_summary_${project_id}.csv"`,
        );
        return res.send(result);
      }
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  },
);

module.exports = router;
