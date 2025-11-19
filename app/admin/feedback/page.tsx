'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

type Feedback = {
  id: string;
  subscriber_email: string;
  feedback_type: 'very_useful' | 'useful' | 'not_useful' | null;
  campaign_date: string;
  responded_at: string | null;
  answered_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
};

type Stats = {
  total: number;
  answered: number;
  unanswered: number;
  byType: {
    very_useful: number;
    useful: number;
    not_useful: number;
  };
};

export default function FeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'answered' | 'unanswered'>('unanswered');
  const [filterType, setFilterType] = useState<'all' | 'very_useful' | 'useful' | 'not_useful'>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Campaign modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignLang, setCampaignLang] = useState<'all' | 'en' | 'es'>('all');
  const [minDaysSubscribed, setMinDaysSubscribed] = useState<number>(0);
  const [excludeRecentFeedback, setExcludeRecentFeedback] = useState<number>(30);
  const [testEmail, setTestEmail] = useState('');

  // Preview and selection state
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewSubscribers, setPreviewSubscribers] = useState<any[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [excludeAlreadySurveyed, setExcludeAlreadySurveyed] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterType, filterDate]);

  async function checkAuthAndFetch() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterDate) params.append('date', filterDate);

      const response = await fetch(`/api/admin/feedback?${params.toString()}`);

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      setFeedback(data.feedback || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      alert('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }

  async function toggleAnswered(id: string, currentlyAnswered: boolean) {
    setUpdatingId(id);
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, answered: !currentlyAnswered }),
      });

      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }

      // Refresh data
      await checkAuthAndFetch();
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback status');
    } finally {
      setUpdatingId(null);
    }
  }

  async function fetchCampaignPreview() {
    setLoadingPreview(true);
    try {
      const params = new URLSearchParams({
        lang: campaignLang,
        minDaysSubscribed: minDaysSubscribed.toString(),
        excludeRecentFeedbackDays: excludeRecentFeedback.toString(),
      });

      const response = await fetch(`/api/newsletter/feedback/preview?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch preview');
      }

      const data = await response.json();
      setPreviewSubscribers(data.subscribers || []);
      // Select all by default
      setSelectedEmails(new Set(data.subscribers.map((s: any) => s.email)));
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching preview:', error);
      alert('Failed to load preview. Please try again.');
    } finally {
      setLoadingPreview(false);
    }
  }

  function toggleSelectEmail(email: string) {
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(email)) {
        newSet.delete(email);
      } else {
        newSet.add(email);
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    const eligibleSubscribers = excludeAlreadySurveyed
      ? previewSubscribers.filter(s => (s.feedbackCount || 0) === 0)
      : previewSubscribers;

    if (selectedEmails.size === eligibleSubscribers.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(eligibleSubscribers.map(s => s.email)));
    }
  }

  function toggleExcludeAlreadySurveyed() {
    const newValue = !excludeAlreadySurveyed;
    setExcludeAlreadySurveyed(newValue);

    if (newValue) {
      // Remove already surveyed subscribers from selection
      const neverSurveyedEmails = new Set(
        previewSubscribers
          .filter(s => (s.feedbackCount || 0) === 0)
          .map(s => s.email)
      );
      setSelectedEmails(prev => {
        const newSet = new Set<string>();
        prev.forEach(email => {
          if (neverSurveyedEmails.has(email)) {
            newSet.add(email);
          }
        });
        return newSet;
      });
    }
  }

  async function handleSendTestEmail() {
    if (!testEmail.trim()) {
      alert('Please enter a test email address');
      return;
    }

    if (!testEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setSendingCampaign(true);

    try {
      const response = await fetch('/api/newsletter/feedback/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          campaignDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      alert(`Test email sent successfully to ${testEmail}!\n\nCheck your inbox to preview the feedback survey.`);
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email. Please try again.');
    } finally {
      setSendingCampaign(false);
    }
  }

  async function handleSendCampaign() {
    if (selectedEmails.size === 0) {
      alert('No subscribers selected. Please select at least one subscriber.');
      return;
    }

    const confirmMessage = `Are you sure you want to send feedback surveys to ${selectedEmails.size} selected subscriber${selectedEmails.size !== 1 ? 's' : ''}?\n\n` +
      `Each subscriber will receive the email in their preferred language.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setSendingCampaign(true);

    try {
      const requestBody: any = {
        campaignDate: new Date().toISOString().split('T')[0],
        selectedEmails: Array.from(selectedEmails),
      };

      const response = await fetch('/api/newsletter/feedback/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to send campaign');
      }

      const data = await response.json();

      alert(
        `Feedback campaign sent successfully!\n\n` +
        `Total: ${data.results.total}\n` +
        `Sent: ${data.results.sent}\n` +
        `Failed: ${data.results.failed}`
      );

      setShowCampaignModal(false);
      setShowPreview(false);
      setPreviewSubscribers([]);
      setSelectedEmails(new Set());
      await checkAuthAndFetch();
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign. Please try again.');
    } finally {
      setSendingCampaign(false);
    }
  }

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.subscriber_email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getFeedbackIcon = (type: string | null) => {
    if (!type) return '○';
    switch (type) {
      case 'very_useful': return '😍';
      case 'useful': return '👍';
      case 'not_useful': return '👎';
      default: return '•';
    }
  };

  const getFeedbackLabel = (type: string | null) => {
    if (!type) return 'No response yet';
    switch (type) {
      case 'very_useful': return 'Very Useful';
      case 'useful': return 'Useful';
      case 'not_useful': return 'Not Useful';
      default: return type;
    }
  };

  const getFeedbackColor = (type: string | null) => {
    if (!type) return 'text-gray-600';
    switch (type) {
      case 'very_useful': return 'text-[#00ff88]';
      case 'useful': return 'text-[#00cfff]';
      case 'not_useful': return 'text-[#ff0055]';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminPageWrapper showLogout={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-[#00ff88]">Loading feedback...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      showLogout={false}
      title="Newsletter Feedback"
      description="Manage and track subscriber feedback responses"
    >

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCampaignModal(true)}
            className="px-6 py-3 bg-[#cc00ff] text-white text-sm font-bold uppercase hover:opacity-90 transition-opacity"
          >
            📧 Send Feedback Campaign
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-black border border-gray-800 p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Total</div>
              <div className="text-3xl font-black text-white">{stats.total}</div>
            </div>
            <div className="bg-black border border-[#00ff88] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Answered</div>
              <div className="text-3xl font-black text-[#00ff88]">{stats.answered}</div>
            </div>
            <div className="bg-black border border-[#ff0055] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">Unanswered</div>
              <div className="text-3xl font-black text-[#ff0055]">{stats.unanswered}</div>
            </div>
            <div className="bg-black border border-[#00ff88] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">😍 Very Useful</div>
              <div className="text-3xl font-black text-[#00ff88]">{stats.byType.very_useful}</div>
            </div>
            <div className="bg-black border border-[#00cfff] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">👍 Useful</div>
              <div className="text-3xl font-black text-[#00cfff]">{stats.byType.useful}</div>
            </div>
            <div className="bg-black border border-[#ff0055] p-4">
              <div className="text-gray-500 text-xs font-bold uppercase mb-2">👎 Not Useful</div>
              <div className="text-3xl font-black text-[#ff0055]">{stats.byType.not_useful}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-black border border-gray-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-500 font-bold uppercase mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:border-[#00ff88]"
              >
                <option value="all">All</option>
                <option value="unanswered">Unanswered</option>
                <option value="answered">Answered</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm text-gray-500 font-bold uppercase mb-2">Feedback Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:border-[#00ff88]"
              >
                <option value="all">All Types</option>
                <option value="very_useful">😍 Very Useful</option>
                <option value="useful">👍 Useful</option>
                <option value="not_useful">👎 Not Useful</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm text-gray-500 font-bold uppercase mb-2">Campaign Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm text-gray-500 font-bold uppercase mb-2">Search Email</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email..."
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:border-[#00ff88] placeholder-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-black border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Responded
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredFeedback.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No feedback found with current filters
                    </td>
                  </tr>
                ) : (
                  filteredFeedback.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#0a0a0a] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm text-gray-300">
                          {item.subscriber_email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${getFeedbackColor(item.feedback_type)}`}>
                          {getFeedbackIcon(item.feedback_type)} {getFeedbackLabel(item.feedback_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {formatDate(item.campaign_date)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {item.responded_at ? formatDateTime(item.responded_at) : (
                          <span className="text-gray-600">Not responded</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.answered_at ? (
                          <div>
                            <span className="text-[#00ff88] font-bold">✓ Answered</span>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatDateTime(item.answered_at)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#ff0055] font-bold">⚠ Unanswered</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAnswered(item.id, !!item.answered_at)}
                            disabled={updatingId === item.id}
                            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${
                              updatingId === item.id
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : item.answered_at
                                ? 'bg-[#0a0a0a] border border-gray-700 text-gray-400 hover:border-[#ff0055] hover:text-[#ff0055]'
                                : 'bg-[#00ff88] text-black hover:bg-[#00dd77]'
                            }`}
                          >
                            {updatingId === item.id
                              ? 'Updating...'
                              : item.answered_at
                              ? 'Mark Unanswered'
                              : 'Mark Answered'}
                          </button>
                          <a
                            href={`mailto:${item.subscriber_email}?subject=Re:%20Newsletter%20Feedback`}
                            className="px-3 py-1 text-xs font-bold uppercase bg-[#0a0a0a] border border-gray-700 text-gray-400 hover:border-[#00cfff] hover:text-[#00cfff] transition-all"
                          >
                            Email
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total count */}
        <div className="mt-4 text-gray-500 text-sm">
          Showing {filteredFeedback.length} of {feedback.length} feedback responses
        </div>

        {/* Campaign Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black border-2 border-[#cc00ff] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase">Send Feedback Campaign</h3>
                  <p className="text-sm text-gray-500 mt-1">Target subscribers with advanced filters</p>
                </div>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  disabled={sendingCampaign}
                  className="text-gray-400 hover:text-white text-2xl leading-none disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Info Box */}
                <div className="p-4 bg-[#cc00ff10] border border-[#cc00ff]">
                  <p className="text-sm text-gray-300 mb-2">
                    Send feedback surveys to your subscribers with advanced targeting options.
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
                      disabled={sendingCampaign}
                      className="flex-1 px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#00cfff] focus:outline-none text-sm disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendTestEmail}
                      disabled={sendingCampaign || !testEmail.trim()}
                      className="px-4 py-2 bg-[#00cfff] text-black font-bold text-xs uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Send Test
                    </button>
                  </div>
                </div>

                {/* Show preview or filters */}
                {!showPreview ? (
                  <>
                    {/* Campaign Filters */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase">Campaign Targeting</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Language Filter */}
                        <div>
                          <label className="block text-xs text-gray-500 font-bold uppercase mb-2">
                            Language
                          </label>
                          <select
                            value={campaignLang}
                            onChange={(e) => setCampaignLang(e.target.value as 'all' | 'en' | 'es')}
                            disabled={sendingCampaign}
                            className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#cc00ff] focus:outline-none text-sm font-bold uppercase disabled:opacity-50"
                          >
                            <option value="all">All Languages</option>
                            <option value="en">English Only</option>
                            <option value="es">Spanish Only</option>
                          </select>
                          <p className="text-xs text-gray-600 mt-1">Target subscribers by their preferred language</p>
                        </div>

                        {/* Min Days Subscribed */}
                        <div>
                          <label className="block text-xs text-gray-500 font-bold uppercase mb-2">
                            Min Days Subscribed
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={minDaysSubscribed}
                            onChange={(e) => setMinDaysSubscribed(parseInt(e.target.value) || 0)}
                            disabled={sendingCampaign}
                            className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#cc00ff] focus:outline-none text-sm font-bold disabled:opacity-50"
                            placeholder="0"
                          />
                          <p className="text-xs text-gray-600 mt-1">Only send to subscribers who joined {minDaysSubscribed || 0}+ days ago</p>
                        </div>

                        {/* Exclude Recent Feedback */}
                        <div>
                          <label className="block text-xs text-gray-500 font-bold uppercase mb-2">
                            Exclude Recent Feedback (Days)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={excludeRecentFeedback}
                            onChange={(e) => setExcludeRecentFeedback(parseInt(e.target.value) || 0)}
                            disabled={sendingCampaign}
                            className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#cc00ff] focus:outline-none text-sm font-bold disabled:opacity-50"
                            placeholder="30"
                          />
                          <p className="text-xs text-gray-600 mt-1">Don't send to subscribers who received feedback in the last {excludeRecentFeedback} days</p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-gray-900 border border-gray-800">
                      <h4 className="text-sm font-bold text-white uppercase mb-3">Campaign Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Language:</span>
                          <span className="text-white font-bold">{campaignLang === 'all' ? 'All Languages' : campaignLang.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Min tenure:</span>
                          <span className="text-white font-bold">{minDaysSubscribed} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Exclude recent:</span>
                          <span className="text-white font-bold">{excludeRecentFeedback} days</span>
                        </div>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <button
                      onClick={fetchCampaignPreview}
                      disabled={loadingPreview}
                      className="w-full px-4 py-3 bg-[#00ff88] text-black font-bold text-sm uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingPreview ? 'Loading...' : '👁️ Preview Recipients'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Subscriber Preview List */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white uppercase">
                          Recipients ({selectedEmails.size} of {previewSubscribers.length} selected)
                        </h4>
                        <button
                          onClick={() => setShowPreview(false)}
                          className="text-xs text-gray-400 hover:text-white uppercase font-bold"
                        >
                          ← Back to Filters
                        </button>
                      </div>

                      {/* Quick Filters */}
                      <div className="flex gap-2">
                        <button
                          onClick={toggleExcludeAlreadySurveyed}
                          className={`flex-1 px-4 py-2 text-xs font-bold uppercase transition-all ${
                            excludeAlreadySurveyed
                              ? 'bg-[#00ff88] text-black border border-[#00ff88]'
                              : 'bg-black text-gray-400 border border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          {excludeAlreadySurveyed ? '✓ ' : ''}Exclude Already Surveyed
                        </button>
                        {excludeAlreadySurveyed && (
                          <div className="px-4 py-2 bg-[#00ff8810] border border-[#00ff88] text-xs text-[#00ff88] font-bold">
                            {previewSubscribers.filter(s => (s.feedbackCount || 0) === 0).length} never surveyed
                          </div>
                        )}
                      </div>

                      {previewSubscribers.length === 0 ? (
                        <div className="p-8 text-center border border-gray-800 bg-gray-900">
                          <p className="text-gray-500">No subscribers match your filters</p>
                        </div>
                      ) : (
                        <>
                          {/* Select All */}
                          <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800">
                            <input
                              type="checkbox"
                              checked={selectedEmails.size === previewSubscribers.length && previewSubscribers.length > 0}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] cursor-pointer"
                            />
                            <span className="text-sm font-bold text-white uppercase">Select All</span>
                          </div>

                          {/* Subscriber List */}
                          <div className="max-h-96 overflow-y-auto border border-gray-800 bg-black">
                            {previewSubscribers.map((subscriber) => {
                              const feedbackCount = subscriber.feedbackCount || 0;
                              const daysSince = subscriber.daysSinceLastFeedback;
                              const isExcluded = excludeAlreadySurveyed && feedbackCount > 0;

                              return (
                                <div
                                  key={subscriber.email}
                                  className={`flex items-center gap-3 p-3 border-b border-gray-800 transition-colors ${
                                    isExcluded
                                      ? 'opacity-40 bg-gray-900'
                                      : selectedEmails.has(subscriber.email)
                                      ? 'bg-[#00ff8808] hover:bg-[#00ff8812]'
                                      : 'hover:bg-gray-900'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedEmails.has(subscriber.email)}
                                    onChange={() => toggleSelectEmail(subscriber.email)}
                                    disabled={isExcluded}
                                    className="w-4 h-4 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-white font-medium truncate">{subscriber.email}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                      <span>{subscriber.lang.toUpperCase()}</span>
                                      <span>•</span>
                                      <span>Joined {Math.floor((new Date().getTime() - new Date(subscriber.created_at).getTime()) / (1000 * 60 * 60 * 24))}d ago</span>
                                      <span>•</span>
                                      <span className={`font-bold ${
                                        feedbackCount === 0 ? 'text-[#00ff88]' :
                                        feedbackCount === 1 ? 'text-[#00cfff]' :
                                        feedbackCount === 2 ? 'text-[#ffaa00]' :
                                        'text-[#ff0055]'
                                      }`}>
                                        {feedbackCount === 0 ? 'Never surveyed' :
                                         feedbackCount === 1 ? '1 survey' :
                                         `${feedbackCount} surveys`}
                                      </span>
                                      {daysSince !== null && (
                                        <>
                                          <span>•</span>
                                          <span className="text-[#cc00ff]">Last {daysSince}d ago</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {feedbackCount >= 3 && (
                                    <span
                                      className="px-2 py-1 text-xs font-bold bg-[#ff005520] text-[#ff0055] border border-[#ff0055] rounded"
                                      title="This subscriber has received many surveys"
                                    >
                                      HIGH
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={handleSendCampaign}
                      disabled={sendingCampaign || selectedEmails.size === 0}
                      className="w-full px-4 py-3 bg-[#cc00ff] text-white font-bold text-sm uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingCampaign ? 'Sending...' : `Send to ${selectedEmails.size} Subscriber${selectedEmails.size !== 1 ? 's' : ''}`}
                    </button>
                  </>
                )}

                {/* Cancel Button (always show) */}
                <button
                  onClick={() => {
                    setShowCampaignModal(false);
                    setShowPreview(false);
                    setPreviewSubscribers([]);
                    setSelectedEmails(new Set());
                  }}
                  disabled={sendingCampaign}
                  className="w-full px-4 py-3 border border-gray-700 text-gray-300 font-bold text-sm uppercase hover:border-white hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminPageWrapper>
  );
}
