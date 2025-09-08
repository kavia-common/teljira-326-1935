function notFoundHandler(req, res, _next) {
  res.status(404).json({ error: 'Not Found' });
}

// PUBLIC_INTERFACE
function errorHandler(err, req, res, _next) {
  /** Generic error handler for API */
  const status = err.status || 500;
  const code = err.code || 'internal_error';
  const message = status === 500 ? 'Internal Server Error' : err.message || 'Error';
  if (req.log) {
    req.log.error({ err, code, status }, 'Request error');
  }
  res.status(status).json({ error: code, message });
}

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = { notFoundHandler, errorHandler, HttpError };
