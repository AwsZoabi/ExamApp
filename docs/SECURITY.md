# Security Design

## Implemented controls

- Passwords are hashed with bcrypt; password hashes are never returned by the API.
- JWTs are signed with a required secret and have a finite lifetime.
- Role and ownership authorization is performed on the server, not trusted from client storage.
- Zod schemas validate request bodies and parameters.
- Helmet applies browser security headers.
- CORS accepts only configured origins.
- Authentication and general request rate limits reduce brute-force and abuse risk.
- Request body size is bounded.
- PostgreSQL queries are parameterized.
- Client errors receive safe messages and request IDs, not stack traces.
- Containers run as non-root users where practical.
- `.env`, access tokens, build output and runtime data are excluded from Git.

## Demo-account warning

The committed seed includes academic demo accounts with password `123456`. They are intentionally obvious test credentials and must not be reused in a public production environment. Disable or replace them before a real deployment.

## Production checklist

- Generate a long random `JWT_SECRET` and store it in the deployment secret manager.
- Use a managed PostgreSQL account with the minimum necessary privileges.
- Enable TLS and the correct `DATABASE_SSL` mode.
- Set `ALLOW_TEACHER_REGISTRATION=false`.
- Put the application behind HTTPS and a reverse proxy.
- Restrict CORS to the exact public client origin.
- Rotate Docker Hub/GitHub tokens and never paste them into source or recordings.
- Back up PostgreSQL and test restoration.

## Known scope boundaries

The academic project does not implement password recovery, email verification, MFA, institutional SSO or antivirus scanning. These are documented future improvements rather than falsely represented controls.

