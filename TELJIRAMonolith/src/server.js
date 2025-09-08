require("dotenv").config();
const http = require("http");
const app = require("./app");
const { initDb, closeDb } = require("./db");
const { initSocket } = require("./socket");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const httpServer = http.createServer(app);
initSocket(httpServer);

(async () => {
  try {
    await initDb();
    httpServer.listen(PORT, HOST, () => {
      logger.info(`Server running at http://${HOST}:${PORT}`);
    });
  } catch (err) {
    logger.error("Failed to initialize application", { err });
    process.exit(1);
  }
})();

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  httpServer.close(async () => {
    try {
      await closeDb();
    } catch (e) {
      logger.error("Error closing DB", { e });
    }
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = httpServer;
