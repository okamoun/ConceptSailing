'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import type { AdminPermission } from '@/lib/userManagement';

interface AdminGuardProps {
  children: ReactNode;
  permission?: AdminPermission;
}

export default function AdminGuard({ children, permission }: AdminGuardProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (userProfile?.role !== 'admin') { router.replace('/login'); return; }
  }, [loading, user, userProfile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-200 text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'admin') return null;

  if (permission && !userProfile.permissions.includes(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <p className="text-white font-semibold text-lg">Access denied</p>
          <p className="text-blue-300 text-sm">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
