const express = require('express');
const router = express.Router();
const DeleteRequest = require('../models/DeleteRequest');
const DeletedUser = require('../models/DeletedUser');
const User = require('../models/User');
const Student = require('../models/Student');
const { requireAuth, requireRole } = require('../middleware/auth');

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT ENDPOINTS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * POST /api/delete-requests
 * Submit a new account deletion request (students only).
 * Idempotent: if a pending request already exists, returns it.
 */
router.post('/', requireAuth, requireRole(['Student']), async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user._id;

    // Check for an existing active (pending) request
    const existing = await DeleteRequest.findOne({ userId, status: 'pending' });
    if (existing) {
      return res.status(200).json({
        message: 'A deletion request is already pending review.',
        request: existing,
        alreadyExists: true
      });
    }

    // Try to find the linked Student document
    const studentDoc = await Student.findOne({
      $or: [
        { email: req.user.email },
        { registrationNo: req.user.username }
      ]
    });

    const newRequest = new DeleteRequest({
      userId,
      studentId: studentDoc ? studentDoc._id : null,
      studentName: req.user.name,
      studentEmail: req.user.email,
      studentUsername: req.user.username,
      reason: reason ? String(reason).trim() : '',
      status: 'pending'
    });

    await newRequest.save();

    return res.status(201).json({
      message: 'Your account deletion request has been submitted. It will be reviewed within 15–30 days.',
      request: newRequest
    });
  } catch (err) {
    console.error('Delete request submit error:', err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * GET /api/delete-requests/mine
 * Get the current student's deletion request status.
 */
router.get('/mine', requireAuth, requireRole(['Student']), async (req, res) => {
  try {
    // Return the most recent request (could be rejected + re-submitted)
    const request = await DeleteRequest.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    if (!request) {
      return res.json({ request: null });
    }

    return res.json({ request });
  } catch (err) {
    console.error('Fetch mine delete request error:', err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN ENDPOINTS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/delete-requests
 * List all delete requests. Filterable by ?status=pending|approved|rejected
 * Admin / Staff only.
 */
router.get('/', requireAuth, requireRole(['Admin', 'Staff']), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const requests = await DeleteRequest.find(filter)
      .populate('reviewedBy', 'name username')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(requests);
  } catch (err) {
    console.error('List delete requests error:', err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * GET /api/delete-requests/counts
 * Get status counts for admin badge display.
 */
router.get('/counts', requireAuth, requireRole(['Admin', 'Staff']), async (req, res) => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      DeleteRequest.countDocuments({ status: 'pending' }),
      DeleteRequest.countDocuments({ status: 'approved' }),
      DeleteRequest.countDocuments({ status: 'rejected' })
    ]);
    return res.json({ pending, approved, rejected, total: pending + approved + rejected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/delete-requests/:id
 * Get a single delete request detail (Admin / Staff).
 */
router.get('/:id', requireAuth, requireRole(['Admin', 'Staff']), async (req, res) => {
  try {
    const request = await DeleteRequest.findById(req.params.id)
      .populate('userId', 'name email username role')
      .populate('studentId', 'name email registrationNo')
      .populate('reviewedBy', 'name username')
      .lean();

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    return res.json(request);
  } catch (err) {
    console.error('Get delete request error:', err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * POST /api/delete-requests/:id/approve
 * Approve a deletion request:
 *   1. Snapshot User + Student data → deleted_users collection
 *   2. Hard-delete Student document
 *   3. Hard-delete User document
 *   4. Mark request as approved
 */
router.post('/:id/approve', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const { adminNote } = req.body;

    const request = await DeleteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Delete request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    // ── Step 1: Find live User document ──────────────────────────────────────
    const userDoc = await User.findById(request.userId).lean();
    if (!userDoc) {
      // User may have already been deleted — just mark approved
      request.status = 'approved';
      request.reviewedAt = new Date();
      request.reviewedBy = req.user._id;
      request.adminNote = adminNote || '';
      await request.save();
      return res.json({ message: 'User record not found (may already be deleted). Request marked as approved.' });
    }

    // ── Step 2: Find linked Student document ─────────────────────────────────
    const studentDoc = await Student.findOne({
      $or: [
        { email: userDoc.email },
        { registrationNo: userDoc.username }
      ]
    }).lean();

    // ── Step 3: Archive both snapshots into deleted_users ─────────────────────
    const archivedEntry = new DeletedUser({
      deleteRequestId: request._id,
      userData: userDoc,
      studentData: studentDoc || null,
      deletedAt: new Date(),
      approvedBy: req.user._id,
      approvedByName: req.user.name,
      deletionReason: request.reason,
      adminNote: adminNote || ''
    });
    await archivedEntry.save();

    // ── Step 4: Hard-delete Student document ──────────────────────────────────
    if (studentDoc) {
      await Student.findByIdAndDelete(studentDoc._id);
    }

    // ── Step 5: Hard-delete User document ────────────────────────────────────
    await User.findByIdAndDelete(userDoc._id);

    // ── Step 6: Update request status ────────────────────────────────────────
    request.status = 'approved';
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;
    request.adminNote = adminNote || '';
    await request.save();

    console.log(`[DELETE APPROVED] User: ${userDoc.name} (${userDoc.email}) archived by ${req.user.name}`);

    return res.json({
      message: `Account for "${userDoc.name}" has been permanently deleted and archived.`,
      archivedId: archivedEntry._id
    });
  } catch (err) {
    console.error('Approve delete request error:', err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * POST /api/delete-requests/:id/reject
 * Reject a deletion request with an optional admin note.
 */
router.post('/:id/reject', requireAuth, requireRole(['Admin', 'Staff']), async (req, res) => {
  try {
    const { adminNote } = req.body;

    const request = await DeleteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Delete request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    request.status = 'rejected';
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;
    request.adminNote = adminNote ? String(adminNote).trim() : '';
    await request.save();

    console.log(`[DELETE REJECTED] User: ${request.studentName} (${request.studentEmail}) rejected by ${req.user.name}`);

    return res.json({
      message: `Deletion request from "${request.studentName}" has been rejected.`,
      request
    });
  } catch (err) {
    console.error('Reject delete request error:', err.message);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
