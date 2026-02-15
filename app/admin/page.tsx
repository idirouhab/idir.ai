'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

type Stats = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalSubscribers: number;
  totalViews: number;
};

type Role = 'super_admin' | 'billing_admin' | null;

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function QuickAction({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-xs text-slate-600">{description}</p>
      </div>
      <span className="mt-0.5 text-sm text-slate-400" aria-hidden="true">→</span>
    </Link>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<Role>(null);
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalSubscribers: 0,
    totalViews: 0,
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/admin/login');
          return;
        }

        const data = await response.json();
        const roles = data.user.roles || [];
        const role: Role = roles.includes('super_admin')
          ? 'super_admin'
          : roles.includes('billing_admin')
            ? 'billing_admin'
            : null;

        setUserRole(role);
        await fetchData(role);
      } catch {
        router.push('/admin/login');
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (role: Role) => {
    try {
      const postsResponse = await fetch('/api/posts');
      const postsData = await postsResponse.json();
      const posts = postsData.data || [];

      const publishedPosts = posts.filter((p: any) => p.status === 'published').length;
      const draftPosts = posts.filter((p: any) => p.status !== 'published').length;
      const totalViews = posts.reduce((acc: number, p: any) => acc + (p.view_count || 0), 0);
      const recent = [...posts]
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      let subscribersTotal = 0;
      if (role === 'super_admin' || role === 'billing_admin') {
        const subscribersResponse = await fetch('/api/newsletter/admin');
        if (subscribersResponse.ok) {
          const subscribersData = await subscribersResponse.json();
          subscribersTotal = subscribersData?.statistics?.total || 0;
        }
      }

      setStats({
        totalPosts: posts.length || 0,
        publishedPosts,
        draftPosts,
        totalSubscribers: subscribersTotal,
        totalViews,
      });
      setRecentPosts(recent);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminPageWrapper title="Dashboard" description="Quick overview and next actions">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">Loading...</div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper title="Dashboard" description="Quick overview and next actions">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Posts" value={stats.totalPosts} />
        <StatCard title="Published" value={stats.publishedPosts} />
        <StatCard title="Drafts" value={stats.draftPosts} />
        {(userRole === 'super_admin' || userRole === 'billing_admin') ? (
          <StatCard title="Subscribers" value={stats.totalSubscribers} />
        ) : (
          <StatCard title="Total Views" value={stats.totalViews} />
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-1">
          <h2 className="text-base font-semibold text-slate-900">Next Actions</h2>
          <QuickAction href="/admin/blog/new" label="New blog post" description="Draft and publish a post" />
          <QuickAction href="/admin/blog" label="Review drafts" description="Open draft posts and finish edits" />
          {(userRole === 'super_admin' || userRole === 'billing_admin') ? (
            <QuickAction href="/admin/subscribers" label="Manage subscribers" description="Filter, view, and export newsletter list" />
          ) : null}
        </section>

        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Posts</h2>
            <Link href="/admin/blog" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f9f73]">
              View all
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white">
            {recentPosts.length === 0 ? (
              <div className="p-6 text-sm text-slate-600">No posts yet</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {recentPosts.map((post) => (
                  <li key={post.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{post.title}</p>
                      <p className="text-xs text-slate-500">
                        {post.status === 'published' ? 'Published' : 'Draft'} · {(post.language || 'en').toUpperCase()}
                      </p>
                    </div>
                    <Link href={`/admin/blog/${post.id}/edit`} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f9f73]">
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AdminPageWrapper>
  );
}
