'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';

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
  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 border border-${color}-500/30 flex items-center justify-center text-xl`}>
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

export default function DashboardNew() {
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

      // Fetch subscribers count
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
            <div className="bg-[#111] border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <QuickAction
                  href="/admin/blog/new"
                  label="New Blog Post"
                  icon="📝"
                  description="Write and publish content"
                />
                <QuickAction
                  href="/admin/subscribers"
                  label="View Subscribers"
                  icon="📬"
                  description="Manage your audience"
                />
                <QuickAction
                  href="/admin/feedback"
                  label="View Feedback"
                  icon="💬"
                  description="See feedback responses"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
