const { v4: uuidv4 } = require("uuid");

/**
 * Attach a requestId and a base context object to each request.
 * If a user is set by auth middleware, it will be included later.
 */
function requestContext(req, res, next) {
  req.context = {
    requestId: uuidv4(),
    user: null,
  };
  res.setHeader("X-Request-Id", req.context.requestId);
  next();
}

module.exports = { requestContext };
