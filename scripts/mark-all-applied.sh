#!/bin/bash

# Mark all migrations as applied without running them
# Use this to initialize the migration tracking for an existing database
# Usage: ./scripts/mark-all-applied.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database connection
DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-54322}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-postgres}

# Function to execute SQL
execute_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$1" 2>&1
}

# Function to calculate checksum
calculate_checksum() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        shasum -a 256 "$1" | awk '{print $1}'
    else
        sha256sum "$1" | awk '{print $1}'
    fi
}

echo -e "${BLUE}=== Mark All Migrations as Applied ===${NC}"
echo ""
echo -e "${YELLOW}⚠ WARNING: This will mark ALL migrations as applied WITHOUT running them${NC}"
echo -e "Only use this if you have an existing database with all migrations already applied"
echo ""

# Get all migration files
MIGRATION_FILES=$(ls migrations/*.sql | grep -v "000_migrations_history.sql" | sort -V)
TOTAL=$(echo "$MIGRATION_FILES" | wc -l | xargs)

echo -e "Found ${YELLOW}$TOTAL${NC} migration files"
echo ""

read -p "Mark all $TOTAL migrations as applied? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${YELLOW}Cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Processing migrations...${NC}"
echo ""

MARKED=0
SKIPPED=0

for file in $MIGRATION_FILES; do
    migration_name=$(basename "$file")
    checksum=$(calculate_checksum "$file")

    # Check if already marked
    IS_APPLIED=$(execute_sql "SELECT COUNT(*) FROM migrations_history WHERE migration_name = '$migration_name';" 2>/dev/null | xargs)

    if [ "$IS_APPLIED" -gt 0 ]; then
        echo -e "  ${YELLOW}○${NC} $migration_name (already marked)"
        SKIPPED=$((SKIPPED + 1))
    else
        execute_sql "INSERT INTO migrations_history (migration_name, checksum, execution_time_ms) VALUES ('$migration_name', '$checksum', 0);" > /dev/null 2>&1
        echo -e "  ${GREEN}✓${NC} $migration_name"
        MARKED=$((MARKED + 1))
    fi
done

echo ""
echo -e "${GREEN}Done!${NC}"
echo -e "  Marked: ${GREEN}$MARKED${NC}"
echo -e "  Skipped: ${YELLOW}$SKIPPED${NC}"
echo ""
