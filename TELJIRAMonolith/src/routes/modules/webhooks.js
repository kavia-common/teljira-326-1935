const express = require("express");
const { getDb } = require("../../db");
const { gitService } = require("../../services/integrations");

const router = express.Router();

/**
 * @openapi
 * /api/webhooks:
 *   post:
 *     tags: [Webhooks]
 *     summary: Receive example webhook (echo)
 *     description: Demonstrates inbound webhook signature validation via shared integrations service.
 *     responses:
 *       200: { description: ok }
 */
router.post("/", express.json(), async (req, res) => {
  // Verify signature if provided using shared integrations validator
  const sig = req.headers["x-sf-signature"];
  const secret = process.env.WEBHOOK_SECRET;
  const { ok } = gitService.validateSignature(req.body, sig, secret);
  if (!ok) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid signature" });
  }
  await getDb().query("SELECT 1"); // noop to ensure DB layer is available
  return res.json({ ok: true, received: req.body });
});

module.exports = router;
