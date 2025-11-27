'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';

type LiveEvent = {
  id: number;
  isActive: boolean;
  title: string;
  eventLanguage: string;
  eventDatetime: string;
  timezone: string;
  platform: string;
  platformUrl: string;
  createdAt: string;
  updatedAt: string;
};

type BlogPost = {
  id: number;
  title: string;
  status: 'draft' | 'published';
  updated_at: string;
  language: string;
};

type Stats = {
  totalPosts: number;
  totalSubscribers: number;
  feedbackCount: number;
  upcomingEvents: number;
  postsThisMonth: number;
  subscribersThisMonth: number;
};

type StatCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  trend?: string;
  color: string;
};

function StatCard({ title, value, subtitle, icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 border border-${color}-500/30 flex items-center justify-center text-xl`}>
          {icon}
        </div>
        {trend && (
          <div className="text-xs text-emerald-400 font-medium">
            {trend}
          </div>
        )}
      </div>
      <div className="mb-1">
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm font-medium text-gray-400">{title}</div>
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
      )}
    </div>
  );
}

type QuickActionProps = {
  href: string;
  label: string;
  icon: string;
  description: string;
};

function QuickAction({ href, label, icon, description }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 bg-[#111] border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900/50 transition-all group"
    >
      <div className="w-8 h-8 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
          {label}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
      <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
        →
      </div>
    </Link>
  );
}

export default function DashboardNew() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalSubscribers: 0,
    feedbackCount: 0,
    upcomingEvents: 0,
    postsThisMonth: 0,
    subscribersThisMonth: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled' | 'inactive'>('all');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          fetchData();
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      // Fetch events
      const eventsResponse = await fetch('/api/live-event');
      const eventsData = await eventsResponse.json();
      setEvents(eventsData.events || []);

      // Fetch recent posts
      const postsResponse = await fetch('/api/posts?limit=5');
      const postsData = await postsResponse.json();
      const posts = postsData.data || [];
      setRecentPosts(posts.slice(0, 3));

      // Fetch subscribers count
      const subscribersResponse = await fetch('/api/newsletter/admin');
      const subscribersData = await subscribersResponse.json();

      // Fetch feedback count
      const feedbackResponse = await fetch('/api/admin/feedback');
      const feedbackData = await feedbackResponse.json();

      // Calculate stats
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const postsThisMonth = posts.filter((p: BlogPost) =>
        new Date(p.updated_at) >= thisMonthStart
      ).length;

      const upcomingEvents = eventsData.events?.filter((e: LiveEvent) =>
        e.isActive || new Date(e.eventDatetime) > now
      ).length || 0;

      setStats({
        totalPosts: posts.length || 0,
        totalSubscribers: subscribersData.statistics?.total || 0,
        feedbackCount: feedbackData.length || 0,
        upcomingEvents,
        postsThisMonth,
        subscribersThisMonth: subscribersData.statistics?.subscribed || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/live-event/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatEventDateTime = (datetime: string, timezone: string) => {
    try {
      const date = new Date(datetime);
      const formatted = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
      }).format(date);
      return formatted;
    } catch {
      return datetime;
    }
  };

  const getEventStatus = (event: LiveEvent) => {
    if (event.isActive) return 'active';
    const eventDate = new Date(event.eventDatetime);
    const now = new Date();
    if (eventDate > now) return 'scheduled';
    return 'inactive';
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || getEventStatus(event) === statusFilter;
      return matchesSearch && matchesStatus;
    });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <AdminSidebar currentPath="/admin" />
        <div className="flex-1 ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-white text-xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <AdminSidebar currentPath="/admin" />

      <div className="flex-1 ml-64">
        {/* Page Header */}
        <div className="border-b border-gray-800 bg-black/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-sm text-gray-400">Overview of your content, audience and events</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Blog Posts"
              value={stats.totalPosts}
              icon="📝"
              trend={stats.postsThisMonth > 0 ? `+${stats.postsThisMonth} this month` : undefined}
              subtitle={`${stats.postsThisMonth} published this month`}
              color="emerald"
            />
            <StatCard
              title="Subscribers"
              value={stats.totalSubscribers}
              icon="📬"
              trend={stats.subscribersThisMonth > 0 ? `${stats.subscribersThisMonth} subscribed` : undefined}
              subtitle="Total newsletter subscribers"
              color="cyan"
            />
            <StatCard
              title="Feedback"
              value={stats.feedbackCount}
              icon="💬"
              subtitle="Total feedback responses"
              color="purple"
            />
            <StatCard
              title="Live Events"
              value={stats.upcomingEvents}
              icon="🎥"
              subtitle={stats.upcomingEvents === 0 ? 'No upcoming events' : 'Active or scheduled'}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-[#111] border border-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <QuickAction
                    href="/admin/blog/new"
                    label="New Blog Post"
                    icon="📝"
                    description="Write and publish content"
                  />
                  <QuickAction
                    href="/admin/events/new"
                    label="Create Live Event"
                    icon="🎥"
                    description="Schedule a new event"
                  />
                  <QuickAction
                    href="/admin/subscribers"
                    label="View Subscribers"
                    icon="📬"
                    description="Manage your audience"
                  />
                  <QuickAction
                    href="/admin/feedback"
                    label="View Feedback"
                    icon="💬"
                    description="See feedback responses"
                  />
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-[#111] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Recent Posts</h2>
                <Link href="/admin/blog" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                  View all →
                </Link>
              </div>
              {recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2 opacity-50">📝</div>
                  <p className="text-sm text-gray-500">No posts yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/admin/blog/${post.id}/edit`}
                      className="block p-3 bg-black border border-gray-800 rounded hover:border-gray-700 transition-all group"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <div className={`px-2 py-0.5 text-xs font-medium rounded ${
                          post.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gray-700/50 text-gray-400 border border-gray-700'
                        }`}>
                          {post.status}
                        </div>
                        <div className="px-2 py-0.5 text-xs font-medium rounded bg-gray-700/50 text-gray-400 border border-gray-700">
                          {post.language}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {post.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(post.updated_at).toLocaleDateString()}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Events Section */}
          <div className="bg-[#111] border border-gray-800 rounded-lg">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Live Events</h2>
                  <p className="text-sm text-gray-500">Manage event announcements shown on the homepage</p>
                </div>
                <Link
                  href="/admin/events/new"
                  className="px-4 py-2 bg-emerald-500 text-black text-sm font-semibold rounded hover:bg-emerald-400 transition-colors"
                >
                  + New Event
                </Link>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 bg-black border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-gray-600"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Events Table */}
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4 opacity-50">🎥</div>
                <p className="text-lg text-gray-300 mb-2">
                  {searchQuery || statusFilter !== 'all' ? 'No events found' : 'No events yet'}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first live event to get started'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Link
                    href="/admin/events/new"
                    className="inline-block px-6 py-2 bg-emerald-500 text-black text-sm font-semibold rounded hover:bg-emerald-400 transition-colors"
                  >
                    Create First Event
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredEvents.map((event) => {
                      const status = getEventStatus(event);
                      return (
                        <tr key={event.id} className="hover:bg-gray-900/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
                                status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : status === 'scheduled'
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-gray-700/50 text-gray-400 border border-gray-700'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                status === 'active' ? 'bg-emerald-400' : status === 'scheduled' ? 'bg-cyan-400' : 'bg-gray-400'
                              }`} />
                              {status === 'active' ? 'Active' : status === 'scheduled' ? 'Scheduled' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-white max-w-md truncate">
                              {event.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {formatEventDateTime(event.eventDatetime, event.timezone)}
                            </div>
                            <div className="text-xs text-gray-500">{event.timezone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{event.eventLanguage}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{event.platform}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/events/${event.id}/edit`}
                                className="px-3 py-1.5 text-xs border border-gray-700 text-gray-300 font-medium rounded hover:border-gray-500 hover:text-white transition-all"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(event.id, event.title)}
                                className="px-3 py-1.5 text-xs border border-gray-700 text-gray-400 font-medium rounded hover:border-red-500 hover:text-red-400 transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
