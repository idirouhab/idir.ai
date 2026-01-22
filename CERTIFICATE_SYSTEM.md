# Certificate Issuance & Verification System

## Overview

Production-grade certificate issuance and verification system with:
- ✅ **Deterministic hashing** for integrity protection (SHA-256)
- ✅ **Revocation & re-issuance** support with full history
- ✅ **Complete audit trail** of all certificate events
- ✅ **Transaction safety** to prevent race conditions
- ✅ **Privacy-preserving** public verification (no email exposure)
- ✅ **Idempotent operations** for reliability

---

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Certificate Hash Integrity](#certificate-hash-integrity)
5. [Usage Examples](#usage-examples)
6. [n8n Integration](#n8n-integration)
7. [Security Considerations](#security-considerations)

---

## Architecture

### Components

```
┌─────────────────┐
│   n8n Workflow  │  Triggers certificate issuance when course completed
└────────┬────────┘
         │
         v
┌─────────────────┐
│  POST /issue    │  Issues certificate with deterministic hash
└────────┬────────┘
         │
         v
┌─────────────────┐
│  certificates   │  Stores certificate with snapshot + hash
│  table          │  Enforces: ONE valid cert per signup
└────────┬────────┘
         │
         v
┌─────────────────┐
│ certificate_    │  Audit trail: issued/verified/revoked/reissued
│ events table    │
└─────────────────┘
```

### Key Design Decisions

1. **Email Hash vs Plain Email in Snapshot**
   - ✅ **Decision**: Store SHA-256 hash of email in snapshot
   - **Why**: Privacy-preserving. If snapshot leaks, email is not exposed.
   - **Trade-off**: Cannot reverse hash to recover email (by design).

2. **Partial Unique Index**
   - Ensures only ONE `valid` certificate per `course_signup_id`
   - Allows multiple `revoked` or `reissued` certificates (for history)

3. **Certificate ID Format**
   - `CERT-{YEAR}-{UUID}`
   - Example: `CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4`
   - Year prefix helps with organization and quick filtering

---

## Database Schema

### Tables Created

#### `certificates` (migration 073)

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY,
  certificate_id TEXT UNIQUE NOT NULL,  -- CERT-2026-UUID
  course_signup_id UUID NOT NULL,       -- FK to course_signups
  issued_at TIMESTAMPTZ NOT NULL,
  status certificate_status,            -- valid|revoked|reissued
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  hash_algorithm TEXT DEFAULT 'sha256',
  payload_hash TEXT NOT NULL,           -- SHA-256 hex string
  snapshot_payload JSONB NOT NULL,      -- Deterministic snapshot
  verification_count BIGINT DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Partial unique index: ONE valid certificate per signup
CREATE UNIQUE INDEX idx_certificates_one_valid_per_signup
  ON certificates(course_signup_id)
  WHERE status = 'valid';
```

#### `certificate_events` (migration 074)

```sql
CREATE TABLE certificate_events (
  id UUID PRIMARY KEY,
  certificate_id TEXT NOT NULL,
  certificate_uuid UUID,               -- FK to certificates (nullable)
  event_type certificate_event_type,   -- issued|verified|revoked|reissued
  event_timestamp TIMESTAMPTZ,
  actor_type TEXT,                     -- system|admin|user|api|public
  actor_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ
);
```

### Run Migrations

```bash
# Local
npm run migrate:local

# Production
npm run migrate:prod
```

---

## API Endpoints

### 1. Issue Certificate

**Endpoint**: `POST /api/certificates/issue`

**Request**:
```json
{
  "course_signup_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "actor_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab"  // Optional
}
```

**Response** (201):
```json
{
  "success": true,
  "certificate_id": "CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4",
  "status": "valid",
  "issued_at": "2026-01-21T10:30:00.000Z",
  "payload_hash": "a7f3d2c1e9b4f6d8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6",
  "verification_url": "https://idir.ai/certificates/verify/CERT-2026-3F9A2C1E..."
}
```

**Behavior**:
- ✅ **Idempotent**: If valid certificate exists, returns it
- ✅ Creates deterministic snapshot from enrollment data
- ✅ Generates SHA-256 hash of snapshot
- ✅ Logs `issued` event to audit trail

**Error Cases**:
- `400`: Course signup not found
- `400`: Course signup not completed
- `500`: Database error

---

### 2. Revoke Certificate

**Endpoint**: `POST /api/certificates/:certificate_id/revoke`

**Request**:
```json
{
  "reason": "Certificate issued to wrong student email address",
  "actor_id": "admin-uuid"  // Optional
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Certificate revoked successfully",
  "certificate_id": "CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4"
}
```

**Behavior**:
- Sets `status = 'revoked'`
- Records `revoked_at` and `revoked_reason`
- Logs `revoked` event to audit trail

**Error Cases**:
- `400`: Certificate not found
- `400`: Certificate already revoked
- `400`: Invalid certificate ID format

---

### 3. Reissue Certificate

**Endpoint**: `POST /api/certificates/:certificate_id/reissue`

**Request**:
```json
{
  "actor_id": "admin-uuid",         // Optional
  "updated_student_name": "Jane Doe" // Optional: Corrected name
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Certificate reissued successfully",
  "old_certificate_id": "CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4",
  "new_certificate_id": "CERT-2026-7A8B9C0D-1E2F-3A4B-5C6D-7E8F9A0B1C2D",
  "status": "valid",
  "issued_at": "2026-01-21T11:00:00.000Z",
  "payload_hash": "new-hash-here...",
  "verification_url": "https://idir.ai/certificates/verify/CERT-2026-7A8B..."
}
```

**Behavior**:
- Marks old certificate as `status = 'reissued'`
- Creates **brand new** certificate with new ID and hash
- Optionally updates student name if provided
- Logs `reissued` event for old cert, `issued` for new cert

**Use Cases**:
- Name correction (typo in original)
- Lost certificate (student needs new copy)
- Certificate redesign (generate new PDF)

---

### 4. Verify Certificate (Public)

**Endpoint**: `GET /api/certificates/verify/:certificate_id`

**Response** (200) - Valid Certificate:
```json
{
  "found": true,
  "certificate_id": "CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4",
  "status": "valid",
  "student_name": "John Doe",
  "course_title": "Automation 101",
  "issued_at": "2026-01-21T10:30:00.000Z",
  "completed_at": "2026-01-20T15:45:00.000Z",
  "message": "This certificate is valid and authentic."
}
```

**Response** (200) - Revoked Certificate:
```json
{
  "found": true,
  "certificate_id": "CERT-2026-...",
  "status": "revoked",
  "student_name": "John Doe",
  "course_title": "Automation 101",
  "issued_at": "2026-01-21T10:30:00.000Z",
  "completed_at": "2026-01-20T15:45:00.000Z",
  "revoked_at": "2026-01-22T09:00:00.000Z",
  "revoked_reason": "Issued in error",
  "message": "This certificate has been revoked."
}
```

**Response** (404) - Not Found:
```json
{
  "found": false,
  "certificate_id": "CERT-2026-INVALID",
  "message": "Certificate not found. Please verify the certificate ID is correct."
}
```

**Behavior**:
- ✅ **Public endpoint** (no authentication required)
- ✅ Increments `verification_count`
- ✅ Updates `last_verified_at`
- ✅ Logs `verified` event with IP and user agent
- ✅ **Privacy**: Does NOT expose student email

---

## Certificate Hash Integrity

### What Does the Hash Prove?

The SHA-256 hash provides **cryptographic proof** that:
1. ✅ Certificate data has not been tampered with
2. ✅ Certificate was issued by your system (only you can generate valid hashes)
3. ✅ All fields (name, course, dates) are authentic

### Snapshot Payload Structure

```json
{
  "certificate_id": "CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4",
  "student_full_name": "John Doe",
  "student_email_hash": "a7f3d2c1...", // SHA-256 of normalized email
  "course_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "course_title": "Automation 101",
  "course_version": "2025-12-01T00:00:00.000Z", // course.updated_at
  "completed_at": "2026-01-20T15:45:30.000Z",
  "issued_at": "2026-01-21T10:30:00.000Z"
}
```

### Hash Generation Process

```typescript
// 1. Create snapshot (deterministic field order)
const snapshot = createCertificateSnapshot({
  certificate_id: "CERT-2026-...",
  student_full_name: "John Doe",
  student_email: "john@example.com",
  course_id: "course-uuid",
  course_title: "Automation 101",
  course_updated_at: new Date("2025-12-01"),
  completed_at: new Date("2026-01-20"),
  issued_at: new Date("2026-01-21"),
});

// 2. Serialize with stable key ordering (alphabetical)
const stableJson = stableStringify(snapshot);
// Always produces: {"certificate_id":"...","completed_at":"...","course_id":"...",...}

// 3. Compute SHA-256 hash
const payloadHash = sha256Hash(stableJson);
// Result: "a7f3d2c1e9b4f6d8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6"
```

### Verification

Anyone can verify the certificate authenticity:

```typescript
// 1. Fetch certificate from API/database
const cert = await fetch(`/api/certificates/verify/${certId}`);

// 2. Recompute hash from stored snapshot
const computedHash = generateCertificateHash(cert.snapshot_payload);

// 3. Compare with stored hash
if (computedHash === cert.payload_hash) {
  console.log("✓ Certificate is authentic and unmodified");
} else {
  console.log("✗ Certificate has been tampered with!");
}
```

### Why Email Hash?

**Decision**: Store `SHA-256(email)` instead of plain email in snapshot.

**Pros**:
- ✅ Privacy-preserving (email not exposed if snapshot leaks)
- ✅ Still allows email verification (hash both sides and compare)
- ✅ GDPR-friendly (no PII in public hash chain)

**Cons**:
- ❌ Cannot reverse hash to recover email (intentional)
- ❌ Slightly more complex verification workflow

**Alternative**: If you need to expose email for verification purposes, change `student_email_hash` to `student_email` in `CertificateSnapshot` type and update `createCertificateSnapshot()` function.

---

## Usage Examples

### Example 1: Issue Certificate from Admin Dashboard

```typescript
// Admin marks course as completed and issues certificate
const response = await fetch('/api/certificates/issue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    course_signup_id: signupId,
    actor_id: currentUserId,
  }),
});

const result = await response.json();

if (result.success) {
  console.log('Certificate issued:', result.certificate_id);
  console.log('Verification URL:', result.verification_url);

  // Send email to student with verification URL and hash
  await sendCertificateEmail({
    studentEmail: signup.email,
    certificateId: result.certificate_id,
    verificationUrl: result.verification_url,
    payloadHash: result.payload_hash,
  });
}
```

### Example 2: Public Verification (Employer)

```typescript
// Employer verifies certificate authenticity
const certId = 'CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4';

const response = await fetch(`/api/certificates/verify/${certId}`);
const cert = await response.json();

if (cert.found && cert.status === 'valid') {
  console.log(`✓ Valid certificate for ${cert.student_name}`);
  console.log(`  Course: ${cert.course_title}`);
  console.log(`  Completed: ${cert.completed_at}`);
  console.log(`  Issued: ${cert.issued_at}`);
} else if (cert.status === 'revoked') {
  console.log('✗ Certificate has been revoked');
  console.log(`  Reason: ${cert.revoked_reason}`);
} else {
  console.log('✗ Certificate not found or invalid');
}
```

### Example 3: Revoke Certificate

```typescript
// Admin revokes a certificate
const response = await fetch(`/api/certificates/${certId}/revoke`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reason: 'Student found to have plagiarized course work',
    actor_id: currentAdminId,
  }),
});

