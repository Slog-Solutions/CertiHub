/**
 * Expert Push Notification Routes
 * backend/routes/push.js
 *
 * Provides Firebase FCM push notification endpoints exclusively for Teacher role.
 * - POST /api/push/batch/:batchId  — Push to ALL candidates in a batch
 * - POST /api/push/student/:userId — Push to a SPECIFIC candidate
 *
 * Exposes endpoints for candidates:
 * - PATCH /api/push/fcm-token — Register/update caller's FCM token
 * - GET   /api/push/my-notifications — Fetch candidate's specific direct notifications
 * - PATCH /api/push/my-notifications/read — Mark direct notifications as read
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Batch = require('../models/Batch');
const DirectNotification = require('../models/DirectNotification');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendToToken, sendToTokens, extractUserFcmTokens } = require('../utils/fcm');

const registerFcmTokenHandler = async (req, res) => {
  const token = (
    req.body.token ||
    req.body.fcmToken ||
    req.body.fcm_token ||
    req.body.deviceToken ||
    req.body.device_token ||
    ''
  ).toString().trim();

  if (!token) {
    return res.status(400).json({ error: 'Valid FCM token is required in body (token, fcmToken, or fcm_token).' });
  }

  const plat = (req.body.platform || req.body.deviceType || '').toString().toLowerCase().trim();
  const updateOps = {
    fcmToken: token,
    $addToSet: { fcmTokens: token }
  };

  if (plat === 'android') {
    updateOps.fcmTokenAndroid = token;
  } else if (plat === 'ios') {
    updateOps.fcmTokenIos = token;
  } else if (plat === 'web') {
    updateOps.fcmTokenWeb = token;
  } else {
    updateOps.fcmTokenAndroid = token;
  }

  try {
    await User.findByIdAndUpdate(req.user._id, updateOps);
    console.log(`[FCM] Token registered successfully for user: ${req.user.name} (${req.user._id}) [Platform: ${plat || 'auto-android'}]`);
    res.json({ success: true, message: 'FCM token registered successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   PATCH & POST /api/push/fcm-token
   Register or update the caller's FCM device token.
   Supports field names: token, fcmToken, fcm_token, deviceToken
───────────────────────────────────────────────────────────── */
router.patch('/fcm-token', requireAuth, registerFcmTokenHandler);
router.post('/fcm-token', requireAuth, registerFcmTokenHandler);

