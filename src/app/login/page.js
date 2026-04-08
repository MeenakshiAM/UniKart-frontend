import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-[60vh] items-center justify-center">
          <div className="card-surface rounded-[2rem] px-6 py-5 text-sm text-[var(--muted)]">
            Loading login...
          </div>
        </section>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
