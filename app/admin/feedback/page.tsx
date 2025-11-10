'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Feedback = {
  id: string;
  subscriber_email: string;
  feedback_type: 'very_useful' | 'useful' | 'not_useful' | null;
  campaign_date: string;
  responded_at: string | null;
  answered_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
};

type Stats = {
  total: number;
  answered: number;
  unanswered: number;
  byType: {
    very_useful: number;
    useful: number;
    not_useful: number;
  };
};

export default function FeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'answered' | 'unanswered'>('unanswered');
  const [filterType, setFilterType] = useState<'all' | 'very_useful' | 'useful' | 'not_useful'>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterType, filterDate]);

  async function checkAuthAndFetch() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterDate) params.append('date', filterDate);

      const response = await fetch(`/api/admin/feedback?${params.toString()}`);

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      setFeedback(data.feedback || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      alert('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }

  async function toggleAnswered(id: string, currentlyAnswered: boolean) {
    setUpdatingId(id);
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, answered: !currentlyAnswered }),
      });

      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }

      // Refresh data
      await checkAuthAndFetch();
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback status');
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.subscriber_email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getFeedbackIcon = (type: string | null) => {
    if (!type) return '○';
    switch (type) {
      case 'very_useful': return '😍';
      case 'useful': return '👍';
      case 'not_useful': return '👎';
      default: return '•';
    }
  };

  const getFeedbackLabel = (type: string | null) => {
    if (!type) return 'No response yet';
    switch (type) {
      case 'very_useful': return 'Very Useful';
      case 'useful': return 'Useful';
      case 'not_useful': return 'Not Useful';
      default: return type;
    }
  };

  const getFeedbackColor = (type: string | null) => {
    if (!type) return 'text-gray-600';
    switch (type) {
      case 'very_useful': return 'text-[#00ff88]';
      case 'useful': return 'text-[#00cfff]';
      case 'not_useful': return 'text-[#ff0055]';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
        <div className="border-b border-gray-800 bg-black">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-black text-white">ADMIN</h1>
              <nav className="hidden md:flex gap-6">
                <Link href="/admin" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/blog" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                  Blog
                </Link>
                <Link href="/admin/subscribers" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                  Subscribers
                </Link>
                <Link href="/admin/feedback" className="text-sm text-white font-bold uppercase hover:text-[#00ff88] transition-colors">
                  Feedback
                </Link>
                <Link href="/admin/users" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                  Users
                </Link>
              </nav>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-white hover:text-white transition-all"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-[#00ff88]">Loading feedback...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header Bar */}
      <div className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-white">ADMIN</h1>
            <nav className="hidden md:flex gap-6">
              <Link href="/admin" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/blog" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Blog
              </Link>
              <Link href="/admin/subscribers" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Subscribers
              </Link>
              <Link href="/admin/feedback" className="text-sm text-white font-bold uppercase hover:text-[#00ff88] transition-colors">
                Feedback
              </Link>
              <Link href="/admin/users" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Users
              </Link>
            </nav>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-white hover:text-white transition-all"
            >
              View Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Newsletter Feedback</h2>
          <p className="text-gray-400 text-sm">Manage and track subscriber feedback responses</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-black border border-gray-800 p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Total</div>
              <div className="text-3xl font-black text-white">{stats.total}</div>
            </div>
            <div className="bg-black border border-[#00ff88] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Answered</div>
              <div className="text-3xl font-black text-[#00ff88]">{stats.answered}</div>
            </div>
            <div className="bg-black border border-[#ff0055] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Unanswered</div>
              <div className="text-3xl font-black text-[#ff0055]">{stats.unanswered}</div>
            </div>
            <div className="bg-black border border-[#00ff88] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">😍 Very Useful</div>
              <div className="text-3xl font-black text-[#00ff88]">{stats.byType.very_useful}</div>
            </div>
            <div className="bg-black border border-[#00cfff] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">👍 Useful</div>
              <div className="text-3xl font-black text-[#00cfff]">{stats.byType.useful}</div>
            </div>
            <div className="bg-black border border-[#ff0055] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">👎 Not Useful</div>
              <div className="text-3xl font-black text-[#ff0055]">{stats.byType.not_useful}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-black border border-gray-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-500 font-bold uppercase mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:border-[#00ff88]"
              >
                <option value="all">All</option>
                <option value="unanswered">Unanswered</option>
                <option value="answered">Answered</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm text-gray-500 font-bold uppercase mb-2">Feedback Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:border-[#00ff88]"
              >
                <option value="all">All Types</option>
                <option value="very_useful">😍 Very Useful</option>
                <option value="useful">👍 Useful</option>
                <option value="not_useful">👎 Not Useful</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm text-gray-500 font-bold uppercase mb-2">Campaign Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm text-gray-500 font-bold uppercase mb-2">Search Email</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email..."
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:border-[#00ff88] placeholder-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-black border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Responded
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredFeedback.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No feedback found with current filters
                    </td>
                  </tr>
                ) : (
                  filteredFeedback.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#0a0a0a] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm text-gray-300">
                          {item.subscriber_email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${getFeedbackColor(item.feedback_type)}`}>
                          {getFeedbackIcon(item.feedback_type)} {getFeedbackLabel(item.feedback_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {formatDate(item.campaign_date)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {item.responded_at ? formatDateTime(item.responded_at) : (
                          <span className="text-gray-600">Not responded</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.answered_at ? (
                          <div>
                            <span className="text-[#00ff88] font-bold">✓ Answered</span>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatDateTime(item.answered_at)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#ff0055] font-bold">⚠ Unanswered</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAnswered(item.id, !!item.answered_at)}
                            disabled={updatingId === item.id}
                            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${
                              updatingId === item.id
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : item.answered_at
                                ? 'bg-[#0a0a0a] border border-gray-700 text-gray-400 hover:border-[#ff0055] hover:text-[#ff0055]'
                                : 'bg-[#00ff88] text-black hover:bg-[#00dd77]'
                            }`}
                          >
                            {updatingId === item.id
                              ? 'Updating...'
                              : item.answered_at
                              ? 'Mark Unanswered'
                              : 'Mark Answered'}
                          </button>
                          <a
                            href={`mailto:${item.subscriber_email}?subject=Re:%20Newsletter%20Feedback`}
                            className="px-3 py-1 text-xs font-bold uppercase bg-[#0a0a0a] border border-gray-700 text-gray-400 hover:border-[#00cfff] hover:text-[#00cfff] transition-all"
                          >
                            Email
                          </a>
                        </div>
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
          Showing {filteredFeedback.length} of {feedback.length} feedback responses
        </div>
      </div>
    </div>
  );
}
