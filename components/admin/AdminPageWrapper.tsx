'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

type AdminPageWrapperProps = {
  children: ReactNode;
  showLogout?: boolean;
  title?: string;
  description?: string;
};

export default function AdminPageWrapper({
  children,
  title,
  description,
}: AdminPageWrapperProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <AdminSidebar
        currentPath={pathname}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} ml-0`}>
        {/* Mobile header with hamburger */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#0a0a0a] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {title && <h2 className="text-lg font-black text-white">{title}</h2>}
          <div className="w-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {(title || description) && (
            <div className="mb-8 hidden lg:block">
              {title && <h2 className="text-3xl font-black text-white mb-2">{title}</h2>}
              {description && <p className="text-gray-400 text-sm">{description}</p>}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
