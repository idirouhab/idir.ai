# Certificate System Refactoring

## Overview

The certificate verification system has been completely refactored to support three key improvements:

1. **New Certificate ID Format**: Shorter, more memorable IDs with course context
2. **Dynamic Routes**: Auto-verification via direct URLs
3. **SEO & Open Graph**: Rich social sharing previews

---

## 1. New Certificate ID Format

### Legacy Format (Still Supported)
```
CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4
```
- 46 characters long
- Generic UUID format
- No course context

### New Format (Optional)
```
IDIR-AUTO-2026-A3F9B2
IDIR-SYSTEMS-2026-8FD432
IDIR-IA-2026-AC4C61
```
- **Structure**: `IDIR-[COURSE_SLUG]-[YEAR]-[HASH6]`
- **Course Slug**: First meaningful word from course title (max 8 chars)
- **Hash**: 6-character secure random alphanumeric
- **Length**: ~20-25 characters (50% shorter!)

### Format Examples

| Course Title | Generated ID |
|-------------|--------------|
| "Automation 101" | `IDIR-AUTOMATI-2026-15CF95` |
| "Systems Thinking" | `IDIR-SYSTEMS-2026-8FD432` |
| "IA y Automatización" | `IDIR-IA-2026-AC4C61` |

### Enabling New Format

Add to `.env.local`:
```bash
USE_NEW_CERT_FORMAT=true
```

**Note**: Both formats are fully supported. Legacy certificates continue working normally.

---

## 2. Dynamic Routes & Auto-Verification

### Previous Behavior
Users had to:
1. Visit `/certificates/verify`
2. Manually paste certificate ID
3. Click "Verify" button

### New Behavior
Direct URL verification:
```
https://idir.ai/en/certificates/verify/IDIR-AUTO-2026-A3F9B2
https://idir.ai/es/certificates/verify/CERT-2026-81E1CA3F...
```

**Benefits:**
- ✅ Share certificate as a single clickable link
- ✅ Auto-verification on page load (no manual steps)
- ✅ Better UX for LinkedIn/email sharing
- ✅ Backwards compatible with manual search

### Implementation Details

**Route Structure:**
```
app/[locale]/certificates/verify/[[...id]]/
├── page.tsx              # Server Component (metadata + routing)
└── CertificateVerifyClient.tsx  # Client Component (UI logic)
```

The `[[...id]]` catch-all route handles both cases:
- `/verify` → Shows search form
- `/verify/:id` → Auto-verifies certificate

---

## 3. SEO & Open Graph Metadata

### Dynamic Page Titles

**Without Certificate ID:**
```html
<title>Verify Your Certificate - idir.ai</title>
```

**With Valid Certificate:**
```html
<title>Official Certificate of John Doe - idir.ai</title>
```

### Open Graph Tags for Social Sharing

When sharing on LinkedIn, Twitter, or Facebook:

```html
<meta property="og:title" content="Official Certificate of John Doe - idir.ai" />
<meta property="og:description" content="John Doe successfully completed the 'Automation 101' course. Certificate IDIR-AUTO-2026-A3F9B2 issued on January 22, 2026." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://idir.ai/en/certificates/verify/IDIR-AUTO-2026-A3F9B2" />
<meta property="og:image" content="https://idir.ai/og-image.png" />
```

### Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Official Certificate of John Doe - idir.ai" />
<meta name="twitter:creator" content="@idir_ai" />
```

### Multilingual Support

Canonical URLs and language alternates:
```html
<link rel="canonical" href="https://idir.ai/en/certificates/verify/IDIR-AUTO-2026-A3F9B2" />
<link rel="alternate" hreflang="es" href="https://idir.ai/es/certificates/verify/IDIR-AUTO-2026-A3F9B2" />
<link rel="alternate" hreflang="en" href="https://idir.ai/en/certificates/verify/IDIR-AUTO-2026-A3F9B2" />
```

---

## API Updates

All certificate API endpoints now support both formats:

### Verification API
```bash
GET /api/certificates/verify/IDIR-AUTO-2026-A3F9B2
GET /api/certificates/verify/CERT-2026-81E1CA3F...
```

### Revoke API
```bash
POST /api/certificates/IDIR-AUTO-2026-A3F9B2/revoke
POST /api/certificates/CERT-2026-81E1CA3F.../revoke
```

### Reissue API
```bash
POST /api/certificates/IDIR-AUTO-2026-A3F9B2/reissue
POST /api/certificates/CERT-2026-81E1CA3F.../reissue
```

**Validation**: Uses `isValidCertificateId()` function that validates both formats.

---

## Migration Guide

### For Existing Certificates
**No action needed!** Legacy certificates (`CERT-YYYY-UUID`) continue working indefinitely.

### For New Certificates

#### Option 1: Enable New Format Globally
```bash
# .env.local
USE_NEW_CERT_FORMAT=true
```

All new certificates will use `IDIR-COURSE-YYYY-HASH6` format.

#### Option 2: Keep Legacy Format
Don't set the environment variable. All certificates will use the legacy format.

### Manual Certificate Issuance

```bash
# Single certificate (respects USE_NEW_CERT_FORMAT env var)
npx tsx scripts/issue-manual-certificate.ts \
  --name "Student Name" \
  --email "student@example.com" \
  --course-title "Automation 101" \
  --completed-at "2026-01-22"

