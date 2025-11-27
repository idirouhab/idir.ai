'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogPost, BlogCategory, generateSlug } from '@/lib/blog';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Lazy load MarkdownEditor
const MarkdownEditor = dynamic(() => import('@/components/admin/MarkdownEditor'), {
  loading: () => <div className="p-4 text-gray-400">Loading editor...</div>,
  ssr: false,
});

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

// Common timezones with their IANA identifiers
const TIMEZONES = [
  { value: 'America/New_York', label: 'New York (EST/EDT)', offset: 'UTC-5/-4' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: 'UTC-6/-5' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: 'UTC-7/-6' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: 'UTC-8/-7' },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/+1' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', offset: 'UTC+10/+11' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)', offset: 'UTC+12/+13' },
  { value: 'UTC', label: 'UTC', offset: 'UTC+0' },
];

// Helper: Convert datetime-local string to UTC using specified timezone
function convertToUTC(datetimeLocal: string, timezone: string): string {
  if (!datetimeLocal) return '';

  // Parse the datetime-local string
  const [datePart, timePart] = datetimeLocal.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  // Create formatter for the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Strategy: Find what UTC time produces our desired local time in the target timezone
  // Start with an initial guess (interpret input as UTC)
  let utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  // See what this UTC time shows as in the target timezone
  const parts = formatter.formatToParts(utcGuess);
  const tzObj: any = {};
  parts.forEach(part => {
    if (part.type !== 'literal') tzObj[part.type] = part.value;
  });

  // Parse what the timezone shows
  const tzYear = parseInt(tzObj.year);
  const tzMonth = parseInt(tzObj.month);
  const tzDay = parseInt(tzObj.day);
  const tzHours = parseInt(tzObj.hour);
  const tzMinutes = parseInt(tzObj.minute);

  // Calculate the difference between what we want and what we got
  const wantedMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
  const gotMs = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHours, tzMinutes, 0);
  const offsetMs = gotMs - wantedMs;

  // Adjust our guess by the offset
  const correctUTC = utcGuess.getTime() - offsetMs;

  return new Date(correctUTC).toISOString();
}

// Helper: Convert UTC ISO string to datetime-local format in specified timezone
function convertFromUTC(utcString: string, timezone: string): string {
  if (!utcString) return '';

  const utcDate = new Date(utcString);

  // Use Intl API to format in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(utcDate);
  const dateObj: any = {};
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateObj[part.type] = part.value;
    }
  });

  // Format as datetime-local string (YYYY-MM-DDTHH:mm)
  return `${dateObj.year}-${dateObj.month}-${dateObj.day}T${dateObj.hour}:${dateObj.minute}`;
}

