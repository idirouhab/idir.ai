import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://idir.ai'
  const locales = ['en', 'es']
  const lastModified = new Date()

  // Generate entries for each locale
  const localeEntries: MetadataRoute.Sitemap = locales.flatMap(locale => [
    {
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
    },
  ])

  return [
    // Root URL (will redirect based on browser language)
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    ...localeEntries,
  ]
}