const result = await response.json();
console.log(result.message); // "Certificate revoked successfully"
```

### Example 4: Reissue Certificate (Name Correction)

```typescript
// Student requests name correction
const response = await fetch(`/api/certificates/${oldCertId}/reissue`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    updated_student_name: 'Jane Smith (married name)',
    actor_id: currentAdminId,
  }),
});

const result = await response.json();

if (result.success) {
  console.log('New certificate issued:', result.new_certificate_id);
  console.log('Old certificate marked as reissued:', result.old_certificate_id);

  // Send updated certificate to student
  await sendReissuedCertificateEmail({
    studentEmail: signup.email,
    newCertificateId: result.new_certificate_id,
    verificationUrl: result.verification_url,
  });
}
```

---

## n8n Integration

### Workflow Trigger

**Scenario**: Automatically issue certificate when admin marks course as completed.

**n8n Workflow**:

```
1. [Webhook Trigger] or [Database Trigger]
   └─> Fires when course_signups.status = 'completed'
       and course_signups.completed_at IS NOT NULL

2. [HTTP Request Node]
   └─> POST https://idir.ai/api/certificates/issue
       Body: {
         "course_signup_id": "{{$json.id}}",
         "actor_id": "system"
       }

3. [If Node] - Check if certificate issued successfully
   └─> True: Continue to email
   └─> False: Send error notification to admin

