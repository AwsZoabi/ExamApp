import { forbidden } from '../utils/errors.js';

const selectedAnswer = (answers, questionId) =>
  answers[String(questionId)] ?? answers[questionId];

export class SubmissionService {
  constructor({ repository, examService }) {
    this.repository = repository;
    this.examService = examService;
  }

  async submit(examId, answers, user, context = {}) {
    const exam = await this.examService.getRawOpenExam(examId);
    const correctAnswers = exam.questions.filter(
      (question) =>
        Number(selectedAnswer(answers, question.id)) ===
        Number(question.correctAnswerIndex),
    ).length;
    const totalQuestions = exam.questions.length;
    const score = totalQuestions
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

    const submission = await this.repository.createSubmission({
      examId,
      studentId: user.id,
      answers,
      score,
      correctAnswers,
      totalQuestions,
    });

    await this.repository.createAuditLog({
      actorId: user.id,
      action: 'submission.create',
      entityType: 'submission',
      entityId: submission.id,
      requestId: context.requestId,
      metadata: { examId, score },
    });

    return {
      ...submission,
      passed: score >= exam.passingScore,
      passingScore: exam.passingScore,
      exam,
    };
  }

  async mine(user) {
    const submissions = await this.repository.listSubmissionsByStudent(user.id);
    return Promise.all(
      submissions.map(async (submission) => ({
        ...submission,
        exam: await this.repository.getExamById(submission.examId),
      })),
    );
  }

  async forTeacher(user) {
    return this.repository.listSubmissionsForTeacher(user.id);
  }

  async forExam(examId, user) {
    await this.examService.requireOwner(examId, user.id);
    return this.repository.listSubmissionsByExam(examId);
  }

  ensureStudent(user) {
    if (user.role !== 'student') {
      throw forbidden('Only students can submit exams');
    }
  }
}
