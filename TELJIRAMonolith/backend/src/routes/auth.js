const express = require('express');
const Joi = require('joi');
const { register, login, enableMfa } = require('../services/authService');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, password]
 *             properties:
 *               email: { type: string }
 *               name: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: User created
 */
router.post('/register', async (req, res, next) => {
  try {
    const body = await Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().min(1).required(),
      password: Joi.string().min(6).required()
    }).validateAsync(req.body);
    const user = await register(body);
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     description: If user has MFA enabled, provide mfaToken
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const body = await Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      mfaToken: Joi.string().optional()
    }).validateAsync(req.body);
    const result = await login(body);
    res.json(result);
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/auth/mfa:
 *   post:
 *     tags: [Auth]
 *     summary: Enable MFA (TOTP)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       200: { description: MFA enabled }
 */
router.post('/mfa', authMiddleware, async (req, res, next) => {
  try {
    const body = await Joi.object({ secret: Joi.string().required() }).validateAsync(req.body);
    const result = await enableMfa(req.user.id, body);
    res.json(result);
  } catch (e) { next(e); }
});

module.exports = router;
