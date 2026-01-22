# Manual Certificate Issuance Guide

## Overview

Issue verifiable certificates for students who completed courses through **third-party tools** (not tracked in your `course_signups` table).

Perfect for:
- Students from external learning platforms
- Migrated data from old systems
- Partner programs
- Manual completions

---

## Quick Start

### 1. Single Certificate (Command Line)

```bash
npx tsx scripts/issue-manual-certificate.ts \
  --name "John Doe" \
  --email "john@example.com" \
  --course-title "Automation 101" \
  --completed-at "2026-01-20"
```

**Output**:
```
✅ Certificate issued successfully!

Certificate ID: CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4
Payload Hash: a7f3d2c1e9b4f6d8a0c2e4b6d8f0a2c4...
Verification URL: https://idir.ai/certificates/verify/CERT-2026-...

📧 Send this to the student:
────────────────────────────────────────────────────────────
Certificate ID: CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4
Verify at: https://idir.ai/en/certificates/verify
────────────────────────────────────────────────────────────
```

### 2. Bulk Import (CSV File)

**Create CSV file** (`certificates.csv`):
```csv
student_name,student_email,course_title,completed_at,course_id
John Doe,john@example.com,Automation 101,2026-01-20,
Jane Smith,jane@example.com,Automation 101,2026-01-19,
```

**Import**:
```bash
npx tsx scripts/bulk-import-certificates.ts certificates.csv
```

**Output**:
```
📂 Reading CSV file: certificates.csv

Found 2 rows

✅ Validating rows...
✅ All rows validated successfully

📜 Issuing certificates...

[1/2] John Doe...
  ✅ CERT-2026-ABC...

[2/2] Jane Smith...
  ✅ CERT-2026-DEF...

═══════════════════════════════════════════════════════════
📊 Import Summary

Total rows: 2
✅ Success: 2
❌ Failed: 0
```

---

## Command Reference

### Single Certificate

```bash
npx tsx scripts/issue-manual-certificate.ts \
  --name "Student Name" \
  --email "student@example.com" \
  --course-title "Course Name" \
  --completed-at "YYYY-MM-DD" \
  [--course-id "optional-uuid"] \
  [--issued-at "YYYY-MM-DD"] \
  [--actor "admin@example.com"]
```

**Required Arguments**:
- `--name` - Student full name
- `--email` - Student email address
- `--course-title` - Name of the course
- `--completed-at` - Completion date (YYYY-MM-DD or ISO 8601)

**Optional Arguments**:
- `--course-id` - Course UUID (auto-generated if not provided)
- `--issued-at` - Issue date (defaults to current date/time)
- `--actor` - Email of person issuing certificate (for audit trail)

### Bulk Import

```bash
npx tsx scripts/bulk-import-certificates.ts <csv-file> [options]
```

**Options**:
- `--actor <email>` - Email of person issuing certificates
- `--dry-run` - Preview without inserting into database
- `--help` - Show help message

---

## CSV Format

### Required Columns

| Column | Description | Example |
|--------|-------------|---------|
| `student_name` | Full name of student | John Doe |
| `student_email` | Student email address | john@example.com |
| `course_title` | Name of the course | Automation 101 |
| `completed_at` | Completion date | 2026-01-20 |

### Optional Columns

| Column | Description | Default |
|--------|-------------|---------|
| `course_id` | Course UUID | Auto-generated |

### Sample CSV

```csv
student_name,student_email,course_title,completed_at,course_id
John Doe,john.doe@example.com,Automation 101,2026-01-20,
Jane Smith,jane.smith@example.com,Automation 101,2026-01-19,
Carlos Rodriguez,carlos@example.com,Advanced Automation,2026-01-18,f47ac10b-58cc-4372-a567-0e02b2c3d479
Maria Garcia,maria.garcia@example.com,Automation 101,2026-01-15,
```

**Download**: `scripts/certificates-sample.csv`

---

## Date Formats

All date fields accept:

✅ **YYYY-MM-DD**: `2026-01-20`
✅ **ISO 8601**: `2026-01-20T15:30:00.000Z`
✅ **Human-readable**: `Jan 20, 2026` (parsed automatically)

---

## Use Cases

### Use Case 1: External Learning Platform

You use Udemy/Coursera/etc and want to issue verifiable certificates:

```bash
# Export student data from external platform
# Create CSV with: name, email, course, completion date

# Import all at once
npx tsx scripts/bulk-import-certificates.ts external-students.csv \
  --actor "admin@idir.ai"
```

### Use Case 2: Data Migration

Migrating from old system with existing completions:

