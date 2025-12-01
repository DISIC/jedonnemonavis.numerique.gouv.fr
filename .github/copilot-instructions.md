# AI Agent Guide for this Repo (JDMA)

Use these project-specific notes to work effectively in this monorepo.

## Architecture

- Two Next.js apps:
  - `webapp-backoffice/` (Next 13, TRPC, NextAuth, Prisma, ELK) — Admin/back-office and public pages; serves TRPC and a TRPC-OpenAPI surface.
  - `webapp-form/` (Next 13, TRPC, Prisma) — Public-facing review form with rate limiting.
- Shared infra via Docker Compose: `elasticsearch`, `kibana`, `postgres`, optional `mailhog` in tests. See `docker-compose*.yaml`.
- Data layer: Prisma against PostgreSQL (`POSTGRESQL_ADDON_URI`), with seeds under `webapp-backoffice/prisma/seed.ts`. Zod types generated via `zod-prisma-types`.
- Search/analytics: Elasticsearch 8. TLS CA expected at `certs/ca/ca.crt`. Clients instantiated in TRPC context.
- API surface:
  - Internal TRPC: `webapp-backoffice/src/pages/api/trpc/[trpc].ts` with routers in `src/server/routers/**`.
  - OpenAPI mirror: `GET /api/open-api` (schema) and `GET /api/open-api/*` (endpoints) generated from TRPC via `trpc-openapi`. Base URL `NEXT_PUBLIC_BO_APP_URL`.

## Dev Workflows

- Root services (Elastic/Kibana/Postgres):
  - Copy env: `cp .env.example .env`
  - Start: `docker compose up -d`
  - First ELK run: set Kibana system password, copy CA to `webapp-form/certs/ca/ca.crt` per root README.
- Backoffice app:
  - `cd webapp-backoffice && cp .env.example .env`
  - Install: `yarn`
  - DB init: `npx prisma migrate dev && npx prisma db seed`
  - Run: `yarn dev` (http://localhost:3000)
  - Tests (Cypress): `npx cypress run --browser firefox` (or `npm run test` for Chrome headed)
- Form app:
  - `cd webapp-form && cp .env.example .env && yarn && yarn dev` (http://localhost:3001)
- Full local test stack (includes Mailhog, DB, both apps):
  - Linux/Intel: `docker compose -f docker-compose.tests.yaml up -d`
  - macOS/Apple Silicon: `docker compose -f docker-compose.tests.macos.yaml up -d`

## Conventions & Patterns

- TRPC context builds Prisma and Elasticsearch clients and includes auth/session data:
  - Backoffice: `src/server/trpc.ts` adds `session`, `prisma`, `elkClient`, auth middlewares: `protectedProcedure`, `protectedApiProcedure` (API key), with event logging via `userEvent` based on router meta.
  - Form: `src/server/trpc.ts` adds request, `prisma`, `elkClient`, a rate-limiter middleware (`limitedProcedure`) using IP headers and `LimiterReporting`.
- Auth:
  - NextAuth credentials + optional ProConnect OpenID in `webapp-backoffice/src/pages/api/auth/[...nextauth].ts`.
  - JWT backed sessions; route gate in `src/middleware.ts` redirects `/administration/*` to `/login` if no token.
- OpenAPI endpoints (used by partners): defined in `webapp-backoffice/src/server/routers/openapi.ts`; require `Authorization: Bearer <apiKey>` for `protectedApiProcedure`. Health route is public procedure but marked protect=true for OpenAPI exposure.
- Emails: SMTP via env `NODEMAILER_*`; dev/test uses Mailhog (`http://localhost:8025`).
- Prisma:
  - Client singleton at `src/utils/db.ts` in both apps.
  - Schemas at `prisma/schema.prisma` (duplicated across apps). Seeds at `webapp-backoffice/prisma/seed.ts`.
- Cypress:
  - Config in `webapp-backoffice/cypress.config.ts` with `baseUrl` bound to `NEXTAUTH_URL`.
  - Suites live under `webapp-backoffice/cypress/e2e/jdma/**`; coverage documented in `docs/cypress-test-coverage.md`.
- Lint/format: Prettier via `yarn format` / `yarn lint`, run on pre-commit via Husky.

## Integration Notes

- Elasticsearch TLS: If `certs/ca/ca.crt` exists the clients enable TLS (`rejectUnauthorized: false`); ensure `ES_ADDON_URI`, `ES_ADDON_USER`, `ES_ADDON_PASSWORD` are set. The CA is also mounted into Kibana via Docker volumes.
- Exports pipeline: `python_exporter/main.py` connects to Postgres, builds CSV/XLS(X) reports, uploads to S3-compatible storage (CELLAR), and emails links via SMTP. Requires envs listed at top of the script; exposes a simple HTTP trigger on `:8080`.
- Notifications & stats helpers: see `webapp-backoffice/src/utils/{stats,notifs,emails,mailer}.ts` used by `openapi.ts`.

## How to Add/Modify Endpoints

- Backoffice TRPC:
  - Create/extend routers in `webapp-backoffice/src/server/routers/*`.
  - Use `protectedProcedure` for session-based auth (admin via `meta: { isAdmin: true }`).
  - For partner APIs, use `protectedApiProcedure` and add OpenAPI metadata under `.meta.openapi`.
  - Register in `routers/root.ts` and, if OpenAPI, the schema auto-exposes under `/api/open-api`.
- Database changes:
  - Edit `webapp-backoffice/prisma/schema.prisma` (and mirror to `webapp-form` if shared), then: `npx prisma migrate dev` and update seeds/types.

## Env Vars (common highlights)

- DB: `POSTGRESQL_ADDON_URI`
- Auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `JWT_SECRET`, `NEXT_PUBLIC_BO_APP_URL`
- Email: `NODEMAILER_HOST`, `NODEMAILER_PORT`, `NODEMAILER_USER`, `NODEMAILER_PASSWORD`, `NODEMAILER_FROM`
- Elasticsearch: `ES_ADDON_URI`, `ES_ADDON_USER`, `ES_ADDON_PASSWORD`
- Form rate limit: `LIMITER_ALLOWED_IPS`, `IP_HASH_SALT`

## Useful Examples

- Example TRPC procedure with admin guard:
  - `protectedProcedure.meta({ isAdmin: true }).mutation(async ({ ctx, input }) => { /* ... */ })`
- Example OpenAPI route:
  - In router: `.meta({ openapi: { method: 'POST', path: '/stats', protect: true, enabled: true } })`
  - Call with header: `Authorization: Bearer <apiKey>` against `${NEXT_PUBLIC_BO_APP_URL}/api/open-api/stats`.

When something is unclear (e.g., missing envs or failing migrations), check the root `README.md`, `docker-compose*.yaml`, and `docs/cypress-test-coverage.md` for validated flows. Keep changes minimal and aligned with existing patterns.
