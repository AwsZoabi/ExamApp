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