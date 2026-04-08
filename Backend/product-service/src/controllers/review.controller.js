const Review = require("../models/Review");
const mongoose = require("mongoose");
const reviewService = require("../services/review.service");

// Create Review
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id: productId } = req.params;
    const { rating, text, images } = req.body;

    const review = await reviewService.createReview({
      productId, userId, rating, text, images
    });

    res.status(201).json({ success: true, review });

  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : error.message.includes("already reviewed") ? 409
      : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Get Reviews by Product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reviewService.getReviewsByProductService(id, req.query);

    res.json({ success: true, ...result });

  } catch (error) {
    console.error("GET REVIEWS ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const { rating, text, images } = req.body;

    const review = await reviewService.updateReviewService({
      reviewId, userId, rating, text, images
    });

    res.json({ success: true, review });

  } catch (error) {
    console.error("UPDATE REVIEW ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : error.message.includes("Not allowed") ? 403
      : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;

    await reviewService.deleteReviewService({ reviewId, userId });

    res.json({ success: true, message: "Review deleted" });

  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : error.message.includes("Not allowed") ? 403
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Get Rating Stats
exports.getRatingStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await reviewService.getRatingBreakdown(id);

    res.json({ success: true, stats });

  } catch (error) {
    console.error("GET RATING STATS ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};