const express = require("express");
const authController = require("../../controllers/auth");

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Create a new user with email, name, and password. Returns the created user's id, email, and name.
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
router.post("/register", authController.registerValidation(), (req, res) =>
  authController.register(req, res),
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with credentials
 *     description: Authenticate using email and password. Returns a JWT token and basic user profile on success.
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
router.post("/login", authController.loginValidation(), (req, res) =>
  authController.login(req, res),
);

module.exports = router;
