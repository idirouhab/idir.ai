#!/bin/bash

# Create migrations_history table in PRODUCTION database
# This needs to be run once before tracking migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo "  ./scripts/setup-migrations-prod.sh"
    echo ""
    echo "Or run directly:"
    echo "  SUPABASE_DB_PASSWORD='your_password' ./scripts/setup-migrations-prod.sh"
    exit 1
fi

DB_PASSWORD="$SUPABASE_DB_PASSWORD"

# Function to execute SQL file
execute_sql_file() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$1" 2>&1
}

# Function to execute SQL
execute_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "$1" 2>&1
}

echo -e "${BLUE}=== Setup Migration Tracking in Production ===${NC}"
echo -e "${YELLOW}Database: $DB_HOST${NC}"
echo ""

# Check if table already exists
echo -e "${BLUE}Checking if migrations_history table exists...${NC}"
TABLE_CHECK=$(execute_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migrations_history');" 2>&1)

if echo "$TABLE_CHECK" | grep -q "t"; then
    echo -e "${GREEN}✓ migrations_history table already exists${NC}"
    echo ""
    echo "Run this to see current status:"
    echo -e "  ${BLUE}./scripts/migration-status-prod.sh${NC}"
    exit 0
fi

echo -e "${YELLOW}migrations_history table not found${NC}"
echo ""
echo -e "${YELLOW}⚠ This will create the migrations_history table in PRODUCTION${NC}"
echo ""

read -p "Continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${YELLOW}Cancelled${NC}"
    exit 0
fi

# Create the table
echo ""
echo -e "${BLUE}Creating migrations_history table...${NC}"

if OUTPUT=$(execute_sql_file "migrations/000_migrations_history.sql"); then
    echo -e "${GREEN}✓ migrations_history table created successfully${NC}"
    echo ""
    echo "Next steps:"
    echo -e "  1. Check status: ${BLUE}./scripts/migration-status-prod.sh${NC}"
    echo -e "  2. Mark migrations as applied: ${BLUE}./scripts/mark-all-applied-prod.sh${NC}"
else
    echo -e "${RED}✗ Failed to create table${NC}"
    echo "$OUTPUT"
    exit 1
fi
