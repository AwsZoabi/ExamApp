import { apiRequest } from './httpClient';

function normalizeSession(response) {
  const user = response?.user ?? response;
  const token = response?.token ?? response?.accessToken ?? response?.jwt ?? null;
  return { user, token };
}

function normalizeQuestions(questions = []) {
  const reservedIds = new Set(
    questions
      .map((question) => Number(question.id))
      .filter((id) => Number.isInteger(id) && id > 0),
  );
  const assignedIds = new Set();
  let nextId = 1;

  return questions.map((question) => {
    const candidateId = Number(question.id);
    let id = candidateId;

    if (!Number.isInteger(candidateId) || candidateId <= 0 || assignedIds.has(candidateId)) {
      while (reservedIds.has(nextId) || assignedIds.has(nextId)) nextId += 1;
      id = nextId;
      nextId += 1;
    }

    assignedIds.add(id);
    return {
      id,
      text: question.text,
      answers: [...(question.answers ?? [])],
      correctAnswerIndex: Number(question.correctAnswerIndex),
    };
  });
}

function normalizeExamPayload(exam) {
  return {
    title: exam.title,
    course: exam.course,
    description: exam.description ?? '',
    durationMinutes: Number(exam.durationMinutes),
    passingScore: Number(exam.passingScore),
    status: exam.status,
    questions: normalizeQuestions(exam.questions),
  };
}

export const apiService = {
  async health() {
    return apiRequest('/health');
  },
  async login(credentials) {
    return normalizeSession(
      await apiRequest('/auth/login', { method: 'POST', body: credentials }),
    );
  },
  async register(details) {
    return normalizeSession(
      await apiRequest('/auth/register', { method: 'POST', body: details }),
    );
  },
  async getMe() {
    const response = await apiRequest('/auth/me');
    return response?.user ?? response;
  },
  getExams() {
    return apiRequest('/exams');
  },
  getExam(id) {
    return apiRequest(`/exams/${encodeURIComponent(id)}`);
  },
  createExam(exam) {
    return apiRequest('/exams', { method: 'POST', body: normalizeExamPayload(exam) });
  },
  updateExam(id, exam) {
    return apiRequest(`/exams/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: normalizeExamPayload(exam),
    });
  },
  deleteExam(id) {
    return apiRequest(`/exams/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
  submitExam(id, submission) {
    return apiRequest(`/exams/${encodeURIComponent(id)}/submissions`, {
      method: 'POST',
      body: { answers: submission.answers },
    });
  },
  getMySubmissions() {
    return apiRequest('/submissions/me');
  },
  getSubmissions() {
    return apiRequest('/submissions');
  },
  getExamSubmissions(id) {
    return apiRequest(`/exams/${encodeURIComponent(id)}/submissions`);
  },
  getTeacherDashboard() {
    return apiRequest('/dashboard/teacher');
  },
  getStudentDashboard() {
    return apiRequest('/dashboard/student');
  },
};
