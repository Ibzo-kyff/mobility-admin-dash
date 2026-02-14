// hooks/useRole.ts
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import type { UserRole } from '@/types';

export function useRole() {
  const { user, hasRole } = useAuth();

  const isAdmin = hasRole('ADMIN');
  const isParking = hasRole('PARKING');
  const isClient = hasRole('CLIENT');

  const isVerified = user?.emailVerified || false;
  const isApproved = user?.status === 'APPROVED';
  const isPending = user?.status === 'PENDING';

  const canAccess = (requiredRoles: UserRole | UserRole[]): boolean => {
    return hasRole(requiredRoles);
  };

  return {
    role: user?.role,
    isAdmin,
    isParking,
    isClient,
    isVerified,
    isApproved,
    isPending,
    canAccess,
  };
}