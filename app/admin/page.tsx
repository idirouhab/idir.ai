'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';

type Stats = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalSubscribers: number;
  totalViews: number;
};

type StatCardProps = {
  title: string;
  value: number | string;
};

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="card-surface">
      <div className="text-xs uppercase tracking-wider text-[#9ca3af] mb-2">{title}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

type QuickActionProps = {
  href: string;
  label: string;
  description: string;
};

function QuickAction({ href, label, description }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 border border-white/10 rounded-lg hover:border-white/30 hover:bg-white/5 transition-all group"
    >
      <div className="flex-1">
        <div className="text-sm font-semibold text-white group-hover:text-[#11b981] transition-colors">
          {label}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
      <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
        →
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<'super_admin' | 'billing_admin' | null>(null);
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
        if (response.ok) {
          const data = await response.json();
          const roles = data.user.roles || [];
          const derivedRole = roles.includes('super_admin')
            ? 'super_admin'
            : roles.includes('billing_admin')
              ? 'billing_admin'
              : null;
          setUserRole(derivedRole);
          fetchData(derivedRole);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (role: 'super_admin' | 'billing_admin' | null) => {
    try {
      // Fetch posts for stats only
      const postsResponse = await fetch('/api/posts');
      const postsData = await postsResponse.json();
      const posts = postsData.data || [];

      const publishedPosts = posts.filter((p: any) => p.status === 'published').length;
      const draftPosts = posts.filter((p: any) => p.status !== 'published').length;
      const totalViews = posts.reduce((acc: number, p: any) => acc + (p.view_count || 0), 0);
      const recent = [...posts]
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      let subscribersData: any = null;

      // Only fetch subscriber data for owners and admins
      if (role === 'super_admin' || role === 'billing_admin') {
        try {
          const subscribersResponse = await fetch('/api/newsletter/admin');
          subscribersData = await subscribersResponse.json();
        } catch (err) {
          console.error('Error fetching subscribers:', err);
        }
      }

      setStats({
        totalPosts: posts.length || 0,
        publishedPosts,
        draftPosts,
        totalSubscribers: subscribersData?.statistics?.total || 0,
        totalViews,
      });
      setRecentPosts(recent);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <AdminSidebar
          currentPath={pathname}
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileMenuOpen}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        <div className="flex-1 ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-white text-xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <AdminSidebar
        currentPath={pathname}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 ml-64">
        {/* Page Header */}
        <div className="border-b border-gray-800 bg-black/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <h1 className="text-2xl font-semibold text-white mb-1">Dashboard</h1>
            <p className="text-sm text-gray-400">Quick overview and next actions</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Posts" value={stats.totalPosts} />
            <StatCard title="Published" value={stats.publishedPosts} />
            <StatCard title="Drafts" value={stats.draftPosts} />
            {(userRole === 'super_admin' || userRole === 'billing_admin') ? (
              <StatCard title="Subscribers" value={stats.totalSubscribers} />
            ) : (
              <StatCard title="Total Views" value={stats.totalViews} />
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <h2 className="text-base font-semibold text-white mb-3">Next Actions</h2>
              <div className="space-y-3">
                <QuickAction
                  href="/admin/blog/new"
                  label="New blog post"
                  description="Draft and publish a post"
                />
                <QuickAction
                  href="/admin/blog"
                  label="Review drafts"
                  description="Open draft posts and finish edits"
                />
                {(userRole === 'super_admin' || userRole === 'billing_admin') && (
                  <QuickAction
                    href="/admin/subscribers"
                    label="Manage subscribers"
                    description="View, filter, export newsletter list"
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">Recent Posts</h2>
                <Link href="/admin/blog" className="text-xs text-[#11b981] hover:text-[#0f9f73] transition-colors uppercase tracking-wider font-semibold">
                  View all
                </Link>
              </div>
              <div className="card-surface p-0">
                {recentPosts.length === 0 ? (
                  <div className="p-6 text-sm text-gray-400">No posts yet</div>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {recentPosts.map((post) => (
                      <li key={post.id} className="flex items-center justify-between px-6 py-4">
                        <div className="min-w-0">
                          <div className="text-sm text-white font-semibold truncate">{post.title}</div>
                          <div className="text-xs text-gray-500">
                            {post.status === 'published' ? 'Published' : 'Draft'} · {post.language?.toUpperCase() || 'EN'}
                          </div>
                        </div>
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="text-xs text-[#11b981] hover:text-[#0f9f73] transition-colors uppercase tracking-wider font-semibold"
                        >
                          Edit
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
