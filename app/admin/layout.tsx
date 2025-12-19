import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Admin Panel - idir.ai',
  description: 'Manage content and settings',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
