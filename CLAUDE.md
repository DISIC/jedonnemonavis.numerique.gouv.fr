# CLAUDE.md — Je donne mon avis

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
```

### Database (from webapp-backoffice/)

```bash
npx prisma migrate dev      # Run pending migrations
npx prisma db seed          # Seed test data
npx prisma studio           # Open Prisma Studio
npm run db:reset            # Full test DB reset
```

### Tests

```bash
npx cypress run --browser firefox   # Headless E2E
npx cypress open                    # Interactive mode
npm run test:reset                  # Reset DB + run tests
```

### Infrastructure (docker)

```bash
docker compose up -d                          # Start ELK + PostgreSQL
docker compose -f docker-compose.tests.yaml up -d   # Full test environment
```

## Key patterns

### API (tRPC)

- Routers live in `webapp-backoffice/src/server/routers/` (20+ domain routers: `product`, `entity`, `form`, `review`, `export`, …)
- REST endpoints generated via `tRPC-OpenAPI` for third-party access
- Middleware chain: NextAuth session → JWT validation → API key check → event logging

### Database schema

- 40+ Prisma models in `webapp-backoffice/prisma/schema.prisma`
- Multi-tenant: `Entity` (organisations) with hierarchical access rights
- Configurable form templates with `FormTemplate`, `FormStep`, `FormBlock`, `FormBlockOption`
- `UserEvent` model for full audit trail (service_create, service_update, …)

### Component patterns

- Custom hooks in `src/hooks/`
- Context: `UserSettingsContext`, `AuthContext`, `FiltersContext`, `StatsContext`
- Translations via `next-i18next` (French only, `fr` locale)
- Forms via `react-hook-form`

### Data export flow

1. Backoffice queues an export (status: `idle → processing → done`)
2. Python exporter polls, generates CSV/XLS, uploads to S3 (Cellar)
3. Notification email sent via Nodemailer / MailPace

## Environment variables

Each app has its own `.env` (copy from `.env.example`). Key groups:

**webapp-backoffice:**

- `POSTGRESQL_ADDON_URI` — database connection string
- `ES_ADDON_URI / ES_ADDON_USER / ES_ADDON_PASSWORD` — Elasticsearch
- `NEXTAUTH_SECRET / JWT_SECRET` — auth secrets
- `NODEMAILER_*` — SMTP config
- `NEXT_PUBLIC_BO_APP_URL / NEXT_PUBLIC_FORM_APP_URL` — app URLs
- `PROCONNECT_*` — SSO credentials
- `INSEE_API_URL / INSEE_API_KEY` — French statistical institute

**webapp-form:**

- `POSTGRESQL_ADDON_URI`, `ES_ADDON_*`, `NEXT_PUBLIC_MATOMO_*`
- `IP_HASH_SALT` — privacy-preserving IP hashing
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
- Email templates developed with react-email (`webapp-backoffice/react-email/`)
