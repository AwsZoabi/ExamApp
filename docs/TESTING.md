# Test Strategy

## Test pyramid

1. **Unit tests** validate scoring, validation, services and focused UI behavior.
2. **Repository tests** run against isolated JSON data and verify consistent persistence contracts.
3. **API integration tests** exercise Express routes with Supertest, JWTs and role rules.
4. **Component tests** exercise React forms, navigation, accessibility and state transitions with Testing Library.
5. **Container smoke tests** verify health and inter-service communication.

## Commands

From the repository root:

```powershell
npm.cmd --prefix client ci
npm.cmd --prefix server ci
npm.cmd --prefix client run lint
npm.cmd --prefix client run test -- --run
npm.cmd --prefix client run build
npm.cmd --prefix server run lint
npm.cmd --prefix server run test -- --run
npm.cmd --prefix server run check
```

Or run the verification orchestrator:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
```

## Microservices

```powershell
npm.cmd --prefix microservices/gateway test

cd microservices\scoring-service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m unittest -v
cd ..\..

dotnet build microservices\analytics-service\AnalyticsService.csproj --configuration Release
docker compose -f microservices\docker-compose.yml config --quiet
```

With Docker Desktop running:

```powershell
docker compose -f microservices\docker-compose.yml up --build --detach --wait
powershell -ExecutionPolicy Bypass -File .\microservices\scripts\smoke-test.ps1
docker compose -f microservices\docker-compose.yml down --volumes --remove-orphans
```

## Coverage expectations

Coverage is a diagnostic, not a substitute for meaningful scenarios. The project prioritizes:

- Authentication success/failure and safe responses
- Teacher/student role boundaries
- Exam CRUD and question validation
- Student-safe exam serialization
- Deterministic scoring and duplicate-attempt handling
- Dashboard aggregates and empty states
- API/mock service parity
- Loading, error and confirmation UI states

## Manual acceptance journeys

1. Sign in as the demo teacher, create an exam with two questions and publish it.
2. Sign out, sign in as the demo student, complete the exam and confirm the score.
3. Return as teacher and verify the new attempt and updated analytics.
4. Resize the browser to mobile width and repeat navigation/exam progress checks.
5. Switch `DATA_SOURCE=json`, restart the API and repeat health/exam reads.

