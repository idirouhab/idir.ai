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
  const [sharingId, setSharingId] = useState<string | null>(null);

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

  const handleShare = async (post: BlogPost, platform: 'linkedin' | 'twitter') => {
    const shareId = `${post.id}-${platform}`;
    setSharingId(shareId);

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const postUrl = `${baseUrl}/${post.language}/blog/${post.slug}`;

      // Call n8n to generate optimized content
      const response = await fetch('/api/blog/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          title: post.title,
          excerpt: post.excerpt,
          postUrl,
          language: post.language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate share content');
      }

      const data = await response.json();
      const generatedContent = data.content;

      // Open native share dialog with generated content
      if (platform === 'linkedin') {
        // LinkedIn sharing with pre-filled text
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(generatedContent)}`;
        window.open(linkedInUrl, 'linkedin-share', 'width=600,height=600');
      } else if (platform === 'twitter') {
        // Twitter accepts pre-filled text
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedContent)}`;
        window.open(twitterUrl, 'twitter-share', 'width=600,height=600');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Failed to generate share content. Please try again.');
    } finally {
      setSharingId(null);
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
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header Bar */}
      <div className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-white">ADMIN</h1>
            <nav className="hidden md:flex gap-6">
              <Link href="/admin" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/blog" className="text-sm text-white font-bold uppercase hover:text-[#00ff88] transition-colors">
                Blog
              </Link>
              <Link href="/admin/subscribers" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Subscribers
              </Link>
              <Link href="/admin/users" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Users
              </Link>
            </nav>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-white hover:text-white transition-all"
            >
              View Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Blog Posts</h2>
            <p className="text-gray-400 text-sm">Create and manage your blog content</p>
          </div>
          <Link
            href="/admin/blog/new"
            className="px-4 py-2 text-xs bg-[#00ff88] text-black font-bold uppercase hover:opacity-90 transition-opacity"
          >
            + New Post
          </Link>
        </div>

        {/* Posts Table */}
        {posts.length > 0 ? (
          <div className="bg-black border border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-3 text-gray-500 font-bold uppercase text-xs">Title</th>
                  <th className="text-left p-3 text-gray-500 font-bold uppercase text-xs">Author</th>
                  <th className="text-left p-3 text-gray-500 font-bold uppercase text-xs">Category</th>
                  <th className="text-left p-3 text-gray-500 font-bold uppercase text-xs">Status</th>
                  <th className="text-left p-3 text-gray-500 font-bold uppercase text-xs">Lang</th>
                  <th className="text-left p-3 text-gray-500 font-bold uppercase text-xs">Published</th>
                  <th className="text-left p-3 text-gray-500 font-bold uppercase text-xs">Views</th>
                  <th className="text-right p-3 text-gray-500 font-bold uppercase text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const categoryColor = categoryColors[post.category];
                  return (
                    <tr key={post.id} className="border-b border-gray-800 hover:bg-[#0a0a0a] transition-colors">
                      <td className="p-3">
                        <Link
                          href={`/${post.language}/blog/${post.slug}`}
                          target="_blank"
                          className="text-white font-bold text-sm hover:text-[#00ff88] transition-colors"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-600 mt-1">/{post.slug}</p>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-400">
                          {post.author_name || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className="px-2 py-1 text-xs font-bold uppercase"
                          style={{
                            background: `${categoryColor}20`,
                            color: categoryColor,
                            border: `1px solid ${categoryColor}`,
                          }}
                        >
                          {post.category}
                        </span>
                      </td>
                      <td className="p-3">
                        {post.status === 'published' ? (
                          <span className="px-2 py-1 text-xs font-bold uppercase bg-[#00ff88] text-black">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-bold uppercase bg-gray-800 text-gray-400">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-gray-400 uppercase">{post.language}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-gray-400">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString()
                            : '-'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-gray-400">{post.view_count}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="px-3 py-1 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-[#00cfff] hover:text-[#00cfff] transition-all inline-block"
                          >
                            Edit
                          </Link>

                          {/* Share buttons (only for published posts) */}
                          {post.status === 'published' && (
                            <>
                              <button
                                onClick={() => handleShare(post, 'linkedin')}
                                disabled={sharingId === `${post.id}-linkedin`}
                                className="px-3 py-1 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-[#0077b5] hover:text-[#0077b5] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Share on LinkedIn"
                              >
                                {sharingId === `${post.id}-linkedin` ? 'Generating...' : 'LinkedIn'}
                              </button>
                              <button
                                onClick={() => handleShare(post, 'twitter')}
                                disabled={sharingId === `${post.id}-twitter`}
                                className="px-3 py-1 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-[#1da1f2] hover:text-[#1da1f2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Share on Twitter"
                              >
                                {sharingId === `${post.id}-twitter` ? 'Generating...' : 'Twitter'}
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            disabled={deletingId === post.id}
                            className="px-3 py-1 text-xs border border-gray-700 text-gray-400 font-bold uppercase hover:border-[#ff0055] hover:text-[#ff0055] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="text-center py-20 bg-black border border-gray-800">
            <div className="text-4xl mb-4 opacity-50">📝</div>
            <h2 className="text-lg font-black text-white mb-2">No Posts Yet</h2>
            <p className="text-sm text-gray-500 mb-6">Create your first blog post to get started</p>
            <Link
              href="/admin/blog/new"
              className="inline-block px-6 py-2 text-sm bg-[#00ff88] text-black font-bold uppercase hover:opacity-90 transition-opacity"
            >
              + Create First Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
