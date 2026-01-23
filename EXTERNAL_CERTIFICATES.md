# External/Manual Certificates

## Overview

External certificates are issued for students who completed courses through **third-party platforms** or **external training providers** that are not tracked in the main `courses` and `course_signups` tables.

---

## Use Cases

1. **Third-party training contracts**: You deliver training via another platform (e.g., Platzi, Udemy, corporate LMS)
2. **Consulting engagements**: Client wants certificates for their employees
3. **Custom workshops**: One-off training sessions not in your course catalog
4. **Retroactive certificates**: Historical completions before your system existed

---

## How External Certificates Work

### Database Structure

External certificates have:
- ✅ **certificate_id**: Unique ID (IDIR or CERT format)
- ✅ **course_signup_id**: `NULL` (no signup record exists)
- ✅ **snapshot_payload**: Contains all certificate data

### Snapshot Payload for External Certificates

**Example 1: Custom course_id**
```json
{
  "certificate_id": "IDIR-WORKFLOW-2026-4D4DE8",
  "student_full_name": "Roberto Chen",
  "student_email_hash": "a3f9b2...", // SHA-256 hash (privacy)
  "course_id": "ACME-WORKFLOW-2026", // Custom identifier you provided
  "course_title": "Workflow Automation Mastery",
  "course_version": "2026-01-22T18:14:22.166Z", // Issued date as version
  "completed_at": "2026-01-22T00:00:00.000Z",
  "issued_at": "2026-01-22T18:14:22.166Z"
}
```

**Example 2: Auto-generated course_id**
```json
{
  "certificate_id": "IDIR-IA-2026-80AF0A",
  "student_full_name": "Sofia González",
  "student_email_hash": "b4e8c3...",
  "course_id": "EXTERNAL-A1B2C3D4E5F6G7H8", // Auto-generated (no course_id provided)
  "course_title": "IA y Automatización",
  "course_version": "2026-01-22T18:15:30.000Z",
  "completed_at": "2026-01-22T00:00:00.000Z",
  "issued_at": "2026-01-22T18:15:30.000Z"
}
```

### Field Meanings for External Certificates

| Field | Purpose | External Certificate Value |
|-------|---------|----------------------------|
| `certificate_id` | Unique identifier | `IDIR-WORKFLOW-2026-4D4DE8` |
| `student_full_name` | Student's name | Actual name provided |
| `student_email_hash` | Privacy-preserving identifier | SHA-256 hash of email |
| `course_id` | Course reference | Your custom ID (e.g., `ACME-WORKFLOW-2026`) or auto-generated `EXTERNAL-{HASH}` |
| `course_title` | Course name | Actual course title from client |
| `course_version` | Timestamp for integrity | `issued_at` (no course versioning exists) |
| `completed_at` | Completion date | Date provided by client |
| `issued_at` | Issuance timestamp | When certificate was generated |

---

## Custom Course IDs

### You Control the course_id

You can provide **any** custom `course_id` you want:

```bash
# Client-specific identifier
npx tsx scripts/issue-manual-certificate.ts \
  --name "Student Name" \
  --email "student@example.com" \
  --course-title "Automation 101" \
  --course-id "IDIR-DIGITALCUBE-AUTO-101" \
  --completed-at "2026-01-22"

# Project-based identifier
--course-id "PROJECT-2026-Q1-WORKSHOP"

# Partner identifier
--course-id "PARTNER-PLATZI-COURSE-42"

# Real course UUID (if it maps to your catalog)
--course-id "550e8400-e29b-41d4-a716-446655440000"
```

### Auto-Generated: `EXTERNAL-{HASH}`

If you **don't** provide a `course_id`, the system auto-generates:

```
EXTERNAL-A1B2C3D4E5F6G7H8
```

This:
1. **Clearly identifies** it's an external certificate
2. **Maintains uniqueness** for hash calculation
3. **Preserves integrity** of the deterministic hash
4. **Enables auditing** (can query all auto-generated external certs: `WHERE course_id LIKE 'EXTERNAL-%'`)

