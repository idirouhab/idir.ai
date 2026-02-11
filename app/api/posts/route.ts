import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/app-roles';
import { calculateReadTime, generateSlug } from '@/lib/blog';
import { getClient, query } from '@/lib/db';

/**
 * GET /api/posts
 * List and filter blog posts
 *
 * Query params:
 * - grouped: boolean - Return translation groups (for newsletters)
 * - date: YYYY-MM-DD - Filter by published date
 * - category: insights|learnings|opinion
 * - language: en|es
 * - status: draft|published (requires auth)
 * - limit: number
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const grouped = searchParams.get('grouped') === 'true';
    const date = searchParams.get('date');
    const category = searchParams.get('category');
    const language = searchParams.get('language') as 'en' | 'es' | null;
    const status = searchParams.get('status') as 'draft' | 'published' | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Check auth if filtering by drafts
    if (status === 'draft') {
      const authResult = await requireRole(['super_admin', 'blog_editor']);
      if (!authResult.authorized) {
        return authResult.response;
      }
    }

    // Handle grouped view (for newsletters)
    if (grouped) {
      return await getGroupedPosts({ date, category, limit });
    }

    const params: any[] = [];
    const where: string[] = [];

    if (status) {
      params.push(status);
      where.push(`p.status = $${params.length}`);
    } else {
      where.push(`p.status = 'published'`);
    }

    if (language) {
      params.push(language);
      where.push(`p.language = $${params.length}`);
    }

    if (category) {
      params.push(category);
      where.push(`p.category = $${params.length}`);
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      params.push(startOfDay.toISOString());
      where.push(`p.published_at >= $${params.length}`);
      params.push(endOfDay.toISOString());
      where.push(`p.published_at <= $${params.length}`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    params.push(limit);

    const result = await query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.category, p.tags,
              p.language, p.published_at, p.created_at, p.updated_at,
              p.read_time_minutes, p.view_count, p.translation_group_id, p.author_id,
              u.first_name, u.last_name
       FROM blog_posts p
       LEFT JOIN users u ON u.id = p.author_id
       ${whereClause}
       ORDER BY p.published_at DESC
       LIMIT $${params.length}`,
      params
    );
    const data = result.rows;

    // Map to include author name
    const posts = (data || []).map((post: any) => ({
      ...post,
      author_name: post.first_name ? `${post.first_name} ${post.last_name || ''}`.trim() : null,
    }));

    return NextResponse.json({
      data: posts,
      meta: {
        count: posts.length,
        filters: {
          grouped: false,
          date: date || 'all',
          category: category || 'all',
          language: language || 'all',
          status: status || 'published',
          limit,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Helper: Get posts grouped by translation_group_id
 */
async function getGroupedPosts(
  filters: { date?: string | null; category?: string | null; limit: number }
) {
  const params: any[] = [];
  const where: string[] = [`status = 'published'`, `translation_group_id IS NOT NULL`];

  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    params.push(startOfDay.toISOString());
    where.push(`published_at >= $${params.length}`);
    params.push(endOfDay.toISOString());
    where.push(`published_at <= $${params.length}`);
  }

  if (filters.category) {
    params.push(filters.category);
    where.push(`category = $${params.length}`);
  }

  const postsResult = await query(
    `SELECT id, slug, title, excerpt, cover_image, category, tags, language,
            published_at, read_time_minutes, view_count, translation_group_id
     FROM blog_posts
     WHERE ${where.join(' AND ')}
     ORDER BY published_at DESC`,
    params
  );
  const posts = postsResult.rows;

  // Group by translation_group_id
  const groupedMap = new Map<string, { en?: any; es?: any; published_at: string; translation_group_id: string }>();

  posts?.forEach((post: any) => {
    const groupId = post.translation_group_id!;

    if (!groupedMap.has(groupId)) {
      groupedMap.set(groupId, {
        translation_group_id: groupId,
        published_at: post.published_at!,
      });
    }

    const group = groupedMap.get(groupId)!;
    const version = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      cover_image: post.cover_image,
      url: `https://idir.ai/${post.language}/blog/${post.slug}`,
      tags: post.tags,
      category: post.category,
      read_time_minutes: post.read_time_minutes,
      view_count: post.view_count,
    };

    if (post.language === 'en') {
      group.en = version;
    } else {
      group.es = version;
    }
  });

  const grouped = Array.from(groupedMap.values())
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, filters.limit);

  return NextResponse.json({
    data: grouped,
    meta: {
      total_groups: grouped.length,
      with_both_languages: grouped.filter(g => g.en && g.es).length,
      only_english: grouped.filter(g => g.en && !g.es).length,
      only_spanish: grouped.filter(g => !g.en && g.es).length,
      filters: {
        grouped: true,
        date: filters.date || 'all',
        category: filters.category || 'all',
        limit: filters.limit,
      },
    },
  });
}

/**
 * POST /api/posts
 * Create blog post(s)
 *
 * Supports two modes:
 * 1. Single post: Create one post
 * 2. Bilingual post: Create EN + ES versions (set bilingual: true)
 */