```bash
# Export old certificate data to CSV
# Match format: student_name,student_email,course_title,completed_at

# Dry run first to validate
npx tsx scripts/bulk-import-certificates.ts old-system-export.csv --dry-run

# If all looks good, import
npx tsx scripts/bulk-import-certificates.ts old-system-export.csv
```

### Use Case 3: Manual Correction

Student completed course but wasn't tracked properly:

```bash
npx tsx scripts/issue-manual-certificate.ts \
  --name "Maria Garcia" \
  --email "maria@example.com" \
  --course-title "Automation 101" \
  --completed-at "2026-01-15" \
  --actor "support@idir.ai"
```

### Use Case 4: Partner Programs

Issue certificates for students from partner organizations:

```csv
student_name,student_email,course_title,completed_at,course_id
Partner Student 1,student1@partner.com,Custom Training,2026-01-20,partner-course-uuid
Partner Student 2,student2@partner.com,Custom Training,2026-01-19,partner-course-uuid
```

```bash
npx tsx scripts/bulk-import-certificates.ts partner-students.csv \
  --actor "partnerships@idir.ai"
```

---

## Programmatic Usage

You can also import the functions and use them in your code:

### TypeScript/Node.js

```typescript
import { issueManualCertificate } from './scripts/issue-manual-certificate';

async function issueForExternalStudent(student: any) {
  const result = await issueManualCertificate({
    student_full_name: student.name,
    student_email: student.email,
    course_title: 'Automation 101',
    completed_at: student.completedDate,
    actor_email: 'system@idir.ai',
  });

  if (result.success) {
    console.log('Certificate issued:', result.certificate_id);

    // Send email to student
    await sendCertificateEmail({
      to: student.email,
      certificateId: result.certificate_id,
      verificationUrl: `https://idir.ai${result.verification_url}`,
    });
  } else {
    console.error('Failed:', result.error);
  }
}
```

### n8n Workflow Integration

**HTTP Request Node** calling your API wrapper:

```javascript
// n8n Code Node
const students = $input.all();

for (const student of students) {
  const response = await $http.request({
    method: 'POST',
    url: 'https://idir.ai/api/internal/issue-manual-certificate',
    body: {
      student_full_name: student.json.name,
      student_email: student.json.email,
      course_title: 'Automation 101',
      completed_at: student.json.completed_at,
    },
  });

  console.log('Certificate issued:', response.certificate_id);
}

return students;
```

---

## Verification

After issuing certificates, students can verify them:

1. **Public Verification Page**: https://idir.ai/en/certificates/verify
2. **Enter Certificate ID**: `CERT-2026-...`
3. **View Results**: Name, course, dates, status

### Send to Students

**Email Template**:
```
Subject: Your Course Certificate

Congratulations on completing [Course Name]!

Your certificate has been issued and can be verified at any time.

Certificate ID: CERT-2026-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

Verify your certificate:
1. Visit: https://idir.ai/en/certificates/verify
2. Enter your certificate ID
3. Share the verification link with employers

This certificate is cryptographically secured and cannot be forged.
```

---

## Database Structure

Manually issued certificates are stored exactly the same as regular certificates:

```sql
-- All certificates in same table
SELECT
  certificate_id,
  status,
  issued_at,
  snapshot_payload->>'student_full_name' as student_name,
  snapshot_payload->>'course_title' as course_title,
  course_signup_id -- NULL for manual certificates
FROM certificates
WHERE course_signup_id IS NULL; -- Filter manual certificates
```

**Differences**:
- ✅ Same verification process
- ✅ Same integrity protection (SHA-256 hash)
- ✅ Same audit trail
- ⚠️ `course_signup_id` is `NULL` (since no signup record)

---

## Audit Trail

All manual issuances are logged:

```sql
SELECT
  certificate_id,
  event_type,
  actor_type,
  actor_email,
  event_timestamp,
  metadata
FROM certificate_events
WHERE actor_type = 'manual'
ORDER BY event_timestamp DESC;
```

**Example**:
```
certificate_id: CERT-2026-ABC...
event_type: issued
actor_type: manual
actor_email: admin@idir.ai
metadata: {
  "source": "manual_script",
  "course_title": "Automation 101",
  "student_name": "John Doe",
  "student_email": "john@example.com"
}
```

---

## Error Handling

### Common Errors

#### 1. Invalid Email Format

```bash
❌ Failed to issue certificate
Error: Invalid email format
```

**Fix**: Ensure email has `@` symbol and valid domain

#### 2. Invalid Date Format

```bash
❌ Validation errors:
  Row 2: Invalid date format for completed_at (use YYYY-MM-DD)
