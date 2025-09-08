"use strict";

const crypto = require("crypto");
const logger = require("../../../utils/logger");
const { auditLog } = require("../../../middleware/audit");

/**
 * Service handling Git-related integrations (provider-agnostic).
 * Provider-specific adapters can be introduced under ./adapters later.
 */
class GitService {
  // PUBLIC_INTERFACE
  /**
   * Link a pull request to an internal issue using the issue key.
   * @param {import('express').Request} req
   * @param {{ issue_key: string, pr_url: string, provider?: 'github'|'gitlab'|'bitbucket'|'azure', metadata?: any }} params
   * @returns {Promise<{ok: boolean, link: { issue_key: string, pr_url: string, provider?: string }, message?: string }>}
   */
  async linkPullRequest(req, { issue_key, pr_url, provider, metadata }) {
    if (!issue_key || !pr_url) {
      const e = new Error("issue_key and pr_url are required");
      e.status = 400;
      e.code = "bad_request";
      throw e;
    }
    try {
      // Placeholder: persist link in DB table issue_links or pr_links
      // For MVP, just audit and return echo
      await this.safeAudit(req, "git.link_pr", "issue", issue_key, { pr_url, provider, metadata });
      return { ok: true, link: { issue_key, pr_url, provider }, message: "Linked (placeholder)" };
    } catch (err) {
      logger.error("linkPullRequest failed", { err, issue_key, pr_url });
      throw err;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get commits referencing the issue key from the provider.
   * Placeholder uses a synthetic response.
   * @param {import('express').Request} req
   * @param {{ issue_key: string, provider?: string, since?: string, until?: string }} params
   * @returns {Promise<{issue_key:string, commits:Array<{id:string, message:string, author:string, date:string}>}>}
   */
  async getCommitsForIssue(req, { issue_key, provider, since, until }) {
    if (!issue_key) {
      const e = new Error("issue_key is required");
      e.status = 400;
      e.code = "bad_request";
      throw e;
    }
    // Placeholder: fetch from provider API using PAT from env and repo mapping.
    await this.safeAudit(req, "git.get_commits_for_issue", "issue", issue_key, { provider, since, until });
    const now = new Date().toISOString();
    return {
      issue_key,
      commits: [
        { id: "deadbeef", message: `[${issue_key}] Fix bug in workflow`, author: "demo@example.com", date: now },
      ],
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Validate HMAC signature for inbound webhooks using WEBHOOK_SECRET-like secret.
   * Accepts signature as "sha256=<hex>".
   * @param {Buffer|string} rawBody
   * @param {string|undefined} signature
   * @param {string|undefined} secret
   * @returns {{ok:boolean, reason?:string}}
   */
  validateSignature(rawBody, signature, secret) {
    if (!secret) return { ok: true };
    if (!signature) return { ok: false, reason: "missing_signature" };
    try {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = "sha256=" + hmac.update(typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody)).digest("hex");
      const ok = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
      return ok ? { ok: true } : { ok: false, reason: "invalid_signature" };
    } catch {
      return { ok: false, reason: "validation_error" };
    }
  }

  async safeAudit(req, action, resourceType, resourceId, metadata) {
    try {
      await auditLog(req, action, resourceType, resourceId, metadata);
    } catch (_) {
      // swallow
    }
  }
}

module.exports = new GitService();
