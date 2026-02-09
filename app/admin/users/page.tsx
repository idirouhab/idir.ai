'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoreVertical, Pencil, Check, Ban } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

type User = {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  roles: Array<'super_admin' | 'billing_admin' | 'instructor' | 'student'>;
  is_active: boolean;
  linkedin_url?: string;
  twitter_url?: string;
  created_at: string;
};

type EditingUser = {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'billing_admin' | null;
};

export default function UsersManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const getPrimaryRole = (roles: User['roles']) =>
    roles.includes('super_admin')
      ? 'super_admin'
      : roles.includes('billing_admin')
        ? 'billing_admin'
        : null;

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (response.status === 403) {
        setMessage({ type: 'error', text: 'Access denied. Super admin role required.' });
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const normalizedUsers = (data.users || []).map((user: any) => ({
          ...user,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          roles: user.roles || [],
        }));
        setUsers(normalizedUsers);
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

  const handleRoleChange = async (userId: string, newRole: 'super_admin' | 'billing_admin') => {
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
      role: getPrimaryRole(user.roles),
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
      <AdminPageWrapper showLogout={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      showLogout={false}
      title="User Management"
      description="Manage admin accounts and permissions"
    >

        {message && (
          <div
            className={`mb-4 p-3 text-sm border ${
              message.type === 'success'
                ? 'border-[#11b981] bg-[#11b981]/10 text-[#11b981]'
                : 'border-red-500 bg-red-500/10 text-red-500'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Role Permissions Info */}
        <div className="mb-6">
          <button
            onClick={() => setShowRoleInfo(!showRoleInfo)}
            className="w-full p-4 bg-[#11b981]/10 border border-[#11b981] text-left flex justify-between items-center hover:bg-[#11b981]/15 transition-colors"
          >
            <div>
              <p className="text-[#11b981] font-bold text-sm">Role Permissions & Guidelines</p>
              <p className="text-gray-500 text-xs mt-1">Click to {showRoleInfo ? 'hide' : 'view'} detailed role information</p>
            </div>
            <span className="text-[#11b981] text-xl">{showRoleInfo ? '−' : '+'}</span>
          </button>

          {showRoleInfo && (
            <div className="border border-gray-800 border-t-0 p-4 bg-black">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Super Admin Role */}
                <div className="p-4 border border-[#11b981] bg-[#11b981]/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-bold uppercase bg-[#11b981] text-black">
                      SUPER ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-3 font-bold">Full system access</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Manage all users</li>
                    <li>✓ Change user roles</li>
                    <li>✓ Create, edit, publish posts</li>
                    <li>✓ Delete any post</li>
                    <li>✓ All admin capabilities</li>
                  </ul>
                </div>

                {/* Billing Admin Role */}
                <div className="p-4 border border-[#11b981]/70 bg-[#11b981]/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-bold uppercase bg-[#11b981]/80 text-black">
                      BILLING ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-3 font-bold">Content management</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ Create, edit, publish posts</li>
                    <li>✓ View all users</li>
                    <li>✗ Cannot change roles</li>
                    <li>✗ Cannot delete posts</li>
                    <li>✗ Cannot manage users</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-900 border border-gray-800">
                <p className="text-xs text-gray-400">
                  <span className="font-bold text-gray-300">Note:</span> New admin signups are assigned the <span className="text-[#11b981]">Billing Admin</span> role and require super admin activation.
                  Only <span className="text-[#11b981]">Super Admin</span> can change user roles. You cannot change your own role.
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
          <div className="bg-black border border-gray-800">
            {users.map((user, index) => (
              <div
                key={user.id}
                className={`p-3 hover:bg-[#0a0a0a] transition-colors ${index !== users.length - 1 ? 'border-b border-gray-800' : ''}`}
              >
                {(() => {
                  const primaryRole = getPrimaryRole(user.roles);
                  return (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-bold text-sm">{user.name}</span>
                      <span
                        className={`px-1.5 py-0.5 text-xs font-bold uppercase ${
                          user.is_active ? 'bg-[#11b981] text-black' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <span
                        className="px-1.5 py-0.5 text-xs font-bold uppercase"
                        style={{
                          backgroundColor: primaryRole === 'super_admin' ? 'rgba(16, 185, 129, 0.2)' : primaryRole === 'billing_admin' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                          color: '#11b981',
                          border: `1px solid ${primaryRole === 'super_admin' ? 'rgba(16, 185, 129, 0.5)' : primaryRole === 'billing_admin' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`
                        }}
                      >
                        {primaryRole || 'none'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={primaryRole || 'billing_admin'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'super_admin' | 'billing_admin')}
                      className="px-3 py-1 text-xs border border-gray-700 bg-black text-gray-300 font-bold uppercase hover:border-gray-500 focus:border-gray-500 focus:outline-none"
                      title="Change Role"
                    >
                      <option value="super_admin">SUPER ADMIN</option>
                      <option value="billing_admin">BILLING ADMIN</option>
                    </select>

                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                        className="px-2.5 py-1.5 border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-all"
                        title="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {actionMenuOpen === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 bg-black border border-gray-700 z-20 min-w-[140px]">
                            <button
                              onClick={() => {
                                setActionMenuOpen(null);
                                handleEditUser(user);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-300 font-bold uppercase hover:bg-[#0a0a0a] hover:text-[#11b981] transition-all"
                            >
                              <Pencil size={14} /> Edit
                            </button>

                            {primaryRole !== 'super_admin' && (
                              <button
                                onClick={() => {
                                  setActionMenuOpen(null);
                                  handleToggleStatus(user.id, user.is_active);
                                }}
                                className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left font-bold uppercase hover:bg-[#0a0a0a] transition-all border-t border-gray-800 ${
                                  user.is_active
                                    ? 'text-gray-400 hover:text-red-500'
                                    : 'text-gray-300 hover:text-[#11b981]'
                                }`}
                              >
                                {user.is_active ? (
                                  <>
                                    <Ban size={14} /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Check size={14} /> Activate
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black border-2 border-[#11b981] max-w-md w-full p-6">
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
                    className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#11b981] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase font-bold">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] text-white border border-gray-700 focus:border-[#11b981] focus:outline-none text-sm"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleSaveUser}
                    className="flex-1 px-4 py-2 bg-[#11b981] text-black font-bold text-sm uppercase hover:opacity-90 transition-opacity"
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
    </AdminPageWrapper>
  );
}
