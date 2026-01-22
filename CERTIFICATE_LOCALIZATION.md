# Certificate API Localization Guide

## Overview

All certificate API endpoints now support **bilingual responses** in English and Spanish. The API automatically detects the preferred language and returns all messages, errors, and field labels in that language.

## Supported Languages

- 🇺🇸 **English** (`en`) - Default
- 🇪🇸 **Spanish** (`es`)

---

## How to Specify Language

The API detects language preference in the following order:

### 1. Query Parameter (Highest Priority)

Add `?lang=es` or `?locale=es` to any API endpoint:

```bash
# Spanish
GET /api/certificates/verify/CERT-2026-...?lang=es

# English
GET /api/certificates/verify/CERT-2026-...?lang=en
```

**Supported values**:
- `lang=es`, `lang=spanish`, `lang=español` → Spanish
- `lang=en`, `lang=english`, `lang=inglés` → English

### 2. Accept-Language Header

The API respects the standard `Accept-Language` HTTP header:

```bash
curl -H "Accept-Language: es-ES,es;q=0.9" \
  http://localhost:3000/api/certificates/verify/CERT-2026-...
```

**Examples**:
- `Accept-Language: es` → Spanish
- `Accept-Language: es-ES,es;q=0.9,en;q=0.8` → Spanish (priority order)
- `Accept-Language: en-US,en;q=0.9` → English
- `Accept-Language: fr,es;q=0.8,en;q=0.6` → Spanish (highest priority supported)

### 3. Default (Fallback)

If no language is specified, defaults to **English**.

---

## API Examples

### Example 1: Verify Certificate (English)

**Request**:
```bash
curl http://localhost:3000/api/certificates/verify/CERT-2026-ABC...?lang=en
```

**Response**:
```json
{
  "found": true,
  "certificate_id": "CERT-2026-ABC...",
  "status": "valid",
  "student_name": "John Doe",
  "course_title": "Automation 101",
  "issued_at": "2026-01-21T10:30:00.000Z",
  "completed_at": "2026-01-20T15:45:00.000Z",
  "message": "This certificate is valid and authentic."
}
```

### Example 2: Verify Certificate (Spanish)

**Request**:
```bash
curl http://localhost:3000/api/certificates/verify/CERT-2026-ABC...?lang=es
```

**Response**:
```json
{
  "found": true,
  "certificate_id": "CERT-2026-ABC...",
  "status": "valid",
  "student_name": "John Doe",
  "course_title": "Automation 101",
  "issued_at": "2026-01-21T10:30:00.000Z",
  "completed_at": "2026-01-20T15:45:00.000Z",
  "message": "Este certificado es válido y auténtico."
}
```

### Example 3: Certificate Not Found (English)

**Request**:
```bash
curl http://localhost:3000/api/certificates/verify/CERT-2026-INVALID
```

**Response** (404):
```json
{
  "found": false,
  "certificate_id": "CERT-2026-INVALID",
  "message": "Certificate not found. Please verify the certificate ID is correct."
}
```

### Example 4: Certificate Not Found (Spanish)

**Request**:
```bash
curl -H "Accept-Language: es" \
  http://localhost:3000/api/certificates/verify/CERT-2026-INVALID
```

**Response** (404):
```json
{
  "found": false,
  "certificate_id": "CERT-2026-INVALID",
  "message": "Certificado no encontrado. Por favor verifica que el ID sea correcto."
}
```

### Example 5: Revoked Certificate (Spanish)

**Request**:
```bash
curl http://localhost:3000/api/certificates/verify/CERT-2026-REVOKED?locale=es
```

**Response** (200):
```json
{
  "found": true,
  "certificate_id": "CERT-2026-REVOKED",
  "status": "revoked",
  "student_name": "Jane Doe",
  "course_title": "Automation 101",
  "issued_at": "2026-01-20T10:00:00.000Z",
  "completed_at": "2026-01-19T15:30:00.000Z",
  "revoked_at": "2026-01-21T09:00:00.000Z",
  "revoked_reason": "Course not completed properly",
  "message": "Este certificado ha sido revocado."
}
```

### Example 6: Issue Certificate (Spanish)

