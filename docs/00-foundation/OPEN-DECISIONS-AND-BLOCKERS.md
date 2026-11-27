# Open Decisions and Blockers
**Updated:** 2026-11-27  
**Owner authority:** Human project owner

## Owner-dependent confirmations
| ID | Decision / confirmation | Current state | Why it matters |
|---|---|---|---|
| OWN-001 | Confirm whether any prior project work exists outside this GitHub repository | UNKNOWN — owner confirmation required | Avoid losing or duplicating project assets |
| OWN-002 | Confirm project-related services, accounts, subscriptions, or financial commitments already exist | UNKNOWN — owner confirmation required | Accurate environment and cost inventory; do not access unrelated personal accounts |
| OWN-003 | Confirm whether historical ID `1473688902` and commit prefix `4a4014e...` relate to this project | UNKNOWN — original evidence unavailable | Historical provenance and residual risk |
| OWN-004 | Select/approve application framework and runtime | OPEN — recommendation required | Needed before Phase 02 dependency installation and project scaffold |
| OWN-005 | Select/approve frontend framework and UI strategy | OPEN — recommendation required | Needed before Phase 02/03 implementation |
| OWN-006 | Approve database operating model/provider (PostgreSQL is required by the security constraint; provider is undecided) | OPEN | Required for provisioning and migration execution |
| OWN-007 | Approve background worker/queue execution approach | OPEN | Required for reliable scheduling and duplicate-execution prevention |
| OWN-008 | Approve media storage operating model/provider | OPEN | Required before real media persistence and upload implementation |
| OWN-009 | Approve email/password-reset delivery approach, if external delivery is needed | OPEN | No email provider may be activated without approval |

## Technical constraints already approved by the owner
- Modular Monolith with shared backend/API.
- API versioning under `/api/v1`.
- Arabic-first responsive RTL web SaaS.
- Workspace context derived from authenticated membership.
- PostgreSQL RLS and workspace-scoped constraints are required security controls.
- P1 scope and exclusions are fixed as recorded in the dashboard.
- No paid service, external account, domain, hosting, API key, or production deployment without separate approval.

## Non-negotiable engineering risks
- RLS bypass and privileged database roles can defeat tenant isolation if session context and database grants are not designed/tested correctly.
- Connection-pool reuse can leak workspace context unless each transaction sets and clears context safely.
- Owner-removal/role-change races can leave a workspace without an owner unless protected transactionally.
- Scheduling retries and concurrent workers can duplicate execution unless locking/idempotency/history are designed together.
- DST gaps/folds can produce incorrect local-time scheduling unless local intent, IANA timezone, and resolved UTC instant are stored with explicit policy.
- File extension/MIME checks alone do not establish actual content type; content inspection and safe processing are required.
- Backup success is not established until isolated restore tests are executed.

## Work that can continue without owner choices
- Refine logical module boundaries and domain invariants.
- Specify API conventions and error contract without binding to a framework.
- Specify RLS, membership authorization, audit and scheduling invariants.
- Define test cases and acceptance criteria.
- Prepare ADRs with alternatives and cost/risk comparisons.

## Stop conditions
Do not install dependencies, provision databases/storage/queues, create external accounts, activate providers, deploy, or incur costs until the relevant decisions are approved.
