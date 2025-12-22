#!/bin/bash

# Mark a migration as applied without running it
# Useful for migrations that were already run manually
# Usage: ./scripts/mark-applied.sh [migration_file]

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

# Function to check if migration was applied
is_migration_applied() {
    local migration_name=$1
    local result=$(execute_sql "SELECT COUNT(*) FROM migrations_history WHERE migration_name = '$migration_name';")
    echo $result | grep -q "1"
}

# Function to calculate checksum
calculate_checksum() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        shasum -a 256 "$1" | awk '{print $1}'
    else
        sha256sum "$1" | awk '{print $1}'
    fi
}

# Check if migration file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No migration file specified${NC}"
    echo "Usage: ./scripts/mark-applied.sh [migration_file]"
    echo "Example: ./scripts/mark-applied.sh migrations/001_create_users_table.sql"
    exit 1
fi

MIGRATION_FILE=$1

# Check if file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

# Extract migration name
MIGRATION_NAME=$(basename "$MIGRATION_FILE")

echo -e "${BLUE}=== Mark Migration as Applied ===${NC}"
echo -e "File: ${YELLOW}$MIGRATION_FILE${NC}"
echo -e "Name: ${YELLOW}$MIGRATION_NAME${NC}"
echo ""

# Check if already marked
if is_migration_applied "$MIGRATION_NAME"; then
    echo -e "${YELLOW}⚠ Migration '$MIGRATION_NAME' is already marked as applied${NC}"
    echo ""
    execute_sql "SELECT applied_at, applied_by FROM migrations_history WHERE migration_name = '$MIGRATION_NAME';"
    exit 0
fi

# Calculate checksum
CHECKSUM=$(calculate_checksum "$MIGRATION_FILE")

echo -e "${YELLOW}⚠ WARNING: This will mark the migration as applied WITHOUT running it${NC}"
echo -e "Only use this if you've already run this migration manually"
echo ""
read -p "Mark this migration as applied? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${YELLOW}Cancelled${NC}"
    exit 0
fi

# Mark as applied
execute_sql "INSERT INTO migrations_history (migration_name, checksum, execution_time_ms) VALUES ('$MIGRATION_NAME', '$CHECKSUM', 0);" > /dev/null

echo -e "${GREEN}✓ Migration marked as applied${NC}"
echo ""

# Log to applied folder
echo "$MIGRATION_FILE" >> migrations/applied/applied_migrations.txt

echo -e "${GREEN}Done!${NC}"
