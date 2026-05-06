const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  // ================= BASIC =================
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
    index: true
  },

  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
    required: true
  },

  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  bookingDate: {
    type: Date,
    required: true,
    index: true
  },

  startTime: { type: String, required: true },
  endTime: { type: String, required: true },

  // ================= USER =================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String },

  // ================= PROVIDER =================
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  providerName: {
    type: String,
    default: "Provider"
  },

  // ================= DETAILS =================
  participants: {
    type: Number,
    default: 1,
    min: 1
  },

  specialRequests: {
    type: String,
    maxlength: 500
  },

  // ================= PRICING =================
  pricing: {
    basePrice: { type: Number, required: true },
    serviceFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },

  // ================= PAYMENT LINK =================
  payment: {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment"
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    }
  },

  // ================= BOOKING STATUS =================
  status: {
    type: String,
    enum: [
      "pending_payment",
      "confirmed",
      "completed",
      "cancelled",
      "no_show"
    ],
    default: "pending_payment",
    index: true
  },

  // ================= CANCELLATION =================
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reason: String
  },

  // ================= POST BOOKING =================
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

  // ================= REVIEW =================
  review: {
    hasReviewed: { type: Boolean, default: false },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  }

}, { timestamps: true });


// ================= INDEXES =================
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ serviceId: 1, bookingDate: 1 });
bookingSchema.index({ createdAt: -1 });


// ================= METHODS =================
bookingSchema.methods.confirm = function () {
  this.status = "confirmed";
  return this.save();
};

bookingSchema.methods.completePayment = function (paymentId) {
  this.payment.paymentId = paymentId;
  this.payment.status = "paid";
  this.status = "confirmed";
  return this.save();
};

bookingSchema.methods.cancelBooking = function (userId, reason) {
  this.status = "cancelled";
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: userId,
    reason
  };
  return this.save();
};

bookingSchema.methods.markCompleted = function () {
  this.status = "completed";
  return this.save();
};


module.exports = mongoose.model("Booking", bookingSchema);