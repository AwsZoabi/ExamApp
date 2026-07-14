import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { createRepository } from './repositories/createRepository.js';
import { createLogger } from './utils/logger.js';

const config = loadConfig();
const logger = createLogger({ level: config.logLevel });
const repository = createRepository(config);

const waitForStorage = async () => {
  let lastError;

  for (let attempt = 1; attempt <= config.dbConnectRetries; attempt += 1) {
    try {
      return await repository.health();
    } catch (error) {
      lastError = error;
      logger.warn(
        { attempt, total: config.dbConnectRetries, err: error },
        'Storage is not ready',
      );

      if (attempt < config.dbConnectRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.dbConnectRetryMs),
        );
      }
    }
  }

  throw lastError;
};

let httpServer;
let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown started');

  const forceTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out');
    process.exit(1);
  }, 10000);
  forceTimer.unref();

  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
  await repository.close();
  clearTimeout(forceTimer);
  logger.info('Graceful shutdown complete');
};

try {
  const storage = await waitForStorage();
  const app = createApp({ repository, config, logger });
  httpServer = app.listen(config.serverPort, () => {
    logger.info(
      {
        port: config.serverPort,
        dataSource: config.dataSource,
        storage: storage.provider,
      },
      'ExamApp API listening',
    );
  });

  process.on('SIGINT', () => shutdown('SIGINT').then(() => process.exit(0)));
  process.on('SIGTERM', () => shutdown('SIGTERM').then(() => process.exit(0)));
  process.on('unhandledRejection', (error) => {
    logger.fatal({ err: error }, 'Unhandled promise rejection');
    shutdown('unhandledRejection').then(() => process.exit(1));
  });
} catch (error) {
  logger.fatal({ err: error }, 'Server startup failed');
  await repository.close();
  process.exit(1);
}
