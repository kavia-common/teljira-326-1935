const { getDb } = require("../db");

async function auditLog(req, action, resourceType, resourceId, metadata = {}) {
  try {
    const db = getDb();
    const actorId = req?.context?.user?.id || null;
    const ip = req.ip;
    const ua = req.headers["user-agent"];
    await db.query(
      "INSERT INTO audit_logs(actor_id, action, resource_type, resource_id, metadata, ip, user_agent) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [actorId, action, resourceType, resourceId, metadata, ip, ua],
    );
  } catch (e) {
    // Avoid crashing on audit log failure
  }
}

module.exports = { auditLog };
