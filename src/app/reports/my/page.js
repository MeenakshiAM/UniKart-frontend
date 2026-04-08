"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import Table from "@/components/Table";
import StatusBadge from "@/components/StatusBadge";
import { getMyReports } from "@/services/report.service";

function formatDate(date) {
  if (!date) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyReports();

        if (active) {
          setReports(response?.reports || []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Failed to load your reports.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const columns = [
    { key: "targetType", label: "Target type" },
    { key: "reason", label: "Reason", render: (report) => report.reason.replaceAll("_", " ") },
    { key: "status", label: "Status", render: (report) => <StatusBadge status={report.status} /> },
    { key: "createdAt", label: "Created at", render: (report) => formatDate(report.createdAt) },
  ];

  return (
    <ProtectedRoute>
      <PageCard
        title="My reports"
        subtitle="Track every report you have filed and see whether it is still pending, under review, resolved, or rejected."
      >
        <div className="space-y-6">
          {error ? <StatusMessage type="error">{error}</StatusMessage> : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">
              {loading ? "Loading your report history..." : `${reports.length} report${reports.length === 1 ? "" : "s"} found`}
            </p>
            <Link href="/reports/create" className="btn-primary">
              Create new report
            </Link>
          </div>

          {loading ? (
            <div className="card-surface rounded-[1.75rem] p-8 text-center text-sm text-[var(--muted)]">
              Fetching your reports...
            </div>
          ) : (
            <Table
              columns={columns}
              rows={reports}
              rowKey="_id"
              emptyMessage="You have not submitted any reports yet."
            />
          )}
        </div>
      </PageCard>
    </ProtectedRoute>
  );
}
