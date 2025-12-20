import {withSentryConfig} from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PERFORMANCE: Enable Gzip/Brotli compression
  // Reduces response sizes by ~70% for text-based content (HTML, CSS, JS, JSON)
  // Next.js uses Brotli if available, falls back to Gzip
  // Vercel automatically serves Brotli-compressed assets when available
  compress: true,

  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // PERFORMANCE: Modularize imports to reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Local Supabase (for development)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      // Supabase Storage (for blog post images)
      {
        protocol: 'https',
        hostname: 'cymypipxhlgjmrzonpdw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // PostImg (existing blog post images)
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
        {
        protocol: 'https',
        hostname: 'mpost.io',
      },
        {
        protocol: 'https',
        hostname: 'worth.com',
      },
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
      },
      {
            protocol: 'https',
            hostname: 'scalevise.com',
      },
      // Production domain (for course instructor images and other assets)
      {
        protocol: 'https',
        hostname: 'idir.ai',
      },
    ],
  },

  // PERFORMANCE: Experimental optimizations for package imports
  experimental: {
    optimizePackageImports: [
      'next-intl',
      'react-markdown',
      'react-syntax-highlighter',
      'lucide-react',
    ],
  },

  // Headers for better caching, compression, and security
  async headers() {
    return [
      // PERFORMANCE: Static assets with aggressive caching
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      // PERFORMANCE: JavaScript and CSS with versioned caching
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // PERFORMANCE: Compression hints for all pages
      {
        source: '/:path*',
        headers: [
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      // Security headers for all routes
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
};

// PERFORMANCE: Configure Sentry with optimizations to minimize bundle impact
export default withSentryConfig(withBundleAnalyzer(withNextIntl(nextConfig)), {
  org: "personal-jo3",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // PERFORMANCE: Disable source map upload in development to speed up builds
  // Only upload source maps in production for debugging
  hideSourceMaps: true,

  // PERFORMANCE: Reduce source map uploads for faster builds
  widenClientFileUpload: false,

  // PERFORMANCE: Disable tunneling route to reduce server load
  // This may cause some ad-blockers to block Sentry, but improves performance
  tunnelRoute: undefined,

  // PERFORMANCE: Tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
});