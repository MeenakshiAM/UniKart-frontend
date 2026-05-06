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

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState({
    type: "info",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = getToken();

    if (token) {
      router.replace("/dashboard");
      return;
    }

    if (searchParams.get("reason") === "session-expired") {
      setStatus({
        type: "error",
        message: "Session expired. Please log in again.",
      });
    }
  }, [router, searchParams]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({ type: "info", message: "" });

    // 🔍 Validation
    const validationError = validateLogin(form);
    if (validationError) {
      setStatus({
        type: "error",
        message: validationError,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(form);

      const token = res?.token;
      const user = res?.user;

      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      // 💾 Save session
      saveAuthSession(token, user);

      // 🔁 Redirect
      const next = searchParams.get("next") || "/dashboard";
      router.replace(next);

    } catch (err) {
      console.error("Login error:", err);

      setStatus({
        type: "error",
        message:
          err?.response?.data?.message || // backend error
          err.message || 
          "Login failed. Please try again.",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <PageCard
      title="Login to UniKart"
      subtitle="Access your account securely"
    >
      <AuthFormShell
        footer={
          <p className="text-sm text-[var(--muted)]">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--brand)]">
              Sign up
            </Link>
          </p>
        }
      >
        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* EMAIL */}
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="field"
              placeholder="you@example.com"
              required
            />
          </label>

          {/* PASSWORD */}
          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="field"
              placeholder="Enter password"
              required
            />
          </label>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* EXTRA LINKS */}
        <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)] mt-3">
          <Link href="/resend-verification" className="text-[var(--brand)] font-medium">
            Resend verification
          </Link>

          <span>•</span>

          <Link href="/signup" className="text-[var(--brand)] font-medium">
            Create account
          </Link>
        </div>
      </AuthFormShell>
    </PageCard>
  );
}