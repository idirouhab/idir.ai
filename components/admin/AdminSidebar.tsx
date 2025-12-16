'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/blog', label: 'Blog', icon: '📝' },
  { href: '/admin/images', label: 'Images', icon: '🖼️' },
  { href: '/admin/subscribers', label: 'Subscribers', icon: '📬' },
  { href: '/admin/feedback', label: 'Feedback', icon: '💬' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/courses', label: 'Courses', icon: '🎓' },
];

type UserInfo = {
  email: string;
  role: 'owner' | 'admin' | 'blogger';
};

type AdminSidebarProps = {
  currentPath: string;
};

export default function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            email: data.user.email,
            role: data.user.role,
          });
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUserInfo();
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'admin':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'blogger':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-700 text-white border-gray-600';
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-black text-sm">
            ID
          </div>
          <span className="text-lg font-black text-white">ADMIN</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all
                ${
                  active
                    ? 'text-white bg-gray-800/50 border-l-2 border-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border-l-2 border-transparent'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {userInfo && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {userInfo.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white font-medium truncate">
                {userInfo.email}
              </div>
              <div className={`text-xs px-1.5 py-0.5 rounded border inline-block mt-0.5 ${getRoleBadgeColor(userInfo.role)}`}>
                {userInfo.role}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 text-center px-3 py-2 text-xs border border-gray-700 text-gray-300 font-medium hover:border-gray-500 hover:text-white transition-all rounded"
            >
              View Site
            </Link>
            <Link
              href="/admin/login"
              className="flex-1 text-center px-3 py-2 text-xs border border-gray-700 text-gray-400 font-medium hover:border-red-500 hover:text-red-400 transition-all rounded"
            >
              Logout
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