---

## Issuing External Certificates

### Single Certificate (Custom course_id)

```bash
npx tsx scripts/issue-manual-certificate.ts \
  --name "Roberto Chen" \
  --email "roberto@company.com" \
  --course-title "Workflow Automation Mastery" \
  --course-id "ACME-WORKFLOW-2026" \
  --completed-at "2026-01-22" \
  --actor "idir@idir.ai"
```

**What happens:**
1. Generates certificate ID: `IDIR-WORKFLOW-2026-4D4DE8`
2. Uses **your custom** `course_id`: `ACME-WORKFLOW-2026`
3. Uses `issued_at` as `course_version`
4. Stores with `course_signup_id = NULL`

### Single Certificate (Auto-Generated course_id)

If you omit `--course-id`, it auto-generates:

```bash
npx tsx scripts/issue-manual-certificate.ts \
  --name "Roberto Chen" \
  --email "roberto@company.com" \
  --course-title "Workflow Automation Mastery" \
  --completed-at "2026-01-22" \
  --actor "idir@idir.ai"
```

**What happens:**
1. Generates certificate ID: `IDIR-WORKFLOW-2026-4D4DE8`
2. Auto-generates `course_id`: `EXTERNAL-A1B2C3D4E5F6G7H8`
3. Uses `issued_at` as `course_version`
4. Stores with `course_signup_id = NULL`

### Bulk Import (CSV)

```bash
npx tsx scripts/bulk-import-certificates.ts external-students.csv
```

**CSV Format:**
```csv
student_name,student_email,course_title,completed_at,course_id
Roberto Chen,roberto@company.com,Workflow Automation Mastery,2026-01-22,ACME-WORKFLOW-101
Sofia González,sofia@company.com,IA y Automatización,2026-01-21,ACME-AI-202
Maria Rodriguez,maria@company.com,Systems Thinking,2026-01-20,
John Doe,john@example.com,Leadership Course,2026-01-19,550e8400-e29b...
```

**Notes:**
- Provide custom `course_id` for client/project-specific identifiers
- Leave `course_id` empty to auto-generate `EXTERNAL-{HASH}`
- Can use real course UUID if training maps to your catalog

---

## Verification

External certificates verify **exactly the same** as regular certificates:

### API
```bash
curl "https://idir.ai/api/certificates/verify/IDIR-WORKFLOW-2026-4D4DE8"
```

### Direct URL
```
https://idir.ai/en/certificates/verify/IDIR-WORKFLOW-2026-4D4DE8
```

### Response
```json
{
  "found": true,
  "certificate_id": "IDIR-WORKFLOW-2026-4D4DE8",
  "status": "valid",
  "student_name": "Roberto Chen",
  "course_title": "Workflow Automation Mastery",
  "issued_at": "2026-01-22T18:14:22.166Z",
  "completed_at": "2026-01-22T00:00:00.000Z",
  "message": "This certificate is valid and authentic."
}
```

**Note:** `course_id` is **never exposed** in public verification (privacy).

---

## Querying External Certificates

### Find All External Certificates (manual/third-party)
```sql
SELECT
  certificate_id,
  snapshot_payload->>'student_full_name' as student_name,
  snapshot_payload->>'course_title' as course_title,
  snapshot_payload->>'course_id' as course_id,
  issued_at
FROM certificates
WHERE course_signup_id IS NULL
ORDER BY issued_at DESC;
```

### Find Certificates by Custom course_id
```sql
-- Find all certificates for ACME Corp training
SELECT certificate_id, snapshot_payload->>'student_full_name' as student_name
FROM certificates
WHERE snapshot_payload->>'course_id' = 'ACME-AUTO-2026-Q1';

-- Find all ACME Corp certificates (any course)
WHERE snapshot_payload->>'course_id' LIKE 'ACME-%';

-- Find auto-generated external certs only
WHERE snapshot_payload->>'course_id' LIKE 'EXTERNAL-%';
```

