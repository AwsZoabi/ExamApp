import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiService } from '../services/apiService';

function successfulResponse(payload = {}) {
  return {
    status: 200,
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => payload,
  };
}

function requestBody() {
  return JSON.parse(fetch.mock.calls.at(-1)[1].body);
}

describe('API request contracts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(successfulResponse({ id: 42 })));
  });

  it('converts browser-only question IDs before creating an exam', async () => {
    await apiService.createExam({
      title: 'React fundamentals',
      course: 'Full Stack',
      description: 'Core concepts',
      durationMinutes: 30,
      passingScore: 60,
      status: 'draft',
      questions: [
        {
          id: 'question-1750000000000-0',
          text: 'What is JSX?',
          answers: ['Syntax extension', 'Database'],
          correctAnswerIndex: 0,
        },
      ],
    });

    expect(requestBody().questions[0].id).toBe(1);
  });

  it('strips read-only metadata while preserving valid question IDs on update', async () => {
    await apiService.updateExam(9, {
      id: 9,
      createdBy: 1,
      createdAt: '2026-07-12T10:00:00.000Z',
      updatedAt: '2026-07-12T11:00:00.000Z',
      title: 'Updated exam',
      course: 'Full Stack',
      description: 'Updated description',
      durationMinutes: 45,
      passingScore: 70,
      status: 'open',
      questions: [
        {
          id: 7,
          text: 'Which hook stores local state?',
          answers: ['useState', 'useEffect'],
          correctAnswerIndex: 0,
        },
        {
          id: 'question-1750000000000-1',
          text: 'Which hook runs side effects?',
          answers: ['useMemo', 'useEffect'],
          correctAnswerIndex: 1,
        },
      ],
    });

    expect(requestBody()).toEqual({
      title: 'Updated exam',
      course: 'Full Stack',
      description: 'Updated description',
      durationMinutes: 45,
      passingScore: 70,
      status: 'open',
      questions: [
        {
          id: 7,
          text: 'Which hook stores local state?',
          answers: ['useState', 'useEffect'],
          correctAnswerIndex: 0,
        },
        {
          id: 1,
          text: 'Which hook runs side effects?',
          answers: ['useMemo', 'useEffect'],
          correctAnswerIndex: 1,
        },
      ],
    });
  });

  it('sends only the strict submission payload accepted by the server', async () => {
    await apiService.submitExam(9, {
      answers: { 1: 0, 2: 1 },
      durationSeconds: 123,
    });

    expect(requestBody()).toEqual({ answers: { 1: 0, 2: 1 } });
  });
});
