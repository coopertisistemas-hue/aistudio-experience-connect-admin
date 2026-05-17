#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# CONCURRENCY HARDENING TEST RUNNER
# Dom Pietro Experience Connect — V2 Architecture
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATION_FILE="$PROJECT_ROOT/supabase/migrations/20250516120000_v2_core_schema.sql"
FUNCTIONS_FILE="$PROJECT_ROOT/supabase/migrations/20250516120100_v2_functions.sql"
SETUP_SQL="$SCRIPT_DIR/test-concurrency-setup.sql"
WORKER_SQL="$SCRIPT_DIR/test-concurrency-worker.sql"
PGDATA="/tmp/pgdata_concurrency_test_$(date +%s)"
DB_NAME="concurrency_test"
LOG_FILE="$PGDATA/server.log"
WORKER_COUNT=10
SEATS_PER_WORKER=3
SLOT_CAPACITY=10

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "CONCURRENCY HARDENING TEST"
echo "========================================"
echo "Workers: $WORKER_COUNT"
echo "Seats per worker: $SEATS_PER_WORKER"
echo "Slot capacity: $SLOT_CAPACITY"
echo "Expected successes: $((SLOT_CAPACITY / SEATS_PER_WORKER))"
echo "Expected failures: $((WORKER_COUNT - SLOT_CAPACITY / SEATS_PER_WORKER))"
echo ""

# Verify PostgreSQL binaries
if ! command -v initdb &> /dev/null || ! command -v pg_ctl &> /dev/null; then
  echo -e "${RED}ERROR: PostgreSQL binaries not found.${NC}"
  exit 1
fi

# Cleanup on exit
cleanup() {
  echo ""
  echo "Cleaning up..."
  if pg_ctl -D "$PGDATA" status &>/dev/null; then
    pg_ctl -D "$PGDATA" stop -m fast &>/dev/null || true
  fi
  rm -rf "$PGDATA"
}
trap cleanup EXIT

# Initialize database cluster
echo "Initializing PostgreSQL cluster..."
mkdir -p "$PGDATA"
initdb -D "$PGDATA" --no-locale -U postgres -E UTF8 --auth=trust >/dev/null 2>&1

# Start server
echo "Starting PostgreSQL..."
pg_ctl -D "$PGDATA" -l "$LOG_FILE" start >/dev/null 2>&1
sleep 2

# Wait for readiness
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

# Create test database
echo "Creating test database..."
psql -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME WITH (FORCE);" >/dev/null 2>&1
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE $DB_NAME;" >/dev/null 2>&1

# Create auth schema stub
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

# Apply schema migration
echo "Applying schema migration..."
psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -f "$MIGRATION_FILE" >/dev/null 2>&1

# Apply functions migration
echo "Applying functions migration..."
psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -f "$FUNCTIONS_FILE" >/dev/null 2>&1

# Setup test data
echo "Setting up test data..."
psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -f "$SETUP_SQL" >/dev/null 2>&1

# Launch workers simultaneously
echo ""
echo "Launching $WORKER_COUNT concurrent workers..."

PIDS=()
for i in $(seq 1 $WORKER_COUNT); do
  psql -h localhost -p 5432 -U postgres -d "$DB_NAME" \
    -c "SELECT set_config('app.worker_id', '$i', false);" \
    -f "$WORKER_SQL" >/dev/null 2>&1 &
  PIDS+=($!)
done

# Wait for all workers
echo "Waiting for workers to complete..."
for pid in "${PIDS[@]}"; do
  wait "$pid"
done

echo -e "${GREEN}All workers completed.${NC}"
echo ""

# Analyze results
echo "========================================"
echo "RESULTS"
echo "========================================"

psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -c "
SELECT
  result,
  COUNT(*) AS count
FROM test_concurrency_results
GROUP BY result
ORDER BY count DESC;
"

echo ""

psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -c "
SELECT
  COUNT(*) FILTER (WHERE result = 'success') AS successes,
  COUNT(*) FILTER (WHERE result = 'capacity_error') AS capacity_failures,
  COUNT(*) FILTER (WHERE result = 'other_error') AS other_errors,
  COUNT(*) AS total
FROM test_concurrency_results;
"

# Validate consistency
echo ""
echo "========================================"
echo "CONSISTENCY CHECK"
echo "========================================"

psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -c "
SELECT
  held_seats,
  reserved_seats,
  remaining_seats,
  status,
  lock_version
FROM vehicle_slots
WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4';
"

# Check total held seats match successful holds
psql -h localhost -p 5432 -U postgres -d "$DB_NAME" -c "
SELECT
  (SELECT held_seats FROM vehicle_slots WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4') AS actual_held,
  (SELECT COUNT(*) * $SEATS_PER_WORKER FROM test_concurrency_results WHERE result = 'success') AS expected_held;
"

echo ""
echo "========================================"
echo "CONCURRENCY TEST COMPLETE"
echo "========================================"
