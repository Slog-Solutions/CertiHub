const mongoose = require('mongoose');

const marketingNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'anonymous', 'logged_in'],
    required: true
  },
  dataPayload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MarketingNotification', marketingNotificationSchema);
