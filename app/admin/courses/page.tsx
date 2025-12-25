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
      <div className="mb-6 flex justify-end items-center">
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
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Stats</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white truncate">{course.title}</h3>
                          <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                            course.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {course.status}
                          </span>
                          <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-gray-700 text-gray-300">
                            {course.language}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">{course.short_description}</p>
                        <p className="text-xs text-gray-500 mt-1">/{course.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-400 font-bold">{course.course_signups[0]?.count ?? 0}</span>
                        <span>enrollments</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/courses/${course.id}/enrollments`}
                        className="px-3 py-1.5 bg-blue-900/50 text-blue-400 text-xs font-medium rounded hover:bg-blue-900 transition-colors"
                        title="View enrollments"
                      >
                        📋 {course.course_signups[0]?.count ?? 0}
                      </Link>
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded hover:bg-gray-600 transition-colors"
                        title="Edit course"
                      >
                        ✏️
                      </Link>
                      {course.status === 'published' && (
                        <Link
                          href={`/${course.language}/courses/${course.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 bg-emerald-900/50 text-emerald-400 text-xs font-medium rounded hover:bg-emerald-900 transition-colors"
                          title="View course"
                        >
                          👁️
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="px-3 py-1.5 bg-red-900/50 text-red-400 text-xs font-medium rounded hover:bg-red-900 transition-colors"
                        title="Delete course"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageWrapper>
  );
}
