import { cache } from 'react';
import { isRetryableDbError, query } from '@/lib/db';
import {
  calculateReadTime,
  categoryColors,
  categoryNames,
  formatDate,
  generateSlug,
} from '@/lib/blog-shared';
import type { BlogCategory, BlogPost, BlogPostInput } from '@/lib/blog-shared';

export type { BlogCategory, BlogPost, BlogPostInput };
export { calculateReadTime, categoryColors, categoryNames, formatDate, generateSlug };

async function queryWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = 1,
  delayMs: number = 150
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!isRetryableDbError(error) || retries <= 0) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return queryWithRetry(fn, retries - 1, delayMs * 2);
  }
}

// PERFORMANCE: Cache blog posts to prevent duplicate queries
// Fetch published blog posts (public)
export const getPublishedPosts = cache(async (
  language: 'en' | 'es',
  limit?: number,
  category?: BlogCategory
) => {
  try {
    const params: any[] = [language];
    let where = `p.status = 'published' AND p.language = $1`;
    let limitClause = '';

    if (category) {
      params.push(category);
      where += ` AND p.category = $${params.length}`;
    }

    if (limit) {
      params.push(limit);
      limitClause = ` LIMIT $${params.length}`;
    }

    const result = await queryWithRetry(() => query(
      `SELECT
        p.id, p.title, p.slug, p.excerpt, p.cover_image, p.category, p.tags,
        p.language, p.published_at, p.created_at, p.updated_at,
        p.read_time_minutes, p.view_count, p.author_id,
        u.first_name, u.last_name
       FROM blog_posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE ${where}
       ORDER BY p.published_at DESC${limitClause}`,
      params
    ));

    return result.rows.map((post: any) => ({
      ...post,
      author_name: post.first_name
        ? `${post.first_name} ${post.last_name || ''}`.trim()
        : null,
    })) as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
});

// PERFORMANCE: Cache individual blog posts
// Fetch a single published post by slug
export const getPublishedPostBySlug = cache(async (
  slug: string,
  language: 'en' | 'es'
): Promise<BlogPost | null> => {
  try {
    const result = await queryWithRetry(() => query(
      `SELECT p.*, u.first_name, u.last_name
       FROM blog_posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.slug = $1 AND p.language = $2 AND p.status = 'published'
       LIMIT 1`,
      [slug, language]
    ));

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      author_name: row.first_name
        ? `${row.first_name} ${row.last_name || ''}`.trim()
        : null,
    } as BlogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
});

// Get translated post slug for language switching
export const getTranslatedPostSlug = cache(async (
  translationGroupId: string | null,
  currentLanguage: 'en' | 'es'
): Promise<{ slug: string; language: 'en' | 'es' } | null> => {
  // If no translation group, return null
  if (!translationGroupId) {
    return null;
  }

  try {
    const targetLanguage = currentLanguage === 'en' ? 'es' : 'en';

    const result = await query(
      `SELECT slug, language
       FROM blog_posts
       WHERE translation_group_id = $1
         AND language = $2
         AND status = 'published'
       LIMIT 1`,
      [translationGroupId, targetLanguage]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as { slug: string; language: 'en' | 'es' };
  } catch (error) {
    console.error('Error fetching translated post:', error);
    return null;
  }
});

// Increment view count
export async function incrementViewCount(postId: string) {
  try {
    await query(
      `UPDATE blog_posts
       SET view_count = COALESCE(view_count, 0) + 1
       WHERE id = $1`,
      [postId]
    );
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

// Get related posts (same category or shared tags)
export async function getRelatedPosts(
  postId: string,
  category: BlogCategory,
  tags: string[],
  language: 'en' | 'es',
  limit: number = 3
): Promise<BlogPost[]> {
  try {
    const params: any[] = [language, postId, category];
    let where = `status = 'published' AND language = $1 AND id <> $2`;
    let relatedClause = `category = $3`;

    if (tags && tags.length > 0) {
      params.push(tags);
      relatedClause = `${relatedClause} OR tags && $${params.length}::text[]`;
    }

    const result = await query(
      `SELECT *
       FROM blog_posts
       WHERE ${where} AND (${relatedClause})
       ORDER BY published_at DESC
       LIMIT $${params.length + 1}`,
      [...params, limit]
    );

    return result.rows as BlogPost[];
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

// Get adjacent posts (previous and next)
export async function getAdjacentPosts(
  currentPostId: string,
  currentPublishedAt: string,
  language: 'en' | 'es'
): Promise<{ previous: BlogPost | null; next: BlogPost | null }> {
  const previousResult = await query(
    `SELECT id, slug, title, category, published_at
     FROM blog_posts
     WHERE status = 'published'
       AND language = $1
       AND published_at < $2
     ORDER BY published_at DESC
     LIMIT 1`,
    [language, currentPublishedAt]
  );

  const nextResult = await query(
    `SELECT id, slug, title, category, published_at
     FROM blog_posts
     WHERE status = 'published'
       AND language = $1
       AND published_at > $2
     ORDER BY published_at ASC
     LIMIT 1`,
    [language, currentPublishedAt]
  );

  return {
    previous: (previousResult.rows[0] as BlogPost) || null,
    next: (nextResult.rows[0] as BlogPost) || null,
  };
}

// PERFORMANCE: Fetch all published post slugs for static generation
// This enables Next.js to pre-render all blog posts at build time
export async function getAllPublishedPostSlugs(): Promise<
  Array<{ slug: string; locale: 'en' | 'es' }>
> {
  try {
    const result = await query(
      `SELECT slug, language
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY published_at DESC`
    );

    return (result.rows || []).map((post) => ({
      slug: post.slug,
      locale: post.language as 'en' | 'es',
    }));
  } catch (error) {
    console.error('Error fetching blog post slugs:', error);
    return [];
  }
}

export async function getBlogPostsForSitemap(): Promise<
  Array<{ slug: string; language: 'en' | 'es'; updated_at: string; published_at: string | null; translation_group_id: string | null }>
> {
  try {
    const result = await query(
      `SELECT slug, language, updated_at, published_at, translation_group_id
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY published_at DESC`
    );

    return result.rows as any[];
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}
