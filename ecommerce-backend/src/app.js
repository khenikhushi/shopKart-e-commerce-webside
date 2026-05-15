require('./config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { getDbState } = require('./config/database');
const { requestLogger } = require('./middlewares/logger.middleware');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const { sendError } = require('./utils/response.util');

const app = express();

// ─── Security & Parsing ───────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // disabled so docs page loads correctly
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ──────────────────────────────────────
app.use(requestLogger);

// ─── Swagger API Documentation ────────────────────────────
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .swagger-ui .info .title {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin: 20px 0 10px;
    }
    .swagger-ui .info .description {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
    .swagger-ui .btn {
      border-radius: 4px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .swagger-ui .btn-execute {
      background: #667eea;
      border: 1px solid #667eea;
    }
    .swagger-ui .btn-execute:hover {
      background: #764ba2;
      border-color: #764ba2;
    }
    .swagger-ui .opblock.opblock-get {
      background: rgba(97, 175, 254, 0.1);
    }
    .swagger-ui .opblock.opblock-post {
      background: rgba(102, 204, 102, 0.1);
    }
    .swagger-ui .opblock.opblock-put {
      background: rgba(255, 193, 7, 0.1);
    }
    .swagger-ui .opblock.opblock-patch {
      background: rgba(255, 152, 0, 0.1);
    }
    .swagger-ui .opblock.opblock-delete {
      background: rgba(244, 67, 54, 0.1);
    }
    .swagger-ui .scheme-container {
      background: #f8f9fa;
      border-radius: 4px;
      padding: 20px;
    }
    .swagger-ui .model-container {
      background: #f8f9fa;
      border-radius: 4px;
    }
    .swagger-ui .model {
      border-left: 3px solid #667eea;
    }
    .swagger-ui section.models {
      border-top: 2px solid #e0e0e0;
      padding-top: 20px;
      margin-top: 20px;
    }
    .swagger-ui .response-col_description {
      color: #333;
      font-weight: 500;
    }
    .swagger-ui .parameter__name {
      font-weight: 600;
      color: #333;
    }
    .swagger-ui .parameter__in {
      color: #999;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .swagger-ui .scheme-container .btn {
      border-radius: 4px;
      background: white;
      border: 1px solid #ddd;
      color: #333;
      font-weight: 600;
    }
    .swagger-ui .scheme-container .btn:hover {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }
    .topbar-wrapper {
      padding: 10px 0;
    }
    .swagger-ui .topbar {
      padding: 15px 0;
    }
  `,
  customCssUrl: [],
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true,
    docExpansion: 'list',
    tryItOutEnabled: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
    requestSnippetsEnabled: true,
  },
  explorer: true,
  customfavIcon: 'https://swagger.io/favicon-32x32.png',
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerUiOptions));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'public', 'uploads'))
);
app.use('/images', express.static(path.join(__dirname, '..', 'images')));
app.use(
  '/images',
  express.static(path.join(__dirname, '..', 'public', 'images'))
);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const db = getDbState();

  res.json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    docs: '/docs',
    database: {
      connected: db.connected,
      activePort: db.activePort,
      lastAttemptAt: db.lastAttemptAt,
      lastConnectedAt: db.lastConnectedAt,
      lastError: db.lastError,
    },
  });
});

// ─── API Routes ───────────────────────────────────────────
app.use(
  `/api/${process.env.API_VERSION || 'v1'}`,
  require('./routes/index')
);

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
});

// ─── Global Error Handler (must be last) ──────────────────
app.use(errorHandler);

module.exports = app;
