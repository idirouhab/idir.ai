'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EventForm from '@/components/admin/EventForm';

export default function NewEventPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/live-event');
        if (!response.ok) {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-6 lg:px-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Create New Event</h1>
            <p className="text-gray-300">Fill in the event details</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border-2 border-[#ff0055] text-[#ff0055] font-bold text-sm uppercase hover:bg-[#ff0055] hover:text-white transition-all"
          >
            Logout
          </button>
        </div>

        {/* Event Form */}
        <EventForm mode="create" />
      </div>
    </div>
  );
}
