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
const { sendToToken, sendToTokens } = require('../utils/fcm');

/* ─────────────────────────────────────────────────────────────
   PATCH /api/push/fcm-token
   Register or update the caller's FCM device token.
   Accessible by any authenticated user (Teacher or Student).
───────────────────────────────────────────────────────────── */
router.patch('/fcm-token', requireAuth, async (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({ error: 'Valid FCM token is required.' });
  }

  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: token.trim() });
    console.log(`[FCM] Token registered for user: ${req.user.name} (${req.user.role})`);
    res.json({ success: true, message: 'FCM token registered successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/push/fcm-token
   Revoke / clear caller's FCM device token on logout.
   Accessible by any authenticated user.
───────────────────────────────────────────────────────────── */
router.delete('/fcm-token', requireAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: null });
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
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: null });
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
   Expert sends push notification to ALL candidates in a batch.
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

    // Fetch all students and their FCM tokens
    const students = await User.find({
      _id: { $in: batch.students },
      isActive: true
    }).select('name email fcmToken');

    const tokens = students.map(s => s.fcmToken).filter(Boolean);

    if (tokens.length > 0) {
      sendToTokens(tokens, title, message, {
        batchId: batch._id.toString(),
        batchName: batch.name,
        type: 'batch_announcement',
        sentBy: req.user.name
      }).catch(err => console.error('[FCM] Batch push error:', err.message));
    }

    res.json({
      success: true,
      message: `Push notification broadcasted to ${batch.students.length} candidate(s) in batch ${batch.name}.`,
      totalCandidates: batch.students.length,
      notifiedCount: tokens.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/push/student/:studentId
   Expert sends a direct push notification to a SPECIFIC candidate.
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
    }).select('name email fcmToken');

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

    // Fire FCM push if candidate has FCM token registered
    let fcmSent = false;
    if (student.fcmToken) {
      const fcmResult = await sendToToken(student.fcmToken, title.trim(), message.trim(), {
        studentId: student._id.toString(),
        type: 'direct_message',
        sentBy: req.user.name,
        batchName: sharedBatch.name
      });
      fcmSent = fcmResult.success;
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
