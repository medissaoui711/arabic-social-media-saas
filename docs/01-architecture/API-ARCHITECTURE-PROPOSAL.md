# API Architecture Proposal

## Conventions
- Versioned prefix: `/api/v1`.
- JSON request/response payloads; UTF-8.
- Server-side session authentication; browser requests use secure cookie semantics once session technology is approved.
- Workspace selection is explicit in route/resource context but validated against authenticated membership on every request.
- No database access from browser code.
- Consistent pagination, validation, and error response shape.
- Mutations require authorization and CSRF protection where cookie-authenticated browser requests are used.

## Proposed resource groups
- `/api/v1/session`: sign-in, current session, sign-out, password-reset lifecycle.
- `/api/v1/me`: current user profile and workspace memberships.
- `/api/v1/workspaces`: workspace list/create/detail/update.
- `/api/v1/workspaces/{workspaceId}/members`: membership listing and role/state changes.
- `/api/v1/workspaces/{workspaceId}/content`: content CRUD and explicit lifecycle transitions.
- `/api/v1/workspaces/{workspaceId}/media`: upload intent, finalize, metadata, authorized download.
- `/api/v1/workspaces/{workspaceId}/calendar`: calendar-range query.
- `/api/v1/workspaces/{workspaceId}/schedules`: create, reschedule, cancel, history.
- `/api/v1/workspaces/{workspaceId}/social-accounts`: metadata records only.
- `/api/v1/workspaces/{workspaceId}/audit-events`: permission-gated audit query.

These are proposed route groups; exact methods and schemas are Phase 02/feature specifications.

## Error envelope proposal
```json
{
  "error": {
    "code": "WORKSPACE_ACCESS_DENIED",
    "message": "The requested operation is not permitted.",
    "requestId": "opaque-correlation-id",
    "details": []
  }
}
```
Do not expose stack traces, SQL, secrets, internal storage paths, or whether another tenant owns a resource.

## Authorization sequence
1. Validate request shape and session.
2. Resolve actor from authenticated session.
3. Resolve workspace context and active membership server-side.
4. Authorize permission for action/resource.
5. Open transaction and set transaction-local tenant context.
6. Execute use case; rely on constraints/RLS as defense in depth.
7. Map known domain errors to stable status/code; log safe correlation metadata.

## API exclusions
No social-network OAuth routes, publishing endpoints, external analytics synchronization, billing, subscriptions, or public registration in P1.
