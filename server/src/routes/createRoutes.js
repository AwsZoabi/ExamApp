import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  examCreateSchema,
  examUpdateSchema,
  idParamsSchema,
  loginSchema,
  registerSchema,
  submissionSchema,
} from './schemas.js';

export const createRoutes = ({
  authController,
  examController,
  submissionController,
  dashboardController,
  authService,
  authLimiter,
}) => {
  const router = Router();
  const authenticated = authenticate(authService);
  const teacher = authorize('teacher');
  const student = authorize('student');

  router.post(
    '/auth/login',
    authLimiter,
    validate(loginSchema),
    asyncHandler(authController.login),
  );
  router.post(
    '/auth/register',
    authLimiter,
    validate(registerSchema),
    asyncHandler(authController.register),
  );
  router.get('/auth/me', authenticated, asyncHandler(authController.me));

  router.get('/exams', authenticated, asyncHandler(examController.list));
  router.post(
    '/exams',
    authenticated,
    teacher,
    validate(examCreateSchema),
    asyncHandler(examController.create),
  );
  router.get(
    '/exams/:id',
    authenticated,
    validate(idParamsSchema, 'params'),
    asyncHandler(examController.get),
  );
  router.put(
    '/exams/:id',
    authenticated,
    teacher,
    validate(idParamsSchema, 'params'),
    validate(examUpdateSchema),
    asyncHandler(examController.update),
  );
  router.delete(
    '/exams/:id',
    authenticated,
    teacher,
    validate(idParamsSchema, 'params'),
    asyncHandler(examController.delete),
  );
  router.post(
    '/exams/:id/submissions',
    authenticated,
    student,
    validate(idParamsSchema, 'params'),
    validate(submissionSchema),
    asyncHandler(submissionController.submit),
  );
  router.get(
    '/exams/:id/submissions',
    authenticated,
    teacher,
    validate(idParamsSchema, 'params'),
    asyncHandler(submissionController.forExam),
  );

  router.get(
    '/submissions/me',
    authenticated,
    student,
    asyncHandler(submissionController.mine),
  );
  router.get(
    '/submissions',
    authenticated,
    teacher,
    asyncHandler(submissionController.forTeacher),
  );

  router.get(
    '/dashboard/teacher',
    authenticated,
    teacher,
    asyncHandler(dashboardController.teacher),
  );
  router.get(
    '/dashboard/student',
    authenticated,
    student,
    asyncHandler(dashboardController.student),
  );

  return router;
};