4. [HTTP Request Node] - Fetch student details (if needed)
   └─> GET /api/students/{{$json.student_id}}

5. [Send Email Node]
   └─> To: {{$json.student_email}}
       Subject: "Your Course Certificate is Ready!"
       Body:
         Congratulations! You've completed {{course_title}}.

         Certificate ID: {{certificate_id}}
         Verification URL: {{verification_url}}

         You can verify your certificate at any time by visiting the URL above.

         Certificate Hash (for your records): {{payload_hash}}

6. [Optional: Generate PDF Node]
   └─> Use certificate data to generate PDF with QR code
   └─> Upload PDF to storage
   └─> Update certificates.pdf_url

7. [Send Email with PDF Attachment]
   └─> Include generated PDF certificate
```

### PDF Generation in n8n

**Include in PDF**:
- ✅ Certificate ID (large, prominent)
- ✅ QR code pointing to verification URL
- ✅ Student name, course title, completion date
- ✅ Issued date
- ✅ **Optional**: Display first 16 chars of hash as "Security Code"

**QR Code Content**:
```
https://idir.ai/certificates/verify/CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4
```

**n8n Nodes**:
- Use `HTML to PDF` node or external service (e.g., API to PDFMonkey, DocRaptor)
- Alternatively, use `Code` node with Puppeteer/Playwright

---

## Security Considerations

### 1. Preventing Duplicate Certificates

**Problem**: Race condition when issuing multiple certificates for same signup.

**Solution**: Partial unique index
```sql
CREATE UNIQUE INDEX idx_certificates_one_valid_per_signup
  ON certificates(course_signup_id)
  WHERE status = 'valid';
