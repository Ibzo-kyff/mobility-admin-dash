// app/(auth)/layout.tsx - VERSION FINALE
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false); // ← CRITIQUE : empêche les redirections multiples

  useEffect(() => {
    // Ne rediriger qu'une seule fois !
    if (!isLoading && isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true;
      
      const dashboardPath = user.role === 'ADMIN' 
        ? '/dashboard/admin' 
        : user.role === 'PARKING' 
          ? '/dashboard/parking' 
          : '/dashboard/client';
      
      // Éviter de rediriger vers la même page
      if (window.location.pathname !== dashboardPath) {
        router.replace(dashboardPath);
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Si authentifié, ne rien afficher
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {children}
    </div>
  );
}