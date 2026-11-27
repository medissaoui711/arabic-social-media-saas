# ADR-0005: Background Jobs and Scheduling
**Status:** PROPOSED — OWNER DECISION REQUIRED  
**Date:** 2026-11-27

## Requirements
Atomic due-job claiming, duplicate execution prevention, idempotency, bounded retries, preserved attempt history, UTC/IANA timezone correctness, DST policy, operational observability, and tenant-scoped authorization.

## Options
- Database-backed job table with transactional claim/lease: fewer services and easier local development; database contention and polling design require care.
- Dedicated queue/worker service: stronger queue primitives and independent scaling; introduces provider/service cost and operational dependency.
- Framework-native durable jobs: simpler integration if selected stack provides adequate locking, retry and observability guarantees.

## Recommendation
Start with a database-backed transactional scheduling/outbox model if it satisfies concurrency and recovery tests; evaluate dedicated queues only when measured load or reliability needs justify the added service. This is a proposal, not an implementation decision.

## Owner decision
Approve the job execution model and any provider/cost only after detailed comparison. No queue service is activated.
