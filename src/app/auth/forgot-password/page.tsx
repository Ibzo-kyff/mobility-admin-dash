'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await mobilityAPI.forgotPassword(email);
      setSuccess(true);
      // Redirection vers la réinitialisation avec l'email en query
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold">Mot de passe oublié ?</h1>
          <p className="text-gray-600 mt-2">Nous allons vous envoyer un code par email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre email</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Envoi en cours...</>
                ) : (
                  <>Recevoir le code <FontAwesomeIcon icon={faArrowRight} /></>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-green-600 font-medium">Code envoyé ! Vérifiez votre boîte email.</p>
            </div>
          )}

          <p className="text-center text-sm text-gray-600 mt-6">
            <Link href="/auth/login" className="text-orange-600 hover:underline">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}