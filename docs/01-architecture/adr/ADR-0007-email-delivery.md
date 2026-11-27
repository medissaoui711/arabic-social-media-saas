# ADR-0007: Email Delivery for Account Recovery
**Status:** PROPOSED — OWNER DECISION REQUIRED  
**Date:** 2026-11-27

## Requirements
Password-reset delivery must be private, rate-limited, short-lived, single-use, and must not reveal whether an account exists. Reset tokens are stored hashed and never logged.

## Options
- SMTP provider: portable protocol, provider configuration and deliverability operations required.
- Managed transactional email API: operational convenience, external account/cost and data-processing implications.
- No external delivery in an initial development environment: reset flow can be exercised with a test-only sink; not suitable for real users.

## Recommendation
Use a test-only mail sink in development and defer external delivery provider selection until owner approval. Never expose reset tokens in production logs or UI.

## Owner decision
Approve provider and any data-processing/cost terms before activation.
