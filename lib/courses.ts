import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';

export type CourseCategory = 'automation' | 'ai' | 'productivity' | 'business' | 'other';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseType = 'free' | 'paid' | 'waitlist';

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  cover_image: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  category: CourseCategory;
  tags: string[];
  level: CourseLevel | null;
  duration_hours: number | null;
  prerequisites: string[] | null;
  course_type: CourseType;
  language: 'en' | 'es';
  translation_group_id: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  scheduled_publish_at: string | null;
  enrollment_count: number;
  view_count: number;
  author_id: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
};

export type CourseInput = {
  slug: string;
  title: string;
  description: string;
  content: string;
  cover_image?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  category: CourseCategory;
  tags?: string[];
  level?: CourseLevel | null;
  duration_hours?: number | null;
  prerequisites?: string[] | null;
  course_type?: CourseType;
  language: 'en' | 'es';
  translation_group_id?: string | null;
  status: 'draft' | 'published';
  published_at?: string | null;
  scheduled_publish_at?: string | null;
};

export type CourseSignup = {
  id: string;
  full_name: string;
  email: string;
  course_slug: string;
  signup_status: 'pending' | 'confirmed' | 'waitlist' | 'cancelled';
  language: 'en' | 'es';
  country: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  certificate_id: string | null;
  certificate_url: string | null;
};

// Category colors for UI consistency
export const categoryColors: Record<CourseCategory, string> = {
  automation: '#00cfff',
  ai: '#ff00ff',
  productivity: '#00ff88',
  business: '#ffaa00',
  other: '#888888',
};

// Helper to create Supabase client (for public read operations)
export function getCourseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const isLocal = supabaseUrl.includes('localhost');

  return createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public',
    },
    auth: isLocal ? {
      autoRefreshToken: false,
      persistSession: false,
    } : undefined,
  });
}

// Helper to create Supabase admin client (bypasses RLS for admin operations)
export function getAdminCourseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Generate slug from title
export function generateCourseSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Calculate estimated duration based on content length
export function estimateDuration(content: string): number {
  const wordsPerHour = 3000; // Rough estimate for course content
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerHour));
}

// PERFORMANCE: Cache courses to prevent duplicate queries
// Fetch published courses (public)
export const getPublishedCourses = cache(async (
  language: 'en' | 'es',
  limit?: number,
  category?: CourseCategory
) => {
  const supabase = getCourseClient();

  let query = supabase
    .from('courses')
    .select('*')
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
    console.error('Error fetching courses:', error);
    return [];
  }

  return (data || []) as Course[];
});

// PERFORMANCE: Cache individual courses
// Fetch a single published course by slug
export const getPublishedCourseBySlug = cache(async (
  slug: string,
  language: 'en' | 'es'
) => {
  const supabase = getCourseClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('language', language)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error(`Error fetching course ${slug}:`, error);
    return null;
  }

  return data as Course;
});

// Get all courses (including drafts) - Admin only
export async function getAllCourses(limit?: number) {
  const supabase = getAdminCourseClient();

  let query = supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching all courses:', error);
    throw error;
  }

  return (data || []) as Course[];
}

// Get course by ID - Admin only
export async function getCourseById(id: string) {
  const supabase = getAdminCourseClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw error;
  }

  return data as Course;
}

// Increment course view count
export async function incrementCourseViews(courseId: string) {
  const supabase = getCourseClient();

  const { error } = await supabase.rpc('increment_course_views', {
    course_id: courseId
  });

  if (error) {
    console.error('Error incrementing course views:', error);
  }
}
