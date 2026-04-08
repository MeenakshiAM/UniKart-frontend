const mongoose = require("mongoose");
const axios = require("axios");
const Report = require("../models/report.model");
const { REASONS } = require("../models/report.model");
const automationService = require("./automation.service"); // ← add this

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

// ─── helper ─────────────────────────────────────────────────
const validateObjectId = (id, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}`);
  }
};

// ─── Auto reject explicit product ───────────────────────────
const autoRejectProduct = async (targetId) => {
  try {
    await axios.patch(
      `${PRODUCT_SERVICE_URL}/api/products/${targetId}/auto-reject`,
      { reason: "Explicit content reported by user" }
    );
    console.log(`Product ${targetId} auto-rejected`);
  } catch (err) {
    console.error("Auto-reject failed:", err.message);
  }
};

// ─── Create Report ───────────────────────────────────────────
exports.createReportService = async ({
  reporterId,
  targetType,
  targetId,
  reason,
  description
}) => {
  validateObjectId(targetId, "target ID");

  // validate reason is valid for this targetType
  const validReasons = REASONS[targetType];
  if (!validReasons || !validReasons.includes(reason)) {
    throw new Error(
      `Invalid reason for ${targetType}. Valid: ${validReasons.join(", ")}`
    );
  }

  // prevent self-reporting
  if (reporterId.toString() === targetId.toString()) {
    throw new Error("You cannot report yourself");
  }

  // check duplicate
  const existing = await Report.findOne({ reporterId, targetType, targetId });
  if (existing) throw new Error("You have already reported this");

  // ── EXPLICIT_CONTENT → bypass threshold, auto reject instantly ──
  if (targetType === "PRODUCT" && reason === "EXPLICIT_CONTENT") {
    const report = await Report.create({
      reporterId,
      targetType,
      targetId,
      reason,
      description,
      status: "RESOLVED",
      actionTaken: "REMOVE_CONTENT",
      adminNotes: "Auto-resolved: explicit content",
      autoResolved: true
    });

    await autoRejectProduct(targetId);

    return {
      report,
      message: "Report submitted. Content has been automatically removed.",
      autoResolved: true
    };
  }

  // ── All other reports → save then run threshold automation ──
  const report = await Report.create({
    reporterId,
    targetType,
    targetId,
    reason,
    description,
    status: "PENDING",
    autoResolved: false
  });

  // ← THIS WAS MISSING — run automation after every report
  await automationService.evaluateReports(targetId, targetType);

  return {
    report,
    message: "Report submitted successfully. Our team will review it.",
    autoResolved: false
  };
};

// ─── Get my reports ──────────────────────────────────────────
exports.getMyReportsService = async (reporterId) => {
  const reports = await Report.find({ reporterId }).sort({ createdAt: -1 });
  return reports;
};

// ─── Admin: get all reports with filters + pagination ────────
exports.getAllReportsService = async (query) => {
  const { status, targetType, page = 1, limit = 20 } = query;

  const filter = {};
  if (status) filter.status = status;
  if (targetType) filter.targetType = targetType;

  const total = await Report.countDocuments(filter);

  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return {
    reports,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  };
};

// ─── Admin: mark as under review ────────────────────────────
exports.markUnderReviewService = async (reportId, adminId) => {
  validateObjectId(reportId, "report ID");

  const report = await Report.findById(reportId);
  if (!report) throw new Error("Report not found");

  if (report.status !== "PENDING") {
    throw new Error("Only PENDING reports can be marked as under review");
  }

  report.status = "UNDER_REVIEW";
  report.resolvedBy = adminId;
  await report.save();

  return report;
};

// ─── Admin: resolve report ───────────────────────────────────
exports.resolveReportService = async (reportId, adminId, { action, adminNotes }) => {
  validateObjectId(reportId, "report ID");

  const validActions = [
    "WARN_USER",
    "SUSPEND_USER",
    "BAN_USER",
    "REMOVE_CONTENT",
    "NO_ACTION"
  ];

  if (!validActions.includes(action)) {
    throw new Error(`Invalid action. Valid: ${validActions.join(", ")}`);
  }

  const report = await Report.findById(reportId);
  if (!report) throw new Error("Report not found");

  if (report.status === "RESOLVED") throw new Error("Report is already resolved");
  if (report.autoResolved) throw new Error("This report was already auto-resolved");

  await executeAdminAction(report, action);

  report.status = "RESOLVED";
  report.actionTaken = action;
  report.adminNotes = adminNotes || null;
  report.resolvedBy = adminId;
  await report.save();

  return report;
};

// ─── Admin: reject report ────────────────────────────────────
exports.rejectReportService = async (reportId, adminId, adminNotes) => {
  validateObjectId(reportId, "report ID");

  const report = await Report.findById(reportId);
  if (!report) throw new Error("Report not found");

  if (report.status === "RESOLVED" || report.status === "REJECTED") {
    throw new Error("Report is already closed");
  }

  report.status = "REJECTED";
  report.actionTaken = "NO_ACTION";
  report.adminNotes = adminNotes || "Report dismissed";
  report.resolvedBy = adminId;
  await report.save();

  return report;
};

// ─── Admin: stats ────────────────────────────────────────────
exports.getReportStatsService = async () => {
  const byType = await Report.aggregate([
    { $group: { _id: "$targetType", count: { $sum: 1 } } }
  ]);

  const byStatus = await Report.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const total = await Report.countDocuments();
  const pending = await Report.countDocuments({ status: "PENDING" });
  const underReview = await Report.countDocuments({ status: "UNDER_REVIEW" });

  return { total, pending, underReview, byType, byStatus };
};

// ─── Execute admin action ────────────────────────────────────
const executeAdminAction = async (report, action) => {
  try {
    switch (action) {
      case "REMOVE_CONTENT":
        if (report.targetType === "PRODUCT") {
          await axios.patch(
            `${PRODUCT_SERVICE_URL}/api/products/${report.targetId}/auto-reject`,
            { reason: "Removed by admin" }
          );
        }
        if (report.targetType === "REVIEW") {
          await axios.patch(
            `${PRODUCT_SERVICE_URL}/api/reviews/${report.targetId}/moderate`,
            { status: "REJECTED", reason: "Removed by admin" }
          );
        }
        break;

      case "WARN_USER":
        await axios.patch(
          `${USER_SERVICE_URL}/api/users/${report.targetId}/warn`,
          { reason: "Warning issued by admin via report" }
        );
        break;

      case "SUSPEND_USER":
        await axios.patch(
          `${USER_SERVICE_URL}/api/users/${report.targetId}/status`,
          { status: "SUSPENDED" }
        );
        break;

      case "BAN_USER":
        await axios.patch(
          `${USER_SERVICE_URL}/api/users/${report.targetId}/status`,
          { status: "BANNED" }
        );
        break;

      case "NO_ACTION":
        break;
    }
  } catch (err) {
    console.error(`Action ${action} failed:`, err.message);
  }
};