export default function BlogPostForm({ post }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [seoSuccess, setSeoSuccess] = useState(false);
  const [generatedData, setGeneratedData] = useState<BilingualData | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'blogger' | null>(null);
  const [canUserPublish, setCanUserPublish] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    title_en: '',
    content_en: '',
    content_es: '',
    cover_image: '',
    category: 'insights' as BlogCategory,
    status: 'draft' as 'draft' | 'published',
    scheduled_publish_at: '',
    scheduled_timezone: 'Europe/Berlin', // Default timezone
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

  // Fetch current user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user.role);
          // Check if user can publish (owner or admin)
          setCanUserPublish(data.user.role === 'owner' || data.user.role === 'admin');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchUserRole();
  }, []);

  // Load post data into form when editing
  useEffect(() => {
    if (post) {
      const isEnglish = post.language === 'en';
      // Use stored timezone if available, otherwise default to Berlin
      const storedTimezone = (post as any).scheduled_timezone || 'Europe/Berlin';
      // Convert UTC ISO string to datetime-local format in the stored timezone
      const scheduledDate = post.scheduled_publish_at
        ? convertFromUTC(post.scheduled_publish_at, storedTimezone)
        : '';

      setFormData({
        title_en: isEnglish ? post.title : '',
        content_en: isEnglish ? post.content : '',
        content_es: !isEnglish ? post.content : '',
        cover_image: post.cover_image || '',
        category: post.category,
        status: post.status,
        scheduled_publish_at: scheduledDate,
        scheduled_timezone: storedTimezone,
        title_es: !isEnglish ? post.title : '',
        excerpt_en: isEnglish ? post.excerpt : '',
        excerpt_es: !isEnglish ? post.excerpt : '',
        tags_en: isEnglish && post.tags ? post.tags.join(', ') : '',
        tags_es: !isEnglish && post.tags ? post.tags.join(', ') : '',
        meta_description_en: isEnglish && post.meta_description ? post.meta_description : '',
        meta_description_es: !isEnglish && post.meta_description ? post.meta_description : '',
        meta_keywords_en: isEnglish && post.meta_keywords ? post.meta_keywords.join(', ') : '',
        meta_keywords_es: !isEnglish && post.meta_keywords ? post.meta_keywords.join(', ') : '',
      });

      // Set generatedData to show metadata fields in edit mode
      setGeneratedData({
        en: {
          title: isEnglish ? post.title : '',
          excerpt: isEnglish ? post.excerpt : '',
          tags: isEnglish && post.tags ? post.tags.join(', ') : '',
          metaDescription: isEnglish && post.meta_description ? post.meta_description : '',
          metaKeywords: isEnglish && post.meta_keywords ? post.meta_keywords.join(', ') : '',
        },
        es: {
          title: !isEnglish ? post.title : '',
          excerpt: !isEnglish ? post.excerpt : '',
          tags: !isEnglish && post.tags ? post.tags.join(', ') : '',
          metaDescription: !isEnglish && post.meta_description ? post.meta_description : '',
          metaKeywords: !isEnglish && post.meta_keywords ? post.meta_keywords.join(', ') : '',
        },
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert datetime-local to UTC ISO string using selected timezone
      const scheduledPublishAt = formData.scheduled_publish_at
        ? convertToUTC(formData.scheduled_publish_at, formData.scheduled_timezone)
        : null;

      // EDIT MODE: Update existing post
      if (post) {
        const isEnglish = post.language === 'en';

        // Prepare update payload based on post language
        const updatePayload: any = {
          title: isEnglish ? formData.title_en : formData.title_es,
          content: isEnglish ? formData.content_en : formData.content_es,
          excerpt: isEnglish ? formData.excerpt_en : formData.excerpt_es,
          cover_image: formData.cover_image,
          category: formData.category,
          status: formData.status,
          scheduled_publish_at: scheduledPublishAt,
        };

        // Add tags if provided
        if (isEnglish && formData.tags_en) {
          updatePayload.tags = formData.tags_en.split(',').map((t: string) => t.trim());
        } else if (!isEnglish && formData.tags_es) {
          updatePayload.tags = formData.tags_es.split(',').map((t: string) => t.trim());
        }

        // Add meta fields if provided
        if (isEnglish) {
          if (formData.meta_description_en) {
            updatePayload.meta_description = formData.meta_description_en;
          }
          if (formData.meta_keywords_en) {
            updatePayload.meta_keywords = formData.meta_keywords_en.split(',').map((k: string) => k.trim());
          }
        } else {
          if (formData.meta_description_es) {
            updatePayload.meta_description = formData.meta_description_es;
          }
          if (formData.meta_keywords_es) {
            updatePayload.meta_keywords = formData.meta_keywords_es.split(',').map((k: string) => k.trim());
          }
        }

        const response = await fetch(`/api/posts/${post.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update post');
        }

        router.push('/admin/blog');
        router.refresh();
        return;
      }

      // CREATE MODE: Create new bilingual posts
      if (!formData.title_es || !formData.excerpt_en || !formData.excerpt_es) {
        setError('Please generate metadata with AI first');
        setLoading(false);
        return;
      }

      const payload = {
        bilingual: true, // Enable bilingual mode
        title_en: formData.title_en,
        content_en: formData.content_en,
        content_es: formData.content_es,
        cover_image: formData.cover_image,
        category: formData.category,
        status: formData.status,
        scheduled_publish_at: scheduledPublishAt,
        en: {
          excerpt: formData.excerpt_en,
          tags: formData.tags_en,
          meta_description: formData.meta_description_en,
          meta_keywords: formData.meta_keywords_en,
        },
        es: {
          title: formData.title_es,
          excerpt: formData.excerpt_es,
          tags: formData.tags_es,
          meta_description: formData.meta_description_es,
          meta_keywords: formData.meta_keywords_es,
        },
      };

      const response = await fetch('/api/posts', {
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

  // Handle image file upload
  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setImageError('');

    try {
      // Create FormData to send file to server
      const formData = new FormData();
      formData.append('file', file);

      // Upload via API route (server-side)
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setImageError(result.error || 'Failed to upload image');
        return;
      }

      setFormData((prev) => ({ ...prev, cover_image: result.url }));
    } catch (err: any) {
      setImageError(err.message || 'An unexpected error occurred');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else {
      setImageError('Please drop an image file');
    }
  };

  // Handle image removal
  const handleRemoveImage = async () => {
    if (!formData.cover_image) return;

    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    setUploadingImage(true);
    setImageError('');

    try {
      // Delete from storage via API
      const response = await fetch(`/api/media?url=${encodeURIComponent(formData.cover_image)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setImageError(result.error || 'Failed to delete image');
        return;
      }

      // Clear from form
      setFormData({ ...formData, cover_image: '' });
    } catch (err: any) {
      setImageError(err.message || 'An unexpected error occurred while deleting');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle image replacement
  const handleReplaceImage = async (file: File) => {
    const oldImageUrl = formData.cover_image;

    try {
      // Upload new image first
      await handleImageUpload(file);

      // If upload was successful and there was an old image, delete it
      if (oldImageUrl) {
        // Delete old image in background (don't block on this)
        fetch(`/api/media?url=${encodeURIComponent(oldImageUrl)}`, {
          method: 'DELETE',
        }).catch((err) => {
          console.error('Failed to delete old image:', err);
        });
      }
    } catch (err: any) {
      console.error('Error replacing image:', err);
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

      {/* Instructions - Only show for new posts */}
      {!post && (
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
      )}

      {/* Edit mode notice */}
      {post && (
        <div className="p-4 bg-[#00ff8820] border-2 border-[#00ff88]">
          <p className="text-[#00ff88] font-bold mb-1">✏️ Editing {post.language === 'en' ? 'English' : 'Spanish'} Post</p>
          <p className="text-gray-300 text-sm">
            You are editing the {post.language === 'en' ? 'English' : 'Spanish'} version of this post.
          </p>
        </div>
      )}

      {/* Non-publisher notice */}
      {!canUserPublish && userRole && (
        <div className="p-4 bg-[#00cfff20] border-2 border-[#00cfff]">
          <p className="text-[#00cfff] font-bold mb-1">📝 {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Role</p>
          <p className="text-gray-300 text-sm">
            You can create and edit posts, but only owners and admins can publish them. Your posts will be saved as drafts for review.
          </p>
        </div>
      )}

      {/* Title - Show appropriate language based on mode */}
      {(!post || post.language === 'en') && (
        <div>
          <label className="block text-white font-bold mb-2 uppercase text-sm">
            Title {post ? '' : '(English)'} *
          </label>
          <input
            type="text"
            required
            value={formData.title_en}
            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
            placeholder="Why AI Browsers Matter"
          />
          {!post && <p className="text-xs text-gray-500 mt-1">Spanish title will be auto-generated by AI</p>}
        </div>
      )}

      {(!post || post.language === 'es') && post && (
        <div>
          <label className="block text-white font-bold mb-2 uppercase text-sm">Título *</label>
          <input
            type="text"
            required
            value={formData.title_es}
            onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
            className="w-full px-4 py-3 bg-black text-white border-2 border-[#00cfff] focus:border-[#00ff88] focus:outline-none"
            placeholder="Por Qué Importan los Navegadores de IA"
          />
        </div>
      )}

      {/* Content - Show appropriate language based on mode */}
      {(!post || post.language === 'en') && (
        <div>
          <label className="block text-white font-bold mb-2 uppercase text-sm">
            Content {post ? '' : '- English'} (Markdown) *
          </label>
          <MarkdownEditor
            value={formData.content_en}
            onChange={(value) => setFormData({ ...formData, content_en: value })}
            placeholder="# Your heading

Your content goes here...

## Subheading

- List item 1
- List item 2"
            borderColor="border-gray-700"
            height={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use the toolbar buttons or markdown syntax. Toggle preview with the tabs above.
          </p>
        </div>
      )}

      {(!post || post.language === 'es') && (
        <div>
          <label className="block text-white font-bold mb-2 uppercase text-sm">
            {post && post.language === 'es' ? 'Contenido' : 'Content - Spanish'} (Markdown) *
          </label>
          <MarkdownEditor
            value={formData.content_es}
            onChange={(value) => setFormData({ ...formData, content_es: value })}
            placeholder="# Tu encabezado

Tu contenido va aquí...

## Subencabezado

- Elemento de lista 1
- Elemento de lista 2"
            borderColor="border-[#00cfff]"
            height={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {post && post.language === 'es'
              ? 'Usa los botones de la barra de herramientas o la sintaxis de markdown.'
              : 'Use the toolbar buttons or markdown syntax. Toggle preview with the tabs above.'}
          </p>
        </div>
      )}

      {/* AI Generate Button - Only for new posts */}
      {!post && (
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
      )}

      {/* Generated Metadata - Editable Fields */}
      {generatedData && (
        <div className="space-y-6 p-6 bg-black border-2 border-[#00ff88]">
          <h3 className="text-[#00ff88] font-bold uppercase text-sm">
            {post ? '✏️ Post Metadata' : '✨ AI-Generated Metadata (Review & Edit)'}
          </h3>

          {/* English Metadata */}
          {(!post || post.language === 'en') && (
          <div className="space-y-4">
            {!post && (
              <h4 className="text-white font-bold uppercase text-xs flex items-center gap-2">
                <span className="text-[#00ff88]">🇬🇧</span> English Metadata
              </h4>
            )}

            {/* English Excerpt */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                Excerpt {post ? '' : '(EN)'} *
              </label>
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
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                Tags {post ? '' : '(EN)'} *
              </label>
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
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                Meta Description {post ? '' : '(EN)'}
              </label>
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
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                Meta Keywords {post ? '' : '(EN)'}
              </label>
              <input
                type="text"
                value={formData.meta_keywords_en}
                onChange={(e) => setFormData({ ...formData, meta_keywords_en: e.target.value })}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none text-sm"
              />
            </div>
          </div>
          )}

          {/* Spanish Metadata */}
          {(!post || post.language === 'es') && (
          <div className={`space-y-4 ${!post ? 'pt-6 border-t-2 border-gray-800' : ''}`}>
            {!post && (
              <h4 className="text-white font-bold uppercase text-xs flex items-center gap-2">
                <span className="text-[#00cfff]">🇪🇸</span> Spanish Metadata
              </h4>
            )}

            {/* Spanish Title - Only show in create mode */}
            {!post && (
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
            )}

            {/* Spanish Excerpt */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                {post && post.language === 'es' ? 'Extracto *' : 'Extracto (ES) *'}
              </label>
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
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                {post && post.language === 'es' ? 'Etiquetas *' : 'Etiquetas (ES) *'}
              </label>
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
          )}
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
            disabled={!canUserPublish && formData.status === 'draft'}
          >
            <option value="draft">Draft</option>
            {canUserPublish && <option value="published">Published</option>}
          </select>
          {!canUserPublish && (
            <p className="text-xs text-[#00cfff] mt-1">Only owners and admins can publish posts</p>
          )}
        </div>
      </div>

      {/* Scheduled Publish Date/Time */}
      {formData.status === 'draft' && (
        <div className="p-4 bg-[#00cfff10] border-2 border-[#00cfff] space-y-4">
          <div>
            <label className="block text-white font-bold mb-2 uppercase text-sm">
              📅 Schedule Publication
            </label>
            <p className="text-xs text-[#00cfff] mb-3">
              Choose your timezone and set when you want this post to be published
            </p>
          </div>

          {/* Timezone Selector */}
          <div>
            <label className="block text-white font-bold mb-2 uppercase text-xs">
              🌍 Timezone
            </label>
            <select
              value={formData.scheduled_timezone}
              onChange={(e) => setFormData({ ...formData, scheduled_timezone: e.target.value })}
              className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none text-sm"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} ({tz.offset})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Select the timezone you want to use for scheduling
            </p>
          </div>

          {/* Date/Time Input */}
          <div>
            <label className="block text-white font-bold mb-2 uppercase text-xs">
              📆 Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_publish_at}
              onChange={(e) => setFormData({ ...formData, scheduled_publish_at: e.target.value })}
              className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter time in {TIMEZONES.find(tz => tz.value === formData.scheduled_timezone)?.label} timezone
            </p>
          </div>

          {formData.scheduled_publish_at && (
            <div className="p-3 bg-[#00ff8820] border border-[#00ff88]">
              <p className="text-xs text-[#00ff88] font-bold">
                ✅ Scheduled for: {formData.scheduled_publish_at.replace('T', ' at ')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                🌍 {TIMEZONES.find(tz => tz.value === formData.scheduled_timezone)?.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Will be stored as UTC in database and published automatically
              </p>
            </div>
          )}

          <p className="text-xs text-gray-300">
            💡 Leave empty to keep as draft. Post will auto-publish at the scheduled time (via n8n cron every 10 minutes).
          </p>
        </div>
      )}

      {/* Cover Image Upload */}
      <div>
        <label className="block text-white font-bold mb-2 uppercase text-sm">Cover Image</label>

        {imageError && (
          <div className="mb-3 p-3 bg-[#ff005520] border-2 border-[#ff0055] text-[#ff0055] text-sm">
            {imageError}
          </div>
        )}

        {!formData.cover_image ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed transition-colors ${
              isDragging
                ? 'border-[#00ff88] bg-[#00ff8820]'
                : 'border-gray-700 hover:border-gray-500'
            } ${uploadingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={handleFileChange}
              disabled={uploadingImage}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              id="cover-image-upload"
            />
            <label
              htmlFor="cover-image-upload"
              className="flex flex-col items-center justify-center p-8 cursor-pointer"
            >
              {uploadingImage ? (
                <>
                  <svg
                    className="animate-spin h-10 w-10 text-[#00ff88] mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-white font-bold">Uploading...</p>
                </>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 text-gray-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-white font-bold mb-2">
                    {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    JPEG, PNG, WebP, AVIF, or GIF (max 5MB)
                  </p>
                </>
              )}
            </label>
          </div>
        ) : (
          <div className="relative border-2 border-[#00ff88]">
            <div className="relative aspect-video w-full">
              <Image
                src={formData.cover_image}
                alt="Cover preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              {/* Replace button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplaceImage(file);
                  }}
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="replace-image-input"
                />
                <label
                  htmlFor="replace-image-input"
                  className={`block bg-[#00cfff] text-black p-2 hover:bg-[#00e5ff] transition-colors font-bold uppercase text-xs cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Replace image"
                >
                  🔄 Replace
                </label>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploadingImage}
                className="bg-[#ff0055] text-white p-2 hover:bg-[#ff0077] transition-colors font-bold uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove image"
              >
                ✕ Remove
              </button>
            </div>
            <div className="p-3 bg-black border-t-2 border-[#00ff88]">
              <p className="text-xs text-gray-500 break-all">{formData.cover_image}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Same cover image will be used for both language versions
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={loading || (!post && (!formData.title_es || !formData.excerpt_en || !formData.excerpt_es))}
          className="px-8 py-3 bg-[#00ff88] text-black font-bold uppercase hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? (post ? 'Saving...' : (!canUserPublish ? 'Saving Draft...' : 'Publishing Both Posts...'))
            : (post
                ? '💾 Save Changes'
                : (!canUserPublish ? '📝 Save as Draft' : '🌍 Publish Both Languages')
              )
          }
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
