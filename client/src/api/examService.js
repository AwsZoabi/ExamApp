// Exam Service - Simulates API calls with async/await and Promises
// Designed to work seamlessly with a future Node.js backend

import { mockExams, mockStudentScores } from './mockDb';

// Utility function to simulate network delay
const simulateNetworkDelay = (delayMs = 500) => {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
};

/**
 * Get all exams
 * @returns {Promise<Array>} Array of all exams
 */
export const getAllExams = async () => {
  await simulateNetworkDelay(600);
  try {
    return Promise.resolve(mockExams);
  } catch (error) {
    return Promise.reject(new Error('Failed to fetch exams'));
  }
};

/**
 * Get exam by ID with full question details
 * @param {number} examId - The ID of the exam
 * @returns {Promise<Object>} Exam object with questions
 */
export const getExamById = async (examId) => {
  await simulateNetworkDelay(500);
  try {
    const exam = mockExams.find((e) => e.id === parseInt(examId));
    if (!exam) {
      return Promise.reject(new Error(`Exam with ID ${examId} not found`));
    }
    return Promise.resolve(exam);
  } catch (error) {
    return Promise.reject(new Error('Failed to fetch exam details'));
  }
};

/**
 * Create a new exam
 * @param {Object} exam - Exam object with title, description, questions, etc.
 * @returns {Promise<Object>} Created exam with assigned ID
 */
export const createExam = async (exam) => {
  await simulateNetworkDelay(700);
  try {
    const newExam = {
      id: Math.max(...mockExams.map((e) => e.id), 0) + 1,
      ...exam,
      createdDate: new Date().toISOString().split('T')[0],
      questions: exam.questions || []
    };
    mockExams.push(newExam);
    return Promise.resolve(newExam);
  } catch (error) {
    return Promise.reject(new Error('Failed to create exam'));
  }
};

/**
 * Delete an exam by ID
 * @param {number} examId - The ID of the exam to delete
 * @returns {Promise<Object>} Confirmation object
 */
export const deleteExam = async (examId) => {
  await simulateNetworkDelay(500);
  try {
    const index = mockExams.findIndex((e) => e.id === parseInt(examId));
    if (index === -1) {
      return Promise.reject(new Error(`Exam with ID ${examId} not found`));
    }
    mockExams.splice(index, 1);
    return Promise.resolve({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    return Promise.reject(new Error('Failed to delete exam'));
  }
};

/**
 * Get all student scores
 * @returns {Promise<Array>} Array of all student scores
 */
export const getAllStudentScores = async () => {
  await simulateNetworkDelay(600);
  try {
    return Promise.resolve(mockStudentScores);
  } catch (error) {
    return Promise.reject(new Error('Failed to fetch student scores'));
  }
};

/**
 * Get student scores by exam ID
 * @param {number} examId - The ID of the exam
 * @returns {Promise<Array>} Array of scores for the exam
 */
export const getScoresByExamId = async (examId) => {
  await simulateNetworkDelay(500);
  try {
    const scores = mockStudentScores.filter((s) => s.examId === parseInt(examId));
    return Promise.resolve(scores);
  } catch (error) {
    return Promise.reject(new Error('Failed to fetch exam scores'));
  }
};

/**
 * Submit exam answers and calculate score
 * @param {number} examId - The ID of the exam
 * @param {string} studentName - Name of the student
 * @param {Array} answers - Array of answer indices
 * @returns {Promise<Object>} Score report
 */
export const submitExamAnswers = async (examId, studentName, answers) => {
  await simulateNetworkDelay(800);
  try {
    const exam = mockExams.find((e) => e.id === parseInt(examId));
    if (!exam) {
      return Promise.reject(new Error(`Exam with ID ${examId} not found`));
    }

    let correctCount = 0;
    answers.forEach((answer, index) => {
      if (exam.questions[index] && exam.questions[index].correctAnswer === answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / exam.questions.length) * 100);
    const passed = score >= exam.passingScore;

    const scoreRecord = {
      id: mockStudentScores.length + 1,
      studentName,
      examId: parseInt(examId),
      examTitle: exam.title,
      score,
      totalQuestions: exam.questions.length,
      correctAnswers: correctCount,
      attemptDate: new Date().toISOString(),
      status: passed ? 'Passed' : 'Failed'
    };

    mockStudentScores.push(scoreRecord);

    return Promise.resolve({
      success: true,
      scoreRecord,
      message: passed ? 'Congratulations! You passed the exam.' : 'You did not pass this exam. Please try again.'
    });
  } catch (error) {
    return Promise.reject(new Error('Failed to submit exam answers'));
  }
};

/**
 * Get exam statistics
 * @returns {Promise<Object>} Statistics about all exams
 */
export const getExamStatistics = async () => {
  await simulateNetworkDelay(600);
  try {
    const stats = {
      totalExams: mockExams.length,
      totalAttempts: mockStudentScores.length,
      averageScore: (
        mockStudentScores.reduce((acc, score) => acc + score.score, 0) /
        (mockStudentScores.length || 1)
      ).toFixed(2),
      passRate: (
        (mockStudentScores.filter((s) => s.status === 'Passed').length /
          (mockStudentScores.length || 1)) *
        100
      ).toFixed(2)
    };
    return Promise.resolve(stats);
  } catch (error) {
    return Promise.reject(new Error('Failed to fetch exam statistics'));
  }
};
