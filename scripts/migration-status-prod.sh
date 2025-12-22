#!/bin/bash

# View migration status for PRODUCTION database
# Shows which migrations have been applied and which are pending

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Production Database connection
DB_HOST="aws-0-eu-central-1.pooler.supabase.com"
DB_PORT="6543"
DB_USER="postgres.cymypipxhlgjmrzonpdw"
DB_NAME="postgres"

# Check if password is provided
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${RED}Error: SUPABASE_DB_PASSWORD environment variable not set${NC}"
    echo ""
    echo "Usage:"
    echo "  export SUPABASE_DB_PASSWORD='your_password'"
    echo "  ./scripts/migration-status-prod.sh"
    echo ""
    echo "Or run directly:"
    echo "  SUPABASE_DB_PASSWORD='your_password' ./scripts/migration-status-prod.sh"
    exit 1
fi

DB_PASSWORD="$SUPABASE_DB_PASSWORD"

# Function to execute SQL
execute_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "$1" 2>&1
}

echo -e "${BLUE}=== PRODUCTION Migration Status ===${NC}"
echo -e "${YELLOW}Database: $DB_HOST${NC}"
echo ""

# Check if migrations_history table exists
echo -e "${CYAN}Checking if migrations_history table exists...${NC}"
TABLE_CHECK=$(execute_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migrations_history');" 2>&1)

if echo "$TABLE_CHECK" | grep -q "f"; then
    echo -e "${RED}✗ migrations_history table doesn't exist in production${NC}"
    echo ""
    echo -e "${YELLOW}To create it, run:${NC}"
    echo -e "  ${CYAN}./scripts/setup-migrations-prod.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✓ migrations_history table exists${NC}"
echo ""

# Get all migration files
echo -e "${CYAN}Scanning migrations folder...${NC}"
MIGRATION_FILES=$(ls migrations/*.sql | grep -v "000_migrations_history.sql" | sort -V)

# Count totals
TOTAL_MIGRATIONS=$(echo "$MIGRATION_FILES" | wc -l | xargs)
APPLIED_COUNT=$(execute_sql "SELECT COUNT(*) FROM migrations_history;" 2>&1 | xargs)
PENDING_COUNT=$((TOTAL_MIGRATIONS - APPLIED_COUNT))

echo ""
echo -e "${BLUE}Summary:${NC}"
echo -e "  Total migrations:   ${YELLOW}$TOTAL_MIGRATIONS${NC}"
echo -e "  Applied:            ${GREEN}$APPLIED_COUNT${NC}"
echo -e "  Pending:            ${YELLOW}$PENDING_COUNT${NC}"
echo ""

# Show applied migrations
if [ "$APPLIED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Applied Migrations:${NC}"
    echo ""
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT
        migration_name as \"Migration\",
        to_char(applied_at, 'YYYY-MM-DD HH24:MI:SS') as \"Applied At\",
        execution_time_ms || 'ms' as \"Duration\",
        applied_by as \"User\"
    FROM migrations_history
    ORDER BY applied_at DESC;"
    echo ""
fi

# Show pending migrations
echo -e "${YELLOW}⏳ Pending Migrations:${NC}"
echo ""

HAS_PENDING=false
for file in $MIGRATION_FILES; do
    migration_name=$(basename "$file")

    # Check if applied
    IS_APPLIED=$(execute_sql "SELECT COUNT(*) FROM migrations_history WHERE migration_name = '$migration_name';" 2>&1 | xargs)

    if [ "$IS_APPLIED" -eq 0 ]; then
        echo -e "  ${YELLOW}○${NC} $migration_name"
        HAS_PENDING=true
    fi
done

if [ "$HAS_PENDING" = false ]; then
    echo -e "  ${GREEN}None - all migrations are applied!${NC}"
fi

echo ""
echo -e "${BLUE}Commands:${NC}"
echo -e "  Setup tracking:     ${CYAN}./scripts/setup-migrations-prod.sh${NC}"
echo -e "  Mark all applied:   ${CYAN}./scripts/mark-all-applied-prod.sh${NC}"
echo ""
