'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

type CourseSignup = {
  id: string;
  full_name: string;
  email: string;
  course_slug: string;
  signup_status: string;
  language: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  birth_year: string | null;
  created_at: string;
  completed_at: string | null;
  certificate_id: string | null;
  certificate_url: string | null;
};

type Stats = {
  total: number;
  confirmed: number;
  pending: number;
  waitlist: number;
  completed: number;
};

export default function CoursesAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState<CourseSignup[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'waitlist' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSignups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchSignups() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/course-signups?course_slug=automation-101');

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch signups');
      }

      const data = await response.json();
      setSignups(data.signups || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching signups:', error);
      alert('Failed to load course signups');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/admin/course-signups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signup_status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh data
      await fetchSignups();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update signup status');
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteSignup(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}'s signup? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/course-signups/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete signup');
      }

      // Refresh data
      await fetchSignups();
    } catch (error) {
      console.error('Error deleting signup:', error);
      alert('Failed to delete signup');
    } finally {
      setDeletingId(null);
    }
  }

  async function markComplete(id: string, name: string) {
    if (!confirm(`Mark ${name} as completed and generate certificate?`)) {
      return;
    }

    setCompletingId(id);
    try {
      const response = await fetch(`/api/admin/course-signups/${id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark complete');
      }

      // Refresh data
      await fetchSignups();
      alert('Certificate generated successfully!');
    } catch (error) {
      console.error('Error marking complete:', error);
      alert('Failed to generate certificate');
    } finally {
      setCompletingId(null);
    }
  }

  async function regenerateCertificate(certificateId: string, name: string) {
    if (!confirm(`Regenerate certificate for ${name}?`)) {
      return;
    }

    setRegeneratingId(certificateId);
    try {
      const response = await fetch(`/api/admin/certificates/${certificateId}/regenerate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate certificate');
      }

      // Refresh data
      await fetchSignups();
      alert('Certificate regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating certificate:', error);
      alert('Failed to regenerate certificate');
    } finally {
      setRegeneratingId(null);
    }
  }

  const filteredSignups = signups.filter(signup => {
    const matchesStatus = filterStatus === 'all' || signup.signup_status === filterStatus;
    const fullName = (signup.full_name || '').toLowerCase();
    const courseSlug = (signup.course_slug || '').toLowerCase();
    const matchesSearch = searchQuery === '' ||
      fullName.includes(searchQuery.toLowerCase()) ||
      courseSlug.includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-[#00ff88] border-[#00ff88]';
      case 'pending':
        return 'text-[#ffaa00] border-[#ffaa00]';
      case 'waitlist':
        return 'text-[#00cfff] border-[#00cfff]';
      case 'cancelled':
        return 'text-[#ff0055] border-[#ff0055]';
      default:
        return 'text-gray-400 border-gray-700';
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

  if (loading) {
    return (
      <AdminPageWrapper showLogout={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-[#00ff88]">Loading course signups...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      showLogout={false}
      title="Course Signups - Automatización 101"
      description="Manage course enrollments and track student status"
    >
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-black border border-gray-800 p-3">
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Total</div>
            <div className="text-2xl font-black text-white">{stats.total || 0}</div>
          </div>
          <div className="bg-black border border-[#00ff88] p-3">
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Confirmed</div>
            <div className="text-2xl font-black text-[#00ff88]">{stats.confirmed || 0}</div>
          </div>
          <div className="bg-black border border-[#ffaa00] p-3">
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Pending</div>
            <div className="text-2xl font-black text-[#ffaa00]">{stats.pending || 0}</div>
          </div>
          <div className="bg-black border border-[#00cfff] p-3">
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Waitlist</div>
            <div className="text-2xl font-black text-[#00cfff]">{stats.waitlist || 0}</div>
          </div>
          <div className="bg-black border border-[#9b59d0] p-3">
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Completed</div>
            <div className="text-2xl font-black text-[#9b59d0]">{stats.completed || 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-black border border-gray-800 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs text-gray-500 font-bold uppercase mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-[#0a0a0a] border border-gray-700 text-white text-sm px-2.5 py-1.5 focus:outline-none focus:border-[#00ff88]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="waitlist">Waitlist</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs text-gray-500 font-bold uppercase mb-1.5">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or course..."
              className="w-full bg-[#0a0a0a] border border-gray-700 text-white text-sm px-2.5 py-1.5 focus:outline-none focus:border-[#00ff88] placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Signups Table */}
      <div className="bg-black border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0a0a0a] border-b border-gray-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Signed Up
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredSignups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                    No signups found with current filters
                  </td>
                </tr>
              ) : (
                filteredSignups.map((signup) => (
                  <tr
                    key={signup.id}
                    className="hover:bg-[#0a0a0a] transition-colors"
                  >
                    <td className="px-3 py-2">
                      <div className="font-bold text-white text-sm">
                        {signup.full_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {signup.language?.toUpperCase() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-300 font-semibold">
                        {signup.country ? (
                          <span className="px-2 py-0.5 bg-[#0a0a0a] border border-gray-700 rounded text-xs uppercase">
                            {signup.country}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-mono text-xs text-[#00ff88]">
                        {signup.course_slug || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {updatingId === signup.id ? (
                        <div className="text-gray-500 text-xs">Updating...</div>
                      ) : (
                        <select
                          value={signup.signup_status}
                          onChange={(e) => updateStatus(signup.id, e.target.value)}
                          className={`px-1.5 py-0.5 text-xs font-bold uppercase bg-[#0a0a0a] border rounded cursor-pointer focus:outline-none ${getStatusColor(signup.signup_status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="waitlist">Waitlist</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {signup.completed_at ? (
                        <div className="flex flex-col gap-1">
                          <div className="text-xs text-[#00ff88]">
                            ✓ {new Date(signup.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          {signup.certificate_url && (
                            <div className="flex gap-1.5">
                              <a
                                href={signup.certificate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#00cfff] hover:underline"
                              >
                                View
                              </a>
                              <button
                                onClick={() => regenerateCertificate(signup.certificate_id!, signup.full_name || 'Student')}
                                disabled={regeneratingId === signup.certificate_id}
                                className="text-xs text-gray-500 hover:text-[#00ff88] disabled:opacity-50"
                              >
                                {regeneratingId === signup.certificate_id ? 'Regen...' : 'Regen'}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => markComplete(signup.id, signup.full_name || 'Student')}
                          disabled={completingId === signup.id}
                          className="px-2 py-0.5 text-xs font-bold uppercase bg-[#00ff88] text-black hover:bg-[#00cfff] transition-colors disabled:opacity-50"
                        >
                          {completingId === signup.id ? 'Processing...' : 'Complete'}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-400 text-xs">
                      {new Date(signup.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => deleteSignup(signup.id, signup.full_name || 'Student')}
                        disabled={deletingId === signup.id}
                        className={`px-2 py-0.5 text-xs font-bold uppercase transition-all ${
                          deletingId === signup.id
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-[#0a0a0a] border border-gray-700 text-gray-400 hover:border-[#ff0055] hover:text-[#ff0055]'
                        }`}
                      >
                        {deletingId === signup.id ? 'Del...' : 'Del'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total count */}
      <div className="mt-4 text-gray-500 text-sm">
        Showing {filteredSignups.length} of {signups.length} signups
      </div>
    </AdminPageWrapper>
  );
}
