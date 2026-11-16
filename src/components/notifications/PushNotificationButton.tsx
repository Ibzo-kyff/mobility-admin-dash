'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/components/auth/AuthProvider';

export default function PushNotificationButton() {
  const { enablePushNotifications } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnable = async () => {
    if (permission === 'denied') {
      setFeedback('Autorisez les notifications dans les paramètres du navigateur.');
      return;
    }

    setIsEnabling(true);
    setFeedback('');
    try {
      const enabled = await enablePushNotifications();
      setPermission(Notification.permission);
      setFeedback(
        enabled
          ? 'Notifications push activées sur cet appareil.'
          : 'Activation impossible. Vérifiez la configuration Firebase et réessayez.'
      );
    } catch (error) {
      console.error('Erreur activation notifications push:', error);
      setFeedback('Impossible d’activer les notifications push.');
    } finally {
      setIsEnabling(false);
    }
  };

  if (permission === null && typeof window !== 'undefined' && !('Notification' in window)) {
    return null;
  }

  const label = isEnabling
    ? 'Activation...'
    : permission === 'granted'
      ? 'Push activées'
      : permission === 'denied'
        ? 'Autorisation bloquée'
        : 'Activer les push';

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleEnable}
        disabled={isEnabling || permission === 'granted'}
        title={feedback || label}
        aria-label={label}
        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-4 ${
          permission === 'granted'
            ? 'cursor-default border-emerald-200 bg-emerald-50 text-emerald-800 focus:ring-emerald-100'
            : 'border-orange-200 bg-white text-orange-700 hover:border-orange-300 hover:bg-orange-50 focus:ring-orange-100 disabled:cursor-wait disabled:opacity-70'
        }`}
      >
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${
          permission === 'granted' ? 'bg-emerald-100' : 'bg-orange-100'
        }`}>
          <FontAwesomeIcon
            icon={isEnabling ? faSpinner : permission === 'granted' ? faCheck : faBell}
            className={isEnabling ? 'animate-spin' : ''}
          />
        </span>
        <span>{label}</span>
      </button>
      {feedback && (
        <p role="status" className={`text-xs font-medium ${
          feedback.startsWith('Notifications push activées') ? 'text-emerald-700' : 'text-amber-700'
        }`}>
          {feedback}
        </p>
      )}
    </div>
  );
}
