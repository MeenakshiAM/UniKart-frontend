import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-[60vh] items-center justify-center">
          <div className="card-surface rounded-[2rem] px-6 py-5 text-sm text-[var(--muted)]">
            Loading verification...
          </div>
        </section>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
