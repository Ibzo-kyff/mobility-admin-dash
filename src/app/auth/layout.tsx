// app/(auth)/layout.tsx - VERSION FINALE
'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false); // ← CRITIQUE : empêche les redirections multiples

  useEffect(() => {
    // Ne rediriger qu'une seule fois !
    if (!isLoading && isAuthenticated && user && !hasRedirected.current) {
      // Ne pas forcer la redirection vers le dashboard si l'utilisateur n'est pas encore vérifié
      // ou s'il est en attente d'approbation. On laisse la page courante gérer ça.
      if (!user.emailVerified) return;
      if (user.role === 'PARKING' && user.status === 'PENDING') return;

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
  }, [isAuthenticated, isLoading, user, router, pathname]);

  // Si authentifié et pleinement autorisé (vérifié + approuvé), on masque les pages d'auth
  const isFullyAuthorized = isAuthenticated && user?.emailVerified && !(user?.role === 'PARKING' && user?.status === 'PENDING');
  if (isFullyAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {children}
    </div>
  );
}