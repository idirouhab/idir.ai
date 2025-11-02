# idir.ai - Personal Website

A modern, SEO-optimized personal website built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Modern Stack**: Built with Next.js 14 App Router, TypeScript, and Tailwind CSS
- **SEO Optimized**: Comprehensive meta tags, Open Graph, and Twitter Card support
- **AI Discoverable**: JSON-LD structured data for enhanced AI and search engine understanding
- **Mobile-First**: Fully responsive design optimized for all devices
- **Performance**: Fast loading times with Next.js optimization
- **Accessibility**: Semantic HTML and accessible navigation

## Sections

- **Hero**: Professional introduction and key highlights
- **About**: Solutions Engineer role at n8n and expertise
- **Speaking**: Topics and availability for conferences and events
- **Podcast**: Prompt&Play podcast in Spanish
- **Contact**: Social links and contact information

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Customization

### Update Personal Information

1. **Metadata**: Edit `app/layout.tsx` to update SEO information
2. **Content**: Update component files in `components/` directory
3. **Structured Data**: Modify JSON-LD in `app/page.tsx`
4. **Social Links**: Update links in `components/Contact.tsx` and `components/Footer.tsx`

### Add Google Search Console Verification

1. Get your verification code from Google Search Console
2. Update the `verification.google` field in `app/layout.tsx`

### Update Domain

Replace `https://idir.ai` with your actual domain in:
- `app/layout.tsx`
- `app/sitemap.ts`
- `app/robots.ts`

## SEO Features

- **Meta Tags**: Comprehensive title, description, and keywords
- **Open Graph**: Social media preview optimization
- **Twitter Cards**: Enhanced Twitter sharing
- **Sitemap**: Automatic sitemap generation at `/sitemap.xml`
- **Robots.txt**: Search engine crawling configuration at `/robots.txt`
- **Structured Data**: Schema.org JSON-LD for Person and PodcastSeries
- **AI Bot Friendly**: Explicitly allows GPTBot, ClaudeBot, and other AI crawlers

## Mobile Optimization

- Responsive navigation with mobile hamburger menu
- Touch-friendly buttons and links
- Optimized typography for small screens
- Fast loading with optimized assets

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Optimized for Vercel, Netlify, or any Node.js hosting

## License

Personal website - All rights reserved

## Contact

For questions or collaboration: hello@idir.ai
