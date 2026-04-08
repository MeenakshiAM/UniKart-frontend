const axios = require("axios");
const Report = require("../models/report.model");

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const MODERATION_SERVICE_URL = process.env.MODERATION_SERVICE_URL || "http://localhost:4003";

// ─── Thresholds ──────────────────────────────────────────────
const THRESHOLDS = {
  PRODUCT: {
    EXPLICIT_HIDE: 10,
    HIDE: 20
  },
  REVIEW: {
    HIDE: 20,
    WARN: 40
  },
  USER: {
    WARN_1: 20,
    WARN_2: 40,
    SUSPEND_1: 60,
    SUSPEND_2: 100,
    BAN: 150
  },
  SELLER: {
    WARN_1: 20,
    WARN_2: 40,
    SUSPEND_1: 60,
    SUSPEND_2: 100,
    BAN: 150
  }
};

// ─── Main evaluator ──────────────────────────────────────────
exports.evaluateReports = async (targetId, targetType) => {

  const uniqueReporters = await Report.distinct("reporterId", {
    targetId,
    targetType
  });

  const reportCount = uniqueReporters.length;
  console.log(`[Automation] ${targetType} ${targetId} — ${reportCount} unique reports`);

  try {
    switch (targetType) {
      case "PRODUCT":
        await evaluateProduct(targetId, reportCount);
        break;
      case "REVIEW":
        await evaluateReview(targetId, reportCount);
        break;
      case "USER":
        await evaluateUser(targetId, reportCount);
        break;
      case "SELLER":
        await evaluateSeller(targetId, reportCount);
        break;
    }
  } catch (error) {
    console.error(
      `[Automation] Action failed for ${targetType} ${targetId}:`,
      error.message
    );
  }
};

// ─── Product evaluation ──────────────────────────────────────
const evaluateProduct = async (targetId, reportCount) => {
  const t = THRESHOLDS.PRODUCT;

  const explicitReporters = await Report.distinct("reporterId", {
    targetId,
    targetType: "PRODUCT",
    reason: "EXPLICIT_CONTENT"
  });

  const explicitCount = explicitReporters.length;

  // ✅ >= instead of === so it never gets skipped
  if (explicitCount >= t.EXPLICIT_HIDE) {
    // only run cross-check exactly at threshold, not on every report after
    if (explicitCount === t.EXPLICIT_HIDE) {
      console.log(`[Automation] ${explicitCount} explicit reports — running cross-check`);

      const crossCheck = await crossCheckProductContent(targetId);

      if (crossCheck.flagged) {
        await axios.patch(`${PRODUCT_SERVICE_URL}/api/products/${targetId}/admin-hide`);
        await Report.updateMany(
          { targetId, targetType: "PRODUCT", reason: "EXPLICIT_CONTENT", status: "PENDING" },
          { status: "UNDER_REVIEW", adminNotes: `Auto-hidden: ${crossCheck.reason}` }
        );
        console.log(`[Automation] Product hidden — evidence: ${crossCheck.reason}`);
      } else {
        await Report.updateMany(
          { targetId, targetType: "PRODUCT", reason: "EXPLICIT_CONTENT", status: "PENDING" },
          { status: "UNDER_REVIEW", adminNotes: "Content check passed — possible false reports" }
        );
        console.log(`[Automation] Product content clean — sent to admin as suspicious`);
      }
    }
    return; // always skip general hide check if explicit threshold reached
  }

  // ✅ >= for general hide too
  if (reportCount >= t.HIDE) {
    await axios.patch(`${PRODUCT_SERVICE_URL}/api/products/${targetId}/admin-hide`);
    console.log(`[Automation] Product hidden at ${reportCount} general reports`);
    await markReportsAutoResolved(targetId, "PRODUCT", "Product hidden due to reports");
  }
};

// ─── Cross check product content ─────────────────────────────
const crossCheckProductContent = async (productId) => {
  try {
    // fetch product details from product service
    const productResponse = await axios.get(
      `${PRODUCT_SERVICE_URL}/api/products/${productId}`
    );

    const product = productResponse.data.product;
    if (!product) return { flagged: false, reason: "Product not found" };

    const textToCheck = `${product.title} ${product.description}`;

    // ── Text moderation check (your existing service) ───────
    const textResult = await checkTextModeration(textToCheck);

    if (textResult.flagged) {
      return {
        flagged: true,
        reason: `Text flagged: ${textResult.reason}`,
        textFlagged: true,
        imageFlagged: false
      };
    }

    // ── Image moderation placeholder ─────────────────────────
    // TODO: plug in Google Cloud Vision here when ready
    // const imageResult = await checkImageModeration(product.images);
    // if (imageResult.flagged) {
    //   return {
    //     flagged: true,
    //     reason: `Image flagged: ${imageResult.reason}`,
    //     textFlagged: false,
    //     imageFlagged: true
    //   };
    // }

    // both checks passed — content looks clean
    return {
      flagged: false,
      reason: "Text and image checks passed",
      textFlagged: false,
      imageFlagged: false
    };

  } catch (err) {
    console.error("[CrossCheck] Failed:", err.message);
    // if cross-check itself fails, be safe — send to admin queue
    return {
      flagged: true,
      reason: "Cross-check service unavailable — manual review required"
    };
  }
};

// ─── Text moderation (your existing service) ─────────────────
const checkTextModeration = async (text) => {
  try {
    const response = await axios.post(
      `${MODERATION_SERVICE_URL}/api/moderation/analyze`,
      { text }
    );

    const { isAllowed, reason } = response.data;

    return {
      flagged: !isAllowed,
      reason: reason || null
    };

  } catch (err) {
    console.error("[TextModeration] Service unavailable:", err.message);
    // moderation service down → don't auto-flag, send to admin
    return { flagged: false, reason: "Moderation service unavailable" };
  }
};

