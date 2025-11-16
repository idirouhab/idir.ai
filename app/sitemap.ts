import { MetadataRoute } from 'next'
import { getBlogClient } from '@/lib/blog'

async function getBlogPosts() {
  try {
    const supabase = getBlogClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, language, updated_at, published_at, translation_group_id')
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

  // Generate blog post entries with language alternates
  const posts = await getBlogPosts()

  // Group posts by translation_group_id to link translations
  const translationGroups = new Map<string, { en?: typeof posts[0], es?: typeof posts[0] }>()
  posts.forEach(post => {
    if (post.translation_group_id) {
      const group = translationGroups.get(post.translation_group_id) || {}
      const lang = post.language as 'en' | 'es'
      group[lang] = post
      translationGroups.set(post.translation_group_id, group)
    }
  })

  const blogPostEntries: MetadataRoute.Sitemap = posts.map(post => {
    const entry: any = {
      url: `${baseUrl}/${post.language}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }

    // Add language alternates if translation exists
    if (post.translation_group_id) {
      const group = translationGroups.get(post.translation_group_id)
      if (group && (group.en || group.es)) {
        entry.alternates = {
          languages: {} as Record<string, string>
        }
        if (group.en) {
          entry.alternates.languages['en'] = `${baseUrl}/en/blog/${group.en.slug}`
        }
        if (group.es) {
          entry.alternates.languages['es'] = `${baseUrl}/es/blog/${group.es.slug}`
        }
      }
    }

    return entry
  })

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
