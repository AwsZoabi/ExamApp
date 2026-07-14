# Client and Server Debugging

The repository includes `.vscode/launch.json` and `.vscode/tasks.json` for separate or combined debugging.

## Prepare

```powershell
Copy-Item .env.example .env
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
npm.cmd --prefix server ci
npm.cmd --prefix client ci
docker compose up -d postgres
```

Start the client task (`npm run dev` in `client`) before launching the browser debugger.

## Configurations

- **Debug API server:** starts Node with source-level breakpoints and the server environment file.
- **Debug React client:** opens Chrome at `http://localhost:5173` with Vite source maps.
- **Debug full stack:** compound configuration that attaches both.

## Required demonstration scenarios

### Scenario A: Teacher creates an exam

Suggested breakpoints:

- Client submit handler in the exam editor
- API exam controller create action
- Exam service validation/normalization
- Repository insert method

### Scenario B: Student submits answers

Suggested breakpoints:

- Client final submission handler
- Submission route/controller
- Server-side score calculation
- Repository submission write

### Scenario C: Teacher loads results

Suggested breakpoints:

- Results page data loader
- Results/dashboard controller
- Repository aggregate/query method

The recording should show variables, call stack, request payload and the final browser state. Never display the JWT secret or a production database URL.

## Common issues

- Use `npm.cmd` when PowerShell execution policy blocks `npm.ps1`.
- Host Node connects to Docker PostgreSQL via `localhost:5432`; a container connects via `postgres:5432`.
- If SQL initialization changed, use `docker compose down -v` before recreating the database. This deletes local container data.
- If ports are busy, stop the conflicting process rather than silently changing the assignment's documented ports.

