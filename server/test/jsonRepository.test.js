import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, validExam } from './testUtils.js';

describe('JsonRepository parity and concurrency', () => {
  let context;

  beforeEach(async () => {
    context = await createTestContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('reports health and serializes concurrent mutations with numeric IDs', async () => {
    const created = await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        context.repository.createExam({
          ...validExam({ title: `Concurrent Exam ${index}` }),
          createdBy: 1,
        }),
      ),
    );

    expect(new Set(created.map((item) => item.id)).size).toBe(8);
    expect(created.every((item) => Number.isInteger(item.id))).toBe(true);

    const health = await context.repository.health();
    expect(health).toMatchObject({
      provider: 'json',
      ready: true,
      counts: { users: 2, exams: 11, submissions: 3 },
    });
  });

  it('keeps enriched submission history shape consistent', async () => {
    const history = await context.repository.listSubmissionsByStudent(2);
    expect(history[0]).toEqual(
      expect.objectContaining({
        examTitle: expect.any(String),
        studentName: 'Student Demo',
        passingScore: expect.any(Number),
        passed: expect.any(Boolean),
      }),
    );
  });
});
