import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const loginSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(6).max(72),
  })
  .strict();

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    password: z.string().min(6).max(72),
    role: z.enum(['student', 'teacher']).default('student'),
  })
  .strict();

const questionSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    text: z.string().trim().min(1).max(1000),
    answers: z.array(z.string().trim().min(1).max(500)).min(2).max(10),
    correctAnswerIndex: z.coerce.number().int().nonnegative(),
  })
  .strict()
  .refine((question) => question.correctAnswerIndex < question.answers.length, {
    message: 'correctAnswerIndex must reference an answer',
    path: ['correctAnswerIndex'],
  });

export const examCreateSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    course: z.string().trim().min(2).max(200),
    description: z.string().trim().max(2000).default(''),
    durationMinutes: z.coerce.number().int().min(1).max(480),
    passingScore: z.coerce.number().int().min(0).max(100).default(60),
    status: z.enum(['draft', 'open', 'closed']).default('draft'),
    questions: z.array(questionSchema).max(100).default([]),
  })
  .strict();

export const examUpdateSchema = examCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one exam field is required',
  });

export const submissionSchema = z
  .object({
    answers: z.record(z.coerce.number().int().nonnegative().max(100)),
  })
  .strict();
