# Testing and Quality Strategy — Proposal

## Test layers
1. **Domain unit tests:** state transitions, invariants, timezone resolution, role policy, validation.
2. **Application tests:** use-case orchestration, permission checks, transaction boundaries, audit emission.
3. **Database integration tests:** migrations, constraints, RLS policies, runtime-role grants, tenant isolation.
4. **API integration tests:** authentication, authorization, validation, error mapping, pagination, CSRF where applicable.
5. **Frontend tests:** RTL rendering, keyboard/accessibility behavior, form validation, responsive interaction.
6. **Worker tests:** concurrent claims, idempotency, retries, crash recovery, immutable history.
7. **Security tests:** cross-tenant access, RLS bypass attempts, pool reuse, last-owner race, session/reset protections, upload content spoofing.
8. **Operational tests:** backup restore in isolated environment, migration rollback/forward recovery, readiness/health behavior.
9. **End-to-end acceptance:** complete workspace/content/media/calendar journeys without external social publishing.

## Required scenarios
- User cannot access another workspace by guessing an identifier.
- A user with revoked membership loses access immediately on subsequent requests.
- Runtime DB role cannot bypass RLS.
- Missing tenant context returns no tenant data.
- Connection reuse cannot leak prior tenant context.
- Last active owner cannot be removed/demoted, including concurrent requests.
- Content lifecycle accepts only approved statuses: draft, ready, archived.
- Schedule status transitions are constrained to the approved set.
- Repeated worker delivery cannot complete the same schedule twice.
- DST gap/fold handling follows an approved policy and is deterministic.
- Spoofed MIME/extension does not bypass actual file-content validation.
- Audit events exist for sensitive changes and do not contain secrets.

## Quality gates
- Type/static checks and formatting once stack is approved.
- Unit and integration suite for changed modules.
- Database migration validation against clean and upgrade paths.
- Security tests for each authorization/tenant-sensitive change.
- No test may be marked passed without captured command/result.
- Phase completion report lists executed commands, environment, counts, failures, and commit SHA.

## Test data
Use synthetic fixtures only. Never import real customer data.
