"use client";

import { useState } from "react";
import Link from "next/link";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { resendVerification } from "@/services/auth.service";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "info", message: "" });

    if (!email.trim()) {
      setStatus({ type: "error", message: "Email is required." });
      return;
    }

    setSubmitting(true);

    try {
      const data = await resendVerification({ email });
      setStatus({
        type: "success",
        message: data?.message || "Verification email sent successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to resend verification email.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageCard
      title="Resend verification email"
      subtitle="Use this when signup succeeded but the verification link did not arrive or expired."
    >
      <div className="space-y-6">
        <StatusMessage type={status.type}>{status.message}</StatusMessage>

        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@example.com"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Sending..." : "Resend Email"}
          </button>
        </form>

        <p className="text-sm text-[var(--muted)]">
          Ready to sign in?{" "}
          <Link href="/login" className="font-semibold text-[var(--brand)]">
            Go to login
          </Link>
        </p>
      </div>
    </PageCard>
  );
}
