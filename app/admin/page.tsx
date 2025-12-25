'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';

type Stats = {
  totalPosts: number;
  totalSubscribers: number;
  feedbackCount: number;
  postsThisMonth: number;
  subscribersThisMonth: number;
};

type StatCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  trend?: string;
  color: string;
};

function StatCard({ title, value, subtitle, icon, trend, color }: StatCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30',
    cyan: 'bg-cyan-500/10 border-cyan-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
    amber: 'bg-amber-500/10 border-amber-500/30',
  };

  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald} border flex items-center justify-center text-xl`}>
          {icon}
        </div>
        {trend && (
          <div className="text-xs text-emerald-400 font-medium">
            {trend}
          </div>
        )}
      </div>
      <div className="mb-1">
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm font-medium text-gray-400">{title}</div>
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
      )}
    </div>
  );
}

type QuickActionProps = {
  href: string;
  label: string;
  icon: string;
  description: string;
};

function QuickAction({ href, label, icon, description }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 bg-[#111] border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900/50 transition-all group"
    >
      <div className="w-8 h-8 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
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
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalSubscribers: 0,
    feedbackCount: 0,
    postsThisMonth: 0,
    subscribersThisMonth: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          fetchData();
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

  const fetchData = async () => {
    try {
      // Fetch posts for stats only
      const postsResponse = await fetch('/api/posts');
      const postsData = await postsResponse.json();
      const posts = postsData.data || [];

      // Fetch subscribers count (quick stats only)
      const subscribersResponse = await fetch('/api/newsletter/admin');
      const subscribersData = await subscribersResponse.json();

      // Fetch feedback count
      const feedbackResponse = await fetch('/api/admin/feedback');
      const feedbackData = await feedbackResponse.json();

      // Calculate stats
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const postsThisMonth = posts.filter((p: any) =>
        new Date(p.updated_at) >= thisMonthStart
      ).length;

      setStats({
        totalPosts: posts.length || 0,
        totalSubscribers: subscribersData.statistics?.total || 0,
        feedbackCount: feedbackData.length || 0,
        postsThisMonth,
        subscribersThisMonth: subscribersData.statistics?.subscribed || 0,
      });

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
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-sm text-gray-400">Overview of your content and audience</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Blog Posts"
              value={stats.totalPosts}
              icon="📝"
              trend={stats.postsThisMonth > 0 ? `+${stats.postsThisMonth} this month` : undefined}
              subtitle={`${stats.postsThisMonth} published this month`}
              color="emerald"
            />
            <StatCard
              title="Subscribers"
              value={stats.totalSubscribers}
              icon="📬"
              trend={stats.subscribersThisMonth > 0 ? `${stats.subscribersThisMonth} subscribed` : undefined}
              subtitle="Total newsletter subscribers"
              color="cyan"
            />
            <StatCard
              title="Feedback"
              value={stats.feedbackCount}
              icon="💬"
              subtitle="Total feedback responses"
              color="purple"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/blog/new"
                className="group p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 hover:border-emerald-400 rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    📝
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                      New Blog Post
                    </h3>
                    <p className="text-xs text-gray-400">Write and publish content</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/subscribers"
                className="group p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 hover:border-purple-400 rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/40 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    📬
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                      Subscribers
                    </h3>
                    <p className="text-xs text-gray-400">Manage your audience</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/feedback"
                className="group p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 hover:border-amber-400 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    💬
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                      Feedback
                    </h3>
                    <p className="text-xs text-gray-400">View responses</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
