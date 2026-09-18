const mongoose = require('mongoose');

const appVersionSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['android', 'ios'],
    unique: true
  },
  latestVersion: {
    type: String,
    required: true
  },
  minimumVersion: {
    type: String,
    required: true
  },
  forceUpdate: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AppVersion', appVersionSchema);
