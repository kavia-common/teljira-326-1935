require("dotenv").config();
const { initDb, getDb, closeDb } = require("./index");
const logger = require("../utils/logger");

async function main() {
  try {
    await initDb();
    const db = getDb();

    await db.query(
      "INSERT INTO issue_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      ["task"],
    );
    await db.query(
      "INSERT INTO issue_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      ["bug"],
    );
    await db.query(
      "INSERT INTO issue_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      ["story"],
    );

    const roles = [
      "org_admin",
      "project_admin",
      "scrum_master",
      "developer",
      "qa",
      "viewer",
    ];
    for (const r of roles) {
      await db.query(
        "INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [r],
      );
    }

    const permissions = [
      "user.read",
      "user.write",
      "project.read",
      "project.write",
      "issue.read",
      "issue.write",
      "sprint.read",
      "sprint.write",
      "board.read",
      "board.write",
      "settings.admin",
      "rbac.manage",
    ];
    for (const p of permissions) {
      await db.query(
        "INSERT INTO permissions (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [p],
      );
    }

    logger.info("Seeding completed");
  } catch (e) {
    logger.error("Seeding failed", { e });
    process.exit(1);
  } finally {
    await closeDb();
  }
}

main();
