'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

type AdminPageWrapperProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export default function AdminPageWrapper({
  children,
  title,
  description,
  actions,
}: AdminPageWrapperProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="admin-shell flex min-h-screen bg-[#e3e9f1] text-slate-900">
      <AdminSidebar
        currentPath={pathname}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {isMobileMenuOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-900/45 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} ml-0`}>
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : <span />}
            <div className="h-10 w-10" />
          </div>
        </div>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {title || description || actions ? (
            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  {title ? <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1> : null}
                  {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
                </div>
                {actions ? <div className="shrink-0">{actions}</div> : null}
              </div>
            </section>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}
