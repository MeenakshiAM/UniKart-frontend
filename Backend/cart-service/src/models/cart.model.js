const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  priceAtTime: {
    type: Number,
    required: true,
  }
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  
    totalPrice: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("Cart", cartSchema);