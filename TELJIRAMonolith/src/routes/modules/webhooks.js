const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../../db');

const router = express.Router();

/**
 * @openapi
 * /api/webhooks:
 *   post:
 *     tags: [Webhooks]
 *     summary: Receive example webhook (echo)
 *     responses:
 *       200: { description: ok }
 */
router.post('/', express.json(), async (req, res) => {
  // Verify signature if provided
  const sig = req.headers['x-sf-signature'];
  if (sig && process.env.WEBHOOK_SECRET) {
    const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    if (sig !== digest) return res.status(401).json({ error: 'Unauthorized', message: 'Invalid signature' });
  }
  await getDb().query('SELECT 1'); // noop to ensure DB layer is available
  return res.json({ ok: true, received: req.body });
});

module.exports = router;
