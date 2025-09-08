const cors = require('cors');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

require('dotenv').config();

const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const { requestContext } = require('./middleware/requestContext');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandlers');

// Initialize express app
const app = express();

// Security, compression and logging
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));

// CORS
const allowedOrigins = [
  process.env.SITE_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
app.set('trust proxy', true);

// Body parsing and cookies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Rate limiting for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// Request context
app.use(requestContext);

// Swagger docs with dynamic server URL
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  let protocol = req.protocol;

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
      (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// CSRF protection: skip if Authorization present (API clients)
const csrfProtection = csrf({
  cookie: {
    key: process.env.CSRF_COOKIE_NAME || 'csrf_token',
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  }
});
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    if (req.headers.authorization) return next();
    return csrfProtection(req, res, next);
  });
}

// Health router at root
const healthRouter = require('./routes/health');
app.use('/', healthRouter);

// API routes
app.use('/api', routes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
