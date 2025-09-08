const { AuditLog } = require('../models/AuditLog');

async function auditMiddleware(req, res, next) {
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const start = process.hrtime.bigint();
  res.on('finish', async () => {
    try {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      if (req.log) {
        req.log.info(
          { method: req.method, url: req.originalUrl, status: res.statusCode, durationMs },
          'HTTP'
        );
      }
      if (!isMutating) return;
      await AuditLog.query().insert({
        actor_id: req.user?.id || null,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,
        user_agent: req.headers['user-agent'] || '',
        request_id: req.context?.requestId,
        payload: JSON.stringify({ body: req.body || {}, params: req.params || {}, query: req.query || {} })
      });
    } catch (e) {
      // non-blocking audit
      if (req.log) req.log.error({ err: e }, 'audit failure');
    }
  });
  next();
}

module.exports = { auditMiddleware };
