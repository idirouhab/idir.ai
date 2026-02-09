'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, categoryColors } from '@/lib/blog';
import { MoreVertical, Share2, Pencil, Trash2, ImageIcon, ChevronDown, ChevronRight, Languages } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

type TranslationGroup = {
  translation_group_id: string;
  published_at: string;
  en?: BlogPost;
  es?: BlogPost;
};

type UserInfo = {
  id: string;
  email: string;
  role: 'super_admin' | 'billing_admin' | null;
};

export default function AdminBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<TranslationGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        // Check auth first and get user info
        const authResponse = await fetch('/api/auth/me');
        if (!authResponse.ok) {
          router.push('/admin/login');
          return;
        }

        const authData = await authResponse.json();
        const roles = authData.user.roles || [];
        const derivedRole = roles.includes('super_admin')
          ? 'super_admin'
          : roles.includes('billing_admin')
            ? 'billing_admin'
            : null;
        setCurrentUser({
          id: authData.user.id,
          email: authData.user.email,
          role: derivedRole,
        });

        // Fetch grouped posts for admin (includes both published and drafts)
        const response = await fetch('/api/blog/grouped-admin?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setGroups(data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        router.push('/admin/login');
      }
    };

    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Check if current user can edit/delete a post
  const canModifyPost = (post: BlogPost): boolean => {
    if (!currentUser) return false;
    // Owners and admins can modify any post
    if (currentUser.role === 'super_admin' || currentUser.role === 'billing_admin') return true;
    // Bloggers can only modify their own posts
    return post.author_id === currentUser.id;
  };

  // Check if user can modify any post in a translation group
  const canModifyGroup = (group: TranslationGroup): boolean => {
    if (!currentUser) return false;
    // Owners and admins can modify any group
    if (currentUser.role === 'super_admin' || currentUser.role === 'billing_admin') return true;
    // Bloggers can only see groups with posts they authored
    return (!!group.en && canModifyPost(group.en)) || (!!group.es && canModifyPost(group.es));

  };

  // Filter groups based on user permissions
  const getVisibleGroups = (): TranslationGroup[] => {
    return groups.filter(group => canModifyGroup(group));
  };

  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeletingId(postId);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Refresh the groups
      const groupsResponse = await fetch('/api/blog/grouped-admin?limit=100');
      const groupsData = await groupsResponse.json();
      setGroups(groupsData.data || []);

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

      if (platform === 'linkedin') {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(generatedContent)}`;
        window.open(linkedInUrl, 'linkedin-share', 'width=600,height=600');
      } else if (platform === 'twitter') {
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

  const renderPost = (post: BlogPost, isExpanded: boolean = false, totalViewCount?: number) => {
    const categoryColor = categoryColors[post.category];
    const displayViewCount = totalViewCount !== undefined ? totalViewCount : post.view_count;

    return (
      <div className={`p-4 transition-colors ${isExpanded ? 'bg-black/30' : ''}`}>
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {post.cover_image ? (
              <div className="relative w-24 h-16 border border-white/10 overflow-hidden rounded">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            ) : (
              <div className="w-24 h-16 border border-white/10 bg-black flex items-center justify-center rounded">
                <ImageIcon size={20} className="text-gray-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
            {/* Title and metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link
                  href={`/${post.language}/blog/${post.slug}`}
                  target="_blank"
                  className="text-white font-semibold text-sm hover:text-[#11b981] transition-colors"
                >
                  {post.title}
                </Link>
                {post.status === 'published' ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-[#11b981] text-black rounded">PUB</span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-gray-800 text-gray-400 rounded">DRAFT</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span
                  className="px-1.5 py-0.5 font-semibold uppercase rounded"
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
                <span>{displayViewCount} views</span>
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
                  className="px-2.5 py-1.5 border border-white/10 text-gray-300 hover:border-white/30 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  title="Actions"
                >
                  {deletingId === post.id ? '...' : <MoreVertical size={16} />}
                </button>

                {actionMenuOpen === post.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActionMenuOpen(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-black border border-white/10 z-20 min-w-[140px] rounded">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-300 font-semibold uppercase hover:bg-white/5 hover:text-[#11b981] transition-all"
                        onClick={() => setActionMenuOpen(null)}
                      >
                        <Pencil size={14} /> Edit
                      </Link>
                      <button
                        onClick={() => {
                          setActionMenuOpen(null);
                          handleDelete(post.id, post.title);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-400 font-semibold uppercase hover:bg-white/5 hover:text-[#ef4444] transition-all border-t border-white/10"
                      >
                        <Trash2 size={14} /> Delete
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
                  className="px-2.5 py-1.5 border border-white/10 text-gray-300 hover:border-white/30 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  title="Share"
                >
                  {sharingId?.startsWith(post.id) ? '...' : <Share2 size={16} />}
                </button>

                  {shareMenuOpen === post.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShareMenuOpen(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-black border border-white/10 z-20 min-w-[140px] rounded">
                        <button
                          onClick={() => {
                            setShareMenuOpen(null);
                            handleShare(post, 'linkedin');
                          }}
                          className="w-full px-3 py-2 text-xs text-left text-gray-300 font-semibold uppercase hover:bg-white/5 hover:text-[#0077b5] transition-all"
                        >
                          LinkedIn
                        </button>
                        <button
                          onClick={() => {
                            setShareMenuOpen(null);
                            handleShare(post, 'twitter');
                          }}
                          className="w-full px-3 py-2 text-xs text-left text-gray-300 font-semibold uppercase hover:bg-white/5 hover:text-[#1da1f2] transition-all border-t border-white/10"
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
      </div>
    );
  };

  if (loading) {
    return (
      <AdminPageWrapper showLogout={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  const visibleGroups = getVisibleGroups();
  const totalPosts = visibleGroups.reduce((acc, g) => acc + (g.en ? 1 : 0) + (g.es ? 1 : 0), 0);
  const publishedPosts = visibleGroups.reduce((acc, g) => {
    const en = g.en?.status === 'published' ? 1 : 0;
    const es = g.es?.status === 'published' ? 1 : 0;
    return acc + en + es;
  }, 0);
  const draftPosts = totalPosts - publishedPosts;
  const totalViews = visibleGroups.reduce((acc, g) => acc + (g.en?.view_count || 0) + (g.es?.view_count || 0), 0);

  return (
    <AdminPageWrapper showLogout={false}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-white mb-1">Blog Posts</h2>
          <p className="text-gray-400 text-sm">
            {visibleGroups.length} translation {visibleGroups.length === 1 ? 'group' : 'groups'}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 text-xs bg-[#11b981] text-black font-semibold uppercase tracking-wider rounded hover:bg-[#0f9f73] transition-colors"
        >
          + New Post
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-surface">
          <div className="text-xs uppercase tracking-wider text-[#9ca3af] mb-2">Total Posts</div>
          <div className="text-2xl font-semibold text-white">{totalPosts}</div>
        </div>
        <div className="card-surface">
          <div className="text-xs uppercase tracking-wider text-[#9ca3af] mb-2">Published</div>
          <div className="text-2xl font-semibold text-white">{publishedPosts}</div>
        </div>
        <div className="card-surface">
          <div className="text-xs uppercase tracking-wider text-[#9ca3af] mb-2">Drafts</div>
          <div className="text-2xl font-semibold text-white">{draftPosts}</div>
        </div>
        <div className="card-surface">
          <div className="text-xs uppercase tracking-wider text-[#9ca3af] mb-2">Total Views</div>
          <div className="text-2xl font-semibold text-white">{totalViews}</div>
        </div>
      </div>

      {/* Posts List */}
      {visibleGroups.length > 0 ? (
        <div className="card-surface p-0">
          {visibleGroups.map((group, groupIndex) => {
            const isExpanded = expandedGroups.has(group.translation_group_id);
            const primaryPost = group.en || group.es;
            const hasMultipleLanguages = group.en && group.es;

            // Calculate total view count across all languages
            const totalViewCount = (group.en?.view_count || 0) + (group.es?.view_count || 0);

            if (!primaryPost) return null;

            return (
              <div
                key={group.translation_group_id}
                className={groupIndex !== visibleGroups.length - 1 ? 'border-b border-white/10' : ''}
              >
                {/* Primary Post (collapsed view) */}
                <div className="flex items-center">
                  {/* Expand/Collapse Button */}
                  {hasMultipleLanguages && (
                    <button
                      onClick={() => toggleGroup(group.translation_group_id)}
                      className="p-3 text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                      title={isExpanded ? 'Collapse translations' : 'Show all translations'}
                    >
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  )}

                  {!hasMultipleLanguages && (
                    <div className="w-11" />
                  )}

                  {/* Post Content */}
                  <div className="flex-1">
                    {renderPost(primaryPost, false, totalViewCount)}
                  </div>

                  {/* Languages indicator */}
                  {hasMultipleLanguages && (
                    <div className="pr-3 text-gray-500">
                      <div className="flex items-center gap-1 px-2 py-1 border border-white/10 rounded text-xs">
                        <Languages size={14} />
                        <span>2</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Translations */}
                {isExpanded && hasMultipleLanguages && (
                  <div className="border-t border-white/10 bg-black/40">
                    {group.en && canModifyPost(group.en) && (
                      <div className="border-b border-white/10">
                        {renderPost(group.en, true)}
                      </div>
                    )}
                    {group.es && canModifyPost(group.es) && (
                      <div>
                        {renderPost(group.es, true)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-surface text-center">
          <p className="text-gray-500 mb-4">No blog posts yet</p>
          <Link
            href="/admin/blog/new"
            className="inline-block px-4 py-2 text-xs bg-[#11b981] text-black font-semibold uppercase tracking-wider rounded hover:bg-[#0f9f73] transition-colors"
          >
            Create First Post
          </Link>
        </div>
      )}
    </AdminPageWrapper>
  );
}
