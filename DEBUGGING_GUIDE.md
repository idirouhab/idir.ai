# Debugging Guide: Enhanced Error Logging

## Overview
This document describes the enhanced logging and error handling added to the application for better debugging visibility, especially for the course pages.

## Changes Made

### 1. Course Page Error Handling (`app/[locale]/courses/[slug]/page.tsx`)

#### Enhanced Logging
- **Page Component**: Added detailed logging at entry and exit points
  - Logs course slug and locale on page load
  - Logs successful course retrieval with ID and title
  - Logs warnings when course is not found
  - Enhanced error logging with structured error details (message, stack, name)

- **Metadata Generation**: Added comprehensive error handling
  - Wrapped in try-catch to prevent metadata failures from crashing the page
  - Returns fallback metadata instead of throwing errors
  - Logs all metadata generation attempts and errors

#### Error Page (`app/[locale]/courses/[slug]/error.tsx`)
- Created custom error boundary for course pages
- Displays user-friendly error message
- Shows technical details in development mode
- Integrates with Sentry for error tracking
- Provides "Try again" and "Back to courses" actions

### 2. Database Layer Enhancements (`lib/db.ts`)

#### Connection Pool Logging
- Logs database pool initialization with environment details
- Tracks new client connections
- Enhanced error logging for idle client errors
- Includes timestamps and structured error data

#### Query Logging
- Logs slow queries (>1000ms) with warnings
- Includes query preview (first 100 chars) for debugging
- Captures and logs PostgreSQL-specific error details:
  - Error code
  - Error detail
  - Error hint
  - Full stack trace
- Parameter logging for debugging

### 3. Course Data Layer (`lib/courses.ts`)

#### `getPublishedCourseBySlugOnly` Function
- Added entry logging with slug parameter
- Logs successful course retrieval with course details
- Logs when no course is found
- Enhanced database error logging with structured data:
  - Slug being queried
  - Error message and stack
  - PostgreSQL error codes and hints

## Log Prefixes

All logs are prefixed with identifiable tags for easy filtering:

- `[CoursePage]` - Course page component logs
- `[generateMetadata]` - Metadata generation logs
- `[getPublishedCourseBySlugOnly]` - Database query logs
- `[DB]` - Database pool and query logs

## Viewing Logs

### Development
```bash
npm run dev
# Logs will appear in the terminal
```

### Production (Vercel)
1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by time range
3. Search for log prefixes (e.g., `[CoursePage]`, `[DB]`)
4. Look for ERROR and WARN level logs

### Production (Other Platforms)
Check your platform's log streaming service:
- **Netlify**: Functions → Function Log
- **AWS**: CloudWatch Logs
- **Docker**: `docker logs <container>`

## Common Error Patterns

### Database Connection Errors
```
[DB] Database query error: {
  code: 'ECONNREFUSED',
  ...
}
```
**Solution**: Check DATABASE_URL environment variable

### Missing Tables
```
[DB] Database query error: {
  code: '42P01',
  detail: 'relation "users" does not exist',
  ...
}
```
**Solution**: Run pending database migrations

### Null Course Data
```
[getPublishedCourseBySlugOnly] No course found with slug: automation-101
```
**Solution**: Check if course exists and is published in database

### Metadata Generation Failure
```
[generateMetadata] Error generating metadata: {
  slug: 'automation-101',
  error: '...',
  ...
}
```
**Solution**: Check course_data JSON structure and required fields

## Debugging Checklist

When encountering a 500 error on course pages:

1. **Check Server Logs**
   - Look for `[CoursePage]` errors
   - Check for `[DB]` connection issues
   - Verify `[getPublishedCourseBySlugOnly]` results

2. **Verify Database**
   - Confirm all migrations are applied
   - Check if course exists: `SELECT * FROM courses WHERE slug = 'automation-101'`
   - Verify related tables exist: `users`, `instructor_profiles`, `course_instructors`

3. **Check Environment Variables**
   - `DATABASE_URL` is set correctly
   - `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured

4. **Test Query Directly**
   ```bash
   npm run test-course-query  # If you create this script
   ```

5. **Check Sentry (if configured)**
   - Look for captured exceptions
   - Check error digest IDs

## Next Steps for Further Improvement

1. **Add Request ID Tracking**
   - Generate unique request IDs
   - Include in all log statements
   - Makes it easier to trace a single request through the system

2. **Implement Structured Logging Library**
   - Use Winston or Pino for production
   - Consistent log formats
   - Different log levels for different environments

3. **Add Performance Monitoring**
   - Track database query performance
   - Monitor page load times
   - Set up alerts for slow queries

4. **Improve Error Recovery**
   - Add retry logic for transient failures
   - Implement circuit breakers for database calls
   - Add fallback data sources

## Testing the Improvements

### Local Testing
```bash
# 1. Build the application
npm run build

# 2. Start production server
npm start

# 3. Navigate to a course page
open http://localhost:3000/es/courses/automation-101

# 4. Check terminal for logs with prefixes
```

### Production Testing
1. Deploy changes to production
2. Visit course page
3. Check Vercel/platform logs immediately
4. Look for structured log entries with prefixes
5. Verify Sentry errors are captured (if applicable)

## Support

If you're still experiencing issues after following this guide:
1. Collect all relevant logs with timestamps
2. Note the exact URL causing the error
3. Check if error is reproducible
4. Document any recent changes (code, infrastructure, data)
