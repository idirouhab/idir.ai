'use client';

import { ReactNode } from 'react';
import AdminHeader from './AdminHeader';

type AdminPageWrapperProps = {
  children: ReactNode;
  showLogout?: boolean;
  title?: string;
  description?: string;
};

export default function AdminPageWrapper({
  children,
  showLogout = true,
  title,
  description,
}: AdminPageWrapperProps) {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <AdminHeader showLogout={showLogout} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {(title || description) && (
          <div className="mb-8">
            {title && <h2 className="text-3xl font-black text-white mb-2">{title}</h2>}
            {description && <p className="text-gray-400 text-sm">{description}</p>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
