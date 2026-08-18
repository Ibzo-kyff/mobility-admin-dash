import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotificationState, NotificationType } from '../types';

const DEFAULT_TIMEOUT = 5000;

export const useNotification = (defaultTimeout = DEFAULT_TIMEOUT) => {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    visible: false,
    timeoutMs: defaultTimeout,
  });

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const hideNotification = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotification((s) => ({ ...s, visible: false }));
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info', timeoutMs?: number) => {
      const ms = timeoutMs ?? defaultTimeout;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setNotification({ message, type, visible: true, timeoutMs: ms });
      timerRef.current = window.setTimeout(() => {
        setNotification((s) => ({ ...s, visible: false }));
        timerRef.current = null;
      }, ms);
    },
    [defaultTimeout]
  );

  return {
    notification,
    showNotification,
    hideNotification,
    setNotification,
  } as const;
};

export default useNotification;
