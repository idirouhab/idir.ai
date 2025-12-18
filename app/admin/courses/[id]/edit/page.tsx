'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Course } from '@/lib/courses';
import CourseForm from '@/components/admin/CourseForm';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState('');
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  // Resolve params first
  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    const checkAuthAndFetch = async () => {
      try {
        // Check auth
        const authResponse = await fetch('/api/auth/me');
        if (!authResponse.ok) {
          router.push('/admin/login');
          return;
        }

        // Fetch course
        const courseResponse = await fetch(`/api/admin/courses/${resolvedParams.id}`);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course');
        }

        const courseData = await courseResponse.json();
        setCourse(courseData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load course');
        setLoading(false);
      }
    };

    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error || 'Course not found'}</p>
          <Link
            href="/admin/courses"
            className="text-[#00ff88] hover:underline"
          >
            Back to Courses
          </Link>
        </div>
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

          <h1 className="text-4xl font-black text-white mb-2">Edit Course</h1>
          <p className="text-gray-300">{course.title}</p>
        </div>

        {/* Form */}
        <div className="bg-black border-2 border-gray-800 p-8">
          <CourseForm course={course} />
        </div>
      </div>
    </div>
  );
}
