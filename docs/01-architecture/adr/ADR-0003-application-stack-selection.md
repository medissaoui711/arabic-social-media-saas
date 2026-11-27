# ADR-0003: Application Framework and Runtime
**Status:** PROPOSED — OWNER DECISION REQUIRED  
**Date:** 2026-11-27

## Decision required
Select the application framework/runtime and frontend framework for the Modular Monolith.

## Evaluation criteria
Arabic/RTL support, TypeScript quality, server-side authorization ergonomics, secure session support, API route design, test ecosystem, deployment portability, maintenance burden, ecosystem maturity, and total cost.

## Options for evaluation
- **Option A — Next.js with TypeScript:** integrated React web and server-side API surface; strong ecosystem and SSR; requires disciplined module boundaries to prevent framework coupling.
- **Option B — React + separate Node.js API (e.g. Fastify/NestJS):** explicit frontend/backend separation and clear API runtime; more operational/configuration surface.
- **Option C — Other owner-approved stack:** evaluated against the same criteria.

## Recommendation
Evaluate Option A as the initial preferred candidate for a single-deployable Modular Monolith, subject to compatibility and security review. This is not an approved selection.

## Cost and risk
Frameworks are open-source, but hosting/build costs depend on provider and traffic. Option B may increase operational complexity. No package installation or external account creation is authorized by this ADR.

## Owner decision
Approve one option or request a comparative technical spike before Phase 02.
