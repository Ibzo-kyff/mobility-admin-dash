// components/auth/RoleGuard.tsx - VERSION SIMPLIFIÉE
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { hasRole, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false); // ← CRITIQUE

  useEffect(() => {
    if (isLoading || hasRedirected.current) return;
    
    if (!isAuthenticated) {
      hasRedirected.current = true;
      const callbackUrl = encodeURIComponent(window.location.pathname);
      router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
    } else if (!hasRole(allowedRoles) && user) {
      hasRedirected.current = true;
      const dashboardPath = `/dashboard/${user.role.toLowerCase()}`;
      router.replace(dashboardPath);
    }
  }, [isLoading, isAuthenticated, hasRole, allowedRoles, router, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}