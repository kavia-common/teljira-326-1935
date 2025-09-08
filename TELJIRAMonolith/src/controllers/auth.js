"use strict";

const { body, validationResult } = require("express-validator");
const authService = require("../services/auth");

/**
 * AuthController exposes HTTP handlers for auth endpoints.
 * Validation is performed here, and business logic is delegated to AuthService.
 */
class AuthController {
  // PUBLIC_INTERFACE
  /**
   * Express-validator chain for register payload.
   * @returns {import('express-validator').ValidationChain[]}
   */
  registerValidation() {
    return [
      body("email").isEmail(),
      body("name").isString().isLength({ min: 1 }),
      body("password").isString().isLength({ min: 8 }),
    ];
  }

  // PUBLIC_INTERFACE
  /**
   * POST /api/auth/register
   * Registers a new user and returns created profile.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: "ValidationError", details: errors.array() });

    const { email, name, password } = req.body;
    try {
      const user = await authService.register(req, { email, name, password });
      return res.status(201).json(user);
    } catch (e) {
      const status = e.status || 500;
      return res.status(status).json({
        error: e.code || "InternalServerError",
        message: e.message || "Internal Server Error",
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Express-validator chain for login payload.
   * @returns {import('express-validator').ValidationChain[]}
   */
  loginValidation() {
    return [body("email").isEmail(), body("password").isString()];
  }

  // PUBLIC_INTERFACE
  /**
   * POST /api/auth/login
   * Authenticates user and returns JWT token.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: "ValidationError", details: errors.array() });

    const { email, password } = req.body;
    try {
      const result = await authService.login(req, { email, password });
      return res.json(result);
    } catch (e) {
      const status = e.status || 500;
      return res.status(status).json({
        error: e.code || "InternalServerError",
        message: e.message || "Internal Server Error",
      });
    }
  }
}

module.exports = new AuthController();
