const jwt = require("jsonwebtoken");

/**
 * Verify Bearer token and attach user to req.context.
 * Note: Permissions are not expected on the token. The RBAC layer resolves permissions
 * from the user's roles against the DB when needed.
 */
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Missing token" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.context.user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      // permissions will be resolved on demand by RBAC middleware/services
    };
    return next();
  } catch (e) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid token" });
  }
}

module.exports = { authenticate };
