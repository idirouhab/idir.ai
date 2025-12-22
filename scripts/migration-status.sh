#!/bin/bash

# View migration status
# Shows which migrations have been applied and which are pending

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Database connection
DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-54322}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-postgres}

# Function to execute SQL
execute_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "$1" 2>&1
}

echo -e "${BLUE}=== Migration Status ===${NC}"
echo ""

# Check if migrations_history table exists
TABLE_CHECK=$(execute_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migrations_history');")

if echo "$TABLE_CHECK" | grep -q "f"; then
    echo -e "${RED}✗ migrations_history table doesn't exist${NC}"
    echo -e "${YELLOW}Run './scripts/migrate.sh migrations/000_migrations_history.sql' to create it${NC}"
    exit 1
fi

# Get all migration files
echo -e "${CYAN}Scanning migrations folder...${NC}"
MIGRATION_FILES=$(ls migrations/*.sql | grep -v "000_migrations_history.sql" | sort -V)

# Count totals
TOTAL_MIGRATIONS=$(echo "$MIGRATION_FILES" | wc -l | xargs)
APPLIED_COUNT=$(execute_sql "SELECT COUNT(*) FROM migrations_history;" | xargs)
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
    IS_APPLIED=$(execute_sql "SELECT COUNT(*) FROM migrations_history WHERE migration_name = '$migration_name';" | xargs)

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
echo -e "  Apply migration:    ${CYAN}./scripts/migrate.sh migrations/XXX_name.sql${NC}"
echo -e "  Mark as applied:    ${CYAN}./scripts/mark-applied.sh migrations/XXX_name.sql${NC}"
echo ""
