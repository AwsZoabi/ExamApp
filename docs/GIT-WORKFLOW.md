# Git, Kanban and Milestone Workflow

## Existing repository evidence

The authentic public repository is <https://github.com/AwsZoabi/ExamApp>. As
verified on 14 July 2026, it contains 22 commits, five closed issues, nine merged
pull requests, and these six branches:

- `main`
- `dev`
- `feature/student-take-exam`
- `feature/project2-teacher-pages`
- `feature/project2-auth-student`
- `gh-pages`

Examples include PR #14 (student exam submission flow), PR #13 (Project 2 final
version), PR #12 (teacher pages/exam management), and PR #11 (authentication and
student pages). This is real semester evidence and must be preserved. The tested
full-stack version should be added through
`feature/final-fullstack-submission` and merged to `main` only after its CI run
passes.

## Recommended branches

- `main`: reviewed, deployable code
- `develop`: integration branch
- `feature/client-professional-ui`
- `feature/server-auth-api`
- `feature/postgres-jsonb`
- `feature/testing`
- `feature/docker-microservices`
- `docs/final-submission`

## Pull-request rules

1. Link the PR to a Kanban issue.
2. Keep scope focused on one milestone.
3. Require green CI before merge.
4. Include screenshots for UI changes and API/test output for backend changes.
5. Prefer squash merge for a readable main history.

## Suggested Kanban columns

- Backlog
- Ready
- In progress
- In review
- Done

## Suggested milestones

1. `v0.1` React client and mock services
2. `v0.2` Express API and authentication
3. `v0.3` PostgreSQL/JSONB and Docker
4. `v0.4` Unit/integration tests and debugging
5. `v0.5` Microservices and CI/CD
6. `v1.0` Documentation, deployment and final submission

The source ZIP intentionally excludes `.git`, while the public repository keeps
the authentic history. Do not replace `main` with a force-push or fabricate old
dates. Add the final work through a normal branch, commit, pull request and green
CI run, then record those real links in `SUBMISSION.md`.
