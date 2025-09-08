"use strict";

/**
 * Format aggregated report results into desired output format.
 * Keep this module pure; no IO or DB access.
 */

// PUBLIC_INTERFACE
/**
 * Return result as-is for JSON output.
 * @param {any} result
 * @returns {any}
 */
function asJson(result) {
  return result;
}

// PUBLIC_INTERFACE
/**
 * Convert a flat or nested object into CSV (simple key,value rows).
 * This is a minimal CSV formatter intended for quick exports; extend as needed.
 * @param {Record<string, any>} result
 * @returns {string}
 */
function asCsv(result) {
  const lines = [["key", "value"]];
  for (const [k, v] of Object.entries(result || {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const [nk, nv] of Object.entries(v)) {
        lines.push([`${k}.${nk}`, stringify(nv)]);
      }
    } else {
      lines.push([k, stringify(v)]);
    }
  }
  return toCsv(lines);
}

function stringify(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function toCsv(rows) {
  return rows
    .map((cols) =>
      cols
        .map((c) => {
          const s = String(c ?? "");
          // escape quotes by doubling them; wrap with quotes if contains comma or quote or newline
          const needsWrap = /[",\n]/.test(s);
          const escaped = s.replace(/"/g, '""');
          return needsWrap ? `"${escaped}"` : escaped;
        })
        .join(","),
    )
    .join("\n");
}

module.exports = {
  asJson,
  asCsv,
};
