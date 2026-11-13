const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    default: null
  },
  courseDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseDetail',
    default: null
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateTemplate',
    default: null
  },
  // Template file (backend/templates) this certificate's PDF was generated with
  templateFile: {
    type: String,
    default: null
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  pdfUrl: {
    type: String,
    required: true
  },
  pdfUrlUnsigned: {
    type: String,
    default: ''
  },
  signatureOption: {
    type: String,
    enum: ['none', 'both', 'left', 'right'],
    default: 'none'
  },
  signatureApprovalStatus: {
    type: String,
    enum: ['NotRequired', 'Pending', 'Approved', 'Rejected'],
    default: 'NotRequired'
  },
  leftApproval: {
    status: {
      type: String,
      enum: ['NotRequired', 'Pending', 'Approved', 'Rejected'],
      default: 'NotRequired'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    }
  },
  rightApproval: {
    status: {
      type: String,
      enum: ['NotRequired', 'Pending', 'Approved', 'Rejected'],
      default: 'NotRequired'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    }
  },
  qrCodeUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Revoked'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);
