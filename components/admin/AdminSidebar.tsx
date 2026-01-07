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
  { href: '/admin/users', label: 'Users', icon: '👥' },
];

type UserInfo = {
  email: string;
  role: 'owner' | 'admin' | 'blogger';
};

type AdminSidebarProps = {
  currentPath: string;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

export default function AdminSidebar({
  currentPath,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
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
        return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50';
      case 'admin':
        return 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40';
      case 'blogger':
        return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30';
      default:
        return 'bg-gray-700 text-white border-gray-600';
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex fixed left-0 top-0 h-screen bg-[#0a0a0a] border-r border-gray-800 flex-col transition-all duration-300 z-40
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Logo and Toggle */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link href="/admin" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 bg-[#10b981] flex items-center justify-center text-black font-black text-sm flex-shrink-0">
              ID
            </div>
            {!isCollapsed && <span className="text-lg font-black text-white">ADMIN</span>}
          </Link>
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 hover:bg-gray-800 rounded transition-colors"
              title="Collapse sidebar"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="mx-2 mt-2 p-2 hover:bg-gray-800 rounded transition-colors"
            title="Expand sidebar"
          >
            <svg className="w-4 h-4 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 py-3 text-sm font-medium transition-all
                  ${isCollapsed ? 'px-4 justify-center' : 'px-6'}
                  ${
                    active
                      ? 'text-white bg-gray-800/50 border-l-2 border-[#10b981]'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border-l-2 border-transparent'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {userInfo && (
          <div className={`p-4 border-t border-gray-800 ${isCollapsed ? 'px-2' : ''}`}>
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold" title={userInfo.email}>
                  {userInfo.email[0].toUpperCase()}
                </div>
                <Link
                  href="/"
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  title="View Site"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
                <Link
                  href="/admin/login"
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Link>
              </div>
            ) : (
              <>
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
                    className="flex-1 text-center px-3 py-2 text-xs border border-gray-700 text-gray-300 font-medium hover:border-[#10b981] hover:text-[#10b981] transition-all rounded"
                  >
                    View Site
                  </Link>
                  <Link
                    href="/admin/login"
                    className="flex-1 text-center px-3 py-2 text-xs border border-gray-700 text-gray-400 font-medium hover:border-[#10b981] hover:text-[#10b981] transition-all rounded"
                  >
                    Logout
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <aside
        className={`
          lg:hidden fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col transition-transform duration-300 z-40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo and Close */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3" onClick={onCloseMobile}>
            <div className="w-8 h-8 bg-[#10b981] flex items-center justify-center text-black font-black text-sm">
              ID
            </div>
            <span className="text-lg font-black text-white">ADMIN</span>
          </Link>
          <button
            onClick={onCloseMobile}
            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`
                  flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all
                  ${
                    active
                      ? 'text-white bg-gray-800/50 border-l-2 border-[#10b981]'
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
                onClick={onCloseMobile}
                className="flex-1 text-center px-3 py-2 text-xs border border-gray-700 text-gray-300 font-medium hover:border-[#10b981] hover:text-[#10b981] transition-all rounded"
              >
                View Site
              </Link>
              <Link
                href="/admin/login"
                onClick={onCloseMobile}
                className="flex-1 text-center px-3 py-2 text-xs border border-gray-700 text-gray-400 font-medium hover:border-[#10b981] hover:text-[#10b981] transition-all rounded"
              >
                Logout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
