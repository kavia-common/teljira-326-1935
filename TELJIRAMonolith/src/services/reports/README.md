# Reports & Analytics Module

Overview
- This module encapsulates reporting logic with a clear separation of concerns:
  - Aggregation: Data access and metric computation from PostgreSQL.
  - Formatting: Convert aggregated results into API-friendly shapes or export formats (JSON/CSV).
  - Service: Orchestrates report generation and exposes stable public interfaces for routes and other modules.

Structure
- aggregator.js
  - PUBLIC_INTERFACE getProjectSummary(db, { project_id })
  - PUBLIC_INTERFACE getSprintBurndown(db, { sprint_id }) [placeholder]
- formatter.js
  - PUBLIC_INTERFACE asJson(result)
  - PUBLIC_INTERFACE asCsv(result)
- service.js
  - PUBLIC_INTERFACE getProjectSummaryReport(req, { project_id, format? })
  - PUBLIC_INTERFACE getSprintBurndownReport(req, { sprint_id, format? }) [placeholder]

Design Notes
- Keep DB access and metric logic in aggregator to enable reuse and separate performance considerations.
- Formatters are pure, deterministic transformations.
- Service layer handles validation, orchestrates aggregation + formatting, and prepares return shapes for API.

Extensibility
- Add new aggregator functions for additional reports (velocity, cumulative flow, workload, SLA).
- Add export options by extending formatter with additional content types.

Security & Compliance
- Do not embed secrets or environment details in reports.
- Ensure permission checks occur in routes (RBAC) before calling service.
- Audit/report request logging can be implemented in service if needed.

Usage (Internal)
```js
const reportsService = require("./service");
const result = await reportsService.getProjectSummaryReport(req, { project_id, format: "json" });
res.json(result);
```