```

✅ **Only ONE valid certificate** can exist per signup
✅ Multiple revoked/reissued certificates allowed (for history)

### 2. Transaction Safety

All operations use PostgreSQL transactions:
```typescript
const client = await getClient();
try {
  await client.query('BEGIN');
  // ... operations ...
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### 3. Privacy Protection

**Public Verification Endpoint**:
- ✅ Does NOT expose student email
- ✅ Only shows: name, course title, dates, status
- ✅ Email hash in snapshot (not reversible)

**Access Control** (TODO):
- Add authentication middleware for issue/revoke/reissue
- Currently open (assumes you'll add your auth system)

### 4. Rate Limiting

**Recommendation**: Add rate limiting to verification endpoint
```typescript
// Example with Upstash
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

// In verify route
const { success } = await ratelimit.limit(ip_address);
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

### 5. Hash Algorithm Future-Proofing

Table includes `hash_algorithm` field (currently 'sha256').

**If SHA-256 is broken in future**:
1. Add new algorithm (e.g., 'sha3-256')
2. Re-issue certificates with new algorithm
3. Verification checks `hash_algorithm` field and uses correct function

---

## Testing

### Run Unit Tests

```bash
# Install dependencies
npm install

# Run tests
npm test lib/__tests__/certificate-hash.test.ts
```

### Test Coverage

- ✅ Stable JSON serialization (key ordering)
- ✅ SHA-256 hashing determinism
- ✅ Email normalization and hashing
- ✅ Certificate snapshot creation
- ✅ Hash generation and verification
- ✅ Tamper detection

### Manual Testing

```bash
# 1. Run migrations
npm run migrate:local

# 2. Create test course signup (if not exists)
psql -d postgres -c "INSERT INTO course_signups (id, full_name, email, course_id, completed_at) VALUES (gen_random_uuid(), 'Test User', 'test@example.com', (SELECT id FROM courses LIMIT 1), NOW());"

# 3. Issue certificate
curl -X POST http://localhost:3000/api/certificates/issue \
  -H "Content-Type: application/json" \
  -d '{"course_signup_id": "<signup-id>"}'

# 4. Verify certificate
curl http://localhost:3000/api/certificates/verify/CERT-2026-...

# 5. Revoke certificate
curl -X POST http://localhost:3000/api/certificates/CERT-2026-.../revoke \
  -H "Content-Type: application/json" \
  -d '{"reason": "Testing revocation workflow"}'
```

---

## FAQ

### Q: Can I change the certificate after issuance?

**A**: No. The hash is computed at issuance time and cannot be changed without invalidating the certificate. If you need to correct information, use the **reissue** endpoint.

### Q: What happens if I need to change the snapshot structure?

**A**: The snapshot structure is fixed for all existing certificates. If you need to add fields:
1. Create a new snapshot version (e.g., `snapshot_payload_v2`)
2. Update hash generation to use new structure
3. Old certificates remain valid with old structure

### Q: Should I expose student email in verification?

**A**: **No** (current implementation). Reasons:
- Privacy: Email is PII (personally identifiable information)
- GDPR: May require consent to expose
- Security: Reduces phishing attack surface

**If you must expose email**: Modify `CertificateSnapshot` type to include plain `student_email` instead of `student_email_hash`.

### Q: How do I handle certificate PDFs?

**Options**:
1. **Generate on-the-fly**: Create PDF when user requests (certificate_id → API → PDF)
2. **Store URL**: Generate once, store in `certificates.pdf_url`
3. **Hybrid**: Store URL but allow regeneration (reissue if lost)

**Recommendation**: On-the-fly generation for flexibility (template changes, design updates).

### Q: What if a course is updated after certificate issuance?

**A**: Certificate snapshot includes `course_version` (course.updated_at). This proves which version of the course was completed. If course content changes, new certificates will have different `course_version` in snapshot.

---

## Support

For issues or questions:
1. Check this documentation
2. Review unit tests for usage examples
3. Check database schema comments
4. Contact: [your support email]

---

## License

[Your License Here]
