'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import CourseBuilder from '@/components/courses/CourseBuilder';
import InstructorSelector, { SelectedInstructor } from '@/components/courses/InstructorSelector';
import { generateCourseSlug } from '@/lib/course-utils';
import Image from "next/image";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    short_description: '',
    cover_image: '',
    language: 'es' as 'en' | 'es',
    status: 'draft' as 'draft' | 'published',
    meta_title: '',
    meta_description: '',
  });

  const [courseData, setCourseData] = useState<any>(null);
  const [selectedInstructors, setSelectedInstructors] = useState<SelectedInstructor[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!courseData) {
        throw new Error('Please configure course content using the builder below');
      }

      // Ensure hero title is synced with main title before submission
      const finalCourseData = courseData.hero ? {
        ...courseData,
        hero: {
          ...courseData.hero,
          title: formData.title
        }
      } : courseData;

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          course_data: finalCourseData,
          published_at: formData.status === 'published' ? new Date().toISOString() : null,
          instructors: selectedInstructors,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      router.push('/admin/courses');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = useCallback((title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateCourseSlug(title)
    }));
    // Sync with hero title if hero section exists
    setCourseData((prev: any) => {
      if (prev && prev.hero) {
        return {
          ...prev,
          hero: {
            ...prev.hero,
            title: title
          }
        };
      }
      return prev;
    });
  }, []);

  const handleCourseDataChange = useCallback((data: any) => {
    setCourseData(data);
    // Sync hero title with main title if it exists
    if (data?.hero?.title && data.hero.title !== formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: data.hero.title,
        slug: generateCourseSlug(data.hero.title)
      }));
    }
  }, [formData.title]);

  return (
    <AdminPageWrapper title="New Course">
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-2">Create New Course</h1>
          <p className="text-gray-400">Use the visual builder to create your course</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="AI-Driven Workflow Automation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug * <span className="text-gray-500">(auto-generated)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="ai-workflow-automation"
                />
                <p className="text-xs text-gray-500 mt-1">URL: /{formData.language}/courses/{formData.slug}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description * <span className="text-gray-500">(for cards/previews)</span>
                </label>
                <textarea
                  required
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Learn to build autonomous systems that work while you sleep..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image URL <span className="text-gray-500">(for course listings/previews)</span>
                </label>
                <input
                  type="text"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://example.com/course-cover.jpg"
                />
                {formData.cover_image && (
                  <div className="mt-2">
                    <Image
                      src={formData.cover_image}
                      alt="Course cover preview"
                      className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'es' })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">SEO (Optional)</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="AI Workflow Automation | idir.ai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Learn to build autonomous systems..."
                />
              </div>
            </div>
          </div>

          {/* Instructors */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Instructors</h2>
            <p className="text-sm text-gray-400 mb-6">
              Select instructors for this course. You can assign multiple instructors and set their roles.
            </p>
            <InstructorSelector
              selectedInstructors={selectedInstructors}
              onChange={setSelectedInstructors}
            />
          </div>

          {/* Course Builder */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-2">Course Content Builder *</h2>
            <p className="text-sm text-gray-400 mb-6">
              Use the builder below to create your course structure. Toggle sections on/off and add content dynamically.
            </p>

            <CourseBuilder onDataChange={handleCourseDataChange} />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </AdminPageWrapper>
  );
}
