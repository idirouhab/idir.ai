'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogPost, BlogCategory, generateSlug } from '@/lib/blog';

type Props = {
  post?: BlogPost;
};

type TranslatedData = {
  language: 'en' | 'es';
  title: string;
  excerpt: string;
  tags: string;
  metaDescription: string;
  metaKeywords: string;
};

export default function BlogPostForm({ post }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [seoSuccess, setSeoSuccess] = useState(false);
  const [translatedData, setTranslatedData] = useState<TranslatedData | null>(null);

  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    cover_image: post?.cover_image || '',
    meta_description: post?.meta_description || '',
    meta_keywords: post?.meta_keywords?.join(', ') || '',
    category: post?.category || ('insights' as BlogCategory),
    tags: post?.tags?.join(', ') || '',
    language: post?.language || ('en' as 'en' | 'es'),
    status: post?.status || ('draft' as 'draft' | 'published'),
  });

  // Pre-fill form from URL params (when creating translation)
  useEffect(() => {
    if (!post && searchParams) {
      const language = searchParams.get('language') as 'en' | 'es' | null;
      const title = searchParams.get('title');
      const excerpt = searchParams.get('excerpt');
      const tags = searchParams.get('tags');
      const meta_description = searchParams.get('meta_description');
      const meta_keywords = searchParams.get('meta_keywords');
      const category = searchParams.get('category') as BlogCategory | null;

      if (language && title) {
        setFormData({
          title,
          slug: generateSlug(title),
          excerpt: excerpt || '',
          content: '',
          cover_image: '',
          meta_description: meta_description || '',
          meta_keywords: meta_keywords || '',
          category: category || 'insights',
          tags: tags || '',
          language,
          status: 'draft',
        });
      }
    }
  }, [post, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        meta_keywords: formData.meta_keywords
          ? formData.meta_keywords.split(',').map((k) => k.trim())
          : [],
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      };

      const url = post ? `/api/blog/${post.id}` : '/api/blog';
      const method = post ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save post');
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title });
    if (!post) {
      // Auto-generate slug only for new posts
      setFormData((prev) => ({ ...prev, title, slug: generateSlug(title) }));
    }
  };

  const handleGenerateSEO = async () => {
    if (!formData.title || !formData.content) {
      setError('Please fill in Title and Content before generating SEO');
      return;
    }

    setGeneratingSEO(true);
    setError('');
    setTranslatedData(null);

    try {
      const response = await fetch('https://idir-test.app.n8n.cloud/webhook/blog-seo-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          language: formData.language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SEO data');
      }

      const data = await response.json();

      // Parse the new bilingual response structure
      const currentLang = formData.language;
      const otherLang = currentLang === 'en' ? 'es' : 'en';

      const currentLangData = data.languages[currentLang];
      const otherLangData = data.languages[otherLang];

      // Update form with current language SEO data (except title - user already wrote it)
      setFormData((prev) => ({
        ...prev,
        excerpt: currentLangData.excerpt || prev.excerpt,
        tags: currentLangData.tags || prev.tags,
        meta_description: currentLangData.metaDescription || prev.meta_description,
        meta_keywords: currentLangData.metaKeywords || prev.meta_keywords,
      }));

      // Store translated data for the other language
      if (otherLangData) {
        setTranslatedData({
          language: otherLang,
          title: otherLangData.title,
          excerpt: otherLangData.excerpt,
          tags: otherLangData.tags,
          metaDescription: otherLangData.metaDescription,
          metaKeywords: otherLangData.metaKeywords,
        });
      }

      setGeneratingSEO(false);
      setSeoSuccess(true);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSeoSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate SEO data');
      setGeneratingSEO(false);
    }
  };

  const handleCreateTranslation = () => {
    if (!translatedData) return;

    // Navigate to new post page with translated data as URL params
    const params = new URLSearchParams({
      language: translatedData.language,
      title: translatedData.title,
      excerpt: translatedData.excerpt,
      tags: translatedData.tags,
      meta_description: translatedData.metaDescription,
      meta_keywords: translatedData.metaKeywords,
      category: formData.category,
      // User will need to translate content manually
    });

    router.push(`/admin/blog/new?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-[#ff005520] border-2 border-[#ff0055] text-[#ff0055]">
          {error}
        </div>
      )}

      {seoSuccess && (
        <div className="p-4 bg-[#00ff8820] border-2 border-[#00ff88] text-[#00ff88]">
          ✨ Content generated successfully!
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
          placeholder="Why AI Browsers Matter"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Slug *</label>
        <input
          type="text"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none font-mono text-sm"
          placeholder="why-ai-browsers-matter"
        />
        <p className="text-xs text-gray-500 mt-1">URL: /{formData.language}/blog/{formData.slug}</p>
      </div>

      {/* Content (Markdown) */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Content (Markdown) *</label>
        <textarea
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={20}
          className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none font-mono text-sm resize-y"
          placeholder="# Your heading

Your content goes here...

## Subheading

- List item 1
- List item 2"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports Markdown: **bold**, *italic*, [links](url), lists, headings, etc.
        </p>
      </div>

      {/* AI Generate Button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGenerateSEO}
          disabled={generatingSEO || !formData.title || !formData.content}
          className="px-8 py-3 bg-[#00cfff] text-black font-bold uppercase hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generatingSEO ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>🤖 Generate with AI</>
          )}
        </button>

        {translatedData && (
          <button
            type="button"
            onClick={handleCreateTranslation}
            className="px-8 py-3 bg-black border-2 border-[#00cfff] text-[#00cfff] font-bold uppercase hover:bg-[#00cfff] hover:text-black transition-colors flex items-center gap-2"
          >
            🌐 Create {translatedData.language === 'es' ? 'Spanish' : 'English'} Version
          </button>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Excerpt *</label>
        <textarea
          required
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none resize-none"
          placeholder="A brief summary of your post..."
        />
      </div>

      {/* Row: Category, Language, Status */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-white font-bold mb-2 uppercase text-sm">Category *</label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as BlogCategory })}
            className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
          >
            <option value="insights">Insights</option>
            <option value="learnings">Learnings</option>
            <option value="opinion">Opinion</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-bold mb-2 uppercase text-sm">Language *</label>
          <select
            required
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'es' })}
            className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-bold mb-2 uppercase text-sm">Status *</label>
          <select
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
            className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Cover Image URL</label>
        <input
          type="url"
          value={formData.cover_image}
          onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
          className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Tags</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
          placeholder="ai, automation, n8n"
        />
        <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Meta Description</label>
        <textarea
          value={formData.meta_description}
          onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
          rows={2}
          maxLength={160}
          className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none resize-none"
          placeholder="SEO description (160 chars max)"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.meta_description.length}/160</p>
      </div>

      {/* Meta Keywords */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Meta Keywords</label>
        <input
          type="text"
          value={formData.meta_keywords}
          onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
          className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
          placeholder="keyword1, keyword2, keyword3"
        />
        <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-[#00ff88] text-black font-bold uppercase hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="px-8 py-3 bg-black border-2 border-gray-700 text-white font-bold uppercase hover:border-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
