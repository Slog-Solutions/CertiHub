const mongoose = require('mongoose');

const generatedCourseLinkSchema = new mongoose.Schema({
  courseDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseDetail',
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  generatedUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GeneratedCourseLink', generatedCourseLinkSchema);
