const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  paymentMethod: {
    type: String,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  refundId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ userId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
