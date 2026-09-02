const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentEmail: {
    type: String,
    default: '',
    trim: true
  },
  answerText: {
    type: String,
    default: '',
    trim: true
  },
  submissionUrl: {
    type: String,
    default: '',
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Submitted', 'Graded'],
    default: 'Submitted'
  },
  grade: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: '',
    trim: true
  },
  gradedAt: {
    type: Date,
    default: null
  }
});

const assignmentSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalPoints: {
    type: Number,
    default: 100
  },
  fileUrl: {
    type: String,
    default: '',
    trim: true
  },
  submissions: [submissionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
