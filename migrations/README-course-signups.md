# Course Signups Database Migration

## Overview
The course signup form now collects separated name fields and optional statistical data:
- `first_name` (required)
- `last_name` (required)
- `email` (required)
- `country` (optional - for statistics)
- `birth_year` (optional - for statistics)
- `language` (required - en/es)

## Which Migration to Use?

### Option 1: Fresh Database (No existing data)
Use **`018_create_course_signups_v2.sql`**

This creates the table with the correct schema from scratch:
```sql
CREATE TABLE course_signups (
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  country VARCHAR(10),
  birth_year VARCHAR(4),
  -- ... other fields
);
```

### Option 2: Existing Database (Has data with `full_name`)
Use **`019_update_course_signups_fields.sql`**

This migration:
1. Adds new columns (`first_name`, `last_name`, `country`, `birth_year`)
2. Migrates existing `full_name` data by splitting on first space
3. Drops the old `full_name` column
4. Adds appropriate indexes and constraints

**Rollback available**: If you need to revert, use `019_update_course_signups_fields_rollback.sql`

## Important Notes

### Current API Behavior
The API route (`/api/courses/automation-101/signup`) currently **forwards data to n8n webhook** and does NOT store in Supabase directly.

If you want to also store signup data in your database:
1. Update the API route to insert into Supabase after successful n8n call
2. Run the appropriate migration above

### Data Validation
The migration includes constraints:
- Email format validation
- Birth year must be 4 digits between 1900 and current year
- Country code should be 2-10 characters (ISO format)
- Language must be 'en' or 'es'

### Indexes
Performance indexes are created on:
- `email` - for lookups and duplicate checks
- `course_slug` - for filtering by course
- `created_at` - for chronological queries
- `country` - for analytics by region
- `birth_year` - for demographic analysis

## Running the Migration

### Using Supabase CLI:
```bash
# Apply migration
supabase db push

# Or run specific file
psql $DATABASE_URL -f migrations/019_update_course_signups_fields.sql
```

### Manually in Supabase Dashboard:
1. Go to SQL Editor
2. Paste migration content
3. Run query

## Example Queries

### Insert new signup:
```sql
INSERT INTO course_signups (
  first_name,
  last_name,
  email,
  country,
  birth_year,
  course_slug,
  language
) VALUES (
  'Juan',
  'Pérez',
  'juan@example.com',
  'MX',
  '1990',
  'automation-101',
  'es'
);
```

### Get signups by country:
```sql
SELECT country, COUNT(*) as total
FROM course_signups
WHERE course_slug = 'automation-101'
GROUP BY country
ORDER BY total DESC;
```

### Get age distribution:
```sql
SELECT
  CASE
    WHEN (EXTRACT(YEAR FROM CURRENT_DATE) - birth_year::INTEGER) < 25 THEN 'Under 25'
    WHEN (EXTRACT(YEAR FROM CURRENT_DATE) - birth_year::INTEGER) BETWEEN 25 AND 40 THEN '25-40'
    WHEN (EXTRACT(YEAR FROM CURRENT_DATE) - birth_year::INTEGER) BETWEEN 41 AND 60 THEN '41-60'
    ELSE 'Over 60'
  END as age_group,
  COUNT(*) as total
FROM course_signups
WHERE birth_year IS NOT NULL
  AND course_slug = 'automation-101'
GROUP BY age_group
ORDER BY total DESC;
```

## Data Privacy
- `country` and `birth_year` are for statistical analysis only
- Consider implementing data retention policies
- Ensure GDPR compliance if serving EU users
- The form clearly states "Solo para efectos estadísticos"
