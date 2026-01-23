# Certificate OG Images

This document explains how OG (Open Graph) images work for the certificate verification system.

## Overview

The certificate verification system generates **dynamic OG images** that are customized for each certificate when shared on social media platforms (Twitter, LinkedIn, Facebook, etc.).

## Image Types

### 1. Static Generic Images (Localized)

For the base verification page and certificates that are not found:

- **English**: `/public/certificates/og-verify-en.png`
- **Spanish**: `/public/certificates/og-verify-es.png`

These show:
- Title: "CERTIFICATE VERIFICATION" / "CERTIFICADO VERIFICACIÓN"
- Badges: "SECURE, VERIFIED, INSTANT" / "SEGURO, VERIFICADO, INSTANTÁNEO"
- Brand: idir.ai

### 2. Dynamic Certificate Images

For verified certificates with valid data:

- **API Route**: `/api/og/certificate/[certificateId]?locale=en|es`
- **Generated on-the-fly** using Next.js Image Response API

These show:
- **Status Badge**: VALID (green) / REVOKED (red) / REISSUED (amber)
- **Student Name**: From certificate data
- **Course Title**: From certificate data
- **Certificate ID**: Unique identifier
- **Brand**: idir.ai

## How It Works

### Metadata Generation Flow

1. User visits `/[locale]/certificates/verify/[certificateId]`
2. Server fetches certificate data from API
3. If certificate exists:
   - Generates metadata with dynamic OG image URL
   - OG image URL: `https://idir.ai/api/og/certificate/[certificateId]?locale=[locale]`
4. When social media crawler requests the OG image:
   - API route fetches fresh certificate data
   - Generates image with certificate details
   - Returns as PNG (1200x630px)

### Benefits

- **Personalized Sharing**: Each certificate shows student name and course
- **Status Indication**: Visual status (valid/revoked/reissued)
- **No Storage Required**: Images generated on-demand
- **Always Fresh**: Data fetched in real-time
- **Localized**: Respects user's language preference

## Regenerating Static Images

To regenerate the static generic OG images:

```bash
node generate-certificate-og.js
```

This creates:
- `public/certificates/og-verify-en.png`
- `public/certificates/og-verify-es.png`

## Technical Details

- **Image Format**: PNG
- **Dimensions**: 1200x630px (Twitter/OG standard)
- **Runtime**: Edge (for fast generation)
- **Caching**: Handled by CDN/browser (no server cache)
- **Fallback**: Generic localized image if certificate not found

## Testing

To test the dynamic OG images:

1. Visit a certificate URL: `/en/certificates/verify/IDIR-TEST-2024-ABC123`
2. Use OG debugger tools:
   - Twitter: https://cards-dev.twitter.com/validator
   - Facebook: https://developers.facebook.com/tools/debug/
   - LinkedIn: https://www.linkedin.com/post-inspector/

## Examples

### Generic Page (No Certificate)
```
URL: https://idir.ai/en/certificates/verify
OG Image: https://idir.ai/certificates/og-verify-en.png
```

### Valid Certificate
```
URL: https://idir.ai/en/certificates/verify/IDIR-AUTO-2024-ABC123
OG Image: https://idir.ai/api/og/certificate/IDIR-AUTO-2024-ABC123?locale=en
Shows: Student name, course title, VALID badge
```

### Revoked Certificate
```
URL: https://idir.ai/es/certificates/verify/IDIR-AUTO-2024-XYZ789
OG Image: https://idir.ai/api/og/certificate/IDIR-AUTO-2024-XYZ789?locale=es
Shows: Student name, course title, REVOCADO badge (red)
```
