'use client';

import { type ReactNode } from 'react';
import AdminGuard from '../components/AdminGuard';
import AdminNav from './AdminNav';

const bg = {
  backgroundImage: `linear-gradient(rgba(30,58,138,0.5),rgba(59,130,246,0.6)),url('/images/boats/blueone/External_sailing.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen" style={bg}>
        <AdminNav />
        {/* pt-12 clears the fixed nav (h-12 = 48px) */}
        <div className="pt-12">
          {children}
        </div>
      </div>
    </AdminGuard>
  );
}
