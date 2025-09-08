# Automation Engine (Rule Evaluation, Conditions, Actions)

Overview
- This module provides a clear separation of concerns for the automation engine:
  - Rule storage and orchestration
  - Condition parsing/evaluation
  - Action execution
- It enables maintainable, testable automation logic, decoupled from routes and other services.

Structure
- engine.js
  - PUBLIC_INTERFACE evaluateAndExecute(context, event)
  - Orchestrates fetching rules, evaluating conditions, and executing actions.
  - Applies rule scoping and safety guards; audits results.
- ruleEvaluator.js
  - PUBLIC_INTERFACE matchRules(event, rules)
  - Filters rules by trigger and evaluates per-rule conditions via conditionParser.
- conditionParser.js
  - PUBLIC_INTERFACE parseCondition(condition)
  - PUBLIC_INTERFACE evaluateConditions(conditions, context, event)
  - Parses and evaluates simple condition expressions against event/context.
- actionExecutor.js
  - PUBLIC_INTERFACE executeActions(actions, context, event)
  - Executes supported action types (notify, update_field (placeholder), call_webhook (placeholder)).
  - Uses Notification Dispatcher for multi-channel notifications.

Rule Model (MVP)
- Rule:
  {
    id: string,
    name: string,
    enabled: boolean,
    trigger: { type: string },           // e.g., "issue.created", "issue.updated"
    conditions: [                        // AND semantics across array; OR supported via anyOf
      { type: "field_equals", field: "issue.priority", value: "high" },
      { type: "user_in_roles", roles: ["org_admin","project_admin"] },
      { type: "anyOf", conditions: [ { ... }, { ... } ] }
    ],
    actions: [
      {
        type: "notify",
        channels: ["in-app","email","teams"],
        recipients: [
          { user_socket_room: "project:{project_id}" },
          { email: "team@example.com" }
        ],
        data: { template: "Issue created: {issue.title}" },
        priority: "normal"
      }
    ],
    scope: { project_id?: string, workspace_id?: string }
  }

Triggers
- The engine is invoked by event producers (e.g., issues route) by calling AutomationEngine.evaluateAndExecute(ctx, event)
- Example event:
  {
    type: "issue.created",
    data: { issue: { ... }, project_id: "...", workspace_id: "..." },
    actor: { id, email, roles, permissions }
  }

Security and Compliance
- The engine does not alter auth; it uses the existing req.context for audit.
- All action executions are audited via auditLog (non-throwing helper inside engine).
- Avoid hard-coding secrets; use environment variables as configured.

Extending Conditions
- Add a new condition type handler in conditionParser.js with clear docs.
- Ensure it’s side-effect free and fast; guard against undefined paths.

Extending Actions
- Add a new action type in actionExecutor.js.
- Keep IO operations isolated, reuse Notification Dispatcher for channels.
- Add OpenAPI notes if exposed via API.

Usage (Internal)
```js
const AutomationEngine = require("./services/automation/engine");

// inside routes/modules/issues.js after creating an issue:
await AutomationEngine.evaluateAndExecute(req, {
  type: "issue.created",
  data: { issue: createdIssue, project_id: createdIssue.project_id },
  actor: req.context.user
});
```

Notes
- In this MVP, rules are held in-memory (engine.js getRulesForScope()) for clarity.
- Future: persist rules in DB table automation_rules and load via repository.
