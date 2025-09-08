"use strict";

const { getDb } = require("../../db");
const logger = require("../../utils/logger");
const validation = require("./validationService");
const retrieval = require("./retrievalService");

/**
 * Update service for settings.
 * Handles merging, validation, persistence, and returns normalized value.
 */
class SettingsUpdateService {
  // PUBLIC_INTERFACE
  /**
   * Update global settings with the provided partial payload.
   * - Validates payload via validationService
   * - Merges with existing settings
   * - Upserts into app_settings (MVP: single row latest)
   *
   * @param {import('express').Request} req
   * @param {{ patch: object }} params
   * @returns {Promise<object>}
   */
  async updateGlobalSettings(req, { patch }) {
    const { ok, errors, value } = validation.validateSettingsPayload(patch);
    if (!ok) {
      const e = new Error("Invalid settings");
      e.status = 400;
      e.code = "ValidationError";
      e.details = errors;
      throw e;
    }

    const db = getDb();
    // Load current settings for merge
    const current = await retrieval.getGlobalSettings();

    const merged = {
      ...current,
      ...value,
      accessibility: { ...current.accessibility, ...(value.accessibility || {}) },
      security: { ...current.security, ...(value.security || {}) },
      notifications: {
        ...current.notifications,
        ...(value.notifications || {}),
      },
    };

    // Persist
    // MVP schema:
    // CREATE TABLE IF NOT EXISTS app_settings (id uuid pk default gen_random_uuid(), data jsonb not null, updated_at timestamptz default now());
    // We'll attempt an upsert into single-row table by inserting a new row (keep history of changes); latest row is authoritative.
    try {
      await db.query(
        "INSERT INTO app_settings (data) VALUES ($1::jsonb)",
        [JSON.stringify(merged)],
      );
    } catch (e) {
      logger.warn("Failed to insert settings (table missing?). Attempting create.", {
        err: e.message,
      });
      // Try to create minimal table then retry once
      try {
        await db.query(
          `
          CREATE TABLE IF NOT EXISTS app_settings (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            data jsonb NOT NULL,
            updated_at timestamptz NOT NULL DEFAULT now()
          );
        `,
        );
        await db.query("INSERT INTO app_settings (data) VALUES ($1::jsonb)", [
          JSON.stringify(merged),
        ]);
      } catch (e2) {
        const err = new Error("Failed to persist settings");
        err.status = 500;
        err.code = "SettingsPersistError";
        err.cause = e2;
        throw err;
      }
    }

    // Audit (best-effort; non-throwing)
    try {
      const { auditLog } = require("../../middleware/audit");
      await auditLog(req, "settings.update", "settings", "global", {
        changed: value,
      });
    } catch (e) {
      logger.warn("Audit log for settings.update failed", { err: e.message });
    }

    return merged;
  }
}

module.exports = new SettingsUpdateService();
