// components/auth/AuthGuard.tsx - VERSION SIMPLIFIÉE
'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isVerified, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false); // ← CRITIQUE

  useEffect(() => {
    // Ne rediriger qu'une seule fois !
    if (!isLoading && !hasRedirected.current) {
      if (!isAuthenticated) {
        hasRedirected.current = true;
        const callbackUrl = encodeURIComponent(pathname);
        router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
      } else if (!isVerified) {
        hasRedirected.current = true;
        router.replace('/auth/verify-email');
      } else if (user?.role === 'PARKING' && user?.status === 'PENDING') {
        hasRedirected.current = true;
        router.replace('/auth/pending-approuval');
      }
    }
  }, [isAuthenticated, isLoading, isVerified, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}