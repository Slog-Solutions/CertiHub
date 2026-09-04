const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Batch = require('../models/Batch');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { sendToTokens, extractUserFcmTokens } = require('../utils/fcm');

// @route   POST /api/assignments
// @desc    Create a new assignment for a batch
// @access  Private (Teacher/Admin/Staff)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { batchId, title, description, dueDate, totalPoints, fileUrl } = req.body;

    if (!batchId || !title || !description || !dueDate) {
      return res.status(400).json({ error: 'Batch, title, description, and due date are required.' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const newAssignment = new Assignment({
      batchId: batch._id,
      teacherId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate),
      totalPoints: totalPoints ? Number(totalPoints) : 100,
      fileUrl: fileUrl ? fileUrl.trim() : '',
      submissions: []
    });

    await newAssignment.save();

    // Fire FCM push to all enrolled students in the batch
    (async () => {
      try {
        const students = await User.find({
          _id: { $in: batch.students },
          isActive: true
        }).select('name email fcmToken fcmTokenWeb fcmTokenAndroid fcmTokenIos fcmTokens');

        const tokens = students.flatMap(s => extractUserFcmTokens(s));
        if (tokens.length > 0) {
          const dueStr = new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          await sendToTokens(tokens, 'New Assignment', `${title.trim()}. Due: ${dueStr}`, {
            type: 'assignment',
            audience: 'student',
            batchId: batch._id.toString(),
            assignmentId: newAssignment._id.toString(),
            tab: 'assignments',
            title: 'New Assignment',
            message: `${title.trim()}. Due: ${dueStr}`
          });
        }
      } catch (fcmErr) {
        console.error('[FCM] Assignment push error:', fcmErr.message);
      }
    })();

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: error.message || 'Failed to create assignment.' });
  }
});

// @route   GET /api/assignments/batch/:batchId
// @desc    Get assignments for a batch
// @access  Private
router.get('/batch/:batchId', requireAuth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ batchId: req.params.batchId })
      .sort({ createdAt: -1 })
      .populate('teacherId', 'name email');

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit candidate solution for an assignment
// @access  Private (Student)
router.post('/:id/submit', requireAuth, async (req, res) => {
  try {
    const { answerText, submissionUrl } = req.body;

    if (!answerText?.trim() && !submissionUrl?.trim()) {
      return res.status(400).json({ error: 'Please provide either a written response or solution URL.' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    const existingIdx = assignment.submissions.findIndex(
      s => s.studentId.toString() === req.user._id.toString()
    );

    const submissionData = {
      studentId: req.user._id,
      studentName: req.user.name || req.user.username,
      studentEmail: req.user.email || '',
      answerText: (answerText || '').trim(),
      submissionUrl: (submissionUrl || '').trim(),
      submittedAt: new Date(),
      status: 'Submitted'
    };

    if (existingIdx >= 0) {
      // Retain existing grade/feedback if re-submitting before grading
      submissionData.grade = assignment.submissions[existingIdx].grade;
      submissionData.feedback = assignment.submissions[existingIdx].feedback;
      assignment.submissions[existingIdx] = submissionData;
    } else {
      assignment.submissions.push(submissionData);
    }

    await assignment.save();

    const updated = await Assignment.findById(assignment._id)
      .populate('teacherId', 'name email');

    // Notify teacher via FCM push
    (async () => {
      try {
        if (assignment.teacherId) {
          const teacher = await User.findById(assignment.teacherId)
            .select('fcmToken fcmTokenWeb fcmTokenAndroid fcmTokenIos fcmTokens');
          const tokens = extractUserFcmTokens(teacher);
          if (tokens.length > 0) {
            const subRecord = assignment.submissions.find(s => s.studentId.toString() === req.user._id.toString());
            await sendToTokens(tokens, 'New Submission', `${req.user.name} submitted ${assignment.title}.`, {
              type: 'assignment_graded',
              audience: 'teacher',
              batchId: assignment.batchId.toString(),
              assignmentId: assignment._id.toString(),
              submissionId: subRecord?._id ? subRecord._id.toString() : '',
              title: 'New Submission',
              message: `${req.user.name} submitted ${assignment.title}.`
            });
          }
        }
      } catch (fcmErr) {
        console.error('[FCM] Submission push error:', fcmErr.message);
      }
    })();

    res.json(updated);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment.' });
  }
});

// @route   PATCH /api/assignments/:id/submissions/:submissionId/grade
// @desc    Grade a candidate's submission
// @access  Private (Teacher/Admin/Staff)
router.patch('/:id/submissions/:submissionId/grade', requireAuth, async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    const sub = assignment.submissions.id(req.params.submissionId);
    if (!sub) {
      return res.status(404).json({ error: 'Submission record not found.' });
    }

    sub.grade = grade !== undefined && grade !== null ? Number(grade) : sub.grade;
    sub.feedback = feedback !== undefined ? feedback.trim() : sub.feedback;
    sub.status = 'Graded';
    sub.gradedAt = new Date();

    await assignment.save();

    // Notify student via FCM push
    (async () => {
      try {
        const student = await User.findById(sub.studentId)
          .select('fcmToken fcmTokenWeb fcmTokenAndroid fcmTokenIos fcmTokens');
        const tokens = extractUserFcmTokens(student);
        if (tokens.length > 0) {
          const scoreMsg = `You scored ${sub.grade}/${assignment.totalPoints} on ${assignment.title}.`;
          await sendToTokens(tokens, 'Assignment Graded', scoreMsg, {
            type: 'assignment_graded',
            audience: 'student',
            batchId: assignment.batchId.toString(),
            assignmentId: assignment._id.toString(),
            submissionId: sub._id.toString(),
            tab: 'assignments',
            title: 'Assignment Graded',
            message: scoreMsg
          });
        }
      } catch (fcmErr) {
        console.error('[FCM] Graded push error:', fcmErr.message);
      }
    })();

    res.json(assignment);
  } catch (error) {
    console.error('Error grading assignment:', error);
    res.status(500).json({ error: 'Failed to grade assignment.' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment
// @access  Private (Teacher/Admin/Staff)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment.' });
  }
});

module.exports = router;
