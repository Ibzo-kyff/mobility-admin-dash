importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB4a_kus9-BsU-MoFeRoA4YHVS8CO9jYX0",
  authDomain: "mobility-8b333.firebaseapp.com",
  projectId: "mobility-8b333",
  storageBucket: "mobility-8b333.firebasestorage.app",
  messagingSenderId: "984002454902",
  appId: "1:984002454902:web:c634b158c3efb564e28657"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Recu en arriere-plan:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Mobility';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || payload.data?.body || '',
    icon: payload.notification?.icon || '/images/logo.jpg',
    badge: '/images/logo.jpg',
    image: payload.notification?.image || payload.data?.image || undefined,
    data: payload.data || {},
    vibrate: [200, 100, 200],
    tag: payload.data?.notificationId || 'mobility-notification',
    renotify: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/dashboard/admin/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
