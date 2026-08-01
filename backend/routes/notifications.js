const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const { requireAuth } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get all notifications (admin/staff portal)
// @access  Private (Admin & Staff)
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('collegeId', 'collegeName')
      .populate({
        path: 'courseDetailId',
        populate: { path: 'technologyId', select: 'name' }
      })
      .populate('sentBy', 'name username')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private (Admin & Staff)
router.post('/', requireAuth, async (req, res) => {
  const { title, message, collegeId, courseDetailId } = req.body;

  if (!title || !message || !collegeId || !courseDetailId) {
    return res.status(400).json({ error: 'Please provide all required fields (title, message, college, course)' });
  }

  try {
    const notification = new Notification({
      title,
      message,
      collegeId,
      courseDetailId,
      sentBy: req.user._id
    });

    await notification.save();

    const populated = await Notification.findById(notification._id)
      .populate('collegeId', 'collegeName')
      .populate({
        path: 'courseDetailId',
        populate: { path: 'technologyId', select: 'name' }
      })
      .populate('sentBy', 'name username');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private (Admin & Staff)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await Notification.deleteOne({ _id: req.params.id });
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/notifications/student
// @desc    Get notifications for a specific student (used by student app)
//          If queried by email or phone, verifies that the student is active (status is on).
// @access  Public (for client app integration)
router.get('/student', async (req, res) => {
  const { email, phone, collegeId, courseDetailId } = req.query;

  try {
    let targetCollegeId = collegeId;
    let targetCourseDetailId = courseDetailId;

    // If student credentials (email/phone) are provided, resolve and verify active status
    if (email || phone) {
      let query = {};
      if (email) query.email = email.trim();
      if (phone) query.phone = phone.trim();

      const student = await Student.findOne(query);

      if (!student) {
        return res.status(404).json({ error: 'Student record not found.' });
      }

      if (!student.isActive) {
        return res.status(403).json({ error: 'Access denied: student account is inactive.' });
      }

      targetCollegeId = student.collegeId;
      targetCourseDetailId = student.courseDetailId;
    }

    if (!targetCollegeId || !targetCourseDetailId) {
      return res.status(400).json({ error: 'College ID and Course Detail ID are required' });
    }

    const notices = await Notification.find({
      collegeId: targetCollegeId,
      courseDetailId: targetCourseDetailId
    })
    .populate('collegeId', 'collegeName')
    .populate({
      path: 'courseDetailId',
      populate: { path: 'technologyId', select: 'name' }
    })
    .sort({ createdAt: -1 });

    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
