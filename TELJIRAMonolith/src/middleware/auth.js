const jwt = require('jsonwebtoken');

/**
 * Verify Bearer token and attach user to req.context.
 * Includes roles and permissions from the JWT payload if present.
 */
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing token' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.context.user = {
      id: payload.sub,
      email: payload.email,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      // Ensure permissions is always an array to satisfy RBAC middleware expectations
      permissions: Array.isArray(payload.permissions) ? payload.permissions : []
    };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
}

module.exports = { authenticate };
