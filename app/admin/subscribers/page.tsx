'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Subscriber = {
  id: string;
  email: string;
  lang: 'en' | 'es';
  is_subscribed: boolean;
  welcomed: boolean;
  created_at: string;
  updated_at: string;
};

type Statistics = {
  total: number;
  subscribed: number;
  unsubscribed: number;
  en: number;
  es: number;
  welcomed: number;
  notWelcomed: number;
};

export default function SubscribersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  const [filterLang, setFilterLang] = useState<'all' | 'en' | 'es'>('all');
  const [filterWelcomed, setFilterWelcomed] = useState<'all' | 'true' | 'false'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterLang, filterWelcomed]);

  const checkAuthAndFetch = async () => {
    try {
      // Check auth by trying to fetch
      const response = await fetch(
        `/api/newsletter/admin?filter=${filterStatus}&lang=${filterLang}&welcomed=${filterWelcomed}`
      );

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch subscribers');
      }

      const result = await response.json();
      setSubscribers(result.data || []);
      setStatistics(result.statistics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const exportToCSV = async () => {
    try {
      // Use the export API endpoint which handles audit logging
      const response = await fetch(
        `/api/newsletter/admin/export?filter=${filterStatus}&lang=${filterLang}&welcomed=${filterWelcomed}`
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the CSV data from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  // Client-side search filter
  const filteredSubscribers = subscribers.filter(sub =>
    searchQuery === '' || sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Link href="/admin/blog" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Blog
              </Link>
              <Link href="/admin/subscribers" className="text-sm text-white font-bold uppercase hover:text-[#00ff88] transition-colors">
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
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs border border-gray-700 text-gray-400 font-bold uppercase hover:border-[#ff0055] hover:text-[#ff0055] transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Newsletter Subscribers</h2>
          <p className="text-gray-400 text-sm">Manage and view newsletter subscribers</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-black border border-gray-800">
              <div className="text-2xl font-black text-[#00ff88]">{statistics.total}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Total</div>
            </div>
            <div className="p-4 bg-black border border-gray-800">
              <div className="text-2xl font-black text-[#00cfff]">{statistics.subscribed}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Subscribed</div>
            </div>
            <div className="p-4 bg-black border border-gray-800">
              <div className="text-2xl font-black text-gray-400">{statistics.unsubscribed}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Unsubscribed</div>
            </div>
            <div className="p-4 bg-black border border-gray-800">
              <div className="text-2xl font-black text-[#ff0055]">{statistics.notWelcomed}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Not Welcomed</div>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 px-4 py-2 bg-black border border-gray-800 text-white placeholder-gray-600 focus:border-[#00ff88] focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-black border border-gray-800 text-white text-sm font-bold uppercase focus:border-[#00ff88] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>

            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value as any)}
              className="px-4 py-2 bg-black border border-gray-800 text-white text-sm font-bold uppercase focus:border-[#00ff88] focus:outline-none"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>

            <select
              value={filterWelcomed}
              onChange={(e) => setFilterWelcomed(e.target.value as any)}
              className="px-4 py-2 bg-black border border-gray-800 text-white text-sm font-bold uppercase focus:border-[#00ff88] focus:outline-none"
            >
              <option value="all">All Welcomed</option>
              <option value="true">Welcomed</option>
              <option value="false">Not Welcomed</option>
            </select>

            <button
              onClick={exportToCSV}
              className="ml-auto px-6 py-2 bg-[#00ff88] text-black text-xs font-bold uppercase hover:opacity-90 transition-opacity"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredSubscribers.length} subscriber{filteredSubscribers.length !== 1 ? 's' : ''}
        </div>

        {/* Subscribers Table */}
        {filteredSubscribers.length === 0 ? (
          <div className="border border-gray-800 bg-black p-12 text-center">
            <div className="text-4xl mb-4 opacity-50">📬</div>
            <p className="text-lg text-gray-300 mb-2">No subscribers found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="border border-gray-800 bg-black overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Language</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Welcomed</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium">{subscriber.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-bold uppercase bg-gray-800 text-gray-400">
                        {subscriber.lang}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {subscriber.is_subscribed ? (
                        <span className="px-2 py-1 text-xs font-bold uppercase bg-[#00ff8820] text-[#00ff88] border border-[#00ff88]">
                          ● Subscribed
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold uppercase bg-gray-800 text-gray-500">
                          ○ Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {subscriber.welcomed ? (
                        <span className="text-[#00cfff] text-sm">✓</span>
                      ) : (
                        <span className="text-gray-600 text-sm">○</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(subscriber.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
