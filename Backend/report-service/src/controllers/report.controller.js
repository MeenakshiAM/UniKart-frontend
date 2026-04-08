const reportService = require("../services/report.service");

// ─── User: submit report ─────────────────────────────────────
exports.createReport = async (req, res) => {
  try {
    const reporterId = req.user.userId;
    const { targetType, targetId, reason, description } = req.body;

    const result = await reportService.createReportService({
      reporterId,
      targetType,
      targetId,
      reason,
      description
    });

    res.status(201).json({ success: true, ...result });

  } catch (error) {
    console.error("CREATE REPORT ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("already reported") ? 409
      : error.message.includes("cannot report") ? 403
      : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ─── User: get my reports ────────────────────────────────────
exports.getMyReports = async (req, res) => {
  try {
    const reports = await reportService.getMyReportsService(req.user.userId);
    res.json({ success: true, count: reports.length, reports });

  } catch (error) {
    console.error("GET MY REPORTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Admin: get all reports ──────────────────────────────────
exports.getAllReports = async (req, res) => {
  try {
    const result = await reportService.getAllReportsService(req.query);
    res.json({ success: true, ...result });

  } catch (error) {
    console.error("GET ALL REPORTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Admin: mark under review ────────────────────────────────
exports.markUnderReview = async (req, res) => {
  try {
    const report = await reportService.markUnderReviewService(
      req.params.id,
      req.user.userId
    );
    res.json({ success: true, message: "Marked as under review", report });

  } catch (error) {
    console.error("MARK UNDER REVIEW ERROR:", error.message);
    const status = error.message.includes("not found") ? 404
      : error.message.includes("Only PENDING") ? 400
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ─── Admin: resolve report ───────────────────────────────────
exports.resolveReport = async (req, res) => {
  try {
    const { action, adminNotes } = req.body;
    const report = await reportService.resolveReportService(
      req.params.id,
      req.user.userId,
      { action, adminNotes }
    );
    res.json({ success: true, message: "Report resolved", report });

  } catch (error) {
    console.error("RESOLVE REPORT ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : error.message.includes("already") ? 409
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ─── Admin: reject report ────────────────────────────────────
exports.rejectReport = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const report = await reportService.rejectReportService(
      req.params.id,
      req.user.userId,
      adminNotes
    );
    res.json({ success: true, message: "Report rejected", report });

  } catch (error) {
    console.error("REJECT REPORT ERROR:", error.message);
    const status = error.message.includes("not found") ? 404
      : error.message.includes("already closed") ? 409
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ─── Admin: stats ────────────────────────────────────────────
exports.getReportStats = async (req, res) => {
  try {
    const stats = await reportService.getReportStatsService();
    res.json({ success: true, stats });

  } catch (error) {
    console.error("REPORT STATS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};