const question = (id, text, answers, correctAnswerIndex) => ({
  id,
  text,
  answers,
  correctAnswerIndex,
});

export function createMockSeed() {
  return {
    users: [
      {
        id: 1,
        fullName: 'Maya Cohen',
        email: 'teacher@examapp.local',
        password: '123456',
        role: 'teacher',
        createdAt: '2026-05-01T08:00:00.000Z',
      },
      {
        id: 2,
        fullName: 'Adam Levi',
        email: 'student@examapp.local',
        password: '123456',
        role: 'student',
        createdAt: '2026-05-02T08:00:00.000Z',
      },
    ],
    exams: [
      {
        id: 101,
        title: 'React Foundations',
        course: 'Frontend Engineering',
        description:
          'Assess component thinking, state management, rendering, and everyday React patterns.',
        durationMinutes: 18,
        passingScore: 70,
        status: 'open',
        questions: [
          question(
            1,
            'What is the primary purpose of React state?',
            [
              'Store values that can change and affect rendering',
              'Replace semantic HTML',
              'Compile CSS on the server',
              'Create database indexes',
            ],
            0,
          ),
          question(
            2,
            'Which rule keeps Hook calls predictable?',
            [
              'Call Hooks only from event handlers',
              'Call Hooks at the top level of a component',
              'Call Hooks inside conditional branches',
              'Call Hooks after an early return',
            ],
            1,
          ),
          question(
            3,
            'Why should list items receive stable keys?',
            [
              'To encrypt component props',
              'To enable browser caching',
              'To help React reconcile items correctly',
              'To make every component global',
            ],
            2,
          ),
          question(
            4,
            'What is a controlled form input?',
            [
              'An input whose value is managed by React state',
              'An input that cannot be edited',
              'An input rendered only on the server',
              'An input without a label',
            ],
            0,
          ),
        ],
        createdBy: 1,
        createdAt: '2026-06-02T09:00:00.000Z',
        updatedAt: '2026-07-08T10:30:00.000Z',
      },
      {
        id: 102,
        title: 'API & Service Design',
        course: 'Full-Stack Development',
        description:
          'Review HTTP contracts, resilient client services, validation, and status-code semantics.',
        durationMinutes: 22,
        passingScore: 65,
        status: 'open',
        questions: [
          question(
            1,
            'Which HTTP method is normally used for a partial update?',
            ['GET', 'PATCH', 'DELETE', 'HEAD'],
            1,
          ),
          question(
            2,
            'What does a 401 response communicate?',
            [
              'The resource was deleted',
              'Authentication is required or invalid',
              'The server completed an asynchronous job',
              'The request succeeded without content',
            ],
            1,
          ),
          question(
            3,
            'Why use a service layer in a client application?',
            [
              'To couple every page directly to fetch',
              'To centralize data access and keep UI code focused',
              'To remove all validation',
              'To avoid reusable interfaces',
            ],
            1,
          ),
        ],
        createdBy: 1,
        createdAt: '2026-06-14T11:00:00.000Z',
        updatedAt: '2026-07-10T08:20:00.000Z',
      },
      {
        id: 103,
        title: 'Docker Delivery Lab',
        course: 'DevOps Essentials',
        description:
          'A draft assessment covering images, containers, Compose, and service health checks.',
        durationMinutes: 25,
        passingScore: 60,
        status: 'draft',
        questions: [
          question(
            1,
            'Which file describes a multi-container local application?',
            ['package.json', 'docker-compose.yml', 'index.html', 'README.txt'],
            1,
          ),
          question(
            2,
            'What is the purpose of a container health check?',
            [
              'Measure source-code line count',
              'Verify that a service is ready to handle work',
              'Publish an image automatically',
              'Replace application tests',
            ],
            1,
          ),
        ],
        createdBy: 1,
        createdAt: '2026-07-09T12:00:00.000Z',
        updatedAt: '2026-07-09T12:00:00.000Z',
      },
      {
        id: 104,
        title: 'JavaScript Core Skills',
        course: 'Web Programming',
        description: 'A completed assessment covering collections, functions, and asynchronous code.',
        durationMinutes: 20,
        passingScore: 60,
        status: 'closed',
        questions: [
          question(
            1,
            'Which array method returns a transformed array?',
            ['forEach', 'map', 'some', 'find'],
            1,
          ),
          question(
            2,
            'What does an async function always return?',
            ['A Promise', 'A DOM node', 'A generator', 'A CSS rule'],
            0,
          ),
          question(
            3,
            'Which declaration is block scoped?',
            ['var', 'let', 'function', 'import()'],
            1,
          ),
        ],
        createdBy: 1,
        createdAt: '2026-05-20T08:00:00.000Z',
        updatedAt: '2026-06-30T13:30:00.000Z',
      },
    ],
    submissions: [
      {
        id: 501,
        examId: 104,
        studentId: 2,
        answers: { 1: 1, 2: 0, 3: 1 },
        score: 100,
        passed: true,
        correctAnswers: 3,
        totalQuestions: 3,
        submittedAt: '2026-06-29T10:24:00.000Z',
        durationSeconds: 436,
      },
      {
        id: 502,
        examId: 101,
        studentId: 2,
        answers: { 1: 0, 2: 1, 3: 1, 4: 0 },
        score: 75,
        passed: true,
        correctAnswers: 3,
        totalQuestions: 4,
        submittedAt: '2026-07-07T14:05:00.000Z',
        durationSeconds: 612,
      },
    ],
  };
}
