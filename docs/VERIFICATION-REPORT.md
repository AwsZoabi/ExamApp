# Prepared-Submission Verification Report

This report records the checks completed on the clean project source before the
submission archive was created.

## Automated results

| Area | Result |
| --- | --- |
| React lint | Passed with zero warnings |
| React component/service/page tests | 12 of 12 passed |
| React production build | Passed; 54 modules transformed |
| GitHub Pages mock/hash production build | Passed; 54 modules transformed |
| Express lint and syntax check | Passed; 28 source files parsed |
| Express API/repository tests | 7 of 7 passed |
| Node gateway syntax and tests | Passed; 7 of 7 tests |
| Python Flask scoring tests | Passed; 7 of 7 tests |
| Python dependency consistency | Passed; no broken requirements |
| .NET analytics build | Passed; 0 warnings and 0 errors |
| npm dependency security audits | Passed; 0 known vulnerabilities in all four Node projects |
| Development Compose configuration | Valid |
| Production Compose configuration | Valid |
| Development microservices Compose configuration | Valid |
| Production microservices Compose configuration | Valid |

Total automated behavioral tests: **33 passed, 0 failed**.

The final source audit also confirmed that all JSON files parse, all relative
Markdown links resolve, and no runtime `.env` files, private keys, token-shaped
values, stale local paths, unfinished TODO markers, or generated dependency/build
folders are present. The remaining `REPLACE_ME` fields are deliberate
student-owned account details and public links documented in `SUBMISSION.md`.

## End-to-end API smoke test

The real Express application was started in JSON mode against an isolated copy
of the seed data. The test verified:

- health readiness and request IDs;
- teacher and student authentication;
- role-specific dashboards;
- teacher exam creation and publication;
- student-safe exam responses without correct-answer leakage;
- server-side submission scoring;
- student, teacher, and per-exam result history;
- dashboard metrics updating after the new attempt.

The isolated test data was removed afterward; repository seed data was not
modified.

## Browser acceptance review

The React application was reviewed in a real browser against the real Express
API using an isolated JSON database. The journey covered teacher login, exam
creation, publishing, editing, student login, timed completion, server scoring,
historical review, teacher results, and updated dashboard metrics. Desktop and
390-pixel mobile layouts were checked, including the mobile navigation drawer
and horizontal-overflow measurements. No browser warnings or errors remained.

The already-running Docker microservices were also exercised live over HTTP and
through all four Gateway buttons: aggregate health, Flask score calculation,
.NET analytics, and the combined demonstration. Every response succeeded and
the Gateway browser console remained clean.

The GitHub Pages production configuration was also built with the repository
base path, mock-data adapter and hash router. The generated static bundle was
served under `/ExamApp/`; teacher and student logins both reached their correct
workspaces at `#/teacher` and `#/student`, and the browser console remained
clean. This confirms that the public Pages workflow can deploy the complete
client demo without requiring the Express API on a static host.

## Defects found and resolved

- Corrected the Gateway dashboard's embedded newline escape, which previously
  prevented its browser interaction script from parsing.
- Normalized client exam payloads for the strict API schema, preserving valid
  numeric question IDs while removing read-only response metadata.
- Limited submission payloads to the server-supported answers contract.
- Corrected singular result labels (`1 question`, `1 student passed`).
- Added regression tests for the Gateway script, API payload contracts, and
  result-label grammar.

## Student-owned final evidence

All Compose files were statically validated. The preparation sandbox could not
control Docker's Windows named pipe, so it could not itself rebuild or launch
containers. The user-started microservice containers were nevertheless verified
live through their exposed ports and browser Gateway. Before submission, run the
complete core Compose build and the supplied smoke scripts from a normal terminal
with Docker Desktop, then capture authentic evidence and link the real GitHub
Actions and Docker Hub results in `SUBMISSION.md`.
