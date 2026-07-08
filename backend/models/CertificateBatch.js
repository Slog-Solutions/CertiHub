const mongoose = require('mongoose');

const certificateBatchSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  totalRows: {
    type: Number,
    required: true
  },
  successCount: {
    type: Number,
    required: true
  },
  failureCount: {
    type: Number,
    required: true
  },
  failures: [{
    row: Number,
    registrationNo: String,
    reason: String
  }],
  certificateIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('CertificateBatch', certificateBatchSchema);
