# Integrations Layer (Modular Services)

Overview
- This module standardizes external integrations behind clear service boundaries, decoupling route handlers and internal modules from provider specifics.
- Initial adapters/services:
  - gitService: Git provider-agnostic service (GitHub/GitLab/Bitbucket/Azure DevOps) with stubbed calls and clear extension points.
  - reportingApiService: Example third-party reporting API proxy with simple fetch flow and error normalization.
  - chatService: Chat/webhook integrations abstraction (e.g., MS Teams/Slack) separate from internal Notification Dispatcher, intended for command/webhook scenarios.

Structure
- git/service.js
  - PUBLIC_INTERFACE linkPullRequest(req, { issue_key, pr_url, provider?, metadata? })
  - PUBLIC_INTERFACE getCommitsForIssue(req, { issue_key, provider?, since?, until? })
  - PUBLIC_INTERFACE validateSignature(rawBody, signature, secret)
- reporting/service.js
  - PUBLIC_INTERFACE fetchExternalReport(req, { report_type, params, format? })
- chat/service.js
  - PUBLIC_INTERFACE handleInboundWebhook(req, { provider, payload })
  - PUBLIC_INTERFACE postMessage(req, { provider, target, message, options? })

Design Notes
- Each service is provider-agnostic and can delegate to provider-specific adapters in future (e.g., ./git/adapters/github.js).
- Services encapsulate:
  - Validation and normalization
  - Outbound HTTP calls (placeholder)
  - Audit logging (best-effort)
  - Error shaping (status, code) for HTTP-friendly responses
- Routes remain thin, call services, and handle RBAC.

Security & Compliance
- No secrets are hard-coded; use environment variables (documented in .env.example).
- validateSignature provided for webhook verification (HMAC sha256 "sha256=<hex>" style).
- Audit logging is non-throwing to avoid breaking flows on logging failures.

Extensibility
- Add provider adapters under a dedicated adapters/ directory per integration type.
- Add new service methods with PUBLIC_INTERFACE docs.
- Keep IO and provider-specific details encapsulated.

Usage (Internal)
```js
const { gitService, reportingApiService, chatService } = require("./");
await gitService.linkPullRequest(req, { issue_key: "PROJ-123", pr_url: "https://github.com/org/repo/pull/42" });
const report = await reportingApiService.fetchExternalReport(req, { report_type: "velocity", params: { project_id: "..." }, format: "json" });
await chatService.postMessage(req, { provider: "teams", target: { webhook_url: "https://..." }, message: "Hello from Integrations" });
```

Backwards Compatibility
- Existing /api/webhooks continues to function; a new /api/integrations namespace is added.
- Notification Dispatcher remains focused on in-app/email/teams notifications; chatService is for integration-specific messaging/webhooks.
