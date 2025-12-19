'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Course } from '@/lib/courses';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCourses();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <AdminPageWrapper title="Courses">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-black text-white">Courses</h1>
        <Link
          href="/admin/courses/new"
          className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
        >
          + New Course
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
          <p className="text-gray-400 mb-6">Create your first course to get started</p>
          <Link
            href="/admin/courses/new"
            className="inline-block px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Create Course
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{course.title}</h3>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      course.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {course.status}
                    </span>
                    <span className="px-2 py-1 text-xs font-bold rounded bg-gray-700 text-gray-300">
                      {course.language}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3">{course.short_description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>👁️ {course.view_count} views</span>
                    <span>✍️ {course.enrollment_count} enrollments</span>
                    <span>🔗 /{course.slug}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="px-4 py-2 bg-red-900/50 text-red-400 font-medium rounded-lg hover:bg-red-900 transition-colors"
                  >
                    Delete
                  </button>
                  {course.status === 'published' && (
                    <Link
                      href={`/${course.language}/courses/${course.slug}`}
                      target="_blank"
                      className="px-4 py-2 bg-emerald-900/50 text-emerald-400 font-medium rounded-lg hover:bg-emerald-900 transition-colors"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageWrapper>
  );
}
