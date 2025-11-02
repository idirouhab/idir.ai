'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EventForm from '@/components/admin/EventForm';

type LiveEventData = {
  id: number;
  isActive: boolean;
  title: string;
  eventLanguage: string;
  eventDatetime: string;
  timezone: string;
  platform: string;
  platformUrl: string;
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<LiveEventData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchEvent();
  }, []);

  const checkAuthAndFetchEvent = async () => {
    try {
      // Check authentication first
      const authResponse = await fetch('/api/live-event');
      if (!authResponse.ok) {
        router.push('/admin/login');
        return;
      }

      // Fetch the specific event
      const eventResponse = await fetch(`/api/live-event/${params.id}`);
      if (eventResponse.ok) {
        const data = await eventResponse.json();
        setEventData(data);
      } else {
        setError('Event not found');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event');
      setLoading(false);
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
        <div className="text-white text-xl">Loading event...</div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">{error || 'Event not found'}</div>
          <button
            onClick={() => router.push('/admin')}
            className="px-8 py-4 border-2 border-white text-white font-bold uppercase hover:bg-white hover:text-black transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6 lg:px-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Edit Event</h1>
            <p className="text-gray-400">Update the event details</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border-2 border-[#ff0055] text-[#ff0055] font-bold text-sm uppercase hover:bg-[#ff0055] hover:text-white transition-all"
          >
            Logout
          </button>
        </div>

        {/* Event Form */}
        <EventForm
          mode="edit"
          initialData={eventData}
          eventId={eventData.id}
        />
      </div>
    </div>
  );
}
