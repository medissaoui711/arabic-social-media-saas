# Arabic Social Media Management SaaS

Arabic-first responsive RTL workspace for social media content management. The application is a Next.js modular monolith with a shared API under `/api/v1` and PostgreSQL tenant isolation.

## Implemented code slices

- Next.js 15 + TypeScript foundation and Arabic RTL responsive dashboard.
- One-time first-owner setup at `/setup`; public registration remains disabled.
- Argon2id password hashing, opaque random sessions stored as SHA-256 hashes, HttpOnly/SameSite cookies, and persistent login throttling.
- Users, workspaces, memberships and server-enforced workspace RBAC.
- Forced PostgreSQL RLS for tenant-owned records, transaction-local workspace context, and a dedicated runtime DB role without superuser or `BYPASSRLS`.
- Workspace-scoped content create/list/edit/status APIs; content statuses are exactly `draft`, `ready`, and `archived`.
- Secure media upload/list/download with actual file-signature detection, 20 MB size limit, SHA-256 metadata and private local storage.
- Internal calendar API/UI with IANA timezone conversion, DST gap/fold rejection, idempotency keys, append-only schedule history and a `FOR UPDATE SKIP LOCKED` due worker.
- Internal social-account metadata CRUD only; no OAuth credentials or platform integrations.
- Last-Workspace-Owner protection for membership role changes/removal.
- Append-only audit and schedule event history, security response headers, unit tests and PostgreSQL tenant-isolation integration tests.

## Local development

Requirements: Node.js 20+, npm, Docker with Compose.

1. Copy `.env.example` to `.env` and replace every placeholder with local-only random values. Keep `.env` untracked.
2. Start PostgreSQL: `docker compose up -d db`.
3. Install dependencies: `npm install`.
4. Generate Prisma client: `npm run db:generate`.
5. Apply migrations using the migration-owner URL: `npm run db:deploy`.
6. Start the app: `npm run dev`.
7. Open `http://localhost:3000/setup` to create the first owner, then sign in at `/login`.

Compose initialization creates a dedicated `app_user` runtime role without superuser or `BYPASSRLS` privileges. `DATABASE_URL` must use that role; `DIRECT_URL` is only for schema migrations. Never run the application with the migration-owner account.

## First owner bootstrap

The `POST /api/v1/bootstrap` endpoint is enabled only while the users table is empty and requires `BOOTSTRAP_TOKEN` (minimum 32 characters). The setup page submits `token`, `email`, `password` (minimum 12 characters), `displayName`, and `workspaceName`. The endpoint closes itself after the first successful account creation. Remove or rotate the bootstrap token after setup.

## Internal scheduler

The internal endpoint `POST /api/internal/scheduler/tick` requires `Authorization: Bearer $SCHEDULER_TOKEN`. It claims due records with row locking and marks them `due`; it does not publish to social networks. Local schedule times are resolved with an IANA timezone and ambiguous/nonexistent DST times are rejected.

## Local database backup and restore

- Create a local custom-format backup: `bash scripts/backup-db.sh`.
- Restore a backup over the local development database only: `CONFIRM_LOCAL_RESTORE=YES bash scripts/restore-db.sh backups/<backup-file>.dump`.

Restore is destructive to the local development database and requires the explicit confirmation variable. Backup/restore scripts have been committed but have not been executed or restore-tested in this environment.

## Verification commands

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

Tests are not considered passed until actually executed in an environment with installed dependencies and PostgreSQL. The GitHub Actions workflow runs these checks on pushes and pull requests to `main`.

## Current limitations

- Local filesystem media storage is a development adapter; durable production storage and backup/restore are not implemented.
- Password recovery, complete session lifecycle controls, invitations, and member invitation flows remain incomplete.
- Scheduler worker claims and records due events; it does not publish externally or deliver outbound notifications.
- Media malware scanning and image/video transcoding are not implemented.
- Full end-to-end, load, recovery and production-readiness verification remains outstanding.

## Scope boundaries

P1 excludes external social publishing, social OAuth/API integrations, external analytics synchronization, billing/subscriptions, public registration, and native mobile applications. No paid provider, external account, production deployment or customer data is used.

See [MASTER-EXECUTION-DASHBOARD.md](MASTER-EXECUTION-DASHBOARD.md) for the approved Phase 00–16 sequence and evidence-based status.\n\nThe Arabic RTL interface follows selected guidance from [unslop by Damir Sokolovsky](https://github.com/heydamir/unslop), licensed CC BY 4.0. No source code, assets or skill files were copied; see [third-party attribution](docs/third-party/UNSLOP-ATTRIBUTION.md).
