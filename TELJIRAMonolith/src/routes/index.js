const express = require("express");

const authRoutes = require("./modules/auth");
const userRoutes = require("./modules/users");
const teamRoutes = require("./modules/teams");
const rbacRoutes = require("./modules/rbac");
const workspaceRoutes = require("./modules/workspaces");
const projectRoutes = require("./modules/projects");
const boardRoutes = require("./modules/boards");
const sprintRoutes = require("./modules/sprints");
const issueRoutes = require("./modules/issues");
const backlogRoutes = require("./modules/backlog");
const automationRoutes = require("./modules/automation");
const reportsRoutes = require("./modules/reports");
const settingsRoutes = require("./modules/settings");
const webhookRoutes = require("./modules/webhooks");
const notificationRoutes = require("./modules/notifications");
const integrationsRoutes = require("./modules/integrations");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/teams", teamRoutes);
router.use("/rbac", rbacRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/projects", projectRoutes);
router.use("/boards", boardRoutes);
router.use("/sprints", sprintRoutes);
router.use("/issues", issueRoutes);
router.use("/backlog", backlogRoutes);
router.use("/automation", automationRoutes);
router.use("/reports", reportsRoutes);
router.use("/settings", settingsRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/notifications", notificationRoutes);
router.use("/integrations", integrationsRoutes);

module.exports = router;
