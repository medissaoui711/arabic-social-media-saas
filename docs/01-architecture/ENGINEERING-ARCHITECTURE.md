# Engineering Architecture — Proposal
**Phase:** 01 — Engineering Architecture and Module Boundaries  
**Status:** PROPOSAL — not owner-approved  
**Architecture direction:** Modular Monolith, shared backend/API  
**API base path:** `/api/v1`

## 1. Goals
Deliver a maintainable Arabic-first RTL web SaaS with strict workspace isolation, clear domain ownership, testable application services, and reliable internal scheduling. Avoid premature microservices and avoid coupling domain logic to infrastructure providers.

## 2. Logical system shape
A single deployable application is organized into bounded modules. Modules expose application-level contracts and own their domain rules. Cross-module interaction uses explicit application services/events, not direct writes into another module's tables.

Logical layers:
1. **Presentation:** RTL web application, route handlers/controllers, request validation, response mapping.
2. **Application:** use cases, authorization checks, transaction orchestration, ports/interfaces.
3. **Domain:** entities, value objects, state transitions, invariants, domain events.
4. **Infrastructure:** PostgreSQL repositories, RLS context adapter, session/password hashing adapter, media adapter, job runner, clock, logging and telemetry adapters.

A single process/deployment may host web/API and worker entry points initially, while keeping worker execution and request handling logically separated. Separate deployment topology is an operational decision, not a microservice boundary.

## 3. Request flow
Browser → server route/controller → authenticate session → resolve requested workspace membership server-side → authorize action → establish transaction-scoped database workspace context → application use case → domain rules → repositories → PostgreSQL constraints/RLS → response mapper.

The client may select a workspace identifier as a requested context, but the server must validate active membership and derive the effective tenant context. A client-provided workspace ID is never authorization evidence.

## 4. Module map
- Identity & Sessions
- Users & Workspaces
- Memberships & Access Control
- Content Studio
- Media Management
- Calendar & Scheduling
- Social Account Registry (metadata only)
- Audit & Security
- Platform Operations

Detailed ownership is in [Module Boundary Specification](MODULE-BOUNDARY-SPECIFICATION.md).

## 5. Data architecture
PostgreSQL is a required architectural constraint because the approved security requirements explicitly require PostgreSQL RLS. The database provider, hosting model, version, and operational service remain unselected.

Tenant-owned rows carry `workspace_id` and use composite uniqueness/foreign-key constraints where cross-tenant references must be impossible. RLS is defense in depth, not a substitute for application authorization. Administrative/bypass roles must not be used by ordinary request paths.

## 6. API architecture
All public-to-the-application HTTP endpoints are versioned under `/api/v1`. The API remains server-owned; browser clients never access the database directly. Request/response contracts and error envelope are defined in [API Architecture Proposal](API-ARCHITECTURE-PROPOSAL.md).

## 7. Security architecture
See [Security Architecture](SECURITY-ARCHITECTURE.md). Authorization is server-side and deny-by-default. Tenant context is transaction-scoped. Sensitive actions are audited.

## 8. Background execution
Scheduling is an internal workflow only; it does not publish to external social networks. A due schedule is claimed atomically, processed idempotently, and transitions to completed or failed with immutable attempt/history records. Worker/queue technology is an open decision.

## 9. Media
Media module owns metadata, upload state, validation results, and workspace ownership. Byte storage is behind a port; provider and local-development strategy remain undecided. Untrusted uploads must be content-inspected and safely handled before use.

## 10. Observability and failure model
Use structured, redacted logs with correlation/request IDs; never log credentials, session tokens, raw reset tokens, or sensitive media contents. Expose health/readiness checks only when runtime foundation exists. Domain errors map to stable API error codes. Retryable background failures must be bounded and observable.

## 11. Architecture decisions requiring approval
- Application framework/runtime and frontend framework.
- PostgreSQL provider/hosting and migration tooling.
- Queue/worker implementation.
- Media storage provider and local development approach.
- Email delivery for reset flows, if needed.
No provider or paid product is selected in this proposal.
