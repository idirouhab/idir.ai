'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogPost, BlogCategory, generateSlug } from '@/lib/blog';

type Props = {
  post?: BlogPost;
};

type BilingualData = {
  en: {
    title: string;
    excerpt: string;
    tags: string;
    metaDescription: string;
    metaKeywords: string;
  };
  es: {
    title: string;
    excerpt: string;
    tags: string;
    metaDescription: string;
    metaKeywords: string;
  };
};

export default function BlogPostForm({ post }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [seoSuccess, setSeoSuccess] = useState(false);
  const [generatedData, setGeneratedData] = useState<BilingualData | null>(null);

  const [formData, setFormData] = useState({
    title_en: post?.language === 'en' ? post?.title || '' : '',
    content_en: post?.language === 'en' ? post?.content || '' : '',
    content_es: post?.language === 'es' ? post?.content || '' : '',
    cover_image: post?.cover_image || '',
    category: post?.category || ('insights' as BlogCategory),
    status: post?.status || ('draft' as 'draft' | 'published'),
    // Editable generated data
    title_es: '',
    excerpt_en: '',
    excerpt_es: '',
    tags_en: '',
    tags_es: '',
    meta_description_en: '',
    meta_description_es: '',
    meta_keywords_en: '',
    meta_keywords_es: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_es || !formData.excerpt_en || !formData.excerpt_es) {
      setError('Please generate metadata with AI first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payload for both language posts
      const payload = {
        title_en: formData.title_en,
        content_en: formData.content_en,
        content_es: formData.content_es,
        cover_image: formData.cover_image,
        category: formData.category,
        status: formData.status,
        // English post data
        en: {
          excerpt: formData.excerpt_en,
          tags: formData.tags_en,
          meta_description: formData.meta_description_en,
          meta_keywords: formData.meta_keywords_en,
        },
        // Spanish post data
        es: {
          title: formData.title_es,
          excerpt: formData.excerpt_es,
          tags: formData.tags_es,
          meta_description: formData.meta_description_es,
          meta_keywords: formData.meta_keywords_es,
        },
      };

      const response = await fetch('/api/blog/bilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save posts');
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGenerateMetadata = async () => {
    if (!formData.title_en || !formData.content_en || !formData.content_es) {
      setError('Please fill in English Title, English Content, and Spanish Content before generating');
      return;
    }

    setGeneratingSEO(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('https://idir-test.app.n8n.cloud/webhook/blog-seo-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title_en,
          content_en: formData.content_en,
          content_es: formData.content_es,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to generate metadata');
      }

      const data = await response.json();

      // Validate webhook response structure
      if (!data || !data.languages || !data.languages.en || !data.languages.es) {
        throw new Error('Invalid response structure from webhook');
      }

      // Sanitize strings to prevent XSS
      const sanitize = (str: string) => {
        if (typeof str !== 'string') return '';
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                  .trim()
                  .slice(0, 1000); // Max 1000 chars
      };

      // Update form with generated data - now editable
      setFormData((prev) => ({
        ...prev,
        title_es: sanitize(data.languages.es.title),
        excerpt_en: sanitize(data.languages.en.excerpt),
        excerpt_es: sanitize(data.languages.es.excerpt),
        tags_en: sanitize(data.languages.en.tags),
        tags_es: sanitize(data.languages.es.tags),
        meta_description_en: sanitize(data.languages.en.metaDescription),
        meta_description_es: sanitize(data.languages.es.metaDescription),
        meta_keywords_en: sanitize(data.languages.en.metaKeywords),
        meta_keywords_es: sanitize(data.languages.es.metaKeywords),
      }));

      // Also store in generatedData for reference
      setGeneratedData({
        en: {
          title: data.languages.en.title,
          excerpt: data.languages.en.excerpt,
          tags: data.languages.en.tags,
          metaDescription: data.languages.en.metaDescription,
          metaKeywords: data.languages.en.metaKeywords,
        },
        es: {
          title: data.languages.es.title,
          excerpt: data.languages.es.excerpt,
          tags: data.languages.es.tags,
          metaDescription: data.languages.es.metaDescription,
          metaKeywords: data.languages.es.metaKeywords,
        },
      });

      setGeneratingSEO(false);
      setSeoSuccess(true);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSeoSuccess(false);
      }, 5000);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. The AI service took too long to respond. Please try again.');
      } else {
        setError(err.message || 'Failed to generate metadata');
      }
      setGeneratingSEO(false);
    }
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
          ✨ Metadata generated successfully for both languages!
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-[#00cfff20] border-2 border-[#00cfff]">
        <p className="text-[#00cfff] font-bold mb-2">📝 Bilingual Post Creation</p>
        <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
          <li>Write your post title in English</li>
          <li>Write your post content in English</li>
          <li>Write your post content in Spanish</li>
          <li>Click &quot;Generate Metadata with AI&quot; to auto-generate SEO data for both languages</li>
          <li>Review and publish both posts simultaneously</li>
        </ol>
      </div>

      {/* Title (English) */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Title (English) *</label>
        <input
          type="text"
          required
          value={formData.title_en}
          onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
          className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
          placeholder="Why AI Browsers Matter"
        />
        <p className="text-xs text-gray-500 mt-1">Spanish title will be auto-generated by AI</p>
      </div>

      {/* Content (English) */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Content - English (Markdown) *</label>
        <textarea
          required
          value={formData.content_en}
          onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
          rows={15}
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

      {/* Content (Spanish) */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Content - Spanish (Markdown) *</label>
        <textarea
          required
          value={formData.content_es}
          onChange={(e) => setFormData({ ...formData, content_es: e.target.value })}
          rows={15}
          className="w-full px-4 py-3 bg-black text-white border-2 border-[#00ff88] focus:border-[#00cfff] focus:outline-none font-mono text-sm resize-y"
          placeholder="# Tu encabezado

Tu contenido va aquí...

## Subencabezado

- Elemento de lista 1
- Elemento de lista 2"
        />
        <p className="text-xs text-gray-500 mt-1">
          Soporta Markdown: **negrita**, *cursiva*, [enlaces](url), listas, encabezados, etc.
        </p>
      </div>

      {/* AI Generate Button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGenerateMetadata}
          disabled={generatingSEO || !formData.title_en || !formData.content_en || !formData.content_es}
          className="px-8 py-3 bg-[#00cfff] text-black font-bold uppercase hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          aria-label="Generate metadata with AI"
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
            <>🤖 Generate Metadata with AI</>
          )}
        </button>
      </div>

      {/* Generated Metadata - Editable Fields */}
      {generatedData && (
        <div className="space-y-6 p-6 bg-black border-2 border-[#00ff88]">
          <h3 className="text-[#00ff88] font-bold uppercase text-sm">
            ✨ AI-Generated Metadata (Review & Edit)
          </h3>

          {/* English Metadata */}
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase text-xs flex items-center gap-2">
              <span className="text-[#00ff88]">🇬🇧</span> English Metadata
            </h4>

            {/* English Excerpt */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">Excerpt (EN) *</label>
              <textarea
                required
                value={formData.excerpt_en}
                onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none resize-none text-sm"
              />
            </div>

            {/* English Tags */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">Tags (EN) *</label>
              <input
                type="text"
                required
                value={formData.tags_en}
                onChange={(e) => setFormData({ ...formData, tags_en: e.target.value })}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none text-sm"
                placeholder="ai, automation, technology"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated (important for SEO & filtering)</p>
            </div>

            {/* English Meta Description */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">Meta Description (EN)</label>
              <textarea
                value={formData.meta_description_en}
                onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })}
                rows={2}
                maxLength={160}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.meta_description_en.length}/160</p>
            </div>

            {/* English Meta Keywords */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">Meta Keywords (EN)</label>
              <input
                type="text"
                value={formData.meta_keywords_en}
                onChange={(e) => setFormData({ ...formData, meta_keywords_en: e.target.value })}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Spanish Metadata */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-800">
            <h4 className="text-white font-bold uppercase text-xs flex items-center gap-2">
              <span className="text-[#00cfff]">🇪🇸</span> Spanish Metadata
            </h4>

            {/* Spanish Title */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">Título (ES) *</label>
              <input
                type="text"
                required
                value={formData.title_es}
                onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                className="w-full px-4 py-3 bg-black text-white border-2 border-[#00cfff] focus:border-[#00ff88] focus:outline-none text-sm"
              />
            </div>

            {/* Spanish Excerpt */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">Extracto (ES) *</label>
              <textarea
                required
                value={formData.excerpt_es}
                onChange={(e) => setFormData({ ...formData, excerpt_es: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-black text-white border-2 border-[#00cfff] focus:border-[#00ff88] focus:outline-none resize-none text-sm"
              />
            </div>

            {/* Spanish Tags */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">Etiquetas (ES) *</label>
              <input
                type="text"
                required
                value={formData.tags_es}
                onChange={(e) => setFormData({ ...formData, tags_es: e.target.value })}
                className="w-full px-4 py-3 bg-black text-white border-2 border-[#00cfff] focus:border-[#00ff88] focus:outline-none text-sm"
                placeholder="ia, automatización, tecnología"
              />
              <p className="text-xs text-gray-500 mt-1">Separadas por comas (importante para SEO y filtrado)</p>
            </div>

            {/* Spanish Meta Description */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">Meta Descripción (ES)</label>
              <textarea
                value={formData.meta_description_es}
                onChange={(e) => setFormData({ ...formData, meta_description_es: e.target.value })}
                rows={2}
                maxLength={160}
                className="w-full px-4 py-3 bg-black text-white border-2 border-[#00cfff] focus:border-[#00ff88] focus:outline-none resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.meta_description_es.length}/160</p>
            </div>

            {/* Spanish Meta Keywords */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">Meta Keywords (ES)</label>
              <input
                type="text"
                value={formData.meta_keywords_es}
                onChange={(e) => setFormData({ ...formData, meta_keywords_es: e.target.value })}
                className="w-full px-4 py-3 bg-black text-white border-2 border-[#00cfff] focus:border-[#00ff88] focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Row: Category, Status */}
      <div className="grid grid-cols-2 gap-6">
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
        <p className="text-xs text-gray-500 mt-1">Same cover image will be used for both language versions</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={loading || !formData.title_es || !formData.excerpt_en || !formData.excerpt_es}
          className="px-8 py-3 bg-[#00ff88] text-black font-bold uppercase hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Publishing Both Posts...' : '🌍 Publish Both Languages'}
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
