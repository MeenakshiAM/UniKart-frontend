"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login");
  }, [router]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="card-surface rounded-[2rem] p-8 text-center">
        <p className="text-sm text-[var(--muted)]">Loading Unikart...</p>
      </div>
    </section>
  );
}
