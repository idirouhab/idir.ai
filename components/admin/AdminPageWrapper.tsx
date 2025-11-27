'use client';

import { ReactNode } from 'react';
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

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <AdminSidebar currentPath={pathname} />

      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {(title || description) && (
            <div className="mb-8">
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
