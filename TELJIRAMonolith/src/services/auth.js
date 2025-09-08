"use strict";

const { getDb } = require("../db");
const { hashPassword, verifyPassword, signJwt } = require("../utils/crypto");
const { auditLog } = require("../middleware/audit");

/**
 * AuthService encapsulates user registration and login logic.
 * It hides DB queries and crypto details behind a simple interface.
 */
class AuthService {
  // PUBLIC_INTERFACE
  /**
   * Register a new user with email, name, and password.
   * Returns the created user (id, email, name).
   * @param {import('express').Request|null} req Express request for audit context (nullable for internal use)
   * @param {{email:string,name:string,password:string}} input
   * @returns {Promise<{id:string,email:string,name:string}>}
   */
  async register(req, { email, name, password }) {
    const db = getDb();
    const password_hash = await hashPassword(password);

    try {
      const result = await db.query(
        "INSERT INTO users(email, name, password_hash) VALUES($1,$2,$3) RETURNING id, email, name",
        [email, name, password_hash],
      );

      // audit, but don't fail user creation on audit failure
      await this.safeAudit(req, "user.register", "user", result.rows[0].id, { email });

      return result.rows[0];
    } catch (e) {
      const err = new Error("User exists or invalid data");
      err.status = 400;
      err.code = "BadRequest";
      throw err;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Login a user with email and password. Returns a JWT token and user profile.
   * This MVP encodes a placeholder roles/permissions set until RBAC derivation is implemented.
   * @param {import('express').Request|null} req Express request for audit context (nullable for internal use)
   * @param {{email:string,password:string}} input
   * @returns {Promise<{token:string,user:{id:string,email:string,name:string}}>}
   */
  async login(req, { email, password }) {
    const db = getDb();
    const { rows } = await db.query(
      "SELECT id, email, name, password_hash FROM users WHERE email=$1",
      [email],
    );
    if (!rows[0]) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      err.code = "Unauthorized";
      throw err;
    }

    const ok = await verifyPassword(rows[0].password_hash, password);
    if (!ok) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      err.code = "Unauthorized";
      throw err;
    }

    // Placeholder roles/permissions; future: derive from DB
    const token = signJwt({
      sub: rows[0].id,
      email,
      roles: ["viewer"],
      permissions: ["project.read", "issue.read"],
    });

    await this.safeAudit(req, "user.login", "user", rows[0].id, {});

    return {
      token,
      user: { id: rows[0].id, email: rows[0].email, name: rows[0].name },
    };
  }

  /**
   * Audit helper that won't throw.
   */
  async safeAudit(req, action, resourceType, resourceId, metadata) {
    try {
      await auditLog(req, action, resourceType, resourceId, metadata);
    } catch (_) {
      // ignore audit failures
    }
  }
}

module.exports = new AuthService();
