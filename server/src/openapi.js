const bearerSecurity = [{ bearerAuth: [] }];

const errorResponse = {
  description: 'Request failed',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
    },
  },
};

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'ExamApp API',
    version: '1.0.0',
    description:
      'Secure teacher/student exam API. Students never receive correct answers before submission.',
  },
  servers: [{ url: 'http://localhost:4000', description: 'Local API' }],
  tags: [
    { name: 'System' },
    { name: 'Auth' },
    { name: 'Exams' },
    { name: 'Submissions' },
    { name: 'Dashboards' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Readiness and selected storage provider',
        responses: { 200: { description: 'Ready' }, 503: errorResponse },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Login' } },
          },
        },
        responses: { 200: { description: 'JWT and user' }, 401: errorResponse },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user; teacher registration is disabled by default',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Register' } },
          },
        },
        responses: { 201: { description: 'JWT and user' }, 409: errorResponse },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        security: bearerSecurity,
        summary: 'Get authenticated user',
        responses: { 200: { description: 'Current user' }, 401: errorResponse },
      },
    },
    '/api/exams': {
      get: {
        tags: ['Exams'],
        security: bearerSecurity,
        summary: 'Students get open exams; teachers get exams they own',
        responses: { 200: { description: 'Exam array' } },
      },
      post: {
        tags: ['Exams'],
        security: bearerSecurity,
        summary: 'Create an exam (teacher)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ExamInput' } },
          },
        },
        responses: { 201: { description: 'Created exam' }, 403: errorResponse },
      },
    },
    '/api/exams/{id}': {
      parameters: [{ $ref: '#/components/parameters/Id' }],
      get: {
        tags: ['Exams'],
        security: bearerSecurity,
        summary: 'Get an accessible exam',
        responses: { 200: { description: 'Exam' }, 404: errorResponse },
      },
      put: {
        tags: ['Exams'],
        security: bearerSecurity,
        summary: 'Update an owned exam (teacher)',
        responses: { 200: { description: 'Updated exam' }, 403: errorResponse },
      },
      delete: {
        tags: ['Exams'],
        security: bearerSecurity,
        summary: 'Delete an owned exam and its submissions (teacher)',
        responses: { 200: { description: 'Deletion confirmation' }, 403: errorResponse },
      },
    },
    '/api/exams/{id}/submissions': {
      parameters: [{ $ref: '#/components/parameters/Id' }],
      post: {
        tags: ['Submissions'],
        security: bearerSecurity,
        summary: 'Submit answers and calculate score (student)',
        responses: { 201: { description: 'Scored submission' }, 403: errorResponse },
      },
      get: {
        tags: ['Submissions'],
        security: bearerSecurity,
        summary: 'List submissions for an owned exam (teacher)',
        responses: { 200: { description: 'Submission array' }, 403: errorResponse },
      },
    },
    '/api/submissions/me': {
      get: {
        tags: ['Submissions'],
        security: bearerSecurity,
        summary: 'List current student submissions',
        responses: { 200: { description: 'Submission array' } },
      },
    },
    '/api/submissions': {
      get: {
        tags: ['Submissions'],
        security: bearerSecurity,
        summary: 'List submissions for exams owned by current teacher',
        responses: { 200: { description: 'Submission array' } },
      },
    },
    '/api/dashboard/teacher': {
      get: {
        tags: ['Dashboards'],
        security: bearerSecurity,
        summary: 'Teacher summary, owned exams, and recent submissions',
        responses: { 200: { description: 'Teacher dashboard' } },
      },
    },
    '/api/dashboard/student': {
      get: {
        tags: ['Dashboards'],
        security: bearerSecurity,
        summary: 'Student summary, available exams, and recent submissions',
        responses: { 200: { description: 'Student dashboard' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    parameters: {
      Id: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
    },
    schemas: {
      Login: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      Register: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 6 },
          role: { type: 'string', enum: ['student', 'teacher'], default: 'student' },
        },
      },
      ExamInput: {
        type: 'object',
        required: ['title', 'course', 'durationMinutes'],
        properties: {
          title: { type: 'string' },
          course: { type: 'string' },
          description: { type: 'string' },
          durationMinutes: { type: 'integer', minimum: 1, maximum: 480 },
          passingScore: { type: 'integer', minimum: 0, maximum: 100 },
          status: { type: 'string', enum: ['draft', 'open', 'closed'] },
          questions: { type: 'array', items: { type: 'object' } },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message', 'requestId'],
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
              requestId: { type: 'string' },
            },
          },
        },
      },
    },
  },
};
