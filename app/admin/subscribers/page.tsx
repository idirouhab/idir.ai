'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

type Subscriber = {
  id: string;
  email: string;
  lang: 'en' | 'es';
  is_subscribed: boolean;
  welcomed: boolean;
  created_at: string;
  updated_at: string;
  subscribe_newsletter: boolean;
  subscribe_podcast: boolean;
};

type Statistics = {
  total: number;
  subscribed: number;
  unsubscribed: number;
  en: number;
  es: number;
  welcomed: number;
  notWelcomed: number;
  newsletterSubscribers: number;
  podcastSubscribers: number;
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
  const [filterMinDays, setFilterMinDays] = useState<number>(0);
  const [filterNewsletter, setFilterNewsletter] = useState<'all' | 'yes' | 'no'>('all');
  const [filterPodcast, setFilterPodcast] = useState<'all' | 'yes' | 'no'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allEmails = new Set(filteredSubscribers.map(sub => sub.email));
      setSelectedSubscribers(allEmails);
    } else {
      setSelectedSubscribers(new Set());
    }
  };

  const handleSelectSubscriber = (email: string, checked: boolean) => {
    const newSelected = new Set(selectedSubscribers);
    if (checked) {
      newSelected.add(email);
    } else {
      newSelected.delete(email);
    }
    setSelectedSubscribers(newSelected);
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


  // Client-side filters
  const filteredSubscribers = subscribers.filter(sub => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Min days subscribed filter
    const daysSinceSubscribed = Math.floor(
      (new Date().getTime() - new Date(sub.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const matchesMinDays = filterMinDays === 0 || daysSinceSubscribed >= filterMinDays;

    // Newsletter subscription filter
    const matchesNewsletter =
      filterNewsletter === 'all' ||
      (filterNewsletter === 'yes' && sub.subscribe_newsletter) ||
      (filterNewsletter === 'no' && !sub.subscribe_newsletter);

    // Podcast subscription filter
    const matchesPodcast =
      filterPodcast === 'all' ||
      (filterPodcast === 'yes' && sub.subscribe_podcast) ||
      (filterPodcast === 'no' && !sub.subscribe_podcast);

    return matchesSearch && matchesMinDays && matchesNewsletter && matchesPodcast;
  });

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Newsletter Subscribers"
      description="Manage and view newsletter subscribers"
    >

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-black border border-gray-800">
              <div className="text-xl sm:text-2xl font-black text-[#00ff88]">{statistics.total}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Total</div>
            </div>
            <div className="p-3 sm:p-4 bg-black border border-gray-800">
              <div className="text-xl sm:text-2xl font-black text-[#00cfff]">{statistics.subscribed}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Active</div>
            </div>
            <div className="p-3 sm:p-4 bg-black border border-[#00ff88]">
              <div className="text-xl sm:text-2xl font-black text-[#00ff88]">{statistics.newsletterSubscribers}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Newsletter</div>
            </div>
            <div className="p-3 sm:p-4 bg-black border border-[#ff6b00]">
              <div className="text-xl sm:text-2xl font-black text-[#ff6b00]">{statistics.podcastSubscribers}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Podcast</div>
            </div>
          </div>
        )}

        {/* Search and Primary Actions */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-black border border-gray-800 text-white placeholder-gray-600 focus:border-[#00ff88] focus:outline-none"
            />
            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-[#00ff88] text-black text-xs font-bold uppercase hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Export CSV
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-black border border-gray-800 text-white text-xs font-bold uppercase focus:border-[#00ff88] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>

            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value as any)}
              className="px-4 py-2 bg-black border border-gray-800 text-white text-xs font-bold uppercase focus:border-[#00ff88] focus:outline-none"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>

            <select
              value={filterWelcomed}
              onChange={(e) => setFilterWelcomed(e.target.value as any)}
              className="px-4 py-2 bg-black border border-gray-800 text-white text-xs font-bold uppercase focus:border-[#00ff88] focus:outline-none"
            >
              <option value="all">Welcomed Status</option>
              <option value="true">Welcomed</option>
              <option value="false">Not Welcomed</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 border text-xs font-bold uppercase transition-all ${
                showAdvancedFilters
                  ? 'bg-[#00ff88] border-[#00ff88] text-black'
                  : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              {showAdvancedFilters ? '▲' : '▼'} More Filters
            </button>
          </div>

          {/* Advanced Filters (Collapsible) */}
          {showAdvancedFilters && (
            <div className="p-4 bg-black border border-gray-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Newsletter Filter */}
                <div>
                  <label className="block text-xs text-gray-500 font-bold uppercase mb-2">Newsletter</label>
                  <select
                    value={filterNewsletter}
                    onChange={(e) => setFilterNewsletter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black border border-[#00ff88] text-white text-xs font-bold uppercase focus:border-[#00ff88] focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="yes">Subscribed</option>
                    <option value="no">Not Subscribed</option>
                  </select>
                </div>

                {/* Podcast Filter */}
                <div>
                  <label className="block text-xs text-gray-500 font-bold uppercase mb-2">Podcast</label>
                  <select
                    value={filterPodcast}
                    onChange={(e) => setFilterPodcast(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black border border-[#ff6b00] text-white text-xs font-bold uppercase focus:border-[#ff6b00] focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="yes">Subscribed</option>
                    <option value="no">Not Subscribed</option>
                  </select>
                </div>

                {/* Min Days Subscribed */}
                <div>
                  <label className="block text-xs text-gray-500 font-bold uppercase mb-2">Min Days Subscribed</label>
                  <input
                    type="number"
                    min="0"
                    value={filterMinDays}
                    onChange={(e) => setFilterMinDays(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-black border border-gray-800 text-white text-xs font-bold focus:border-[#00ff88] focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setFilterNewsletter('all');
                    setFilterPodcast('all');
                    setFilterMinDays(0);
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors"
                >
                  Clear Advanced Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count and Selection Actions */}
        <div className="mb-4 flex justify-between items-center flex-wrap gap-3">
          <div className="text-sm text-gray-500">
            Showing {filteredSubscribers.length} subscriber{filteredSubscribers.length !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-3">
            {/* Selection Info */}
            {selectedSubscribers.size > 0 && (
              <span className="text-sm font-bold text-[#00ff88]">
                {selectedSubscribers.size} selected
              </span>
            )}

            {/* Selection Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectAll(true)}
                className="px-3 py-1.5 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-[#00ff88] hover:text-[#00ff88] transition-all"
                title="Select all visible subscribers"
              >
                Select All ({filteredSubscribers.length})
              </button>

              {selectedSubscribers.size > 0 && (
                <button
                  onClick={() => setSelectedSubscribers(new Set())}
                  className="px-3 py-1.5 text-xs border border-gray-700 text-gray-400 font-bold uppercase hover:border-[#ff0055] hover:text-[#ff0055] transition-all"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subscribers List */}
        {filteredSubscribers.length === 0 ? (
          <div className="border border-gray-800 bg-black p-8 sm:p-12 text-center">
            <div className="text-4xl mb-4 opacity-50">📬</div>
            <p className="text-lg text-gray-300 mb-2">No subscribers found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block border border-gray-800 bg-black overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.size === filteredSubscribers.length && filteredSubscribers.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] cursor-pointer"
                        title="Select all"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Lang</th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Subscriptions</th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Welcomed</th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber) => {
                    const isSelected = selectedSubscribers.has(subscriber.email);
                    return (
                      <tr
                        key={subscriber.id}
                        className={`border-b border-gray-800 transition-colors ${
                          isSelected
                            ? 'bg-[#00ff8808] hover:bg-[#00ff8812]'
                            : 'hover:bg-gray-900'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectSubscriber(subscriber.email, e.target.checked)}
                            className="w-4 h-4 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{subscriber.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-bold uppercase bg-gray-800 text-gray-400">
                            {subscriber.lang}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {subscriber.is_subscribed ? (
                            <span className="px-2 py-1 text-xs font-bold uppercase bg-[#00ff8820] text-[#00ff88] border border-[#00ff88]">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-bold uppercase bg-gray-800 text-gray-500">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {subscriber.subscribe_newsletter && (
                              <span className="px-2 py-0.5 text-xs font-bold uppercase bg-[#00ff8810] text-[#00ff88] border border-[#00ff88]" title="Newsletter">
                                N
                              </span>
                            )}
                            {subscriber.subscribe_podcast && (
                              <span className="px-2 py-0.5 text-xs font-bold uppercase bg-[#ff6b0010] text-[#ff6b00] border border-[#ff6b00]" title="Podcast">
                                P
                              </span>
                            )}
                            {!subscriber.subscribe_newsletter && !subscriber.subscribe_podcast && (
                              <span className="text-xs text-gray-600">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {subscriber.welcomed ? (
                            <span className="text-[#00cfff] text-sm">✓</span>
                          ) : (
                            <span className="text-gray-600 text-sm">○</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {Math.floor((new Date().getTime() - new Date(subscriber.created_at).getTime()) / (1000 * 60 * 60 * 24))}d
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredSubscribers.map((subscriber) => {
                const isSelected = selectedSubscribers.has(subscriber.email);
                return (
                  <div
                    key={subscriber.id}
                    className={`border transition-colors ${
                      isSelected
                        ? 'border-[#00ff88] bg-[#00ff8808]'
                        : 'border-gray-800 bg-black'
                    }`}
                  >
                    <div className="p-4 space-y-3">
                      {/* Header: Checkbox + Email */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectSubscriber(subscriber.email, e.target.checked)}
                          className="mt-1 w-4 h-4 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium break-all">{subscriber.email}</div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500 uppercase font-bold mb-1">Status</div>
                          {subscriber.is_subscribed ? (
                            <span className="inline-block px-2 py-1 text-xs font-bold uppercase bg-[#00ff8820] text-[#00ff88] border border-[#00ff88]">
                              Active
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 text-xs font-bold uppercase bg-gray-800 text-gray-500">
                              Inactive
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-gray-500 uppercase font-bold mb-1">Language</div>
                          <span className="inline-block px-2 py-1 text-xs font-bold uppercase bg-gray-800 text-gray-400">
                            {subscriber.lang}
                          </span>
                        </div>

                        <div>
                          <div className="text-gray-500 uppercase font-bold mb-1">Subscriptions</div>
                          <div className="flex gap-1">
                            {subscriber.subscribe_newsletter && (
                              <span className="px-2 py-0.5 text-xs font-bold uppercase bg-[#00ff8810] text-[#00ff88] border border-[#00ff88]">
                                Newsletter
                              </span>
                            )}
                            {subscriber.subscribe_podcast && (
                              <span className="px-2 py-0.5 text-xs font-bold uppercase bg-[#ff6b0010] text-[#ff6b00] border border-[#ff6b00]">
                                Podcast
                              </span>
                            )}
                            {!subscriber.subscribe_newsletter && !subscriber.subscribe_podcast && (
                              <span className="text-gray-600">None</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-500 uppercase font-bold mb-1">Age</div>
                          <div className="text-gray-400">
                            {Math.floor((new Date().getTime() - new Date(subscriber.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                      </div>

                      {/* Footer: Welcomed */}
                      <div className="pt-2 border-t border-gray-800 text-xs">
                        <span className="text-gray-500">Welcomed: </span>
                        {subscriber.welcomed ? (
                          <span className="text-[#00cfff]">✓ Yes</span>
                        ) : (
                          <span className="text-gray-600">○ No</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
    </AdminPageWrapper>
  );
}
