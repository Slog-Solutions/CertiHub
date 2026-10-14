/**
 * Firebase Client SDK — CertiHub Frontend
 * src/lib/firebase.js
 *
 * Initializes Firebase Web SDK and exposes:
 *   - requestNotificationPermission() — Gets FCM token and saves to backend
 *   - onForegroundMessage(cb)         — Listens for foreground push messages
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard: if no project is configured, disable silently
const isConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId
);

let app = null;
if (isConfigured) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

export const getInstallationId = () => {
  if (typeof window === 'undefined') return null;
  let installId = localStorage.getItem('installationId');
  if (!installId) {
    installId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'device-' + Date.now();
    localStorage.setItem('installationId', installId);
  }
  return installId;
};

/**
 * Request browser notification permission, obtain FCM registration token,
 * and save it to the backend so the server can push to this device.
 *
 * @param {object} api - Axios instance
 * @returns {Promise<string|null>} FCM token string or null
 */
export const requestNotificationPermission = async (api = null) => {
  if (typeof window === 'undefined') return null;
  if (!isConfigured) {
    console.warn('[Firebase] Not configured. Add NEXT_PUBLIC_FIREBASE_* keys to .env.local');
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('[Firebase] FCM not supported in this browser.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[Firebase] Notification permission denied.');
      return null;
    }

    const messaging = getMessaging(app);
    const vapidKey = (process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '').trim();

    const token = await getToken(messaging, { vapidKey: vapidKey || undefined });

    if (token) {
      console.log('[Firebase] FCM token obtained:', token.substring(0, 20) + '...');

      // Save token to backend so server can push to this device
      if (api && typeof api.post === 'function') {
        try {
          const installationId = getInstallationId();
          await api.post('/devices/register', { installationId, fcmToken: token, platform: 'web' });
          if (typeof api.patch === 'function') {
            await api.patch('/push/fcm-token', { token, platform: 'web' }).catch(() => {});
          }
          console.log('[Firebase] FCM token and device registered to backend.');
        } catch (err) {
          console.warn('[Firebase] Failed to register device to backend:', err?.response?.data?.error || err.message);
        }
      }

      return token;
    } else {
      console.log('[Firebase] No FCM token returned. Check VAPID key and service worker.');
      return null;
    }
  } catch (err) {
    console.error('[Firebase] requestNotificationPermission error:', err.message);
    return null;
  }
};

/**
 * Subscribe to foreground Firebase push messages (tab is open and active).
 * @param {function} callback - Called with FCM message payload
 * @returns {function} Unsubscribe function
 */
export const onForegroundMessage = (callback) => {
  if (typeof window === 'undefined' || !isConfigured) return () => {};

  isSupported().then((supported) => {
    if (!supported) return;
    try {
      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        console.log('[Firebase] Foreground message received:', payload);
        if (typeof callback === 'function') callback(payload);
      });
    } catch (e) {
      console.error('[Firebase] onForegroundMessage error:', e.message);
    }
  });

  return () => {};
};

export { app };
