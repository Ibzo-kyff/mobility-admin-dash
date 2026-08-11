'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSpinner,
  faCheckCircle,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  
  // Tableau de 4 chaînes vides pour l'OTP
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    } else {
      const storedUser = mobilityAPI.getCurrentUserSync();
      if (storedUser?.email) {
        setUserEmail(storedUser.email);
      } else if (typeof window !== 'undefined') {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const parsed = JSON.parse(userStr);
            if (parsed?.email) setUserEmail(parsed.email);
          }
        } catch (e) {}
      }
    }
  }, [user]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // N'accepter que les chiffres

    const newOtpValues = [...otpValues];
    // Prendre seulement le dernier caractère saisi s'il y en a plusieurs
    newOtpValues[index] = value.substring(value.length - 1);
    setOtpValues(newOtpValues);
    setError('');

    // Passer au champ suivant s'il y a une valeur
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      // Reculer au champ précédent si on fait retour arrière sur un champ vide
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4).replace(/\D/g, ''); // Garder que les 4 premiers chiffres
    
    if (pastedData) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 4) newOtpValues[i] = pastedData[i];
      }
      setOtpValues(newOtpValues);
      
      // Focus le champ approprié après avoir collé
      const nextIndex = Math.min(pastedData.length, 3);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otpValues.join('');
    if (otpString.length < 4) {
      setError('Veuillez saisir le code complet à 4 chiffres.');
      return;
    }

    if (!userEmail) {
      setError("Erreur : l'email de l'utilisateur est introuvable. Veuillez vous reconnecter.");
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await mobilityAPI.verifyEmailWithOTP(userEmail, otpString);
      
      setSuccessMessage('Votre compte a été vérifié avec succès !');
      
      if (user) {
        await refreshUser();
      }

      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Le code OTP est invalide ou a expiré.');
      // Réinitialiser les champs en cas d'erreur
      setOtpValues(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const isOtpComplete = otpValues.every(val => val !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4 relative">
      <Link href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 rounded-full shadow-md transition-all group z-10" title="Retour au site">
        <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
      </Link>
      
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-200">
            <FontAwesomeIcon icon={faShieldHalved} className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Vérification de sécurité</h1>
          <p className="text-gray-600 mt-2">
            Entrez le code à 4 chiffres envoyé à votre adresse email
            {userEmail && <span className="block font-medium text-gray-800 mt-1">{userEmail}</span>}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          {successMessage ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Vérifié !</h2>
              <p className="text-green-600 mb-6 font-medium">{successMessage}</p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-3 bg-gray-50 py-3 px-4 rounded-xl inline-flex">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-orange-500 text-lg" />
                Redirection en cours...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* OTP Boxes */}
              <div className="flex justify-center gap-4 sm:gap-6 mt-2">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-xl sm:text-2xl font-bold text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all outline-none"
                    maxLength={1}
                  />
                ))}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !isOtpComplete}
                className="w-full py-4 bg-orange-500 text-white font-bold text-lg rounded-xl hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-200 hover:shadow-orange-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xl" />
                    Vérification...
                  </>
                ) : (
                  <>
                    Confirmer le code
                  </>
                )}
              </button>
            </form>
          )}

          {!successMessage && (
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Vous n'avez pas reçu le code ?{' '}
                <button 
                  type="button"
                  className="text-orange-600 hover:text-orange-700 font-bold transition-colors ml-1 focus:outline-none focus:underline"
                  onClick={async () => {
                    try {
                      await mobilityAPI.sendVerificationEmail();
                      alert('Un nouveau code vous a été envoyé par email.');
                    } catch (e: any) {
                      alert(e.message || 'Erreur lors du renvoi du code.');
                    }
                  }}
                >
                  Renvoyer
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
