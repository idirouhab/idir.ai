import { MetadataRoute } from 'next'
import { getBlogClient } from '@/lib/blog'

async function getBlogPosts() {
  try {
    const supabase = getBlogClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, language, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    return data || []
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Generate blog index entries for each locale
  const blogIndexEntries: MetadataRoute.Sitemap = locales.map(locale => ({
    url: `${baseUrl}/${locale}/blog`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
    alternates: {
      languages: {
        en: `${baseUrl}/en/blog`,
        es: `${baseUrl}/es/blog`,
      },
    },
  }))

  // Generate blog post entries
  const posts = await getBlogPosts()
  const blogPostEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${baseUrl}/${post.language}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
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
    ...blogIndexEntries,
    ...blogPostEntries,
  ]
}
