const mongoose = require('mongoose');

const deleteRequestSchema = new mongoose.Schema({
  // The User account requesting deletion
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The linked Student document (if any)
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  // Student's name (snapshot at request time, for display after deletion)
  studentName: {
    type: String,
    default: ''
  },
  // Student's email (snapshot)
  studentEmail: {
    type: String,
    default: ''
  },
  // Student's username / registration ID (snapshot)
  studentUsername: {
    type: String,
    default: ''
  },
  // Optional reason given by the student
  reason: {
    type: String,
    default: ''
  },
  // Status of the request
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // When the admin reviewed the request
  reviewedAt: {
    type: Date,
    default: null
  },
  // Admin who reviewed
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Optional note from admin
  adminNote: {
    type: String,
    default: ''
  }
}, {
  timestamps: true  // createdAt = requestedAt
});

module.exports = mongoose.model('DeleteRequest', deleteRequestSchema);
