# Integrations Layer Refactor

Summary
- Introduces a modular integrations layer under src/services/integrations with clear service boundaries for:
  - Git (link PRs, fetch commits; signature validation helper)
  - Third-party Reporting APIs (proxy)
  - Chat/Webhook integrations (inbound/outbound)
- Provides new API routes under /api/integrations to access these services.
- Existing /api/webhooks updated to use shared signature validator from integrations layer.

Public Interfaces
- src/services/integrations/git/service.js
  - PUBLIC_INTERFACE linkPullRequest(req, { issue_key, pr_url, provider?, metadata? })
  - PUBLIC_INTERFACE getCommitsForIssue(req, { issue_key, provider?, since?, until? })
  - PUBLIC_INTERFACE validateSignature(rawBody, signature, secret)
- src/services/integrations/reporting/service.js
  - PUBLIC_INTERFACE fetchExternalReport(req, { report_type, params?, format? })
- src/services/integrations/chat/service.js
  - PUBLIC_INTERFACE handleInboundWebhook(req, { provider, payload })
  - PUBLIC_INTERFACE postMessage(req, { provider, target, message, options? })

Routes
- src/routes/modules/integrations.js
  - POST /api/integrations/git/link-pr
  - GET  /api/integrations/git/commits
  - GET  /api/integrations/reporting/external
  - POST /api/integrations/chat/inbound
  - POST /api/integrations/chat/post

Security and RBAC
- All routes require authentication and appropriate permissions unless explicitly allowed for inbound webhooks via INTEGRATIONS_INBOUND_ALLOW_ANON.
- Signature validation helper supports "sha256=<hex>" format.

Extensibility
- Add provider-specific adapters in subfolders (e.g., ./git/adapters/github.js) and delegate from service methods.
- Add new integration types by creating new folders and exporting from src/services/integrations/index.js.
