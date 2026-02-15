'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  requiredRoles?: ('super_admin' | 'billing_admin')[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-10h8V3h-8v8z" />
      </svg>
    ),
  },
  {
    href: '/admin/blog',
    label: 'Blog',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H7a2 2 0 01-2-2V7m14 14a2 2 0 002-2V9a2 2 0 00-2-2h-5m0 0V3m0 4l-3-3m3 3l3-3" />
      </svg>
    ),
  },
  {
    href: '/admin/images',
    label: 'Images',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/admin/subscribers',
    label: 'Subscribers',
    requiredRoles: ['super_admin', 'billing_admin'],
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
  },
];

type UserInfo = {
  email: string;
  role: 'super_admin' | 'billing_admin' | null;
  name: string;
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
        if (!response.ok) return;
        const data = await response.json();
        const roles = data.user.roles || [];
        const role = roles.includes('super_admin')
          ? 'super_admin'
          : roles.includes('billing_admin')
            ? 'billing_admin'
            : null;

        setUserInfo({
          email: data.user.email,
          role,
          name: data.user.name || data.user.email,
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const visibleNavItems = useMemo(() => {
    if (!userInfo) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => {
      if (!item.requiredRoles) return true;
      return userInfo.role ? item.requiredRoles.includes(userInfo.role) : false;
    });
  }, [userInfo]);

  const isActive = (href: string) => (href === '/admin' ? currentPath === href : currentPath.startsWith(href));

  const roleLabel = userInfo?.role ? userInfo.role.replace('_', ' ') : 'editor';

  const navClass = (active: boolean, collapsed: boolean) =>
    [
      'group flex items-center rounded-xl border px-3 py-2.5 text-sm transition-colors',
      collapsed ? 'justify-center' : 'gap-3',
      active
        ? 'border-[#11b981]/30 bg-[#11b981]/10 text-[#0f766e]'
        : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ');

  return (
    <>
      <aside
        className={[
          'hidden lg:flex fixed left-0 top-0 h-screen flex-col border-r border-slate-200 bg-[#f5f7fb] transition-all duration-300 z-40',
          isCollapsed ? 'w-20' : 'w-72',
        ].join(' ')}
      >
        <div className="border-b border-slate-200 p-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'}`}>
            <Link href="/admin" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <Image src="/logo-idirai.png" alt="idir.ai" width={96} height={24} className="h-6 w-auto" />
              {!isCollapsed ? <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin</span> : null}
            </Link>
            {!isCollapsed ? (
              <button
                onClick={onToggleCollapse}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500"
                title="Collapse sidebar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : null}
          </div>

          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500"
              title="Expand sidebar"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : null}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className={navClass(active, isCollapsed)} title={isCollapsed ? item.label : undefined}>
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>
                {!isCollapsed ? <span className="font-medium">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        {userInfo ? (
          <div className="border-t border-slate-200 p-3">
            <div className={`rounded-xl border border-slate-200 bg-white p-3 ${isCollapsed ? 'text-center' : ''}`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {userInfo.email[0]?.toUpperCase()}
                </div>
                {!isCollapsed ? (
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-800">{userInfo.name}</div>
                    <div className="truncate text-[11px] uppercase tracking-wide text-slate-500">{roleLabel}</div>
                  </div>
                ) : null}
              </div>
              {!isCollapsed ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Link href="/" className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium text-slate-700 hover:bg-slate-50">
                    Site
                  </Link>
                  <Link href="/admin/login" className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium text-slate-700 hover:bg-slate-50">
                    Logout
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>

      <aside
        className={[
          'lg:hidden fixed left-0 top-0 z-40 h-screen w-72 border-r border-slate-200 bg-[#f5f7fb] transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <Link href="/admin" className="flex items-center gap-3" onClick={onCloseMobile}>
            <Image src="/logo-idirai.png" alt="idir.ai" width={96} height={24} className="h-6 w-auto" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin</span>
          </Link>
          <button onClick={onCloseMobile} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500" aria-label="Close menu">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onCloseMobile} className={navClass(active, false)}>
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {userInfo ? (
          <div className="border-t border-slate-200 p-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs font-semibold text-slate-800">{userInfo.name}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{roleLabel}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <Link href="/" onClick={onCloseMobile} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium text-slate-700 hover:bg-slate-50">
                  Site
                </Link>
                <Link href="/admin/login" onClick={onCloseMobile} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium text-slate-700 hover:bg-slate-50">
                  Logout
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
