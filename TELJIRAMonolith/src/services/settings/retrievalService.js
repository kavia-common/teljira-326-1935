"use strict";

const { getDb } = require("../../db");
const logger = require("../../utils/logger");

/**
 * Retrieval service for application settings.
 * Provides read-only functions to fetch settings from the DB with sane fallbacks.
 */
class SettingsRetrievalService {
  // PUBLIC_INTERFACE
  /**
   * Fetch global settings.
   * - Reads from settings table (key/value jsonb) if present; otherwise falls back to defaults.
   * - Returns a normalized settings object.
   *
   * @returns {Promise<object>}
   */
  async getGlobalSettings() {
    const db = getDb();
    try {
      // MVP approach:
      // - Single-row table "app_settings" with a jsonb "data" column.
      // - If table does not exist (fresh environment), return defaults.
      const q =
        "SELECT data FROM app_settings ORDER BY updated_at DESC LIMIT 1";
      let data;
      try {
        const { rows } = await db.query(q);
        data = rows[0]?.data;
      } catch (e) {
        // Table may not exist in MVP. Log and fallback.
        logger.warn("Settings table not found or query failed, using defaults", {
          err: e.message,
        });
      }
      const settings = this._mergeWithDefaults(data || {});
      return settings;
    } catch (e) {
      const err = new Error("Failed to retrieve settings");
      err.status = 500;
      err.code = "SettingsRetrieveError";
      err.cause = e;
      throw err;
    }
  }

  /**
   * Merge persisted settings with defaults to ensure required paths exist.
   * @param {object} raw
   * @returns {object}
   */
  _mergeWithDefaults(raw) {
    const defaults = {
      accessibility: { wcag: "2.2 AA" },
      security: { mfa: true, sso: false },
      notifications: { email_enabled: true, teams_enabled: false },
    };
    return {
      ...defaults,
      ...raw,
      accessibility: { ...defaults.accessibility, ...(raw?.accessibility || {}) },
      security: { ...defaults.security, ...(raw?.security || {}) },
      notifications: {
        ...defaults.notifications,
        ...(raw?.notifications || {}),
      },
    };
  }
}

module.exports = new SettingsRetrievalService();
