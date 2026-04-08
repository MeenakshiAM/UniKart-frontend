"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { SelectField, TextAreaField } from "@/components/FormField";
import {
  getAdminReports,
  markReportUnderReview,
  rejectReport,
  REPORT_ACTIONS,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  resolveReport,
} from "@/services/report.service";

const initialResolveForm = {
  action: "WARN_USER",
  adminNotes: "",
};

function formatDate(date) {
  if (!date) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: "", targetType: "" });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [busyId, setBusyId] = useState("");
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveForm, setResolveForm] = useState(initialResolveForm);

  const loadReports = useCallback(async (nextPage = page, nextFilters = filters) => {
    try {
      setLoading(true);
      setStatus((current) => ({ ...current, message: current.type === "error" ? "" : current.message }));

      const response = await getAdminReports({
        page: nextPage,
        limit: 10,
        ...nextFilters,
      });

      setReports(response?.reports || []);
      setPage(response?.page || nextPage);
      setTotalPages(response?.totalPages || 1);
      setTotal(response?.total || 0);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Failed to load reports." });
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const runAction = async (reportId, action) => {
    setBusyId(reportId);
    setStatus({ type: "info", message: "" });

    try {
      await action();
      setStatus({ type: "success", message: "Report updated successfully." });
      await loadReports(page, filters);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Action failed." });
    } finally {
      setBusyId("");
    }
  };

  const openResolveModal = (report) => {
    setSelectedReport(report);
    setResolveForm({
      action: "WARN_USER",
      adminNotes: "",
    });
    setResolveModalOpen(true);
  };

  const handleResolveSubmit = async (event) => {
    event.preventDefault();

    if (!selectedReport?._id) {
      return;
    }

    await runAction(selectedReport._id, async () => {
      await resolveReport(selectedReport._id, {
        action: resolveForm.action,
        adminNotes: resolveForm.adminNotes.trim(),
      });
      setResolveModalOpen(false);
      setSelectedReport(null);
    });
  };

  const columns = [
    { key: "reporterId", label: "Reporter id" },
    { key: "targetType", label: "Target type" },
    { key: "reason", label: "Reason", render: (report) => report.reason.replaceAll("_", " ") },
    { key: "status", label: "Status", render: (report) => <StatusBadge status={report.status} /> },
    { key: "createdAt", label: "Created", render: (report) => formatDate(report.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (report) => {
        const pending = busyId === report._id;
        const isClosed = report.status === "RESOLVED" || report.status === "REJECTED";

        return (
          <div className="flex min-w-[16rem] flex-wrap gap-2">
            <button
              type="button"
              disabled={pending || report.status !== "PENDING"}
              onClick={() => runAction(report._id, () => markReportUnderReview(report._id))}
              className="btn-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Working..." : "Mark under review"}
            </button>
            <button
              type="button"
              disabled={pending || isClosed}
              onClick={() => openResolveModal(report)}
              className="btn-primary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resolve
            </button>
            <button
              type="button"
              disabled={pending || isClosed}
              onClick={() => runAction(report._id, () => rejectReport(report._id, {}))}
              className="rounded-2xl border border-[rgba(161,43,43,0.2)] bg-[rgba(161,43,43,0.08)] px-4 py-2 text-xs font-semibold text-[var(--danger)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <PageCard
        title="Reports dashboard"
        subtitle="Filter and manage incoming reports, move items into review, and resolve or reject cases with clear moderation actions."
      >
        <div className="space-y-6">
          <StatusMessage type={status.type}>{status.message}</StatusMessage>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">
              {loading ? "Loading reports..." : `${total} total report${total === 1 ? "" : "s"}`}
            </p>
            <Link href="/admin/reports/stats" className="btn-secondary">
              View stats
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Filter by status"
              htmlFor="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              options={REPORT_STATUSES}
              placeholder="All statuses"
            />
            <SelectField
              label="Filter by target type"
              htmlFor="targetType"
              name="targetType"
              value={filters.targetType}
              onChange={handleFilterChange}
              options={REPORT_TARGET_TYPES}
              placeholder="All target types"
            />
          </div>

          {loading ? (
            <div className="card-surface rounded-[1.75rem] p-8 text-center text-sm text-[var(--muted)]">
              Fetching moderation queue...
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                rows={reports}
                rowKey="_id"
                emptyMessage="No reports match the current filters."
              />
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>

        <Modal
          open={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          title="Resolve report"
          description="Choose the moderation action to apply and optionally leave admin notes for the audit trail."
        >
          <form className="space-y-5" onSubmit={handleResolveSubmit}>
            <div className="rounded-[1.5rem] border border-[rgba(114,75,43,0.12)] bg-[rgba(255,250,242,0.85)] p-4 text-sm text-[var(--muted)]">
              <p>
                <span className="font-semibold text-[var(--text)]">Target type:</span>{" "}
                {selectedReport?.targetType || "Unknown"}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-[var(--text)]">Reason:</span>{" "}
                {selectedReport?.reason?.replaceAll("_", " ") || "Unknown"}
              </p>
            </div>

            <SelectField
              label="Admin action"
              htmlFor="action"
              name="action"
              value={resolveForm.action}
              onChange={(event) => setResolveForm((current) => ({ ...current, action: event.target.value }))}
              options={REPORT_ACTIONS}
              required
            />

            <TextAreaField
              label="Admin notes"
              htmlFor="adminNotes"
              name="adminNotes"
              value={resolveForm.adminNotes}
              onChange={(event) => setResolveForm((current) => ({ ...current, adminNotes: event.target.value }))}
              placeholder="Leave moderation notes for internal context."
              maxLength={500}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busyId === selectedReport?._id}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === selectedReport?._id ? "Resolving..." : "Resolve report"}
              </button>
              <button type="button" onClick={() => setResolveModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </PageCard>
    </ProtectedRoute>
  );
}
