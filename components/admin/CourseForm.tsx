'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Course, CourseCategory, CourseLevel, CourseType, generateCourseSlug } from '@/lib/courses';
import dynamic from 'next/dynamic';

// Lazy load MarkdownEditor
const MarkdownEditor = dynamic(() => import('@/components/admin/MarkdownEditor'), {
  loading: () => <div className="p-4 text-gray-400">Loading editor...</div>,
  ssr: false,
});

type Props = {
  course?: Course;
};

export default function CourseForm({ course }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'blogger' | null>(null);
  const [canUserPublish, setCanUserPublish] = useState(false);

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    content: '',
    cover_image: '',
    category: 'automation' as CourseCategory,
    level: 'beginner' as CourseLevel,
    duration_hours: 1,
    course_type: 'free' as CourseType,
    language: 'en' as 'en' | 'es',
    status: 'draft' as 'draft' | 'published',
    tags: '',
    prerequisites: '',
  });

  // Fetch current user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user.role);
          setCanUserPublish(data.user.role === 'owner' || data.user.role === 'admin');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchUserRole();
  }, []);

  // Load course data into form when editing
  useEffect(() => {
    if (course) {
      setFormData({
        slug: course.slug,
        title: course.title,
        description: course.description,
        content: course.content,
        cover_image: course.cover_image || '',
        category: course.category,
        level: course.level || 'beginner',
        duration_hours: course.duration_hours || 1,
        course_type: course.course_type,
        language: course.language,
        status: course.status,
        tags: course.tags?.join(', ') || '',
        prerequisites: course.prerequisites?.join(', ') || '',
      });
    }
  }, [course]);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      // Only auto-generate slug if we're creating a new course
      slug: course ? prev.slug : generateCourseSlug(newTitle)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare course data
      const courseData = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        cover_image: formData.cover_image || null,
        category: formData.category,
        level: formData.level,
        duration_hours: formData.duration_hours,
        course_type: formData.course_type,
        language: formData.language,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        prerequisites: formData.prerequisites ? formData.prerequisites.split(',').map(p => p.trim()).filter(Boolean) : [],
      };

      // EDIT MODE: Update existing course
      if (course) {
        const response = await fetch(`/api/admin/courses/${course.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update course');
        }

        alert('Course updated successfully!');
        router.push('/admin/courses');
        router.refresh();
      }
      // CREATE MODE: Create new course
      else {
        const response = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create course');
        }

        alert('Course created successfully!');
        router.push('/admin/courses');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Error saving course:', err);
      setError(err.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 text-red-500">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Basic Information</h3>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            required
            className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            placeholder="e.g., Automation 101"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Slug * {!course && <span className="text-gray-500 font-normal">(auto-generated)</span>}
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
            className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none font-mono"
            placeholder="automation-101"
          />
          <p className="mt-1 text-xs text-gray-500">
            URL: /courses/{formData.slug}
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Short Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            rows={3}
            className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none resize-none"
            placeholder="A brief description of what students will learn..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Cover Image URL
          </label>
          <input
            type="url"
            value={formData.cover_image}
            onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
            className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Course Details */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Course Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CourseCategory }))}
              required
              className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            >
              <option value="automation">Automation</option>
              <option value="ai">AI</option>
              <option value="productivity">Productivity</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Level *
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as CourseLevel }))}
              required
              className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Duration (hours) *
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={formData.duration_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) }))}
              required
              className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Course Type *
            </label>
            <select
              value={formData.course_type}
              onChange={(e) => setFormData(prev => ({ ...prev, course_type: e.target.value as CourseType }))}
              required
              className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="waitlist">Waitlist</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Language *
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as 'en' | 'es' }))}
              required
              className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Tags
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            placeholder="automation, n8n, workflows (comma-separated)"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Prerequisites
          </label>
          <input
            type="text"
            value={formData.prerequisites}
            onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
            className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            placeholder="Basic programming knowledge, Understanding of APIs (comma-separated)"
          />
        </div>
      </div>

      {/* Course Content */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Course Content</h3>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Content (Markdown) *
          </label>
          <div className="border-2 border-gray-700">
            <MarkdownEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            />
          </div>
        </div>
      </div>

      {/* Publishing Options */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Publishing</h3>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Status *
          </label>
          {canUserPublish ? (
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
              required
              className="w-full p-3 bg-black border-2 border-gray-700 text-white focus:border-[#00ff88] focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          ) : (
            <div>
              <input
                type="text"
                value="Draft (you don't have permission to publish)"
                disabled
                className="w-full p-3 bg-gray-900 border-2 border-gray-700 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-2 text-sm text-gray-500">
                Only owners and admins can publish courses.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-6 border-t-2 border-gray-800">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#00ff88] text-black font-bold uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (course ? 'Update Course' : 'Create Course')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/courses')}
          disabled={loading}
          className="px-6 py-3 border-2 border-gray-700 text-gray-300 font-bold uppercase hover:border-gray-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
