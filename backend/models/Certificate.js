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
    required: true
  },
  courseDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseDetail',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateTemplate',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  pdfUrl: {
    type: String,
    required: true
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
