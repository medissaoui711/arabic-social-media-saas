# ADR-0004: PostgreSQL Provider and Migration Tooling
**Status:** PROPOSED — OWNER DECISION REQUIRED  
**Date:** 2026-11-27

## Fixed constraint
PostgreSQL with RLS is required. Provider/hosting and migration tooling are not selected.

## Options
- Self-managed PostgreSQL: maximum control, higher operational and backup responsibility.
- Managed PostgreSQL service: lower operational burden, provider cost and vendor dependency; must support required roles, RLS behavior, connection pooling/session semantics, backups, and restore testing.
- Owner-approved alternative PostgreSQL hosting model meeting all security constraints.

Migration tooling options should be evaluated after framework/runtime selection and must support reviewed, versioned, repeatable migrations.

## Recommendation
Prefer a managed PostgreSQL service only if it demonstrates required RLS, role, connection-pool, backup, and isolated-restore properties at an owner-approved cost. Otherwise use a self-managed approach. No provider is selected or provisioned.

## Owner decision
Approve hosting model/provider and migration tooling after a cost/security comparison.
