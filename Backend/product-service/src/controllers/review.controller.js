const reviewService = require("../services/review.service");

// 🔥 Helper: consistent error handler
const handleError = (res, error) => {
  console.error("REVIEW ERROR:", error.message);

  if (error.message.includes("Invalid")) {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (error.message.includes("not found")) {
    return res.status(404).json({ success: false, message: error.message });
  }

  if (error.message.includes("already reviewed")) {
    return res.status(409).json({ success: false, message: error.message });
  }

  if (error.message.includes("Not allowed")) {
    return res.status(403).json({ success: false, message: error.message });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};


// ================= CREATE =================
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      targetType,
      targetId,
      rating,
      text,
      images
    } = req.body;

    console.log("🔥 BODY:", req.body);

    const review = await reviewService.createReview({
      targetType,
      targetId,
      userId,
      rating,
      text,
      images
    });

    return res.status(201).json({
      success: true,
      review
    });

  } catch (error) {
    console.log("REVIEW ERROR:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ================= GET BY PRODUCT =================
exports.getReviewsByProduct = async (req, res) => {
  try {
    const targetId = req.params.id;
    const targetType =  "PRODUCT";

    const result = await reviewService.getReviewsByProductService(
      targetId,
      targetType,
      req.query
    );
    console.log(result);
    return res.json({
      success: true,
      reviews: result,
    });

  } catch (error) {
    return handleError(res, error);
  }
};

// ================= UPDATE =================
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;

    const { rating, text, images } = req.body;

    const review = await reviewService.updateReviewService({
      reviewId,
      userId,
      rating,
      text,
      images,
    });

    return res.json({
      success: true,
      data: review,
    });

  } catch (error) {
    return handleError(res, error);
  }
};


// ================= DELETE =================
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;

    await reviewService.deleteReviewService({
      reviewId,
      userId,
    });

    return res.json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    return handleError(res, error);
  }
};


// ================= STATS =================
exports.getRatingStats = async (req, res) => {
  try {
    const productId = req.params.id;

    const stats = await reviewService.getRatingBreakdown(productId);

    return res.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    return handleError(res, error);
  }
};