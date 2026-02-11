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
  scheduled_publish_at: string | null;
  translation_group_id: string | null;
  view_count: number;
  read_time_minutes: number | null;
  tldr: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
  author_name?: string | null;
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
  scheduled_publish_at?: string | null;
  read_time_minutes?: number | null;
  tldr?: string | null;
};

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const categoryNames: Record<BlogCategory, { en: string; es: string }> = {
  insights: { en: 'Insights', es: 'Perspectivas' },
  learnings: { en: 'Learnings', es: 'Aprendizajes' },
  opinion: { en: 'Opinion', es: 'Opinión' },
};

export const categoryColors: Record<BlogCategory, string> = {
  insights: '#ff0055',
  learnings: '#00ff88',
  opinion: '#00cfff',
};

export function formatDate(date: string, locale: 'en' | 'es'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
