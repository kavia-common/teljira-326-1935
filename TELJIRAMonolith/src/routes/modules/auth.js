const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../../db');
const { hashPassword, verifyPassword, signJwt } = require('../../utils/crypto');
const { auditLog } = require('../../middleware/audit');

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
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: User created }
 *       400: { description: Validation failed }
 */
router.post(
  '/register',
  body('email').isEmail(),
  body('name').isString().isLength({ min: 1 }),
  body('password').isString().isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'ValidationError', details: errors.array() });

    const { email, name, password } = req.body;
    const db = getDb();
    const hash = await hashPassword(password);
    try {
      const result = await db.query(
        'INSERT INTO users(email, name, password_hash) VALUES($1,$2,$3) RETURNING id, email, name',
        [email, name, hash]
      );
      await auditLog(req, 'user.register', 'user', result.rows[0].id, { email });
      return res.status(201).json(result.rows[0]);
    } catch (e) {
      return res.status(400).json({ error: 'BadRequest', message: 'User exists or invalid data' });
    }
  }
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT token returned
 */
router.post('/login', body('email').isEmail(), body('password').isString(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'ValidationError', details: errors.array() });

  const { email, password } = req.body;
  const db = getDb();
  const { rows } = await db.query('SELECT id, email, name, password_hash FROM users WHERE email=$1', [email]);
  if (!rows[0]) return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });

  const ok = await verifyPassword(rows[0].password_hash, password);
  if (!ok) return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });

  // In a full implementation, load roles/permissions from DB
  const token = signJwt({ sub: rows[0].id, email, roles: ['viewer'], permissions: ['project.read', 'issue.read'] });
  await auditLog(req, 'user.login', 'user', rows[0].id, {});
  return res.json({ token, user: { id: rows[0].id, email: rows[0].email, name: rows[0].name } });
});

module.exports = router;
