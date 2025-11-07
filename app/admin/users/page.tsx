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
    <div className="min-h-screen py-12 px-6 lg:px-8" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-white mb-4">User Management</h1>
            <p className="text-gray-300">Manage blogger accounts and permissions</p>
          </div>
          <Link
            href="/admin"
            className="px-6 py-3 border-2 border-white text-white font-bold uppercase hover:bg-white hover:text-black transition-all"
          >
            Back to Dashboard
          </Link>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 border-2 ${
              message.type === 'success'
                ? 'border-[#00ff88] bg-[#00ff8820] text-[#00ff88]'
                : 'border-[#ff0055] bg-[#ff005520] text-[#ff0055]'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Info Box */}
        <div className="mb-8 p-6 bg-[#00cfff20] border-2 border-[#00cfff]">
          <p className="text-[#00cfff] font-bold mb-2">How Blogger Accounts Work</p>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>New blogger signups are inactive by default</li>
            <li>Activate accounts to allow bloggers to create draft posts</li>
            <li>Bloggers cannot publish posts - only owners can publish</li>
            <li>Review and publish blogger drafts from the Blog Management page</li>
          </ul>
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <div className="border-2 border-[#00cfff] bg-black p-12 text-center">
            <p className="text-2xl text-gray-300 mb-4">No users found</p>
            <p className="text-gray-500">Users will appear here when they sign up</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="border-2 bg-black p-6"
                style={{
                  borderColor: user.is_active ? '#00ff88' : '#666',
                }}
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`inline-block px-3 py-1 text-xs font-bold uppercase ${
                          user.is_active
                            ? 'bg-[#00ff88] text-black'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {user.is_active ? '● Active' : '○ Inactive'}
                      </div>
                      <div
                        className={`inline-block px-3 py-1 text-xs font-bold uppercase ${
                          user.role === 'owner'
                            ? 'bg-[#ff0055] text-white'
                            : 'bg-[#00cfff] text-black'
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </div>
                    </div>

                    {/* User Info */}
                    <h2 className="text-2xl font-black text-white mb-2">{user.name}</h2>
                    <p className="text-[#00cfff] mb-3">{user.email}</p>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {user.role === 'blogger' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`px-6 py-2 border-2 font-bold uppercase transition-all ${
                          user.is_active
                            ? 'border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055] hover:text-white'
                            : 'border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black'
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
