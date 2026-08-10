'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faShieldAlt,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(
    'Un code de vérification a été envoyé à votre adresse e-mail.'
  );

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }
    if (!otp) {
      setError('Veuillez saisir le code OTP envoyé par email.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await mobilityAPI.verifyEmailWithOTP(email, otp);
      setSuccess(true);
      setMessage('Votre adresse email a bien été vérifiée ! Redirection...');
      setTimeout(() => router.push('/auth/login'), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Code OTP invalide ou expiré.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faShieldAlt} className="text-3xl text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-black">Vérification de l&apos;email</h1>
          <p className="text-black mt-2">{message}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Email</label>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 p-4 bg-gray-100 rounded-2xl text-black"
                placeholder="votre@email.com"
                required
                disabled={Boolean(emailParam)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Code OTP</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full p-4 text-center text-4xl tracking-[12px] font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-2xl">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-2xl">{message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-4 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Vérification...
              </>
            ) : (
              'Vérifier mon email'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
