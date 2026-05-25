export const mockDb = {
  users: [
    {
      id: 1,
      fullName: 'Teacher Demo',
      email: 'teacher@examapp.com',
      password: '123456',
      role: 'teacher',
    },
    {
      id: 2,
      fullName: 'Student Demo',
      email: 'student@examapp.com',
      password: '123456',
      role: 'student',
    },
  ],

  exams: [
    {
      id: 101,
      title: 'React Basics Exam',
      course: 'Frontend Development',
      durationMinutes: 45,
      status: 'Open',
      description: 'Basic questions about React components, props, and state.',
    },
    {
      id: 102,
      title: 'JavaScript Fundamentals',
      course: 'Web Programming',
      durationMinutes: 60,
      status: 'Open',
      description: 'Questions about variables, arrays, functions, and objects.',
    },
    {
      id: 103,
      title: 'HTML CSS Quiz',
      course: 'Web Basics',
      durationMinutes: 30,
      status: 'Closed',
      description: 'Short quiz about HTML structure and CSS styling.',
    },
  ],

  grades: [
    {
      id: 1,
      studentId: 2,
      examId: 101,
      score: 92,
      date: '2026-05-20',
    },
    {
      id: 2,
      studentId: 2,
      examId: 102,
      score: 84,
      date: '2026-05-21',
    },
  ],
};