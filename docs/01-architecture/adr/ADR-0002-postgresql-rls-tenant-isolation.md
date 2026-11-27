# ADR-0002: PostgreSQL RLS and Workspace Isolation
**Status:** ACCEPTED SECURITY CONSTRAINT (owner-directed)  
**Date:** 2026-11-27

## Context
The owner requires strict multi-tenant isolation, PostgreSQL RLS, workspace-scoped constraints, bypass prevention, and protection against connection-pool context leakage.

## Decision
PostgreSQL with RLS is a mandatory data-layer constraint. Tenant-owned rows must also carry workspace ownership and use database constraints to prevent cross-workspace relationships.

## Consequences
- PostgreSQL is a required database technology; no database provider/hosting service is selected.
- Runtime DB role must not own protected tables or possess BYPASSRLS.
- Tenant context must be transaction-scoped and cleared at transaction completion.
- RLS and application authorization must both be tested.
