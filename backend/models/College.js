const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  cityName: {
    type: String,
    required: true,
    trim: true
  },
  collegeName: {
    type: String,
    required: true,
    trim: true
  },
  shortForm: {
    type: String,
    required: true,
    trim: true
  },
  logoImageUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showSignature: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('College', collegeSchema);
