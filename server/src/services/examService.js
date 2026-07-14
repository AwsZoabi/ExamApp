import { forbidden, notFound } from '../utils/errors.js';

const hideCorrectAnswers = (exam) => ({
  ...exam,
  questions: exam.questions.map(({ correctAnswerIndex: _answer, ...question }) => question),
});

export class ExamService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async list(user) {
    const filters =
      user.role === 'teacher' ? { createdBy: user.id } : { status: 'open' };
    const exams = await this.repository.listExams(filters);
    return user.role === 'student' ? exams.map(hideCorrectAnswers) : exams;
  }

  async get(id, user) {
    const exam = await this.repository.getExamById(id);

    if (!exam) {
      throw notFound('Exam not found');
    }

    if (user.role === 'teacher' && Number(exam.createdBy) !== Number(user.id)) {
      throw forbidden('You can access only your own exams');
    }

    if (user.role === 'student') {
      if (exam.status !== 'open') {
        throw forbidden('This exam is not open');
      }
      return hideCorrectAnswers(exam);
    }

    return exam;
  }

  async getRawOpenExam(id) {
    const exam = await this.repository.getExamById(id);

    if (!exam) {
      throw notFound('Exam not found');
    }

    if (exam.status !== 'open') {
      throw forbidden('This exam is not open');
    }

    return exam;
  }

  async requireOwner(id, teacherId) {
    const exam = await this.repository.getExamById(id);

    if (!exam) {
      throw notFound('Exam not found');
    }

    if (Number(exam.createdBy) !== Number(teacherId)) {
      throw forbidden('You can modify only your own exams');
    }

    return exam;
  }

  async create(input, user, context = {}) {
    const exam = await this.repository.createExam({
      ...input,
      createdBy: user.id,
    });

    await this.repository.createAuditLog({
      actorId: user.id,
      action: 'exam.create',
      entityType: 'exam',
      entityId: exam.id,
      requestId: context.requestId,
    });
    return exam;
  }

  async update(id, input, user, context = {}) {
    await this.requireOwner(id, user.id);
    const exam = await this.repository.updateExam(id, input);
    await this.repository.createAuditLog({
      actorId: user.id,
      action: 'exam.update',
      entityType: 'exam',
      entityId: id,
      requestId: context.requestId,
      metadata: { fields: Object.keys(input) },
    });
    return exam;
  }

  async delete(id, user, context = {}) {
    await this.requireOwner(id, user.id);
    const exam = await this.repository.deleteExam(id);
    await this.repository.createAuditLog({
      actorId: user.id,
      action: 'exam.delete',
      entityType: 'exam',
      entityId: id,
      requestId: context.requestId,
    });
    return exam;
  }
}
