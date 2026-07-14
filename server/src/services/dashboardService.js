const average = (values) =>
  values.length
    ? Math.round(values.reduce((total, value) => total + Number(value), 0) / values.length)
    : 0;

const hideCorrectAnswers = (exam) => ({
  ...exam,
  questions: exam.questions.map(({ correctAnswerIndex: _answer, ...question }) => question),
});

export class DashboardService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async teacher(user) {
    const [exams, submissions] = await Promise.all([
      this.repository.listExams({ createdBy: user.id }),
      this.repository.listSubmissionsForTeacher(user.id),
    ]);

    const totalExams = exams.length;
    const activeExams = exams.filter((exam) => exam.status === 'open').length;
    const totalSubmissions = submissions.length;
    const averageScore = average(submissions.map((item) => item.score));
    const passRate = totalSubmissions
      ? Math.round(
          (submissions.filter((item) => item.passed).length / totalSubmissions) * 100,
        )
      : 0;
    const totalStudents = new Set(submissions.map((item) => Number(item.studentId))).size;

    return {
      metrics: {
        totalExams,
        activeExams,
        totalSubmissions,
        averageScore,
        passRate,
        totalStudents,
      },
      summary: {
        totalExams,
        openExams: activeExams,
        totalSubmissions,
        averageScore,
        passRate,
        totalStudents,
      },
      exams,
      recentSubmissions: submissions.slice(0, 10),
    };
  }

  async student(user) {
    const [exams, submissions] = await Promise.all([
      this.repository.listExams({ status: 'open' }),
      this.repository.listSubmissionsByStudent(user.id),
    ]);

    const availableExams = exams.map(hideCorrectAnswers);
    const completedExams = submissions.length;
    const averageScore = average(submissions.map((item) => item.score));
    const bestScore = submissions.length
      ? Math.max(...submissions.map((item) => Number(item.score)))
      : 0;
    const passedExams = submissions.filter((item) => item.passed).length;

    return {
      metrics: {
        availableExams: availableExams.length,
        completedExams,
        averageScore,
        bestScore,
        passedExams,
      },
      summary: {
        availableExams: availableExams.length,
        completedAttempts: completedExams,
        averageScore,
        bestScore,
        passedExams,
      },
      availableExams,
      exams: availableExams,
      recentSubmissions: submissions.slice(0, 10),
    };
  }
}
