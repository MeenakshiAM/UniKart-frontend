"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/utils/auth";

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        Loading admin panel...
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="p-10 text-red-600 font-bold">
        Access Denied 🚫 (Admin only)
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-5 space-y-4">
        <h2 className="text-xl font-bold text-orange-500">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-3 text-sm">

  <Link href="/admin/sellers">
    🧑‍💼 Seller Approvals
  </Link>

  <Link href="/admin/products">
    📦 Product Moderation
  </Link>

  {/* 🔥 ADD THIS */}
  <Link href="/admin/services">
    🛠️ Service Moderation
  </Link>

  <Link href="/admin/reports">
    🚨 Reports
  </Link>

</nav>
      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}