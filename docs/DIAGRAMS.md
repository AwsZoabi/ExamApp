# Architecture and UML Diagrams

All diagrams use Mermaid so they render directly in GitHub and remain version-controlled with the implementation.

## 1. Overall architecture and data flow

```mermaid
flowchart LR
    U["Teacher / Student"] --> C["React SPA :5173 / :8080"]
    C -->|"HTTPS + JWT /api"| A["Express API :4000"]
    A --> AU["Auth service"]
    A --> ES["Exam service"]
    A --> SS["Submission service"]
    AU --> R["Repository contract"]
    ES --> R
    SS --> R
    R -->|"DATA_SOURCE=postgres"| P[("PostgreSQL 16\nrelational + JSONB")]
    R -->|"DATA_SOURCE=json"| J[("Local JSON fallback")]
    C -. "optional demonstration" .-> G["Microservices gateway :3000"]
    G --> F["Flask scoring :5002"]
    G --> N[".NET analytics :5001"]
```

## 2. React component hierarchy

```mermaid
flowchart TD
    ROOT["main.jsx"] --> APP["App"]
    APP --> AUTH["AuthProvider"]
    APP --> TOAST["ToastProvider"]
    AUTH --> ROUTER["Application routes"]
    ROUTER --> PUBLIC["PublicLayout"]
    ROUTER --> SHELL["AppShell"]
    PUBLIC --> LOGIN["LoginPage"]
    PUBLIC --> REGISTER["RegisterPage"]
    SHELL --> SIDEBAR["RoleNavigation"]
    SHELL --> TOPBAR["TopBar"]
    SHELL --> TEACHER["Teacher routes"]
    SHELL --> STUDENT["Student routes"]
    TEACHER --> TD["TeacherDashboardPage"]
    TEACHER --> EDITOR["ExamEditorPage"]
    TEACHER --> RESULTS["ExamResultsPage"]
    EDITOR --> QUESTION["QuestionEditor"]
    STUDENT --> SD["StudentDashboardPage"]
    STUDENT --> TAKE["TakeExamPage"]
    STUDENT --> HISTORY["AttemptHistoryPage"]
    TAKE --> TIMER["ExamTimer"]
    TAKE --> NAV["QuestionNavigator"]
    TAKE --> RESULT["ResultSummary"]
```

## 3. Server UML/class diagram

```mermaid
classDiagram
    class AuthController {
      +login(req,res)
      +register(req,res)
      +me(req,res)
    }
    class ExamController {
      +list(req,res)
      +get(req,res)
      +create(req,res)
      +update(req,res)
      +remove(req,res)
    }
    class SubmissionController {
      +submit(req,res)
      +listMine(req,res)
      +listForTeacher(req,res)
    }
    class AuthService {
      +login(email,password)
      +register(input)
      +verifyToken(token)
    }
    class ExamService {
      +list(actor)
      +create(actor,input)
      +update(actor,id,input)
    }
    class SubmissionService {
      +submit(actor,examId,answers)
      +dashboard(actor)
    }
    class Repository {
      <<interface>>
      +health()
      +findUserByEmail(email)
      +listExams(actor)
      +createExam(input)
      +createSubmission(input)
    }
    class PostgresRepository
    class JsonRepository
    AuthController --> AuthService
    ExamController --> ExamService
    SubmissionController --> SubmissionService
    AuthService --> Repository
    ExamService --> Repository
    SubmissionService --> Repository
    Repository <|.. PostgresRepository
    Repository <|.. JsonRepository
```

## 4. Database ERD

```mermaid
erDiagram
    USERS ||--o{ EXAMS : creates
    USERS ||--o{ SUBMISSIONS : completes
    EXAMS ||--o{ SUBMISSIONS : receives
    USERS ||--o{ AUDIT_LOGS : triggers
    USERS {
      int id PK
      text full_name
      text email UK
      text password_hash
      text role
      timestamptz created_at
    }
    EXAMS {
      int id PK
      int created_by FK
      text title
      text course
      text description
      int duration_minutes
      int passing_score
      text status
      jsonb questions
      timestamptz created_at
      timestamptz updated_at
    }
    SUBMISSIONS {
      int id PK
      int exam_id FK
      int student_id FK
      jsonb answers
      int score
      boolean passed
      timestamptz submitted_at
    }
    AUDIT_LOGS {
      int id PK
      int actor_id FK
      text action
      text entity_type
      int entity_id
      jsonb metadata
      timestamptz created_at
    }
```

