import bcrypt from 'bcryptjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  bearer,
  createTestContext,
  loginAs,
  validExam,
} from './testUtils.js';

describe('ExamApp secure API contract', () => {
  let context;

  beforeEach(async () => {
    context = await createTestContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('exposes readiness, OpenAPI docs, request IDs, and safe errors', async () => {
    const health = await context.api.get('/api/health').expect(200);
    expect(health.body).toMatchObject({
      status: 'ok',
      ready: true,
      dataSource: 'json',
      storage: { provider: 'json', ready: true },
    });
    expect(health.headers['x-request-id']).toBeTruthy();

    const docs = await context.api.get('/api/openapi.json').expect(200);
    expect(docs.body.openapi).toBe('3.0.3');
    await context.api.get('/api/docs/').expect(200);

    const error = await context.api
      .get('/api/exams')
      .set('x-request-id', 'qa-request-1')
      .expect(401);
    expect(error.body).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'A Bearer token is required',
        requestId: 'qa-request-1',
      },
    });
  });

  it('supports login, registration, me, conflict handling, and secure role registration', async () => {
    const login = await context.api
      .post('/api/auth/login')
      .send({ email: 'teacher@examapp.local', password: '123456' })
      .expect(200);
    expect(login.body.user).toMatchObject({ id: 1, role: 'teacher' });
    expect(login.body.user.passwordHash).toBeUndefined();

    const me = await context.api
      .get('/api/auth/me')
      .set(bearer(login.body.token))
      .expect(200);
    expect(me.body.user.email).toBe('teacher@examapp.local');

    const registered = await context.api
      .post('/api/auth/register')
      .send({
        fullName: 'New Student',
        email: 'new.student@example.test',
        password: 'abcdef',
        role: 'student',
      })
      .expect(201);
    expect(registered.body.user).toMatchObject({ role: 'student' });

    await context.api
      .post('/api/auth/register')
      .send({
        fullName: 'Duplicate Student',
        email: 'new.student@example.test',
        password: 'abcdef',
        role: 'student',
      })
      .expect(409);

    const teacherRegistration = await context.api
      .post('/api/auth/register')
      .send({
        fullName: 'Unauthorized Teacher',
        email: 'teacher2@example.test',
        password: 'abcdef',
        role: 'teacher',
      })
      .expect(403);
    expect(teacherRegistration.body.error.code).toBe('FORBIDDEN');

    await context.api
      .post('/api/auth/login')
      .send({ email: 'teacher@examapp.local', password: 'wrong-password' })
      .expect(401);
  });

  it('enforces roles and ownership while supporting complete exam CRUD', async () => {
    const teacherToken = await loginAs(context.api, 'teacher@examapp.local');
    const studentToken = await loginAs(context.api, 'student@examapp.local');

    const studentExams = await context.api
      .get('/api/exams')
      .set(bearer(studentToken))
      .expect(200);
    expect(studentExams.body.every((exam) => exam.status === 'open')).toBe(true);
    expect(studentExams.body[0].questions[0].correctAnswerIndex).toBeUndefined();

    await context.api
      .post('/api/exams')
      .set(bearer(studentToken))
      .send(validExam())
      .expect(403);

    const created = await context.api
      .post('/api/exams')
      .set(bearer(teacherToken))
      .send(validExam())
      .expect(201);
    expect(created.body.id).toEqual(expect.any(Number));
    expect(created.body.createdBy).toBe(1);

    const ownerView = await context.api
      .get(`/api/exams/${created.body.id}`)
      .set(bearer(teacherToken))
      .expect(200);
    expect(ownerView.body.questions[0].correctAnswerIndex).toBe(1);

    const secondTeacher = await context.repository.createUser({
      fullName: 'Second Teacher',
      email: 'second.teacher@example.test',
      passwordHash: await bcrypt.hash('123456', 4),
      role: 'teacher',
    });
    expect(secondTeacher.id).toEqual(expect.any(Number));
    const secondToken = await loginAs(context.api, secondTeacher.email);

    await context.api
      .put(`/api/exams/${created.body.id}`)
      .set(bearer(secondToken))
      .send({ title: 'Stolen Exam' })
      .expect(403);

    const updated = await context.api
      .put(`/api/exams/${created.body.id}`)
      .set(bearer(teacherToken))
      .send({ title: 'Updated Secure API Exam', status: 'closed' })
      .expect(200);
    expect(updated.body).toMatchObject({
      title: 'Updated Secure API Exam',
      status: 'closed',
    });

    await context.api
      .delete(`/api/exams/${created.body.id}`)
      .set(bearer(teacherToken))
      .expect(200);
    await context.api
      .get(`/api/exams/${created.body.id}`)
      .set(bearer(teacherToken))
      .expect(404);
  });

  it('scores submissions server-side and provides role-filtered histories and dashboards', async () => {
    const teacherToken = await loginAs(context.api, 'teacher@examapp.local');
    const studentToken = await loginAs(context.api, 'student@examapp.local');

    const submission = await context.api
      .post('/api/exams/101/submissions')
      .set(bearer(studentToken))
      .send({ answers: { 1: 0, 2: 1, 3: 0 } })
      .expect(201);
    expect(submission.body).toMatchObject({
      examId: 101,
      studentId: 2,
      score: 100,
      correctAnswers: 3,
      totalQuestions: 3,
      passingScore: 60,
      passed: true,
      examTitle: 'React Basics Exam',
      studentName: 'Student Demo',
    });

    const mine = await context.api
      .get('/api/submissions/me')
      .set(bearer(studentToken))
      .expect(200);
    expect(mine.body.every((item) => item.studentId === 2)).toBe(true);
    expect(mine.body.every((item) => typeof item.passed === 'boolean')).toBe(true);

    await context.api
      .get('/api/submissions')
      .set(bearer(studentToken))
      .expect(403);

    const teacherHistory = await context.api
      .get('/api/submissions')
      .set(bearer(teacherToken))
      .expect(200);
    expect(teacherHistory.body.some((item) => item.id === submission.body.id)).toBe(true);

    const examHistory = await context.api
      .get('/api/exams/101/submissions')
      .set(bearer(teacherToken))
      .expect(200);
    expect(examHistory.body.every((item) => item.examId === 101)).toBe(true);

    const teacherDashboard = await context.api
      .get('/api/dashboard/teacher')
      .set(bearer(teacherToken))
      .expect(200);
    expect(teacherDashboard.body.summary).toMatchObject({
      totalExams: 3,
      openExams: 2,
    });

    const studentDashboard = await context.api
      .get('/api/dashboard/student')
      .set(bearer(studentToken))
      .expect(200);
    expect(studentDashboard.body.summary.availableExams).toBe(2);
    expect(studentDashboard.body.exams[0].questions[0].correctAnswerIndex).toBeUndefined();
  });

  it('validates identifiers and payloads before they reach repositories', async () => {
    const teacherToken = await loginAs(context.api, 'teacher@examapp.local');
    const response = await context.api
      .post('/api/exams')
      .set(bearer(teacherToken))
      .send({ title: 'x' })
      .expect(400);
    expect(response.body.error.code).toBe('BAD_REQUEST');
    expect(response.body.error.details.length).toBeGreaterThan(0);

    await context.api
      .get('/api/exams/not-a-number')
      .set(bearer(teacherToken))
      .expect(400);
  });
});
