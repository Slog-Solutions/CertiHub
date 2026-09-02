// CertiHub — Firebase Web Push Service Worker
// This file MUST remain in /public/ to register at the root scope.
// It handles push notifications when the browser tab is closed or in background.
//
// IMPORTANT: Replace the firebaseConfig values below with your actual Firebase
// project config (same values as your frontend .env.local variables).
// These cannot be read from .env.local here because service workers don't
// have access to Next.js environment variables.

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// ─── REPLACE WITH YOUR ACTUAL FIREBASE PROJECT CONFIG ─────────────────────────
// Get these from: Firebase Console → Project Settings → General → Your apps
const firebaseConfig = {
  apiKey:            "AIzaSyDKDnBFGLQIndqGyimzibD_KIlhSyJdqnI",
  authDomain:        "student-slog.firebaseapp.com",
  projectId:         "student-slog",
  storageBucket:     "student-slog.firebasestorage.app",
  messagingSenderId: "242274904134",
  appId:             "1:242274904134:web:0e071d28ba33c8ce39c247"
};
// ──────────────────────────────────────────────────────────────────────────────

try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('REPLACE')) {
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    // Handle background push messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Background message received:', payload);

      const notificationTitle = payload.notification?.title || '📢 New Class Announcement!';
      const notificationBody  = payload.notification?.body  || 'Your instructor posted something new.';

      self.registration.showNotification(notificationTitle, {
        body:       notificationBody,
        icon:       '/favicon.ico',
        badge:      '/favicon.ico',
        tag:        payload.data?.type === 'direct_message' ? 'direct-msg' : 'class-announcement',
        data:       payload.data || {},
        requireInteraction: false,
        actions: [
          { action: 'view', title: 'View Now' }
        ]
      });
    });

    // Handle notification click — open/focus the app tab
    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          return clients.openWindow('/user');
        })
      );
    });

    console.log('[firebase-messaging-sw.js] Firebase initialized successfully.');
  } else {
    console.log('[firebase-messaging-sw.js] Firebase config not set — background notifications disabled.');
  }
} catch (err) {
  console.error('[firebase-messaging-sw.js] Initialization error:', err.message);
}
