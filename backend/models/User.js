const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  generatedPassword: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['Admin', 'Staff', 'Teacher', 'Student'],
    default: 'Staff'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fcmToken: {
    type: String,
    default: null
  },
  fcmTokenWeb: {
    type: String,
    default: null
  },
  fcmTokenAndroid: {
    type: String,
    default: null
  },
  fcmTokenIos: {
    type: String,
    default: null
  },
  fcmTokens: [{
    type: String
  }],
  dob: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  branch: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    default: ''
  },
  technology: {
    type: String,
    default: ''
  },
  photoUrl: {
    type: String,
    default: ''
  },
  subBatch: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
