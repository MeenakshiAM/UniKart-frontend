const mongoose = require("mongoose");

const REASONS = {
  PRODUCT: [
    "FAKE_PRODUCT",
    "MISLEADING_DESCRIPTION",
    "WRONG_CATEGORY",
    "SCAM",
    "EXPLICIT_CONTENT"   // ← only this one gets auto-handled
  ],
  REVIEW: [
    "FAKE_REVIEW",
    "OFFENSIVE_LANGUAGE",
    "SPAM"
  ],
  USER: [
    "SEXUAL_HARASSMENT",
    "ABUSIVE_BEHAVIOR",
    "BOT_OR_FAKE_ACCOUNT",
    "FRAUD"
  ],
  SELLER: [
    "FAKE_SELLER",
    "FRAUD",
    "SCAM",
    "BOT_OR_FAKE_ACCOUNT"
  ]
};

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,  
      required: true,
      index: true
    },

    targetType: {
      type: String,
      enum: ["PRODUCT", "REVIEW", "USER", "SELLER"], 
      required: true,
      index: true
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    reason: {
      type: String,
      required: true
    },

    description: {
      type: String,
      maxlength: 500,
      default: null
    },

    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "RESOLVED", "REJECTED"],
      default: "PENDING",
      index: true
    },

    adminNotes: {
      type: String,
      default: null
    },

    actionTaken: {
      type: String,
      enum: [
        "WARN_USER",
        "SUSPEND_USER",
        "BAN_USER",
        "REMOVE_CONTENT",
        "NO_ACTION",
        null
      ],
      default: null
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    autoResolved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);


reportSchema.index(
  { reporterId: 1, targetType: 1, targetId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Report", reportSchema);
module.exports.REASONS = REASONS;