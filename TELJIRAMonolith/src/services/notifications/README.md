# Notification Dispatcher

Design goals:
- Clear separation of concerns: dispatcher orchestrates, adapters handle channel specifics.
- Pluggable adapters for email, teams (webhook), and in-app (Socket.IO).
- Public interface: dispatcher.dispatch(req, payload) validates, formats, sends, and audits.

Usage:
```js
const dispatcher = require("./dispatcher");
await dispatcher.dispatch(req, {
  event_type: "issue.created",
  recipients: [{ email: "user@example.com", user_socket_room: "user:{id}" }],
  channels: ["email", "in-app"],
  data: { issueId: "..." },
  priority: "normal",
});
```

Security:
- Route /api/notifications/dispatch is protected by JWT and requirePermissions("notifications.send").
- Internals can call dispatcher directly without HTTP.
