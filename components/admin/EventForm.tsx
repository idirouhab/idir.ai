'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type LiveEventData = {
  isActive: boolean;
  title: string;
  eventLanguage: string;
  eventDatetime: string;
  timezone: string;
  platform: string;
  platformUrl: string;
};

type EventFormProps = {
  initialData?: LiveEventData & { id?: number };
  eventId?: number;
  mode: 'create' | 'edit';
};

// Common timezones for easy selection
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'New York (ET)' },
  { value: 'America/Chicago', label: 'Chicago (CT)' },
  { value: 'America/Denver', label: 'Denver (MT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Santiago', label: 'Santiago (CLT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'UTC', label: 'UTC' },
];

// Language options
const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'English & Spanish', label: 'English & Spanish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Other', label: 'Other' },
];

export default function EventForm({ initialData, eventId, mode }: EventFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Split datetime into date and time for easier editing
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const [eventData, setEventData] = useState<Omit<LiveEventData, 'eventDatetime'>>({
    isActive: false,
    title: '',
    eventLanguage: 'English & Spanish',
    timezone: 'Europe/Madrid',
    platform: 'YouTube Live',
    platformUrl: '',
  });

  useEffect(() => {
    if (initialData) {
      setEventData({
        isActive: initialData.isActive,
        title: initialData.title,
        eventLanguage: initialData.eventLanguage,
        timezone: initialData.timezone,
        platform: initialData.platform,
        platformUrl: initialData.platformUrl,
      });

      // Parse datetime into date and time
      if (initialData.eventDatetime) {
        const dt = new Date(initialData.eventDatetime);
        const dateStr = dt.toISOString().split('T')[0];
        const timeStr = dt.toTimeString().slice(0, 5);
        setEventDate(dateStr);
        setEventTime(timeStr);
      }
    }
  }, [initialData]);

  const handleSave = async () => {
    // Validate required fields
    if (!eventData.title || !eventData.eventLanguage || !eventDate || !eventTime ||
        !eventData.timezone || !eventData.platform || !eventData.platformUrl) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    // Combine date and time
    const eventDatetime = `${eventDate}T${eventTime}`;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/live-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...eventData, eventDatetime, id: eventId }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: mode === 'create' ? 'Event created successfully!' : 'Event updated successfully!'
        });

        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1500);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save event data' });
      }
    } catch (error) {
      console.error('Error saving event data:', error);
      setMessage({ type: 'error', text: 'Failed to save event data' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
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

      <div className="space-y-6">
        {/* Active Toggle */}
        <div className="p-6 border-2 border-[#00cfff] bg-black">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={eventData.isActive}
              onChange={(e) =>
                setEventData({ ...eventData, isActive: e.target.checked })
              }
              className="w-5 h-5"
            />
            <div className="text-white font-bold">
              Make this event active (only one event can be active at a time)
            </div>
          </label>
        </div>

        {/* Event Form */}
        <div className="p-6 border-2 border-white bg-black space-y-4">
          {/* Title */}
          <div>
            <label className="block text-white font-bold mb-2">Event Title *</label>
            <input
              type="text"
              value={eventData.title}
              onChange={(e) =>
                setEventData({ ...eventData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-600 focus:border-white focus:outline-none"
              placeholder="AI & Automation Deep Dive - Live Session"
              required
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-white font-bold mb-2">Event Language *</label>
            <select
              value={eventData.eventLanguage}
              onChange={(e) =>
                setEventData({ ...eventData, eventLanguage: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-600 focus:border-white focus:outline-none"
              required
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-bold mb-2">Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-600 focus:border-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white font-bold mb-2">Time *</label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-600 focus:border-white focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-white font-bold mb-2">Timezone *</label>
            <select
              value={eventData.timezone}
              onChange={(e) =>
                setEventData({ ...eventData, timezone: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-600 focus:border-white focus:outline-none"
              required
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-white font-bold mb-2">Platform *</label>
            <input
              type="text"
              value={eventData.platform}
              onChange={(e) =>
                setEventData({ ...eventData, platform: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-600 focus:border-white focus:outline-none"
              placeholder="YouTube Live"
              required
            />
          </div>

          {/* Platform URL */}
          <div>
            <label className="block text-white font-bold mb-2">Platform URL *</label>
            <input
              type="url"
              value={eventData.platformUrl}
              onChange={(e) =>
                setEventData({ ...eventData, platformUrl: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-600 focus:border-white focus:outline-none"
              placeholder="https://www.youtube.com/@YourChannel"
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-8 py-4 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:bg-[#00dd77] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Save Changes'}
          </button>

          <button
            onClick={() => router.push('/admin')}
            className="px-8 py-4 border-2 border-white text-white font-bold uppercase hover:bg-white hover:text-black transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
