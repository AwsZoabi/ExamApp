import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { createAuthController } from './controllers/authController.js';
import { createDashboardController } from './controllers/dashboardController.js';
import { createExamController } from './controllers/examController.js';
import { createHealthController } from './controllers/healthController.js';
import { createSubmissionController } from './controllers/submissionController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { openApiDocument } from './openapi.js';
import { createRoutes } from './routes/createRoutes.js';
import { AuthService } from './services/authService.js';
import { DashboardService } from './services/dashboardService.js';
import { ExamService } from './services/examService.js';
import { SubmissionService } from './services/submissionService.js';
import { AppError } from './utils/errors.js';

const requestId = (request) => {
  const supplied = request.headers['x-request-id'];
  return typeof supplied === 'string' && /^[a-zA-Z0-9._-]{1,100}$/.test(supplied)
    ? supplied
    : randomUUID();
};

const limiterHandler = (request, response) => {
  response.status(429).json({
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests; please try again later',
      requestId: request.id,
    },
  });
};

const corsOptions = (origins) => ({
  credentials: true,
  origin(origin, callback) {
    if (!origin || origins.includes('*') || origins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new AppError(403, 'CORS_DENIED', 'Origin is not allowed'));
  },
});

export const createApp = ({ repository, config, logger }) => {
  const authService = new AuthService({ repository, config });
  const examService = new ExamService({ repository });
  const submissionService = new SubmissionService({ repository, examService });
  const dashboardService = new DashboardService({ repository });

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    pinoHttp({
      logger,
      genReqId: requestId,
      customProps: (request) => ({ requestId: request.id }),
      customLogLevel: (_request, response, error) => {
        if (error || response.statusCode >= 500) return 'error';
        if (response.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );
  app.use((request, response, next) => {
    response.setHeader('x-request-id', request.id);
    next();
  });
  app.use(cors(corsOptions(config.corsOrigins)));
  app.use(express.json({ limit: '1mb' }));

  const generalLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: limiterHandler,
  });
  const authLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.authRateLimitMax,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: limiterHandler,
  });

  const healthController = createHealthController({ repository, config });
  app.get('/api/health', healthController.health);
  app.get('/api/openapi.json', (_request, response) => response.json(openApiDocument));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, { explorer: true }),
  );
  app.use('/api', generalLimiter);

  app.use(
    '/api',
    createRoutes({
      authController: createAuthController(authService),
      examController: createExamController(examService),
      submissionController: createSubmissionController(submissionService),
      dashboardController: createDashboardController(dashboardService),
      authService,
      authLimiter,
    }),
  );

  app.use(notFoundHandler);
  app.use(errorHandler(logger));
  return app;
};