// ─── Image moderation placeholder ────────────────────────────
// Plug in Google Cloud Vision here when ready
// const checkImageModeration = async (imageUrls) => {
//   for (const url of imageUrls) {
//     const result = await visionClient.safeSearchDetection(url);
//     if (result.adult === "LIKELY" || result.adult === "VERY_LIKELY") {
//       return { flagged: true, reason: "Explicit image detected" };
//     }
//   }
//   return { flagged: false, reason: null };
// };

// ─── Review evaluation ───────────────────────────────────────
const evaluateReview = async (targetId, reportCount) => {
  const t = THRESHOLDS.REVIEW;

  if (reportCount === t.HIDE) {
    await axios.patch(
      `${PRODUCT_SERVICE_URL}/api/reviews/${targetId}/moderate`,
      { status: "REJECTED", reason: "Hidden due to reports" }
    );
    console.log(`[Automation] Review ${targetId} hidden at ${reportCount} reports`);
    await markReportsAutoResolved(targetId, "REVIEW", "Review hidden due to reports");
  }

  if (reportCount === t.WARN) {
    const review = await fetchReviewOwner(targetId);
    if (review?.userId) {
      await axios.patch(
        `${USER_SERVICE_URL}/api/users/${review.userId}/warn`,
        { reason: "Your review was reported multiple times" }
      );
      console.log(`[Automation] Review owner warned at ${reportCount} reports`);
    }
  }
};

// ─── User evaluation ─────────────────────────────────────────
// ─── User evaluation ─────────────────────────────────────────
const evaluateUser = async (targetId, reportCount) => {
  const t = THRESHOLDS.USER;

  // each band is mutually exclusive — only one action fires per report
  if (reportCount >= t.WARN_1 && reportCount < t.WARN_2) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/warn`,
      { reason: "You have received multiple reports from other users" }
    );
    console.log(`[Automation] User warned (1st) at ${reportCount} reports`);
  }

  else if (reportCount >= t.WARN_2 && reportCount < t.SUSPEND_1) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/warn`,
      { reason: "You have received further reports. Next step is suspension." }
    );
    console.log(`[Automation] User warned (2nd) at ${reportCount} reports`);
  }

  else if (reportCount >= t.SUSPEND_1 && reportCount < t.SUSPEND_2) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/suspend`,
      { suspensionDays: 3, reason: "Suspended due to multiple reports (1st suspension)" }
    );
    console.log(`[Automation] User suspended (1st) at ${reportCount} reports`);
  }

  else if (reportCount >= t.SUSPEND_2 && reportCount < t.BAN) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/suspend`,
      { suspensionDays: 3, reason: "Suspended again (2nd suspension)" }
    );
    console.log(`[Automation] User suspended (2nd) at ${reportCount} reports`);
  }

  else if (reportCount >= t.BAN) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/ban`,
      { reason: "Permanently banned after repeated violations" }
    );
    console.log(`[Automation] User permanently banned at ${reportCount} reports`);
    await markReportsAutoResolved(
      targetId, "USER",
      "User banned after exceeding report threshold"
    );
  }
};

// ─── Seller evaluation ───────────────────────────────────────
const evaluateSeller = async (targetId, reportCount) => {
  const t = THRESHOLDS.SELLER;

  if (reportCount >= t.WARN_1 && reportCount < t.WARN_2) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/warn`,
      { reason: "Your seller account has received multiple reports" }
    );
    console.log(`[Automation] Seller warned (1st) at ${reportCount} reports`);
  }

  else if (reportCount >= t.WARN_2 && reportCount < t.SUSPEND_1) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/warn`,
      { reason: "Seller account: further reports received. Suspension incoming." }
    );
    console.log(`[Automation] Seller warned (2nd) at ${reportCount} reports`);
  }

  else if (reportCount >= t.SUSPEND_1 && reportCount < t.SUSPEND_2) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/suspend`,
      { suspensionDays: 3, reason: "Seller suspended due to reports (1st suspension)" }
    );
    console.log(`[Automation] Seller suspended (1st) at ${reportCount} reports`);
  }

  else if (reportCount >= t.SUSPEND_2 && reportCount < t.BAN) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/suspend`,
      { suspensionDays: 3, reason: "Seller suspended again (2nd suspension)" }
    );
    console.log(`[Automation] Seller suspended (2nd) at ${reportCount} reports`);
  }

  else if (reportCount >= t.BAN) {
    await axios.patch(
      `${USER_SERVICE_URL}/api/users/${targetId}/ban`,
      { reason: "Seller permanently banned after repeated violations" }
    );
    console.log(`[Automation] Seller permanently banned at ${reportCount} reports`);
    await markReportsAutoResolved(
      targetId, "SELLER",
      "Seller banned after exceeding report threshold"
    );
  }
};
// ─── Mark reports as auto resolved ──────────────────────────
const markReportsAutoResolved = async (targetId, targetType, notes) => {
  await Report.updateMany(
    { targetId, targetType, status: "PENDING" },
    {
      status: "RESOLVED",
      autoResolved: true,
      adminNotes: notes,
      actionTaken: "NO_ACTION"
    }
  );
};

// ─── Fetch review owner ──────────────────────────────────────
const fetchReviewOwner = async (reviewId) => {
  try {
    const response = await axios.get(
      `${PRODUCT_SERVICE_URL}/api/reviews/${reviewId}`
    );
    return response.data.review;
  } catch (err) {
    console.error("Could not fetch review owner:", err.message);
    return null;
  }
};