/* ─────────────────────────────────────────────────────────────
   POST /api/push/test-token
   Direct endpoint to test sending FCM push to a specific token.
   Body: { fcmToken (or token), title, message, data }
───────────────────────────────────────────────────────────── */
router.post('/test-token', async (req, res) => {
  const token = (req.body.fcmToken || req.body.token || req.body.fcm_token || '').toString().trim();
  const title = (req.body.title || 'Test Notification').toString().trim();
  const message = (req.body.message || req.body.body || 'Hello from CertyHub Server!').toString().trim();
  const extraData = req.body.data || {};

  if (!token) {
    return res.status(400).json({ error: 'fcmToken (or token) is required in body.' });
  }

  try {
    const result = await sendToToken(token, title, message, {
      type: 'generic',
      audience: 'all',
      title,
      message,
      ...extraData
    });

    res.json({
      success: result.success,
      messageId: result.messageId || null,
      error: result.error || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/push/test-user/:userId
   Direct endpoint to test sending FCM push to a specific user ID.
───────────────────────────────────────────────────────────── */
router.post('/test-user/:userId', async (req, res) => {
  const title = (req.body.title || 'Test Push Notification').toString().trim();
  const message = (req.body.message || req.body.body || 'Server push test for user.').toString().trim();

  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tokens = extractUserFcmTokens(user);
    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: `No FCM tokens found in DB for user "${user.name}" (${user._id}). Check if app called /api/push/fcm-token after login.`
      });
    }

    const result = await sendToTokens(tokens, title, message, {
      type: 'generic',
      audience: 'all',
      title,
      message
    });

    res.json({
      success: result.successCount > 0,
      user: { id: user._id, name: user.name, email: user.email },
      tokensFound: tokens.length,
      result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/push/fcm-token
   Revoke / clear caller's FCM device token on logout.
───────────────────────────────────────────────────────────── */
router.delete('/fcm-token', requireAuth, async (req, res) => {
  const token = (req.body?.token || req.body?.fcmToken || '').toString().trim();
  try {
    const updateOps = { fcmToken: null };
    if (token) {
      updateOps.$pull = { fcmTokens: token };
    }
    await User.findByIdAndUpdate(req.user._id, updateOps);
    console.log(`[FCM] Token revoked/cleared on logout for user: ${req.user.name} (${req.user._id})`);
    res.json({ success: true, message: 'FCM token revoked successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/push/logout-fcm (Alias for token deletion on logout)
───────────────────────────────────────────────────────────── */
router.post('/logout-fcm', requireAuth, async (req, res) => {
  const token = (req.body?.token || req.body?.fcmToken || '').toString().trim();
  try {
    const updateOps = { fcmToken: null };
    if (token) {
      updateOps.$pull = { fcmTokens: token };
    }
    await User.findByIdAndUpdate(req.user._id, updateOps);
    console.log(`[FCM] Token revoked via logout-fcm endpoint for user: ${req.user.name}`);
    res.json({ success: true, message: 'FCM token removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/push/my-notifications
   Fetch specific direct notifications sent to the candidate by experts.
   Access: Student only (or any authenticated user)
───────────────────────────────────────────────────────────── */
router.get('/my-notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await DirectNotification.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await DirectNotification.countDocuments({
      studentId: req.user._id,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   PATCH /api/push/my-notifications/read
   Mark all direct notifications as read for the candidate.
───────────────────────────────────────────────────────────── */
router.patch('/my-notifications/read', requireAuth, async (req, res) => {
  try {
    await DirectNotification.updateMany(
      { studentId: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/push/batch/:batchId
   Expert sends push notification to ALL candidates in a batch across Web, Android, iOS.
   Body: { title, message }
   Access: Teacher only
───────────────────────────────────────────────────────────── */
router.post('/batch/:batchId', requireAuth, requireRole(['Teacher']), async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  try {
    // Verify teacher is assigned to this batch
    const batch = await Batch.findOne({
      _id: req.params.batchId,
      $or: [
        { teacherId: req.user._id },
        { 'teachers.teacherId': req.user._id }
      ]
    });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you.' });
    }

    // Fetch all active students in batch
    const students = await User.find({
      _id: { $in: batch.students },
      isActive: true
    }).select('name email fcmToken fcmTokenWeb fcmTokenAndroid fcmTokenIos fcmTokens');

    // Collect ALL registered tokens (Web, Android, iOS) for all students
    const allTokens = students.flatMap(s => extractUserFcmTokens(s));

    if (allTokens.length > 0) {
      sendToTokens(allTokens, title.trim(), message.trim(), {
        type: 'announcement',
        audience: 'student',
        batchId: batch._id.toString(),
        tab: 'resources',
        title: title.trim(),
        message: message.trim()
      }).catch(err => console.error('[FCM] Batch push error:', err.message));
    }

    res.json({
      success: true,
      message: `Push notification broadcasted to ${batch.students.length} candidate(s) in batch ${batch.name}.`,
      totalCandidates: batch.students.length,
      notifiedCount: allTokens.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/push/student/:studentId
   Expert sends a direct push notification to a SPECIFIC candidate across all devices (Web, Android, iOS).
   Body: { title, message }
   Access: Teacher only (must share a batch with the student)
───────────────────────────────────────────────────────────── */
router.post('/student/:studentId', requireAuth, requireRole(['Teacher']), async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  try {
    // Verify teacher has at least one shared batch with this student
    const sharedBatch = await Batch.findOne({
      $or: [
        { teacherId: req.user._id },
        { 'teachers.teacherId': req.user._id }
      ],
      students: req.params.studentId
    });

    if (!sharedBatch) {
      return res.status(403).json({
        error: 'You can only send notifications to candidates in your batches.'
      });
    }

    // Fetch student
    const student = await User.findOne({
      _id: req.params.studentId,
      role: 'Student',
      isActive: true
    }).select('name email fcmToken fcmTokenWeb fcmTokenAndroid fcmTokenIos fcmTokens');

    if (!student) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    // ALWAYS Save to DirectNotification collection in DB so candidate sees it in their navbar notification bell
    const newDirectNotif = new DirectNotification({
      studentId: student._id,
      teacherId: req.user._id,
      teacherName: req.user.name,
      batchName: sharedBatch.name,
      title: title.trim(),
      message: message.trim(),
      read: false
    });
    await newDirectNotif.save();

    // Extract ALL device tokens (Web, Android, iOS) registered for this student
    const userTokens = extractUserFcmTokens(student);
    let fcmSent = false;

    if (userTokens.length > 0) {
      const fcmResult = await sendToTokens(userTokens, title.trim(), message.trim(), {
        type: 'generic',
        audience: 'student',
        batchId: sharedBatch._id.toString(),
        title: title.trim(),
        message: message.trim()
      });
      fcmSent = fcmResult.successCount > 0;
    }

    res.json({
      success: true,
      message: `Notification sent to ${student.name} successfully.`,
      studentName: student.name,
      studentEmail: student.email,
      fcmSent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
