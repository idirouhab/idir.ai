'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Course, categoryColors } from '@/lib/courses';
import { MoreVertical, Pencil, Trash2, ImageIcon, Users, Eye } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

export default function AdminCoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        // Check auth first
        const authResponse = await fetch('/api/auth/me');
        if (!authResponse.ok) {
          router.push('/admin/login');
          return;
        }

        // Fetch all courses (includes both published and drafts)
        const response = await fetch('/api/admin/courses?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data.courses || []);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        router.push('/admin/login');
      }
    };

    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeletingId(courseId);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete course');
      }

      // Refresh the courses list
      const coursesResponse = await fetch('/api/admin/courses?limit=100');
      const coursesData = await coursesResponse.json();
      setCourses(coursesData.courses || []);

      alert('Course deleted successfully');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      alert(error.message || 'Failed to delete course. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderCourse = (course: Course) => {
    const categoryColor = categoryColors[course.category];

    return (
      <div className="p-3 hover:bg-[#0a0a0a] transition-colors">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {course.cover_image ? (
              <div className="relative w-24 h-16 border border-gray-700 overflow-hidden">
                <Image
                  src={course.cover_image}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            ) : (
              <div className="w-24 h-16 border border-gray-700 bg-gray-900 flex items-center justify-center">
                <ImageIcon size={20} className="text-gray-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
            {/* Title and metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="text-white font-bold text-sm hover:text-[#00ff88] transition-colors"
                >
                  {course.title}
                </Link>
                {course.status === 'published' ? (
                  <span className="px-1.5 py-0.5 text-xs font-bold uppercase bg-[#00ff88] text-black">PUB</span>
                ) : (
                  <span className="px-1.5 py-0.5 text-xs font-bold uppercase bg-gray-800 text-gray-400">DRAFT</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                <span
                  className="px-1.5 py-0.5 font-bold uppercase"
                  style={{
                    background: `${categoryColor}20`,
                    color: categoryColor,
                    border: `1px solid ${categoryColor}`,
                  }}
                >
                  {course.category}
                </span>
                <span className="uppercase">{course.language}</span>
                {course.level && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{course.level}</span>
                  </>
                )}
                {course.duration_hours && (
                  <>
                    <span>•</span>
                    <span>{course.duration_hours}h</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {course.view_count}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {course.enrollment_count}
                </span>
                {course.published_at && (
                  <>
                    <span>•</span>
                    <span>{new Date(course.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActionMenuOpen(actionMenuOpen === course.id ? null : course.id)}
                  disabled={deletingId === course.id}
                  className="px-2.5 py-1.5 border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Actions"
                >
                  {deletingId === course.id ? '...' : <MoreVertical size={16} />}
                </button>

                {actionMenuOpen === course.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActionMenuOpen(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-black border border-gray-700 z-20 min-w-[140px]">
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-300 font-bold uppercase hover:bg-[#0a0a0a] hover:text-[#00cfff] transition-all"
                        onClick={() => setActionMenuOpen(null)}
                      >
                        <Pencil size={14} /> Edit
                      </Link>
                      <button
                        onClick={() => {
                          setActionMenuOpen(null);
                          handleDelete(course.id, course.title);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-400 font-bold uppercase hover:bg-[#0a0a0a] hover:text-[#ff0055] transition-all border-t border-gray-800"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminPageWrapper showLogout={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper showLogout={false}>
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Courses</h2>
          <p className="text-gray-400 text-sm">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/courses/signups"
            className="px-4 py-2 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-gray-500 hover:text-white transition-all"
          >
            View Signups
          </Link>
          <Link
            href="/admin/courses/new"
            className="px-4 py-2 text-xs bg-[#00ff88] text-black font-bold uppercase hover:opacity-90 transition-opacity"
          >
            + New Course
          </Link>
        </div>
      </div>

      {/* Courses List */}
      {courses.length > 0 ? (
        <div className="bg-black border border-gray-800">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className={index !== courses.length - 1 ? 'border-b border-gray-800' : ''}
            >
              {renderCourse(course)}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black border border-gray-800 p-12 text-center">
          <p className="text-gray-500 mb-4">No courses yet</p>
          <Link
            href="/admin/courses/new"
            className="inline-block px-4 py-2 text-xs bg-[#00ff88] text-black font-bold uppercase hover:opacity-90 transition-opacity"
          >
            Create First Course
          </Link>
        </div>
      )}
    </AdminPageWrapper>
  );
}
