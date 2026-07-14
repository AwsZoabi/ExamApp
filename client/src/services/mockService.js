import { appConfig } from '../config';
import { createMockSeed } from '../data/mockSeed';
import { loggerService } from './loggerService';
import { storageService } from './storageService';

const clone = (value) => structuredClone(value);
const wait = () =>
  appConfig.mockDelayMs > 0
    ? new Promise((resolve) => window.setTimeout(resolve, appConfig.mockDelayMs))
    : Promise.resolve();

function serviceError(message, status = 400, code = 'MOCK_REQUEST_FAILED') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function database() {
  const current = storageService.getMockDatabase();
  if (current) return current;
  const seed = createMockSeed();
  storageService.saveMockDatabase(seed);
  return seed;
}

function save(nextDatabase) {
  storageService.saveMockDatabase(nextDatabase);
}

function safeUser(user) {
  if (!user) return null;
  const safe = { ...user };
  delete safe.password;
  return safe;
}

function currentUser(expectedRole) {
  const user = storageService.getUser();
  if (!user) throw serviceError('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
  if (expectedRole && user.role !== expectedRole) {
    throw serviceError('You do not have permission to perform this action.', 403, 'FORBIDDEN');
  }
  return user;
}

function nextId(items) {
  return items.reduce((maximum, item) => Math.max(maximum, Number(item.id) || 0), 0) + 1;
}

function normalizeQuestions(questions = []) {
  return questions.map((question, index) => ({
    id: index + 1,
    text: String(question.text ?? '').trim(),
    answers: (question.answers ?? []).map((answer) => String(answer).trim()),
    correctAnswerIndex: Number(question.correctAnswerIndex),
  }));
}

function prepareExam(input, previous = null) {
  const timestamp = new Date().toISOString();
  return {
    ...(previous ?? {}),
    title: String(input.title).trim(),
    course: String(input.course).trim(),
    description: String(input.description).trim(),
    durationMinutes: Number(input.durationMinutes),
    passingScore: Number(input.passingScore),
    status: String(input.status).toLowerCase(),
    questions: normalizeQuestions(input.questions),
    updatedAt: timestamp,
  };
}

function enrichSubmission(submission, source) {
  const exam = source.exams.find((item) => Number(item.id) === Number(submission.examId));
  const student = source.users.find((item) => Number(item.id) === Number(submission.studentId));
  return {
    ...clone(submission),
    exam: exam ? clone(exam) : null,
    examTitle: exam?.title ?? 'Deleted exam',
    course: exam?.course ?? '—',
    student: safeUser(student),
    studentName: student?.fullName ?? 'Unknown student',
  };
}

function submissionScore(exam, answers) {
  const correctAnswers = exam.questions.filter(
    (question) =>
      Number(answers[String(question.id)] ?? answers[question.id]) ===
      Number(question.correctAnswerIndex),
  ).length;
  const totalQuestions = exam.questions.length;
  const score = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  return {
    correctAnswers,
    totalQuestions,
    score,
    passed: score >= Number(exam.passingScore),
  };
}

export const mockService = {
  async health() {
    await wait();
    return { status: 'ok', dataSource: 'mock', service: 'examapp-client-mock' };
  },

  async login({ email, password }) {
    await wait();
    const source = database();
    const user = source.users.find(
      (candidate) =>
        candidate.email.toLowerCase() === String(email).trim().toLowerCase() &&
        candidate.password === password,
    );
    if (!user) throw serviceError('Email or password is incorrect.', 401, 'INVALID_CREDENTIALS');

    const safe = safeUser(user);
    loggerService.info('Mock user signed in', { userId: safe.id, role: safe.role });
    return { user: safe, token: `mock-token-${safe.id}` };
  },

  async register({ fullName, email, password, role = 'student' }) {
    await wait();
    const source = database();
    const normalizedEmail = String(email).trim().toLowerCase();
    if (source.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      throw serviceError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }
    if (!['student', 'teacher'].includes(role)) {
      throw serviceError('Choose a valid account role.');
    }

    const user = {
      id: nextId(source.users),
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password,
      role,
      createdAt: new Date().toISOString(),
    };
    source.users.push(user);
    save(source);
    const safe = safeUser(user);
    return { user: safe, token: `mock-token-${safe.id}` };
  },

  async getMe() {
    await wait();
    const sessionUser = currentUser();
    const found = database().users.find((user) => Number(user.id) === Number(sessionUser.id));
    if (!found) throw serviceError('Account was not found.', 401, 'UNAUTHORIZED');
    return safeUser(found);
  },

  async getExams() {
    await wait();
    const user = currentUser();
    const exams = database().exams;
    return clone(
      user.role === 'teacher' ? exams : exams.filter((exam) => exam.status === 'open'),
    ).sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
  },

  async getExam(id) {
    await wait();
    currentUser();
    const exam = database().exams.find((item) => Number(item.id) === Number(id));
    if (!exam) throw serviceError('Exam was not found.', 404, 'NOT_FOUND');
    return clone(exam);
  },

  async createExam(input) {
    await wait();
    const teacher = currentUser('teacher');
    const source = database();
    const timestamp = new Date().toISOString();
    const exam = {
      id: nextId(source.exams),
      ...prepareExam(input),
      createdBy: teacher.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    source.exams.push(exam);
    save(source);
    loggerService.info('Mock exam created', { examId: exam.id });
    return clone(exam);
  },

  async updateExam(id, input) {
    await wait();
    currentUser('teacher');
    const source = database();
    const index = source.exams.findIndex((item) => Number(item.id) === Number(id));
    if (index < 0) throw serviceError('Exam was not found.', 404, 'NOT_FOUND');
    source.exams[index] = {
      ...prepareExam(input, source.exams[index]),
      id: source.exams[index].id,
      createdBy: source.exams[index].createdBy,
      createdAt: source.exams[index].createdAt,
    };
    save(source);
    return clone(source.exams[index]);
  },

  async deleteExam(id) {
    await wait();
    currentUser('teacher');
    const source = database();
    const index = source.exams.findIndex((item) => Number(item.id) === Number(id));
    if (index < 0) throw serviceError('Exam was not found.', 404, 'NOT_FOUND');
    const [deleted] = source.exams.splice(index, 1);
    source.submissions = source.submissions.filter(
      (submission) => Number(submission.examId) !== Number(id),
    );
    save(source);
    return { deleted: true, exam: clone(deleted) };
  },

  async submitExam(id, { answers, durationSeconds = null }) {
    await wait();
    const student = currentUser('student');
    const source = database();
    const exam = source.exams.find((item) => Number(item.id) === Number(id));
    if (!exam || exam.status !== 'open') {
      throw serviceError('This exam is not available for submission.', 404, 'NOT_AVAILABLE');
    }
    const result = submissionScore(exam, answers);
    const submission = {
      id: nextId(source.submissions),
      examId: exam.id,
      studentId: student.id,
      answers: clone(answers),
      ...result,
      submittedAt: new Date().toISOString(),
      durationSeconds,
    };
    source.submissions.push(submission);
    save(source);
    return enrichSubmission(submission, source);
  },

  async getMySubmissions() {
    await wait();
    const student = currentUser('student');
    const source = database();
    return source.submissions
      .filter((submission) => Number(submission.studentId) === Number(student.id))
      .map((submission) => enrichSubmission(submission, source))
      .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));
  },

  async getSubmissions() {
    await wait();
    currentUser('teacher');
    const source = database();
    return source.submissions
      .map((submission) => enrichSubmission(submission, source))
      .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));
  },

  async getExamSubmissions(id) {
    await wait();
    currentUser('teacher');
    const source = database();
    return source.submissions
      .filter((submission) => Number(submission.examId) === Number(id))
      .map((submission) => enrichSubmission(submission, source))
      .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));
  },

  async getTeacherDashboard() {
    await wait();
    currentUser('teacher');
    const source = database();
    const submissions = source.submissions.map((item) => enrichSubmission(item, source));
    const total = submissions.length;
    const averageScore = total
      ? Math.round(submissions.reduce((sum, item) => sum + item.score, 0) / total)
      : 0;
    const passRate = total
      ? Math.round((submissions.filter((item) => item.passed).length / total) * 100)
      : 0;

    return {
      metrics: {
        totalExams: source.exams.length,
        activeExams: source.exams.filter((exam) => exam.status === 'open').length,
        totalStudents: source.users.filter((user) => user.role === 'student').length,
        totalSubmissions: total,
        averageScore,
        passRate,
      },
      exams: clone(source.exams).sort(
        (left, right) => new Date(right.updatedAt) - new Date(left.updatedAt),
      ),
      recentSubmissions: submissions
        .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt))
        .slice(0, 5),
    };
  },

  async getStudentDashboard() {
    await wait();
    const student = currentUser('student');
    const source = database();
    const history = source.submissions
      .filter((submission) => Number(submission.studentId) === Number(student.id))
      .map((submission) => enrichSubmission(submission, source))
      .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));
    const averageScore = history.length
      ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length)
      : 0;

    return {
      metrics: {
        availableExams: source.exams.filter((exam) => exam.status === 'open').length,
        completedExams: history.length,
        averageScore,
        passedExams: history.filter((item) => item.passed).length,
      },
      availableExams: clone(source.exams.filter((exam) => exam.status === 'open')),
      recentSubmissions: history,
    };
  },

  resetForTests() {
    storageService.clearMockDatabase();
    storageService.clearSession();
  },
};
