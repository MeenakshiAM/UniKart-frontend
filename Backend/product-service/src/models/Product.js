const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000
    },

    type: {
      type: String,
      enum: ["PRODUCT"],
      required: true,
      index: true
    },

    category: {
      type: String,
      enum: [
        "ELECTRONICS",
        "BOOKS",
        "FURNITURE",
        "CLOTHING",
        "FOOD",
        "SPORTS",
        "BEAUTY",
        "TOYS",
        "OTHER"
      ],
      required: true,
      index: true
    },

    subCategory: {
      type: String
    },

    price: {
      basePrice: {
        type: Number,
        required: true,
        min: 0
      },
      commissionPercent: {
        type: Number,
        default: 10
      },
      finalPrice: {
        type: Number,
        required: true
      }
    },

    quantity: {
      type: Number,
      min: 0,
      required: function () {
        return this.type === "PRODUCT";
      }
    },

    // ✅ Updated images schema to store objects with url and public_id
    images: {
      type: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true }
        }
      ],
      validate: [
        {
          validator: function (arr) {
            return arr.length > 0;
          },
          message: "At least one image required"
        }
      ]
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "REJECTED", "HIDDEN", "OUT_OF_STOCK", "PENDING_APPROVAL"],
      required: true,
      index: true
    },

    moderationReason: {
      type: String,
      default: null
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    reviewCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);