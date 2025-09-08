const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { initDb } = require('./setup/db');
const { registerRoutes } = require('./setup/routes');
const { errorHandler, notFoundHandler } = require('./setup/errors');
const { auditMiddleware } = require('./middleware/audit');
const { attachContext } = require('./middleware/context');

const app = express();
const PORT = process.env.PORT || 3001;
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/auth', authLimiter);

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Swagger docs with dynamic server
app.use('/docs', (req, res, next) => {
  const host = req.get('host');
  const protocol = req.secure ? 'https' : req.protocol;
  const spec = { ...swaggerSpec, servers: [{ url: `${protocol}://${host}` }] };
  swaggerUi.serve(req, res, () => swaggerUi.setup(spec)(req, res, next));
});

// Attach per-request context (user, requestId)
app.use(attachContext);

// Audit trail for mutating requests
app.use(auditMiddleware);

// Register API routes
registerRoutes(app);

// Serve frontend build in production
const frontendDir = path.join(__dirname, '..', 'public');
app.use('/', express.static(frontendDir, { extensions: ['html'] }));

// 404 and error handling
app.use(notFoundHandler);
app.use(errorHandler);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'API listening');
    });
  })
  .catch((err) => {
    logger.error(err, 'DB init failed');
    process.exit(1);
  });

module.exports = app;
