# Core Domain Model — Proposal

All IDs are opaque identifiers. Tenant-owned records carry `workspace_id`. Field lists are conceptual and require detailed schema approval in Phase 02.

## Identity and workspace
- **User:** id, email/normalized login identifier, display name, credential reference/hash metadata, account status, timestamps.
- **Session:** id, user_id, issued_at, expires_at, revoked_at, rotation metadata, safe client metadata.
- **Workspace:** id, name, status, created_by, timestamps.
- **Membership:** id, workspace_id, user_id, role, status, joined_at, created_at, updated_at. Unique active membership per (workspace_id,user_id).

## Content
- **ContentItem:** id, workspace_id, owner_user_id, title, body/caption, content status, created_at, updated_at, archived_at, optimistic concurrency version.
- Content status state machine: `draft → ready → archived`; permitted reverse transitions and editing restrictions must be specified before implementation. No `published` state in P1.
- **MediaAsset:** id, workspace_id, uploaded_by, storage_key (opaque), original_filename (sanitized), detected_media_type, byte_size, checksum, validation_state, processing_state, created_at, deleted_at.
- Content-to-media association must enforce same-workspace ownership at database and application layers.

## Scheduling
- **ScheduleEntry:** id, workspace_id, content_item_id, status, requested_local_datetime, timezone_iana, resolved_run_at_utc, created_by, created_at, updated_at, cancelled_at, completed_at, failure_code.
- **ScheduleAttempt:** id, workspace_id, schedule_entry_id, attempt_number, idempotency_key, claimed_at, finished_at, outcome, safe_error_code.
- Statuses are exactly `scheduled`, `cancelled`, `due`, `completed`, `failed`.
- Preserve schedule history; rescheduling creates a new version/entry or immutable history event rather than erasing prior intent.
- Store UTC execution instant and IANA timezone plus original local intent. DST gaps/folds require an explicit product policy before implementation.

## Social account metadata only
- **SocialAccountRecord:** id, workspace_id, platform_label, display_name, handle, profile_url (validated), notes, status, created_at, updated_at.
- Do not store OAuth credentials or platform access tokens. No API calls, external publishing, or analytics sync.

## Audit
- **AuditEvent:** id, workspace_id nullable for global identity events, actor_user_id nullable for system events, action, target_type, target_id, occurred_at_utc, correlation_id, safe_metadata, outcome.
- Audit records for sensitive operations are append-only from application roles; mutation/deletion policy requires explicit retention/legal decision.

## Database invariants
- Composite unique constraints and foreign keys enforce workspace consistency.
- RLS policies apply to tenant-owned tables.
- Workspace context is established transaction-locally and cleared automatically at transaction end.
- Runtime application role has no RLS bypass privileges.
- Administrative migration role is isolated from runtime credentials.
