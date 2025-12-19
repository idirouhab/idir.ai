'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

type Enrollment = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string | null;
  birth_year: string | null;
  signup_status: string;
  language: string;
  created_at: string;
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'enrolled', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  enrolled: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function CourseEnrollmentsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [courseSlug, setCourseSlug] = useState<string>('');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseAndEnrollments();
  }, [courseId]);

  const fetchCourseAndEnrollments = async () => {
    try {
      // First fetch the course to get the slug
      const courseResponse = await fetch(`/api/admin/courses/${courseId}`);
      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        const slug = courseData.course.slug;
        const title = courseData.course.title;
        setCourseSlug(slug);
        setCourseTitle(title);

        // Then fetch enrollments by slug
        const enrollmentsResponse = await fetch(`/api/admin/courses/${courseId}/enrollments?slug=${slug}`);
        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          setEnrollments(enrollmentsData.enrollments);
        }
      }
    } catch (error) {
      console.error('Error fetching course and enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (enrollmentId: string, newStatus: string) => {
    setUpdatingId(enrollmentId);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signup_status: newStatus }),
      });

      if (response.ok) {
        setEnrollments(enrollments.map(e =>
          e.id === enrollmentId ? { ...e, signup_status: newStatus } : e
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to delete this enrollment?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminPageWrapper title={`Enrollments - ${courseTitle || courseSlug}`}>
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Back to Courses
        </button>
        <div className="text-gray-400">
          Total Enrollments: <span className="text-white font-bold">{enrollments.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading enrollments...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-white mb-2">No enrollments yet</h3>
          <p className="text-gray-400">Enrollments will appear here when students sign up</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Enrolled
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {enrollment.first_name} {enrollment.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{enrollment.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {enrollment.country || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={enrollment.signup_status}
                        onChange={(e) => handleStatusChange(enrollment.id, e.target.value)}
                        disabled={updatingId === enrollment.id}
                        className={`px-3 py-1 text-xs font-bold rounded ${
                          STATUS_COLORS[enrollment.signup_status] || 'bg-gray-700 text-gray-300'
                        } bg-opacity-100 border-none focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {formatDate(enrollment.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(enrollment.id)}
                        className="px-3 py-1 bg-red-900/50 text-red-400 text-xs font-medium rounded hover:bg-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminPageWrapper>
  );
}
