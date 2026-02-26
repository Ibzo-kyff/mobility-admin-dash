// components/auth/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { mobilityAPI } from '@/services/mobility-api';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import type { User, AuthState, UserRole } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isVerified: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  
  const router = useRouter();
  const pathname = usePathname();

  // IMPORTANT: Ne vérifier l'auth qu'une seule fois au chargement
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        const token = getCookie('accessToken') as string | undefined;
        const userStr = getCookie('user') as string | undefined;
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            if (isMounted) {
              setState({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            }
            
            // Rafraîchir en arrière-plan
            try {
              const freshUser = await mobilityAPI.getCurrentUser();
              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  user: freshUser,
                  isAuthenticated: true,
                }));
                setCookie('user', JSON.stringify(freshUser), {
                  maxAge: 7 * 24 * 60 * 60,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'strict',
                  path: '/',
                });
              }
            } catch (refreshError) {
              console.error('Refresh failed:', refreshError);
              // Ne pas déconnecter, garder l'utilisateur actuel
            }
          } catch (e) {
            if (isMounted) {
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          }
        } else {
          if (isMounted) {
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Dépendances vides - NE PAS AJOUTER de dépendances

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mobilityAPI.login(email, password);
      const user = await mobilityAPI.getCurrentUser();

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      setCookie('user', JSON.stringify(user), {
        maxAge: 7 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      // ✅ Lire callbackUrl proprement côté client
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl');

      if (callbackUrl && callbackUrl.startsWith('/')) {
        router.replace(callbackUrl);
      } else {
        router.replace(getDashboardPath(user.role));
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erreur de connexion',
      }));
      throw error;
    }
  };

  const register = async (userData: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await mobilityAPI.register(userData);
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      throw error;
    }
  };

  const logout = async () => {
    mobilityAPI.logout();
    
    deleteCookie('user');
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    
    // IMPORTANT: Ne pas utiliser router.push ici directement
    // Utiliser window.location pour éviter les conflits avec le middleware
    window.location.href = '/auth/login';
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!state.user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(state.user.role);
  };

  const getDashboardPath = (role: UserRole): string => {
    const paths = {
      ADMIN: '/dashboard/admin',
      PARKING: '/dashboard/parking',
      CLIENT: '/dashboard/client',
    };
    return paths[role] || '/dashboard/client';
  };

  const refreshUser = async () => {
    try {
      if (mobilityAPI.isAuthenticated() && state.user) {
        const user = await mobilityAPI.getCurrentUser();
        setState(prev => ({
          ...prev,
          user,
        }));
        setCookie('user', JSON.stringify(user), {
          maxAge: 7 * 24 * 60 * 60,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    hasRole,
    isVerified: state.user?.emailVerified || false,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};