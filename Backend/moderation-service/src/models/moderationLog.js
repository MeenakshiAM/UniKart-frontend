const mongoose = require("mongoose");

const moderationLogSchema = new mongoose.Schema(
  {
    inputText: { type: String },
    inputImages: { type: [String], default: [] }, // added
    toxicityScore: { type: Number },
    isAllowed: { type: Boolean, required: true },
    reasons: { type: [String], default: [] },
    imageDetails: { type: Array, default: [] }, // Vision API results per image
  },
  { timestamps: true }
);

module.exports = mongoose.model("ModerationLog", moderationLogSchema);