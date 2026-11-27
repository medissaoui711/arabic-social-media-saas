# Module Boundary Specification — Proposal

## Boundary rules
1. Each module owns its domain model, invariants, and persistence contract.
2. Other modules may not mutate its tables directly.
3. Cross-module operations go through application interfaces/use cases.
4. Shared kernel is limited to stable primitives (IDs, clock abstraction, domain error types); do not place business workflows in shared utilities.
5. Every tenant-owned entity is scoped to one workspace.
6. External providers are accessed only through infrastructure ports; P1 does not integrate social networks.

## Modules and ownership

| Module | Owns | Exposes | Must not own |
|---|---|---|---|
| Identity & Sessions | credentials, password hashes, sessions, reset challenges | authenticate, revoke session, request/reset password | workspace role decisions |
| Users & Workspaces | user profile and workspace lifecycle | create workspace, update profile, resolve workspace metadata | membership authorization policy |
| Memberships & Access Control | memberships, role assignments, invitations only if later phase authorizes | membership lookup, authorize workspace action, role change | authentication credential storage |
| Content Studio | content items, drafts, readiness and archive transitions | create/update/ready/archive content | media bytes, social publishing |
| Media Management | media metadata, upload lifecycle, validation state | initiate/finalize upload, authorize media access | content lifecycle policy |
| Calendar & Scheduling | schedule entries, due claims, attempts/history, timezone resolution | schedule/cancel/claim/complete/fail | external publishing |
| Social Account Registry | internal social account labels/metadata | create/update/list metadata records | OAuth, token storage, platform API calls |
| Audit & Security | append-only sensitive-action events and security records | record/query authorized audit events | business ownership of other modules |
| Platform Operations | health, runtime config interfaces, jobs telemetry and recovery hooks | operational status and job controls | tenant business data ownership |

## Proposed relationships
- A workspace owns memberships, content, media metadata, schedules, and social-account metadata.
- A user may belong to multiple workspaces through separate membership records.
- Content may reference media owned by the same workspace only.
- A schedule references one content item in the same workspace and records a snapshot of scheduling intent.
- A social-account metadata record may be referenced by a schedule only if the product later adds an internal association; it does not trigger external publication in P1.
- Audit events identify actor, workspace (when applicable), action, target type/ID, timestamp, and safe metadata.

## Proposed application service contracts
- `IdentityService.authenticate(credentials)`
- `WorkspaceService.createWorkspace(actor, input)`
- `MembershipAuthorization.require(actor, workspace, permission)`
- `ContentService.transition(contentId, targetStatus, actor)`
- `MediaService.authorizeRead(mediaId, actor, workspace)`
- `SchedulingService.createOrReschedule(contentId, localDateTime, timeZone, actor)`
- `ScheduleWorker.claimDue(now)`
- `AuditRecorder.record(event)`

Names are illustrative contracts, not committed code APIs.

## Role model
Proposed initial roles: `owner`, `admin`, `editor`, `member`. Exact permission matrix remains subject to owner approval. Minimum invariants:
- Every workspace has at least one active owner.
- Only authorized server-side actions can grant/revoke roles.
- A user cannot remove or demote the last active owner.
- Membership state is checked on every workspace-scoped request.
