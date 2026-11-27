# Phase 01 — Acceptance Criteria

Phase 01 may be recommended for owner acceptance only when all criteria have traceable artifacts and unresolved choices are explicit.

| ID | Acceptance criterion | Evidence |
|---|---|---|
| ARC-01 | Modular Monolith and shared backend/API are defined without microservice drift | Engineering Architecture |
| ARC-02 | Every P1 module has ownership, responsibilities, interfaces, and prohibited cross-boundary behavior | Module Boundary Specification |
| ARC-03 | Core entities, tenant ownership, lifecycle states, and invariants are defined | Core Domain Model Proposal |
| ARC-04 | API versioning and authorization sequence are defined under `/api/v1` | API Architecture Proposal |
| ARC-05 | Authentication, membership authorization, RLS, bypass prevention, and pool isolation are specified | Security Architecture |
| ARC-06 | Scheduling idempotency, concurrency, UTC/IANA timezone and DST requirements are specified | Domain Model + Security Architecture |
| ARC-07 | Media trust boundary and actual content validation are specified | Security Architecture |
| ARC-08 | Audit, observability, failure handling, backup and restore expectations are specified | Architecture + Security |
| ARC-09 | Test layers and mandatory negative/security scenarios are defined | Testing and Quality Strategy |
| ARC-10 | Every unresolved technology/provider choice is in ADR register with alternatives, impacts, and required owner decision | ADR directory |
| ARC-11 | P1 exclusions and exact content/scheduling status enums are preserved | Dashboard + Domain Model |
| ARC-12 | No unapproved paid provider, service, external integration, or production commitment is introduced | ADR register + repository review |

Owner acceptance remains a separate explicit decision.