```

**Fix**: Use `YYYY-MM-DD` format (e.g., `2026-01-20`)

#### 3. Missing Required Fields

```bash
❌ Missing required arguments

Required:
  --name            Student full name
  --email           Student email
```

**Fix**: Provide all required arguments

#### 4. CSV Parsing Error

```bash
❌ Missing required columns: student_email, course_title
Required: student_name, student_email, course_title, completed_at
```

**Fix**: Ensure CSV has all required column headers

---

## Dry Run (Test Before Import)

Always test large imports first:

```bash
# Preview what will be imported
npx tsx scripts/bulk-import-certificates.ts certificates.csv --dry-run
```

**Output**:
```
🔍 DRY RUN MODE - No certificates will be issued

Preview of certificates to be issued:

1. John Doe (john@example.com)
   Course: Automation 101
   Completed: 2026-01-20

2. Jane Smith (jane@example.com)
   Course: Automation 101
   Completed: 2026-01-19

ℹ️  This was a dry run. No certificates were issued.
   Remove --dry-run to actually issue certificates.
```

---

## Best Practices

### 1. Keep Records

Save your CSV files for audit purposes:

```bash
# Add timestamp to filename
cp certificates.csv certificates-2026-01-22.csv

# Import
npx tsx scripts/bulk-import-certificates.ts certificates-2026-01-22.csv
```

### 2. Use Actor Email

Always specify who issued the certificate:

```bash
npx tsx scripts/issue-manual-certificate.ts \
  --name "John Doe" \
  --email "john@example.com" \
  --course-title "Automation 101" \
  --completed-at "2026-01-20" \
  --actor "admin@idir.ai"  # ← Important for audit trail
```

### 3. Validate Before Import

Use `--dry-run` for large batches:

```bash
# Step 1: Dry run
npx tsx scripts/bulk-import-certificates.ts large-batch.csv --dry-run

# Step 2: Review output

# Step 3: Actual import
npx tsx scripts/bulk-import-certificates.ts large-batch.csv
```

### 4. Backup Database

Before large imports:

```bash
# Backup
pg_dump -d postgres -t certificates -t certificate_events > backup.sql

# Import
npx tsx scripts/bulk-import-certificates.ts certificates.csv

# If something goes wrong, restore
psql -d postgres < backup.sql
```

---

## Troubleshooting

### Script Not Found

```bash
# Make sure you're in the project root
cd /path/to/idir.ai

# Run script
npx tsx scripts/issue-manual-certificate.ts --help
```

### Database Connection Error

```bash
# Check .env file has DATABASE_URL
cat .env.local | grep DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### CSV Encoding Issues

If you see weird characters:

```bash
# Convert to UTF-8
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv

# Use converted file
npx tsx scripts/bulk-import-certificates.ts output.csv
```

---

## FAQ

### Q: Can I issue multiple certificates for the same student?

**A**: Yes! Each certificate gets a unique ID. Students can have multiple certificates for different courses or even the same course (if retaken).

### Q: What if I make a mistake?

**A**: Use the revoke endpoint to invalidate the certificate:

```bash
curl -X POST http://localhost:3000/api/certificates/CERT-2026-.../revoke \
  -H "Content-Type: application/json" \
  -d '{"reason": "Issued in error"}'
```

### Q: Can I update a certificate after issuance?

**A**: No. Certificates are immutable (for integrity). Use the reissue endpoint to create a new one with corrections.

### Q: How do I know if a certificate was issued manually?

**A**: Check `course_signup_id` in database:

```sql
SELECT * FROM certificates WHERE course_signup_id IS NULL;
```

### Q: Can students still verify manual certificates?

**A**: Yes! Manual certificates work exactly the same as regular ones. The verification process is identical.

---

## Support

For issues or questions:
- Check script output for error messages
- Verify CSV format matches sample
- Test with `--dry-run` first
- Check database logs: `SELECT * FROM certificate_events`

---

## Summary

✅ **Single Certificate**: `npx tsx scripts/issue-manual-certificate.ts`
✅ **Bulk Import**: `npx tsx scripts/bulk-import-certificates.ts`
✅ **CSV Format**: name, email, course, date
✅ **Verification**: Same as regular certificates
✅ **Audit Trail**: Fully logged

**Sample Files**:
- `scripts/certificates-sample.csv` - Example CSV
- `scripts/issue-manual-certificate.ts` - Single certificate script
- `scripts/bulk-import-certificates.ts` - Bulk import script
