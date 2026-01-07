'use client';

import { useState, useEffect } from 'react';
import { BlogCategory } from '@/lib/blog';
import Image from 'next/image';

type MetadataPanelProps = {
  isOpen: boolean;
  formData: any;
  language: 'en' | 'es';
  isEditMode: boolean;
  onUpdate: (updates: any) => void;
  onClose: () => void;
  canUserPublish?: boolean;
};

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

export default function MetadataPanel({
  isOpen,
  formData,
  language,
  isEditMode,
  onUpdate,
  onClose,
  canUserPublish = false,
}: MetadataPanelProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Handle image file upload
  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setImageError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setImageError(result.error || 'Failed to upload image');
        return;
      }

      onUpdate({ cover_image: result.url });
    } catch (err: any) {
      setImageError(err.message || 'An unexpected error occurred');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

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

  const handleRemoveImage = async () => {
    if (!formData.cover_image) return;

    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    setUploadingImage(true);
    setImageError('');

    try {
      const response = await fetch(`/api/media?url=${encodeURIComponent(formData.cover_image)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setImageError(result.error || 'Failed to delete image');
        return;
      }

      onUpdate({ cover_image: '' });
    } catch (err: any) {
      setImageError(err.message || 'An unexpected error occurred while deleting');
    } finally {
      setUploadingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-[500px] max-w-full bg-black border-l-2 border-gray-700 overflow-y-auto z-[70] transform transition-transform duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b-2 border-gray-700 p-4 flex items-center justify-between">
          <h3 className="text-white font-bold uppercase text-sm">
            📋 Post Metadata
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white font-bold mb-2 uppercase text-sm">
              {isEditMode
                ? (language === 'en' ? 'Title *' : 'Título *')
                : `Title (${language === 'en' ? 'English' : 'Spanish'}) *`
              }
            </label>
            <input
              type="text"
              required
              value={language === 'en' ? formData.title_en : formData.title_es}
              onChange={(e) => onUpdate({
                [language === 'en' ? 'title_en' : 'title_es']: e.target.value
              })}
              className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
              placeholder={language === 'en' ? 'Why AI Browsers Matter' : 'Por Qué Importan los Navegadores de IA'}
            />
          </div>

          {/* Cover Image */}
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
                  id="metadata-cover-image-upload"
                />
                <label
                  htmlFor="metadata-cover-image-upload"
                  className="flex flex-col items-center justify-center p-6 cursor-pointer"
                >
                  {uploadingImage ? (
                    <>
                      <svg
                        className="animate-spin h-8 w-8 text-[#00ff88] mb-3"
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
                      <p className="text-white font-bold text-sm">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-10 h-10 text-gray-500 mb-3"
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
                      <p className="text-white font-bold mb-1 text-sm">
                        {isDragging ? 'Drop image here' : 'Click or drag to upload'}
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
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                    className="bg-[#ff0055] text-white px-3 py-1 hover:bg-[#ff0077] transition-colors font-bold uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-sm">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => onUpdate({ category: e.target.value as BlogCategory })}
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
                onChange={(e) => onUpdate({ status: e.target.value as 'draft' | 'published' })}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
                disabled={!canUserPublish && formData.status === 'draft'}
              >
                <option value="draft">Draft</option>
                {canUserPublish && <option value="published">Published</option>}
              </select>
              {!canUserPublish && (
                <p className="text-xs text-[#00cfff] mt-1">Only owners and admins can publish</p>
              )}
            </div>
          </div>

          {/* Scheduled Publish */}
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

              <div>
                <label className="block text-white font-bold mb-2 uppercase text-xs">
                  🌍 Timezone
                </label>
                <select
                  value={formData.scheduled_timezone || 'Europe/Berlin'}
                  onChange={(e) => onUpdate({ scheduled_timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none text-sm"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-bold mb-2 uppercase text-xs">
                  📆 Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_publish_at || ''}
                  onChange={(e) => onUpdate({ scheduled_publish_at: e.target.value })}
                  className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {formData.scheduled_publish_at && (
                <div className="p-3 bg-[#00ff8820] border border-[#00ff88]">
                  <p className="text-xs text-[#00ff88] font-bold">
                    ✅ Scheduled for: {formData.scheduled_publish_at.replace('T', ' at ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    🌍 {TIMEZONES.find(tz => tz.value === (formData.scheduled_timezone || 'Europe/Berlin'))?.label}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Metadata Fields */}
          <div className="space-y-4 pt-4 border-t-2 border-gray-800">
            <h4 className="text-white font-bold uppercase text-xs">SEO Metadata</h4>

            {/* Excerpt */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                Excerpt *
              </label>
              <textarea
                required
                value={language === 'en' ? formData.excerpt_en : formData.excerpt_es}
                onChange={(e) => onUpdate({
                  [language === 'en' ? 'excerpt_en' : 'excerpt_es']: e.target.value
                })}
                rows={2}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none resize-none text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                Tags *
              </label>
              <input
                type="text"
                required
                value={language === 'en' ? formData.tags_en : formData.tags_es}
                onChange={(e) => onUpdate({
                  [language === 'en' ? 'tags_en' : 'tags_es']: e.target.value
                })}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none text-sm"
                placeholder="ai, automation, technology"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                Meta Description
              </label>
              <textarea
                value={language === 'en' ? formData.meta_description_en : formData.meta_description_es}
                onChange={(e) => onUpdate({
                  [language === 'en' ? 'meta_description_en' : 'meta_description_es']: e.target.value
                })}
                rows={2}
                maxLength={160}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(language === 'en' ? formData.meta_description_en?.length : formData.meta_description_es?.length) || 0}/160
              </p>
            </div>

            {/* TL;DR */}
            <div>
              <label className="block text-white font-bold mb-2 uppercase text-xs">
                TL;DR - Key Takeaways ⚡
              </label>
              <textarea
                value={language === 'en' ? formData.tldr_en : formData.tldr_es}
                onChange={(e) => onUpdate({
                  [language === 'en' ? 'tldr_en' : 'tldr_es']: e.target.value
                })}
                rows={4}
                className="w-full px-4 py-3 bg-black text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none resize-vertical text-sm font-mono"
                placeholder="AI agents are transforming automation&#10;No-code tools make AI accessible to everyone&#10;The future of work is human-AI collaboration"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add 3-5 key takeaways (one per line)
              </p>
            </div>
          </div>

          {/* Close button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-800 text-white font-bold uppercase hover:bg-gray-700 transition-colors"
            >
              Close Panel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
