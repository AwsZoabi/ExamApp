import { JsonRepository } from './jsonRepository.js';
import { PostgresRepository } from './postgresRepository.js';

export const createRepository = (config) =>
  config.dataSource === 'json'
    ? new JsonRepository(config.jsonDbPath)
    : new PostgresRepository({
        connectionString: config.databaseUrl,
        sslMode: config.databaseSsl,
      });
