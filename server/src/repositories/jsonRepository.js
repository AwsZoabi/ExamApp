import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { conflict } from '../utils/errors.js';

const emptyDatabase = () => ({
  users: [],
  exams: [],
  submissions: [],
  auditLogs: [],
});

const clone = (value) => structuredClone(value);
const timestamp = () => new Date().toISOString();
const nextId = (items) =>
  items.reduce((largest, item) => Math.max(largest, Number(item.id) || 0), 0) + 1;

const enrichSubmission = (database, submission) => {
  const exam = database.exams.find(
    (item) => Number(item.id) === Number(submission.examId),
  );
  const student = database.users.find(
    (item) => Number(item.id) === Number(submission.studentId),
  );

  return {
    ...submission,
    examTitle: exam?.title ?? 'Deleted exam',
    studentName: student?.fullName ?? 'Deleted student',
    passingScore: exam?.passingScore ?? null,
    passed: exam ? Number(submission.score) >= Number(exam.passingScore) : false,
  };
};

export class JsonRepository {
  #filePath;
  #writeQueue = Promise.resolve();

  constructor(filePath) {
    this.#filePath = filePath;
  }

  async #read() {
    try {
      const raw = await readFile(this.#filePath, 'utf8');
      const parsed = JSON.parse(raw);

      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        exams: Array.isArray(parsed.exams) ? parsed.exams : [],
        submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
      };
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }

      const database = emptyDatabase();
      await this.#write(database);
      return database;
    }
  }

  async #write(database) {
    await mkdir(dirname(this.#filePath), { recursive: true });
    const temporaryPath = `${this.#filePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
    await rename(temporaryPath, this.#filePath);
  }

  async #mutate(mutator) {
    const operation = this.#writeQueue.then(async () => {
      const database = await this.#read();
      const result = await mutator(database);
      await this.#write(database);
      return clone(result);
    });

    this.#writeQueue = operation.catch(() => undefined);
    return operation;
  }

  async health() {
    await this.#writeQueue;
    const database = await this.#read();

    return {
      provider: 'json',
      ready: true,
      counts: {
        users: database.users.length,
        exams: database.exams.length,
        submissions: database.submissions.length,
      },
    };
  }

  async findUserByEmail(email) {
    await this.#writeQueue;
    const database = await this.#read();
    const user = database.users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );
    return user ? clone(user) : null;
  }

  async findUserById(id) {
    await this.#writeQueue;
    const database = await this.#read();
    const user = database.users.find((item) => Number(item.id) === Number(id));
    return user ? clone(user) : null;
  }

  async createUser(input) {
    return this.#mutate((database) => {
      if (
        database.users.some(
          (item) => item.email.toLowerCase() === input.email.toLowerCase(),
        )
      ) {
        throw conflict('Email is already registered');
      }

      const user = {
        id: nextId(database.users),
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        role: input.role,
        isActive: true,
        createdAt: timestamp(),
      };
      database.users.push(user);
      return user;
    });
  }

  async listExams({ status, createdBy } = {}) {
    await this.#writeQueue;
    const database = await this.#read();
    return clone(
      database.exams.filter(
        (exam) =>
          (!status || exam.status === status) &&
          (!createdBy || Number(exam.createdBy) === Number(createdBy)),
      ),
    );
  }

  async getExamById(id) {
    await this.#writeQueue;
    const database = await this.#read();
    const exam = database.exams.find((item) => Number(item.id) === Number(id));
    return exam ? clone(exam) : null;
  }

  async createExam(input) {
    return this.#mutate((database) => {
      const now = timestamp();
      const exam = {
        id: nextId(database.exams),
        ...clone(input),
        createdAt: now,
        updatedAt: now,
      };
      database.exams.push(exam);
      return exam;
    });
  }

  async updateExam(id, input) {
    return this.#mutate((database) => {
      const index = database.exams.findIndex(
        (item) => Number(item.id) === Number(id),
      );

      if (index === -1) {
        return null;
      }

      database.exams[index] = {
        ...database.exams[index],
        ...clone(input),
        id: database.exams[index].id,
        createdBy: database.exams[index].createdBy,
        createdAt: database.exams[index].createdAt,
        updatedAt: timestamp(),
      };
      return database.exams[index];
    });
  }

  async deleteExam(id) {
    return this.#mutate((database) => {
      const index = database.exams.findIndex(
        (item) => Number(item.id) === Number(id),
      );

      if (index === -1) {
        return null;
      }

      const [deleted] = database.exams.splice(index, 1);
      database.submissions = database.submissions.filter(
        (submission) => Number(submission.examId) !== Number(id),
      );
      return deleted;
    });
  }

  async createSubmission(input) {
    return this.#mutate((database) => {
      const submission = {
        id: nextId(database.submissions),
        ...clone(input),
        submittedAt: timestamp(),
      };
      database.submissions.push(submission);
      return enrichSubmission(database, submission);
    });
  }

  async listSubmissionsByStudent(studentId) {
    await this.#writeQueue;
    const database = await this.#read();
    return clone(
      database.submissions
        .filter((item) => Number(item.studentId) === Number(studentId))
        .map((item) => enrichSubmission(database, item))
        .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt)),
    );
  }

  async listSubmissionsForTeacher(teacherId) {
    await this.#writeQueue;
    const database = await this.#read();
    const examIds = new Set(
      database.exams
        .filter((exam) => Number(exam.createdBy) === Number(teacherId))
        .map((exam) => Number(exam.id)),
    );
    return clone(
      database.submissions
        .filter((item) => examIds.has(Number(item.examId)))
        .map((item) => enrichSubmission(database, item))
        .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt)),
    );
  }

  async listSubmissionsByExam(examId) {
    await this.#writeQueue;
    const database = await this.#read();
    return clone(
      database.submissions
        .filter((item) => Number(item.examId) === Number(examId))
        .map((item) => enrichSubmission(database, item))
        .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt)),
    );
  }

  async createAuditLog(input) {
    return this.#mutate((database) => {
      const log = {
        id: nextId(database.auditLogs),
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        requestId: input.requestId ?? null,
        metadata: clone(input.metadata ?? {}),
        createdAt: timestamp(),
      };
      database.auditLogs.push(log);
      return log;
    });
  }

  async close() {}
}
