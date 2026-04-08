"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { InputField, SelectField, TextAreaField } from "@/components/FormField";
import {
  createReport,
  REPORT_REASON_OPTIONS,
  REPORT_TARGET_TYPES,
} from "@/services/report.service";

const initialForm = {
  targetType: "PRODUCT",
  targetId: "",
  reason: REPORT_REASON_OPTIONS.PRODUCT[0],
  description: "",
};

export default function CreateReportPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const nextReasons = REPORT_REASON_OPTIONS[form.targetType] || [];

    setForm((current) => ({
      ...current,
      reason: nextReasons.includes(current.reason) ? current.reason : nextReasons[0] || "",
    }));
  }, [form.targetType]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "info", message: "" });

    try {
      const response = await createReport({
        ...form,
        description: form.description.trim() || undefined,
      });

      setStatus({
        type: "success",
        message: response?.message || "Report submitted successfully.",
      });
      setForm({
        ...initialForm,
        targetType: form.targetType,
        reason: REPORT_REASON_OPTIONS[form.targetType][0],
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to submit the report.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reasonOptions = REPORT_REASON_OPTIONS[form.targetType] || [];

  return (
    <ProtectedRoute>
      <PageCard
        title="Create a report"
        subtitle="Flag suspicious listings, abusive reviews, or unsafe users and sellers so the moderation team can investigate quickly."
      >
        <div className="space-y-6">
          <StatusMessage type={status.type}>{status.message}</StatusMessage>

          <div className="rounded-[1.75rem] border border-[rgba(114,75,43,0.12)] bg-white/60 p-5 text-sm text-[var(--muted)]">
            Reports require a valid Mongo-style object id for the target. If you are testing locally, paste the exact item, review, user, or seller id from your backend data.
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                label="Target type"
                htmlFor="targetType"
                name="targetType"
                value={form.targetType}
                onChange={handleChange}
                options={REPORT_TARGET_TYPES}
                required
              />

              <SelectField
                label="Reason"
                htmlFor="reason"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                options={reasonOptions}
                required
              />
            </div>

            <InputField
              label="Target id"
              htmlFor="targetId"
              name="targetId"
              value={form.targetId}
              onChange={handleChange}
              placeholder="Paste the report target object id"
              required
            />

            <TextAreaField
              label="Description"
              htmlFor="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add context for the moderator team. This field is optional."
              maxLength={500}
            />

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit report"}
              </button>
              <Link href="/reports/my" className="btn-secondary">
                View my reports
              </Link>
            </div>
          </form>
        </div>
      </PageCard>
    </ProtectedRoute>
  );
}
