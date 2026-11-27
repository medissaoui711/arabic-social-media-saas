#!/usr/bin/env bash
set -euo pipefail
mkdir -p backups
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
output="${1:-backups/arabic-social-saas-${stamp}.dump}"
mkdir -p "$(dirname "$output")"
docker compose exec -T db pg_dump -U postgres_admin -d arabic_social_saas --format=custom --no-owner --no-acl > "$output"
chmod 600 "$output"
sha256sum "$output" > "$output.sha256"
printf 'Backup created: %s\n' "$output"
