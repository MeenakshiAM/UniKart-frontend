"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthFormShell from "@/components/AuthFormShell";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { loginUser } from "@/services/auth.service";
import { getToken, saveAuthSession } from "@/utils/auth";
import { validateLogin } from "@/utils/validators";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
      return;
    }

    if (searchParams.get("reason") === "session-expired") {
      setStatus({
        type: "error",
        message: "Your session expired or the token was rejected. Please log in again.",
      });
    }
  }, [router, searchParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "info", message: "" });

    const validationMessage = validateLogin(form);
    if (validationMessage) {
      setStatus({ type: "error", message: validationMessage });
      return;
    }

    setSubmitting(true);

    try {
      const data = await loginUser(form);

      if (!data?.token || !data?.user) {
        throw new Error("Login succeeded but the backend returned an incomplete session.");
      }

      saveAuthSession(data.token, data.user);
      const nextPath = searchParams.get("next") || "/dashboard";
      router.replace(nextPath);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Login failed. If the backend crashed on an unknown user, please double-check the email and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageCard
      title="Log in to continue"
      subtitle="Use your Unikart account credentials. The session token is stored in localStorage exactly as requested."
    >
      <AuthFormShell
        footer={
          <p className="text-sm text-[var(--muted)]">
            Need an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--brand)]">
              Create one
            </Link>
          </p>
        }
      >
        <StatusMessage type={status.type}>{status.message}</StatusMessage>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              className="field"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              className="field"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </label>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
          <Link href="/resend-verification" className="font-medium text-[var(--brand)]">
            Resend verification email
          </Link>
          <span>•</span>
          <Link href="/signup" className="font-medium text-[var(--brand)]">
            Go to signup
          </Link>
        </div>
      </AuthFormShell>
    </PageCard>
  );
}