### Count External vs Regular
```sql
SELECT
  CASE
    WHEN course_signup_id IS NULL THEN 'External'
    ELSE 'Regular'
  END as cert_type,
  COUNT(*) as total
FROM certificates
GROUP BY cert_type;
```

---

## Benefits of This Approach

✅ **No DB schema changes**: External certs use same table structure
✅ **Hash integrity preserved**: All certs have deterministic hashing
✅ **Clear identification**: `EXTERNAL-*` prefix is self-documenting
✅ **Flexible**: Can link to real courses when applicable
✅ **Auditable**: Easy to query external vs regular certificates
✅ **Privacy**: Email never stored in plain text

---

## Example Scenario

### Client Request
> "We trained 50 employees using your Automation course via our internal LMS. Can you issue them certificates?"

### Solution
```bash
# Create CSV from client's data with custom course_id
# acme-employees.csv:
student_name,student_email,course_title,completed_at,course_id
John Smith,john@acme.com,Automation 101,2026-01-20,ACME-AUTO-2026-Q1
Jane Doe,jane@acme.com,Automation 101,2026-01-19,ACME-AUTO-2026-Q1
# ... (48 more)

# Bulk import
npx tsx scripts/bulk-import-certificates.ts acme-employees.csv --actor "idir@idir.ai"

# Result: 50 certificates issued
# All with course_id = "ACME-AUTO-2026-Q1" (easy to track by client)
# Each with unique certificate ID: IDIR-AUTO-2026-{HASH}
```

### Client Receives
```
Certificate IDs:
- John Smith: IDIR-AUTO-2026-A3F9B2
- Jane Doe: IDIR-AUTO-2026-C4E8D1
- ...

Verification URLs:
- https://idir.ai/en/certificates/verify/IDIR-AUTO-2026-A3F9B2
- https://idir.ai/en/certificates/verify/IDIR-AUTO-2026-C4E8D1
```

Employees can share these URLs on LinkedIn/resume instantly! ✨

---

## Migration from Other Systems

If migrating certificates from another system:

```typescript
// Import script example
const oldCertificates = [
  { name: "Student 1", email: "...", course: "...", date: "2023-06-15" },
  // ...
];

for (const oldCert of oldCertificates) {
  await issueManualCertificate({
    student_full_name: oldCert.name,
    student_email: oldCert.email,
    course_title: oldCert.course,
    completed_at: oldCert.date,
    issued_at: new Date(), // Or use original issue date if available
  });
}
```

---

## FAQ

**Q: Can I use my own course_id instead of EXTERNAL-{HASH}?**
A: Yes! Just pass `--course-id "YOUR-CUSTOM-ID"` when issuing. Use any identifier that makes sense for your workflow (client names, project codes, etc.).

**Q: What are good examples of custom course_id values?**
A:
- Client-specific: `ACME-CORP-AUTO-101`, `GOOGLE-WORKSHOP-2026`
- Project-based: `PROJECT-Q1-2026-WORKSHOP`, `CONTRACT-12345-TRAINING`
- Partner-based: `PLATZI-AUTOMATION-COURSE`, `UDEMY-BATCH-5`
- Real course UUID: `550e8400-e29b-41d4-a716-446655440000` (if it maps to your catalog)

**Q: What if I don't provide a course_id?**
A: The system auto-generates `EXTERNAL-{HASH}` (e.g., `EXTERNAL-A1B2C3D4E5F6G7H8`).

**Q: What if the client wants a custom course title not in my catalog?**
A: No problem! Just provide the custom title. The certificate will use it as-is.

**Q: Are external certificates less trustworthy?**
A: No. They have the same SHA-256 hash integrity, audit trail, and revocation support as regular certificates.

**Q: Can external certificates be revoked or reissued?**
A: Yes. All certificate operations (revoke, reissue) work identically for external certs.

---

## Related Documentation

- `CERTIFICATE_REFACTOR.md` - Technical implementation details
- `CERTIFICATE_EXAMPLES.md` - Usage examples and test cases
- `CERTIFICATE_SYSTEM.md` - Original system design
