# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

French government digital feedback platform (`jedonnemonavis.numerique.gouv.fr`). Citizens leave reviews on public digital services; administrators analyze results in a backoffice.

## Repository structure

Monorepo with two Next.js apps sharing a PostgreSQL database:

```
webapp-backoffice/   Next.js admin + analytics interface (port 3000)
webapp-form/         Next.js public-facing feedback form (port 3001)
python_exporter/     Python service for CSV/XLS exports and email notifications
migration-scripts/   Database migration utilities
docker/              Elasticsearch + Kibana configuration
docs/                Project documentation
```

## Tech stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| Framework | Next.js 13.5 (App Router + Pages Router mixed)   |
| Language  | TypeScript, React 18                             |
| API       | tRPC v10 + tRPC-OpenAPI (REST compatibility)     |
| ORM       | Prisma v5 + Zod (zod-prisma-types)               |
| Database  | PostgreSQL 16                                    |
| Search    | Elasticsearch 8                                  |
| Auth      | NextAuth.js v4, ProConnect (SSO), bcrypt         |
| UI        | DSFR (`@codegouvfr/react-dsfr`) + Material UI v5 |
| Testing   | Cypress (E2E + accessibility via cypress-axe)    |
| Analytics | Matomo                                           |
| Export    | Python: pandas, XlsxWriter, boto3 (S3/Cellar)    |

## Common commands

All commands run from within each app's directory (`webapp-backoffice/` or `webapp-form/`).

```bash
yarn dev          # Start dev server
yarn build        # Production build
yarn lint         # ESLint
yarn format       # Prettier
yarn type-check   # TypeScript check without emit
```

### Database (from webapp-backoffice/)

```bash
npx prisma migrate dev      # Run pending migrations
npx prisma generate         # Regenerate client after schema change (run in both apps)
npx prisma db seed          # Seed test data
npx prisma studio           # Open Prisma Studio
npm run db:reset            # Full test DB reset (migrate reset --force + seed)
```

### Tests (from webapp-backoffice/)

```bash
npx cypress run --browser firefox                          # Headless E2E
npx cypress run --browser firefox --spec "cypress/e2e/jdma/path/to/spec.cy.ts"  # Single spec
npx cypress open                                           # Interactive mode
npm run test:reset                                         # Reset DB + run all tests
```

### Infrastructure (docker)

```bash
docker compose up -d                                        # Start ELK + PostgreSQL
docker compose -f docker-compose.tests.yaml up -d          # Full test env (Linux/Intel)
docker compose -f docker-compose.tests.macos.yaml up -d    # Full test env (macOS/Apple Silicon)
```

Dev email (Mailhog) is available at `http://localhost:8025` when using the test compose stack.

## Key patterns

### API (tRPC)

- Routers live in `webapp-backoffice/src/server/routers/` (20+ domain routers: `product`, `entity`, `form`, `review`, `export`, …)
- All routers must be registered in `routers/root.ts`
- REST endpoints generated via `tRPC-OpenAPI` for third-party access; add `.meta({ openapi: { method, path, protect, enabled } })` to expose a procedure
- Middleware chain: NextAuth session → JWT validation → API key check → event logging
- Procedure types:
  - `protectedProcedure` — session-based auth; add `meta: { isAdmin: true }` to restrict to admins
  - `protectedApiProcedure` — API key auth for partner-facing OpenAPI endpoints
- Form app uses `limitedProcedure` (rate-limited by hashed IP) instead of `protectedProcedure`
- Throw errors as `throw new TRPCError({ code: 'BAD_REQUEST', message: '...' })`

### Database schema

- 40+ Prisma models in `webapp-backoffice/prisma/schema.prisma`
- **The schema is duplicated in `webapp-form/prisma/schema.prisma`** — mirror any changes to both, then run `npx prisma generate` in both apps
- Multi-tenant: `Entity` (organisations) with hierarchical access rights
- Configurable form templates with `FormTemplate`, `FormStep`, `FormBlock`, `FormBlockOption`
- `UserEvent` model for full audit trail (service_create, service_update, …)
- Prisma client singleton at `src/utils/db.ts` in both apps — never instantiate directly in components

### UI conventions

