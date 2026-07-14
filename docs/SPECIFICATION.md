# ExamApp Product and Technical Specification

## 1. Product vision

ExamApp is a role-based examination platform for instructors and students. It supports the complete lifecycle of an exam: authoring, publishing, timed completion, automatic grading and result analysis. The final project demonstrates a professional SPA, a secure API, hybrid PostgreSQL/JSONB persistence, testable service boundaries, Docker operations and CI/CD.

## 2. Actors

### Teacher

- Creates and edits exams and multiple-choice questions.
- Chooses duration, passing score and lifecycle status.
- Publishes, closes or deletes exams.
- Reviews submissions, scores, pass rate and class performance.

### Student

- Registers or signs in.
- Sees only available/open exams.
- Completes a timed exam with progress and confirmation controls.
- Receives an automatically calculated score and pass/fail result.
- Reviews personal attempt history.

### Operator/developer

- Runs the system locally or through Docker.
- Switches between PostgreSQL and JSON persistence.
- Monitors health and structured logs.
- Executes tests, database demonstrations and CI/CD pipelines.

## 3. Central use cases

### UC-01: Teacher creates and publishes an exam

**Preconditions:** The user is authenticated as a teacher.

**Main flow:**

1. Teacher opens the exam editor.
2. Teacher enters metadata, duration, passing score and questions.
3. Client validates required fields and answer configuration.
4. API verifies the JWT and teacher role.
5. Exam service validates the domain model.
6. Repository stores relational metadata and JSONB questions.
7. Teacher publishes the exam and sees it on the dashboard.

**Alternative flows:** Invalid input returns field-level errors. An expired token returns 401. A non-teacher receives 403.

### UC-02: Student completes and submits an exam

**Preconditions:** The student is authenticated; the exam is open.

**Main flow:**

1. Student opens an available exam.
2. Client displays one question at a time and starts the timer.
3. Answers are retained while the student navigates.
4. Student confirms submission, or the timer expires.
5. API checks role, exam status and duplicate-attempt rules.
6. Submission service calculates the score from server-side correct answers.
7. Repository stores JSONB answers and score.
8. Student receives a result summary and attempt history update.

**Alternative flows:** Closed/missing exam returns 404 or 409. Invalid answers return 400. Network errors preserve a clear retry state.

### UC-03: Teacher reviews results

**Preconditions:** The teacher is authenticated and owns or can manage the exam.

**Main flow:**

1. Teacher opens dashboard metrics or an exam's submissions.
2. API authorizes teacher access.
3. Repository joins users, exams and submissions.
4. Analytics service calculates attempts, average, pass rate and score range.
5. Client renders summary cards and a detailed results table.

**Alternative flows:** An exam with no attempts displays a deliberate empty state rather than zero-division or missing-data errors.

## 4. Functional requirements

- FR-01: Register and authenticate users with teacher/student roles.
- FR-02: Persist a signed-in session with an expiring JWT.
- FR-03: Authorize every protected API endpoint server-side.
- FR-04: Create, read, update, publish, close and delete exams.
- FR-05: Author any number of multiple-choice questions with one correct answer each.
- FR-06: Display open exams and timed completion controls to students.
- FR-07: Score submissions on the server and store answers/results.
- FR-08: Show teacher and student dashboards.
- FR-09: Support PostgreSQL and local JSON through one repository contract.
- FR-10: Expose health, API documentation and operational logs.
- FR-11: Run the core stack and microservices with Docker Compose.
- FR-12: Validate all layers with automated tests and CI.

## 5. Non-functional requirements

- **Security:** hashed passwords, JWT verification, role authorization, validation, rate limits, security headers and no committed secrets.
- **Accessibility:** keyboard-operable controls, labels, focus visibility, semantic landmarks and sufficient contrast.
- **Reliability:** deterministic scoring, database constraints, health checks and graceful server shutdown.
- **Maintainability:** controllers/services/repositories, focused React components and documented contracts.
- **Portability:** host development, Docker deployment, PostgreSQL or JSON storage.
- **Observability:** request IDs, structured logs, health endpoints and CI logs.
- **Performance:** indexed relational fields, JSONB GIN indexes, bounded request bodies and efficient dashboard queries.

## 6. Data models

### User

```json
{
  "id": 2,
  "fullName": "Student Demo",
  "email": "student@examapp.local",
  "role": "student",
  "createdAt": "2026-06-01T08:00:00.000Z"
}
```

### Exam with JSONB questions

```json
{
  "id": 101,
  "title": "React Foundations",
  "course": "Frontend Development",
  "description": "Components, state and effects",
  "durationMinutes": 35,
  "passingScore": 70,
  "status": "open",
  "questions": [
    {
      "id": 1,
      "text": "Which hook stores local component state?",
      "answers": ["useState", "useRoute", "useServer", "useHTML"],
      "correctAnswerIndex": 0
    }
  ],
  "createdBy": 1
}
```

### Submission with JSONB answers

```json
{
  "id": 5001,
  "examId": 101,
  "studentId": 2,
  "answers": { "1": 0 },
  "score": 100,
  "passed": true,
  "submittedAt": "2026-06-02T09:30:00.000Z"
}
```

## 7. Lifecycle/status rules

- `draft`: visible to teachers; editable; unavailable to students.
- `open`: visible and available to students; editing questions is restricted to protect grading integrity.
- `closed`: unavailable for new attempts; historical submissions remain visible.

## 8. Error contract

API errors use a consistent structure and never expose stack traces in production:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [],
    "requestId": "..."
  }
}
```

## 9. Assumptions and boundaries

- ExamApp currently supports multiple-choice questions only.
- The scoring microservice is a demonstrable bounded service; core scoring remains available in the API so the main application is not dependent on an optional demo service.
- Public deployment credentials, repository URLs and student identity are never included in source control.
- Email delivery, password recovery and institutional SSO are suitable future milestones, not fabricated features.

