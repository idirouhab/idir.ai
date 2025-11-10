'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FeedbackStats = {
  totalSubscribers: number;
  totalResponses: number;
  responseRate: number;
  breakdown: {
    very_useful: number;
    useful: number;
    not_useful: number;
  };
  byDate: Record<string, any>;
};

export default function FeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, [selectedDate]);

  const fetchStats = async () => {
    try {
      const url = selectedDate
        ? `/api/newsletter/feedback/stats?date=${selectedDate}`
        : '/api/newsletter/feedback/stats';

      const response = await fetch(url);

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const result = await response.json();
      setStats(result.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const positiveRate = stats
    ? (((stats.breakdown.very_useful + stats.breakdown.useful) / stats.totalResponses) * 100).toFixed(1)
    : '0';

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
              <Link href="/admin/blog" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Blog
              </Link>
              <Link href="/admin/subscribers" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Subscribers
              </Link>
              <Link href="/admin/feedback" className="text-sm text-white font-bold uppercase hover:text-[#00ff88] transition-colors">
                Feedback
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
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Newsletter Feedback</h2>
          <p className="text-gray-400 text-sm">Track subscriber responses and satisfaction</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black border border-gray-800 p-6">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">Total Subscribers</div>
            <div className="text-3xl font-black text-white">{stats?.totalSubscribers || 0}</div>
          </div>

          <div className="bg-black border border-gray-800 p-6">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">Total Responses</div>
            <div className="text-3xl font-black text-white">{stats?.totalResponses || 0}</div>
          </div>

          <div className="bg-black border border-[#00ff88] p-6">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">Response Rate</div>
            <div className="text-3xl font-black text-[#00ff88]">{stats?.responseRate || 0}%</div>
          </div>

          <div className="bg-black border border-[#00cfff] p-6">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">Positive Rate</div>
            <div className="text-3xl font-black text-[#00cfff]">{positiveRate}%</div>
          </div>
        </div>

        {/* Feedback Breakdown */}
        <div className="bg-black border border-gray-800 p-6 mb-8">
          <h3 className="text-xl font-black text-white mb-4 uppercase">Feedback Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400 font-bold uppercase">Very Useful 😍</span>
                <span className="text-sm text-white font-bold">{stats?.breakdown.very_useful || 0}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00ff88]"
                  style={{
                    width: `${stats?.totalResponses ? ((stats.breakdown.very_useful / stats.totalResponses) * 100) : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400 font-bold uppercase">Useful 👍</span>
                <span className="text-sm text-white font-bold">{stats?.breakdown.useful || 0}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00cfff]"
                  style={{
                    width: `${stats?.totalResponses ? ((stats.breakdown.useful / stats.totalResponses) * 100) : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400 font-bold uppercase">Not Useful 👎</span>
                <span className="text-sm text-white font-bold">{stats?.breakdown.not_useful || 0}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff0055]"
                  style={{
                    width: `${stats?.totalResponses ? ((stats.breakdown.not_useful / stats.totalResponses) * 100) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="bg-[#00cfff10] border border-[#00cfff] p-6">
          <h3 className="text-lg font-black text-[#00cfff] mb-3 uppercase">How to Use Feedback in Emails</h3>
          <p className="text-sm text-gray-300 mb-4">
            Add these one-click feedback buttons to your newsletter emails. Each button links to the feedback API with a unique token.
          </p>

          <div className="bg-black p-4 rounded border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto">
            <pre>{`<!-- Add this to your email template -->
<div style="text-align: center; margin: 40px 0;">
  <p style="color: #888; margin-bottom: 16px;">Was today's newsletter useful?</p>
  <div>
    <a href="https://idir.ai/api/newsletter/feedback?token={{TOKEN}}&type=very_useful"
       style="display: inline-block; padding: 12px 24px; margin: 0 8px;
              background: #00ff88; color: #000; text-decoration: none;
              font-weight: bold; border-radius: 4px;">
      😍 Very Useful
    </a>
    <a href="https://idir.ai/api/newsletter/feedback?token={{TOKEN}}&type=useful"
       style="display: inline-block; padding: 12px 24px; margin: 0 8px;
              background: #00cfff; color: #000; text-decoration: none;
              font-weight: bold; border-radius: 4px;">
      👍 Useful
    </a>
    <a href="https://idir.ai/api/newsletter/feedback?token={{TOKEN}}&type=not_useful"
       style="display: inline-block; padding: 12px 24px; margin: 0 8px;
              background: #ff0055; color: #fff; text-decoration: none;
              font-weight: bold; border-radius: 4px;">
      👎 Not Useful
    </a>
  </div>
</div>

<!-- Generate token in your email system using the feedback token API -->`}</pre>
          </div>

          <div className="mt-4 p-4 bg-[#ff005510] border border-[#ff0055] text-sm text-gray-300">
            <p className="font-bold text-[#ff0055] mb-2">⚠️ Token Generation Required</p>
            <p>You need to generate a unique token for each subscriber in your email system. The token should include the subscriber email and campaign date.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
