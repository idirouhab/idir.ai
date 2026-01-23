// Script to generate localized OG images for certificate verification page
// Run: node generate-certificate-og.js

const sharp = require('sharp');

async function generateCertificateOG(locale) {
  const width = 1200;
  const height = 630;

  const text = locale === 'es'
    ? {
        title: 'CERTIFICADO',
        subtitle: 'VERIFICACIÓN',
        description: 'Verifica la autenticidad de certificados',
        badge1: 'SEGURO',
        badge2: 'VERIFICADO',
        badge3: 'INSTANTÁNEO'
      }
    : {
        title: 'CERTIFICATE',
        subtitle: 'VERIFICATION',
        description: 'Verify the authenticity of certificates',
        badge1: 'SECURE',
        badge2: 'VERIFIED',
        badge3: 'INSTANT'
      };

  // Create SVG with the same style as the original OG image
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Grid pattern -->
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16, 185, 129, 0.1)" stroke-width="1"/>
        </pattern>

        <!-- Radial gradient for depth -->
        <radialGradient id="radial" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:rgb(20,20,20);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(10,10,10);stop-opacity:1" />
        </radialGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#radial)"/>
      <rect width="${width}" height="${height}" fill="url(#grid)"/>

      <!-- Decorative elements -->
      <circle cx="150" cy="100" r="200" fill="rgba(16, 185, 129, 0.05)"/>
      <circle cx="1050" cy="530" r="180" fill="rgba(16, 185, 129, 0.05)"/>

      <!-- Content -->
      <!-- Main title -->
      <text
        x="600"
        y="200"
        font-family="Arial, sans-serif"
        font-size="100"
        font-weight="900"
        fill="white"
        text-anchor="middle"
        letter-spacing="4">
        ${text.title}
      </text>

      <!-- Subtitle -->
      <text
        x="600"
        y="290"
        font-family="Arial, sans-serif"
        font-size="100"
        font-weight="900"
        fill="#10b981"
        text-anchor="middle"
        letter-spacing="4">
        ${text.subtitle}
      </text>

      <!-- Description -->
      <text
        x="600"
        y="370"
        font-family="Arial, sans-serif"
        font-size="26"
        font-weight="400"
        fill="#d1d5db"
        text-anchor="middle">
        ${text.description}
      </text>

      <!-- Badges/Features -->
      <g transform="translate(280, 430)">
        <!-- Badge 1 -->
        <rect
          x="0"
          y="0"
          width="160"
          height="50"
          fill="none"
          stroke="#10b981"
          stroke-width="2"
          rx="8"/>
        <text
          x="80"
          y="32"
          font-family="Arial, sans-serif"
          font-size="20"
          font-weight="700"
          fill="#10b981"
          text-anchor="middle"
          letter-spacing="2">
          ${text.badge1}
        </text>

        <!-- Badge 2 -->
        <rect
          x="200"
          y="0"
          width="180"
          height="50"
          fill="none"
          stroke="#10b981"
          stroke-width="2"
          rx="8"/>
        <text
          x="290"
          y="32"
          font-family="Arial, sans-serif"
          font-size="20"
          font-weight="700"
          fill="#10b981"
          text-anchor="middle"
          letter-spacing="2">
          ${text.badge2}
        </text>

        <!-- Badge 3 -->
        <rect
          x="420"
          y="0"
          width="${locale === 'es' ? '220' : '170'}"
          height="50"
          fill="none"
          stroke="#06b6d4"
          stroke-width="2"
          rx="8"/>
        <text
          x="${locale === 'es' ? '530' : '505'}"
          y="32"
          font-family="Arial, sans-serif"
          font-size="20"
          font-weight="700"
          fill="#06b6d4"
          text-anchor="middle"
          letter-spacing="2">
          ${text.badge3}
        </text>
      </g>

      <!-- Footer: idir.ai -->
      <text
        x="600"
        y="580"
        font-family="Arial, sans-serif"
        font-size="24"
        font-weight="400"
        fill="#9ca3af"
        text-anchor="middle"
        letter-spacing="2">
        idir.ai
      </text>
    </svg>
  `;

  const filename = `./public/certificates/og-verify-${locale}.png`;

  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(filename);

    console.log(`✓ Certificate verification OG image (${locale}) generated successfully!`);
    console.log(`  Location: ${filename}`);
  } catch (err) {
    console.error(`✗ Failed to generate OG image (${locale}):`, err.message);
    throw err;
  }
}

// Generate both English and Spanish versions
async function generateAll() {
  try {
    await generateCertificateOG('en');
    await generateCertificateOG('es');
    console.log('\n✓ All certificate OG images generated successfully!');
    console.log('  Size: 1200x630px');
  } catch (err) {
    console.error('Failed to generate images:', err);
    process.exit(1);
  }
}

// Run the generator
generateAll();
