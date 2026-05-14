// Mock Database for E-Test System
// Contains Exams, Questions, and Student Scores

export const mockExams = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    duration: 30,
    totalQuestions: 5,
    passingScore: 60,
    createdDate: '2026-05-10',
    questions: [
      {
        id: 1,
        question: 'What is the output of typeof null?',
        options: ['null', 'object', 'undefined', 'NaN'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 2,
        question: 'Which of these is NOT a primitive type in JavaScript?',
        options: ['String', 'Number', 'Array', 'Boolean'],
        correctAnswer: 2,
        difficulty: 'medium'
      },
      {
        id: 3,
        question: 'What does the spread operator (...) do?',
        options: ['Creates a copy', 'Expands iterables', 'Both A and B', 'Neither A nor B'],
        correctAnswer: 2,
        difficulty: 'medium'
      },
      {
        id: 4,
        question: 'What is the difference between let and var?',
        options: ['No difference', 'Scope difference', 'Performance', 'let is deprecated'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 5,
        question: 'What does async/await do?',
        options: ['Makes code slower', 'Handles promises better', 'Delays execution', 'Stops errors'],
        correctAnswer: 1,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 2,
    title: 'React Basics',
    description: 'React fundamentals and hooks',
    duration: 45,
    totalQuestions: 4,
    passingScore: 70,
    createdDate: '2026-05-11',
    questions: [
      {
        id: 1,
        question: 'What is a React component?',
        options: ['A function or class', 'A CSS file', 'A database', 'A server'],
        correctAnswer: 0,
        difficulty: 'easy'
      },
      {
        id: 2,
        question: 'Which hook manages state in functional components?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 3,
        question: 'What is the purpose of useEffect?',
        options: ['Performance', 'Side effects', 'Styling', 'Routing'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 4,
        question: 'How do you pass data from parent to child in React?',
        options: ['State', 'Props', 'Context', 'Redux'],
        correctAnswer: 1,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 3,
    title: 'CSS and Styling',
    description: 'CSS selectors, flexbox, and grid',
    duration: 25,
    totalQuestions: 3,
    passingScore: 65,
    createdDate: '2026-05-12',
    questions: [
      {
        id: 1,
        question: 'What does flexbox do?',
        options: ['Adds icons', 'Layouts 1D content', 'Makes things bold', 'Compresses files'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 2,
        question: 'Which CSS property controls text alignment?',
        options: ['text-align', 'align-text', 'alignment', 'text-direction'],
        correctAnswer: 0,
        difficulty: 'easy'
      },
      {
        id: 3,
        question: 'What is CSS Grid best for?',
        options: ['Mobile only', '2D layouts', 'Animations', 'Fonts'],
        correctAnswer: 1,
        difficulty: 'medium'
      }
    ]
  }
];

export const mockStudentScores = [
  {
    id: 1,
    studentName: 'John Doe',
    examId: 1,
    examTitle: 'JavaScript Fundamentals',
    score: 80,
    totalQuestions: 5,
    correctAnswers: 4,
    attemptDate: '2026-05-13T10:30:00',
    status: 'Passed'
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    examId: 2,
    examTitle: 'React Basics',
    score: 75,
    totalQuestions: 4,
    correctAnswers: 3,
    attemptDate: '2026-05-13T11:15:00',
    status: 'Passed'
  },
  {
    id: 3,
    studentName: 'Bob Johnson',
    examId: 1,
    examTitle: 'JavaScript Fundamentals',
    score: 55,
    totalQuestions: 5,
    correctAnswers: 2,
    attemptDate: '2026-05-13T14:45:00',
    status: 'Failed'
  },
  {
    id: 4,
    studentName: 'Alice Brown',
    examId: 3,
    examTitle: 'CSS and Styling',
    score: 70,
    totalQuestions: 3,
    correctAnswers: 2,
    attemptDate: '2026-05-14T09:20:00',
    status: 'Passed'
  }
];
