// app/not-found.tsx - Version améliorée
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faDashboard } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  // Redirection automatique après 5 secondes si connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const timer = setTimeout(() => {
        const dashboardPath = user.role === 'ADMIN' 
          ? '/dashboard/admin' 
          : user.role === 'PARKING' 
            ? '/dashboard/parking' 
            : '/dashboard/client';
        router.push(dashboardPath);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, isLoading, router]);

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/';
    return user.role === 'ADMIN' 
      ? '/dashboard/admin' 
      : user.role === 'PARKING' 
        ? '/dashboard/parking' 
        : '/dashboard/client';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full">
            <span className="text-6xl font-bold text-orange-500">404</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Page non trouvée</h1>
        
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {isAuthenticated && user && (
          <p className="text-sm text-orange-600 mb-6">
            ⚡ Redirection automatique vers votre tableau de bord dans quelques secondes...
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Page précédente
          </button>
          
          <Link
            href={getDashboardLink()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={isAuthenticated ? faDashboard : faHome} />
            {isAuthenticated ? 'Mon tableau de bord' : 'Accueil'}
          </Link>
        </div>

        {!isAuthenticated && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Vous avez un compte ?{' '}
              <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}