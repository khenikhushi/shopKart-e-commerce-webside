const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../utils/logger.util');

const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql',
    logging: (msg) => {
      if (env.app.nodeEnv === 'development') {
        logger.debug(msg);
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const dbConnectionState = {
  connected: false,
  activePort: env.db.port,
  lastAttemptAt: null,
  lastConnectedAt: null,
  lastError: null,
};

const parseFallbackPorts = (primaryPort) => {
  const fallbackRaw = process.env.DB_FALLBACK_PORTS || '';
  const fallbackPorts = fallbackRaw
    .split(',')
    .map((item) => parseInt(String(item).trim(), 10))
    .filter((port) => Number.isInteger(port) && port > 0);

  const defaultFallback = primaryPort === 3306 ? [] : [3306];

  return [...new Set([...fallbackPorts, ...defaultFallback])]
    .filter((port) => port !== primaryPort);
};

const setSequelizePort = (port) => {
  sequelize.config.port = port;
  sequelize.options.port = port;

  if (sequelize.connectionManager?.config) {
    sequelize.connectionManager.config.port = port;
  }
};

const formatDbError = (error) => {
  const parts = [];

  if (error?.message) parts.push(error.message);
  if (error?.original?.message) parts.push(error.original.message);
  if (error?.parent?.message) parts.push(error.parent.message);
  if (error?.code) parts.push(`code=${error.code}`);
  if (error?.original?.code) parts.push(`code=${error.original.code}`);
  if (error?.errno) parts.push(`errno=${error.errno}`);
  if (error?.original?.errno) parts.push(`errno=${error.original.errno}`);

  const unique = [...new Set(parts.map((item) => String(item).trim()).filter(Boolean))];
  return unique.length > 0 ? unique.join(' | ') : 'Unknown database error';
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const primaryPort = env.db.port;
  const retryCount = parseInt(process.env.DB_CONNECT_RETRIES || '2', 10);
  const retryDelayMs = parseInt(
    process.env.DB_CONNECT_RETRY_DELAY_MS || '1500',
    10
  );
  const portsToTry = [primaryPort, ...parseFallbackPorts(primaryPort)];
  let lastError = null;

  for (const port of portsToTry) {
    setSequelizePort(port);
    dbConnectionState.activePort = port;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      dbConnectionState.lastAttemptAt = new Date().toISOString();

      try {
        await sequelize.authenticate();

        dbConnectionState.connected = true;
        dbConnectionState.lastError = null;
        dbConnectionState.lastConnectedAt = new Date().toISOString();

        if (port !== primaryPort) {
          logger.warn(
            `MySQL connected on fallback port ${port} (primary was ${primaryPort})`
          );
        } else {
          logger.info(`MySQL connected successfully on port ${port}`);
        }

        return;
      } catch (error) {
        lastError = error;
        dbConnectionState.connected = false;
        dbConnectionState.lastError = formatDbError(error);

        logger.error(
          `Database connection failed (port=${port}, attempt=${attempt}/${retryCount}): ${formatDbError(error)}`
        );

        if (attempt < retryCount && retryDelayMs > 0) {
          await wait(retryDelayMs);
        }
      }
    }
  }

  dbConnectionState.connected = false;
  dbConnectionState.lastError = formatDbError(lastError);

  throw new Error(
    `Unable to connect to MySQL on ports [${portsToTry.join(', ')}]. Last error: ${formatDbError(lastError)}`
  );
};

const getDbState = () => ({ ...dbConnectionState });

module.exports = { sequelize, connectDB, getDbState };

