'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'blogger';
  is_active: boolean;
  created_at: string;
};

export default function UsersManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (response.status === 403) {
        setMessage({ type: 'error', text: 'Access denied. Owner role required.' });
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to load users' });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update user' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage({ type: 'error', text: 'Failed to update user' });
    }
  };

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
              <Link href="/admin/users" className="text-sm text-white font-bold uppercase hover:text-[#00ff88] transition-colors">
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
          <h2 className="text-3xl font-black text-white mb-2">User Management</h2>
          <p className="text-gray-400 text-sm">Manage blogger accounts and permissions</p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 text-sm border ${
              message.type === 'success'
                ? 'border-[#00ff88] bg-[#00ff8810] text-[#00ff88]'
                : 'border-[#ff0055] bg-[#ff005510] text-[#ff0055]'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-4 bg-[#00cfff10] border border-[#00cfff]">
          <p className="text-[#00cfff] font-bold text-sm mb-2">How Blogger Accounts Work</p>
          <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
            <li>New blogger signups are inactive by default</li>
            <li>Activate accounts to allow bloggers to create draft posts</li>
            <li>Bloggers cannot publish posts - only owners can publish</li>
            <li>Review and publish blogger drafts from the Blog Management page</li>
          </ul>
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <div className="border border-gray-800 bg-black p-12 text-center">
            <div className="text-4xl mb-4 opacity-50">👥</div>
            <p className="text-lg text-gray-300 mb-2">No users found</p>
            <p className="text-sm text-gray-500">Users will appear here when they sign up</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="border bg-black p-5 hover:border-gray-700 transition-colors"
                style={{
                  borderColor: user.is_active ? '#00ff88' : '#333',
                }}
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2 py-1 text-xs font-bold uppercase ${
                          user.is_active
                            ? 'bg-[#00ff88] text-black'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {user.is_active ? '● Active' : '○ Inactive'}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-bold uppercase ${
                          user.role === 'owner'
                            ? 'bg-[#ff0055] text-white'
                            : 'bg-[#00cfff] text-black'
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    {/* User Info */}
                    <h3 className="text-lg font-black text-white mb-2">{user.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{user.email}</p>

                    {/* Metadata */}
                    <div className="text-xs text-gray-600">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {user.role === 'blogger' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`px-4 py-2 text-xs border font-bold uppercase transition-all ${
                          user.is_active
                            ? 'border-gray-700 text-gray-400 hover:border-[#ff0055] hover:text-[#ff0055]'
                            : 'border-gray-700 text-gray-300 hover:border-[#00ff88] hover:text-[#00ff88]'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
