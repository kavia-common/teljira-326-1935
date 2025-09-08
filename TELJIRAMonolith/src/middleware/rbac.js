function requirePermissions(...required) {
  return (req, res, next) => {
    const user = req.context.user;
    if (!user)
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Auth required" });
    const perms = new Set(user.permissions || []);
    const ok = required.every((p) => perms.has(p));
    if (!ok)
      return res
        .status(403)
        .json({ error: "Forbidden", message: "Insufficient permissions" });
    next();
  };
}

module.exports = { requirePermissions };
