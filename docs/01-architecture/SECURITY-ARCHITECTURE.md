# Security Architecture — Proposal

## Trust boundaries
- Browser is untrusted; all authorization occurs on the server.
- Authenticated user identity comes only from a validated server session.
- Workspace context is accepted as a requested selector, then derived/validated through active membership.
- Database runtime role is constrained by grants and RLS.
- Media upload bytes are untrusted until content validation and safe processing complete.
- Background workers are privileged service actors with narrowly scoped job permissions and auditable actions.

## Authentication and sessions
- Passwords must be stored using a modern adaptive password hash; exact library/parameters are a stack ADR.
- Session cookies should be Secure, HttpOnly, SameSite-appropriate, rotated after authentication/privilege changes, and revocable server-side.
- Password reset tokens must be random, single-use, short-lived, stored hashed, and never logged.
- No public registration in P1.
- Administrative bootstrap must be a one-time controlled operation; no default credentials or public bootstrap endpoint.

## Authorization and tenant isolation
- Deny by default; enforce on every server-side operation.
- Membership status and role are rechecked for each workspace-scoped action.
- Use PostgreSQL RLS on tenant-owned tables and explicit workspace constraints.
- Runtime DB role must not own protected tables and must not have BYPASSRLS.
- Use transaction-local context (e.g. transaction-scoped setting) rather than connection-persistent tenant state.
- Begin transaction, set workspace context, execute queries, commit/rollback; pool reuse must not retain tenant identity.
- Test missing context, forged context, stale membership, cross-tenant IDs, pooled-connection reuse, and privileged-role paths.
- Protect the last active Workspace Owner with transactional locking/constraint strategy and race tests.
- Role changes are server-side, permission-checked, and audited.

## Media security
- Validate actual file content, not only extension or client MIME.
- Enforce allowlisted formats, size limits, safe filenames, checksum, and malware-scanning integration only if later approved.
- Store objects outside executable/public web roots; use opaque keys and authorized retrieval.
- Reject polyglot/unsupported files; avoid rendering untrusted HTML/SVG inline unless safely transformed.
- Storage provider and scanning service are undecided; no external provider is activated.

## Scheduling and worker security
- Atomic due-job claim and concurrency-safe locking.
- Unique idempotency key per schedule execution intent.
- Bounded retries, explicit terminal failure, immutable attempt history.
- Worker identity is distinct from end-user identity and cannot bypass workspace checks broadly.
- P1 scheduling is internal; it does not publish externally.

## Audit, secrets, and operations
- Audit login/security events, membership/role changes, content lifecycle transitions, media access/deletion, schedule changes, and administrative actions.
- Redact credentials, cookies, reset tokens, personal content bodies, and storage secrets from logs.
- Separate development, staging, and production credentials/environments.
- Backups encrypted and access-restricted; restore drills occur in isolated environments.
- Migrations are reviewed, forward-safe, and have documented rollback/forward-fix strategy.

## Threat scenarios to test
Cross-tenant IDOR; RLS bypass; connection-pool context leakage; last-owner removal race; privilege escalation; session fixation/replay; reset-token reuse; malicious file upload; duplicate worker execution; schedule retry duplication; audit tampering; backup restore leakage.
