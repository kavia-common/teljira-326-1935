const healthService = require('../services/health');

class HealthController {
  // PUBLIC_INTERFACE
  /**
   * Health check handler.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {import('express').Response}
   */
  check(req, res) {
    const healthStatus = healthService.getStatus();
    return res.status(200).json(healthStatus);
  }
}

module.exports = new HealthController();
