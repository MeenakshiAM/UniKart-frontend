const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const auth= require("../middlewares/auth.middleware");



router.post(
  "/products/:id/reviews",
  auth,
  reviewController.createReview
);

router.get(
  "/products/:id/reviews",
  reviewController.getReviewsByProduct
);

router.delete(
  "/reviews/:reviewId",
  auth,
  reviewController.deleteReview
);

router.get(
  "/products/:id/reviews/stats",
  reviewController.getRatingStats
);

router.put(
  "/reviews/:reviewId",
  auth,
  reviewController.updateReview
);
module.exports = router;