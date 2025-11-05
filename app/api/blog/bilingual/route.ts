import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getAdminBlogClient, calculateReadTime, generateSlug } from '@/lib/blog';

type BilingualPostPayload = {
  title_en: string;
  content_en: string;
  content_es: string;
  cover_image: string;
  category: string;
  status: 'draft' | 'published';
  en: {
    excerpt: string;
    tags: string;
    meta_description: string;
    meta_keywords: string;
  };
  es: {
    title: string;
    excerpt: string;
    tags: string;
    meta_description: string;
    meta_keywords: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin-session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: BilingualPostPayload = await request.json();

    // Generate slugs
    const slug_en = generateSlug(body.title_en);
    const slug_es = generateSlug(body.es.title);

    // Calculate read times
    const read_time_en = calculateReadTime(body.content_en);
    const read_time_es = calculateReadTime(body.content_es);

    // Set published_at if publishing
    const published_at = body.status === 'published' ? new Date().toISOString() : null;

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
      status: body.status,
      read_time_minutes: read_time_en,
      published_at,
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
      status: body.status,
      read_time_minutes: read_time_es,
      published_at,
    };

    const supabase = getAdminBlogClient();

    // Insert both posts
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postEN, postES])
      .select();

    if (error) {
      console.error('Error creating bilingual blog posts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      posts: data,
      message: 'Both language versions published successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/blog/bilingual:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
