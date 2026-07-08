const mongoose = require('mongoose');

const feeDiscountSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  totalFee: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  totalToPay: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FeeDiscount', feeDiscountSchema);
