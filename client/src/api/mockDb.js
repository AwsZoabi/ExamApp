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
      questions: [
        {
          id: 1,
          text: 'What is a React component?',
          answers: [
            'A reusable UI building block',
            'A database table',
            'A CSS file',
            'A server only function',
          ],
          correctAnswerIndex: 0,
        },
        {
          id: 2,
          text: 'Which hook is used to manage state in React?',
          answers: ['useRoute', 'useState', 'useServer', 'useHTML'],
          correctAnswerIndex: 1,
        },
        {
          id: 3,
          text: 'What are props used for?',
          answers: [
            'Passing data to components',
            'Deleting files',
            'Changing the browser',
            'Creating a database',
          ],
          correctAnswerIndex: 0,
        },
      ],
    },
    {
      id: 102,
      title: 'JavaScript Fundamentals',
      course: 'Web Programming',
      durationMinutes: 60,
      status: 'Open',
      description: 'Questions about variables, arrays, functions, and objects.',
      questions: [
        {
          id: 1,
          text: 'Which keyword declares a variable?',
          answers: ['table', 'let', 'style', 'page'],
          correctAnswerIndex: 1,
        },
        {
          id: 2,
          text: 'What type is an array in JavaScript?',
          answers: ['object', 'number', 'boolean', 'css'],
          correctAnswerIndex: 0,
        },
      ],
    },
    {
      id: 103,
      title: 'HTML CSS Quiz',
      course: 'Web Basics',
      durationMinutes: 30,
      status: 'Closed',
      description: 'Short quiz about HTML structure and CSS styling.',
      questions: [
        {
          id: 1,
          text: 'What does HTML stand for?',
          answers: [
            'HyperText Markup Language',
            'HighText Machine Language',
            'Home Tool Markup Language',
            'Hyperlink Text Manager',
          ],
          correctAnswerIndex: 0,
        },
      ],
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