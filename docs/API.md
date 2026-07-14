# API Reference

Local development base URL: `http://localhost:4000/api`

Except for login, registration, health and documentation, endpoints require:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

## Authentication

| Method | Path | Role | Description |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | Authenticate and return `{ token, user }` |
| POST | `/auth/register` | Public/configured | Create a teacher or student account |
| GET | `/auth/me` | Authenticated | Return the current safe user profile |

Login request:

```json
{
  "email": "teacher@examapp.local",
  "password": "123456"
}
```

## Exams

| Method | Path | Role | Description |
| --- | --- | --- | --- |
| GET | `/exams` | Teacher/student | Teacher sees managed exams; student sees open exams |
| GET | `/exams/:id` | Teacher/student | Read one authorized exam |
| POST | `/exams` | Teacher | Create an exam with questions |
| PUT | `/exams/:id` | Teacher | Update metadata/questions/status subject to lifecycle rules |
| DELETE | `/exams/:id` | Teacher | Delete a permitted exam and related attempts |

Create/update body:

```json
{
  "title": "React Foundations",
  "course": "Frontend Development",
  "description": "Core React concepts",
  "durationMinutes": 35,
  "passingScore": 70,
  "status": "open",
  "questions": [
    {
      "id": 1,
      "text": "Which hook stores component state?",
      "answers": ["useState", "useRoute", "useServer", "useHTML"],
      "correctAnswerIndex": 0
    }
  ]
}
```

Student exam responses omit correct-answer fields until after submission.

## Submissions and results

| Method | Path | Role | Description |
| --- | --- | --- | --- |
| POST | `/exams/:id/submissions` | Student | Submit answers and receive a score |
| GET | `/submissions/me` | Student | List the current student's attempts |
| GET | `/submissions` | Teacher | List managed-exam submissions |
| GET | `/exams/:id/submissions` | Teacher | Results and analytics for one exam |

Submission request:

```json
{
  "answers": {
    "1": 0,
    "2": 1,
    "3": 2
  }
}
```

## Dashboards and operations

| Method | Path | Role | Description |
| --- | --- | --- | --- |
| GET | `/dashboard/teacher` | Teacher | Exam, attempt, average and pass-rate metrics |
| GET | `/dashboard/student` | Student | Available exams, history and personal metrics |
| GET | `/health` | Public | Service, storage and readiness status |
| GET | `/docs` | Public | Interactive Swagger UI |
| GET | `/openapi.json` | Public | Machine-readable OpenAPI specification |

## Status codes

- `200` successful read/update
- `201` created exam, account or submission
- `400` invalid payload or parameters
- `401` missing/invalid/expired authentication
- `403` authenticated user lacks the required role/ownership
- `404` resource not found or not visible to the actor
- `409` duplicate/conflicting state, such as a repeated attempt
- `429` rate limit exceeded
- `500` unexpected internal failure
- `503` configured storage is unavailable

## Error response

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Teacher access is required.",
    "requestId": "f4ea..."
  }
}
```

The request ID connects a client-visible failure to structured server logs.
