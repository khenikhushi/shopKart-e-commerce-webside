const app = require('./app');
const { connectDB } = require('./config/database');
require('./models/index');
const logger = require('./utils/logger.util');
const env = require('./config/env');

const startServer = async () => {
  const backgroundRetryMs = parseInt(
    process.env.DB_BACKGROUND_RETRY_MS || '10000',
    10
  );

  app.listen(env.app.port, () => {
    logger.info(`Server running on port ${env.app.port}`);
    logger.info(`Environment: ${env.app.nodeEnv}`);
  });

  const connectWithBackgroundRetry = async () => {
    try {
      await connectDB();

      // WARNING: Don't use sync({ force: true }) as it drops all tables!
      // Use migrations instead: npm run db:migrate
      // If you need to reset: npm run db:reset
      logger.info('Database ready (migrated with sequelize-cli)');
    } catch (error) {
      logger.error(`Database unavailable at startup: ${error.message}`);
      logger.warn(
        `Server will continue running and retry DB connection every ${backgroundRetryMs}ms`
      );

      const timer = setInterval(async () => {
        try {
          await connectDB();
          logger.info('Database connection restored');
          clearInterval(timer);
        } catch (retryError) {
          logger.error(`Background DB retry failed: ${retryError.message}`);
        }
      }, backgroundRetryMs);
    }
  };

  await connectWithBackgroundRetry();
};

startServer();
