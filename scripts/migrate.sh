#!/bin/bash

# Migration script with automatic tracking
# Usage: ./scripts/migrate.sh [migration_file]
# Example: ./scripts/migrate.sh migrations/027_migrate_course_signups_to_course_id.sql

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

# Function to execute SQL file
execute_sql_file() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$1" 2>&1
}

# Function to check if migration was applied
is_migration_applied() {
    local migration_name=$1
    local result=$(execute_sql "SELECT COUNT(*) FROM migrations_history WHERE migration_name = '$migration_name';")
    echo $result | grep -q "1"
}

# Function to record migration
record_migration() {
    local migration_name=$1
    local execution_time=$2
    local checksum=$3

    execute_sql "INSERT INTO migrations_history (migration_name, execution_time_ms, checksum) VALUES ('$migration_name', $execution_time, '$checksum');"
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
    echo "Usage: ./scripts/migrate.sh [migration_file]"
    echo "Example: ./scripts/migrate.sh migrations/027_migrate_course_signups_to_course_id.sql"
    exit 1
fi

MIGRATION_FILE=$1

# Check if file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

# Extract migration name from file path
MIGRATION_NAME=$(basename "$MIGRATION_FILE")

echo -e "${BLUE}=== Migration Tool ===${NC}"
echo -e "File: ${YELLOW}$MIGRATION_FILE${NC}"
echo -e "Name: ${YELLOW}$MIGRATION_NAME${NC}"
echo ""

# Check if migrations_history table exists
echo -e "${BLUE}Checking migrations_history table...${NC}"
TABLE_CHECK=$(execute_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migrations_history');")

if echo "$TABLE_CHECK" | grep -q "f"; then
    echo -e "${YELLOW}migrations_history table doesn't exist. Creating it...${NC}"
    execute_sql_file "migrations/000_migrations_history.sql"
    echo -e "${GREEN}✓ migrations_history table created${NC}"
fi

# Check if migration was already applied
echo -e "${BLUE}Checking if migration was already applied...${NC}"
if is_migration_applied "$MIGRATION_NAME"; then
    echo -e "${YELLOW}⚠ Migration '$MIGRATION_NAME' was already applied${NC}"
    echo ""
    echo -e "Applied at:"
    execute_sql "SELECT applied_at, applied_by, execution_time_ms FROM migrations_history WHERE migration_name = '$MIGRATION_NAME';"
    echo ""
    read -p "Do you want to re-apply it? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        echo -e "${YELLOW}Skipping migration${NC}"
        exit 0
    fi
    echo -e "${YELLOW}Re-applying migration...${NC}"
fi

# Calculate checksum
CHECKSUM=$(calculate_checksum "$MIGRATION_FILE")
echo -e "Checksum: ${YELLOW}$CHECKSUM${NC}"
echo ""

# Confirm before applying
read -p "Apply this migration? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${YELLOW}Migration cancelled${NC}"
    exit 0
fi

# Apply migration
echo ""
echo -e "${BLUE}Applying migration...${NC}"
START_TIME=$(date +%s%3N)

if OUTPUT=$(execute_sql_file "$MIGRATION_FILE"); then
    END_TIME=$(date +%s%3N)
    EXECUTION_TIME=$((END_TIME - START_TIME))

    # Record migration
    if is_migration_applied "$MIGRATION_NAME"; then
        # Update existing record
        execute_sql "UPDATE migrations_history SET applied_at = NOW(), checksum = '$CHECKSUM', execution_time_ms = $EXECUTION_TIME WHERE migration_name = '$MIGRATION_NAME';" > /dev/null
    else
        # Insert new record
        record_migration "$MIGRATION_NAME" "$EXECUTION_TIME" "$CHECKSUM" > /dev/null
    fi

    echo -e "${GREEN}✓ Migration applied successfully${NC}"
    echo -e "Execution time: ${YELLOW}${EXECUTION_TIME}ms${NC}"

    # Log to applied folder
    echo "$MIGRATION_FILE" >> migrations/applied/applied_migrations.txt

else
    echo -e "${RED}✗ Migration failed${NC}"
    echo "$OUTPUT"
    exit 1
fi

echo ""
echo -e "${GREEN}Done!${NC}"
