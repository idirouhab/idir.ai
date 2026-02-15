'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BlogPostForm from '@/components/admin/BlogPostForm';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

export default function NewBlogPostPage() {
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
      } catch {
        router.push('/admin/login');
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <AdminPageWrapper title="Create New Post" description="Write and publish a new blog post">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">Loading...</div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Create New Post"
      description="Write and publish a new blog post"
      actions={
        <Link href="/admin/blog" className="btn-secondary">
          Back to Blog
        </Link>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <BlogPostForm />
      </div>
    </AdminPageWrapper>
  );
}
