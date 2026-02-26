'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mobilityAPI } from '@/services/mobility-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faEye, 
  faEyeSlash, 
  faSpinner, 
  faPaperPlane,
  faClock
} from '@fortawesome/free-solid-svg-icons';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('Un code OTP a été envoyé à votre email.');

  // === TIMERS ===
  const [otpTimeLeft, setOtpTimeLeft] = useState(900);     // 15 minutes (expiration réelle)
  const [resendTimeLeft, setResendTimeLeft] = useState(60); // 1 minute (cooldown renvoi)

  // Timer d'expiration de l'OTP (15 min)
  useEffect(() => {
    if (otpTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setOtpTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimeLeft]);

  // Timer de cooldown renvoi (1 min)
  useEffect(() => {
    if (resendTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setResendTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimeLeft]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Renvoi du code (possible après 60 secondes)
  const handleResendOTP = async () => {
    if (!email || resendTimeLeft > 0) return;

    setResendLoading(true);
    setError('');

    try {
      await mobilityAPI.forgotPassword(email);
      
      // Reset des deux timers
      setOtpTimeLeft(900);
      setResendTimeLeft(60);
      
      setMessage('✅ Nouveau code OTP envoyé !');
      setTimeout(() => setMessage('Un code OTP a été envoyé à votre email.'), 4000);
    } catch (err: any) {
      setError('Impossible d\'envoyer le code pour le moment.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await mobilityAPI.resetPassword(email, otp, password);
      setSuccess(true);
      setMessage('Mot de passe réinitialisé avec succès !');
      setTimeout(() => router.push('/auth/login'), 1800);
    } catch (err: any) {
      setError(err.message || 'Code OTP invalide ou expiré');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faLock} className="text-3xl text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Réinitialiser le mot de passe</h1>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={email} disabled className="w-full p-4 bg-gray-100 rounded-2xl text-gray-500" />
          </div>

          {/* OTP + Timer expiration */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Code OTP</label>
              <div className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
                <FontAwesomeIcon icon={faClock} />
                Expire dans {formatTime(otpTimeLeft)}
              </div>
            </div>

            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full p-4 text-center text-4xl tracking-[12px] font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="••••"
              required
            />

            {/* Bouton renvoyer avec cooldown 60s */}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendTimeLeft > 0 || resendLoading}
              className="mt-4 w-full py-3 text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <FontAwesomeIcon 
                icon={faPaperPlane} 
                className={resendLoading ? 'animate-spin' : ''} 
              />
              {resendTimeLeft > 0 
                ? `Renvoyer dans ${formatTime(resendTimeLeft)}` 
                : 'Renvoyer le code OTP'
              }
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-2xl">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-2xl">{message}</p>}

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-4 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}