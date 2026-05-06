const Review = require("../models/Review");
const Product = require("../models/Product");
const Service = require("../models/Service");
const mongoose = require("mongoose");

// ================= HELPERS =================
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ID");
  }
};

const getTargetModel = (targetType) => {
  const type = targetType?.toUpperCase();

  if (type === "PRODUCT") return Product;
  if (type === "SERVICE") return Service;

  throw new Error("Invalid target type");
};

// ================= CREATE REVIEW =================
exports.createReview = async ({
  targetType,
  targetId,
  userId,
  rating,
  text,
  images,
}) => {
  validateObjectId(targetId);

  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (images && images.length > 3) {
    throw new Error("Maximum 3 images allowed");
  }

  const Model = getTargetModel(targetType);

  const target = await Model.findById(targetId);
  if (!target) throw new Error("Target not found");

  const existing = await Review.findOne({
    targetId: new mongoose.Types.ObjectId(targetId),
    userId,
  });

  if (existing) {
    throw new Error("You already reviewed this item");
  }

  const review = await Review.create({
    targetType: targetType.toUpperCase(),
    targetId: new mongoose.Types.ObjectId(targetId),
    userId,
    rating,
    text,
    images,
  });

  await exports.updateRating(targetId, targetType);

  return review;
};

// ================= UPDATE REVIEW =================
exports.updateReview = async ({
  reviewId,
  userId,
  rating,
  text,
  images,
}) => {
  validateObjectId(reviewId);

  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");

  if (review.userId.toString() !== userId) {
    throw new Error("Not allowed");
  }

  if (rating != null) {
    if (rating < 1 || rating > 5) {
      throw new Error("Invalid rating");
    }
    review.rating = rating;
  }

  if (text != null) review.text = text;
  if (images != null) review.images = images;

  await review.save();

  await exports.updateRating(review.targetId, review.targetType);

  return review;
};

// ================= DELETE REVIEW =================
exports.deleteReview = async ({ reviewId, userId }) => {
  validateObjectId(reviewId);

  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");

  if (review.userId.toString() !== userId) {
    throw new Error("Not allowed");
  }

  const { targetId, targetType } = review;

  await review.deleteOne();

  await exports.updateRating(targetId, targetType);

  return { message: "Review deleted" };
};

// ================= GET REVIEWS =================
exports.getReviews = async (targetId, query = {}) => {
  validateObjectId(targetId);

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const filter = {
    targetId: new mongoose.Types.ObjectId(targetId), // 🔥 FIXED
    status: "ACTIVE",
  };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email"), // optional but useful

    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// ================= UPDATE RATING =================
exports.updateRating = async (targetId, targetType) => {
  const stats = await Review.aggregate([
    {
      $match: {
        targetId: new mongoose.Types.ObjectId(targetId),
        status: "ACTIVE",
      },
    },
    {
      $group: {
        _id: "$targetId",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const update =
    stats.length > 0
      ? {
          averageRating: Number(stats[0].avgRating.toFixed(2)),
          reviewCount: stats[0].reviewCount,
        }
      : {
          averageRating: 0,
          reviewCount: 0,
        };

  const Model = getTargetModel(targetType);

  await Model.findByIdAndUpdate(targetId, update);
};

// ================= GET REVIEWS BY PRODUCT/SERVICE =================
exports.getReviewsByProductService = async (targetId, query = {}) => {
  return await exports.getReviews(targetId, query);
};