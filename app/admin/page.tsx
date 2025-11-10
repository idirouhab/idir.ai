'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/live-event');
        if (response.ok) {
          fetchEvents();
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

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/live-event');
      const data = await response.json();
      setEvents(data.events || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setMessage({ type: 'error', text: 'Failed to load events' });
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
        setMessage({ type: 'success', text: 'Event deleted successfully' });
        fetchEvents(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: 'Failed to delete event' });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setMessage({ type: 'error', text: 'Failed to delete event' });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatEventDateTime = (datetime: string, timezone: string) => {
    try {
      const date = new Date(datetime);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: timezone,
      }).format(date);
    } catch {
      return datetime;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-white text-xl">Loading...</div>
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
              <Link href="/admin" className="text-sm text-white font-bold uppercase hover:text-[#00ff88] transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/blog" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Blog
              </Link>
              <Link href="/admin/subscribers" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Subscribers
              </Link>
              <Link href="/admin/feedback" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
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
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs border border-gray-700 text-gray-400 font-bold uppercase hover:border-[#ff0055] hover:text-[#ff0055] transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Dashboard</h2>
          <p className="text-gray-400 text-sm">Manage your site content and settings</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/blog"
            className="group p-6 bg-black border border-gray-800 hover:border-[#00ff88] transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-[#00ff8820] border border-[#00ff88] flex items-center justify-center text-xl">
                📝
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#00ff88] transition-colors">
                Blog
              </h3>
            </div>
            <p className="text-sm text-gray-400">Create and manage blog posts</p>
          </Link>

          <Link
            href="/admin/events/new"
            className="group p-6 bg-black border border-gray-800 hover:border-[#ff0055] transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-[#ff005520] border border-[#ff0055] flex items-center justify-center text-xl">
                🎥
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#ff0055] transition-colors">
                Live Events
              </h3>
            </div>
            <p className="text-sm text-gray-400">Manage live event announcements</p>
          </Link>

          <Link
            href="/admin/subscribers"
            className="group p-6 bg-black border border-gray-800 hover:border-[#ffaa00] transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-[#ffaa0020] border border-[#ffaa00] flex items-center justify-center text-xl">
                📬
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#ffaa00] transition-colors">
                Subscribers
              </h3>
            </div>
            <p className="text-sm text-gray-400">View and manage newsletter subscribers</p>
          </Link>

          <Link
            href="/admin/feedback"
            className="group p-6 bg-black border border-gray-800 hover:border-[#cc00ff] transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-[#cc00ff20] border border-[#cc00ff] flex items-center justify-center text-xl">
                💬
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#cc00ff] transition-colors">
                Feedback
              </h3>
            </div>
            <p className="text-sm text-gray-400">Track newsletter response rates</p>
          </Link>

          <Link
            href="/admin/users"
            className="group p-6 bg-black border border-gray-800 hover:border-[#00cfff] transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-[#00cfff20] border border-[#00cfff] flex items-center justify-center text-xl">
                👥
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#00cfff] transition-colors">
                Users
              </h3>
            </div>
            <p className="text-sm text-gray-400">Manage blogger accounts</p>
          </Link>
        </div>

        {/* Section Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-white mb-1">Live Events</h3>
            <p className="text-sm text-gray-500">Manage event announcements shown on the homepage</p>
          </div>
          <Link
            href="/admin/events/new"
            className="px-4 py-2 text-xs bg-[#00ff88] text-black font-bold uppercase hover:opacity-90 transition-opacity"
          >
            + New Event
          </Link>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 text-sm border ${
              message.type === 'success'
                ? 'border-[#00ff88] bg-[#00ff8810] text-[#00ff88]'
                : 'border-[#ff0055] bg-[#ff005510] text-[#ff0055]'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="border border-gray-800 bg-black p-12 text-center">
            <div className="text-4xl mb-4 opacity-50">🎥</div>
            <p className="text-lg text-gray-300 mb-2">No events yet</p>
            <p className="text-sm text-gray-500 mb-6">Create your first live event to get started</p>
            <Link
              href="/admin/events/new"
              className="inline-block px-6 py-2 text-sm bg-[#00ff88] text-black font-bold uppercase hover:opacity-90 transition-opacity"
            >
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="border bg-black p-5 hover:border-gray-700 transition-colors"
                style={{
                  borderColor: event.isActive ? '#00ff88' : '#333',
                }}
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      {event.isActive ? (
                        <span className="px-2 py-1 text-xs font-bold uppercase bg-[#00ff88] text-black">
                          ● Live
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold uppercase bg-gray-800 text-gray-400">
                          ○ Inactive
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <h3 className="text-lg font-black text-white mb-3">
                      {event.title}
                    </h3>

                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📅</span>
                        <div>
                          <div className="text-gray-300 font-medium">
                            {formatEventDateTime(event.eventDatetime, event.timezone)}
                          </div>
                          <div className="text-xs text-gray-600">{event.timezone}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🌍</span>
                        <span className="text-gray-300">{event.eventLanguage}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📺</span>
                        <span className="text-gray-300">{event.platform}</span>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-3 text-xs text-gray-600">
                      Updated {new Date(event.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="px-4 py-2 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-[#00cfff] hover:text-[#00cfff] transition-all"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="px-4 py-2 text-xs border border-gray-700 text-gray-400 font-bold uppercase hover:border-[#ff0055] hover:text-[#ff0055] transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
