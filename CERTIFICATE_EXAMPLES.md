# Certificate System - Examples

## Generated Certificates

### New Format (IDIR)

#### 1. Roberto Chen - Workflow Automation Mastery
```
Certificate ID: IDIR-WORKFLOW-2026-4D4DE8
Direct URL: https://idir.ai/en/certificates/verify/IDIR-WORKFLOW-2026-4D4DE8
Issued: January 22, 2026
```

**LinkedIn Share:**
> I'm proud to share that I've completed the **Workflow Automation Mastery** course!
>
> Verify my certificate: https://idir.ai/en/certificates/verify/IDIR-WORKFLOW-2026-4D4DE8
>
> Certificate ID: IDIR-WORKFLOW-2026-4D4DE8

---

#### 2. Sofia González - IA y Automatización
```
Certificate ID: IDIR-IA-2026-80AF0A
Direct URL: https://idir.ai/en/certificates/verify/IDIR-IA-2026-80AF0A
Issued: January 22, 2026
```

**Twitter/X Share:**
> Just completed "IA y Automatización" 🎓
>
> Certificate: https://idir.ai/en/certificates/verify/IDIR-IA-2026-80AF0A
>
> #AI #Automation #LearningJourney

---

### Legacy Format (CERT) - Still Supported

#### 3. John Doe - Automation 101
```
Certificate ID: CERT-2026-81E1CA3F-C181-435D-8422-2D103595DA12
Direct URL: https://idir.ai/en/certificates/verify/CERT-2026-81E1CA3F-C181-435D-8422-2D103595DA12
Issued: January 22, 2026
```

---

## Format Comparison

### New Format (IDIR)
✅ **Shorter**: 24 characters vs 46
✅ **Course context**: `WORKFLOW`, `IA`, `AUTO`
✅ **Memorable**: Easier to type/share verbally
✅ **Professional**: Custom branded prefix

Example: `IDIR-WORKFLOW-2026-4D4DE8`

### Legacy Format (CERT)
✅ **Still valid**: All existing certificates work
✅ **UUID-based**: Maximum uniqueness guarantee
✅ **Backwards compatible**: No migration needed

Example: `CERT-2026-81E1CA3F-C181-435D-8422-2D103595DA12`

---

## API Endpoints

All endpoints support both formats:

### Verify Certificate
```bash
GET /api/certificates/verify/{certificate_id}

# New format
curl "https://idir.ai/api/certificates/verify/IDIR-WORKFLOW-2026-4D4DE8"

# Legacy format
curl "https://idir.ai/api/certificates/verify/CERT-2026-81E1CA3F..."
```

**Response:**
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

---

## Direct URLs (Auto-Verification)

Users can share these URLs directly. No manual steps required!

### English
```
https://idir.ai/en/certificates/verify/IDIR-WORKFLOW-2026-4D4DE8
https://idir.ai/en/certificates/verify/IDIR-IA-2026-80AF0A
```

### Spanish
```
https://idir.ai/es/certificates/verify/IDIR-WORKFLOW-2026-4D4DE8
https://idir.ai/es/certificates/verify/IDIR-IA-2026-80AF0A
```

**What happens:**
1. Page loads with certificate ID pre-filled
2. Auto-verification runs immediately
3. Certificate details display automatically
4. Rich metadata for social sharing (Open Graph)

---

## Social Media Preview

When shared on LinkedIn, Twitter, or Facebook, the link shows:

**Title:** "Official Certificate of Roberto Chen - idir.ai"

**Description:** "Roberto Chen successfully completed the 'Workflow Automation Mastery' course. Certificate IDIR-WORKFLOW-2026-4D4DE8 issued on January 22, 2026. Verified and authenticated by idir.ai"

**Image:** Custom OG image (og-image.png)

---

## Manual Issuance

### Single Certificate
```bash
npx tsx scripts/issue-manual-certificate.ts \
  --name "Student Name" \
  --email "student@example.com" \
  --course-title "Course Title" \
  --completed-at "2026-01-22" \
  --actor "admin@example.com"
```

### Bulk Import (CSV)
```bash
npx tsx scripts/bulk-import-certificates.ts certificates.csv --actor "admin@example.com"
```

**CSV Format:**
```csv
student_name,student_email,course_title,completed_at,course_id
Roberto Chen,roberto@example.com,Workflow Automation Mastery,2026-01-22,
Sofia González,sofia@example.com,IA y Automatización,2026-01-22,
```

---

## Course Slug Examples

The system automatically generates course slugs from titles:

| Course Title | Generated Slug | Example Certificate ID |
|-------------|----------------|----------------------|
| Automation 101 | AUTO | `IDIR-AUTO-2026-ABC123` |
| Automation Advanced | AUTOMATI | `IDIR-AUTOMATI-2026-DEF456` |
| IA y Automatización | IA | `IDIR-IA-2026-GHI789` |
| Workflow Automation Mastery | WORKFLOW | `IDIR-WORKFLOW-2026-JKL012` |
| Systems Thinking | SYSTEMS | `IDIR-SYSTEMS-2026-MNO345` |
| Leadership & Management | LEADERSH | `IDIR-LEADERSH-2026-PQR678` |

**Logic:**
- Takes first meaningful word (skips articles: the, a, an, y, e, and, or)
- Max 8 characters
- Uppercase
- Removes diacritics (á → a, ñ → n, etc.)

---

## Security Features

Both formats include:

✅ **SHA-256 Hash**: Integrity verification
✅ **Deterministic Snapshots**: Tamper detection
✅ **Audit Trail**: Every verification logged
✅ **Revocation Support**: Invalidate if needed
✅ **Re-issuance**: Generate new certificate
✅ **Privacy**: Email hashed, never exposed

---

## Statistics

Current database:
- **Total Certificates**: 9
- **New Format (IDIR)**: 2
- **Legacy Format (CERT)**: 7
- **Valid**: 9
- **Revoked**: 0
- **Re-issued**: 0

---

## Testing Commands

```bash
# Test new format
curl "http://localhost:3001/api/certificates/verify/IDIR-WORKFLOW-2026-4D4DE8"

# Test legacy format
curl "http://localhost:3001/api/certificates/verify/CERT-2026-81E1CA3F..."

# Test Spanish localization
curl "http://localhost:3001/api/certificates/verify/IDIR-IA-2026-80AF0A?lang=es"

# Test direct URL (browser)
open "http://localhost:3001/en/certificates/verify/IDIR-WORKFLOW-2026-4D4DE8"
```

---

## Production Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_SITE_URL` in .env
- [ ] Generate custom OG images per certificate (optional)
- [ ] Add rate limiting to verification endpoint
- [ ] Set up monitoring/alerts for API errors
- [ ] Test social media sharing on all platforms
- [ ] Update documentation with production URLs
- [ ] Train team on new format benefits

---

## Support

For questions or issues:
- See `CERTIFICATE_REFACTOR.md` for complete documentation
- See `CERTIFICATE_SYSTEM.md` for API reference
- GitHub: https://github.com/yourusername/idir.ai/issues
