const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  installationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fcmToken: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web', 'unknown'],
    default: 'unknown'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isMarketingEnabled: {
    type: Boolean,
    default: true
  },
  lastSeenAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

deviceTokenSchema.index({ userId: 1 });
deviceTokenSchema.index({ fcmToken: 1 });

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
