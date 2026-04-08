"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { getStoredUser } from "@/utils/auth";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <ProtectedRoute>
      <PageCard
        title="Your dashboard"
        subtitle="This protected page uses the stored JWT session and redirects to login if the token is missing."
      >
        <div className="space-y-6">
          <StatusMessage type="info">
            If the backend returns `401` from any protected API call, the frontend clears localStorage and sends the user back to login automatically.
          </StatusMessage>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-5">
              <p className="text-sm text-[var(--muted)]">Name</p>
              <p className="mt-2 text-xl font-semibold">{user?.name || "Unknown user"}</p>
            </div>
            <div className="rounded-[1.75rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-5">
              <p className="text-sm text-[var(--muted)]">Email</p>
              <p className="mt-2 break-all text-xl font-semibold">{user?.email || "Not available"}</p>
            </div>
            <div className="rounded-[1.75rem] border border-[rgba(114,75,43,0.12)] bg-white/70 p-5">
              <p className="text-sm text-[var(--muted)]">Role</p>
              <p className="mt-2 text-xl font-semibold">{user?.role || "Unknown"}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/products" className="btn-secondary text-center">
              Browse products
            </Link>
            <Link href="/services" className="btn-secondary text-center">
              Browse services
            </Link>
            <Link href="/dashboard/products" className="btn-secondary text-center">
              Seller dashboard
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/profile" className="btn-secondary text-center">
              Manage profile
            </Link>
            <Link href="/become-seller" className="btn-secondary text-center">
              Become a seller
            </Link>
            <Link href="/reports/create" className="btn-secondary text-center">
              Create a report
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/reports/my" className="btn-secondary text-center">
              View my reports
            </Link>
            {user?.role === "ADMIN" ? (
              <Link href="/admin/reports" className="btn-secondary text-center">
                Open moderation dashboard
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-[rgba(114,75,43,0.16)] px-4 py-3 text-center text-sm text-[var(--muted)]">
                Admin tools appear here for moderator accounts.
              </div>
            )}
            {user?.id ? (
              <Link href={`/seller/${user.id}`} className="btn-secondary text-center">
                View seller profile route
              </Link>
            ) : null}
          </div>
        </div>
      </PageCard>
    </ProtectedRoute>
  );
}
