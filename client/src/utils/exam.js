export const EXAM_STATUSES = ['draft', 'open', 'closed'];

export function createQuestion(index = 0) {
  return {
    id: `question-${Date.now()}-${index}`,
    text: '',
    answers: ['', ''],
    correctAnswerIndex: 0,
  };
}

export function createExamDraft() {
  return {
    title: '',
    course: '',
    description: '',
    durationMinutes: 30,
    passingScore: 60,
    status: 'draft',
    questions: [createQuestion(0)],
  };
}

export function normalizeExamForForm(exam) {
  const fallback = createExamDraft();
  return {
    ...fallback,
    ...exam,
    durationMinutes: Number(exam?.durationMinutes ?? fallback.durationMinutes),
    passingScore: Number(exam?.passingScore ?? fallback.passingScore),
    questions:
      exam?.questions?.map((question, index) => ({
        id: question.id ?? `question-${index + 1}`,
        text: question.text ?? '',
        answers: question.answers?.length >= 2 ? [...question.answers] : ['', ''],
        correctAnswerIndex: Number(question.correctAnswerIndex ?? 0),
      })) ?? fallback.questions,
  };
}

export function validateExam(exam) {
  const errors = {};
  if (!exam.title.trim()) errors.title = 'Give the exam a clear title.';
  if (!exam.course.trim()) errors.course = 'Course is required.';
  if (!exam.description.trim()) errors.description = 'Add a short description.';
  if (!Number.isInteger(Number(exam.durationMinutes)) || Number(exam.durationMinutes) < 1) {
    errors.durationMinutes = 'Duration must be at least one minute.';
  }
  if (
    !Number.isFinite(Number(exam.passingScore)) ||
    Number(exam.passingScore) < 0 ||
    Number(exam.passingScore) > 100
  ) {
    errors.passingScore = 'Passing score must be between 0 and 100.';
  }
  if (!exam.questions.length) errors.questions = 'Add at least one question.';

  exam.questions.forEach((question, questionIndex) => {
    if (!question.text.trim()) errors[`question-${questionIndex}`] = 'Question text is required.';
    const validAnswers = question.answers.filter((answer) => answer.trim());
    if (validAnswers.length < 2) {
      errors[`answers-${questionIndex}`] = 'Add at least two answer choices.';
    }
    if (
      question.correctAnswerIndex < 0 ||
      question.correctAnswerIndex >= question.answers.length ||
      !question.answers[question.correctAnswerIndex]?.trim()
    ) {
      errors[`correct-${questionIndex}`] = 'Choose a non-empty correct answer.';
    }
  });

  return errors;
}

export function answeredCount(answers) {
  return Object.values(answers).filter((value) => value !== null && value !== undefined).length;
}
