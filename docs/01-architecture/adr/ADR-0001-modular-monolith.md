# ADR-0001: Modular Monolith
**Status:** ACCEPTED CONSTRAINT (owner-directed)  
**Date:** 2026-11-27

## Context
The product requires clear module boundaries and a shared backend/API without unnecessary distributed-system complexity.

## Decision
Use a Modular Monolith architecture with a shared backend/API and versioned HTTP interface under `/api/v1`.

## Consequences
- Modules own their domain rules and persistence contracts.
- Cross-module operations use explicit application interfaces.
- No microservice split is introduced in P1.
- Deployment may host web/API and worker entry points while preserving logical separation.

This ADR records the owner's approved architectural direction; it does not select an application framework or deployment provider.
