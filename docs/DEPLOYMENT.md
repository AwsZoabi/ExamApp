# Deployment and Operations

## GitHub Pages client demo

The public repository deploys the React client to
<https://awszoabi.github.io/ExamApp/> using `.github/workflows/pages.yml`.
The workflow deliberately sets `VITE_DATA_SOURCE=mock` and
`VITE_ROUTER_MODE=hash`, because GitHub Pages is a static host and cannot run the
Express/PostgreSQL backend. This public demo proves the complete browser
experience; use the Docker deployment below to demonstrate the real API and
database.

In repository **Settings → Pages**, set **Source** to **GitHub Actions**. A push
to `main` then builds and deploys the client automatically.

## Local host development

1. Copy example configuration:

   ```powershell
   Copy-Item .env.example .env
   Copy-Item server\.env.example server\.env
   Copy-Item client\.env.example client\.env
   ```

2. Start PostgreSQL:

   ```powershell
   docker compose up -d postgres
   docker compose ps
   ```

3. Install and run API/client in separate terminals:

   ```powershell
   npm.cmd --prefix server ci
   npm.cmd --prefix server run dev
   ```

   ```powershell
   npm.cmd --prefix client ci
   npm.cmd --prefix client run dev
   ```

4. Open `http://localhost:5173`.

## Complete Docker stack

```powershell
Copy-Item .env.example .env
docker compose config --quiet
docker compose up --build --detach --wait
docker compose ps
```

- Client: `http://localhost:8080`
- API health: `http://localhost:4000/api/health`
- PostgreSQL: host port `5432`

Run the demonstration:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\demo.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\db-demo.ps1
```

Inspect operations:

```powershell
docker compose logs --no-color server
docker compose logs --no-color postgres
docker compose stats
```

Stop while preserving data:

```powershell
docker compose down --remove-orphans
```

Reset the local database (destructive):

```powershell
docker compose down --volumes --remove-orphans
docker compose up --build --detach --wait
```

## JSON fallback

To run the host API without PostgreSQL:

```env
DATA_SOURCE=json
JSON_DB_PATH=./data/db.json
```

Restart the server and verify `/api/health` reports JSON storage. The routes and response shapes remain the same.

## Remote PostgreSQL

Set a provider-owned connection and SSL policy in an untracked environment file:

```env
DATA_SOURCE=postgres
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DATABASE_SSL=require
```

Apply `database/001_schema.sql` and `database/002_seed.sql` once through the provider's SQL console or `psql`. Replace seeded demo accounts for a public environment.

## Docker Hub and production Compose

The publish workflow creates five images:

- `examapp-client`
- `examapp-server`
- `examapp-gateway`
- `examapp-scoring`
- `examapp-analytics`

Configure GitHub repository secrets before merging to `main`:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

Copy `.env.production.example` to an untracked `.env.production`, replace every
example credential and URL, then validate/pull:

```powershell
docker compose -f docker-compose.prod.yml --env-file .env.production config --quiet
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up --detach --wait
```

The production PostgreSQL service mounts `database/` as initialization scripts,
so a brand-new named volume receives the schema and academic seed once. Existing
volumes are never overwritten. A managed remote PostgreSQL database still needs
the manual schema/seed step described above.

## CI/CD stages

1. Pull request starts client/API lint, tests and builds.
2. Microservice tests validate Node, Flask and .NET.
3. Compose integration starts all microservices and runs a smoke test.
4. Merge/tag on `main` builds SBOM/provenance-enabled images and pushes immutable SHA tags plus `latest`.
5. Deployment host pulls the requested image tag with production Compose.

## Evidence for the lecturer

Capture authentic evidence showing:

- Green GitHub Actions jobs
- Docker Compose services and health states
- Browser login and teacher/student scenarios
- PostgreSQL JSONB query output
- Request logs with request IDs
- Docker Hub image repositories/tags
- Live deployment URL

Add the real links to `SUBMISSION.md`; do not submit placeholders as evidence.

## Rollback

- Keep an earlier immutable `sha-...` image tag.
- Set `IMAGE_TAG` to the known-good tag.
- Pull and recreate the client/server containers.
- Do not delete or downgrade the PostgreSQL volume without a tested backup and migration plan.
