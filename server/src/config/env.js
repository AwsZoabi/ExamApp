import dotenv from 'dotenv';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
export const serverRoot = resolve(currentDirectory, '../..');

dotenv.config({ path: resolve(serverRoot, '.env') });

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((value) =>
    typeof value === 'boolean' ? value : value.trim().toLowerCase() === 'true',
  );

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SERVER_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATA_SOURCE: z.enum(['postgres', 'json']).default('postgres'),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://examapp:examapp_dev_only@localhost:5432/examapp'),
  DATABASE_SSL: z.enum(['disable', 'require', 'verify-full']).default('disable'),
  JSON_DB_PATH: z.string().min(1).default('./data/db.json'),
  DB_CONNECT_RETRIES: z.coerce.number().int().min(1).max(100).default(15),
  DB_CONNECT_RETRY_MS: z.coerce.number().int().min(0).max(60000).default(1000),
  JWT_SECRET: z
    .string()
    .min(32)
    .default('development-only-secret-change-before-production'),
  JWT_EXPIRES_IN: z.string().min(1).default('8h'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(14).default(10),
  ALLOW_TEACHER_REGISTRATION: booleanFromString.default(false),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(30),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  TRUST_PROXY: booleanFromString.default(false),
});

export const loadConfig = (overrides = {}) => {
  const source = { ...process.env, ...overrides };

  if (source.NODE_ENV === 'production' && !source.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }

  const parsed = schema.parse(source);
  const jsonPath = isAbsolute(parsed.JSON_DB_PATH)
    ? parsed.JSON_DB_PATH
    : resolve(serverRoot, parsed.JSON_DB_PATH);

  return Object.freeze({
    nodeEnv: parsed.NODE_ENV,
    serverPort: parsed.SERVER_PORT,
    dataSource: parsed.DATA_SOURCE,
    databaseUrl: parsed.DATABASE_URL,
    databaseSsl: parsed.DATABASE_SSL,
    jsonDbPath: jsonPath,
    dbConnectRetries: parsed.DB_CONNECT_RETRIES,
    dbConnectRetryMs: parsed.DB_CONNECT_RETRY_MS,
    jwtSecret: parsed.JWT_SECRET,
    jwtExpiresIn: parsed.JWT_EXPIRES_IN,
    bcryptRounds: parsed.BCRYPT_ROUNDS,
    allowTeacherRegistration: parsed.ALLOW_TEACHER_REGISTRATION,
    corsOrigins: parsed.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    rateLimitWindowMs: parsed.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: parsed.RATE_LIMIT_MAX,
    authRateLimitMax: parsed.AUTH_RATE_LIMIT_MAX,
    logLevel: parsed.LOG_LEVEL,
    trustProxy: parsed.TRUST_PROXY,
  });
};
