const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const auth = require("../middlewares/auth.middleware");

// ================= CREATE REVIEW =================
// POST /api/reviews/product/:id
// POST /api/reviews/service/:id
router.post(
  "/:targetType/:id",
  auth,
  reviewController.createReview
);

// ================= GET REVIEWS =================
// GET /api/reviews/product/:id
// GET /api/reviews/service/:id
router.get(
  "/:targetType/:id",
  reviewController.getReviewsByProduct
);

// ================= GET STATS =================
// GET /api/reviews/product/:id/stats
// GET /api/reviews/service/:id/stats
router.get(
  "/:targetType/:id/stats",
  reviewController.getRatingStats
);

// ================= UPDATE REVIEW =================
// PUT /api/reviews/:reviewId
router.put(
  "/:reviewId",
  auth,
  reviewController.updateReview
);

// ================= DELETE REVIEW =================
// DELETE /api/reviews/:reviewId
router.delete(
  "/:reviewId",
  auth,
  reviewController.deleteReview
);

module.exports = router;