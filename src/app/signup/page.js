"use client";

import Link from "next/link";
import { useState } from "react";
import AuthFormShell from "@/components/AuthFormShell";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { registerUser } from "@/services/auth.service";
import { validateSignup } from "@/utils/validators";

const initialForm = {
  name: "",
  email: "",
  password: "",
  registerNumber: "",
  dateOfBirth: "",
  department: "IT",
};

export default function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "info", message: "" });

    const validationMessage = validateSignup(form);
    if (validationMessage) {
      setStatus({ type: "error", message: validationMessage });
      return;
    }

    setSubmitting(true);

    try {
      const data = await registerUser(form);
      setStatus({
        type: "success",
        message:
          data?.message || "Account created. Please check your email and open the verification link.",
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Signup failed. Please review your details and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageCard
      title="Create your Unikart account"
      subtitle="This form mirrors the backend fields exactly, including register number, date of birth, and department."
    >
      <AuthFormShell
        footer={
          <p className="text-sm text-[var(--muted)]">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-[var(--brand)]">
              Login here
            </Link>
          </p>
        }
      >
        <StatusMessage type={status.type}>{status.message}</StatusMessage>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Name</span>
            <input className="field" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input className="field" type="email" name="email" value={form.email} onChange={handleChange} placeholder="student@example.com" />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input className="field" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Register Number</span>
            <input className="field" name="registerNumber" value={form.registerNumber} onChange={handleChange} placeholder="LBT24IT001" />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Date of Birth</span>
            <input className="field" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Department</span>
            <select className="field" name="department" value={form.department} onChange={handleChange}>
              <option value="IT">IT</option>
              <option value="CS">CS</option>
              <option value="EC">EC</option>
              <option value="ER">ER</option>
              <option value="CV">CV</option>
            </select>
          </label>

          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Signup"}
            </button>
          </div>
        </form>
      </AuthFormShell>
    </PageCard>
  );
}
