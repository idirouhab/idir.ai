# Certificate Verification UI - Usage Guide

## Overview

A public-facing certificate verification page where anyone can verify the authenticity of course certificates by entering the certificate ID.

## Access URL

```
https://idir.ai/en/certificates/verify
https://idir.ai/es/certificates/verify
```

## Features

✅ **Clean, Modern UI** - Matches your site's design system
✅ **Multi-language Support** - English and Spanish via next-intl
✅ **Real-time Validation** - Instant feedback on certificate status
✅ **Multiple States** - Valid, Revoked, Reissued, Not Found, Error
✅ **Mobile Responsive** - Works on all devices
✅ **Accessibility** - Proper labels and ARIA attributes

---

## User Flow

### 1. User lands on verification page
- Sees input field for Certificate ID
- Enters ID in format: `CERT-2026-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

### 2. User clicks "Verify" button
- Shows loading spinner
- Calls `/api/certificates/verify/:certificate_id`

### 3. Results displayed based on status:

#### ✅ Valid Certificate
Shows:
- Green success banner with checkmark
- Student name
- Course title
- Completion date
- Issue date
- Certificate ID
- "Certificate can be publicly verified" message

#### ❌ Revoked Certificate
Shows:
- Red revoked banner with X icon
- Student name
- Revocation date
- Revocation reason
- Warning message

#### ⚠️ Reissued Certificate
Shows:
- Orange warning banner
- Student name
- Message to contact issuer for new certificate ID

#### 🔍 Not Found
Shows:
- Gray not-found banner
- Friendly message suggesting to check the ID

#### ⚠️ Error
Shows:
- Red error banner
- Error message
- Suggestion to try again

### 4. User can verify another certificate
- "Verify Another Certificate" button resets the form

---

## UI Components

### Color Scheme
```css
Background: #0a0a0a (black)
Card: #111827 (dark gray)
Border: #1f2937 (medium gray)
Accent: #10b981 (green) for valid certificates
Error: #ef4444 (red) for revoked/errors
Warning: #f59e0b (orange) for reissued
Text: #ffffff (white) for headings
Subtle text: #d1d5db (light gray)
Muted text: #9ca3af (medium gray)
```

### Typography
- Headlines: Bold, uppercase, tracking-tight
- Body: Regular, relaxed line-height
- Certificate ID: Monospace font

### Icons Used (from lucide-react)
- `Check` - Valid certificate
- `X` - Revoked/Error
- `AlertCircle` - Warning/Not found
- `Search` - Verify button
- `ExternalLink` - Navigation links

---

## Integration Examples

### Example 1: Share Verification Link

When you issue a certificate via API, you can generate a direct link:

```typescript
const certificateId = 'CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4';
const verifyUrl = `https://idir.ai/en/certificates/verify`;

// Send to student
await sendEmail({
  to: student.email,
  subject: 'Your Course Certificate',
  body: `
    Congratulations! Your certificate is ready.

    Certificate ID: ${certificateId}

    Verify at: ${verifyUrl}
    (Enter your certificate ID on the page)
  `
});
```

### Example 2: QR Code on PDF Certificate

Generate QR code pointing to verification page:

```typescript
import QRCode from 'qrcode';

const certificateId = 'CERT-2026-...';
const qrCodeUrl = `https://idir.ai/en/certificates/verify`;

// Generate QR code
const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

// Include in PDF
// Users scan QR → Opens verify page → Manually enter certificate ID
```

**Note**: The QR code points to the page, users still need to enter the ID manually for security.

### Example 3: Direct API Call (for Integrations)

If you want to verify programmatically without the UI:

```typescript
const certificateId = 'CERT-2026-...';

const response = await fetch(`https://idir.ai/api/certificates/verify/${certificateId}`);
const data = await response.json();

