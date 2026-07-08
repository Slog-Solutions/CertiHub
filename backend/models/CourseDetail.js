const mongoose = require('mongoose');

const courseDetailSchema = new mongoose.Schema({
  technologyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technology',
    required: true
  },
  durationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duration',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CourseDetail', courseDetailSchema);