export async function POST(request: NextRequest) {
  try {
    // Use NextAuth for authentication
    const authResult = await requireRole(['super_admin', 'blog_editor']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const user = authResult.user;
    const body = await request.json();

    // Detect bilingual mode
    if (body.bilingual === true || (body.content_en && body.content_es)) {
      return await createBilingualPost(user, body);
    }

    // Single post mode
    return await createSinglePost(user, body);
  } catch (error: any) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Helper: Create single post
 */
async function createSinglePost(user: any, body: any) {
  // Calculate read time
  if (!body.read_time_minutes && body.content) {
    body.read_time_minutes = calculateReadTime(body.content);
  }

  // Generate slug if not provided
  if (!body.slug && body.title) {
    body.slug = generateSlug(body.title);
  }

  // Handle permissions
  if (!isAdmin(user.roles)) {
    body.status = 'draft';
    body.published_at = null;
  } else if (body.status === 'published' && !body.published_at) {
    body.published_at = new Date().toISOString();
  }

  const postData = {
    ...body,
    author_id: user.userId,
  };

  const fields = Object.keys(postData);
  const values = fields.map((f) => postData[f]);
  const cols = fields.join(', ');
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

  const result = await query(
    `INSERT INTO blog_posts (${cols})
     VALUES (${placeholders})
     RETURNING *`,
    values
  );

  return NextResponse.json({ data: result.rows[0] }, { status: 201 });
}

/**
 * Helper: Create bilingual posts
 */
async function createBilingualPost(user: any, body: any) {
  const BilingualSchema = z.object({
    title_en: z.string().min(1).max(200),
    content_en: z.string().min(10).max(100000),
    content_es: z.string().min(10).max(100000),
    cover_image: z.string().url().optional().or(z.literal('')),
    category: z.enum(['insights', 'learnings', 'opinion']),
    status: z.enum(['draft', 'published']),
    scheduled_publish_at: z.string().nullable().optional(),
    scheduled_timezone: z.string().optional(),
    en: z.object({
      excerpt: z.string().max(500),
      tags: z.string().max(200),
      meta_description: z.string().max(160),
      meta_keywords: z.string().max(500),
      tldr: z.string().max(1000).optional().nullable(),
    }),
    es: z.object({
      title: z.string().min(1).max(200),
      excerpt: z.string().max(500),
      tags: z.string().max(200),
      meta_description: z.string().max(160),
      meta_keywords: z.string().max(500),
      tldr: z.string().max(1000).optional().nullable(),
    }),
  });

  const validation = BilingualSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({
      error: 'Invalid input',
      details: validation.error.issues,
    }, { status: 400 });
  }

  const data = validation.data;
  let finalStatus = data.status;

  if (!isAdmin(user.roles)) {
    finalStatus = 'draft';
  }

  const slug_en = generateSlug(data.title_en);
  const slug_es = generateSlug(data.es.title);
  const read_time_en = calculateReadTime(data.content_en);
  const read_time_es = calculateReadTime(data.content_es);
  const published_at = finalStatus === 'published' ? new Date().toISOString() : null;
  const translation_group_id = crypto.randomUUID();

  const tags_en = data.en.tags ? data.en.tags.split(',').map(t => t.trim()) : [];
  const tags_es = data.es.tags ? data.es.tags.split(',').map(t => t.trim()) : [];
  const meta_keywords_en = data.en.meta_keywords ? data.en.meta_keywords.split(',').map(k => k.trim()) : [];
  const meta_keywords_es = data.es.meta_keywords ? data.es.meta_keywords.split(',').map(k => k.trim()) : [];

  const postEN = {
    title: data.title_en,
    slug: slug_en,
    excerpt: data.en.excerpt,
    content: data.content_en,
    cover_image: data.cover_image,
    meta_description: data.en.meta_description,
    meta_keywords: meta_keywords_en,
    category: data.category,
    tags: tags_en,
    language: 'en',
    status: finalStatus,
    read_time_minutes: read_time_en,
    published_at,
    scheduled_publish_at: data.scheduled_publish_at || null,
    scheduled_timezone: data.scheduled_timezone || 'Europe/Berlin',
    tldr: data.en.tldr || null,
    translation_group_id,
    author_id: user.userId,
  };

  const postES = {
    title: data.es.title,
    slug: slug_es,
    excerpt: data.es.excerpt,
    content: data.content_es,
    cover_image: data.cover_image,
    meta_description: data.es.meta_description,
    meta_keywords: meta_keywords_es,
    category: data.category,
    tags: tags_es,
    language: 'es',
    status: finalStatus,
    read_time_minutes: read_time_es,
    published_at,
    scheduled_publish_at: data.scheduled_publish_at || null,
    scheduled_timezone: data.scheduled_timezone || 'Europe/Berlin',
    tldr: data.es.tldr || null,
    translation_group_id,
    author_id: user.userId,
  };

  const client = await getClient();
  let posts;
  try {
    await client.query('BEGIN');
    const fields = Object.keys(postEN);
    const cols = fields.join(', ');
    const values = [...fields.map((f) => (postEN as any)[f]), ...fields.map((f) => (postES as any)[f])];
    const placeholders1 = fields.map((_, i) => `$${i + 1}`).join(', ');
    const placeholders2 = fields.map((_, i) => `$${i + 1 + fields.length}`).join(', ');

    const insertResult = await client.query(
      `INSERT INTO blog_posts (${cols})
       VALUES (${placeholders1}), (${placeholders2})
       RETURNING *`,
      values
    );
    posts = insertResult.rows;
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating bilingual posts:', error);
    return NextResponse.json({ error: 'Failed to create posts' }, { status: 500 });
  } finally {
    client.release();
  }

  return NextResponse.json({
    data: posts,
    meta: {
      bilingual: true,
      translation_group_id,
    },
  }, { status: 201 });
}
