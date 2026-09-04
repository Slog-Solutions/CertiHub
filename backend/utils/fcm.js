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
  if (!token || typeof token !== 'string' || !token.trim()) {
    return { success: false, error: 'No valid FCM token provided' };
  }

  const cleanToken = token.trim();

  try {
    const formattedData = Object.fromEntries(
      Object.entries({
        title: title || '',
        message: body || '',
        ...data
      }).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)])
    );

    const message = {
      token: cleanToken,
      notification: {
        title: String(title || ''),
        body: String(body || '')
      },
      data: formattedData,
      webpush: {
        fcmOptions: {
          link: '/'
        }
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'slog_alerts_high',
          title: String(title || ''),
          body: String(body || ''),
          sound: 'default',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    console.log(`[FCM] Attempting to send push to token: ${cleanToken.substring(0, 15)}... (channel: slog_alerts_high)`);
    const messageId = await messaging.send(message);
    console.log(`[FCM] Push sent successfully! messageId: ${messageId}`);
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

  const validTokens = Array.from(new Set(
    (tokens || []).filter(t => t && typeof t === 'string' && t.trim().length > 10).map(t => t.trim())
  ));

  if (validTokens.length === 0) {
    console.warn('[FCM] sendToTokens called but zero valid FCM tokens found.');
    return { successCount: 0, failureCount: 0, errors: ['No valid FCM tokens'] };
  }

  const formattedData = Object.fromEntries(
    Object.entries({
      title: title || '',
      message: body || '',
      ...data
    }).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)])
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
        notification: {
          title: String(title || ''),
          body: String(body || '')
        },
        data: formattedData,
        webpush: {
          fcmOptions: {
            link: '/'
          }
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'slog_alerts_high',
            title: String(title || ''),
            body: String(body || ''),
            sound: 'default',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      console.log(`[FCM] Sending multicast to ${chunk.length} token(s)...`);
      const response = await messaging.sendEachForMulticast(multicastMessage);
      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((r, i) => {
        if (!r.success) {
          console.error(`[FCM] Token[${i}] failed:`, r.error?.message || 'unknown error');
          errors.push(`Token[${i}]: ${r.error?.message || 'unknown error'}`);
        }
      });
    } catch (err) {
      console.error('[FCM] sendToTokens batch error:', err.message);
      failureCount += chunk.length;
      errors.push(err.message);
    }
  }

  console.log(`[FCM] Batch finished for ${validTokens.length} tokens — Success: ${successCount}, Failed: ${failureCount}`);
  return { successCount, failureCount, errors };
};

/**
 * Extract all unique FCM tokens for a user document across web, android, ios, and legacy fields.
 * @param {object} user - User document
 * @returns {string[]} Array of unique FCM registration tokens
 */
const extractUserFcmTokens = (user) => {
  if (!user) return [];
  const tokenSet = new Set();

  if (user.fcmToken && typeof user.fcmToken === 'string' && user.fcmToken.trim()) {
    tokenSet.add(user.fcmToken.trim());
  }
  if (user.fcmTokenWeb && typeof user.fcmTokenWeb === 'string' && user.fcmTokenWeb.trim()) {
    tokenSet.add(user.fcmTokenWeb.trim());
  }
  if (user.fcmTokenAndroid && typeof user.fcmTokenAndroid === 'string' && user.fcmTokenAndroid.trim()) {
    tokenSet.add(user.fcmTokenAndroid.trim());
  }
  if (user.fcmTokenIos && typeof user.fcmTokenIos === 'string' && user.fcmTokenIos.trim()) {
    tokenSet.add(user.fcmTokenIos.trim());
  }
  if (Array.isArray(user.fcmTokens)) {
    user.fcmTokens.forEach(t => {
      if (t && typeof t === 'string' && t.trim()) {
        tokenSet.add(t.trim());
      }
    });
  }

  return Array.from(tokenSet);
};

module.exports = { sendToToken, sendToTokens, getMessaging, extractUserFcmTokens };
