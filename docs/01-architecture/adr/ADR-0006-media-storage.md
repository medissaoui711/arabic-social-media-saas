# ADR-0006: Media Storage Boundary
**Status:** PROPOSED — OWNER DECISION REQUIRED  
**Date:** 2026-11-27

## Requirements
Opaque object keys, workspace ownership, private-by-default access, content-based validation, size limits, safe download authorization, checksum/integrity, deletion lifecycle, and backup/recovery considerations.

## Options
- Local filesystem adapter for development/test only: low cost and simple; not a production durability strategy.
- S3-compatible object storage: portable API and broad ecosystem; provider cost, credentials and lifecycle configuration required.
- Managed platform blob storage: integrated operations; vendor coupling and provider-specific access controls.

## Recommendation
Keep a provider-neutral storage port; use local test storage for automated tests and select production object storage only after owner approval and security/cost review. No provider is selected.
