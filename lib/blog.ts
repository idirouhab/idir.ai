import { createClient } from '@supabase/supabase-js';

export type BlogCategory = 'insights' | 'learnings' | 'opinion';

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  category: BlogCategory;
  tags: string[];
  language: 'en' | 'es';
  status: 'draft' | 'published';
  published_at: string | null;
  view_count: number;
  read_time_minutes: number | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostInput = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  category: BlogCategory;
  tags?: string[];
  language: 'en' | 'es';
  status: 'draft' | 'published';
  published_at?: string | null;
  read_time_minutes?: number | null;
};

// Helper to create Supabase client (for public read operations)
export function getBlogClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Helper to create Supabase admin client (bypasses RLS for admin operations)
export function getAdminBlogClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Calculate read time based on word count
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Fetch published blog posts (public)
export async function getPublishedPosts(
  language: 'en' | 'es',
  limit?: number,
  category?: BlogCategory
) {
  const supabase = getBlogClient();

  let query = supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, category, tags, language, published_at, created_at, updated_at, read_time_minutes, view_count')
    .eq('status', 'published')
    .eq('language', language)
    .order('published_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data as BlogPost[];
}

// Fetch a single published post by slug
export async function getPublishedPostBySlug(
  slug: string,
  language: 'en' | 'es'
): Promise<BlogPost | null> {
  const supabase = getBlogClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('language', language)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data as BlogPost;
}

// Increment view count
export async function incrementViewCount(postId: string) {
  const supabase = getBlogClient();

  const { error } = await supabase.rpc('increment_post_views', {
    post_id: postId,
  });

  if (error) {
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
  const supabase = getBlogClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('language', language)
    .neq('id', postId)
    .or(`category.eq.${category},tags.cs.{${tags.join(',')}}`)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return data as BlogPost[];
}

// Category display names
export const categoryNames: Record<BlogCategory, { en: string; es: string }> = {
  insights: { en: 'Insights', es: 'Perspectivas' },
  learnings: { en: 'Learnings', es: 'Aprendizajes' },
  opinion: { en: 'Opinion', es: 'Opinión' },
};

// Category colors (matching your design system)
export const categoryColors: Record<BlogCategory, string> = {
  insights: '#ff0055', // Pink
  learnings: '#00ff88', // Green
  opinion: '#00cfff', // Blue
};

// Format date
export function formatDate(date: string, locale: 'en' | 'es'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Get adjacent posts (previous and next)
export async function getAdjacentPosts(
  currentPostId: string,
  currentPublishedAt: string,
  language: 'en' | 'es'
): Promise<{ previous: BlogPost | null; next: BlogPost | null }> {
  const supabase = getBlogClient();

  // Get previous post (older)
  const { data: previousPost } = await supabase
    .from('blog_posts')
    .select('id, slug, title, category, published_at')
    .eq('status', 'published')
    .eq('language', language)
    .lt('published_at', currentPublishedAt)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  // Get next post (newer)
  const { data: nextPost } = await supabase
    .from('blog_posts')
    .select('id, slug, title, category, published_at')
    .eq('status', 'published')
    .eq('language', language)
    .gt('published_at', currentPublishedAt)
    .order('published_at', { ascending: true })
    .limit(1)
    .single();

  return {
    previous: previousPost as BlogPost | null,
    next: nextPost as BlogPost | null,
  };
}
