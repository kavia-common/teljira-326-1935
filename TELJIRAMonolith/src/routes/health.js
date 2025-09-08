const express = require("express");
const healthController = require("../controllers/health");

const router = express.Router();

/**
 * @openapi
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Health endpoint
 *     description: Returns service status and environment metadata.
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get("/", healthController.check.bind(healthController));

module.exports = router;
