'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'blogger';
  is_active: boolean;
  linkedin_url?: string;
  twitter_url?: string;
  created_at: string;
};

type EditingUser = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'blogger';
  linkedin_url?: string;
  twitter_url?: string;
};

export default function UsersManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

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

  const handleRoleChange = async (userId: string, newRole: 'owner' | 'admin' | 'blogger') => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `User role changed to ${newRole} successfully`,
        });
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to change role' });
      }
    } catch (error) {
      console.error('Error changing role:', error);
      setMessage({ type: 'error', text: 'Failed to change role' });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      linkedin_url: user.linkedin_url,
      twitter_url: user.twitter_url,
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          linkedin_url: editingUser.linkedin_url,
          twitter_url: editingUser.twitter_url,
        }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'User details updated successfully',
        });
        setEditingUser(null);
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
              <Link href="/admin/subscribers" className="text-sm text-gray-400 font-bold uppercase hover:text-[#00ff88] transition-colors">
                Subscribers
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

        {/* Role Permissions Info */}
        <div className="mb-6">
          <button
            onClick={() => setShowRoleInfo(!showRoleInfo)}
            className="w-full p-4 bg-[#00cfff10] border border-[#00cfff] text-left flex justify-between items-center hover:bg-[#00cfff15] transition-colors"
          >
            <div>
              <p className="text-[#00cfff] font-bold text-sm">Role Permissions & Guidelines</p>
              <p className="text-gray-500 text-xs mt-1">Click to {showRoleInfo ? 'hide' : 'view'} detailed role information</p>
            </div>
            <span className="text-[#00cfff] text-xl">{showRoleInfo ? '−' : '+'}</span>
          </button>

          {showRoleInfo && (
            <div className="border border-gray-800 border-t-0 p-4 bg-black">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Owner Role */}
                <div className="p-4 border border-[#ff0055] bg-[#ff005510]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-bold uppercase bg-[#ff0055] text-white">
                      OWNER
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-3 font-bold">Full system access</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Manage all users</li>
                    <li>✓ Change user roles</li>
                    <li>✓ Create, edit, publish posts</li>
                    <li>✓ Delete any post</li>
                    <li>✓ Manage live events</li>
                    <li>✓ All admin capabilities</li>
                  </ul>
                </div>

                {/* Admin Role */}
                <div className="p-4 border border-[#00cfff] bg-[#00cfff10]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-bold uppercase bg-[#00cfff] text-black">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-3 font-bold">Content management</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Create, edit, publish posts</li>
                    <li>✓ Manage live events</li>
                    <li>✓ View all users</li>
                    <li>✗ Cannot change roles</li>
                    <li>✗ Cannot delete posts</li>
                    <li>✗ Cannot manage users</li>
                  </ul>
                </div>

                {/* Blogger Role */}
                <div className="p-4 border border-[#00ff88] bg-[#00ff8810]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-bold uppercase bg-[#00ff88] text-black">
                      BLOGGER
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-3 font-bold">Content creation only</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Create draft posts</li>
                    <li>✓ Edit own posts</li>
                    <li>✗ Cannot publish</li>
                    <li>✗ Cannot delete</li>
                    <li>✗ No admin access</li>
                    <li>✗ Requires activation</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-900 border border-gray-800">
                <p className="text-xs text-gray-400">
                  <span className="font-bold text-gray-300">Note:</span> New signups are automatically assigned the <span className="text-[#00ff88]">Blogger</span> role and require owner activation.
                  Only <span className="text-[#ff0055]">Owner</span> can change user roles. You cannot change your own role.
                </p>
              </div>
            </div>
          )}
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
                    {/* Status Badge */}
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
                    </div>

                    {/* User Info */}
                    <h3 className="text-lg font-black text-white mb-2">{user.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{user.email}</p>

                    {/* Role Selector */}
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Role</label>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'owner' | 'admin' | 'blogger')}
                        className="px-3 py-1 text-xs border border-gray-700 bg-black font-bold uppercase"
                        style={{
                          color: user.role === 'owner' ? '#ff0055' : user.role === 'admin' ? '#00cfff' : '#00ff88'
                        }}
                      >
                        <option value="owner" style={{ color: '#ff0055' }}>OWNER</option>
                        <option value="admin" style={{ color: '#00cfff' }}>ADMIN</option>
                        <option value="blogger" style={{ color: '#00ff88' }}>BLOGGER</option>
                      </select>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-600">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="px-4 py-2 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-[#00cfff] hover:text-[#00cfff] transition-all"
                    >
                      Edit Details
                    </button>
                    {user.role !== 'owner' && (
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
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black border-2 border-[#00cfff] max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black text-white uppercase">Edit User</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase font-bold">Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#00cfff] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase font-bold">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#00cfff] focus:outline-none text-sm"
                  />
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-500 mb-3 uppercase font-bold">Social Media Profiles (for blog sharing)</p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2 uppercase font-bold">LinkedIn URL</label>
                      <input
                        type="url"
                        value={editingUser.linkedin_url || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, linkedin_url: e.target.value })}
                        placeholder="https://www.linkedin.com/in/your-profile/"
                        className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#00cfff] focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2 uppercase font-bold">Twitter URL</label>
                      <input
                        type="url"
                        value={editingUser.twitter_url || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, twitter_url: e.target.value })}
                        placeholder="https://twitter.com/your-handle"
                        className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#00cfff] focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleSaveUser}
                    className="flex-1 px-4 py-2 bg-[#00cfff] text-black font-bold text-sm uppercase hover:opacity-90 transition-opacity"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-gray-700 text-gray-300 font-bold text-sm uppercase hover:border-white hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
