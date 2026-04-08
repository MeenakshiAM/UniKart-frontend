const mongoose = require("mongoose");

const sellerProfileSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,unique: true },

  shopName: { type: String, required: true },

  shopDescription: { type: String },

  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "REJECTED"],
    default: "PENDING"
  },

  agreedToCommission: { type: Boolean, default: false },

  shopImage: { type: String },
  shopBanner: { type: String },
  violationCount: {
    type: Number,
    default: 0
  },

  isShopBlocked: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });
module.exports = mongoose.model("SellerProfile", sellerProfileSchema);