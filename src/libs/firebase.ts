import { initializeApp, getApps, getApp } from 'firebase/app';
import type { Messaging, MessagePayload } from 'firebase/messaging';
import { mobilityAPI } from '@/services/mobility-api';
import { getCookie } from 'cookies-next';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB4a_kus9-BsU-MoFeRoA4YHVS8CO9jYX0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mobility-8b333.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mobility-8b333",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mobility-8b333.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "984002454902",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:984002454902:web:c634b158c3efb564e28657"
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BJQw1-kfupu0GPEeccfVKxon45pH5L9lsFBPwPdmGQwU2YeijnIJ1aYyQ8GKkkU_qEUxC4qx2Bl38ARr7oCm3C4";

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }
  if (!messaging) {
    try {
      const { getMessaging, isSupported } = await import('firebase/messaging');
      const supported = await isSupported();
      if (supported) {
        messaging = getMessaging(app);
      }
    } catch (e) {
      console.warn('Firebase Messaging non supporte dans cet environnement:', e);
    }
  }
  return messaging;
};

export const requestNotificationPermissionAndToken = async (explicitAuthToken?: string): Promise<string | null> => {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    console.log('Les notifications ou les Service Workers ne sont pas supportes par ce navigateur.');
    return null;
  }

  try {
    const permissionRequest = Notification.permission === 'default'
      ? Notification.requestPermission()
      : Promise.resolve(Notification.permission);
    const permission = await permissionRequest;
    if (permission !== 'granted') {
      console.info('Permission de notification non accordée:', permission);
      return null;
    }

    const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging non supporte sur ce navigateur/plateforme.');
      return null;
    }

    // Enregistrer le Service Worker et attendre qu'il soit ACTIF
    await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    const registration = await navigator.serviceWorker.ready;
    console.log('Service Worker Firebase pret et actif:', registration);

    const msg = getMessaging(app);
    if (!msg) return null;

    const currentToken = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      const saved = await saveFCMTokenToBackend(currentToken, explicitAuthToken);
      return saved ? currentToken : null;
    } else {
      console.warn('Aucun token de notification retourne.');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la recuperation du token FCM:', error);
    return null;
  }
};

export const saveFCMTokenToBackend = async (token: string, explicitAuthToken?: string): Promise<boolean> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://parkapp-pi.vercel.app/api';
    const authToken = explicitAuthToken || mobilityAPI.getToken() || (typeof window !== 'undefined' ? (getCookie('accessToken') as string | null || localStorage.getItem('accessToken')) : null);
    if (!authToken) {
      console.warn('Aucun jeton d\'authentification disponible pour enregistrer le token FCM.');
      return false;
    }

    const res = await fetch(`${baseUrl}/auth/users/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ token })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error(`Erreur enregistrement token FCM sur le backend (HTTP ${res.status}):`, errData);
      return false;
    }

    console.log('Token FCM enregistre sur le backend avec succes');
    return true;
  } catch (err) {
    console.error('Erreur enregistrement token FCM sur le backend:', err);
    return false;
  }
};

export const listenToForegroundMessages = (callback: (payload: MessagePayload) => void) => {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return () => {};
  }

  let unsubscribe: (() => void) | undefined;

  import('firebase/messaging').then(async ({ getMessaging, onMessage, isSupported }) => {
    try {
      const supported = await isSupported();
      if (!supported) return;

      const msg = getMessaging(app);
      unsubscribe = onMessage(msg, (payload: MessagePayload) => {
        console.log('Message FCM recu au premier plan:', payload);
        callback(payload);

        if (Notification.permission === 'granted') {
          const title = payload.notification?.title || payload.data?.title || 'Mobility';
          const targetUrl = payload.data?.url || '/dashboard';
          const options: NotificationOptions = {
            body: payload.notification?.body || payload.data?.message || payload.data?.body || '',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { ...payload.data, url: targetUrl },
            tag: payload.data?.notificationId || 'mobility-notification',
          };

          navigator.serviceWorker.ready
            .then((registration) => registration.showNotification(title, options))
            .catch((error: unknown) => {
              console.error('Impossible d’afficher la notification via le Service Worker:', error);
              const notification = new Notification(title, options);
              notification.onclick = () => {
                const destination = new URL(targetUrl, window.location.origin);
                if (destination.origin === window.location.origin) {
                  window.location.assign(destination.href);
                }
                notification.close();
              };
            });
        }
      });
    } catch (e) {
      console.warn('Impossible d\'ecouter les messages en premier plan:', e);
    }
  }).catch((err) => {
    console.warn('Erreur chargement firebase/messaging:', err);
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
};
