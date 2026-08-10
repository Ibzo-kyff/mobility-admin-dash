// app/(auth)/login/LoginForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';  // ← ajoute useSearchParams pour callbackUrl
import { useAuth } from '@/components/auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faArrowRight,
  faArrowLeft,
  faEye,
  faEyeSlash,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Si déjà authentifié, rediriger immédiatement
  useEffect(() => {
    if (isAuthenticated && user) {
      const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl && callbackUrl.startsWith('/')) {
        router.replace(callbackUrl);
        return;
      }
      
      const dashboardPath = user.role === 'ADMIN' 
        ? '/dashboard/admin' 
        : user.role === 'PARKING' 
          ? '/dashboard/parking' 
          : '/dashboard/client';
      router.replace(dashboardPath);
    }
  }, [isAuthenticated, user, router, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setLocalError(err.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4 relative">
      <Link href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 rounded-full shadow-md transition-all group z-10" title="Retour au site">
        <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
      </Link>
      <div className="max-w-md w-full mt-12 sm:mt-0">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-2xl font-bold text-black">Mobility</h1>
          <p className="text-black">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Email
              </label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black" 
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemple@email.com"
                  className="w-full p-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-black">
                  Mot de passe
                </label>
                <Link 
                  href="/auth/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-500"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black" 
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full p-3 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:text-black"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {(localError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {localError || error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-black mt-6">
            Pas encore de compte ?{' '}
            <Link 
              href="/auth/register"
              className="text-orange-600 hover:text-orange-500 font-medium"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}