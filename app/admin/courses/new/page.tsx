'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CourseForm from '@/components/admin/CourseForm';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/admin/login');
          return;
        }
        setLoading(false);
      } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-[#00ff88] transition-colors mb-6 font-bold uppercase tracking-wide"
          >
            ← Back to Courses
          </Link>

          <h1 className="text-4xl font-black text-white mb-2">Create New Course</h1>
          <p className="text-gray-300">Design and publish a new course</p>
        </div>

        {/* Form */}
        <div className="bg-black border-2 border-gray-800 p-8">
          <CourseForm />
        </div>
      </div>
    </div>
  );
}
