'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type NavItem = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    isActive: (pathname) => pathname === '/admin',
  },
  {
    href: '/admin/blog',
    label: 'Blog',
    isActive: (pathname) => pathname.startsWith('/admin/blog'),
  },
  {
    href: '/admin/images',
    label: 'Images',
    isActive: (pathname) => pathname === '/admin/images',
  },
  {
    href: '/admin/subscribers',
    label: 'Subscribers',
    isActive: (pathname) => pathname === '/admin/subscribers',
  },
  {
    href: '/admin/feedback',
    label: 'Feedback',
    isActive: (pathname) => pathname === '/admin/feedback',
  },
  {
    href: '/admin/users',
    label: 'Users',
    isActive: (pathname) => pathname === '/admin/users',
  },
];

type AdminHeaderProps = {
  showLogout?: boolean;
};

type UserInfo = {
  email: string;
  role: 'owner' | 'admin' | 'blogger';
};

export default function AdminHeader({ showLogout = true }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-[#10b981] text-black';
      case 'admin':
        return 'bg-[#10b981]/80 text-black';
      case 'blogger':
        return 'bg-[#10b981]/60 text-black';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  return (
    <div className="border-b border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black text-white">ADMIN</h1>
          <nav className="hidden md:flex gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive = item.isActive(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-bold uppercase hover:text-[#10b981] transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {userInfo && (
            <div className="hidden md:flex flex-col items-end gap-1">
              <div className="text-xs text-gray-400">{userInfo.email}</div>
              <span className={`px-2 py-0.5 text-xs font-bold uppercase ${getRoleBadgeColor(userInfo.role)}`}>
                {userInfo.role}
              </span>
            </div>
          )}
          <Link
            href="/"
            className="px-4 py-2 text-xs border border-gray-700 text-gray-300 font-bold uppercase hover:border-white hover:text-white transition-all"
          >
            View Site
          </Link>
          {showLogout && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs border border-gray-700 text-gray-400 font-bold uppercase hover:border-[#10b981] hover:text-[#10b981] transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
