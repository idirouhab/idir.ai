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
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);

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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-lg font-black text-white">ADMIN</h1>
            <Link
              href="/"
              className="px-3 py-1 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-white hover:text-white transition-all"
            >
              View Site
            </Link>
          </div>
          <nav className="flex gap-3 overflow-x-auto pb-1">
            <Link href="/admin" className="text-xs text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/admin/blog" className="text-xs text-white font-bold uppercase hover:text-[#00ff88] transition-colors whitespace-nowrap">
              Blog
            </Link>
            <Link href="/admin/subscribers" className="text-xs text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors whitespace-nowrap">
              Subscribers
            </Link>
            <Link href="/admin/users" className="text-xs text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors whitespace-nowrap">
              Users
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Blog Posts</h2>
            <p className="text-gray-400 text-xs">Manage your blog content</p>
          </div>
          <Link
            href="/admin/blog/new"
            className="px-4 py-2 text-xs bg-[#00ff88] text-black font-bold uppercase hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            + New Post
          </Link>
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          <div className="bg-black border border-gray-800">
            {posts.map((post, index) => {
              const categoryColor = categoryColors[post.category];
              return (
                <div
                  key={post.id}
                  className={`p-3 hover:bg-[#0a0a0a] transition-colors ${index !== posts.length - 1 ? 'border-b border-gray-800' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Title and metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          href={`/${post.language}/blog/${post.slug}`}
                          target="_blank"
                          className="text-white font-bold text-sm hover:text-[#00ff88] transition-colors"
                        >
                          {post.title}
                        </Link>
                        {post.status === 'published' ? (
                          <span className="px-1.5 py-0.5 text-xs font-bold uppercase bg-[#00ff88] text-black">PUB</span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-xs font-bold uppercase bg-gray-800 text-gray-400">DRAFT</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span
                          className="px-1.5 py-0.5 font-bold uppercase"
                          style={{
                            background: `${categoryColor}20`,
                            color: categoryColor,
                            border: `1px solid ${categoryColor}`,
                          }}
                        >
                          {post.category}
                        </span>
                        <span className="uppercase">{post.language}</span>
                        <span>•</span>
                        <span>{post.view_count} views</span>
                        {post.published_at && (
                          <>
                            <span>•</span>
                            <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Actions Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === post.id ? null : post.id)}
                          disabled={deletingId === post.id}
                          className="px-3 py-1 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-gray-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {deletingId === post.id ? '...' : (
                            <>
                              Actions
                              <span className="text-[10px]">▼</span>
                            </>
                          )}
                        </button>

                        {actionMenuOpen === post.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActionMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-black border border-gray-700 z-20 min-w-[120px]">
                              <Link
                                href={`/admin/blog/${post.id}/edit`}
                                className="block w-full px-3 py-2 text-xs text-left text-gray-300 font-bold uppercase hover:bg-[#0a0a0a] hover:text-[#00cfff] transition-all"
                                onClick={() => setActionMenuOpen(null)}
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  setActionMenuOpen(null);
                                  handleDelete(post.id, post.title);
                                }}
                                className="w-full px-3 py-2 text-xs text-left text-gray-400 font-bold uppercase hover:bg-[#0a0a0a] hover:text-[#ff0055] transition-all border-t border-gray-800"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Share Dropdown (only for published posts) */}
                      {post.status === 'published' && (
                        <div className="relative">
                          <button
                            onClick={() => setShareMenuOpen(shareMenuOpen === post.id ? null : post.id)}
                            disabled={sharingId?.startsWith(post.id)}
                            className="px-3 py-1 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-gray-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {sharingId?.startsWith(post.id) ? '...' : (
                              <>
                                Share
                                <span className="text-[10px]">▼</span>
                              </>
                            )}
                          </button>

                          {shareMenuOpen === post.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShareMenuOpen(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 bg-black border border-gray-700 z-20 min-w-[120px]">
                                <button
                                  onClick={() => {
                                    setShareMenuOpen(null);
                                    handleShare(post, 'linkedin');
                                  }}
                                  className="w-full px-3 py-2 text-xs text-left text-gray-300 font-bold uppercase hover:bg-[#0a0a0a] hover:text-[#0077b5] transition-all"
                                >
                                  LinkedIn
                                </button>
                                <button
                                  onClick={() => {
                                    setShareMenuOpen(null);
                                    handleShare(post, 'twitter');
                                  }}
                                  className="w-full px-3 py-2 text-xs text-left text-gray-300 font-bold uppercase hover:bg-[#0a0a0a] hover:text-[#1da1f2] transition-all border-t border-gray-800"
                                >
                                  Twitter
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
