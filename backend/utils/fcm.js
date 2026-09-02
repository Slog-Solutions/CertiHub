/**
 * Firebase Admin SDK — FCM Push Notification Utility
 * backend/utils/fcm.js
 *
 * Initializes Firebase Admin SDK once (singleton) and exports
 * helper functions for sending push notifications via FCM.
 *
 * Requires:
 *   - FIREBASE_SERVICE_ACCOUNT_PATH in backend/.env
 *     pointing to your downloaded service-account.json file.
 */
const path = require('path');
const fs = require('fs');

let messagingInstance = null;

/**
 * Initialize Firebase Admin SDK singleton.
 * Returns the messaging instance or null if credentials are missing.
 */
const getMessaging = () => {
  if (messagingInstance) return messagingInstance;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) {
    console.warn('[FCM] FIREBASE_SERVICE_ACCOUNT_PATH not set in .env — push notifications disabled.');
    return null;
  }

  const resolvedPath = path.resolve(__dirname, '..', serviceAccountPath);
  if (!fs.existsSync(resolvedPath)) {
    console.warn(`[FCM] Service account file not found at: ${resolvedPath} — push notifications disabled.`);
    return null;
  }

  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    messagingInstance = admin.messaging();
    console.log('[FCM] Firebase Admin SDK initialized successfully.');
    return messagingInstance;
  } catch (err) {
    console.error('[FCM] Failed to initialize Firebase Admin SDK:', err.message);
    return null;
  }
};

/**
 * Send push notification to a single FCM device token.
 * @param {string} token - FCM registration token
 * @param {string} title - Notification title
 * @param {string} body  - Notification body text
 * @param {object} data  - Optional key-value data payload
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendToToken = async (token, title, body, data = {}) => {
  const messaging = getMessaging();
  if (!messaging) return { success: false, error: 'FCM not initialized' };
  if (!token) return { success: false, error: 'No FCM token provided' };

  try {
    const message = {
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      webpush: {
        notification: {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          click_action: '/'
        }
      }
    };

    const messageId = await messaging.send(message);
    return { success: true, messageId };
  } catch (err) {
    console.error('[FCM] sendToToken error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send push notifications to multiple FCM device tokens (batch).
 * Automatically filters out empty/invalid tokens.
 * @param {string[]} tokens - Array of FCM registration tokens
 * @param {string}   title  - Notification title
 * @param {string}   body   - Notification body
 * @param {object}   data   - Optional data payload
 * @returns {Promise<{successCount: number, failureCount: number, errors: string[]}>}
 */
const sendToTokens = async (tokens, title, body, data = {}) => {
  const messaging = getMessaging();
  if (!messaging) return { successCount: 0, failureCount: 0, errors: ['FCM not initialized'] };

  const validTokens = (tokens || []).filter(t => t && typeof t === 'string' && t.trim());
  if (validTokens.length === 0) {
    return { successCount: 0, failureCount: 0, errors: ['No valid FCM tokens'] };
  }

  const dataStringified = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );

  // FCM allows max 500 per sendEachForMulticast; split if needed
  const chunks = [];
  for (let i = 0; i < validTokens.length; i += 499) {
    chunks.push(validTokens.slice(i, i + 499));
  }

  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  for (const chunk of chunks) {
    try {
      const multicastMessage = {
        tokens: chunk,
        notification: { title, body },
        data: dataStringified,
        webpush: {
          notification: {
            title,
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            click_action: '/'
          }
        }
      };

      const response = await messaging.sendEachForMulticast(multicastMessage);
      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((r, i) => {
        if (!r.success) {
          errors.push(`Token[${i}]: ${r.error?.message || 'unknown error'}`);
        }
      });
    } catch (err) {
      console.error('[FCM] sendToTokens batch error:', err.message);
      failureCount += chunk.length;
      errors.push(err.message);
    }
  }

  console.log(`[FCM] Sent to ${validTokens.length} tokens — Success: ${successCount}, Failed: ${failureCount}`);
  return { successCount, failureCount, errors };
};

module.exports = { sendToToken, sendToTokens, getMessaging };
