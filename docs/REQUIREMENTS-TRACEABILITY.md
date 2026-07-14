# Requirements Traceability Matrix

This matrix maps the lecturer's final-project requirements to concrete files and evidence in the repository.

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| Public GitHub and deployment links | Real repository/Pages URLs plus CI/CD workflows | `README.md`, `SUBMISSION.md`, `.github/workflows/` |
| Complete README | Architecture, setup, accounts, API, tests, Docker, deployment, limitations | `README.md` |
| Three central use cases | Teacher publishes exam; student completes exam; teacher reviews results | `docs/SPECIFICATION.md`, `docs/DIAGRAMS.md` |
| Overall client/server/database/services architecture | Layered architecture and data-flow diagrams | `docs/DIAGRAMS.md` |
| Separate client and server packages | Vite React client and Express API | `client/`, `server/` |
| MVC/component description | Controllers, services, repositories and React component hierarchy | `server/src/`, `client/src/`, `docs/DIAGRAMS.md` |
| Database ERD and JSON models | Relational users/exams/submissions/audit logs with JSONB questions/answers | `database/001_schema.sql`, `docs/DIAGRAMS.md` |
| OOP/UML diagram | Controllers, services and repository abstractions | `docs/DIAGRAMS.md` |
| At least three sequence diagrams | Publish, take/score, review results | `docs/DIAGRAMS.md` |
| React authentication and roles | Login/register, JWT session, protected teacher/student routes | `client/src/`, `server/src/` |
| Teacher pages | Dashboard, exam CRUD, question authoring, publishing, results | `client/src/pages/TeacherDashboardPage.jsx`, `client/src/pages/ExamEditorPage.jsx`, `client/src/pages/ExamResultsPage.jsx` |
| Student pages | Dashboard, timed exam, results and history | `client/src/pages/StudentDashboardPage.jsx`, `client/src/pages/TakeExamPage.jsx`, `client/src/pages/SubmissionResultPage.jsx` |
| Navigation menu | Responsive role-aware application shell | `client/src/components/layout/` |
| Configuration service | API/mock switch and environment configuration | `client/src/services/`, `server/src/config/` |
| Mock API/data mode | Same client contract backed by browser mock services | `client/src/services/` |
| Logger, storage and notification services | Dedicated reusable services | `client/src/services/`, `server/src/services/` |
| Unit tests with Vitest | Client components/services and server APIs/repositories | `client/src/**/*.test.*`, `server/test/` |
| Express CRUD API | Auth, exams, submissions, dashboards and health | `server/src/routes/`, `docs/API.md` |
| Client/server debugging | Separate and compound VS Code launch configurations | `.vscode/launch.json`, `docs/DEBUGGING.md` |
| PostgreSQL hybrid JSONB schema | Relational metadata plus embedded exam questions and submitted answers | `database/` |
| Seed and database demonstration | Idempotent seeds and JSONB query script | `database/002_seed.sql`, `scripts/db-demo.ps1` |
| Dockerized local database | PostgreSQL 16 Compose service, volume and health check | `docker-compose.yml` |
| Remote database or local JSON configuration | `DATABASE_URL`, SSL mode and `DATA_SOURCE=postgres|json` | `.env.example`, `server/.env.example` |
| Full-stack Docker deployment | Client, API and PostgreSQL containers | `docker-compose.yml`, `docker-compose.prod.yml` |
| Microservices | Node gateway, Flask scoring and .NET analytics services | `microservices/` |
| CI/CD | Tests, builds, Compose validation and Docker image publishing | `.github/workflows/` |
| Logs and operational evidence | Request IDs, structured logs, health checks and demo scripts | `server/src/`, `scripts/`, `docs/DEPLOYMENT.md` |
| Professional final submission | Clean archive, submission checklist, no secrets/generated files | `SUBMISSION.md`, `scripts/verify.ps1` |

## Evidence that must be supplied by the student

The repository contains the implementation and recording scripts, but these account-owned items must be added before submission:

- Student names/IDs
- Public GitHub URL
- Live deployment URL
- Green GitHub Actions run URL
- Docker Hub image URLs
- Short demonstration/debugging video URLs
- Screenshots requested by the lecturer

Do not invent these links. Replace the placeholders in `SUBMISSION.md` only after the real resources exist.
