const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  registrationNo: {
    type: String,
    required: true,
    unique: true
  },
  // Candidate Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  fatherName: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  nationality: {
    type: String,
    default: 'Indian'
  },
  address: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    default: ''
  },
  // Institution/College Information
  workingStatus: {
    type: String,
    enum: ['student', 'working', 'other'],
    default: 'student'
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  year: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  // Training Information
  trainingType: {
    type: String,
    default: ''
  },
  courseDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseDetail',
    required: true
  },
  durationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duration',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  // Fee Summary
  totalFee: {
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

module.exports = mongoose.model('Student', studentSchema);
