"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageCard from "@/components/PageCard";
import StatusMessage from "@/components/StatusMessage";
import { verifyEmailToken } from "@/services/auth.service";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const [state, setState] = useState({ loading: true, type: "info", message: "Verifying your email..." });

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState({
        loading: false,
        type: "error",
        message: "Verification token is missing from the URL.",
      });
      return;
    }

    let isMounted = true;

    const runVerification = async () => {
      try {
        const data = await verifyEmailToken(token);

        if (isMounted) {
          setState({
            loading: false,
            type: "success",
            message: data?.message || "Email verified successfully. You can log in now.",
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            loading: false,
            type: "error",
            message: error.message || "Email verification failed.",
          });
        }
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  return (
    <PageCard
      title="Email verification"
      subtitle="This page reads the `token` query parameter and calls the backend verification endpoint directly."
    >
      <div className="space-y-6">
        <StatusMessage type={state.type}>{state.message}</StatusMessage>
        <div className="flex flex-wrap gap-3">
          {!state.loading ? (
            <Link href="/login" className="btn-primary">
              Go to login
            </Link>
          ) : null}
          <Link href="/resend-verification" className="btn-secondary">
            Resend verification email
          </Link>
        </div>
      </div>
    </PageCard>
  );
}
