const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  // Service Reference
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
    index: true
  },

  // Slot Reference
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
    required: true
  },

  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // Booking Date
  bookingDate: {
    type: Date,
    required: true,
    index: true
  },

  startTime: {
    type: String,
    required: true
  },

  endTime: {
    type: String,
    required: true
  },

  // User Info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  userName: {
    type: String,
    required: true
  },

  userEmail: {
    type: String,
    required: true
  },

  userPhone: {
    type: String,
    //required: true
  },

  // Provider Info
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  providerName: {
    type: String,
    required: true
  },

  // Booking Details
  participants: {
    type: Number,
    default: 1,
    min: 1
  },

  specialRequests: {
    type: String,
    maxlength: 500
  },

  // Pricing
  pricing: {
    basePrice: { type: Number, required: true },
    serviceFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },

  // Payment
  payment: {
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },

    method: {
      type: String,
      enum: ["razorpay", "upi", "cash"]
    },

    transactionId: String,

    paidAt: Date,

    refundedAt: Date
  },

  // Booking Status
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "no_show"
    ],
    default: "pending",
    index: true
  },

  // Cancellation
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reason: String
  },

  // Meeting / WhatsApp Link (Reveal after booking)
  postBookingDetailsRevealed: {
    type: Boolean,
    default: false
  },

  revealedDetails: {
    whatsappGroupLink: String,
    meetingLink: String,
    instructions: String,
    revealedAt: Date
  },

  // Review
  review: {
    hasReviewed: {
      type: Boolean,
      default: false
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  }

}, {
  timestamps: true
});


// Indexes
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ serviceId: 1, bookingDate: 1 });
bookingSchema.index({ createdAt: -1 });


// Confirm booking
bookingSchema.methods.confirm = function () {
  this.status = "confirmed";
  return this.save();
};


// Complete payment
bookingSchema.methods.completePayment = function (transactionId, method) {
  this.payment.status = "completed";
  this.payment.transactionId = transactionId;
  this.payment.method = method;
  this.payment.paidAt = new Date();

  this.status = "confirmed";

  return this.save();
};


// Reveal meeting link after booking
bookingSchema.methods.revealPostBookingDetails = function (details) {
  this.postBookingDetailsRevealed = true;

  this.revealedDetails = {
    ...details,
    revealedAt: new Date()
  };

  return this.save();
};


// Cancel booking
bookingSchema.methods.cancelBooking = function (userId, reason) {

  this.status = "cancelled";

  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: userId,
    reason
  };

  return this.save();
};


// Mark completed
bookingSchema.methods.markCompleted = function () {
  this.status = "completed";
  return this.save();
};


// Provider bookings
bookingSchema.statics.getProviderBookings = function (providerId) {
  return this.find({ providerId }).sort({ bookingDate: -1 });
};


// User bookings
bookingSchema.statics.getUserBookings = function (userId) {
  return this.find({ userId }).sort({ bookingDate: -1 });
};


module.exports = mongoose.model("Booking", bookingSchema);