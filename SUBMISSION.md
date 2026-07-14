# Final Project Submission Sheet

This public-safe sheet contains only verified links and reproducible evidence. Student identity is supplied privately through the LMS and is intentionally omitted from this public repository.

## Student information

- Student identity: Provided privately through the LMS; student IDs are intentionally omitted from this public repository.
- Collaboration details: Provided privately through the LMS.
- Course/class: Provided privately through the LMS.
- Prepared: 14 July 2026.

## Required links

- Public GitHub repository: <https://github.com/AwsZoabi/ExamApp>
- GitHub Pages target: <https://awszoabi.github.io/ExamApp/>; verify the latest official Pages workflow before LMS submission because the URL retains the preceding deployment until a new run succeeds
- API health endpoint: local Docker endpoint <http://localhost:4000/api/health>; no public API deployment is claimed
- Planning evidence: [GitHub Issues](https://github.com/AwsZoabi/ExamApp/issues) and the [documented Git/Kanban/milestone workflow](docs/GIT-WORKFLOW.md); no public Project board is claimed
- Successful main-branch CI run: <https://github.com/AwsZoabi/ExamApp/actions/runs/29342193684>

## Container-image evidence

No public Docker registry publication is claimed. Every image is reproducibly built from the submitted source:

- Client image: [client/Dockerfile](client/Dockerfile)
- API image: [server/Dockerfile](server/Dockerfile)
- Gateway image: [microservices/gateway/Dockerfile](microservices/gateway/Dockerfile)
- Scoring image: [microservices/scoring-service/Dockerfile](microservices/scoring-service/Dockerfile)
- Analytics image: [microservices/analytics-service/Dockerfile](microservices/analytics-service/Dockerfile)

## Reproducible demonstration evidence

No public recording is claimed. The submitted guides and scripts provide exact, repeatable evidence:

- Full project walkthrough: [short demonstration script](docs/USER-GUIDE.md#short-demonstration-script)
- Client and client/server debugging: [required debugging scenarios](docs/DEBUGGING.md#required-demonstration-scenarios)
- Docker/PostgreSQL/JSONB demonstration: [database demo script](scripts/db-demo.ps1) and [JSONB queries](database/003_jsonb_demo_queries.sql)
- Microservices demonstration: [recording sequence](microservices/docs/DEMO-GUIDE.md#recording-sequence)

## Demo accounts

Local academic seed only:

- Teacher: `teacher@examapp.local` / `123456`
- Student: `student@examapp.local` / `123456`

## Final verification checklist

- [x] `scripts/verify.ps1` completes successfully.
- [x] All development and production Compose configurations validate.
- [x] Client and API health were verified in the local acceptance run.
- [x] Teacher can create, edit, publish and close an exam with questions.
- [x] Student can complete a timed exam and receive the correct score.
- [x] Teacher results reflect the new attempt and analytics.
- [x] PostgreSQL schema, JSONB seed model and demonstration queries validate.
- [x] JSON fallback uses the same API contract.
- [x] Microservices gateway reaches Flask and .NET services.
- [x] The ExamApp CI workflow is green.
- [x] Every container image has a submitted Dockerfile; public registry publication is not claimed.
- [x] README links point to real pages or clearly labeled local evidence.
- [x] Diagrams render in GitHub.
- [x] No `.env`, secret, token, `node_modules`, `.venv`, `bin`, `obj`, `dist`, coverage or runtime database is in the final ZIP.
- [x] Student identity is intentionally reserved for the private LMS cover sheet.

## Suggested upload set

1. `ExamApp-Final-Submission.zip`
2. Public GitHub URL
3. Live deployment URL
4. Private LMS cover sheet containing the real student identity
5. Microservices recording when submitted for the separate microservices exercise
6. Optional screenshots if the LMS requests separate evidence
