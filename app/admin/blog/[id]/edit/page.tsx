'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { BlogPost } from '@/lib/blog-shared';
import BlogPostForm from '@/components/admin/BlogPostForm';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const { id } = await params;

        const authResponse = await fetch('/api/auth/me');
        if (!authResponse.ok) {
          router.push('/admin/login');
          return;
        }

        const authData = await authResponse.json();
        const currentUser = authData.user;
        const roles = currentUser.roles || [];
        const isAdmin = roles.includes('super_admin') || roles.includes('billing_admin');

        const response = await fetch(`/api/posts/${id}?draft=true`);

        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }

        if (!response.ok) {
          router.push('/admin/blog');
          return;
        }

        const { data } = await response.json();
        const canEdit = isAdmin || data.author_id === currentUser.id;

        if (!canEdit) {
          alert('You do not have permission to edit this post.');
          router.push('/admin/blog');
          return;
        }

        setPost(data);
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (loading) {
    return (
      <AdminPageWrapper title="Edit Post" description="Update content and publication settings">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">Loading...</div>
      </AdminPageWrapper>
    );
  }

  if (!post) {
    return (
      <AdminPageWrapper title="Edit Post" description="Update content and publication settings">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">Post not found</div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Edit Post"
      description={post.title}
      actions={
        <Link href="/admin/blog" className="btn-secondary">
          Back to Blog
        </Link>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <BlogPostForm post={post} />
      </div>
    </AdminPageWrapper>
  );
}
