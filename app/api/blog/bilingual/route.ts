import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, canPublish } from '@/lib/auth';
import { getAdminBlogClient, calculateReadTime, generateSlug } from '@/lib/blog';

// Zod schema for input validation
const BilingualPostSchema = z.object({
  title_en: z.string().min(1, 'English title is required').max(200, 'Title too long'),
  content_en: z.string().min(10, 'English content too short').max(100000, 'English content too long'),
  content_es: z.string().min(10, 'Spanish content too short').max(100000, 'Spanish content too long'),
  cover_image: z.string().url('Invalid URL').optional().or(z.literal('')),
  category: z.enum(['insights', 'learnings', 'opinion']),
  status: z.enum(['draft', 'published']),
  en: z.object({
    excerpt: z.string().max(500, 'Excerpt too long'),
    tags: z.string().max(200, 'Tags too long'),
    meta_description: z.string().max(160, 'Meta description too long'),
    meta_keywords: z.string().max(500, 'Meta keywords too long'),
  }),
  es: z.object({
    title: z.string().min(1, 'Spanish title is required').max(200, 'Title too long'),
    excerpt: z.string().max(500, 'Excerpt too long'),
    tags: z.string().max(200, 'Tags too long'),
    meta_description: z.string().max(160, 'Meta description too long'),
    meta_keywords: z.string().max(500, 'Meta keywords too long'),
  }),
});

type BilingualPostPayload = z.infer<typeof BilingualPostSchema>;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(request);

    // Parse and validate request body
    const rawBody = await request.json();
    const validationResult = BilingualPostSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      }, { status: 400 });
    }

    const body = validationResult.data;

    // ROLE-BASED PERMISSION: Only owners and admins can publish
    let finalStatus = body.status;
    if (!canPublish(user)) {
      finalStatus = 'draft';
    }

    // Generate slugs
    const slug_en = generateSlug(body.title_en);
    const slug_es = generateSlug(body.es.title);

    // Calculate read times
    const read_time_en = calculateReadTime(body.content_en);
    const read_time_es = calculateReadTime(body.content_es);

    // Set published_at if publishing (only for owners and admins)
    const published_at = finalStatus === 'published' ? new Date().toISOString() : null;

    // Generate translation group ID to link both language versions
    const translation_group_id = crypto.randomUUID();

    // Parse tags and keywords
    const tags_en = body.en.tags ? body.en.tags.split(',').map((t) => t.trim()) : [];
    const tags_es = body.es.tags ? body.es.tags.split(',').map((t) => t.trim()) : [];
    const meta_keywords_en = body.en.meta_keywords ? body.en.meta_keywords.split(',').map((k) => k.trim()) : [];
    const meta_keywords_es = body.es.meta_keywords ? body.es.meta_keywords.split(',').map((k) => k.trim()) : [];

    // Create English post
    const postEN = {
      title: body.title_en,
      slug: slug_en,
      excerpt: body.en.excerpt,
      content: body.content_en,
      cover_image: body.cover_image,
      meta_description: body.en.meta_description,
      meta_keywords: meta_keywords_en,
      category: body.category,
      tags: tags_en,
      language: 'en',
      status: finalStatus,
      read_time_minutes: read_time_en,
      published_at,
      translation_group_id,
      author_id: user.userId,
      author_name: user.email,
    };

    // Create Spanish post
    const postES = {
      title: body.es.title,
      slug: slug_es,
      excerpt: body.es.excerpt,
      content: body.content_es,
      cover_image: body.cover_image,
      meta_description: body.es.meta_description,
      meta_keywords: meta_keywords_es,
      category: body.category,
      tags: tags_es,
      language: 'es',
      status: finalStatus,
      read_time_minutes: read_time_es,
      published_at,
      translation_group_id,
      author_id: user.userId,
      author_name: user.email,
    };

    const supabase = getAdminBlogClient();

    // Insert both posts
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postEN, postES])
      .select();

    if (error) {
      console.error('Error creating bilingual blog posts:', error);
      return NextResponse.json({
        error: 'Failed to create blog posts'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      posts: data,
      message: 'Both language versions published successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/blog/bilingual:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}
