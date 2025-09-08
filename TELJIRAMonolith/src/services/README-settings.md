# Settings Module Refactor

Overview
- Settings logic is separated into focused services to improve maintainability and testability:
  - retrievalService: read settings with sane defaults
  - validationService: validate incoming update payloads (pure)
  - updateService: merge, persist, and audit settings updates
- Routes remain thin and delegate to the services.

Structure
- src/services/settings/retrievalService.js
  - PUBLIC_INTERFACE getGlobalSettings()
  - Reads from DB (app_settings.data jsonb) if present; otherwise returns default settings.
  - Merges persistent values with defaults to ensure a consistent shape.
- src/services/settings/validationService.js
  - PUBLIC_INTERFACE validateSettingsPayload(payload)
  - Pure validation of incoming partial settings.
- src/services/settings/updateService.js
  - PUBLIC_INTERFACE updateGlobalSettings(req, { patch })
  - Validates payload, merges with current settings, persists via INSERT into app_settings, best-effort audit.

Routes
- src/routes/modules/settings.js
  - GET /api/settings → retrievalService.getGlobalSettings()
  - PATCH /api/settings → updateService.updateGlobalSettings()
  - OpenAPI annotations updated with request/response schemas and tags.

Database
- MVP assumes a single table to store settings snapshots:
  ```
  CREATE TABLE IF NOT EXISTS app_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  ```
- The update service inserts a new row on each change; the latest row is authoritative. Future improvement: add upsert-once pattern or per-key storage.

Security & RBAC
- Both GET and PATCH require authentication and the permission: `settings.admin`.
- No secrets are hard-coded; configuration is managed by environment variables and persisted settings.

Audit
- Updates write an audit log entry: `settings.update` with changed fields.
- Audit failures are logged and do not break the request flow.

Extensibility
- Extend validationService to cover additional settings sections.
- Extend retrievalService defaults and merge logic accordingly.
- Consider versioning settings to support migrations.

Usage (Internal)
```js
const retrieval = require("../services/settings/retrievalService");
const update = require("../services/settings/updateService");

const current = await retrieval.getGlobalSettings();
const after = await update.updateGlobalSettings(req, { patch: { security: { mfa: false } }});
```

Backwards Compatibility
- GET /api/settings previously returned a placeholder static object.
- Now it returns the retrieved settings merged with defaults; fields are compatible with prior shape and extended with `notifications`.
