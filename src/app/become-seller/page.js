"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { registerSeller } from "@/services/auth.service";
import { getStoredUser } from "@/utils/auth";

const initialForm = {
  shopName: "",
  shopDescription: "",
  agreedToCommission: false,
};

export default function BecomeSellerPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "info", message: "" });

    if (!form.shopName.trim()) {
      setStatus({ type: "error", message: "Shop name is required." });
      return;
    }

    setSubmitting(true);

    try {
      const data = await registerSeller(form);
      setStatus({
        type: "success",
        message:
          data?.seller?.message ||
          data?.message ||
          "Seller request submitted successfully.",
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to submit seller request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isBlockedByRole = user?.role && user.role !== "BUYER";

  return (
    <ProtectedRoute>
      <PageCard
        title="Apply to become a seller"
        subtitle="This form sends `shopName`, `shopDescription`, and `agreedToCommission` exactly as the backend expects."
      >
        <div className="space-y-6">
          <StatusMessage type={status.type}>{status.message}</StatusMessage>

          {isBlockedByRole ? (
            <StatusMessage type="info">
              Your current role is {user.role}. The backend route is restricted to `BUYER`, so this form is disabled.
            </StatusMessage>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Shop Name</span>
              <input
                className="field"
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                placeholder="Your shop name"
                disabled={isBlockedByRole}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Shop Description</span>
              <textarea
                className="field min-h-32"
                name="shopDescription"
                value={form.shopDescription}
                onChange={handleChange}
                placeholder="Tell buyers what you sell"
                disabled={isBlockedByRole}
              />
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-[rgba(114,75,43,0.12)] bg-white/70 p-4">
              <input
                type="checkbox"
                name="agreedToCommission"
                checked={form.agreedToCommission}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded"
                disabled={isBlockedByRole}
              />
              <span className="text-sm text-[var(--muted)]">
                I agree to commission terms. This sends the boolean field `agreedToCommission`.
              </span>
            </label>

            <button type="submit" className="btn-primary" disabled={submitting || isBlockedByRole}>
              {submitting ? "Submitting..." : "Submit Seller Request"}
            </button>
          </form>
        </div>
      </PageCard>
    </ProtectedRoute>
  );
}
