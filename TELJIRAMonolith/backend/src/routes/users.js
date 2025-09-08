const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { User } = require('../models/User');

const router = express.Router();

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: current user }
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const me = await User.query().findById(req.user.id).withGraphFetched('roles');
    res.json({ id: me.id, email: me.email, name: me.name, roles: me.roles.map(r => r.name) });
  } catch (e) { next(e); }
});

module.exports = router;
