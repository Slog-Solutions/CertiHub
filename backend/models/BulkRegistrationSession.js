const mongoose = require('mongoose');

/**
 * BulkRegistrationSession — stores each named batch import permanently.
 * Every time an expert uploads an Excel file in the Bulk Register Dashboard,
 * a session document is created so the results can be revisited anytime.
 */
const bulkRegistrationSessionSchema = new mongoose.Schema({
  sessionName: {
    type: String,
    required: true,
    trim: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // All user IDs registered in this session
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalRegistered: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BulkRegistrationSession', bulkRegistrationSessionSchema);
