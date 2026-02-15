'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { categoryColors } from '@/lib/blog-shared';
import type { BlogPost } from '@/lib/blog-shared';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ImageIcon,
  Languages,
  Pencil,
  Trash2,
} from 'lucide-react';
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

type GroupView = {
  group: TranslationGroup;
  posts: BlogPost[];
  primaryPost: BlogPost;
  title: string;
  latestUpdate: number;
  totalViews: number;
  publishedCount: number;
  draftCount: number;
  hasMultipleLanguages: boolean;
};

export default function AdminBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<TranslationGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'views'>('recent');

  const fetchGroups = async () => {
    const response = await fetch('/api/blog/grouped-admin?limit=100');
    if (!response.ok) throw new Error('Failed to fetch posts');
    const data = await response.json();
    setGroups(data.data || []);
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
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

        await fetchGroups();
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        router.push('/admin/login');
      }
    };

    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canModifyPost = useCallback((post: BlogPost): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin' || currentUser.role === 'billing_admin') return true;
    return post.author_id === currentUser.id;
  }, [currentUser]);

  const visibleGroups = useMemo(() => {
    const baseGroups = groups.filter((group) => {
      if (!currentUser) return false;
      if (currentUser.role === 'super_admin' || currentUser.role === 'billing_admin') return true;
      return (!!group.en && canModifyPost(group.en)) || (!!group.es && canModifyPost(group.es));
    });

    const mapped: GroupView[] = baseGroups
      .map((group) => {
        const posts = [group.en, group.es].filter(Boolean) as BlogPost[];
        const primaryPost = group.en || group.es;
        if (!primaryPost || posts.length === 0) return null;

        const latestUpdate = posts.reduce((maxTs, post) => {
          const ts = new Date(post.updated_at || post.published_at || 0).getTime();
          return Math.max(maxTs, Number.isNaN(ts) ? 0 : ts);
        }, 0);

        const totalViews = posts.reduce((acc, post) => acc + (post.view_count || 0), 0);
        const publishedCount = posts.filter((post) => post.status === 'published').length;
        const draftCount = posts.length - publishedCount;

        return {
          group,
          posts,
          primaryPost,
          title: group.en?.title || group.es?.title || 'Untitled post',
          latestUpdate,
          totalViews,
          publishedCount,
          draftCount,
          hasMultipleLanguages: Boolean(group.en && group.es),
        };
      })
      .filter(Boolean) as GroupView[];

    const loweredSearch = search.trim().toLowerCase();

    const filtered = mapped.filter((item) => {
      const matchesSearch =
        loweredSearch.length === 0 ||
        item.posts.some((post) => {
          const title = String(post.title || '').toLowerCase();
          const slug = String(post.slug || '').toLowerCase();
          return title.includes(loweredSearch) || slug.includes(loweredSearch);
        });

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && item.publishedCount > 0) ||
        (statusFilter === 'draft' && item.draftCount > 0);

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'views') return b.totalViews - a.totalViews;
      return b.latestUpdate - a.latestUpdate;
    });
  }, [groups, currentUser, search, statusFilter, sortBy, canModifyPost]);

  const totals = useMemo(() => {
    const totalPosts = visibleGroups.reduce((acc, item) => acc + item.posts.length, 0);
    const publishedPosts = visibleGroups.reduce((acc, item) => acc + item.publishedCount, 0);
    const draftPosts = totalPosts - publishedPosts;
    const totalViews = visibleGroups.reduce((acc, item) => acc + item.totalViews, 0);

    return { totalPosts, publishedPosts, draftPosts, totalViews };
  }, [visibleGroups]);

  const toggleGroup = (groupId: string) => {
    const next = new Set(expandedGroups);
    if (next.has(groupId)) next.delete(groupId);
    else next.add(groupId);
    setExpandedGroups(next);
  };

  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeletingId(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete post');
      await fetchGroups();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          title: post.title,
          excerpt: post.excerpt,
          postUrl,
          language: post.language,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate share content');
      const data = await response.json();
      const generatedContent = data.content;

      if (platform === 'linkedin') {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(generatedContent)}`;
        window.open(linkedInUrl, 'linkedin-share', 'width=600,height=600');
      } else {
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

  const renderLanguageRow = (post: BlogPost) => {
    const categoryColor = categoryColors[post.category] || '#64748b';

    return (
      <div key={post.id} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                {post.language}
              </span>
              <span
                className="rounded-lg px-2 py-1 text-[11px] font-semibold uppercase"
                style={{
                  background: `${categoryColor}1F`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}`,
                }}
              >
                {post.category}
              </span>
              <span
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold uppercase ${
                  post.status === 'published'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {post.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{post.title}</p>
            <p className="mt-1 text-xs text-slate-500">{post.view_count || 0} views</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${post.language}/blog/${post.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              View
              <ExternalLink size={12} />
            </Link>

            {post.status === 'published' ? (
              <>
                <button
                  onClick={() => handleShare(post, 'linkedin')}
                  disabled={sharingId === `${post.id}-linkedin`}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare(post, 'twitter')}
                  disabled={sharingId === `${post.id}-twitter`}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  X
                </button>
              </>
            ) : null}

            {canModifyPost(post) ? (
              <>
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Pencil size={12} />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deletingId === post.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminPageWrapper title="Blog Posts" description="Manage translations, drafts, and publishing">
        <div className="flex min-h-[45vh] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
          Loading posts...
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Blog Posts"
      description="Manage translations, drafts, publishing, and sharing"
      actions={
        <Link href="/admin/blog/new" className="btn-primary text-xs uppercase tracking-wider">
          + New Post
        </Link>
      }
    >
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Posts</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.totalPosts}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Published</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.publishedPosts}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Drafts</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.draftPosts}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Views</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.totalViews}</p>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or slug"
            className="input-shell"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'published' | 'draft')}
            className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#11b981]/40"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as 'recent' | 'views')}
            className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#11b981]/40"
          >
            <option value="recent">Sort: Recently updated</option>
            <option value="views">Sort: Most viewed</option>
          </select>
        </div>
      </section>

      {visibleGroups.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">No posts match the current filters.</p>
          <Link href="/admin/blog/new" className="btn-primary mt-4 text-xs uppercase tracking-wider">
            Create New Post
          </Link>
        </div>
      ) : (
        <section className="space-y-4">
          {visibleGroups.map((item) => {
            const { group, primaryPost, posts, hasMultipleLanguages, publishedCount, draftCount, totalViews } = item;
            const isExpanded = expandedGroups.has(group.translation_group_id);

            return (
              <article key={group.translation_group_id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="shrink-0">
                        {primaryPost.cover_image ? (
                          <div className="relative h-20 w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            <Image
                              src={primaryPost.cover_image}
                              alt={primaryPost.title}
                              fill
                              sizes="128px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 w-32 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                            <ImageIcon size={18} className="text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{item.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-700">
                            {publishedCount} published
                          </span>
                          <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-700">
                            {draftCount} draft
                          </span>
                          <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-700">
                            {totalViews} views
                          </span>
                          <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-700">
                            {posts.length} language{posts.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Updated {new Date(item.latestUpdate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/${primaryPost.language}/blog/${primaryPost.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Open
                        <ExternalLink size={12} />
                      </Link>

                      {canModifyPost(primaryPost) ? (
                        <Link
                          href={`/admin/blog/${primaryPost.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={12} />
                          Edit
                        </Link>
                      ) : null}

                      {hasMultipleLanguages ? (
                        <button
                          onClick={() => toggleGroup(group.translation_group_id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Languages size={12} />
                          Translations
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {isExpanded || !hasMultipleLanguages ? (
                  <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
                    <div className="space-y-3">{posts.map((post) => renderLanguageRow(post))}</div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      )}
    </AdminPageWrapper>
  );
}
