const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const Batch = require('../models/Batch');
const { requireAuth } = require('../middleware/auth');

// @route   POST /api/queries
// @desc    Submit a new student query / doubt
// @access  Private (Student)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { batchId, topicId, topicTitle, title, description, priority } = req.body;

    if (!batchId || !title || !description) {
      return res.status(400).json({ error: 'Batch, title, and description are required.' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const newQuery = new Query({
      studentId: req.user._id,
      studentName: req.user.name || req.user.username,
      studentEmail: req.user.email || '',
      batchId: batch._id,
      batchName: batch.name,
      teacherId: batch.teacherId || null,
      topicId: topicId || null,
      topicTitle: topicTitle || 'General Course Doubt',
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'Medium',
      status: 'Pending',
      replies: []
    });

    await newQuery.save();
    res.status(201).json(newQuery);
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ error: error.message || 'Failed to submit query.' });
  }
});

// @route   GET /api/queries/student
// @desc    Get queries submitted by logged-in student
// @access  Private (Student)
router.get('/student', requireAuth, async (req, res) => {
  try {
    const { batchId, status } = req.query;
    const filter = { studentId: req.user._id };

    if (batchId) filter.batchId = batchId;
    if (status) filter.status = status;

    const queries = await Query.find(filter)
      .sort({ updatedAt: -1 })
      .populate('teacherId', 'name email');

    res.json(queries);
  } catch (error) {
    console.error('Error fetching student queries:', error);
    res.status(500).json({ error: 'Failed to fetch queries.' });
  }
});

// @route   GET /api/queries/teacher
// @desc    Get queries for expert/teacher dashboard (batches taught or all if admin)
// @access  Private (Teacher/Admin/Staff)
router.get('/teacher', requireAuth, async (req, res) => {
  try {
    const { batchId, status } = req.query;
    let filter = {};

    if (req.user.role === 'Teacher') {
      // Find batches where this teacher is assigned
      const teacherBatches = await Batch.find({
        $or: [
          { teacherId: req.user._id },
          { 'teachers.teacherId': req.user._id }
        ]
      }).select('_id');
      const batchIds = teacherBatches.map(b => b._id);
      filter = {
        $or: [
          { teacherId: req.user._id },
          { batchId: { $in: batchIds } }
        ]
      };
    }

    if (batchId) filter.batchId = batchId;
    if (status) filter.status = status;

    const queries = await Query.find(filter)
      .sort({ updatedAt: -1 })
      .populate('studentId', 'name email mobile')
      .populate('batchId', 'name batchId');

    res.json(queries);
  } catch (error) {
    console.error('Error fetching teacher queries:', error);
    res.status(500).json({ error: 'Failed to fetch student queries.' });
  }
});

// @route   POST /api/queries/:id/reply
// @desc    Add a reply message to a query thread
// @access  Private
router.post('/:id/reply', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Reply message cannot be empty.' });
    }

    const queryDoc = await Query.findById(req.params.id);
    if (!queryDoc) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    const reply = {
      senderId: req.user._id,
      senderName: req.user.name || req.user.username,
      senderRole: req.user.role || 'Student',
      message: message.trim(),
      createdAt: new Date()
    };

    queryDoc.replies.push(reply);

    // Auto-update status if teacher/admin responds
    if (['Teacher', 'Admin', 'Staff'].includes(req.user.role)) {
      if (queryDoc.status === 'Pending') {
        queryDoc.status = 'Answered';
      }
    } else if (req.user.role === 'Student') {
      // If student replies after answered, mark back to In Progress
      if (queryDoc.status === 'Answered') {
        queryDoc.status = 'In Progress';
      }
    }

    await queryDoc.save();

    const updated = await Query.findById(queryDoc._id)
      .populate('teacherId', 'name email')
      .populate('studentId', 'name email');

    res.json(updated);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply.' });
  }
});

// @route   PATCH /api/queries/:id/status
// @desc    Update query resolution status
// @access  Private
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'In Progress', 'Answered', 'Resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid query status.' });
    }

    const queryDoc = await Query.findById(req.params.id);
    if (!queryDoc) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    // Check authorization: Student can change their own query status, or Teacher/Admin
    if (
      queryDoc.studentId.toString() !== req.user._id.toString() &&
      !['Teacher', 'Admin', 'Staff'].includes(req.user.role)
    ) {
      return res.status(403).json({ error: 'Not authorized to update status.' });
    }

    queryDoc.status = status;
    await queryDoc.save();

    const updated = await Query.findById(queryDoc._id)
      .populate('teacherId', 'name email')
      .populate('studentId', 'name email');

    res.json(updated);
  } catch (error) {
    console.error('Error updating query status:', error);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// @route   DELETE /api/queries/:id
// @desc    Delete a query
// @access  Private
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const queryDoc = await Query.findById(req.params.id);
    if (!queryDoc) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    // Only query owner or Teacher/Admin can delete
    if (
      queryDoc.studentId.toString() !== req.user._id.toString() &&
      !['Teacher', 'Admin', 'Staff'].includes(req.user.role)
    ) {
      return res.status(403).json({ error: 'Not authorized to delete this query.' });
    }

    await Query.findByIdAndDelete(req.params.id);
    res.json({ message: 'Query deleted successfully.' });
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).json({ error: 'Failed to delete query.' });
  }
});

module.exports = router;
