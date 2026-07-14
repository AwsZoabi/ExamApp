import { beforeEach, describe, expect, it } from 'vitest';
import { mockService } from '../services/mockService';
import { storageService } from '../services/storageService';
import { unwrapPayload } from '../services/httpClient';

describe('service contract', () => {
  beforeEach(() => mockService.resetForTests());

  it('unwraps direct JSON and data envelopes consistently', () => {
    expect(unwrapPayload({ data: { status: 'ok' } })).toEqual({ status: 'ok' });
    expect(unwrapPayload({ status: 'ok' })).toEqual({ status: 'ok' });
    expect(unwrapPayload([{ id: 1 }])).toEqual([{ id: 1 }]);
  });

  it('authenticates a demo teacher without exposing the password', async () => {
    const session = await mockService.login({
      email: 'teacher@examapp.local',
      password: '123456',
    });

    expect(session.token).toMatch(/^mock-token-/);
    expect(session.user).toMatchObject({ role: 'teacher', email: 'teacher@examapp.local' });
    expect(session.user).not.toHaveProperty('password');
  });

  it('supports one full teacher-to-student assessment flow', async () => {
    const teacherSession = await mockService.login({
      email: 'teacher@examapp.local',
      password: '123456',
    });
    storageService.saveSession(teacherSession);

    const created = await mockService.createExam({
      title: 'Service Contract Test',
      course: 'Quality Engineering',
      description: 'Verifies the shared data service interface.',
      durationMinutes: 10,
      passingScore: 60,
      status: 'open',
      questions: [
        {
          id: 'local-id',
          text: 'Does the service preserve one interface?',
          answers: ['No', 'Yes'],
          correctAnswerIndex: 1,
        },
      ],
    });
    expect(created.status).toBe('open');

    const studentSession = await mockService.login({
      email: 'student@examapp.local',
      password: '123456',
    });
    storageService.saveSession(studentSession);
    const result = await mockService.submitExam(created.id, {
      answers: { 1: 1 },
      durationSeconds: 42,
    });

    expect(result).toMatchObject({ score: 100, passed: true, correctAnswers: 1 });
    expect(result.exam.title).toBe('Service Contract Test');
    expect((await mockService.getMySubmissions())[0].id).toBe(result.id);
  });
});
