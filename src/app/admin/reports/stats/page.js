"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { getReportStats } from "@/services/report.service";

const statCards = [
  { key: "total", label: "Total reports" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "rejected", label: "Rejected" },
];

export default function ReportStatsPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getReportStats();
        const byStatus = Array.isArray(response?.stats?.byStatus) ? response.stats.byStatus : [];

        const statusMap = byStatus.reduce((accumulator, entry) => {
          accumulator[entry._id] = entry.count;
          return accumulator;
        }, {});

        if (active) {
          setStats({
            total: response?.stats?.total || 0,
            pending: response?.stats?.pending || 0,
            resolved: statusMap.RESOLVED || 0,
            rejected: statusMap.REJECTED || 0,
          });
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Failed to load report stats.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <PageCard
        title="Report stats"
        subtitle="A lightweight moderation summary showing overall volume and where the queue currently stands."
      >
        <div className="space-y-6">
          {error ? <StatusMessage type="error">{error}</StatusMessage> : null}

          <div className="flex justify-end">
            <Link href="/admin/reports" className="btn-secondary">
              Back to dashboard
            </Link>
          </div>

          {loading ? (
            <div className="card-surface rounded-[1.75rem] p-8 text-center text-sm text-[var(--muted)]">
              Loading moderation stats...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <div
                  key={card.key}
                  className="rounded-[1.75rem] border border-[rgba(114,75,43,0.12)] bg-white/75 p-5 shadow-sm"
                >
                  <p className="text-sm font-medium text-[var(--muted)]">{card.label}</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text)]">
                    {stats[card.key]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageCard>
    </ProtectedRoute>
  );
}