if (data.found && data.status === 'valid') {
  console.log('✓ Valid certificate');
  console.log(`Student: ${data.student_name}`);
  console.log(`Course: ${data.course_title}`);
} else {
  console.log('✗ Invalid or revoked');
}
```

---

## Localization

The page supports English and Spanish based on the URL:

**English**: `/en/certificates/verify`
**Spanish**: `/es/certificates/verify`

### Key Translations

| English | Spanish |
|---------|---------|
| Verify Your Certificate | Verifica tu Certificado |
| Certificate ID | ID del Certificado |
| Verify | Verificar |
| Valid Certificate | Certificado Válido |
| Certificate Revoked | Certificado Revocado |
| Certificate Reissued | Certificado Reemitido |
| Certificate Not Found | Certificado No Encontrado |
| Student | Estudiante |
| Course | Curso |
| Completed on | Completado el |
| Issued on | Emitido el |
| Revoked on | Revocado el |
| Reason | Razón |
| Verify Another Certificate | Verificar Otro Certificado |

---

## Testing the UI

### Test Case 1: Valid Certificate

1. Issue a certificate:
```bash
curl -X POST http://localhost:3000/api/certificates/issue \
  -H "Content-Type: application/json" \
  -d '{"course_signup_id": "your-signup-uuid"}'
```

2. Copy the `certificate_id` from the response

3. Visit: `http://localhost:3000/en/certificates/verify`

4. Paste certificate ID and click "Verify"

5. Should show **green success message** with student details

### Test Case 2: Revoked Certificate

1. Revoke a certificate:
```bash
curl -X POST http://localhost:3000/api/certificates/CERT-2026-.../revoke \
  -H "Content-Type: application/json" \
  -d '{"reason": "Testing revocation workflow"}'
```

2. Visit verification page

3. Enter the revoked certificate ID

4. Should show **red revoked message** with reason

### Test Case 3: Invalid Certificate ID

1. Visit verification page

2. Enter: `CERT-2026-INVALID-ID`

3. Should show **gray not-found message**

### Test Case 4: Empty Input

1. Visit verification page

2. Click "Verify" without entering anything

3. Should show **red error message** asking for input

---

## Customization

### Change Accent Color

To change from green to another color, replace all instances of:
- `#10b981` with your color (e.g., `#3b82f6` for blue)
- Update the border-l-[#10b981] classes

### Add Company Logo

Add your logo to the header section:

```tsx
<div className="mb-10">
  {/* Add logo here */}
  <img src="/logo.png" alt="Company" className="h-12 mb-6" />

  <div className="flex items-center gap-4 mb-6">
    {/* ... rest of header */}
  </div>
</div>
```

### Add Analytics Tracking

Track when users verify certificates:

```tsx
const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();

  // Add tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'certificate_verify', {
      certificate_id: certificateId,
    });
  }

  // ... rest of verification logic
};
```

---

## Security Considerations

### 1. Rate Limiting

**Recommendation**: Add rate limiting to the verification endpoint to prevent abuse.

```typescript
// In your API route
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 per minute
});

const { success } = await ratelimit.limit(ip);
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

### 2. No Email Exposure

The UI **never displays student email** - this is by design for privacy.

If you need to expose email, modify the API response in:
- `/app/api/certificates/verify/[certificate_id]/route.ts`

### 3. HTTPS Only

Ensure verification page is only accessible via HTTPS in production.

---

## Mobile Experience

The UI is fully responsive:

- **Mobile**: Single column layout, stacked cards
- **Tablet**: 2-column grid for certificate details
- **Desktop**: Wider max-width (4xl) for better readability

### Mobile-specific Optimizations

- Touch-friendly button sizes (py-3 = 48px min)
- Font sizes scale down on small screens (text-3xl sm:text-4xl)
- Search button text hidden on mobile (hidden sm:inline)
- Certificate ID uses horizontal scroll if too long

---

## Accessibility

✅ **Keyboard Navigation** - All interactive elements are keyboard accessible
✅ **Screen Readers** - Proper ARIA labels and semantic HTML
✅ **Color Contrast** - WCAG AA compliant contrast ratios
✅ **Focus States** - Visible focus rings on inputs and buttons
✅ **Loading States** - Announces "Verifying..." to screen readers

---

## Next Steps

1. ✅ Test with real certificate IDs
2. ⬜ Add rate limiting to API
3. ⬜ Set up monitoring/alerts for verification attempts
4. ⬜ Add Google Analytics or similar tracking
5. ⬜ Consider adding a "Report Invalid Certificate" feature
6. ⬜ Add SEO meta tags for the verification page

---

## Support

If users have issues:
- Check certificate ID format is correct
- Verify the certificate exists in the database
- Check API endpoint logs for errors
- Ensure user has stable internet connection

For developers:
- See `CERTIFICATE_SYSTEM.md` for full API documentation
- Check `app/api/certificates/verify/[certificate_id]/route.ts` for endpoint logic
- View `lib/certificates.ts` for service layer
