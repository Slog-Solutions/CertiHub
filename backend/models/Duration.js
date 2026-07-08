const mongoose = require('mongoose');

const durationSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['day', 'week', 'month', 'hour', 'year'],
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Duration', durationSchema);
