# Final Project Submission Sheet

> Replace every `REPLACE_ME` value with authentic account-owned information before submitting. Do not invent links or leave this sheet unchanged.

## Student information

- Student 1: `REPLACE_ME_NAME_AND_ID`
- Student 2: `REPLACE_ME_NAME_AND_ID_OR_REMOVE`
- Course/class: `REPLACE_ME`
- Submission date: `REPLACE_ME`

## Required links

- Public GitHub repository: <https://github.com/AwsZoabi/ExamApp>
- Live client deployment: <https://awszoabi.github.io/ExamApp/>
- API health endpoint: `REPLACE_ME_API_HEALTH_URL`
- GitHub Project/Kanban: `REPLACE_ME_KANBAN_URL`
- Green CI run: `REPLACE_ME_ACTIONS_RUN_URL`
- Docker Hub client image: `REPLACE_ME_DOCKERHUB_CLIENT_URL`
- Docker Hub server image: `REPLACE_ME_DOCKERHUB_SERVER_URL`
- Docker Hub gateway image: `REPLACE_ME_DOCKERHUB_GATEWAY_URL`
- Docker Hub scoring image: `REPLACE_ME_DOCKERHUB_SCORING_URL`
- Docker Hub analytics image: `REPLACE_ME_DOCKERHUB_ANALYTICS_URL`

## Demonstration evidence

- Full project walkthrough video: `REPLACE_ME_VIDEO_URL`
- Client debugging video: `REPLACE_ME_CLIENT_DEBUG_URL`
- Client/server debugging video: `REPLACE_ME_FULLSTACK_DEBUG_URL`
- Docker/PostgreSQL/JSONB demonstration: `REPLACE_ME_DATABASE_VIDEO_URL`
- Microservices demonstration: `REPLACE_ME_MICROSERVICES_VIDEO_URL`

## Demo accounts

Local academic seed only:

- Teacher: `teacher@examapp.local` / `123456`
- Student: `student@examapp.local` / `123456`

## Final verification checklist

- [ ] `scripts/verify.ps1` completes successfully.
- [ ] `docker compose up --build --detach --wait` succeeds locally.
- [ ] Client opens at `http://localhost:8080` and API health is ready.
- [ ] Teacher can create, edit, publish and close an exam with questions.
- [ ] Student can complete a timed exam and receive the correct score.
- [ ] Teacher results reflect the new attempt and analytics.
- [ ] PostgreSQL JSONB demo queries succeed.
- [ ] JSON fallback uses the same API contract.
- [ ] Microservices gateway reaches Flask and .NET services.
- [ ] GitHub Actions is green.
- [ ] Docker Hub images exist and production Compose can pull them.
- [ ] README links point to real pages.
- [ ] Diagrams render in GitHub.
- [ ] No `.env`, secret, token, `node_modules`, `.venv`, `bin`, `obj`, `dist`, coverage or runtime database is in the final ZIP.
- [ ] Student identity and every URL above are filled in.

## Suggested upload set

1. `ExamApp-Final-Submission.zip`
2. Public GitHub URL
3. Live deployment URL
4. Demonstration/debugging video links
5. Optional PDF/screenshots if the LMS requests separate evidence
