import { createAxiosRequester } from "@/services/api";

export const REPORT_TARGET_TYPES = ["PRODUCT", "REVIEW", "USER", "SELLER"];
export const REPORT_STATUSES = ["PENDING", "UNDER_REVIEW", "RESOLVED", "REJECTED"];
export const REPORT_ACTIONS = [
  "WARN_USER",
  "SUSPEND_USER",
  "BAN_USER",
  "REMOVE_CONTENT",
  "NO_ACTION",
];

export const REPORT_REASON_OPTIONS = {
  PRODUCT: ["FAKE_PRODUCT", "MISLEADING_DESCRIPTION", "WRONG_CATEGORY", "SCAM", "EXPLICIT_CONTENT"],
  REVIEW: ["FAKE_REVIEW", "OFFENSIVE_LANGUAGE", "SPAM"],
  USER: ["SEXUAL_HARASSMENT", "ABUSIVE_BEHAVIOR", "BOT_OR_FAKE_ACCOUNT", "FRAUD"],
  SELLER: ["FAKE_SELLER", "FRAUD", "SCAM", "BOT_OR_FAKE_ACCOUNT"],
};

const REPORT_SERVICE_BASE_URL =
  process.env.NEXT_PUBLIC_REPORT_SERVICE_URL || "http://localhost:4005";

const reportApi = createAxiosRequester(REPORT_SERVICE_BASE_URL);

export function createReport(payload) {
  return reportApi("/api/reports", {
    method: "POST",
    data: payload,
  });
}

export function getMyReports() {
  return reportApi("/api/reports/my", {
    method: "GET",
  });
}

export function getAdminReports(params = {}) {
  return reportApi("/api/reports/admin", {
    method: "GET",
    params,
  });
}

export function markReportUnderReview(id) {
  return reportApi(`/api/reports/admin/${encodeURIComponent(id)}/under-review`, {
    method: "PATCH",
  });
}

export function resolveReport(id, payload) {
  return reportApi(`/api/reports/admin/${encodeURIComponent(id)}/resolve`, {
    method: "PATCH",
    data: payload,
  });
}

export function rejectReport(id, payload = {}) {
  return reportApi(`/api/reports/admin/${encodeURIComponent(id)}/reject`, {
    method: "PATCH",
    data: payload,
  });
}

export function getReportStats() {
  return reportApi("/api/reports/admin/stats", {
    method: "GET",
  });
}
