import { mockDb } from '../api/mockDb';
import { loggerService } from './loggerService';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const examService = {
  async getAllExams() {
    await delay(300);
    return [...mockDb.exams];
  },

  async getExamById(id) {
    await delay(300);

    const exam = mockDb.exams.find((item) => item.id === Number(id));

    if (!exam) {
      throw new Error('Exam not found');
    }

    return { ...exam };
  },

  async createExam(examData) {
    await delay(300);

    const newExam = {
      id: Date.now(),
      title: examData.title,
      course: examData.course,
      durationMinutes: Number(examData.durationMinutes),
      status: examData.status,
      description: examData.description,
      questions: [],
    };

    mockDb.exams.push(newExam);
    loggerService.info('Exam created', newExam);

    return newExam;
  },

  async updateExam(id, examData) {
    await delay(300);

    const index = mockDb.exams.findIndex((item) => item.id === Number(id));

    if (index === -1) {
      throw new Error('Exam not found');
    }

    mockDb.exams[index] = {
      ...mockDb.exams[index],
      title: examData.title,
      course: examData.course,
      durationMinutes: Number(examData.durationMinutes),
      status: examData.status,
      description: examData.description,
    };

    loggerService.info('Exam updated', mockDb.exams[index]);

    return mockDb.exams[index];
  },

  async deleteExam(id) {
    await delay(300);

    const index = mockDb.exams.findIndex((item) => item.id === Number(id));

    if (index === -1) {
      throw new Error('Exam not found');
    }

    const deletedExam = mockDb.exams.splice(index, 1)[0];
    loggerService.info('Exam deleted', deletedExam);

    return deletedExam;
  },

  async submitExam(examId, studentId, answers) {
    await delay(300);

    const exam = mockDb.exams.find((item) => item.id === Number(examId));

    if (!exam) {
      throw new Error('Exam not found');
    }

    let correctAnswers = 0;

    exam.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });

    const score =
      exam.questions.length === 0
        ? 0
        : Math.round((correctAnswers / exam.questions.length) * 100);

    const newGrade = {
      id: Date.now(),
      studentId: Number(studentId),
      examId: Number(examId),
      score,
      date: new Date().toISOString().split('T')[0],
    };

    mockDb.grades.push(newGrade);
    loggerService.info('Exam submitted', newGrade);

    return {
      score,
      correctAnswers,
      totalQuestions: exam.questions.length,
      grade: newGrade,
    };
  },

  async getGradesSummary() {
    await delay(300);

    return mockDb.grades.map((grade) => {
      const exam = mockDb.exams.find((item) => item.id === grade.examId);
      const student = mockDb.users.find((user) => user.id === grade.studentId);

      return {
        ...grade,
        examTitle: exam ? exam.title : 'Unknown Exam',
        studentName: student ? student.fullName : 'Unknown Student',
      };
    });
  },
};