## 5. Use-case diagram

```mermaid
flowchart LR
    T(("Teacher")) --> UC1["Create/edit exam"]
    T --> UC2["Publish/close exam"]
    T --> UC3["Review submissions"]
    T --> UC4["View analytics"]
    S(("Student")) --> UC5["Browse open exams"]
    S --> UC6["Take timed exam"]
    S --> UC7["View result/history"]
    O(("Operator")) --> UC8["Run Docker stack"]
    O --> UC9["Run tests/CI"]
    O --> UC10["Inspect health/logs"]
    UC6 --> UC11["Automatic scoring"]
    UC3 --> UC11
```

## 6. Sequence: teacher creates and publishes an exam

```mermaid
sequenceDiagram
    actor Teacher
    participant UI as React Exam Editor
    participant API as Express API
    participant Auth as Auth middleware
    participant Service as Exam service
    participant Repo as Repository
    participant DB as PostgreSQL/JSON
    Teacher->>UI: Enter metadata and questions
    UI->>UI: Validate fields and answers
    UI->>API: POST /api/exams + Bearer token
    API->>Auth: Verify JWT and teacher role
    Auth-->>API: Authorized actor
    API->>Service: createExam(actor, input)
    Service->>Service: Apply domain/status rules
    Service->>Repo: createExam(normalized input)
    Repo->>DB: INSERT metadata + JSONB questions
    DB-->>Repo: Persisted exam
    Repo-->>Service: Exam DTO
    Service-->>API: Exam DTO
    API-->>UI: 201 Created
    UI-->>Teacher: Published exam confirmation
```

## 7. Sequence: student submits an exam

```mermaid
sequenceDiagram
    actor Student
    participant UI as React Exam Runner
    participant API as Express API
    participant Auth as Auth middleware
    participant Service as Submission service
    participant Repo as Repository
    participant DB as PostgreSQL/JSON
    Student->>UI: Answer questions
    UI->>UI: Track timer and progress
    Student->>UI: Confirm submission
    UI->>API: POST /api/exams/:id/submissions
    API->>Auth: Verify JWT and student role
    Auth-->>API: Authorized student
    API->>Service: submit(student, examId, answers)
    Service->>Repo: getExamById(examId)
    Repo->>DB: Read exam and correct answers
    DB-->>Repo: Exam JSONB
    Repo-->>Service: Exam DTO
    Service->>Service: Calculate score and pass result
    Service->>Repo: createSubmission(result)
    Repo->>DB: INSERT JSONB answers + score
    DB-->>Repo: Submission
    Repo-->>Service: Submission DTO
    Service-->>API: Result DTO
    API-->>UI: 201 Created
    UI-->>Student: Score, pass/fail and summary
```

## 8. Sequence: teacher reviews results

```mermaid
sequenceDiagram
    actor Teacher
    participant UI as Teacher Dashboard
    participant API as Express API
    participant Auth as Auth middleware
    participant Service as Dashboard service
    participant Repo as Repository
    participant DB as PostgreSQL/JSON
    Teacher->>UI: Open results
    UI->>API: GET /api/exams/:id/submissions
    API->>Auth: Verify teacher role
    Auth-->>API: Authorized teacher
    API->>Service: getExamResults(actor, examId)
    Service->>Repo: listSubmissions(examId)
    Repo->>DB: Join submissions, students and exam
    DB-->>Repo: Result rows
    Repo-->>Service: Submission DTOs
    Service->>Service: Calculate average/pass rate/range
    Service-->>API: Results and analytics
    API-->>UI: 200 OK
    UI-->>Teacher: Metrics and detailed table
```

## 9. Deployment architecture

```mermaid
flowchart TB
    DEV["Developer / pull request"] --> GH["GitHub repository"]
    GH --> CI["GitHub Actions\nLint · Tests · Builds · Compose validation"]
    CI --> HUB["Docker Hub\nClient · API · Microservices"]
    HUB --> HOST["Deployment host"]
    HOST --> NGINX["Nginx React container :8080"]
    HOST --> API["Express API container :4000"]
    HOST --> DB[("PostgreSQL volume")]
    HOST --> MS["Optional microservices Compose network"]
```
