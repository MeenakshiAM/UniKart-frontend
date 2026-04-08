"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, getToken } from "@/utils/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }

    if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
      setErrorMessage("You do not have permission to access this page.");
      setReady(true);
      return;
    }

    setErrorMessage("");
    setReady(true);
  }, [allowedRoles, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="card-surface rounded-[2rem] px-6 py-5 text-sm text-[var(--muted)]">
          Checking your session...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="card-surface max-w-lg rounded-[2rem] px-6 py-6 text-center">
          <p className="text-lg font-semibold text-[var(--text)]">Access restricted</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return children;
}
