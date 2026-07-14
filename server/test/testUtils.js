import { copyFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { JsonRepository } from '../src/repositories/jsonRepository.js';
import { createLogger } from '../src/utils/logger.js';

const seedDatabase = new URL('../data/db.json', import.meta.url);

export const createTestContext = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'examapp-final-test-'));
  const filePath = join(directory, 'db.json');
  await copyFile(seedDatabase, filePath);

  const repository = new JsonRepository(filePath);
  const config = {
    nodeEnv: 'test',
    dataSource: 'json',
    jwtSecret: 'test-secret-that-is-longer-than-thirty-two-characters',
    jwtExpiresIn: '1h',
    bcryptRounds: 4,
    allowTeacherRegistration: false,
    corsOrigins: ['http://localhost:5173'],
    rateLimitWindowMs: 60000,
    rateLimitMax: 1000,
    authRateLimitMax: 1000,
    trustProxy: false,
  };
  const logger = createLogger({ level: 'silent' });
  const app = createApp({ repository, config, logger });

  return {
    app,
    api: request(app),
    repository,
    cleanup: async () => {
      await repository.close();
      await rm(directory, { recursive: true, force: true });
    },
  };
};

export const loginAs = async (api, email) => {
  const response = await api
    .post('/api/auth/login')
    .send({ email, password: '123456' })
    .expect(200);
  return response.body.token;
};

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });

export const validExam = (overrides = {}) => ({
  title: 'Secure API Exam',
  course: 'Backend Engineering',
  description: 'Created during the API test suite.',
  durationMinutes: 25,
  passingScore: 60,
  status: 'open',
  questions: [
    {
      id: 1,
      text: 'Which layer owns scoring?',
      answers: ['Browser', 'Server service', 'CSS'],
      correctAnswerIndex: 1,
    },
  ],
  ...overrides,
});