**Request**:
```bash
curl -X POST http://localhost:3000/api/certificates/issue?lang=es \
  -H "Content-Type: application/json" \
  -d '{"course_signup_id": "abc-123-..."}'
```

**Response** (201):
```json
{
  "success": true,
  "message": "Certificado emitido exitosamente",
  "certificate_id": "CERT-2026-NEW...",
  "status": "valid",
  "issued_at": "2026-01-22T10:00:00.000Z",
  "payload_hash": "a7f3d2c1...",
  "verification_url": "https://idir.ai/certificates/verify/CERT-2026-NEW..."
}
```

### Example 7: Revoke Certificate (Spanish)

**Request**:
```bash
curl -X POST http://localhost:3000/api/certificates/CERT-2026-ABC.../revoke?lang=es \
  -H "Content-Type: application/json" \
  -d '{"reason": "Estudiante no completó el curso correctamente"}'
```

**Response** (200):
```json
{
  "success": true,
  "message": "Certificado revocado exitosamente",
  "certificate_id": "CERT-2026-ABC..."
}
```

### Example 8: Error Response (Spanish)

**Request**:
```bash
curl -X POST http://localhost:3000/api/certificates/issue?lang=es \
  -H "Content-Type: application/json" \
  -d '{"course_signup_id": "invalid"}'
```

**Response** (400):
```json
{
  "success": false,
  "error": "Cuerpo de solicitud inválido",
  "details": [...]
}
```

---

## Translation Coverage

### All Endpoints Support

✅ **Success Messages**
✅ **Error Messages**
✅ **Validation Errors**
✅ **Status Messages**

### Endpoints

| Endpoint | Method | Localized |
|----------|--------|-----------|
| `/api/certificates/issue` | POST | ✅ |
| `/api/certificates/:id/revoke` | POST | ✅ |
| `/api/certificates/:id/reissue` | POST | ✅ |
| `/api/certificates/verify/:id` | GET | ✅ |

---

## Complete Translation Reference

### Issue Endpoint

| English | Spanish |
|---------|---------|
| Certificate issued successfully | Certificado emitido exitosamente |
| Course signup not found | Inscripción al curso no encontrada |
| Course signup is not completed | La inscripción al curso no está completada |
| Invalid request body | Cuerpo de solicitud inválido |
| Internal server error | Error interno del servidor |

### Revoke Endpoint

| English | Spanish |
|---------|---------|
| Certificate revoked successfully | Certificado revocado exitosamente |
| Certificate not found | Certificado no encontrado |
| Certificate is already revoked | El certificado ya está revocado |
| Invalid certificate ID format | Formato de ID de certificado inválido |
| Reason must be at least 10 characters | La razón debe tener al menos 10 caracteres |

### Reissue Endpoint

| English | Spanish |
|---------|---------|
| Certificate reissued successfully | Certificado reemitido exitosamente |
| Certificate not found | Certificado no encontrado |
| Invalid certificate ID format | Formato de ID de certificado inválido |

### Verify Endpoint

| English | Spanish |
|---------|---------|
| This certificate is valid and authentic. | Este certificado es válido y auténtico. |
| This certificate has been revoked. | Este certificado ha sido revocado. |
| This certificate has been reissued. | Este certificado ha sido reemitido. |
| Certificate not found. Please verify... | Certificado no encontrado. Por favor verifica... |
| Invalid certificate ID format | Formato de ID de certificado inválido |
| The certificate ID should be in the format... | El ID del certificado debe tener el formato... |

---

## Integration Examples

### JavaScript/TypeScript Client

```typescript
// Detect user's browser language
const userLanguage = navigator.language.startsWith('es') ? 'es' : 'en';

// Verify certificate with language
async function verifyCertificate(certificateId: string) {
  const response = await fetch(
    `/api/certificates/verify/${certificateId}?lang=${userLanguage}`
  );
  const data = await response.json();

  console.log(data.message); // Localized message
  return data;
}
```

### React Component

