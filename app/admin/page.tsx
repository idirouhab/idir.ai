'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type LiveEventData = {
  isActive: boolean;
  en: {
    title: string;
    date: string;
    time: string;
    platform: string;
    platformUrl: string;
  };
  es: {
    title: string;
    date: string;
    time: string;
    platform: string;
    platformUrl: string;
  };
};

export default function AdminPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [eventData, setEventData] = useState<LiveEventData>({
    isActive: false,
    en: {
      title: '',
      date: '',
      time: '',
      platform: '',
      platformUrl: '',
    },
    es: {
      title: '',
      date: '',
      time: '',
      platform: '',
      platformUrl: '',
    },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Check if session cookie exists by trying to fetch data
    try {
      const response = await fetch('/api/live-event');
      if (response.ok) {
        fetchEventData();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchEventData = async () => {
    try {
      const response = await fetch('/api/live-event');
      const data = await response.json();
      setEventData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setMessage({ type: 'error', text: 'Failed to load event data' });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/live-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Event data saved successfully!' });
        // Trigger page revalidation
        router.refresh();
      } else {
        setMessage({ type: 'error', text: 'Failed to save event data' });
      }
    } catch (error) {
      console.error('Error saving event data:', error);
      setMessage({ type: 'error', text: 'Failed to save event data' });
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 lg:px-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-white mb-4">Live Event Admin Panel</h1>
            <p className="text-gray-400">Manage your upcoming live event announcement</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 border-2 border-[#ff0055] text-[#ff0055] font-bold uppercase hover:bg-[#ff0055] hover:text-white transition-all"
          >
            Logout
          </button>
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

        {/* Active Toggle */}
        <div className="mb-8 p-6 border-2 border-[#00cfff] bg-black">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={eventData.isActive}
              onChange={(e) =>
                setEventData({ ...eventData, isActive: e.target.checked })
              }
              className="w-6 h-6"
            />
            <div>
              <div className="text-xl font-bold text-white">
                Event Active
              </div>
              <div className="text-sm text-gray-400">
                Toggle to show/hide the live event banner on your website
              </div>
            </div>
          </label>
        </div>

        {/* English Version */}
        <div className="mb-8 p-6 border-2 border-[#00ff88] bg-black">
          <h2 className="text-2xl font-black text-[#00ff88] mb-6">
            English Version
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-bold mb-2">Event Title</label>
              <input
                type="text"
                value={eventData.en.title}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    en: { ...eventData.en, title: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00ff88] focus:outline-none"
                placeholder="AI & Automation Deep Dive - Live Session"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-bold mb-2">Date</label>
                <input
                  type="text"
                  value={eventData.en.date}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      en: { ...eventData.en, date: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00ff88] focus:outline-none"
                  placeholder="December 15, 2024"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Time</label>
                <input
                  type="text"
                  value={eventData.en.time}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      en: { ...eventData.en, time: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00ff88] focus:outline-none"
                  placeholder="6:00 PM CET"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Platform</label>
              <input
                type="text"
                value={eventData.en.platform}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    en: { ...eventData.en, platform: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00ff88] focus:outline-none"
                placeholder="YouTube Live"
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Platform URL</label>
              <input
                type="url"
                value={eventData.en.platformUrl}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    en: { ...eventData.en, platformUrl: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00ff88] focus:outline-none"
                placeholder="https://www.youtube.com/@Prompt_and_Play"
              />
            </div>
          </div>
        </div>

        {/* Spanish Version */}
        <div className="mb-8 p-6 border-2 border-[#ff0055] bg-black">
          <h2 className="text-2xl font-black text-[#ff0055] mb-6">
            Spanish Version
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-bold mb-2">Event Title</label>
              <input
                type="text"
                value={eventData.es.title}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    es: { ...eventData.es, title: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#ff0055] focus:outline-none"
                placeholder="IA y Automatización en Profundidad - Sesión en Vivo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-bold mb-2">Fecha</label>
                <input
                  type="text"
                  value={eventData.es.date}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      es: { ...eventData.es, date: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#ff0055] focus:outline-none"
                  placeholder="15 de Diciembre, 2024"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Hora</label>
                <input
                  type="text"
                  value={eventData.es.time}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      es: { ...eventData.es, time: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#ff0055] focus:outline-none"
                  placeholder="18:00 CET"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Plataforma</label>
              <input
                type="text"
                value={eventData.es.platform}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    es: { ...eventData.es, platform: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#ff0055] focus:outline-none"
                placeholder="YouTube Live"
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2">URL de la Plataforma</label>
              <input
                type="url"
                value={eventData.es.platformUrl}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    es: { ...eventData.es, platformUrl: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#ff0055] focus:outline-none"
                placeholder="https://www.youtube.com/@Prompt_and_Play"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-8 py-4 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 border-2 border-white text-white font-bold uppercase hover:bg-white hover:text-black transition-all"
          >
            Back to Site
          </button>
        </div>
      </div>
    </div>
  );
}
