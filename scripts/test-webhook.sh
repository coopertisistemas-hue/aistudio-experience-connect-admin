#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# WEBHOOK HARDENING TEST RUNNER
# Dom Pietro Experience Connect — V2 Architecture
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATION_FILE="$PROJECT_ROOT/supabase/migrations/20250516120000_v2_core_schema.sql"
FUNCTIONS_FILE="$PROJECT_ROOT/supabase/migrations/20250516120100_v2_functions.sql"
TEST_SQL="$SCRIPT_DIR/test-webhook.sql"
PGDATA="/tmp/pgdata_webhook_test_$(date +%s)"
DB_NAME="webhook_test"
LOG_FILE="$PGDATA/server.log"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "WEBHOOK HARDENING TEST"
echo "========================================"
echo ""

if ! command -v initdb &> /dev/null || ! command -v pg_ctl &> /dev/null; then
  echo -e "${RED}ERROR: PostgreSQL binaries not found.${NC}"
  exit 1
fi

cleanup() {
  echo ""
  echo "Cleaning up..."
  if pg_ctl -D "$PGDATA" status &>/dev/null; then
    pg_ctl -D "$PGDATA" stop -m fast &>/dev/null || true
  fi
  rm -rf "$PGDATA"
}
trap cleanup EXIT

echo "Initializing PostgreSQL cluster..."
mkdir -p "$PGDATA"
initdb -D "$PGDATA" --no-locale -U postgres -E UTF8 --auth=trust >/dev/null 2>&1

echo "Starting PostgreSQL..."
pg_ctl -D "$PGDATA" -l "$LOG_FILE" start >/dev/null 2>&1
sleep 2

for i in {1..30}; do
  if pg_isready -h localhost -p 5432 -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! pg_isready -h localhost -p 5432 -U postgres >/dev/null 2>&1; then
  echo -e "${RED}ERROR: PostgreSQL failed to start.${NC}"
  cat "$LOG_FILE" || true
  exit 1
fi

echo -e "${GREEN}PostgreSQL is ready.${NC}"
echo ""

echo "Creating test database..."
psql -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME WITH (FORCE);" >/dev/null 2>&1
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE $DB_NAME;" >/dev/null 2>&1

echo "Creating auth schema stub..."
psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -c "
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  raw_app_meta_data jsonb DEFAULT '{}',
  raw_user_meta_data jsonb DEFAULT '{}'
);
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid AS \$\$
BEGIN
  RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
\$\$ LANGUAGE plpgsql;
" >/dev/null 2>&1

echo "Applying schema migration..."
psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -f "$MIGRATION_FILE" >/dev/null 2>&1

echo "Applying functions migration..."
psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -f "$FUNCTIONS_FILE" >/dev/null 2>&1

echo "Running webhook tests..."
psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -f "$TEST_SQL"

echo ""
echo "========================================"
echo "WEBHOOK TEST COMPLETE"
echo "========================================"
