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
    checkAuth();
  }, []);

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
    <div className="min-h-screen py-12 px-6 lg:px-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-white mb-4">Live Events Admin</h1>
            <p className="text-gray-400">Manage your live event announcements</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-6 py-3 border-2 border-white text-white font-bold uppercase hover:bg-white hover:text-black transition-all"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 border-2 border-[#ff0055] text-[#ff0055] font-bold uppercase hover:bg-[#ff0055] hover:text-white transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 border-2 ${
              message.type === 'success'
                ? 'border-[#00ff88] bg-[#00ff8820] text-[#00ff88]'
                : 'border-[#ff0055] bg-[#ff005520] text-[#ff0055]'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Create New Event Button */}
        <div className="mb-8">
          <Link
            href="/admin/events/new"
            className="inline-block px-8 py-4 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform"
          >
            + Create New Event
          </Link>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="border-2 border-[#00cfff] bg-black p-12 text-center">
            <p className="text-2xl text-gray-400 mb-4">No events found</p>
            <p className="text-gray-500 mb-6">Create your first live event to get started</p>
            <Link
              href="/admin/events/new"
              className="inline-block px-8 py-4 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform"
            >
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="border-2 bg-black p-6"
                style={{
                  borderColor: event.isActive ? '#00ff88' : '#666',
                }}
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    {/* Active Badge */}
                    {event.isActive && (
                      <div className="inline-block px-3 py-1 mb-3 text-sm font-bold uppercase bg-[#00ff88] text-black">
                        ● Active (Showing on site)
                      </div>
                    )}

                    {/* Event Title */}
                    <h2 className="text-2xl font-black text-white mb-3">
                      {event.title}
                    </h2>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#00cfff]">
                        <span>📅</span>
                        <span className="font-bold">
                          {formatEventDateTime(event.eventDatetime, event.timezone)}
                        </span>
                        <span className="text-gray-500">({event.timezone})</span>
                      </div>

                      <div className="flex items-center gap-2 text-[#ff0055]">
                        <span>🌍</span>
                        <span className="font-bold">{event.eventLanguage}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[#00ff88]">
                        <span>📺</span>
                        <span className="font-bold">{event.platform}</span>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-3 text-xs text-gray-500">
                      Last updated: {new Date(event.updatedAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="px-6 py-2 border-2 border-[#00cfff] text-[#00cfff] font-bold uppercase hover:bg-[#00cfff] hover:text-black transition-all text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="px-6 py-2 border-2 border-[#ff0055] text-[#ff0055] font-bold uppercase hover:bg-[#ff0055] hover:text-white transition-all"
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
