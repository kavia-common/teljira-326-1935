const jwt = require('jsonwebtoken');
const { HttpError } = require('../setup/errors');
const { User } = require('../models/User');

async function authMiddleware(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'unauthorized', 'Missing token');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.query().findById(payload.sub).withGraphFetched('roles');
    if (!user) throw new HttpError(401, 'unauthorized', 'Invalid token');
    if (process.env.MFA_ENABLED === 'true' && user.mfa_enabled && !payload.mfa) {
      throw new HttpError(401, 'mfa_required', 'MFA confirmation required');
    }
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

/**
 * RBAC guard factory. Usage: requireRole('admin') or requirePermission('project:write')
 */
function requireRole(roleName) {
  return (req, _res, next) => {
    const has = (req.user?.roles || []).some((r) => r.name === roleName);
    if (!has) return next(new HttpError(403, 'forbidden', 'Insufficient role'));
    return next();
  };
}

function requirePermission(permission) {
  return (req, _res, next) => {
    const perms = new Set();
    (req.user?.roles || []).forEach((r) => (r.permissions || []).forEach((p) => perms.add(p)));
    if (!perms.has(permission)) return next(new HttpError(403, 'forbidden', 'Insufficient permissions'));
    return next();
  };
}

module.exports = { authMiddleware, requireRole, requirePermission };
