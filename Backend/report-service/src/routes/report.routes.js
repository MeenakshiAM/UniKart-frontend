const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const reportController = require("../controllers/report.controller");

// ── User routes ──────────────────────────────────────────────
router.post("/", authMiddleware, reportController.createReport);
router.get("/my", authMiddleware, reportController.getMyReports);

// ── Admin routes ─────────────────────────────────────────────
router.get(
  "/admin",
  authMiddleware, roleMiddleware("ADMIN"),
  reportController.getAllReports
);

router.get(
  "/admin/stats",
  authMiddleware, roleMiddleware("ADMIN"),
  reportController.getReportStats
);

router.patch(
  "/admin/:id/under-review",
  authMiddleware, roleMiddleware("ADMIN"),
  reportController.markUnderReview
);

router.patch(
  "/admin/:id/resolve",
  authMiddleware, roleMiddleware("ADMIN"),
  reportController.resolveReport
);

router.patch(
  "/admin/:id/reject",
  authMiddleware, roleMiddleware("ADMIN"),
  reportController.rejectReport
);

module.exports = router;