# Bulk import from CSV (respects USE_NEW_CERT_FORMAT env var)
npx tsx scripts/bulk-import-certificates.ts certificates.csv
```

---

## Technical Implementation

### Core Files Created/Modified

#### New Files
- `lib/certificate-id.ts` - ID generation and validation functions
- `app/[locale]/certificates/verify/[[...id]]/page.tsx` - Server Component
- `app/[locale]/certificates/verify/[[...id]]/CertificateVerifyClient.tsx` - Client Component

#### Modified Files
- `lib/certificates.ts` - Updated `generateCertificateId()` to support both formats
- `app/api/certificates/verify/[certificateId]/route.ts` - Updated validation
- `app/api/certificates/[certificateId]/revoke/route.ts` - Updated validation
- `app/api/certificates/[certificateId]/reissue/route.ts` - Updated validation
- `scripts/issue-manual-certificate.ts` - Pass course title to ID generator

### Key Functions

#### `generateNewCertificateId(courseTitle: string): string`
```typescript
generateNewCertificateId("Automation 101")
// Returns: "IDIR-AUTOMATI-2026-15CF95"
```

#### `isValidCertificateId(certId: string): boolean`
```typescript
isValidCertificateId("IDIR-AUTO-2026-A3F9B2")      // true
isValidCertificateId("CERT-2026-3F9A2C1E...")      // true
isValidCertificateId("INVALID-123")                // false
```

#### `detectCertificateFormat(certId: string): 'legacy' | 'new' | 'invalid'`
```typescript
detectCertificateFormat("IDIR-AUTO-2026-A3F9B2")    // 'new'
detectCertificateFormat("CERT-2026-3F9A2C1E...")    // 'legacy'
```

---

## Testing

### Test Legacy Certificate Verification
```bash
# Direct URL (auto-verify)
curl "http://localhost:3001/en/certificates/verify/CERT-2026-81E1CA3F-C181-435D-8422-2D103595DA12"

# API endpoint
curl "http://localhost:3001/api/certificates/verify/CERT-2026-81E1CA3F-C181-435D-8422-2D103595DA12"
```

### Test New Format Generation
```bash
npx tsx -e "
import { generateNewCertificateId } from './lib/certificate-id';
console.log(generateNewCertificateId('Automation 101'));
console.log(generateNewCertificateId('Systems Thinking'));
console.log(generateNewCertificateId('IA y Automatización'));
"
```

### Test Both Formats
```typescript
// New format
https://idir.ai/en/certificates/verify/IDIR-AUTO-2026-A3F9B2

// Legacy format (still works!)
https://idir.ai/en/certificates/verify/CERT-2026-81E1CA3F-C181-435D-8422-2D103595DA12
```

---

## Benefits Summary

### User Experience
- ✅ **50% shorter certificate IDs** (easier to share verbally)
- ✅ **One-click verification** via direct URLs
- ✅ **Rich social previews** on LinkedIn/Twitter
- ✅ **Course context** in the ID itself

### Technical
- ✅ **Backwards compatible** (legacy IDs work forever)
- ✅ **SEO optimized** (dynamic titles, canonical URLs)
- ✅ **Bilingual metadata** (ES/EN support)
- ✅ **Type-safe** validation for both formats

### Business
- ✅ **Better engagement** on social media
- ✅ **Professional appearance** when sharing
- ✅ **Brand consistency** (IDIR prefix)
- ✅ **Audit trail preserved** (hash integrity unchanged)

---

## Next Steps (Optional Enhancements)

1. **Dynamic OG Images**: Generate custom certificate preview images per certificate
2. **QR Codes**: Add QR code generation for physical certificates
3. **PDF Generation**: Auto-generate PDF certificates with the new ID format
4. **Analytics**: Track verification sources (LinkedIn, email, direct)
5. **Rate Limiting**: Add rate limiting to verification endpoint

---

## Support

For questions or issues:
- GitHub: https://github.com/anthropics/claude-code/issues
- Documentation: See `CERTIFICATE_SYSTEM.md` for full API reference