```tsx
import { useState } from 'react';

function CertificateVerifier() {
  const [locale, setLocale] = useState('en');

  const verify = async (certId: string) => {
    const res = await fetch(
      `/api/certificates/verify/${certId}?lang=${locale}`
    );
    const data = await res.json();

    alert(data.message); // Localized alert
  };

  return (
    <div>
      <select value={locale} onChange={e => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
      {/* ... */}
    </div>
  );
}
```

### n8n Workflow

```javascript
// In n8n HTTP Request node
// Set header based on student's language preference

const studentLanguage = $json.student.language; // 'en' or 'es'

return {
  url: `https://idir.ai/api/certificates/verify/${certificateId}`,
  headers: {
    'Accept-Language': studentLanguage === 'es' ? 'es-ES' : 'en-US'
  }
};
```

### Email Template (Multilingual)

```typescript
const language = student.preferred_language; // 'en' or 'es'

const verifyUrl = `https://idir.ai/api/certificates/verify/${certId}?lang=${language}`;

// Email will show localized verification response
```

---

## UI Integration

The verification UI page (`/certificates/verify`) automatically uses the API's localized responses:

```tsx
// The UI already detects locale from URL
// /en/certificates/verify → calls API with ?lang=en
// /es/certificates/verify → calls API with ?lang=es

const response = await fetch(
  `/api/certificates/verify/${certificateId}?lang=${isSpanish ? 'es' : 'en'}`
);
const data = await response.json();

// Display localized message
<p>{data.message}</p>
```

---

## Adding New Languages

To add support for additional languages:

### 1. Update `lib/certificate-i18n.ts`

```typescript
const translations = {
  en: { /* ... */ },
  es: { /* ... */ },
  fr: { // New: French
    'verify.valid': 'Ce certificat est valide et authentique.',
    // ... add all keys
  },
};

export type Locale = 'en' | 'es' | 'fr';
```

### 2. Update `detectLocale()` function

```typescript
export function detectLocale(request: Request): Locale {
  // Add French detection
  for (const lang of languages) {
    if (lang.code === 'fr') return 'fr';
    if (lang.code === 'es') return 'es';
    if (lang.code === 'en') return 'en';
  }

  return 'en';
}
```

### 3. Test

```bash
curl -H "Accept-Language: fr" \
  http://localhost:3000/api/certificates/verify/CERT-2026-...
```

---

## Best Practices

### 1. Always Include Language in Programmatic Calls

```typescript
// ✅ Good
fetch(`/api/certificates/verify/${id}?lang=es`)

// ❌ Bad - relies on browser header
fetch(`/api/certificates/verify/${id}`)
```

### 2. Store User Language Preference

```typescript
// Save in user profile
const user = {
  email: 'student@example.com',
  preferred_language: 'es', // Store this
};

// Use when making API calls
const lang = user.preferred_language;
```

### 3. Test Both Languages

```bash
# Always test both languages
npm run test:api:en
npm run test:api:es
```

### 4. Update Translations When Adding New Messages

When adding new error messages, update **both** English and Spanish:

```typescript
const translations = {
  en: {
    'new.error': 'New error message',
  },
  es: {
    'new.error': 'Nuevo mensaje de error', // Don't forget Spanish!
  },
};
```

---

## Troubleshooting

### Issue: API returns English despite setting Spanish

**Solution**: Check the order of preference
```bash
# Debug: Check what language is detected
console.log(detectLocale(request)); // Should log 'es'

# Make sure query param is correct
?lang=es  ✅
?lang=spanish  ✅
?lang=español  ✅
?language=es  ❌ (wrong param name)
```

### Issue: Missing translations

**Solution**: Check console for warnings
```
[i18n] Missing translation for key: xyz (locale: es)
```

Add the missing key to `lib/certificate-i18n.ts`.

### Issue: Wrong language in n8n workflow

**Solution**: Explicitly set Accept-Language header
```javascript
headers: {
  'Accept-Language': 'es-ES,es;q=0.9'
}
```

---

## Performance

Localization adds **< 1ms** overhead:
- Translations are in-memory (no database lookup)
- Simple key-value lookup
- No external API calls

---

## Support

For questions or issues:
- See `lib/certificate-i18n.ts` for all translations
- Check API endpoint files for localization implementation
- Test with `?lang=es` query parameter

---

**Happy Localizing!** 🌍
