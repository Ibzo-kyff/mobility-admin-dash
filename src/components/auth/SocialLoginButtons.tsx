'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SocialLoginButtons() {
  const { loginWithGoogle, loginWithFacebook } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Chargement des SDK au montage de la page
  useEffect(() => {
    // Google SDK
    if (!document.getElementById('google-sdk')) {
      const googleScript = document.createElement('script');
      googleScript.id = 'google-sdk';
      googleScript.src = 'https://accounts.google.com/gsi/client';
      googleScript.async = true;
      googleScript.defer = true;
      document.body.appendChild(googleScript);
    }

    // Facebook SDK
    if (!document.getElementById('facebook-sdk')) {
      (window as any).fbAsyncInit = function() {
        (window as any).FB.init({
          appId      : process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'fakefbappid',
          cookie     : true,
          xfbml      : true,
          version    : 'v18.0'
        });
      };
      const fbScript = document.createElement('script');
      fbScript.id = 'facebook-sdk';
      fbScript.src = 'https://connect.facebook.net/fr_FR/sdk.js';
      fbScript.async = true;
      fbScript.defer = true;
      document.body.appendChild(fbScript);
    }
  }, []);

  // 2. Initialisation et rendu du bouton Google
  useEffect(() => {
    const initGoogle = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1035541999990-fakeclientid.apps.googleusercontent.com',
          callback: async (response: any) => {
            setIsLoading(true);
            setError('');
            try {
              await loginWithGoogle(response.credential);
            } catch (err: any) {
              setError(err.message || 'Échec de la connexion Google');
            } finally {
              setIsLoading(false);
            }
          },
        });

        const container = document.getElementById('google-btn-container');
        if (container) {
          container.innerHTML = ''; // Clear previous button if any
          (window as any).google.accounts.id.renderButton(
            container,
            { 
              theme: 'outline', 
              size: 'large', 
              shape: 'rectangular',
              width: 220
            }
          );
        }
      } else {
        setTimeout(initGoogle, 500);
      }
    };

    const timer = setTimeout(initGoogle, 100);
    return () => clearTimeout(timer);
  }, [loginWithGoogle]);

  const triggerFacebookLogin = () => {
    if (!(window as any).FB) {
      setError('Le SDK Facebook n\'est pas encore chargé');
      return;
    }
    
    setIsLoading(true);
    setError('');
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        loginWithFacebook(accessToken)
          .catch((err: any) => {
            setError(err.message || 'Échec de la connexion Facebook');
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setError('Connexion Facebook annulée');
        setIsLoading(false);
      }
    }, { scope: 'email,public_profile' });
  };

  return (
    <div className="w-full mt-6">
      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        {/* Conteneur pour le bouton Google officiel */}
        <div id="google-btn-container" className="flex justify-center min-w-[200px] h-[40px] overflow-hidden"></div>
        
        {/* Bouton Facebook personnalisé */}
        <button 
          type="button" 
          onClick={triggerFacebookLogin}
          disabled={isLoading}
          className="w-full sm:w-auto flex-1 max-w-[220px] h-[40px] px-4 bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464cc] text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-transparent shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="text-sm font-semibold whitespace-nowrap">
            {isLoading ? 'Connexion...' : 'Facebook'}
          </span>
        </button>
      </div>
    </div>
  );
}
