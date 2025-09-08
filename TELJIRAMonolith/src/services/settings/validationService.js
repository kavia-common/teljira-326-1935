"use strict";

/**
 * Validation service for settings payloads.
 * Keeps validation pure and reusable.
 */
class SettingsValidationService {
  // PUBLIC_INTERFACE
  /**
   * Validate an incoming settings payload.
   * - Returns { ok: boolean, errors: string[], value: object }
   * - Performs shallow shape checks and type validations.
   *
   * @param {any} payload
   * @returns {{ok:boolean, errors:string[], value:object}}
   */
  validateSettingsPayload(payload) {
    const errors = [];
    const value = typeof payload === "object" && payload ? payload : {};

    // accessibility
    if (value.accessibility !== undefined) {
      if (typeof value.accessibility !== "object" || value.accessibility === null) {
        errors.push("accessibility must be an object");
      } else if (
        value.accessibility.wcag !== undefined &&
        typeof value.accessibility.wcag !== "string"
      ) {
        errors.push("accessibility.wcag must be a string");
      }
    }

    // security
    if (value.security !== undefined) {
      if (typeof value.security !== "object" || value.security === null) {
        errors.push("security must be an object");
      } else {
        if (
          value.security.mfa !== undefined &&
          typeof value.security.mfa !== "boolean"
        ) {
          errors.push("security.mfa must be a boolean");
        }
        if (
          value.security.sso !== undefined &&
          typeof value.security.sso !== "boolean"
        ) {
          errors.push("security.sso must be a boolean");
        }
      }
    }

    // notifications
    if (value.notifications !== undefined) {
      if (
        typeof value.notifications !== "object" ||
        value.notifications === null
      ) {
        errors.push("notifications must be an object");
      } else {
        if (
          value.notifications.email_enabled !== undefined &&
          typeof value.notifications.email_enabled !== "boolean"
        ) {
          errors.push("notifications.email_enabled must be a boolean");
        }
        if (
          value.notifications.teams_enabled !== undefined &&
          typeof value.notifications.teams_enabled !== "boolean"
        ) {
          errors.push("notifications.teams_enabled must be a boolean");
        }
      }
    }

    return { ok: errors.length === 0, errors, value };
  }
}

module.exports = new SettingsValidationService();
