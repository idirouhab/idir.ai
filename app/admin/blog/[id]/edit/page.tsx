'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import BlogPostForm from '@/components/admin/BlogPostForm';

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const { id } = await params;

        // Check authentication and get user info
        const authResponse = await fetch('/api/auth/me');
        if (!authResponse.ok) {
          router.push('/admin/login');
          return;
        }

        const authData = await authResponse.json();
        const currentUser = authData.user;

        // Fetch specific post (including drafts with auth)
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

        // Check if user has permission to edit this post
        const canEdit =
          currentUser.role === 'owner' ||
          currentUser.role === 'admin' ||
          (currentUser.role === 'blogger' && data.author_id === currentUser.id);

        if (!canEdit) {
          alert('You do not have permission to edit this post.');
          router.push('/admin/blog');
          return;
        }

        setPost(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        router.push('/admin/login');
      }
    };

    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-white text-xl">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-[#00ff88] transition-colors mb-6 font-bold uppercase tracking-wide"
          >
            ← Back to Blog Management
          </Link>

          <h1 className="text-4xl font-black text-white mb-2">Edit Post</h1>
          <p className="text-gray-300">{post.title}</p>
        </div>

        {/* Form */}
        <div className="bg-black border-2 border-gray-800 p-8">
          <BlogPostForm post={post} />
        </div>
      </div>
    </div>
  );
}
