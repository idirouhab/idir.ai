'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlogPost, categoryColors } from '@/lib/blog';

export default function AdminBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        // Check auth by trying to fetch posts
        const response = await fetch('/api/blog-admin');
        if (!response.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        router.push('/admin/login');
      }
    };

    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeletingId(postId);

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Remove post from state
      setPosts(posts.filter(p => p.id !== postId));
      alert('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeletingId(null);
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
    <div className="min-h-screen p-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Blog Management</h1>
            <p className="text-gray-300">Create and manage your blog posts</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-6 py-3 bg-black border-2 border-gray-700 text-white font-bold uppercase hover:border-white transition-colors"
            >
              ← Back to Admin
            </Link>
            <Link
              href="/admin/blog/new"
              className="px-6 py-3 bg-[#00ff88] text-black font-bold uppercase hover:scale-105 transition-transform"
            >
              + New Post
            </Link>
          </div>
        </div>

        {/* Posts Table */}
        {posts.length > 0 ? (
          <div className="bg-black border-2 border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left p-4 text-gray-300 font-bold uppercase text-sm">Title</th>
                  <th className="text-left p-4 text-gray-300 font-bold uppercase text-sm">Category</th>
                  <th className="text-left p-4 text-gray-300 font-bold uppercase text-sm">Status</th>
                  <th className="text-left p-4 text-gray-300 font-bold uppercase text-sm">Language</th>
                  <th className="text-left p-4 text-gray-300 font-bold uppercase text-sm">Published</th>
                  <th className="text-left p-4 text-gray-300 font-bold uppercase text-sm">Views</th>
                  <th className="text-right p-4 text-gray-300 font-bold uppercase text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const categoryColor = categoryColors[post.category];
                  return (
                    <tr key={post.id} className="border-b border-gray-800 hover:bg-gray-900">
                      <td className="p-4">
                        <Link
                          href={`/${post.language}/blog/${post.slug}`}
                          target="_blank"
                          className="text-white font-bold hover:text-[#00ff88] transition-colors"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">/{post.slug}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-3 py-1 text-xs font-bold uppercase rounded"
                          style={{
                            background: `${categoryColor}20`,
                            color: categoryColor,
                          }}
                        >
                          {post.category}
                        </span>
                      </td>
                      <td className="p-4">
                        {post.status === 'published' ? (
                          <span className="px-3 py-1 text-xs font-bold uppercase bg-[#00ff88] text-black rounded">
                            Published
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-bold uppercase bg-gray-700 text-gray-300 rounded">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-300 uppercase">{post.language}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-300">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString()
                            : '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-300">{post.view_count}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="px-4 py-2 bg-[#00cfff] text-black font-bold text-sm uppercase hover:scale-105 transition-transform inline-block"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            disabled={deletingId === post.id}
                            className="px-4 py-2 bg-[#ff0055] text-white font-bold text-sm uppercase hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === post.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-black border-2 border-gray-800">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-2xl font-black text-white mb-4">No Posts Yet</h2>
            <p className="text-gray-300 mb-8">Create your first blog post to get started</p>
            <Link
              href="/admin/blog/new"
              className="inline-block px-8 py-3 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform"
            >
              + Create First Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
