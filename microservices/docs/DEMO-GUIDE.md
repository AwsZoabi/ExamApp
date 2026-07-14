# Microservices demo guide

Target duration: **90–120 seconds**.

## Before recording

- Open a terminal in `ExamApp-Final/microservices`.
- Make terminal and browser text readable.
- Ensure ports 3000, 5001, and 5002 are free.
- Hide notifications, `.env`, tokens, and unrelated personal information.

## Recording sequence

1. Show `docs/architecture.md` and identify the Node, Flask, and .NET services.
2. Run:

   ```powershell
   docker compose up --build --detach --wait
   docker compose ps
   ```

3. Point out three healthy containers and the exact port mappings.
4. Open `http://localhost:3000`.
5. Click **Check all services**, **Calculate score**, **Load analytics**, then **Run full demo**.
6. Explain that the gateway uses Docker service names, not `localhost`, for downstream calls.
7. Run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
   ```

8. Show the successful microservices job in the root CI workflow and the three published Docker Hub repositories.
9. Stop the system with `docker compose down`.

Visible evidence should include service health, score `80`, analytics average `74.8`, the green smoke-test output, CI status, and published image names.
