#!/usr/bin/env bash
set -euo pipefail
if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo "Usage: CONFIRM_LOCAL_RESTORE=YES ./scripts/restore-db.sh <backup.dump>" >&2
  exit 2
fi
if [[ "${CONFIRM_LOCAL_RESTORE:-}" != "YES" ]]; then
  echo "Refusing destructive restore. Set CONFIRM_LOCAL_RESTORE=YES to confirm local database replacement." >&2
  exit 3
fi
sha256sum --check "$1.sha256"
docker compose exec -T db pg_restore -U postgres_admin -d arabic_social_saas --clean --if-exists --no-owner --no-acl --single-transaction < "$1"
echo "Local database restore completed."
