# ExamApp Client

A responsive React assessment workspace for teachers and students. The client
uses one service interface with two interchangeable adapters:

- `VITE_DATA_SOURCE=api` connects to the ExamApp Express API.
- `VITE_DATA_SOURCE=mock` runs the complete UI against a persistent browser
  demo, with no server required.

The application deliberately contains no duplicate legacy components and no
page calls `fetch` directly. Authentication, exams, submissions, dashboards,
storage, logging, and notifications all pass through focused services.

## Features

### Teacher workspace

- role-protected dashboard with assessment and performance metrics;
- create and edit exam metadata;
- dynamic multiple-choice question and answer builder;
- selectable correct answer per question;
- draft, publish, close, reopen, and delete actions;
- per-exam submission results and calculated metrics;
- loading, error, empty, confirmation, and toast states.

### Student workspace

- available-exam cards and submission history;
- timed exam session with progress and question navigation;
- responsive answer controls and unanswered-question warning;
- automatic submission when time expires;
- immediate score, pass/fail result, and detailed answer review;
- historical result review.

### Engineering

- React Router role guards and guest guards;
- bearer-token request wrapper;
- consistent support for direct JSON and `{ "data": ... }` envelopes;
- API and mock adapters with the same method contract;
- Vitest, React Testing Library, and coverage scripts;
- multi-stage Docker image served by Nginx;
- SPA fallback plus `/api/` reverse proxy to `server:4000`;
- semantic HTML, keyboard focus states, reduced-motion support, and responsive
  layouts.

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Local development

Copy the example configuration:

```powershell
Copy-Item .env.example .env
npm.cmd ci
npm.cmd run dev
```

Vite runs at [http://localhost:5173](http://localhost:5173). The example API URL
is `http://localhost:4000/api`.

For a self-contained frontend demo, change `.env` to:

```env
VITE_DATA_SOURCE=mock
```

Mock changes are stored in `localStorage`. Clear site data to restore the
original exam, user, and submission seed.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Teacher | `teacher@examapp.local` | `123456` |
| Student | `student@examapp.local` | `123456` |

The login screen includes buttons that fill these credentials automatically.
They are demonstration accounts only.

## API contract

The API adapter sends `Authorization: Bearer <token>` when a token is present
and uses these endpoints:

| Method | Endpoint |
|---|---|
| POST | `/api/auth/login` |
| POST | `/api/auth/register` |
| GET | `/api/auth/me` |
| GET, POST | `/api/exams` |
| GET, PUT, DELETE | `/api/exams/:id` |
| POST | `/api/exams/:id/submissions` |
| GET | `/api/submissions/me` |
| GET | `/api/submissions` |
| GET | `/api/exams/:id/submissions` |
| GET | `/api/dashboard/teacher` |
| GET | `/api/dashboard/student` |
| GET | `/api/health` |

An exam uses this shape:

```json
{
  "id": 101,
  "title": "React Foundations",
  "course": "Frontend Engineering",
  "description": "Assessment description",
  "durationMinutes": 20,
  "passingScore": 70,
  "status": "open",
  "questions": [
    {
      "id": 1,
      "text": "Question text",
      "answers": ["Choice A", "Choice B"],
      "correctAnswerIndex": 0
    }
  ],
  "createdBy": 1,
  "createdAt": "2026-07-01T10:00:00.000Z",
  "updatedAt": "2026-07-01T10:00:00.000Z"
}
```

The request wrapper accepts either a direct payload or a `{ "data": payload }`
response. Login/register responses may return `token`, `accessToken`, or `jwt`,
with a nested `user`. Submission results are expected to include `score`,
`passed`, `correctAnswers`, `totalQuestions`, `answers`, and `exam`.

## Quality checks

```powershell
npm.cmd test
npm.cmd run test:coverage
npm.cmd run lint
npm.cmd run build
```

Tests cover response unwrapping, authentication, the mock teacher-to-student
workflow, role protection, login navigation, the dynamic question builder, and
result review.

## Docker and Nginx

The Docker build defaults to API mode and uses the internal `/api` path:

```powershell
docker build -t examapp-client .
```

Build arguments are available when needed:

```powershell
docker build `
  --build-arg VITE_API_URL=/api `
  --build-arg VITE_DATA_SOURCE=api `
  -t examapp-client .
```

At runtime Nginx:

- serves the compiled SPA on port 80;
- sends unknown browser routes to `index.html`;
- exposes `GET /health`;
- proxies `/api/` to `http://server:4000/api/`.

The Compose service hosting the Express API must therefore be named `server`.

## Project layout

```text
src/
  components/
    common/       shared feedback and data-display components
    exam/         exam cards, question builder, result review
    layout/       application shell and route guards
  context/        authentication state
  data/           isolated mock seed
  pages/          teacher, student, auth, and exam flows
  services/       API/mock adapters, HTTP, storage, logger, notifications
  test/           Vitest and React Testing Library coverage
  utils/          formatting and exam validation
```

Never commit `.env`, tokens, `node_modules`, `dist`, or coverage output.
