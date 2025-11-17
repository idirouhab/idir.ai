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
  feedback_sent_at: string | null;
  feedback_campaign_date: string | null;
};

type Statistics = {
  total: number;
  subscribed: number;
  unsubscribed: number;
  en: number;
  es: number;
  welcomed: number;
  notWelcomed: number;
  feedbackSent: number;
  feedbackNotSent: number;
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
  const [filterFeedbackSent, setFilterFeedbackSent] = useState<'all' | 'sent' | 'not_sent'>('all');
  const [filterMinDaysSinceSent, setFilterMinDaysSinceSent] = useState<number>(0);
  const [showSendFeedbackModal, setShowSendFeedbackModal] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [sendFeedbackLang, setSendFeedbackLang] = useState<'all' | 'en' | 'es'>('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [testEmail, setTestEmail] = useState('');

  const handleCloseFeedbackModal = () => {
    setShowSendFeedbackModal(false);
    setTestEmail('');
  };

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

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      alert('Please enter a test email address');
      return;
    }

    if (!testEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setSendingFeedback(true);

    try {
      const response = await fetch('/api/newsletter/feedback/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          campaignDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      const data = await response.json();

      alert(
        `Test email sent successfully to ${testEmail}!\n\n` +
        `Check your inbox to preview the feedback survey.`
      );
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email. Please try again.');
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleSendFeedbackSurvey = async () => {
    let confirmMessage = '';
    let targetCount = 0;

    // Determine what will be sent
    if (selectedSubscribers.size > 0) {
      targetCount = selectedSubscribers.size;
      confirmMessage = `Are you sure you want to send feedback surveys to ${targetCount} selected subscriber${targetCount !== 1 ? 's' : ''}?`;
    } else {
      if (sendFeedbackLang === 'all') {
        targetCount = statistics?.subscribed || 0;
      } else if (sendFeedbackLang === 'en') {
        targetCount = statistics?.en || 0;
      } else {
        targetCount = statistics?.es || 0;
      }
      confirmMessage = `Are you sure you want to send feedback surveys to ${targetCount} ${sendFeedbackLang === 'all' ? 'all' : sendFeedbackLang.toUpperCase()} subscribers?`;
    }

    confirmMessage += '\n\nEach subscriber will receive the email in their preferred language.';

    if (!confirm(confirmMessage)) {
      return;
    }

    setSendingFeedback(true);

    try {
      const requestBody: any = {
        campaignDate: new Date().toISOString().split('T')[0],
      };

      // If specific subscribers are selected, send only to them
      if (selectedSubscribers.size > 0) {
        requestBody.selectedEmails = Array.from(selectedSubscribers);
      } else {
        // Otherwise use language filter
        requestBody.lang = sendFeedbackLang;
      }

      const response = await fetch('/api/newsletter/feedback/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback surveys');
      }

      const data = await response.json();

      alert(
        `Feedback surveys sent successfully!\n\n` +
        `Total: ${data.results.total}\n` +
        `Sent: ${data.results.sent}\n` +
        `Failed: ${data.results.failed}`
      );

      handleCloseFeedbackModal();
      setSelectedSubscribers(new Set());
    } catch (error) {
      console.error('Error sending feedback surveys:', error);
      alert('Failed to send feedback surveys. Please try again.');
    } finally {
      setSendingFeedback(false);
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

    // Feedback sent filter
    const matchesFeedbackSent =
      filterFeedbackSent === 'all' ||
      (filterFeedbackSent === 'sent' && sub.feedback_sent_at !== null) ||
      (filterFeedbackSent === 'not_sent' && sub.feedback_sent_at === null);

    // Days since last feedback sent filter
    let matchesDaysSinceSent = true;
    if (filterMinDaysSinceSent > 0) {
      if (sub.feedback_sent_at === null) {
        // Never sent = passes filter (can send now)
        matchesDaysSinceSent = true;
      } else {
        const daysSinceSent = Math.floor(
          (new Date().getTime() - new Date(sub.feedback_sent_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        matchesDaysSinceSent = daysSinceSent >= filterMinDaysSinceSent;
      }
    }

    return matchesSearch && matchesMinDays && matchesFeedbackSent && matchesDaysSinceSent;
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
            <div className="p-4 bg-black border border-[#cc00ff]">
              <div className="text-2xl font-black text-[#cc00ff]">{statistics.feedbackSent}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">📧 Feedback Sent</div>
            </div>
            <div className="p-4 bg-black border border-[#ffaa00]">
              <div className="text-2xl font-black text-[#ffaa00]">{statistics.feedbackNotSent}</div>
              <div className="text-xs text-gray-500 uppercase font-bold">⏳ Not Sent Yet</div>
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

            <select
              value={filterFeedbackSent}
              onChange={(e) => setFilterFeedbackSent(e.target.value as any)}
              className="px-4 py-2 bg-black border border-gray-800 text-white text-sm font-bold uppercase focus:border-[#00ff88] focus:outline-none"
            >
              <option value="all">All Feedback</option>
              <option value="not_sent">📧 Not Sent</option>
              <option value="sent">✅ Already Sent</option>
            </select>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-bold uppercase whitespace-nowrap">Subscribed ≥</label>
              <input
                type="number"
                min="0"
                value={filterMinDays}
                onChange={(e) => setFilterMinDays(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 bg-black border border-gray-800 text-white text-sm font-bold focus:border-[#00ff88] focus:outline-none"
                placeholder="0"
              />
              <span className="text-xs text-gray-500">days</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-bold uppercase whitespace-nowrap">Last sent ≥</label>
              <input
                type="number"
                min="0"
                value={filterMinDaysSinceSent}
                onChange={(e) => setFilterMinDaysSinceSent(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 bg-black border border-gray-800 text-white text-sm font-bold focus:border-[#00ff88] focus:outline-none"
                placeholder="0"
                title="Only show users who received feedback ≥ X days ago (or never)"
              />
              <span className="text-xs text-gray-500">days ago</span>
            </div>

            <button
              onClick={() => setShowSendFeedbackModal(true)}
              className="ml-auto px-6 py-2 bg-[#cc00ff] text-white text-xs font-bold uppercase hover:opacity-90 transition-opacity"
              title="Only sends to subscribed users"
            >
              📧 Send Feedback Survey
            </button>

            <button
              onClick={exportToCSV}
              className="px-6 py-2 bg-[#00ff88] text-black text-xs font-bold uppercase hover:opacity-90 transition-opacity"
            >
              Export CSV
            </button>
          </div>
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
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Language</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Welcomed</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Last Sent</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Age</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase text-gray-500">Created</th>
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
                    <td className="px-4 py-3">
                      {subscriber.feedback_sent_at ? (
                        <span
                          className="text-[#cc00ff] text-xs font-bold"
                          title={`Last sent: ${new Date(subscriber.feedback_sent_at).toLocaleString()}`}
                        >
                          {Math.floor((new Date().getTime() - new Date(subscriber.feedback_sent_at).getTime()) / (1000 * 60 * 60 * 24))}d ago
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {Math.floor((new Date().getTime() - new Date(subscriber.created_at).getTime()) / (1000 * 60 * 60 * 24))}d
                    </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(subscriber.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Send Feedback Survey Modal */}
        {showSendFeedbackModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black border-2 border-[#cc00ff] max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black text-white uppercase">Send Feedback Survey</h3>
                <button
                  onClick={handleCloseFeedbackModal}
                  disabled={sendingFeedback}
                  className="text-gray-400 hover:text-white text-2xl leading-none disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#cc00ff10] border border-[#cc00ff]">
                  <p className="text-sm text-gray-300 mb-2">
                    Send a feedback survey email to your subscribers.
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Each subscriber will receive the email in their preferred language (EN/ES) with one-click buttons to rate the newsletter.
                  </p>
                  <p className="text-xs text-[#00ff88] font-bold">
                    ✓ Only sends to active subscribers (unsubscribed users are automatically excluded)
                  </p>
                </div>

                {/* Test Email Section */}
                <div className="p-4 bg-[#00cfff10] border border-[#00cfff]">
                  <label className="block text-xs text-[#00cfff] mb-2 uppercase font-bold">
                    🧪 Test First (Recommended)
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Send a test email to yourself before sending to all subscribers.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your-email@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      disabled={sendingFeedback}
                      className="flex-1 px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#00cfff] focus:outline-none text-sm disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendTestEmail}
                      disabled={sendingFeedback || !testEmail.trim()}
                      className="px-4 py-2 bg-[#00cfff] text-black font-bold text-xs uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Send Test
                    </button>
                  </div>
                </div>

                {/* Selection Info */}
                {selectedSubscribers.size > 0 ? (
                  <div className="p-4 bg-[#00ff8810] border border-[#00ff88]">
                    <p className="text-white font-bold mb-2 text-sm">
                      ✓ {selectedSubscribers.size} subscriber{selectedSubscribers.size !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      The feedback survey will be sent only to the selected subscribers. Each will receive the email in their preferred language.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSubscribers(new Set());
                      }}
                      className="text-xs text-gray-400 hover:text-white uppercase font-bold transition-colors underline"
                    >
                      Clear selection and use language filter instead
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2 uppercase font-bold">
                        Language Filter
                      </label>
                      <select
                        value={sendFeedbackLang}
                        onChange={(e) => setSendFeedbackLang(e.target.value as 'all' | 'en' | 'es')}
                        disabled={sendingFeedback}
                        className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#cc00ff] focus:outline-none text-sm font-bold uppercase disabled:opacity-50"
                      >
                        <option value="all">All Languages</option>
                        <option value="en">English Only</option>
                        <option value="es">Spanish Only</option>
                      </select>
                    </div>

                    {statistics && (
                      <div className="p-3 bg-gray-900 border border-gray-800 text-sm">
                        <p className="text-gray-400">
                          Will send to approximately{' '}
                          <span className="font-bold text-white">
                            {sendFeedbackLang === 'all'
                              ? statistics.subscribed
                              : sendFeedbackLang === 'en'
                              ? statistics.en
                              : statistics.es}
                          </span>{' '}
                          active subscribers
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleSendFeedbackSurvey}
                    disabled={sendingFeedback}
                    className="flex-1 px-4 py-2 bg-[#cc00ff] text-white font-bold text-sm uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingFeedback ? 'Sending...' : 'Send Survey'}
                  </button>
                  <button
                    onClick={handleCloseFeedbackModal}
                    disabled={sendingFeedback}
                    className="px-4 py-2 border border-gray-700 text-gray-300 font-bold text-sm uppercase hover:border-white hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </AdminPageWrapper>
  );
}
