# Reports Module - Changelog

- Refactor (current):
  - Introduced src/services/reports with modular components:
    - aggregator.js for DB aggregation and metrics
    - formatter.js for result formatting (JSON/CSV)
    - service.js for orchestration and public interfaces
  - Updated route /api/reports/summary to use the new service and support optional CSV export via `?format=csv`.
  - Enhanced OpenAPI docs for /api/reports/summary with response schemas for JSON and CSV.

Backwards Compatibility
- Default endpoint behavior (/api/reports/summary) still returns JSON with similar fields.
- Added new fields: issues_by_status, last_updated_at, latest_created_at.
- Clients relying only on issue count can read `issues_total` in the new response.

Next Steps
- Add additional reports (burndown, velocity, cumulative flow, workload) by extending aggregator and service.
- Consider audit logging for report generation events if compliance requires.
