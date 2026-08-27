#!/usr/bin/env bash
# پشتیبان‌گیری شبانه — نمونه cron: 0 2 * * * /path/to/ops/backup.sh
set -euo pipefail
cd "$(dirname "$0")/.."
STAMP=$(date +%F)
mkdir -p backups
docker compose exec -T postgres pg_dump -U kasbyab kasbyab | gzip > "backups/kasbyab-$STAMP.sql.gz"
tar czf "backups/storage-$STAMP.tgz" backend/storage/app
find backups -name 'kasbyab-*.sql.gz' -mtime +30 -delete
find backups -name 'storage-*.tgz' -mtime +30 -delete
echo "backup done: backups/kasbyab-$STAMP.sql.gz"