- Use DSFR utility classes via `fr.cx('fr-container', 'fr-mt-4v')` — never write raw spacing/layout CSS
- Custom styles use `tss.withName('ComponentName').create(() => ({ ... }))` from `tss-react`
- DSFR components (Header, Button, etc.) render semantic HTML with built-in roles; wrap decorative previews in a container with `inert` to exclude from the a11y tree
- The widget floating trigger (`jdma-modal-widget.js`) always appends to `<body>` for `position: fixed` to be viewport-relative

### Form app rendering modes

The public form page (`webapp-form/src/pages/[id].tsx`) reads `router.query.mode`:
- `mode=preview` → preview mode (disables submission)
- `mode=widget` → embedded in the floating widget panel (strips chrome)

### Component patterns

- Custom hooks in `src/hooks/`
- Context: `UserSettingsContext`, `AuthContext`, `FiltersContext`, `StatsContext`, `RootFormTemplateContext`, `OnboardingContext`
- Translations via `next-i18next` (French only, `fr` locale)
- Forms via `react-hook-form`

### Data export flow

1. Backoffice queues an export (status: `idle → processing → done`)
2. Python exporter (`python_exporter/main.py`) polls via HTTP trigger on `:8080`, generates CSV/XLS, uploads to S3 (Cellar)
3. Notification email sent via Nodemailer / MailPace

## Code style

- File names: kebab-case (`user-details-form.tsx`); exported React components: PascalCase
- Imports: React → external libs → internal utils/types/components; use `@/` absolute paths
- tRPC procedure names: verb-prefixed (`user.update`, `form.publish`)
- Use `ctx.prisma` in tRPC context; never import the Prisma client directly in components or pages

## Environment variables

Each app has its own `.env` (copy from `.env.example`). Key groups:

**webapp-backoffice:**

- `POSTGRESQL_ADDON_URI` — database connection string
- `ES_ADDON_URI / ES_ADDON_USER / ES_ADDON_PASSWORD` — Elasticsearch
- `NEXTAUTH_SECRET / JWT_SECRET / NEXTAUTH_URL` — auth
- `NODEMAILER_*` — SMTP config
- `NEXT_PUBLIC_BO_APP_URL / NEXT_PUBLIC_FORM_APP_URL` — app URLs
- `PROCONNECT_*` — SSO credentials
- `INSEE_API_URL / INSEE_API_KEY` — French statistical institute (SIRET validation)

**webapp-form:**

- `POSTGRESQL_ADDON_URI`, `ES_ADDON_*`, `NEXT_PUBLIC_MATOMO_*`
- `IP_HASH_SALT` — privacy-preserving IP hashing (hourly rotation)
- `LIMITER_ALLOWED_IPS` — comma-separated IPs/ranges that bypass rate limiting
- `NEXT_PUBLIC_AB_TESTING` — A/B test flag

**Root `.env` (ELK):**

- `ES_ADDON_PASSWORD`, `KIBANA_PASSWORD`, `ES_ADDON_URI`

## First-time setup

```bash
# 1. Copy env files
cp .env.example .env
cd webapp-backoffice && cp .env.example .env && cd ..
cd webapp-form && cp .env.example .env && cd ..

# 2. Start infrastructure
docker compose up -d

# 3. Install dependencies and initialise DB
cd webapp-backoffice
yarn install
npx prisma migrate dev
npx prisma db seed
yarn dev   # port 3000

# 4. In another terminal
cd webapp-form
yarn install
yarn dev   # port 3001
```

## Notable conventions

- Pre-commit hooks via Husky + lint-staged enforce ESLint + Prettier
- Lighthouse CI (`lighthouserc.js`) monitors performance in CI
- Elasticsearch TLS: the CA cert must be copied from the Docker container before `webapp-form` can connect (`docker cp elasticsearch:/usr/share/elasticsearch/config/certs/ca/ca.crt webapp-form/certs/ca/ca.crt`)
- Email templates developed with react-email (`webapp-backoffice/react-email/`); preview server via `yarn dev` inside that directory

## Troubleshooting

- **TRPC type errors after schema change**: run `npx prisma generate` in both apps, then `yarn type-check`
- **Cypress "Document is not focused"** on clipboard tests: stub with `cy.stub(win.navigator.clipboard, 'writeText').resolves()`
- **"Form not found" in review page**: forms must be in published status; check `form.isPublished` in DB
- **DB migrations fail**: run `npm run db:reset` to wipe and reseed; check `prisma/migrations/` for naming conflicts
- **Elasticsearch TLS errors**: ensure `certs/ca/ca.crt` exists; copy from the elasticsearch container if missing
