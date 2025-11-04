import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://idir.ai'
  const locales = ['en', 'es']
  const lastModified = new Date()

  // Generate homepage entries for each locale
  const homepageEntries: MetadataRoute.Sitemap = locales.map(locale => ({
    url: `${baseUrl}/${locale}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 1,
    alternates: {
      languages: {
        en: `${baseUrl}/en`,
        es: `${baseUrl}/es`,
      },
    },
  }))

  // Generate subscribe page entries for each locale
  const subscribeEntries: MetadataRoute.Sitemap = locales.map(locale => ({
    url: `${baseUrl}/${locale}/subscribe`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${baseUrl}/en/subscribe`,
        es: `${baseUrl}/es/subscribe`,
      },
    },
  }))

  return [
    // Root URL (will redirect based on browser language)
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    ...homepageEntries,
    ...subscribeEntries,
  ]
}
