# Certificate System - Quick Start Guide

## Setup (5 minutes)

### 1. Run Migrations

```bash
# Local development
npm run migrate:local

# Production
npm run migrate:prod
```

This creates:
- `certificates` table
- `certificate_events` table
- Enums for status types
- Indexes and RLS policies

### 2. Verify Tables Created

```bash
psql -d postgres -c "\d certificates"
psql -d postgres -c "\d certificate_events"
```

### 3. Test Certificate Issuance

```bash
# Get a completed course signup ID
SIGNUP_ID=$(psql -d postgres -t -c "SELECT id FROM course_signups WHERE completed_at IS NOT NULL LIMIT 1" | xargs)

echo "Testing with signup: $SIGNUP_ID"

# Issue certificate
curl -X POST http://localhost:3000/api/certificates/issue \
  -H "Content-Type: application/json" \
  -d "{\"course_signup_id\": \"$SIGNUP_ID\"}" \
  | jq '.'
```

Expected output:
```json
{
  "success": true,
  "certificate_id": "CERT-2026-...",
  "status": "valid",
  "issued_at": "2026-01-21T...",
  "payload_hash": "a7f3d2c1...",
  "verification_url": "https://idir.ai/certificates/verify/CERT-2026-..."
}
```

### 4. Test Verification

```bash
# Use certificate_id from above
CERT_ID="CERT-2026-..." # Replace with actual ID

curl http://localhost:3000/api/certificates/verify/$CERT_ID | jq '.'
```

Expected output:
```json
{
  "found": true,
  "certificate_id": "CERT-2026-...",
  "status": "valid",
  "student_name": "John Doe",
  "course_title": "Automation 101",
  "issued_at": "2026-01-21T...",
  "completed_at": "2026-01-20T...",
  "message": "This certificate is valid and authentic."
}
```

---

## Common Operations

### Issue Certificate

```typescript
const response = await fetch('/api/certificates/issue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    course_signup_id: 'uuid-here',
    actor_id: 'admin-uuid', // Optional
  }),
});

const result = await response.json();
console.log(result.certificate_id);
```

### Verify Certificate

```typescript
const certId = 'CERT-2026-...';
const response = await fetch(`/api/certificates/verify/${certId}`);
const cert = await response.json();

if (cert.found && cert.status === 'valid') {
  console.log('✓ Certificate is valid');
}
```

### Revoke Certificate

```typescript
const response = await fetch(`/api/certificates/${certId}/revoke`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reason: 'Course not completed properly',
    actor_id: 'admin-uuid',
  }),
});
```

### Reissue Certificate

```typescript
const response = await fetch(`/api/certificates/${oldCertId}/reissue`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    updated_student_name: 'Corrected Name', // Optional
    actor_id: 'admin-uuid',
  }),
});

const result = await response.json();
console.log('New certificate:', result.new_certificate_id);
```

---

## Integration with n8n

### Automatic Certificate Issuance

**Trigger**: When `course_signups.completed_at` is set

**n8n Workflow**:
1. **Webhook/DB Trigger** → Detects completed signup
2. **HTTP Request** → POST `/api/certificates/issue`
3. **Condition** → Check if success
4. **Email** → Send certificate to student with verification URL

### Sample n8n HTTP Request Node

```json
{
  "method": "POST",
  "url": "https://idir.ai/api/certificates/issue",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "course_signup_id": "={{$json.signup_id}}",
    "actor_id": "system"
  }
}
```

### Email Template

```
Subject: 🎓 Your Course Certificate is Ready!

Congratulations {{student_name}}!

You've successfully completed: {{course_title}}

Certificate ID: {{certificate_id}}

Verify your certificate at:
{{verification_url}}

You can share this URL with employers or on LinkedIn.

Security Hash (for your records):
{{payload_hash}}
```

---

## Troubleshooting

### Error: "Course signup not completed"

**Solution**: Ensure `course_signups.completed_at` is set:
```sql
UPDATE course_signups
SET completed_at = NOW()
WHERE id = 'signup-uuid';
```

### Error: "Certificate already exists"

**Behavior**: This is **expected** (idempotent). The endpoint returns the existing certificate.

**To create a new one**: Use `/reissue` endpoint instead.

### Error: "Duplicate key violation"

**Cause**: Trying to create second valid certificate for same signup.

**Solution**: Check existing certificates:
```sql
SELECT * FROM certificates
WHERE course_signup_id = 'signup-uuid'
AND status = 'valid';
```

If exists, either:
1. Return existing (idempotent)
2. Revoke old, then issue new
3. Use reissue endpoint

---

## Database Queries

### Check Certificate Status

```sql
SELECT
  certificate_id,
  status,
  issued_at,
  verification_count,
  last_verified_at
FROM certificates
WHERE course_signup_id = 'signup-uuid'
ORDER BY created_at DESC;
```

### View Audit Trail

```sql
SELECT
  event_type,
  event_timestamp,
  actor_type,
  metadata
FROM certificate_events
WHERE certificate_id = 'CERT-2026-...'
ORDER BY event_timestamp DESC;
```

### Find All Valid Certificates

```sql
SELECT
  c.certificate_id,
  c.issued_at,
  cs.full_name as student_name,
  cs.email
FROM certificates c
JOIN course_signups cs ON c.course_signup_id = cs.id
WHERE c.status = 'valid'
ORDER BY c.issued_at DESC;
```

### Verification Statistics

```sql
SELECT
  COUNT(*) as total_certificates,
  COUNT(*) FILTER (WHERE status = 'valid') as valid,
  COUNT(*) FILTER (WHERE status = 'revoked') as revoked,
  COUNT(*) FILTER (WHERE status = 'reissued') as reissued,
  SUM(verification_count) as total_verifications
FROM certificates;
```

---

## Next Steps

1. ✅ Run migrations
2. ✅ Test issue/verify endpoints
3. ⬜ Add authentication middleware to admin endpoints
4. ⬜ Set up n8n workflow for automatic issuance
5. ⬜ Create PDF generation logic (optional)
6. ⬜ Add rate limiting to verification endpoint
7. ⬜ Customize email templates

---

## Documentation

- **Full Documentation**: See `CERTIFICATE_SYSTEM.md`
- **Unit Tests**: See `lib/__tests__/certificate-hash.test.ts`
- **Migration Files**:
  - `migrations/073_create_certificates_table.sql`
  - `migrations/074_create_certificate_events_table.sql`

---

## Support

Questions? Check:
1. `CERTIFICATE_SYSTEM.md` for detailed architecture
2. API endpoint examples in this guide
3. Unit tests for hashing behavior
4. Database schema comments
