const logger = require("../utils/logger");

function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: "NotFound",
    message: "Route not found",
  });
}

function errorHandler(err, req, res, next) {
  logger.error("Unhandled error", {
    err,
    path: req.path,
    requestId: req?.context?.requestId,
  });
  const status = err.status || 500;
  res.status(status).json({
    error: err.code || "InternalServerError",
    message: err.message || "Internal Server Error",
    requestId: req?.context?.requestId,
  });
}

module.exports = { notFoundHandler, errorHandler };
