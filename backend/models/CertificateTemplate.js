const mongoose = require('mongoose');

const certificateTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);
