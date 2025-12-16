# OG Image Testing Guide

## ✅ Dynamic OG Image Created!

The OG image is now generated dynamically using Next.js's built-in `ImageResponse` API.

### Image URLs

**Spanish Version:**
```
https://idir.ai/api/og/automation-101?locale=es
```

**English Version:**
```
https://idir.ai/api/og/automation-101?locale=en
```

## How to Preview

### Option 1: Browser (After Deployment)
1. Start your dev server: `npm run dev`
2. Visit: `http://localhost:3000/api/og/automation-101?locale=es`
3. You should see the generated OG image

### Option 2: Social Media Preview Tools

Once deployed to production:

**Facebook Debugger:**
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://idir.ai/es/courses/automation-101`
3. Click "Scrape Again" to refresh
4. View the OG image preview

**Twitter Card Validator:**
1. Go to: https://cards-dev.twitter.com/validator
2. Enter: `https://idir.ai/es/courses/automation-101`
3. Preview the card

**LinkedIn Post Inspector:**
1. Share the URL in LinkedIn
2. Preview the card before posting

## Image Features

### Design Elements
✅ **Gradient Background**: Dark gradient (#050505 → #0a0a0a → #0f0f0f)
✅ **Neon Borders**: Top and bottom gradient borders
✅ **Main Title**: "AUTOMATIZACIÓN 101" with neon gradient
✅ **Branding**: "con Idir" subtitle
✅ **Description**: Course tagline
✅ **3 Badges**:
  - "4 SESIONES EN VIVO" (Green gradient)
  - "100% GRATIS" (Pink-purple gradient)
  - "14 ENERO 2026" (Cyan border)
✅ **Footer**: idir.ai branding

### Technical Specs
- **Dimensions**: 1200x630px (perfect for all social platforms)
- **Format**: PNG
- **Generation**: Server-side using Next.js Edge Runtime
- **Language Support**: ES and EN versions

## Testing Checklist

After deployment:

- [ ] Visit `/api/og/automation-101?locale=es` - Spanish version loads
- [ ] Visit `/api/og/automation-101?locale=en` - English version loads
- [ ] Test with Facebook Debugger - Image appears correctly
- [ ] Test with Twitter Card Validator - Card looks good
- [ ] Share on LinkedIn - Preview shows correct image
- [ ] Check mobile preview - Text is readable
- [ ] Verify all badges are visible
- [ ] Confirm branding (idir.ai) is clear

## Troubleshooting

### Image doesn't load
- Check that the route file is at `/app/api/og/automation-101/route.tsx`
- Verify Edge Runtime is working
- Check browser console for errors

### Text is cut off
- The design is responsive within the 1200x630 canvas
- If text is too long, adjust font sizes in the route file

### Colors look wrong
- Verify the gradient values match your brand
- Check if browser/platform is rendering colors correctly

### Cache Issues
- Social platforms cache OG images for 24-48 hours
- Use debugger tools to force refresh
- Add a query parameter to bust cache: `?v=2`

## Customization

To modify the OG image design, edit:
`/app/api/og/automation-101/route.tsx`

You can change:
- Colors and gradients
- Font sizes
- Badge text
- Layout and spacing
- Add/remove elements

## Performance

- **Generation Time**: ~200-500ms per image
- **Cache**: Next.js caches the image response
- **Edge Runtime**: Fast, low latency worldwide
- **Cost**: Free (included in Next.js)

## Alternative: Static Image

If you prefer a static image instead:

1. Screenshot the generated image at `/api/og/automation-101?locale=es`
2. Save as `/public/og-automation-101.png`
3. Update metadata to use static path:
   ```typescript
   images: ['/og-automation-101.png']
   ```

**Dynamic is recommended** because:
- Automatically updates with any changes
- Supports multiple languages
- No manual regeneration needed
- Always in sync with your design

---

**Next Step**: Deploy to production and test with social media preview tools!
