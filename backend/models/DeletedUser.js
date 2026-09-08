const mongoose = require('mongoose');

/**
 * DeletedUser — Archive collection for approved account deletions.
 * Stores a full snapshot of both the User and Student documents
 * so data is never truly lost and can be audited or restored.
 */
const deletedUserSchema = new mongoose.Schema({
  // Reference to the delete request that triggered this archive
  deleteRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeleteRequest',
    default: null
  },

  // ─── Full User document snapshot ───────────────────────────────────────────
  userData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // ─── Full Student document snapshot (null if no Student record existed) ────
  studentData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  // ─── Deletion metadata ─────────────────────────────────────────────────────
  deletedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedByName: {
    type: String,
    default: ''
  },
  // Optional reason given by the student at request time
  deletionReason: {
    type: String,
    default: ''
  },
  // Optional admin note at approval time
  adminNote: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'deleted_users'   // Explicit collection name as per requirements
});

module.exports = mongoose.model('DeletedUser', deletedUserSchema);
