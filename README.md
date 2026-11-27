# Arabic Social Media Management SaaS

Arabic-first, responsive RTL social media management workspace. The application is a Next.js modular monolith with a shared API under `/api/v1` and PostgreSQL tenant isolation.

## Implemented application slice

- Next.js 15 + TypeScript application foundation.
- Arabic RTL login and content dashboard.
- One-time, token-protected first-owner bootstrap; public registration is not provided.
- Opaque random session tokens stored as SHA-256 hashes; HttpOnly, SameSite cookies.
- PostgreSQL schema for users, sessions, workspaces, memberships, content and audit events.
- Transaction-local workspace context and forced PostgreSQL RLS policies for membership, content and audit records.
- Workspace-scoped content creation, listing and status changes.
- Content statuses are limited to `draft`, `ready`, and `archived`; no `published` state.
- Unit validation tests and GitHub Actions verification workflow.

## Local development

Requirements: Node.js 20+, npm, Docker with Compose.

1. Copy `.env.example` to `.env` and replace every placeholder with local-only random values. Keep `.env` untracked.
2. Start PostgreSQL: `docker compose up -d db`.
3. Install dependencies: `npm install`.
4. Generate Prisma client: `npm run db:generate`.
5. Apply migrations using the migration-owner URL: `npm run db:deploy`.
6. Start the app: `npm run dev`.

The Compose initialization creates a dedicated `app_user` runtime role without superuser or BYPASSRLS privileges. `DATABASE_URL` must use that role; `DIRECT_URL` is only for schema migrations. Do not run the app with the migration-owner account.

## First owner bootstrap

The endpoint `POST /api/v1/bootstrap` is enabled only while the users table is empty and requires the configured `BOOTSTRAP_TOKEN` (minimum 32 characters). Submit `token`, `email`, `password` (minimum 12 characters), `displayName`, and `workspaceName`. This endpoint closes itself after the first successful account creation. Keep the token private and rotate/remove it after bootstrap.

## Internal scheduler\n\nThe authenticated internal scheduler endpoint is `POST /api/internal/scheduler/tick` and requires `Authorization: Bearer $SCHEDULER_TOKEN`. It claims due records with row locking and marks them `due`; it does not publish to social networks. Schedule local times are resolved with an IANA timezone and DST ambiguity is rejected.\n\n## Verification commands

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

Tests are not considered passed until executed in an environment with installed dependencies and PostgreSQL. CI is configured to run the verification commands on pushes and pull requests to `main`.

## Scope boundaries

P1 excludes external social publishing, social OAuth/API integrations, external analytics synchronization, billing/subscriptions, public registration, and native mobile applications. Internal social-account metadata, media management and calendar scheduling have initial code slices. Remaining P1 work includes hardening, owner-safe membership administration, password recovery, backup/restore, operational reliability, and full integration/acceptance verification.

See [MASTER-EXECUTION-DASHBOARD.md](MASTER-EXECUTION-DASHBOARD.md) for the approved Phase 00–16 execution sequence and evidence-based status.
